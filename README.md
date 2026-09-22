# Bouchée d’Art

Site statique et mini-CMS pour une galerie d’art, conçu pour GitHub Pages.

## Publication

1. Créer un dépôt GitHub et y envoyer la branche `main`.
2. Dans **Settings → Pages**, choisir **Deploy from a branch**, puis `main` et `/ (root)`.
3. Le site est publié à l’adresse indiquée par GitHub Pages.

## Administration

L’interface est disponible sous `/admin/`. Elle utilise l’API GitHub et un jeton d’accès fin limité au dépôt. Le jeton doit avoir uniquement la permission **Contents: Read and write** et n’est conservé que dans la mémoire de l’onglet.

Le CMS permet de modifier le nom et la présentation de la galerie, l’exposition, les artistes, le responsable, l’adresse, les contacts et les informations pratiques, ainsi que d’ajouter ou retirer des images.

## Structure

- `content/site.json` : contenu éditable.
- `assets/uploads/` : photos ajoutées depuis le CMS.
- `admin/` : interface d’administration.
- `index.html` : site public.
