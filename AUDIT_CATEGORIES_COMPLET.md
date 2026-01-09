# 📊 AUDIT COMPLET DES CATÉGORIES DE COMPOSANTS - script.js

**Date:** 8 Janvier 2026  
**Fichier analysé:** script.js  
**Lignes totales:** 3804  
**Nombre de catégories:** 17

---

## 📋 ÉTAT ACTUEL - LISTE EXHAUSTIVE DES CATÉGORIES

### 1️⃣ **LED** (id: `led`)
- **Dossier:** `led`
- **Nom:** LED
- **Icône:** 💡
- **Description:** Diodes électroluminescentes
- **Composants (6):**
  1. `led-red` - LED Rouge 5mm
  2. `led-rgb` - LED RGB commune cathode
  3. `led-green` - LED verte
  4. `led-blue` - LED bleue
  5. `led-yellow` - LED jaune
  6. `led-white` - LED blanche

---

### 2️⃣ **ENTRÉES** (id: `input`)
- **Dossier:** `Entrees`
- **Nom:** Entrées
- **Icône:** 🎛️
- **Description:** Boutons, potentiomètres et commandes
- **Composants (2):**
  1. `push-button` - Bouton poussoir
  2. `potentiometer` - Potentiomètre 10kΩ

---

### 3️⃣ **AUDIO** (id: `audio`)
- **Dossier:** `Audio`
- **Nom:** Audio
- **Icône:** 🔊
- **Description:** Buzzers et haut-parleurs
- **Composants (2):**
  1. `buzzer-active` - Buzzer actif
  2. `buzzer-passive` - Buzzer passif

---

### 4️⃣ **RÉSISTANCES** (id: `resistor`)
- **Dossier:** `Resistances`
- **Nom:** Résistances
- **Icône:** ⚡
- **Description:** Composants passifs limitant le courant
- **Composants:** **84 résistances générées automatiquement** (série E12: 10Ω à 8.2MΩ)
  - Exemples: `resistor-10`, `resistor-100`, `resistor-1k`, `resistor-10k`, `resistor-100k`, `resistor-1m`, etc.

---

### 5️⃣ **CONDENSATEURS** (id: `capacitor`)
- **Dossier:** `Condensateurs`
- **Nom:** Condensateurs
- **Icône:** 🔋
- **Description:** Stockage d'énergie électrique
- **Composants (4):**
  1. `cap-100n` - Condensateur céramique 100nF
  2. `cap-1000u` - Condensateur électrolytique 1000µF
  3. `inductor-100uh` - Inductance 100µH
  4. `inductor-10mh` - Inductance 10mH (choke)

---

### 6️⃣ **CAPTEURS** (id: `sensor`)
- **Dossier:** `Capteurs`
- **Nom:** Capteurs
- **Icône:** 📡
- **Description:** Mesure de grandeurs physiques
- **Composants (6):**
  1. `dht11` - DHT11 Température/Humidité
  2. `ldr` - Photorésistance (LDR)
  3. `bpw34` - BPW34 Photodiode PIN
  4. `l14g1` - L14G1 Phototransistor NPN
  5. `hcsr04` - HC-SR04 Ultrason

---

### 7️⃣ **ACTIONNEURS** (id: `actuator`)
- **Dossier:** `Actionneurs`
- **Nom:** Actionneurs
- **Icône:** ⚙️
- **Description:** Moteurs, servos, relais
- **Composants (3):**
  1. `sg90` - Servo SG90
  2. `relay-5v` - Relais 5V 10A
  3. ⚠️ **`l298n` - L298N Pont en H Double** (DOUBLON détecté ligne 762)

---

### 8️⃣ **CIRCUITS INTÉGRÉS** (id: `ic`)
- **Dossier:** `Circuits-Integres`
- **Nom:** Circuits Intégrés
- **Icône:** 🔲
- **Description:** Puces et modules
- **Composants (8):**
  1. `74hc595` - 74HC595 Registre à décalage
  2. `ne555` - NE555 Timer Universel
  3. `lm358` - LM358 Ampli-Op Double
  4. `uln2003` - ULN2003 Driver Darlington
  5. `lm393` - LM393 Comparateur Double
  6. `cd4017` - CD4017 Compteur Décade

---

