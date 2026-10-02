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

## Structure

- `content/site.json` : contenu éditable.
- `assets/uploads/` : photos ajoutées depuis le CMS.
- `admin/` : interface d’administration.
- `index.html` : site public.
