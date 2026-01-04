# 🎛️ Site Arduino - Composants & Projets

Site web interactif pour apprendre l'électronique Arduino avec HTML, CSS et JavaScript.

## 📋 Fonctionnalités

### 🏠 Accueil
- Accès rapide aux 2 cartes Arduino (Uno, Nano ESP32)
- Catalogue de 10+ composants électroniques avec schémas
- Interface moderne et intuitive
- Navigation fluide entre les sections

### 📂 Projets
- Création et gestion illimitée de projets Arduino
- Ajout de photos, notes techniques et code C++
- Association de composants aux projets
- **Sauvegarde locale (localStorage)** avec export/import JSON
- Historique et suivi des projets

### 🧮 Formules (37 calculatrices)
**Électricité (13)** : Loi d'Ohm, puissance, effet Joule, résistances (série/parallèle), condensateurs, inductances, réactances, impédance RLC, résonance LC...

**Microcontrôleur (9)** : ADC 12 bits, pont diviseur, résistance LED, PWM, autonomie batterie, servo, buzzer, moteur DC, pull-up...

**Radio/RF (4)** : Antenne quart d'onde, dBm→mW, longueur d'onde, perte de propagation...

**Signal (5)** : Filtre RC, gains dB (tension/puissance), Nyquist-Shannon, constante RC...

**Ingénierie (3)** : Température de jonction, couple moteur, loi de Pouillet (résistivité)...

### 🎛️ Cartes Arduino (2)
**Arduino Uno** : ATmega328P, 5V, 16 MHz, 14 GPIO, 6 ADC 10 bits, USB Type-B

**Arduino Nano ESP32** : ESP32-S3, 3.3V, 240 MHz, WiFi/Bluetooth, 21 GPIO, 8 ADC 12 bits, USB-C

### ⚡ Composants (10+)
**LED** : Rouge 5mm, RGB commune cathode

**Résistances** : 220Ω, 10kΩ (code couleur)

**Condensateurs** : Céramique 100nF, électrolytique 1000µF

**Capteurs** : DHT11 (température/humidité), HC-SR04 (ultrason)

**Actionneurs** : Servo SG90, relais 5V 10A

**CI** : 74HC595 (registre à décalage)

## 💾 Sauvegarde des projets

### ⚠️ Important
Les projets sont stockés dans le **localStorage du navigateur**. Attention : si vous changez de méthode d'accès (file:// ↔ http://localhost), vous ne verrez pas les mêmes projets !

### ✅ Export/Import

#### 💾 Exporter vos projets
1. Cliquez sur l'icône **📶** (menu en haut à droite)
2. **"💾 Sauvegarder les projets"**
3. Un fichier JSON est téléchargé : `mes-projets-arduino-YYYY-MM-DD.json`
4. **Conservez-le précieusement !**

#### 📥 Importer vos projets
1. Icône **📶** → **"📥 Restaurer les projets"**
2. Sélectionnez votre fichier `.json`
3. Confirmez la restauration

### 💡 Bonnes pratiques
✅ Exportez après chaque modification importante  
✅ Gardez plusieurs sauvegardes datées  
✅ Sauvegardez sur le cloud (Drive, Dropbox...)  
✅ **Avant de changer de navigateur/serveur : EXPORTEZ !**

---

## 🚀 Utilisation

### Méthode 1 : Fichier local
Double-cliquez sur `index.html` → Ouvre avec `file://`

### Méthode 2 : Serveur local (recommandé)
```bash
python -m http.server 8000
# Puis : http://localhost:8000
```

⚠️ **localStorage différent entre file:// et http:// !** Utilisez toujours export/import.

---

## 📁 Structure du projet

```
site-electronique-arduino/
├── index.html          # Page principale
├── script.js           # Logique (3200+ lignes)
├── auto_save.bat       # Sauvegarde auto Git (Windows)
├── images/
│   ├── site/           # Logos, bannières
│   └── composants/     # Schémas techniques (brochage/empatement)
│       ├── led-rouge/
│       ├── led-rgb/
│       └── README.md   # Documentation structure
└── projet/             # Exports JSON (git-ignoré)
```

---

## 🛠️ Technologies
- **Frontend** : HTML5, CSS3, JavaScript vanilla
- **Stockage** : localStorage (navigateur)
- **Export** : JSON avec téléchargement automatique
- **Images** : PNG (schémas techniques organisés par composant)

---

## 📝 Notes
- Projet éducatif pour apprendre Arduino et le web
- Aucune dépendance externe (fonctionne offline)
- Compatible tous navigateurs modernes
- Code source commenté en français
