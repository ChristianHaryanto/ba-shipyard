#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve('chari-refactor');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const files=walk(root).map(p=>path.relative(root,p).replaceAll(path.sep,'/'));
const existing=new Set(files), html=files.filter(p=>p.endsWith('.html'));
const errors=[],counts={html:html.length,ids:0,interactionAliases:0,webflowAttributes:0,webflowClasses:0,localLinks:0,missingAssets:0};
const fail=(file,reason)=>errors.push(file+': '+reason);
const normalize=(from,u)=>path.posix.normalize(u.startsWith('/')?u.slice(1):path.posix.join(path.posix.dirname(from),u));
function check(file,u){
 u=u.trim().replaceAll('&quot;','');
 if(!u||/^(?:[a-z][\w+.-]*:|\/\/|#|data:|javascript:)/i.test(u))return;
 const base=u.split(/[?#]/)[0];if(!base)return;
 counts.localLinks++;
 const dest=normalize(file,base);
 if(!existing.has(dest)&&!existing.has(dest+'/index.html')){counts.missingAssets++;fail(file,'missing local reference '+u)}
}
for(const file of html){
 const s=fs.readFileSync(path.join(root,file),'utf8');
 const ids=[...s.matchAll(/\sid=(["'])(.*?)\1/g)].map(m=>m[2]);
 counts.ids+=ids.length;counts.interactionAliases+=(s.match(/data-chari-interaction-id=/g)||[]).length;
 for(const id of new Set(ids))if(ids.filter(x=>x===id).length>1)fail(file,'duplicate id '+id);
 const oldAttrs=s.match(/\sdata-w-id\s*=/g)||[];counts.webflowAttributes+=oldAttrs.length;
 if(oldAttrs.length)fail(file,'obsolete data-w-id');
 for(const m of s.matchAll(/\bclass=(["'])(.*?)\1/g))for(const c of m[2].split(/\s+/))if(/^w(?:--|-)/.test(c)){counts.webflowClasses++;fail(file,'obsolete class '+c)}
 for(const m of s.matchAll(/\b(?:href|src|poster|action|data-src|data-href|data-poster)\s*=\s*(["'])(.*?)\1/gi))check(file,m[2]);
 for(const m of s.matchAll(/\b(?:srcset|imagesrcset|data-srcset)\s*=\s*(["'])(.*?)\1/gi))for(const v of m[2].split(','))check(file,v.trim().split(/\s+/)[0]);
 for(const m of s.matchAll(/url\(\s*(?:&quot;|["']?)([^)'"]+?)(?:&quot;|["']?)\s*\)/gi))check(file,m[1]);
 for(const m of s.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi))if(/\.w(?:--|-)[\w-]+|\[data-w-id/.test(m[1]))fail(file,'obsolete inline style selector');
}
for(const file of files.filter(p=>/\.(css|js)$/i.test(p))){
 const s=fs.readFileSync(path.join(root,file),'utf8');
 if(/\.w(?:--|-)[\w-]+|\[data-w-id/.test(s))fail(file,'obsolete runtime selector');
 if(file.endsWith('.css'))for(const m of s.matchAll(/url\(\s*(["']?)([^)'"]+)\1\s*\)/gi))check(file,m[2]);
 if(file.endsWith('.js'))try{execFileSync('node',['--check',path.join(root,file)],{stdio:'pipe'})}catch(e){fail(file,'JavaScript syntax error '+String(e.stderr||e.message).slice(0,300))}
}
const cssSource=fs.readFileSync(path.join(root,'assets/css/style.css'),'utf8');
const iconClasses=new Set();
for(const file of html){const source=fs.readFileSync(path.join(root,file),'utf8');for(const m of source.matchAll(/\bclass=(["'])(.*?)\1/g))for(const cls of m[2].split(/\s+/))if(cls.startsWith('chari-icon-'))iconClasses.add(cls)}
for(const cls of iconClasses){if(!cssSource.includes('.'+cls+':before')&&!cssSource.includes('.'+cls+'::before'))fail('icons','missing glyph selector for '+cls)}
if(iconClasses.size&&(!cssSource.includes('[class^="chari-icon-"]')||!cssSource.includes('[class*=" chari-icon-"]')))fail('icons','missing shared native icon font selectors');
if(cssSource.includes('[class^="w-icon-"]')||cssSource.includes('[class*=" w-icon-"]'))fail('icons','obsolete Webflow icon font selectors');
counts.iconClasses=iconClasses.size;
const imageFiles=files.filter(p=>p.startsWith('assets/images/'));
for(const f of imageFiles)if(f.slice('assets/images/'.length).includes('/'))fail(f,'nested image directory');
if(html.length!==63)fail('pages','expected 63 HTML pages, got '+html.length);
console.log(JSON.stringify({status:errors.length?'FAIL':'PASS',counts,errors:errors.slice(0,100)},null,2));
if(errors.length)process.exitCode=1;
