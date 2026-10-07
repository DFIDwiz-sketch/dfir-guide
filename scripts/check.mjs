import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist'), files=fs.readdirSync(root).filter(x=>x.endsWith('.html'));
const fail=[],ids=new Map();
for(const file of files){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 const list=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 ids.set(file,new Set(list));
 if(list.length!==new Set(list).size)fail.push(`${file}: duplicate IDs`);
 if(!html.includes('<html lang="ko">'))fail.push(`${file}: missing Korean language`);
 if((html.match(/<h1(?:\s|>)/g)||[]).length!==1)fail.push(`${file}: expected one h1`);
 if(!html.includes('name="description"'))fail.push(`${file}: missing description`);
 if(/퀴즈|채점|정답|Q25|Q34/.test(html))fail.push(`${file}: unwanted question references`);
}
for(const file of files){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 for(const [,value] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  if(/^(?:https?:|mailto:|data:)/.test(value))continue;
  const [pathname,hash]=value.split('#');
  const dest=pathname?path.normalize(path.join(path.dirname(file),pathname)):file;
  if(pathname&&!fs.existsSync(path.join(root,dest)))fail.push(`${file}: missing ${value}`);
  if(hash&&ids.has(dest)&&!ids.get(dest).has(decodeURIComponent(hash)))fail.push(`${file}: missing anchor ${value}`);
 }
}
const index=JSON.parse(fs.readFileSync(path.join(root,'assets/search-index.json'),'utf8'));
for(const a of index){if(!fs.existsSync(path.join(root,a.url)))fail.push(`Search links to missing ${a.url}`);if(!a.text.trim())fail.push(`Empty searchable text ${a.url}`);}
const ntlm=fs.readFileSync(path.join(root,'ntlm.html'),'utf8');
if((ntlm.match(/id="ref-\d+"/g)||[]).length!==27)fail.push('NTLM needs 27 linked references');
if((ntlm.match(/<table>/g)||[]).length!==11)fail.push('NTLM needs all 11 source tables');
if(fail.length){console.error(fail.join('\n'));process.exit(1);}
console.log(`Passed: ${files.length} pages, ${index.length} searchable articles, local links, anchors, metadata, and NTLM source completeness.`);
