const fs=require('fs'),assert=require('assert/strict'),vm=require('vm');
const source=fs.readFileSync('admin/admin.js','utf8'),html=fs.readFileSync('admin/index.html','utf8');
const context={};vm.runInNewContext(source.slice(source.indexOf('const textGroups = ['),source.indexOf('for(const [section,fields]')),context);const groups=vm.runInNewContext('textGroups',context);
assert.deepEqual(Array.from(groups,g=>g[0]),['banner','navigation','home','exhibition','people','visit','advanced','pause']);
const names=[...html.matchAll(/<(?:input|textarea)[^>]*name="([^"]+)"/g)].map(m=>m[1]).filter(n=>!['owner','repo','token'].includes(n));
for(const [section,fields] of groups){assert.ok(html.includes('data-fields-for="'+section+'"'));for(const [key] of fields){names.push(key,'nl.'+key);}}
const publicFields=[...fs.readFileSync('assets/page-template.html','utf8').matchAll(/data-(?:aria-)?field="([^"]+)"/g)].map(m=>m[1]);
for(const key of [...publicFields,'heroAlt','workLabel','metaDescription','pageTitleSuffix']){assert.ok(names.includes(key),'CMS field missing: '+key);if(key!=='galleryName'&&!['email','phone'].includes(key))assert.ok(names.includes('nl.'+key),'NL field missing: '+key);}
for(const name of names){assert.equal(names.filter(n=>n===name).length,name==='temporaryMessageVisible'?2:1,'Duplicate field: '+name);}
const fields=[{name:'temporaryMessageVisible',type:'radio',value:'true',checked:false},{name:'temporaryMessageVisible',type:'radio',value:'false',checked:true},{name:'temporaryMessage',type:'text',value:'Vernissage 03/10 16:00'},{name:'galleryName',type:'text',value:'Bouchée d’Art'},{name:'sitePaused',type:'checkbox',checked:false}];
const sandbox={state:{content:{nl:{}}},contentForm:{querySelectorAll:()=>fields},renderHeroPreview(){},renderImages(){}};vm.createContext(sandbox);
vm.runInContext(source.slice(source.indexOf('function getValue('),source.indexOf('async function loadContent(')),sandbox);
vm.runInContext('collectForm()',sandbox);assert.equal(sandbox.state.content.temporaryMessageVisible,false);assert.equal(sandbox.state.content.temporaryMessage,'Vernissage 03/10 16:00');assert.equal(sandbox.state.content.nl.galleryName,'Bouchée d’Art');
vm.runInContext('fillForm()',sandbox);assert.equal(fields[0].checked,false);assert.equal(fields[1].checked,true);
fields[0].checked=true;fields[1].checked=false;vm.runInContext('collectForm()',sandbox);assert.equal(sandbox.state.content.temporaryMessageVisible,true);
delete sandbox.state.content.temporaryMessageVisible;vm.runInContext('fillForm()',sandbox);assert.equal(fields[0].checked,true);assert.equal(fields[1].checked,false);
console.log('CMS verified: section order, complete bilingual field coverage, no duplicate text fields, boolean radios, text preservation and compatibility with existing drafts.');
