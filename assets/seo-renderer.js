(function(root){
  const origin="https://boucheedart.be";
  const escape=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const json=value=>JSON.stringify(value).replace(/</g,"\\u003c");
  const localize=(data,defaults,lang)=>({...data,...defaults[lang],...(lang==="nl"?data.nl||{}:data),galleryName:data.galleryName});
  function render(template,data,defaults,lang){
    const content=localize(data,defaults,lang),prefix=lang==="nl"?"../":"",url=origin+(lang==="nl"?"/nl/":"/");
    let html=template.replace(/<html lang="[^"]*"/,`<html lang="${lang}"`);
    html=html.replace(/<([a-z][\w-]*)\b([^>]*\bdata-field="([^"]+)"[^>]*)>[\s\S]*?<\/\1>/gi,(_,tag,attrs,key)=>{
      const value=content[key]??"";
      attrs=attrs.replace(/\s+hidden\b/g,"");
      return `<${tag}${attrs}${String(value).trim()?"":" hidden"}>${escape(value).replace(/\n/g,"<br>")}</${tag}>`;
    });
    html=html.replace(/(<[^>]*\bdata-aria-field="([^"]+)"[^>]*>)/g,(tag,_,key)=>tag.replace(/aria-label="[^"]*"/,`aria-label="${escape(content[key])}"`));
    html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>${escape([content.galleryName,content.pageTitleSuffix].filter(Boolean).join(" — "))}</title>`);
    html=html.replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${escape(content.metaDescription)}">`);
    html=html.replace(/(<img id="hero-image"[^>]*\bsrc=")[^"]*/,'$1'+escape(content.heroImage));
    html=html.replace(/(<img id="hero-image"[^>]*\balt=")[^"]*/,'$1'+escape(content.heroAlt));
    html=html.replace(/(<a id="email-link"[^>]*\bhref=")[^"]*/,'$1mailto:'+escape(content.email));
    html=html.replace(/(<a id="phone-link"[^>]*\bhref=")[^"]*/,'$1tel:'+escape(String(content.phone||"").replace(/[^+\d]/g,"")));
    html=html.replace('<br id="contact-break">',`<br id="contact-break"${content.email&&content.phone?"":" hidden"}>`);
    html=html.replace('<a class="text-link"',`<a class="text-link"${String(content.discover||"").trim()?"":" hidden"}`);
    html=html.replace('id="gallery-about"',`id="gallery-about"${String(content.galleryIntro||"").trim()&&String(content.aboutLabel||"").trim()?"":" hidden"}`);
    const images=(data.images||[]).map((image,index)=>{
      const caption=lang==="nl"?(image.captionNl??image.caption):image.caption;
      const alt=(lang==="nl"?(image.altNl??image.alt):image.alt)||`${content.workLabel} ${index+1}`;
      return `<figure class="art-card reveal"><img src="${escape(image.src)}" alt="${escape(alt)}" loading="lazy" decoding="async">${caption?`<figcaption>${escape(caption)}</figcaption>`:""}</figure>`;
    }).join("\n");
    html=html.replace(/(<div class="art-grid"[^>]*>)[\s\S]*?<\/div>/,'$1'+images+'</div>');
    html=html.replace(/(<span id="year">)[\s\S]*?<\/span>/,'$1'+new Date().getFullYear()+'</span>');
    html=html.replace(/((?:src|href)=")(?:\.\.\/)?assets\//g,'$1'+prefix+'assets/');
    html=html.replace('href="admin/"',`href="${prefix}admin/"`);
    html=html.replace('href="/" data-lang="fr"',`href="${prefix||"./"}" data-lang="fr"`).replace('href="/nl/" data-lang="nl"',`href="${lang==="nl"?"./":"nl/"}" data-lang="nl"`);
    html=html.replace(/class="(?:active)?" data-field="lang(Fr|Nl)Label"/g,(_,label)=>`class="${(label==="Nl") === (lang==="nl")?"active":""}" data-field="lang${label}Label"`);
    const schema={"@context":"https://schema.org","@type":"WebSite","@id":origin+"/#website",name:data.galleryName,url:origin+"/",inLanguage:["fr","nl"],description:content.metaDescription};
    const metadata=`<link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="fr" href="${origin}/">
  <link rel="alternate" hreflang="nl" href="${origin}/nl/">
  <link rel="alternate" hreflang="x-default" href="${origin}/">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escape([content.galleryName,content.pageTitleSuffix].filter(Boolean).join(" — "))}">
  <meta property="og:description" content="${escape(content.metaDescription)}">
  <meta property="og:url" content="${url}">
  <meta property="og:locale" content="${lang==="nl"?"nl_BE":"fr_BE"}">
  <meta property="og:image" content="${escape(new URL(data.heroImage,origin+"/").href)}">
  <script type="application/ld+json">${json(schema)}</script>
  <script type="application/json" id="published-content">${json(data)}</script>`;
    html=html.replace('<!-- SEO -->',metadata);
    if(content.sitePaused){html=html.replace(/<body>[\s\S]*<\/body>/,`<body class="site-paused"><main class="paused-page"><p>${escape(content.pausedMessage)}</p></main></body>`);}
    return html;
  }
  const api={render,localize};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  else root.siteSeoRenderer=api;
})(typeof window!=="undefined"?window:globalThis);