### 9️⃣ **AFFICHEURS** (id: `display`)
- **Dossier:** `Afficheurs`
- **Nom:** Afficheurs
- **Icône:** 📺
- **Description:** Écrans LCD, OLED et afficheurs
- **Composants (3):**
  1. `lcd-16x2-i2c` - LCD 16×2 I2C
  2. `oled-128x64` - OLED 128×64 I2C/SPI
  3. `7segment-4digit` - Afficheur 7 segments 4 chiffres

---

### 🔟 **COMMUNICATION** (id: `communication`)
- **Dossier:** `Communication`
- **Nom:** Communication
- **Icône:** 📡
- **Description:** Modules WiFi, Bluetooth, RF
- **Composants (3):**
  1. `esp8266` - ESP8266 WiFi
  2. `hc-05` - HC-05 Bluetooth
  3. `nrf24l01` - nRF24L01+ Radio 2.4GHz

---

### 1️⃣1️⃣ **ALIMENTATION** (id: `power`)
- **Dossier:** `Alimentation`
- **Nom:** Alimentation
- **Icône:** 🔌
- **Description:** Régulateurs et gestion de l'énergie
- **Composants (3):**
  1. `lm7805` - LM7805 Régulateur 5V
  2. `ams1117-3v3` - AMS1117-3.3V
  3. `tp4056` - TP4056 Chargeur Li-ion

---

### 1️⃣2️⃣ **CAPTEURS AVANCÉS** (id: `advanced-sensors`)
- **Dossier:** `Capteurs-Avances`
- **Nom:** Capteurs Avancés
- **Icône:** 🎯
- **Description:** Capteurs complexes (IMU, pression, etc.)
- **Composants (4):**
  1. `mpu6050` - MPU6050 Gyroscope + Accéléromètre
  2. `bmp280` - BMP280 Pression + Température
  3. `ds18b20` - DS18B20 Température Numérique
  4. `pir-hc-sr501` - HC-SR501 Détecteur PIR

---

### 1️⃣3️⃣ **MOTEURS & DRIVERS** (id: `advanced-motors`)
- **Dossier:** `Moteurs-Avances`
- **Nom:** Moteurs & Drivers
- **Icône:** ⚙️
- **Description:** Moteurs DC, pas-à-pas et contrôleurs
- **Composants (3):**
  1. ⚠️ **`l298n` - L298N Pont en H** (DOUBLON détecté ligne 1162)
  2. `28byj-48` - 28BYJ-48 Moteur Pas-à-Pas + ULN2003
  3. `irf520` - IRF520 MOSFET N

---

### 1️⃣4️⃣ **INTERFACES UTILISATEUR** (id: `interfaces`)
- **Dossier:** `Interfaces`
- **Nom:** Interfaces Utilisateur
- **Icône:** 🎮
- **Description:** Joysticks, claviers, RFID, encodeurs
- **Composants (4):**
  1. `joystick-analog` - Joystick Analogique 2 Axes
  2. `keypad-4x4` - Clavier Matriciel 4×4
  3. `rfid-rc522` - RFID RC522 13.56MHz
  4. `rotary-encoder` - Encodeur Rotatif KY-040

---

### 1️⃣5️⃣ **LED AVANCÉES** (id: `advanced-leds`)
- **Dossier:** `LED-Avancees`
- **Nom:** LED Avancées
- **Icône:** 🌈
- **Description:** Néopixels, bandes RGB, matrices
- **Composants (3):**
  1. `ws2812b` - WS2812B Néopixel LED RGB
  2. `rgb-strip-5050` - Bande LED RGB 5050 (non-adressable)
  3. `matrix-8x8` - Matrice LED 8×8 MAX7219

---

### 1️⃣6️⃣ **TRANSISTORS & DIODES** (id: `transistors-diodes`)
- **Dossier:** `Transistors-Diodes`
- **Nom:** Transistors & Diodes
- **Icône:** 🔺
- **Description:** Composants semi-conducteurs discrets
- **Composants (13):**
  1. `2n2222` - 2N2222 Transistor NPN
  2. `bc547` - BC547 Transistor NPN
  3. `1n4007` - 1N4007 Diode de Redressement
  4. `1n4148` - 1N4148 Diode Signal Rapide
  5. `zener-5v1` - Diode Zener 5.1V (1N4733)
  6. `1n5819` - 1N5819 Diode Schottky
  7. `2n2907` - 2N2907 Transistor PNP
  8. `tip120` - TIP120 Darlington NPN Puissance
  9. `bt136` - BT136 TRIAC 600V
  10. `bt169` - BT169 Thyristor/SCR 400V
  11. `pc817` - PC817 Optocoupleur
  12. `crystal-16mhz` - Cristal Quartz 16MHz
  13. `p6ke6v8` - P6KE6.8A TVS Diode 6.8V
  14. `mov-14d471k` - MOV 14D471K Varistor 275V
  15. `polyfuse` - Fusible Réarmable PTC (Polyfuse)

