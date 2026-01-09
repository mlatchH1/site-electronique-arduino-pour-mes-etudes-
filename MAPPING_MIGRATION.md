# 🔄 MAPPING DE MIGRATION - RÉORGANISATION DES CATÉGORIES

**Date:** 8 Janvier 2026  
**Objectif:** Plan détaillé de migration vers la nouvelle structure  

---

## 📋 TABLEAU DE MIGRATION COMPOSANT PAR COMPOSANT

### 💡 CATÉGORIE 1: ÉCLAIRAGE (nouveau)

| Composant ID | Nom | Catégorie Actuelle | Action |
|--------------|-----|-------------------|--------|
| `led-red` | LED Rouge 5mm | `led` | ✅ DÉPLACER |
| `led-green` | LED verte | `led` | ✅ DÉPLACER |
| `led-blue` | LED bleue | `led` | ✅ DÉPLACER |
| `led-yellow` | LED jaune | `led` | ✅ DÉPLACER |
| `led-white` | LED blanche | `led` | ✅ DÉPLACER |
| `led-rgb` | LED RGB commune cathode | `led` | ✅ DÉPLACER |
| `ws2812b` | WS2812B Néopixel | `advanced-leds` | ✅ DÉPLACER |
| `rgb-strip-5050` | Bande LED RGB 5050 | `advanced-leds` | ✅ DÉPLACER |
| `matrix-8x8` | Matrice LED 8×8 MAX7219 | `advanced-leds` | ✅ DÉPLACER |

**Total: 9 composants**  
**Nouvelle catégorie:**
```javascript
{
    id: 'lighting',
    folderName: 'Eclairage',
    name: 'Éclairage',
    icon: '💡',
    description: 'LEDs simples, RGB, Néopixels et afficheurs lumineux',
    components: [ /* 9 composants */ ]
}
```

---

### ⚡ CATÉGORIE 2: COMPOSANTS PASSIFS (nouveau)

| Composant ID | Nom | Catégorie Actuelle | Action |
|--------------|-----|-------------------|--------|
| `resistor-*` (84×) | Résistances série E12 | `resistor` | ✅ DÉPLACER |
| `cap-100n` | Condensateur céramique 100nF | `capacitor` | ✅ DÉPLACER |
| `cap-1000u` | Condensateur électrolytique 1000µF | `capacitor` | ✅ DÉPLACER |
| `inductor-100uh` | Inductance 100µH | `capacitor` | ⚠️ CORRIGER (mal placée) |
| `inductor-10mh` | Inductance 10mH | `capacitor` | ⚠️ CORRIGER (mal placée) |
| `polyfuse` | Fusible réarmable PTC | `transistors-diodes` | ⚠️ CORRIGER (mal placé) |

**Total: 89 composants**  
**Nouvelle catégorie:**
```javascript
{
    id: 'passive',
    folderName: 'Composants-Passifs',
    name: 'Composants Passifs',
    icon: '⚡',
    description: 'Résistances, condensateurs, inductances, fusibles',
    components: [ /* 89 composants */ ]
}
```

---

### 🔺 CATÉGORIE 3: SEMI-CONDUCTEURS (nouveau)

| Composant ID | Nom | Catégorie Actuelle | Action |
|--------------|-----|-------------------|--------|
| `2n2222` | 2N2222 Transistor NPN | `transistors-diodes` | ✅ DÉPLACER |
| `bc547` | BC547 Transistor NPN | `transistors-diodes` | ✅ DÉPLACER |
| `2n2907` | 2N2907 Transistor PNP | `transistors-diodes` | ✅ DÉPLACER |
| `tip120` | TIP120 Darlington NPN | `transistors-diodes` | ✅ DÉPLACER |
| `1n4007` | 1N4007 Diode de Redressement | `transistors-diodes` | ✅ DÉPLACER |
| `1n4148` | 1N4148 Diode Signal Rapide | `transistors-diodes` | ✅ DÉPLACER |
| `1n5819` | 1N5819 Diode Schottky | `transistors-diodes` | ✅ DÉPLACER |
| `zener-5v1` | Diode Zener 5.1V | `transistors-diodes` | ✅ DÉPLACER |
| `bt136` | BT136 TRIAC 600V | `transistors-diodes` | ✅ DÉPLACER |
| `bt169` | BT169 Thyristor/SCR | `transistors-diodes` | ✅ DÉPLACER |
| `pc817` | PC817 Optocoupleur | `transistors-diodes` | ✅ DÉPLACER |

