const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {render}=require('../assets/seo-renderer.js');
const context={window:{}};vm.runInNewContext(fs.readFileSync('assets/text-defaults.js','utf8'),context);
const defaults=context.window.siteTextDefaults;
const template=fs.readFileSync('assets/page-template.html','utf8');
const data=JSON.parse(fs.readFileSync('content/site.json','utf8'));
for(const lang of ['fr','nl']){
  const banner=lang==='nl'?'Opening 03/10 16:00':'Vernissage 03/10 16:00';
  const hiddenMessage=render(template,{...data,temporaryMessageVisible:false},defaults,lang);
  assert.ok(hiddenMessage.includes('<p class="temporary-message" data-field="temporaryMessage" hidden>'+banner+'</p>'));
  const html=render(template,data,defaults,lang),visible=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
  assert.ok(html.includes(`<html lang="${lang}"`));
  assert.ok(html.includes(`<link rel="canonical" href="https://boucheedart.be/${lang==='nl'?'nl/':''}">`));
  assert.ok(html.includes('hreflang="fr"'));assert.ok(html.includes('hreflang="nl"'));
  assert.ok(html.includes('<details class="gallery-about" id="gallery-about">'));
  assert.ok(html.includes(lang==='nl'?'Over het kunstcentrum':'À propos du centre'));
  assert.ok(html.includes('<p class="temporary-message" data-field="temporaryMessage">'+banner+'</p>'));
  assert.ok(visible.includes(lang==='nl'?'02 — 05 oktober 2026':'02 — 05 octobre 2026'));
  assert.ok(html.includes('class="visit-logo"'));
  assert.match(html, /<a class="brand"[^>]*href="#accueil"[^>]*><img src="(?:\.\.\/)?assets\/logo-bouchee-art-160\.webp"/);
  assert.match(html, /<header class="site-header">\s*<p class="temporary-message"/);
  assert.ok(visible.includes(lang==='nl'?'Kunstcentrum in Oostende':'Centre d’art à Ostende'));
  assert.ok(visible.includes('Sint Fransiscusstraat 4'));assert.ok(visible.includes('André LAURENT'));
  assert.ok(!visible.includes('rue des Tanneurs'));assert.ok(!visible.includes('Terrain sensible'));
  const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(schema.name,data.galleryName);assert.equal(schema['@type'],'WebSite');assert.ok(!schema.address);
  for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
    const value=match[1];if(value.startsWith('#')||/^(https?:|mailto:|tel:)/.test(value))continue;
    const path=require('node:path').resolve(lang==='nl'?'nl':'.',value.split('?')[0]);assert.ok(fs.existsSync(path),`Missing asset ${path}`);
  }
}
const malicious={...data,galleryName:'<script>alert("bad")</script>',galleryIntro:'<img src=x onerror=alert(1)>',nl:{...data.nl,galleryName:'Other name'}};
const escaped=render(template,malicious,defaults,'nl');
const injected=render(template.replace('</head>','<script src="//local.adguard.org/injected"></script><script>unwanted()</script></head>'),data,defaults,'fr');
assert.ok(!injected.includes('local.adguard.org'));assert.ok(!injected.includes('unwanted()'));assert.ok(injected.includes('assets/site.js?v='));
assert.ok(!escaped.includes('<script>alert('));assert.ok(escaped.includes('&lt;script&gt;'));
const blank=render(template,{...data,discover:'',images:[{...data.images[0],caption:'FR caption',captionNl:''}]},defaults,'nl');
assert.ok(!blank.includes('<figcaption>FR caption</figcaption>'));
const paused=render(template,{...data,sitePaused:true},defaults,'fr');assert.ok(paused.includes('class="site-paused"'));assert.ok(!paused.includes('id="exposition"'));
assert.ok(render(template,{...data,galleryIntro:''},defaults,'fr').includes('id="gallery-about" hidden'));
for(const lang of ['fr','nl']){
  const withoutMessage={...data,temporaryMessage:'',nl:{...data.nl,temporaryMessage:''}};
  assert.ok(render(template,withoutMessage,defaults,lang).includes('<p class="temporary-message" data-field="temporaryMessage" hidden></p>'));
}
(async()=>{
  const calls=[];
  const source=fs.readFileSync('admin/admin.js','utf8');
  const functionSource=source.slice(source.indexOf('async function publishSnapshot(){'),source.indexOf('document.querySelector("#publish-button")'));
  const sandbox={state:{owner:'owner',repo:'repo',content:data},DRAFT:'content/draft.json',PUBLISHED:'content/site.json',BRANCH:'main',window:{siteSeoRenderer:{render},siteTextDefaults:defaults},fetch:async()=>({ok:true,text:async()=>template}),github:async(path,options={})=>{
    calls.push({path,options});
    if(path.endsWith('/ref/heads/main'))return{object:{sha:'parent'}};
    if(path.endsWith('/commits/parent'))return{tree:{sha:'existing-tree'}};
    if(path.endsWith('/trees'))return{sha:'new-tree'};
    if(path.endsWith('/commits'))return{sha:'new-commit'};
    return{};
  }};
  vm.createContext(sandbox);vm.runInContext(functionSource,sandbox);await vm.runInContext('publishSnapshot()',sandbox);
  const tree=JSON.parse(calls.find(c=>c.path.endsWith('/trees')).options.body);
  assert.equal(tree.base_tree,'existing-tree');assert.deepEqual(tree.tree.map(f=>f.path),['content/draft.json','content/site.json','index.html','nl/index.html']);
  const ref=JSON.parse(calls.at(-1).options.body);assert.equal(ref.force,false);assert.equal(ref.sha,'new-commit');
  sandbox.github=async(path,options={})=>{if(options.method==='PATCH'){const e=new Error('Conflict');e.status=422;throw e;}if(path.endsWith('/ref/heads/main'))return{object:{sha:'parent'}};if(path.endsWith('/commits/parent'))return{tree:{sha:'existing-tree'}};return{sha:'new-tree'};};
  await assert.rejects(vm.runInContext('publishSnapshot()',sandbox),/Aucune publication/);
  console.log('SEO verified: both languages, static content, assets, metadata, schema, escaping, paused page, atomic CMS publication and conflict handling.');
})().catch(error=>{console.error(error);process.exitCode=1;});