---

### 1️⃣7️⃣ **MODULES DIVERS** (id: `modules`)
- **Dossier:** `Modules`
- **Nom:** Modules Divers
- **Icône:** 📦
- **Description:** RTC, SD Card, relais, convertisseurs
- **Composants (4):**
  1. `ds1307-rtc` - DS1307 Module RTC (Real Time Clock)
  2. `sd-card-module` - Module Lecteur Carte SD
  3. `relay-module-1ch` - Module Relais 1 Canal 5V
  4. `step-down-lm2596` - LM2596 Buck Converter (Step-Down)

---

## 🚨 PROBLÈMES IDENTIFIÉS

### ❌ 1. DOUBLONS CRITIQUES

#### **L298N apparaît 2 fois !**
- ✅ Catégorie `Actionneurs` (ligne 762) → id: `actuator`
- ✅ Catégorie `Moteurs-Avances` (ligne 1162) → id: `advanced-motors`
- **Impact:** Confusion utilisateur, maintenance difficile, risque d'incohérence

---

### ⚠️ 2. CATÉGORIES QUI SE CHEVAUCHENT

#### **Capteurs dispersés** 📡
- `Capteurs` (6 composants) : DHT11, LDR, photodiode, phototransistor, ultrason
- `Capteurs-Avances` (4 composants) : MPU6050, BMP280, DS18B20, PIR
- **Problème:** Distinction floue entre "simple" et "avancé"
  - DHT11 est-il vraiment "simple" ? (protocole 1-wire complexe)
  - DS18B20 vs DHT11 : différence peu claire

#### **LED fragmentées** 💡
- `LED` (6 composants) : LED simples monochromes
- `LED-Avancees` (3 composants) : WS2812B, bandes RGB, matrices
- **Problème:** LED RGB commune cathode dans "LED" mais WS2812B dans "LED-Avancees"

#### **Moteurs et actionneurs éclatés** ⚙️
- `Actionneurs` (3 composants) : SG90, relais, L298N
- `Moteurs-Avances` (3 composants) : L298N (doublon!), stepper, MOSFET
- **Problème:** L298N dans les deux, MOSFET n'est pas un moteur

---

### 🔧 3. COMPOSANTS MAL PLACÉS

#### **Inductances dans "Condensateurs"**
- `inductor-100uh` et `inductor-10mh` sont dans la catégorie `Condensateurs`
- **Solution:** Créer catégorie `Composants Passifs` (R, C, L)

#### **Cristal quartz et composants de protection**
- `crystal-16mhz`, `p6ke6v8`, `mov-14d471k`, `polyfuse` dans `Transistors-Diodes`
- **Problème:** Ces composants ne sont ni transistors ni diodes
- **Solution:** Créer catégorie `Protection & Timing`

#### **ULN2003 doublon fonctionnel**
- Dans `Circuits-Integres` comme driver Darlington
- Référencé dans `Moteurs-Avances` avec le 28BYJ-48
- Pas techniquement un doublon ID, mais confusion fonctionnelle

---

### 📛 4. NOMMAGE INCOHÉRENT

#### **Icônes identiques**
- `Actionneurs` ⚙️ = `Moteurs-Avances` ⚙️ (même icône)
- `Capteurs` 📡 = `Communication` 📡 (même icône)
- **Impact:** Difficulté visuelle à distinguer les catégories

#### **Noms de dossiers incohérents**
- `led` (minuscule) vs `Entrees`, `Audio`, `Capteurs` (majuscule)
- `Resistances` vs `Condensateurs` vs `Circuits-Integres` (avec tiret)
- `LED-Avancees` (tiret) vs `Capteurs-Avances` (tiret différent)

---

### 🎯 5. CATÉGORIES TROP GÉNÉRIQUES

