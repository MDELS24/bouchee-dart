const API = "https://api.github.com";
const CONTENT_PATH = "content/site.json";
const state = { owner:"", repo:"", branch:"main", token:"", sha:"", content:null };
const loginPanel = document.querySelector("#login-panel");
const editorPanel = document.querySelector("#editor-panel");
const loginStatus = document.querySelector("#login-status");
const saveStatus = document.querySelector("#save-status");
const contentForm = document.querySelector("#content-form");

function headers() {
  return { Accept:"application/vnd.github+json", Authorization:`Bearer ${state.token}`, "X-GitHub-Api-Version":"2022-11-28" };
}

async function github(path, options={}) {
  const response = await fetch(`${API}${path}`, { ...options, headers:{ ...headers(), ...(options.headers||{}) } });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Erreur GitHub ${response.status}`);
  }
  return response.json();
}

const decode = value => decodeURIComponent(escape(atob(value.replace(/\n/g,""))));
const encode = value => btoa(unescape(encodeURIComponent(value)));

async function loadContent() {
  const file = await github(`/repos/${state.owner}/${state.repo}/contents/${CONTENT_PATH}?ref=${encodeURIComponent(state.branch)}`);
  state.sha = file.sha;
  state.content = JSON.parse(decode(file.content));
  Object.entries(state.content).forEach(([key,value]) => {
    const field = contentForm.elements.namedItem(key);
    if (field && typeof value === "string") field.value = value;
  });
  renderImages();
}

function renderImages() {
  const list = document.querySelector("#image-list");
  list.replaceChildren();
  (state.content.images || []).forEach((image,index) => {
    const figure = document.createElement("figure"); figure.className="image-item";
    const img = document.createElement("img"); img.src=`../${image.src}`; img.alt=image.alt||"";
    const button = document.createElement("button"); button.type="button"; button.textContent="Retirer";
    button.addEventListener("click",()=>{ state.content.images.splice(index,1); renderImages(); });
    figure.append(img,button); list.append(figure);
  });
}

document.querySelector("#login-form").addEventListener("submit", async event => {
  event.preventDefault(); loginStatus.textContent="Connexion…";
  const form = event.currentTarget;
  const data = new FormData(form);
  Object.assign(state, { owner:data.get("owner").trim(), repo:data.get("repo").trim(), token:data.get("token").trim(), branch:data.get("branch").trim()||"main" });
  try {
    const repo = await github(`/repos/${state.owner}/${state.repo}`);
    if (!repo.permissions?.push) throw new Error("Ce jeton ne permet pas de modifier le dépôt.");
    await loadContent();
    form.reset(); loginPanel.hidden=true; editorPanel.hidden=false; loginStatus.textContent="";
  } catch(error) { state.token=""; loginStatus.textContent=`Connexion refusée : ${error.message}`; }
});

async function uploadImage(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error(`Format non accepté : ${file.name}`);
  if (file.size > 8*1024*1024) throw new Error(`${file.name} dépasse 8 Mo.`);
  const extension = file.name.split(".").pop().toLowerCase();
  const slug = file.name.replace(/\.[^.]+$/,"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const path = `assets/uploads/${Date.now()}-${slug||"oeuvre"}.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary=""; bytes.forEach(byte => binary+=String.fromCharCode(byte));
  await github(`/repos/${state.owner}/${state.repo}/contents/${path}`, { method:"PUT", body:JSON.stringify({ message:`Ajoute ${file.name}`, content:btoa(binary), branch:state.branch }) });
  return { src:path, alt:`Œuvre de l’exposition — ${file.name.replace(/\.[^.]+$/,"")}`, caption:file.name.replace(/\.[^.]+$/,"") };
}

contentForm.addEventListener("submit", async event => {
  event.preventDefault();
  const button=document.querySelector("#save-button"); button.disabled=true; saveStatus.textContent="Enregistrement…";
  try {
    const fields=new FormData(contentForm);
    for (const [key,value] of fields.entries()) if (key!=="images" && typeof value==="string") state.content[key]=value.trim();
    const files=[...document.querySelector("#image-files").files];
    for (let i=0;i<files.length;i++) { saveStatus.textContent=`Téléversement de la photo ${i+1}/${files.length}…`; state.content.images.push(await uploadImage(files[i])); }
    const latest=await github(`/repos/${state.owner}/${state.repo}/contents/${CONTENT_PATH}?ref=${encodeURIComponent(state.branch)}`);
    await github(`/repos/${state.owner}/${state.repo}/contents/${CONTENT_PATH}`, { method:"PUT", body:JSON.stringify({ message:"Met à jour le contenu de la galerie", content:encode(JSON.stringify(state.content,null,2)+"\n"), sha:latest.sha, branch:state.branch }) });
    document.querySelector("#image-files").value=""; renderImages(); saveStatus.textContent="Modifications publiées. GitHub Pages se met à jour dans quelques instants.";
  } catch(error) { saveStatus.textContent=`Échec : ${error.message}`; }
  finally { button.disabled=false; }
});

document.querySelector("#logout").addEventListener("click",()=>{
  Object.assign(state,{token:"",sha:"",content:null}); contentForm.reset(); editorPanel.hidden=true; loginPanel.hidden=false; loginStatus.textContent="Session fermée.";
});
