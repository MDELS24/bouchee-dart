const fallback = {
  galleryName: "Bouchée d’Art",
  galleryIntro: "Un lieu à taille humaine consacré aux artistes émergents et aux regards singuliers.",
  exhibitionTitle: "Terrain sensible",
  exhibitionDates: "10 octobre — 16 novembre 2026",
  exhibitionText: "Une exposition collective qui réunit peintures, photographies et objets autour des paysages intérieurs et des matières du quotidien.",
  exhibitionExtra: "Vernissage le vendredi 9 octobre, de 18 h à 21 h. Entrée libre.",
  artists: "Ana Vermeer, Louis Delcourt, Sofia Marin",
  manager: "Claire Vandenberg",
  address: "24, rue des Tanneurs\n1000 Bruxelles",
  hours: "Jeudi — dimanche\n14 h — 18 h",
  email: "bonjour@boucheedart.be",
  phone: "+32 2 555 01 47",
  additionalInfo: "Visites de groupe sur rendez-vous. La galerie est accessible aux personnes à mobilité réduite.",
  heroImage: "assets/gallery-hero.png",
  images: []
};

const safeLines = value => String(value ?? "").split("\n").map(line => {
  const span = document.createElement("span");
  span.textContent = line;
  return span.outerHTML;
}).join("<br>");

function render(data) {
  const content = { ...fallback, ...data };
  document.title = `${content.galleryName} — Galerie`;
  document.querySelectorAll("[data-field]").forEach(el => {
    const value = content[el.dataset.field];
    if (value !== undefined) el.innerHTML = safeLines(value);
  });
  document.querySelector("#hero-image").src = content.heroImage || fallback.heroImage;
  document.querySelector("#email-link").href = `mailto:${content.email}`;
  document.querySelector("#phone-link").href = `tel:${content.phone.replace(/[^+\d]/g, "")}`;
  const grid = document.querySelector("#art-grid");
  grid.replaceChildren();
  (content.images || []).forEach((image, index) => {
    const figure = document.createElement("figure");
    figure.className = "art-card reveal";
    const img = document.createElement("img");
    img.src = image.src;
    img.alt = image.alt || `Œuvre ${index + 1} de l’exposition ${content.exhibitionTitle}`;
    img.loading = index > 1 ? "lazy" : "eager";
    figure.append(img);
    if (image.caption) {
      const caption = document.createElement("figcaption");
      caption.textContent = image.caption;
      figure.append(caption);
    }
    grid.append(figure);
  });
  observeReveals();
}

function observeReveals() {
  const items = document.querySelectorAll(".reveal:not(.visible)");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return items.forEach(el => el.classList.add("visible"));
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
  }), { threshold: .12 });
  items.forEach(item => observer.observe(item));
}

fetch("content/site.json", { cache: "no-store" })
  .then(response => response.ok ? response.json() : fallback)
  .then(render)
  .catch(() => render(fallback));

document.querySelector("#year").textContent = new Date().getFullYear();
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector("#main-nav");
menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
nav.addEventListener("click", () => { nav.classList.remove("open"); menuButton.setAttribute("aria-expanded", "false"); });