#### **"Modules Divers"**
- Catégorie fourre-tout : RTC, SD, relais, convertisseur
- Manque de cohérence thématique
- Difficile de prévoir où chercher un composant

#### **"Interfaces Utilisateur"**
- Mélange joystick, clavier, RFID, encodeur
- RFID n'est pas vraiment une "interface utilisateur" directe

---

## ✅ NOUVELLE STRUCTURE PROPOSÉE

### 🎯 Principes de réorganisation
1. **Éliminer TOUS les doublons**
2. **Regrouper par fonction électronique claire**
3. **Séparer composants passifs (R, C, L) des actifs**
4. **Cohérence de nommage (majuscules, tirets)**
5. **Icônes uniques par catégorie**
6. **Maximum 10-12 composants par catégorie**

---

### 📦 STRUCTURE OPTIMALE (14 catégories)

#### **1. 💡 Éclairage**
- **Nom:** `Eclairage`
- **Dossier:** `Eclairage`
- **Icône:** 💡
- **Composants:**
  - LED simples (rouge, verte, bleue, jaune, blanche)
  - LED RGB commune cathode
  - WS2812B Néopixel
  - Bande LED RGB 5050
  - Matrice LED 8×8 MAX7219

---

#### **2. ⚡ Composants Passifs**
- **Nom:** `Composants-Passifs`
- **Dossier:** `Composants-Passifs`
- **Icône:** ⚡
- **Composants:**
  - Résistances (série E12 générée)
  - Condensateurs céramiques
  - Condensateurs électrolytiques
  - Inductances 100µH, 10mH
  - Fusibles réarmables (polyfuse)

---

#### **3. 🔺 Semi-Conducteurs Discrets**
- **Nom:** `Semi-Conducteurs`
- **Dossier:** `Semi-Conducteurs`
- **Icône:** 🔺
- **Composants:**
  - Transistors NPN (2N2222, BC547, TIP120)
  - Transistor PNP (2N2907)
  - Diodes (1N4007, 1N4148, Schottky, Zener)
  - TRIAC, Thyristor (BT136, BT169)
  - Optocoupleur (PC817)

---

#### **4. 🔲 Circuits Intégrés**
- **Nom:** `Circuits-Integres`
- **Dossier:** `Circuits-Integres`
- **Icône:** 🔲
- **Composants:**
  - 74HC595 (registre à décalage)
  - NE555 (timer)
  - LM358 (ampli-op)
  - LM393 (comparateur)
  - ULN2003 (driver Darlington)
  - CD4017 (compteur décade)

---

#### **5. 🎛️ Entrées & Contrôles**
- **Nom:** `Entrees-Controles`
- **Dossier:** `Entrees-Controles`
- **Icône:** 🎛️
- **Composants:**
  - Bouton poussoir
  - Potentiomètre
  - Joystick analogique
  - Encodeur rotatif
  - Clavier matriciel 4×4

---

#### **6. 🔊 Audio**
- **Nom:** `Audio`
- **Dossier:** `Audio`
- **Icône:** 🔊
- **Composants:**
  - Buzzer actif
  - Buzzer passif
  - (Futur: haut-parleur, micro)

---

#### **7. 🌡️ Capteurs Environnementaux**
- **Nom:** `Capteurs-Environnement`
- **Dossier:** `Capteurs-Environnement`
- **Icône:** 🌡️
- **Composants:**
  - DHT11 (température/humidité)
  - DS18B20 (température précise)
  - BMP280 (pression/température)
  - LDR (photorésistance)
  - PIR HC-SR501 (mouvement)

---

#### **8. 📏 Capteurs de Distance & Position**
- **Nom:** `Capteurs-Distance`
- **Dossier:** `Capteurs-Distance`
- **Icône:** 📏
- **Composants:**
  - HC-SR04 (ultrason)
  - BPW34 (photodiode)
  - L14G1 (phototransistor)
  - (Futur: laser, IR, encodeur optique)

---

#### **9. 🧭 Capteurs de Mouvement**
- **Nom:** `Capteurs-Mouvement`
- **Dossier:** `Capteurs-Mouvement`
- **Icône:** 🧭
- **Composants:**
  - MPU6050 (IMU 6 axes)
  - (Futur: gyroscope, accéléromètre, magnétomètre)

---

