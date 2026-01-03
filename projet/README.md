# Dossier des projets

Ce dossier contient vos projets Arduino sauvegardés automatiquement.

## Fonctionnement

1. **Configuration initiale** : Menu ⚙️ → "Configurer dossier projet"
2. **Sélectionner ce dossier** dans l'explorateur de fichiers
3. **Automatique** : Chaque projet est sauvegardé comme un fichier `.json` séparé

## Structure des fichiers

Chaque projet est un fichier JSON contenant :
- Nom du projet
- Notes
- Code Arduino
- Image (base64)
- Composants utilisés
- Statut (En cours, Terminé, etc.)

## Exemple

```
projet/
├── mon-premier-projet.json
├── capteur-temperature.json
└── led-rgb.json
```

## Synchronisation avec GitHub

Tous les fichiers `.json` de ce dossier sont automatiquement inclus dans votre dépôt GitHub.
Quand vous clonez le repo ailleurs, vos projets sont déjà là !
