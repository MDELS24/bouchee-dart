const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {render}=require('../assets/seo-renderer.js');
const root=path.resolve(__dirname,'..');
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'assets/text-defaults.js'),'utf8'),context);
const data=JSON.parse(fs.readFileSync(path.join(root,'content/site.json'),'utf8'));
const template=fs.readFileSync(path.join(root,'assets/page-template.html'),'utf8');
fs.mkdirSync(path.join(root,'nl'),{recursive:true});
for(const lang of ['fr','nl'])fs.writeFileSync(path.join(root,lang==='fr'?'index.html':'nl/index.html'),render(template,data,context.window.siteTextDefaults,lang));
console.log('Pages françaises et néerlandaises générées à partir des contenus publiés.');