#### **10. ⚙️ Moteurs & Drivers**
- **Nom:** `Moteurs-Drivers`
- **Dossier:** `Moteurs-Drivers`
- **Icône:** ⚙️
- **Composants:**
  - Servo SG90
  - **L298N (UN SEUL !)**
  - 28BYJ-48 + ULN2003
  - IRF520 MOSFET
  - (Futur: moteur DC, ESC)

---

#### **11. 🔌 Alimentation & Régulation**
- **Nom:** `Alimentation-Regulation`
- **Dossier:** `Alimentation-Regulation`
- **Icône:** 🔌
- **Composants:**
  - LM7805 (régulateur 5V)
  - AMS1117-3.3V
  - TP4056 (chargeur Li-ion)
  - LM2596 (buck converter)
  - TVS diode P6KE6.8A
  - MOV varistor

---

#### **12. 🔗 Communication Sans Fil**
- **Nom:** `Communication-Sans-Fil`
- **Dossier:** `Communication-Sans-Fil`
- **Icône:** 📶
- **Composants:**
  - ESP8266 WiFi
  - HC-05 Bluetooth
  - nRF24L01+ Radio 2.4GHz

---

#### **13. 📺 Afficheurs**
- **Nom:** `Afficheurs`
- **Dossier:** `Afficheurs`
- **Icône:** 📺
- **Composants:**
  - LCD 16×2 I2C
  - OLED 128×64
  - Afficheur 7 segments

---

#### **14. 🎴 Modules & Périphériques**
- **Nom:** `Modules-Peripheriques`
- **Dossier:** `Modules-Peripheriques`
- **Icône:** 🎴
- **Composants:**
  - DS1307 RTC
  - Module SD Card
  - Module relais 1 canal
  - RFID RC522
  - Cristal quartz 16MHz

---

## 📊 COMPARAISON AVANT/APRÈS

| Métrique | Avant | Après | Amélioration |
|----------|-------|-------|-------------|
| **Nombre de catégories** | 17 | 14 | -18% (plus simple) |
| **Doublons** | 1 (L298N) | 0 | ✅ 100% |
| **Chevauchements** | 4 zones floues | 0 | ✅ Clarté totale |
| **Icônes dupliquées** | 2 paires | 0 | ✅ Unique |
| **Cohérence nommage** | Faible | ✅ Forte | Majuscules + tirets |
| **Composants mal placés** | 6 | 0 | ✅ Logique claire |
| **Catégories fourre-tout** | 2 | 0 | ✅ Thématiques précises |

---

## 🛠️ PLAN D'ACTION RECOMMANDÉ

### Phase 1: Correction Urgente (1h)
1. ✅ **Supprimer le doublon L298N** dans `Actionneurs` (ligne 762)
2. ✅ **Déplacer inductances** de `Condensateurs` vers nouvelle catégorie

### Phase 2: Réorganisation Majeure (3-4h)
1. Créer les 14 nouvelles catégories
2. Migrer tous les composants selon le mapping
3. Vérifier cohérence des chemins `images/composants/`

### Phase 3: Tests & Validation (1h)
1. Tester chargement de tous les composants
2. Vérifier affichage des catégories
3. Valider liens images

---

## 💡 BÉNÉFICES ATTENDUS

✅ **Navigation intuitive** : utilisateur trouve instantanément  
✅ **Maintenance simplifiée** : ajout de composants logique  
✅ **Évolutivité** : structure claire pour croissance future  
✅ **Cohérence visuelle** : icônes et noms uniques  
✅ **Performance** : pas de doublons = chargement optimisé  
✅ **Pédagogie** : catégories reflètent vraies fonctions électroniques  

---

## 📌 NOTES COMPLÉMENTAIRES

### Composants à considérer pour ajout futur
- **Encodeur optique** (Capteurs-Distance)
- **Magnétomètre** (Capteurs-Mouvement)
- **Micro** (Audio)
- **ESC** (Moteurs-Drivers)
- **Boost converter** (Alimentation)
- **LoRa module** (Communication)

### Dossiers physiques à renommer
- `led` → `Eclairage`
- `Entrees` → `Entrees-Controles`
- `Capteurs` → `Capteurs-Environnement`
- `Capteurs-Avances` → Split en 2: `Capteurs-Distance` + `Capteurs-Mouvement`
- `LED-Avancees` → Fusionner dans `Eclairage`

---

**Fin du rapport d'audit**  
*Généré automatiquement - Janvier 2026*
