const fallback = { galleryName:"Bouchée d’Art", heroEyebrow:"Galerie indépendante", galleryIntro:"Un lieu consacré aux artistes aux regards singuliers.", exhibitionEyebrow:"En ce moment", exhibitionTitle:"Terrain sensible", exhibitionDates:"", exhibitionText:"", exhibitionExtra:"", artists:"", manager:"", address:"", hours:"", email:"", phone:"", additionalInfo:"", pausedMessage:"Pas d’expositions en ce moment. À bientôt.", heroImage:"assets/gallery-hero.webp", images:[], nl:{} };
const labels = window.siteTextDefaults;
let siteData=fallback;
let currentLang=localStorage.getItem("bouchee-lang")||"fr";
const safeLines=value=>String(value??"").split("\n").map(line=>{const span=document.createElement("span");span.textContent=line;return span.outerHTML;}).join("<br>");

function render(data,lang=currentLang){
  currentLang=lang;localStorage.setItem("bouchee-lang",lang);document.documentElement.lang=lang;
  const content={...fallback,...data,...labels[lang],...(lang==="nl"?(data.nl||{}):data)};document.title=[content.galleryName,content.pageTitleSuffix].filter(Boolean).join(" — ");
  document.querySelector('meta[name="description"]').content=content.metaDescription;
  if(content.sitePaused){document.body.replaceChildren();document.body.className="site-paused";const main=document.createElement("main");main.className="paused-page";const message=document.createElement("p");message.textContent=content.pausedMessage||fallback.pausedMessage;main.append(message);document.body.append(main);return;}
  document.querySelectorAll("[data-field]").forEach(el=>{const value=content[el.dataset.field];if(value!==undefined){el.innerHTML=safeLines(value);el.hidden=!String(value).trim();}});
  document.querySelector(".text-link").hidden=!String(content.discover).trim();
  document.querySelectorAll("[data-aria-field]").forEach(el=>el.setAttribute("aria-label",content[el.dataset.ariaField]));
  document.querySelectorAll("[data-lang]").forEach(button=>button.classList.toggle("active",button.dataset.lang===lang));
  document.querySelector("#hero-image").src=content.heroImage||fallback.heroImage;
  document.querySelector("#hero-image").alt=content.heroAlt;
  document.querySelector("#contact-break").hidden=!content.email||!content.phone;
  document.querySelector("#email-link").href=`mailto:${content.email}`;document.querySelector("#phone-link").href=`tel:${String(content.phone).replace(/[^+\d]/g,"")}`;
  const grid=document.querySelector("#art-grid");grid.replaceChildren();
  (data.images||[]).forEach((image,index)=>{const figure=document.createElement("figure");figure.className="art-card reveal";const img=document.createElement("img");img.src=image.src;img.alt=(lang==="nl"?(image.altNl??image.alt):image.alt)||`${content.workLabel} ${index+1}`;img.loading=index>1?"lazy":"eager";figure.append(img);const caption=lang==="nl"?(image.captionNl??image.caption):image.caption;if(caption){const figcaption=document.createElement("figcaption");figcaption.textContent=caption;figure.append(figcaption);}grid.append(figure);});
  observeReveals();
}
function observeReveals(){const items=document.querySelectorAll(".reveal:not(.visible)");if(matchMedia("(prefers-reduced-motion: reduce)").matches)return items.forEach(el=>el.classList.add("visible"));const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target);}}),{threshold:.12});items.forEach(item=>observer.observe(item));}
const params=new URLSearchParams(location.search);const preview=params.get("preview");if(preview)currentLang=preview;
const localPreview=preview&&localStorage.getItem("bouchee-preview");
if(localPreview){try{siteData=JSON.parse(localPreview);render(siteData,currentLang);}catch{render(fallback,currentLang);}}
else fetch(preview?"content/draft.json":"content/site.json",{cache:"no-store"}).then(r=>r.ok?r.json():fallback).then(data=>{siteData=data;render(data,currentLang);}).catch(()=>render(fallback,currentLang));
document.querySelectorAll("[data-lang]").forEach(button=>button.addEventListener("click",()=>render(siteData,button.dataset.lang)));
document.querySelector("#year").textContent=new Date().getFullYear();const menuButton=document.querySelector(".menu-toggle");const nav=document.querySelector("#main-nav");menuButton.addEventListener("click",()=>{const open=nav.classList.toggle("open");menuButton.setAttribute("aria-expanded",String(open));});nav.addEventListener("click",()=>{nav.classList.remove("open");menuButton.setAttribute("aria-expanded","false");});