**Total: 11 composants**  
**Nouvelle catégorie:**
```javascript
{
    id: 'semiconductors',
    folderName: 'Semi-Conducteurs',
    name: 'Semi-Conducteurs Discrets',
    icon: '🔺',
    description: 'Transistors, diodes, TRIAC, thyristors, optocoupleurs',
    components: [ /* 11 composants */ ]
}
```

---

### 🔲 CATÉGORIE 4: CIRCUITS INTÉGRÉS (conservée)

| Composant ID | Nom | Catégorie Actuelle | Action |
|--------------|-----|-------------------|--------|
| `74hc595` | 74HC595 Registre à décalage | `ic` | ✅ CONSERVER |
| `ne555` | NE555 Timer | `ic` | ✅ CONSERVER |
| `lm358` | LM358 Ampli-Op Double | `ic` | ✅ CONSERVER |
| `lm393` | LM393 Comparateur Double | `ic` | ✅ CONSERVER |
| `uln2003` | ULN2003 Driver Darlington | `ic` | ✅ CONSERVER |
| `cd4017` | CD4017 Compteur Décade | `ic` | ✅ CONSERVER |

**Total: 6 composants**  
**Action: Conserver l'id et structure actuels**

---

### 🎛️ CATÉGORIE 5: ENTRÉES & CONTRÔLES (fusion)

| Composant ID | Nom | Catégorie Actuelle | Action |
|--------------|-----|-------------------|--------|
| `push-button` | Bouton poussoir | `input` | ✅ DÉPLACER |
| `potentiometer` | Potentiomètre 10kΩ | `input` | ✅ DÉPLACER |
| `joystick-analog` | Joystick Analogique 2 Axes | `interfaces` | ✅ DÉPLACER |
| `rotary-encoder` | Encodeur Rotatif KY-040 | `interfaces` | ✅ DÉPLACER |
| `keypad-4x4` | Clavier Matriciel 4×4 | `interfaces` | ✅ DÉPLACER |

**Total: 5 composants**  
**Nouvelle catégorie:**
```javascript
{
    id: 'inputs',
    folderName: 'Entrees-Controles',
    name: 'Entrées & Contrôles',
    icon: '🎛️',
    description: 'Boutons, potentiomètres, joysticks, encodeurs, claviers',
    components: [ /* 5 composants */ ]
}
```

---

### 🔊 CATÉGORIE 6: AUDIO (conservée)

| Composant ID | Nom | Catégorie Actuelle | Action |
|--------------|-----|-------------------|--------|
| `buzzer-active` | Buzzer actif | `audio` | ✅ CONSERVER |
| `buzzer-passive` | Buzzer passif | `audio` | ✅ CONSERVER |

**Total: 2 composants**  
**Action: Conserver**

---

### 🌡️ CATÉGORIE 7: CAPTEURS ENVIRONNEMENTAUX (nouveau)

| Composant ID | Nom | Catégorie Actuelle | Action |
|--------------|-----|-------------------|--------|
| `dht11` | DHT11 Température/Humidité | `sensor` | ✅ DÉPLACER |
| `ldr` | Photorésistance (LDR) | `sensor` | ✅ DÉPLACER |
| `ds18b20` | DS18B20 Température | `advanced-sensors` | ✅ DÉPLACER |
| `bmp280` | BMP280 Pression + Température | `advanced-sensors` | ✅ DÉPLACER |
| `pir-hc-sr501` | HC-SR501 Détecteur PIR | `advanced-sensors` | ✅ DÉPLACER |

