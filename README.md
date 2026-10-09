# Recipe Book - AdonisJS, Inertia et React

Recipe Book est une application web full-stack pédagogique de gestion de recettes, construite avec AdonisJS, Lucid ORM, SQLite, Inertia.js et React. Elle permet de consulter, de créer, de modifier et de supprimer des recettes comprenant un nom, une description, des durées et une liste d'ingrédients.

![Interface de Recipe Book](./docs/images/app.png)

## Objectifs d'apprentissage

Ce projet sert de support pour pratiquer les bases d'une application web full-stack :

### Backend

- structurer une application AdonisJS avec des controllers, routes et middlewares ;
- manipuler Lucid ORM, les migrations et une base SQLite locale ;
- modéliser une relation entre recettes et ingrédients ;
- valider les données envoyées avec VineJS ;
- paginer les recettes côté serveur afin de limiter le nombre d'éléments chargés à chaque requête et de permettre un scroll infini côté frontend ;
- initialiser des données de démonstration avec un seeder.

### Frontend

- créer une interface React avec Inertia.js ;
- gérer les formulaires, les erreurs de validation et les messages flash ;
- gérer des champs dynamiques pour les ingrédients ;
- composer l'interface avec des composants réutilisables pour la liste, le détail et le formulaire de recette ;
- consommer les pages de recettes et déclencher le chargement de la page suivante au défilement ;
- utiliser Vite, Tailwind CSS et TypeScript dans une application full-stack.

## Fonctionnalités

- affichage des recettes dans une interface à deux panneaux : un panneau contient la liste défilante des recettes et l'autre affiche l'aperçu détaillé de la recette sélectionnée ;
- chargement progressif de la liste au défilement : le serveur renvoie les recettes par pages et le frontend demande automatiquement la page suivante lorsque l'utilisateur atteint le bas de la liste ;
- affichage du détail d'une recette avec sa liste d'ingrédients ;
- création et modification d'une recette à partir d'un formulaire commun organisé par sections ;
- ajout et suppression d'ingrédients dynamiques dans le formulaire ;
- suppression d'une recette depuis son aperçu ;
- navigation par fil d’Ariane entre le carnet, la création et l’édition ;
- validation des champs côté serveur ;
- messages de confirmation après création, modification et suppression ;
- pages de connexion et d'inscription ;
- données de démonstration comprenant trente recettes françaises et leurs ingrédients ;
- stockage local des données dans une base SQLite.

## Installation

### Prérequis

- Node.js 24 ou supérieur ;
- pnpm.

### Backend

Installer les dépendances du projet depuis sa racine :

```bash
pnpm install
```

Créer le fichier d'environnement local :

```bash
cp .env.example .env
```

Générer la clé d'application si `APP_KEY` est vide :

```bash
node ace generate:key
```

Créer la base SQLite et appliquer les migrations :

```bash
node ace migration:run
```

Charger les recettes de démonstration :

```bash
node ace db:seed
```

Le seeder crée les recettes de démonstration absentes et complète les recettes existantes qui ne possèdent pas encore d'ingrédients.

### Frontend

L'interface React est intégrée à l'application AdonisJS et utilise les dépendances installées à l'étape précédente.

## Démarrage

1. Lancer l'application AdonisJS :

   ```bash
   pnpm dev
   ```

   L'application est accessible sur `http://localhost:3333`.
