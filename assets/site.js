const fallback = { galleryName:"Bouchée d’Art", heroEyebrow:"Galerie indépendante", galleryIntro:"Un lieu consacré aux artistes aux regards singuliers.", exhibitionEyebrow:"En ce moment", exhibitionTitle:"Terrain sensible", exhibitionDates:"", exhibitionText:"", exhibitionExtra:"", artists:"", manager:"", peopleTitle:"Artistes & galerie", visitTitle:"La galerie", address:"", hours:"", email:"", phone:"", additionalInfo:"", pausedMessage:"Pas d’expositions en ce moment. À bientôt.", heroImage:"assets/gallery-hero.png", images:[], nl:{} };
const labels = {
  fr:{navExhibition:"Exposition",navArtists:"Artistes",navVisit:"Visiter",discover:"Découvrir l’exposition",peopleEyebrow:"Les personnes",artistsLabel:"Artistes exposés",managerLabel:"Responsable",visitEyebrow:"Nous rendre visite",addressLabel:"Adresse",hoursLabel:"Horaires",contactLabel:"Contact"},
  nl:{navExhibition:"Tentoonstelling",navArtists:"Kunstenaars",navVisit:"Bezoeken",discover:"Ontdek de tentoonstelling",peopleEyebrow:"De mensen",artistsLabel:"Kunstenaars",managerLabel:"Verantwoordelijke",visitEyebrow:"Bezoek ons",addressLabel:"Adres",hoursLabel:"Openingsuren",contactLabel:"Contact"}
};
let siteData=fallback;
let currentLang=localStorage.getItem("bouchee-lang")||"fr";
const safeLines=value=>String(value??"").split("\n").map(line=>{const span=document.createElement("span");span.textContent=line;return span.outerHTML;}).join("<br>");
const localized=(data,lang)=>lang==="nl"?{...data,...(data.nl||{})}:data;

function render(data,lang=currentLang){
  currentLang=lang;localStorage.setItem("bouchee-lang",lang);document.documentElement.lang=lang;
  const content={...fallback,...localized(data,lang)};document.title=`${content.galleryName} — Galerie`;
  if(content.sitePaused){document.body.replaceChildren();document.body.className="site-paused";const main=document.createElement("main");main.className="paused-page";const message=document.createElement("p");message.textContent=content.pausedMessage||fallback.pausedMessage;main.append(message);document.body.append(main);return;}
  document.querySelectorAll("[data-field]").forEach(el=>{const value=content[el.dataset.field];if(value!==undefined)el.innerHTML=safeLines(value);});
  document.querySelectorAll("[data-i18n]").forEach(el=>{el.textContent=labels[lang][el.dataset.i18n]||el.textContent;});
  document.querySelectorAll("[data-lang]").forEach(button=>button.classList.toggle("active",button.dataset.lang===lang));
  document.querySelector("#hero-image").src=content.heroImage||fallback.heroImage;
  document.querySelector("#email-link").href=`mailto:${content.email}`;document.querySelector("#phone-link").href=`tel:${String(content.phone).replace(/[^+\d]/g,"")}`;
  const grid=document.querySelector("#art-grid");grid.replaceChildren();
  (data.images||[]).forEach((image,index)=>{const figure=document.createElement("figure");figure.className="art-card reveal";const img=document.createElement("img");img.src=image.src;img.alt=image.alt||`Œuvre ${index+1}`;img.loading=index>1?"lazy":"eager";figure.append(img);const caption=lang==="nl"?(image.captionNl||image.caption):image.caption;if(caption){const figcaption=document.createElement("figcaption");figcaption.textContent=caption;figure.append(figcaption);}grid.append(figure);});
  observeReveals();
}
function observeReveals(){const items=document.querySelectorAll(".reveal:not(.visible)");if(matchMedia("(prefers-reduced-motion: reduce)").matches)return items.forEach(el=>el.classList.add("visible"));const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target);}}),{threshold:.12});items.forEach(item=>observer.observe(item));}
const params=new URLSearchParams(location.search);const preview=params.get("preview");if(preview)currentLang=preview;
const localPreview=preview&&localStorage.getItem("bouchee-preview");
if(localPreview){try{siteData=JSON.parse(localPreview);render(siteData,currentLang);}catch{render(fallback,currentLang);}}
else fetch(preview?"content/draft.json":"content/site.json",{cache:"no-store"}).then(r=>r.ok?r.json():fallback).then(data=>{siteData=data;render(data,currentLang);}).catch(()=>render(fallback,currentLang));
document.querySelectorAll("[data-lang]").forEach(button=>button.addEventListener("click",()=>render(siteData,button.dataset.lang)));
document.querySelector("#year").textContent=new Date().getFullYear();const menuButton=document.querySelector(".menu-toggle");const nav=document.querySelector("#main-nav");menuButton.addEventListener("click",()=>{const open=nav.classList.toggle("open");menuButton.setAttribute("aria-expanded",String(open));});nav.addEventListener("click",()=>{nav.classList.remove("open");menuButton.setAttribute("aria-expanded","false");});