**Total: 5 composants**  
**Nouvelle catégorie:**
```javascript
{
    id: 'sensors-environment',
    folderName: 'Capteurs-Environnement',
    name: 'Capteurs Environnementaux',
    icon: '🌡️',
    description: 'Température, humidité, pression, lumière, mouvement',
    components: [ /* 5 composants */ ]
}
```

---

### 📏 CATÉGORIE 8: CAPTEURS DE DISTANCE (nouveau)

| Composant ID | Nom | Catégorie Actuelle | Action |
|--------------|-----|-------------------|--------|
| `hcsr04` | HC-SR04 Ultrason | `sensor` | ✅ DÉPLACER |
| `bpw34` | BPW34 Photodiode PIN | `sensor` | ✅ DÉPLACER |
| `l14g1` | L14G1 Phototransistor | `sensor` | ✅ DÉPLACER |

**Total: 3 composants**  
**Nouvelle catégorie:**
```javascript
{
    id: 'sensors-distance',
    folderName: 'Capteurs-Distance',
    name: 'Capteurs de Distance & Position',
    icon: '📏',
    description: 'Ultrason, infrarouge, laser, encodeurs optiques',
    components: [ /* 3 composants */ ]
}
```

---

### 🧭 CATÉGORIE 9: CAPTEURS DE MOUVEMENT (nouveau)

| Composant ID | Nom | Catégorie Actuelle | Action |
|--------------|-----|-------------------|--------|
| `mpu6050` | MPU6050 Gyroscope + Accéléromètre | `advanced-sensors` | ✅ DÉPLACER |

**Total: 1 composant**  
**Nouvelle catégorie:**
```javascript
{
    id: 'sensors-motion',
    folderName: 'Capteurs-Mouvement',
    name: 'Capteurs de Mouvement',
    icon: '🧭',
    description: 'IMU, gyroscope, accéléromètre, magnétomètre',
    components: [ /* 1 composant */ ]
}
```

---

### ⚙️ CATÉGORIE 10: MOTEURS & DRIVERS (fusion + nettoyage)

| Composant ID | Nom | Catégorie Actuelle | Action |
|--------------|-----|-------------------|--------|
| `sg90` | Servo SG90 | `actuator` | ✅ DÉPLACER |
| `relay-5v` | Relais 5V 10A | `actuator` | ❌ **VERS MODULES** |
| ❌ `l298n` | L298N (doublon 1) | `actuator` | 🗑️ **SUPPRIMER** |
| ✅ `l298n` | L298N (version finale) | `advanced-motors` | ✅ CONSERVER |
| `28byj-48` | 28BYJ-48 Stepper | `advanced-motors` | ✅ DÉPLACER |
| `irf520` | IRF520 MOSFET | `advanced-motors` | ⚠️ **VERS SEMI-CONDUCTEURS** |

**Total: 3 composants**  
**⚠️ Actions critiques:**
1. Supprimer `l298n` de la ligne 762 (`actuator`)
2. Conserver `l298n` de la ligne 1162 (`advanced-motors`)
3. Déplacer `irf520` vers `Semi-Conducteurs`
4. Déplacer `relay-5v` vers `Modules-Peripheriques`

**Nouvelle catégorie:**
```javascript
{
    id: 'motors',
    folderName: 'Moteurs-Drivers',
    name: 'Moteurs & Drivers',
    icon: '⚙️',
    description: 'Servos, moteurs DC, moteurs pas-à-pas, drivers H-bridge',
    components: [
        sg90,
        l298n,  // UN SEUL !
        28byj-48
    ]
}
```

---

### 🔌 CATÉGORIE 11: ALIMENTATION (étendue)

| Composant ID | Nom | Catégorie Actuelle | Action |
|--------------|-----|-------------------|--------|
| `lm7805` | LM7805 Régulateur 5V | `power` | ✅ CONSERVER |
| `ams1117-3v3` | AMS1117-3.3V | `power` | ✅ CONSERVER |
| `tp4056` | TP4056 Chargeur Li-ion | `power` | ✅ CONSERVER |
| `step-down-lm2596` | LM2596 Buck Converter | `modules` | ✅ DÉPLACER |
| `p6ke6v8` | TVS Diode 6.8V | `transistors-diodes` | ✅ DÉPLACER |
| `mov-14d471k` | MOV Varistor 275V | `transistors-diodes` | ✅ DÉPLACER |

