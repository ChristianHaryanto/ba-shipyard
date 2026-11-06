#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {chromium} from '@playwright/test';
const root=path.resolve('chari-refactor');
const pages=(function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.relative(root,path.join(d,e.name)).replaceAll(path.sep,'/')])})(root).filter(p=>p.endsWith('.html'));
const sizes=[[1440,900],[1280,800],[768,1024],[390,844],[375,667]];
const out='qa-artifacts';fs.mkdirSync(out,{recursive:true});
const server=spawn('python3',['-m','http.server','4173','--directory',root],{stdio:'ignore'});
let browser;
const results=[];
try{
 await new Promise(r=>setTimeout(r,1500));
 browser=await chromium.launch({headless:true});
 for(const [width,height] of sizes){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  for(const file of pages){
   const page=await context.newPage();const issues=[];
   page.on('pageerror',e=>issues.push('JS: '+e.message));
   page.on('console',m=>{if(m.type()==='error')issues.push('console: '+m.text())});
   page.on('requestfailed',r=>issues.push('request: '+r.url()));
   const url='http://127.0.0.1:4173/'+file;
   try{
    const response=await page.goto(url,{waitUntil:'networkidle',timeout:20000});
    if(!response?.ok())issues.push('HTTP '+response?.status());
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);
    if(overflow)issues.push('horizontal overflow');
    const missing=await page.locator('img').evaluateAll(nodes=>nodes.filter(x=>!x.complete||x.naturalWidth===0).map(x=>x.getAttribute('src')));
    if(missing.length)issues.push('broken images: '+missing.join(', '));
    const dest=path.join(out,String(width)+'x'+height,file.replaceAll('/','__')+'.png');
    fs.mkdirSync(path.dirname(dest),{recursive:true});
    await page.screenshot({path:dest,fullPage:true,animations:'disabled'});
   }catch(e){issues.push('navigation: '+e.message)}
   results.push({file,viewport:width+'x'+height,status:issues.length?'FAIL':'PASS',issues});
   await page.close();
  }
  await context.close();
 }
}finally{await browser?.close();server.kill('SIGTERM');fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2))}
const failures=results.filter(r=>r.status==='FAIL');console.log(JSON.stringify({routes:pages.length,viewports:sizes.length,cases:results.length,failed:failures.length,examples:failures.slice(0,20)},null,2));if(failures.length)process.exitCode=1;
