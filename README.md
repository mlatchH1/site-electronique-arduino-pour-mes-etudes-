# 🎛️ ESP32 Lab Pro - Site pour projets Arduino

Site web pour développer des compétences en Arduino (C++) avec HTML et JavaScript.

## 📋 Fonctionnalités

### 🏠 Accueil
- Accès rapide aux cartes Arduino (Uno, Nano ESP32)
- Catalogue de composants électroniques
- Interface moderne et intuitive

### 📂 Projets
- Création et gestion de projets Arduino
- Ajout de photos, notes et code
- Intégration de composants dans les projets
- **Sauvegarde et restauration** des projets

### 🧮 Formules (36 calculatrices)
- Électricité (Loi d'Ohm, puissance, résistances, condensateurs...)
- Micro/ESP32 (ADC, PWM, pont diviseur, LED...)
- Radio/RF (antennes, dBm, longueur d'onde...)
- Signal (filtres RC, décibels, Nyquist...)
- Ingénierie (température, couple, résistivité...)

### 🎛️ Cartes Arduino
- Arduino Uno (ATmega328P)
- Arduino Nano ESP32 (ESP32-S3)
- Caractéristiques détaillées et brochage

### ⚡ Composants
- LED (rouge, RGB...)
- Résistances (220Ω, 10kΩ...)
- Condensateurs (céramique, électrolytique...)
- Capteurs (DHT11, HC-SR04...)
- Actionneurs (servo SG90, relais...)
- Circuits intégrés (74HC595...)

## 💾 Sauvegarde des projets

### ⚠️ Important
Les projets sont sauvegardés dans le navigateur (localStorage). **Le problème** : si vous ouvrez le site différemment (file:// vs http://localhost), vous ne verrez pas les mêmes projets !

### ✅ Solution : Export/Import

#### 💾 Sauvegarder vos projets
1. Cliquez sur l'icône **📶** (en haut à droite)
2. Sélectionnez **"💾 Sauvegarder les projets"**
3. Un fichier JSON sera téléchargé (ex: `mes-projets-arduino-2026-01-03.json`)
4. **Conservez ce fichier précieusement !**

#### 📥 Restaurer vos projets
1. Cliquez sur l'icône **📶** (en haut à droite)
2. Sélectionnez **"📥 Restaurer les projets"**
3. Choisissez votre fichier de sauvegarde (.json)
4. Confirmez la restauration

### 💡 Bonnes pratiques
- Exportez régulièrement vos projets (après chaque modification importante)
- Gardez plusieurs sauvegardes à différentes dates
- Sauvegardez le fichier JSON sur un cloud (Google Drive, Dropbox...)
- Avant de changer de navigateur ou de serveur : **EXPORTEZ !**

## 🚀 Utilisation

### Méthode 1 : Ouverture directe
Double-cliquez sur `index.html` (URL: file://)

### Méthode 2 : Serveur local
```bash
# Python 3
python -m http.server 8000

# Puis ouvrez: http://localhost:8000
```

⚠️ **Les projets ne sont PAS partagés entre les deux méthodes !** Utilisez Export/Import.

## 🛠️ Technologies
- HTML5 / CSS3
- JavaScript (Vanilla)
- LocalStorage pour la persistance
- Export/Import JSON

## 📝 Auteur
Étudiant en développement Arduino et Web