**Total: 6 composants**  
**Nouveau nom:**
```javascript
{
    id: 'power',
    folderName: 'Alimentation-Regulation',
    name: 'Alimentation & Régulation',
    icon: '🔌',
    description: 'Régulateurs, convertisseurs, chargeurs, protection',
    components: [ /* 6 composants */ ]
}
```

---

### 📶 CATÉGORIE 12: COMMUNICATION (renommée)

| Composant ID | Nom | Catégorie Actuelle | Action |
|--------------|-----|-------------------|--------|
| `esp8266` | ESP8266 WiFi | `communication` | ✅ CONSERVER |
| `hc-05` | HC-05 Bluetooth | `communication` | ✅ CONSERVER |
| `nrf24l01` | nRF24L01+ Radio 2.4GHz | `communication` | ✅ CONSERVER |

**Total: 3 composants**  
**Nouveau nom:**
```javascript
{
    id: 'wireless',
    folderName: 'Communication-Sans-Fil',
    name: 'Communication Sans Fil',
    icon: '📶',
    description: 'WiFi, Bluetooth, RF, LoRa',
    components: [ /* 3 composants */ ]
}
```

---

### 📺 CATÉGORIE 13: AFFICHEURS (conservée)

| Composant ID | Nom | Catégorie Actuelle | Action |
|--------------|-----|-------------------|--------|
| `lcd-16x2-i2c` | LCD 16×2 I2C | `display` | ✅ CONSERVER |
| `oled-128x64` | OLED 128×64 | `display` | ✅ CONSERVER |
| `7segment-4digit` | Afficheur 7 segments | `display` | ✅ CONSERVER |

**Total: 3 composants**  
**Action: Conserver**

---

### 🎴 CATÉGORIE 14: MODULES & PÉRIPHÉRIQUES (fusion)

| Composant ID | Nom | Catégorie Actuelle | Action |
|--------------|-----|-------------------|--------|
| `ds1307-rtc` | DS1307 RTC | `modules` | ✅ CONSERVER |
| `sd-card-module` | Module SD Card | `modules` | ✅ CONSERVER |
| `relay-module-1ch` | Module Relais 1 canal | `modules` | ✅ CONSERVER |
| `relay-5v` | Relais 5V 10A | `actuator` | ✅ DÉPLACER |
| `rfid-rc522` | RFID RC522 | `interfaces` | ✅ DÉPLACER |
| `crystal-16mhz` | Cristal quartz 16MHz | `transistors-diodes` | ✅ DÉPLACER |

**Total: 6 composants**  
**Nouvelle catégorie:**
```javascript
{
    id: 'modules',
    folderName: 'Modules-Peripheriques',
    name: 'Modules & Périphériques',
    icon: '🎴',
    description: 'RTC, SD Card, relais, RFID, cristaux',
    components: [ /* 6 composants */ ]
}
```

---

## 📊 CATÉGORIES À SUPPRIMER

Ces catégories seront fusionnées/redistribuées:

| ID Catégorie | Nom | Composants | Nouvelle destination |
|--------------|-----|-----------|---------------------|
| `led` | LED | 6 | → `lighting` |
| `input` | Entrées | 2 | → `inputs` |
| `resistor` | Résistances | 84 | → `passive` |
| `capacitor` | Condensateurs | 4 | → `passive` |
| `sensor` | Capteurs | 5 | → `sensors-environment` + `sensors-distance` |
| `actuator` | Actionneurs | 3 | → `motors` + `modules` |
| `advanced-sensors` | Capteurs Avancés | 4 | → `sensors-environment` + `sensors-motion` |
| `advanced-motors` | Moteurs Avancés | 3 | → `motors` + `semiconductors` |
| `interfaces` | Interfaces | 4 | → `inputs` + `modules` |
| `advanced-leds` | LED Avancées | 3 | → `lighting` |
| `transistors-diodes` | Transistors & Diodes | 15 | → `semiconductors` + `passive` + `power` + `modules` |

