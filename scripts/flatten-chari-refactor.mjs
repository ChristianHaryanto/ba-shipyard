#!/usr/bin/env node
// Run from repository root: node scripts/flatten-chari-refactor.mjs [--apply]
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('chari-refactor');
if(!fs.existsSync(root))throw Error('chari-refactor not found; run from repository root');
const apply=process.argv.includes('--apply');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const files=walk(root).map(p=>path.relative(root,p).split(path.sep).join('/'));
const html=files.filter(p=>p.endsWith('.html'));
const images=files.filter(p=>p.startsWith('assets/images/')&&/\.(png|jpe?g|webp|gif|svg|avif|ico)$/i.test(p));
const move=new Map();
for(const p of html)move.set(p,p==='index.html'?p:p.endsWith('/index.html')?p.slice(0,-11)+'.html':p);
for(const p of images)move.set(p,'assets/images/'+path.posix.basename(p));
const reverse=new Map();for(const [a,b]of move){if(reverse.has(b)&&reverse.get(b)!==a)throw Error('Collision: '+b);reverse.set(b,a)}
const known=new Set(files),errors=[];
function rewriteURL(file,url){
 if(!url||/^(?:[a-z][\w+.-]*:|\/\/|#|data:)/i.test(url))return url;
 const m=url.match(/^([^?#]*)([?#].*)?$/);if(!m||!m[1])return url;
 const old=m[1],target=path.posix.normalize(old.startsWith('/')?old.slice(1):path.posix.join(path.posix.dirname(file),old));
 const candidates=[target,target+'/index.html',target+'.html'];
 const found=candidates.find(p=>known.has(p));
 if(!found){if(!target.startsWith('../'))errors.push(file+' -> '+url);return url}
 const next=move.get(found)||found,from=move.get(file)||file;
 let relative=path.posix.relative(path.posix.dirname(from),next);
 if(!relative)relative='./';else if(!relative.startsWith('.'))relative='./'+relative;
 return relative+(m[2]||'');
}
function rewrite(file,text){
 text=text.replace(/\bsrcset=(['"])(.*?)\1/gi,(m,q,v)=>'srcset='+q+v.split(',').map(x=>x.replace(/^(\s*)(\S+)/,(m,sp,u)=>sp+rewriteURL(file,u))).join(',')+q);
 text=text.replace(/\b(href|src|poster|action|data-src|data-href)=(['"])(.*?)\2/gi,(m,k,q,v)=>k+'='+q+rewriteURL(file,v)+q);
 text=text.replace(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/gi,(m,q,v)=>'url('+q+rewriteURL(file,v)+q+')');
 return text;
}
const staged=new Map();
for(const file of files)if(/\.(html|css|js|json|svg)$/i.test(file))staged.set(move.get(file)||file,rewrite(file,fs.readFileSync(path.join(root,file),'utf8')));
console.log(JSON.stringify({mode:apply?'apply':'dry-run',html:html.length,images:images.length,movedHtml:html.filter(p=>move.get(p)!==p).length,unresolved:errors.length,samples:errors.slice(0,15)},null,2));
if(errors.length)throw Error('Unresolved local references: no files modified');
if(!apply){console.log('Dry-run complete. Pass --apply to modify files.');process.exit(0)}
for(const [file,data]of staged){const dest=path.join(root,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,data)}
for(const file of images){const dest=move.get(file);if(dest===file)continue;fs.copyFileSync(path.join(root,file),path.join(root,dest))}
for(const [old,next]of move)if(old!==next)fs.unlinkSync(path.join(root,old));
for(const dir of [...new Set([...move.keys()].map(p=>path.dirname(path.join(root,p))))].sort((a,b)=>b.length-a.length)){try{fs.rmdirSync(dir)}catch{}}
console.log('Files flattened. Run link validation and visual QA before committing.');
