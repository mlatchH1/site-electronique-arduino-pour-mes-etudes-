# 🔌 Site Électronique Arduino - Gestionnaire de Projets

Application web complète pour gérer et documenter vos projets électroniques Arduino.

## ✨ Fonctionnalités

### 📁 Gestion de Projets
- Création, édition et suppression de projets
- Organisation par catégories (Robotique, Domotique, IoT, etc.)
- Niveaux de difficulté (Débutant, Intermédiaire, Avancé)
- Tags personnalisables
- Photos de projets
- Historique des projets récents

### 🛠️ Cartes Arduino
- **Arduino Uno R3** (25.00 €) - Idéale pour débuter
- **Arduino Mega 2560** (45.00 €) - Pour projets complexes
- **Arduino Nano ESP32** (18.00 €) - WiFi/Bluetooth intégré
- Fiches techniques détaillées avec pinout
- Sélection de carte par projet

### 📦 Base de Composants (158 composants)
- **Éclairage** : LEDs (rouge, verte, bleue, blanche, jaune, RGB)
- **Capteurs** : DHT11, HC-SR04, LDR, PIR, etc.
- **Actionneurs** : Servomoteur SG90, relais 5V
- **Audio** : Buzzers actif/passif
- **Résistances** : Toutes valeurs E12/E24 (10Ω à 10MΩ)
- **Circuits Intégrés** : 74HC595
- **Condensateurs** : 100nF, 1000µF
- **Entrées** : Boutons poussoirs, potentiomètres

### 💰 Gestion des Coûts
- Prix pour 74+ composants
- Calcul automatique du coût total par projet
- Liens d'achat Amazon
- Export Excel professionnel avec formules

### 📊 Export Excel Professionnel
- **Dashboard** : Liste d'achat avec carte et composants
- **Onglet Composants** : Formules Excel automatiques, protection, mise en forme conditionnelle
- **Onglet Code** : Code Arduino formaté
- **Onglet Notes** : Pinout et schémas
- **Onglet Instructions** : Mode d'emploi

### 🔧 Outils Avancés
- **Calculateurs** : Résistances LED, diviseur de tension, condensateurs, etc.
- **Formules électroniques** : Loi d'Ohm, puissance, conversions
- **Favoris** : Sauvegarde des composants fréquemment utilisés
- **Recherche avancée** : Par nom, catégorie, caractéristiques

### 💻 Code Arduino
- Éditeur de code intégré
- Copie rapide vers IDE Arduino
- Sauvegarde avec le projet

## 🚀 Installation

1. Télécharger tous les fichiers du projet
2. Ouvrir `index.html` dans un navigateur moderne (Chrome, Firefox, Edge)
3. Accepter l'accès au système de fichiers pour sauvegarder les projets

## 📂 Structure des Fichiers

```
site-electronique-arduino/
├── index.html              # Application principale
├── script.js              # Logique JavaScript
├── images/                # Images des composants et cartes
│   ├── composants/        # Bibliothèque de composants
│   └── cartes/            # Photos des cartes Arduino
└── projet/                # Projets sauvegardés (JSON)
```

## 🎯 Utilisation

### Créer un Projet
1. Cliquer sur "➕ NOUVEAU PROJET"
2. Remplir les informations (nom, catégorie, difficulté)
3. Sélectionner la carte Arduino utilisée
4. Ajouter les composants nécessaires
5. Insérer le code Arduino
6. Sauvegarder

### Exporter en Excel
1. Ouvrir un projet
2. Cliquer sur "📊 EXPORT CSV"
3. Télécharger le fichier Excel professionnel avec formules

### Utiliser les Calculateurs
1. Aller dans "Calculateurs"
2. Choisir le type de calcul
3. Entrer les valeurs connues
4. Obtenir le résultat instantané

## 💡 Caractéristiques Techniques

- **Technologie** : HTML5, CSS3, JavaScript ES6+
- **Bibliothèques** : ExcelJS (export), FileSaver.js
- **Stockage** : Local (File System Access API)
- **Format** : JSON pour les projets
- **Responsive** : Interface adaptée mobile/desktop

## 🔄 Mises à Jour

**Dernière version** : Janvier 2026
- Système de cartes Arduino avec prix
- Export Excel professionnel avec formules
- 158 composants avec prix Amazon
- Interface optimisée

## 📝 Licence

Projet éducatif - Libre d'utilisation

## 👨‍💻 Support

Pour toute question ou suggestion, ouvrir une issue sur le projet.

---

**Fait avec ❤️ pour les makers et étudiants Arduino**