**Total: 11 catégories supprimées**  
**Total: 14 nouvelles catégories**

---

## 🔧 SCRIPT DE MIGRATION (pseudo-code)

```javascript
// ÉTAPE 1: Créer les nouvelles catégories
const newCategories = [
    createLightingCategory(),
    createPassiveCategory(),
    createSemiconductorsCategory(),
    // ... 14 catégories au total
];

// ÉTAPE 2: Migrer les composants
const componentMapping = {
    'led-red': { from: 'led', to: 'lighting' },
    'led-green': { from: 'led', to: 'lighting' },
    // ... mapping complet
};

// ÉTAPE 3: Supprimer les doublons
const duplicatesToRemove = [
    { id: 'l298n', category: 'actuator', line: 762 }
];

// ÉTAPE 4: Valider
validateNoDuplicates(newCategories);
validateAllComponentsMigrated(oldCategories, newCategories);
validateImagePaths(newCategories);
```

---

## ✅ CHECKLIST DE MIGRATION

### Avant de commencer
- [ ] Backup complet de `script.js`
- [ ] Backup du dossier `images/composants/`
- [ ] Test de l'application actuelle

### Phase 1: Suppression des doublons
- [ ] Supprimer `l298n` ligne 762 (catégorie `actuator`)
- [ ] Vérifier aucun autre doublon d'ID
- [ ] Test chargement

### Phase 2: Création des nouvelles catégories
- [ ] Créer catégorie `lighting` (9 composants)
- [ ] Créer catégorie `passive` (89 composants)
- [ ] Créer catégorie `semiconductors` (11 composants)
- [ ] Créer catégorie `inputs` (5 composants)
- [ ] Créer catégorie `sensors-environment` (5 composants)
- [ ] Créer catégorie `sensors-distance` (3 composants)
- [ ] Créer catégorie `sensors-motion` (1 composant)
- [ ] Créer catégorie `motors` (3 composants)
- [ ] Renommer `power` → `power-regulation` (6 composants)
- [ ] Renommer `communication` → `wireless` (3 composants)
- [ ] Créer catégorie `modules` (6 composants)
- [ ] Conserver `ic`, `audio`, `display` inchangées

### Phase 3: Migration des composants
- [ ] Migrer tous les composants LED
- [ ] Migrer tous les composants passifs
- [ ] Migrer tous les semi-conducteurs
- [ ] Migrer tous les capteurs
- [ ] Migrer tous les modules

### Phase 4: Nettoyage
- [ ] Supprimer anciennes catégories vides
- [ ] Vérifier cohérence des icônes
- [ ] Standardiser nommage folderName
- [ ] Vérifier chemins images

### Phase 5: Tests
- [ ] Test chargement de chaque catégorie
- [ ] Test affichage de chaque composant
- [ ] Test calculateurs
- [ ] Test images
- [ ] Test sur mobile

---

## 📁 RENOMMAGE DES DOSSIERS IMAGES

```
AVANT → APRÈS

images/composants/
├── led/                    → Eclairage/
├── Entrees/                → Entrees-Controles/
├── Audio/                  → Audio/ (inchangé)
├── Resistances/            → Composants-Passifs/Resistances/
├── Condensateurs/          → Composants-Passifs/Condensateurs/
├── Capteurs/               → Capteurs-Environnement/
├── Actionneurs/            → Moteurs-Drivers/ (partiel)
├── Circuits-Integres/      → Circuits-Integres/ (inchangé)
├── Afficheurs/             → Afficheurs/ (inchangé)
├── Communication/          → Communication-Sans-Fil/
├── Alimentation/           → Alimentation-Regulation/
├── Capteurs-Avances/       → (split en plusieurs)
├── Moteurs-Avances/        → Moteurs-Drivers/
├── Interfaces/             → (split)
├── LED-Avancees/           → Eclairage/
├── Transistors-Diodes/     → Semi-Conducteurs/ (+ split)
└── Modules/                → Modules-Peripheriques/
```

---

**Fin du mapping de migration**  
*Ce document doit être utilisé comme guide de référence lors de la refonte*
