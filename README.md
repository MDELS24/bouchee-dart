# Bouchée d’Art

Site statique et mini-CMS pour une galerie d’art, conçu pour GitHub Pages.

## Publication

1. Créer un dépôt GitHub et y envoyer la branche `main`.
2. Dans **Settings → Pages**, choisir **Deploy from a branch**, puis `main` et `/ (root)`.
3. Le site est publié à l’adresse indiquée par GitHub Pages.

## Administration

L’interface est disponible sous `/admin/`. Elle utilise l’API GitHub et un jeton d’accès fin limité au dépôt. Le jeton doit avoir uniquement la permission **Contents: Read and write** et n’est conservé que dans la mémoire de l’onglet.

Le CMS permet de modifier tous les textes du site en français et en néerlandais : présentation, exposition, titres rouges, sous-titres, menus, liens, boutons de langue, informations pratiques, description de l’onglet et textes d’accessibilité. Un intitulé ou un lien laissé vide est masqué sur le site. Les photos peuvent être ajoutées, retirées et réordonnées, avec des légendes et des textes alternatifs dans les deux langues.

Les rubriques Artistes et Visite conservent un seul titre rouge, légèrement agrandi pour la lisibilité. Les anciens champs `peopleTitle` et `visitTitle` restent conservés dans les données existantes mais ne sont plus affichés. Les textes ajoutés au CMS reprennent les valeurs par défaut de `assets/text-defaults.js` lors de l’ouverture d’un ancien contenu.

La rubrique **Bandeau temporaire en haut du site** affiche un bandeau rouge sur toute la largeur, au-dessus de la navigation. Modifier le texte dans chaque langue, choisir **Afficher / Masquer** avec les boutons radio, puis publier. Le retrait s’applique aux deux langues, conserve le texte et ne laisse aucun espace. La présentation est accessible dans un volet fermé par défaut, dont l’intitulé reste également éditable.

## Structure

Le logo transparent est fourni en WebP, en deux tailles : 160 px pour l’en-tête cliquable et 480 px pour la rubrique Visite. Ses liens et les chemins des images restent valides dans les deux langues et lors des publications du CMS. La palette reprend le bordeaux et le bleu gris de l’ancienne enseigne, avec le fond ivoire et les polices d’origine ; le nom principal et le titre d’exposition restent noirs.

- `content/site.json` : contenu éditable.
- `assets/uploads/` : photos ajoutées depuis le CMS.
- `admin/` : interface d’administration.
- `index.html` : site public.

## Référencement et langues

Le français est publié sur `/` et le néerlandais sur `/nl/`, avec le même nom de centre dans les deux langues. Les liens de langue fonctionnent sans JavaScript. Chaque page possède un titre, une description, une URL canonique, des liens `hreflang` et des données structurées `WebSite`. `sitemap.xml` déclare les deux pages ; `robots.txt` indique ce sitemap. La balise Search Console du propriétaire reste dans le modèle.

Le CMS publie les JSON et les deux pages HTML dans un seul commit, à partir de `assets/page-template.html` et de `assets/seo-renderer.js`. Les contenus sont donc présents dans le HTML dès le chargement, sans attendre JavaScript. Le brouillon reste enregistré indépendamment. Une mise à jour concurrente du dépôt pendant la publication est refusée sans forcer la branche.

Après une modification locale de `content/site.json` ou du modèle, exécuter `node scripts/build-seo.cjs` puis `node tests/seo.cjs` avant publication. Le référencement concerne uniquement la recherche Google : aucune fiche d’établissement ou inscription sur Google Maps n’est créée. Search Console nécessite une connexion au compte du propriétaire.

Le CMS suit l’ordre du site : bandeau, en-tête, accueil, exposition, artistes, visite et contact. Des liens permettent de rejoindre chaque rubrique. Les options de référencement, d’accessibilité et de mise en pause sont regroupées en fin de formulaire. Vérifications locales : `node tests/cms.cjs` et `node tests/seo.cjs`. Le lien d’administration ne figure plus dans le pied de page public ; le CMS reste disponible à `/admin/`.
