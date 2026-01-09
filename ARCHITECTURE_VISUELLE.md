# 📐 ARCHITECTURE VISUELLE - COMPARAISON AVANT/APRÈS

## 🔴 STRUCTURE ACTUELLE (17 catégories) - PROBLÉMATIQUE

```
┌─────────────────────────────────────────────────────────────────┐
│                    CATÉGORIES ACTUELLES (17)                    │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   ÉCLAIRAGE  │
                    └──────────────┘
         ┌──────────────┴───────┬─────────────────┐
         │                      │                 │
    ┌────▼─────┐         ┌──────▼──────┐   ┌─────▼──────┐
    │   LED    │         │ LED-Avancees │   │ ❌ DOUBLON │
    │  💡 (6)  │         │   🌈 (3)     │   │  ICÔNES   │
    └──────────┘         └──────────────┘   └────────────┘
    │ led-red            │ ws2812b              💡 = 💡
    │ led-green          │ rgb-strip-5050       ⚙️ = ⚙️
    │ led-blue           │ matrix-8x8           📡 = 📡
    │ led-yellow         └──────────────
    │ led-white
    │ led-rgb
    └──────────


┌───────────────────────────────────────────────────────────────┐
│                    COMPOSANTS PASSIFS                         │
└───────────────────────────────────────────────────────────────┘

    ┌─────────────┐      ┌──────────────────┐
    │ Résistances │      │ Condensateurs    │
    │   ⚡ (84)   │      │    🔋 (4)        │
    └─────────────┘      └──────────────────┘
    │ resistor-*         │ cap-100n
    │ (série E12)        │ cap-1000u
    │                    │ ❌ inductor-100uh  (MAL PLACÉ!)
    │                    │ ❌ inductor-10mh   (MAL PLACÉ!)
    └─────────────       └──────────────────


┌───────────────────────────────────────────────────────────────┐
│                       CAPTEURS                                │
└───────────────────────────────────────────────────────────────┘

    ┌─────────────┐      ┌──────────────────┐
    │  Capteurs   │      │ Capteurs-Avances │
    │   📡 (5)    │      │     🎯 (4)       │
    └─────────────┘      └──────────────────┘
    │ dht11              │ mpu6050
    │ ldr                │ bmp280
    │ bpw34              │ ds18b20
    │ l14g1              │ pir-hc-sr501
    │ hcsr04             │
    └─────────────       └──────────────────
         ⚠️ DISTINCTION FLOUE "simple" vs "avancé"


┌───────────────────────────────────────────────────────────────┐
│                    MOTEURS & ACTIONNEURS                      │
└───────────────────────────────────────────────────────────────┘

    ┌──────────────┐     ┌───────────────────┐
    │ Actionneurs  │     │ Moteurs-Avances   │
    │   ⚙️ (3)     │     │     ⚙️ (3)        │
    └──────────────┘     └───────────────────┘
    │ sg90               │ ❌ l298n (DOUBLON!)
    │ relay-5v           │ 28byj-48
    │ ❌ l298n (1/2)     │ ❌ irf520 (MOSFET mal placé)
    └──────────────      └───────────────────
         ⚠️ L298N apparaît 2 fois !
         ⚠️ Icône identique ⚙️ = ⚙️


┌───────────────────────────────────────────────────────────────┐
│              SEMI-CONDUCTEURS & COMPOSANTS ACTIFS             │
└───────────────────────────────────────────────────────────────┘

    ┌─────────────────────┐
    │ Transistors-Diodes  │
    │      🔺 (15)        │
    └─────────────────────┘
    │ 2n2222, bc547, tip120, 2n2907      ✅ Transistors
    │ 1n4007, 1n4148, 1n5819, zener-5v1  ✅ Diodes
    │ bt136, bt169, pc817                ✅ Puissance
    │ ❌ crystal-16mhz                    (MAL PLACÉ!)
    │ ❌ p6ke6v8, mov-14d471k, polyfuse  (MAL PLACÉS!)
    └─────────────────────


┌───────────────────────────────────────────────────────────────┐
│                    CIRCUITS INTÉGRÉS                          │
└───────────────────────────────────────────────────────────────┘

    ┌────────────────────┐
    │ Circuits-Integres  │
    │      🔲 (6)        │
    └────────────────────┘
    │ 74hc595, ne555, lm358
    │ lm393, uln2003, cd4017
    └────────────────────


┌───────────────────────────────────────────────────────────────┐
│                    INTERFACES                                 │
└───────────────────────────────────────────────────────────────┘

    ┌─────────────┐      ┌──────────────┐
    │  Entrées    │      │  Interfaces  │
    │  🎛️ (2)     │      │   🎮 (4)     │
    └─────────────┘      └──────────────┘
    │ push-button        │ joystick-analog
    │ potentiometer      │ keypad-4x4
    │                    │ ❌ rfid-rc522 (devrait être module)
    │                    │ rotary-encoder
    └─────────────       └──────────────


┌───────────────────────────────────────────────────────────────┐
│                    AUTRES                                     │
└───────────────────────────────────────────────────────────────┘

    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │    Audio     │  │ Afficheurs   │  │Communication │
    │   🔊 (2)     │  │   📺 (3)     │  │   📡 (3)     │
    └──────────────┘  └──────────────┘  └──────────────┘
    │ buzzer-active    │ lcd-16x2-i2c     │ esp8266
    │ buzzer-passive   │ oled-128x64      │ hc-05
    └──────────────    │ 7segment-4digit  │ nrf24l01
                       └──────────────    └──────────────

    ┌──────────────┐  ┌─────────────────────┐
    │Alimentation  │  │  Modules (fourre-  │
    │   🔌 (3)     │  │  tout mal défini)  │
    └──────────────┘  │      📦 (4)        │
    │ lm7805           └─────────────────────┘
    │ ams1117-3v3      │ ds1307-rtc
    │ tp4056           │ sd-card-module
    └──────────────    │ relay-module-1ch
                       │ step-down-lm2596
                       └─────────────────────
```

---

## 🟢 STRUCTURE PROPOSÉE (14 catégories) - OPTIMALE

```
┌─────────────────────────────────────────────────────────────────┐
│              NOUVELLE ARCHITECTURE (14 catégories)              │
│                  ✅ Logique, claire, évolutive                   │
└─────────────────────────────────────────────────────────────────┘


┌───────────────────────────────────────────────────────────────┐
│  1. 💡 ÉCLAIRAGE (9 composants) - Tout regroupé               │
├───────────────────────────────────────────────────────────────┤
│  LED simples:      led-red, led-green, led-blue,             │
│                    led-yellow, led-white                      │
│  LED RGB:          led-rgb (commune cathode)                  │
│  LED adressables:  ws2812b (Néopixel)                         │
│  Bandes:           rgb-strip-5050                             │
│  Matrices:         matrix-8x8                                 │
└───────────────────────────────────────────────────────────────┘


┌───────────────────────────────────────────────────────────────┐
│  2. ⚡ COMPOSANTS PASSIFS (89 composants)                      │
├───────────────────────────────────────────────────────────────┤
│  Résistances:      resistor-* (84 - série E12)                │
│  Condensateurs:    cap-100n, cap-1000u                        │
│  Inductances:      inductor-100uh, inductor-10mh ✅ CORRECT   │
│  Protection:       polyfuse                                   │
└───────────────────────────────────────────────────────────────┘


┌───────────────────────────────────────────────────────────────┐
│  3. 🔺 SEMI-CONDUCTEURS (12 composants)                       │
├───────────────────────────────────────────────────────────────┤
│  NPN:              2n2222, bc547, tip120                      │
│  PNP:              2n2907                                     │
│  MOSFET:           irf520 ✅ CORRECT                           │
│  Diodes:           1n4007, 1n4148, 1n5819, zener-5v1          │
│  Puissance:        bt136, bt169                               │
│  Isolation:        pc817                                      │
└───────────────────────────────────────────────────────────────┘


┌───────────────────────────────────────────────────────────────┐
│  4. 🔲 CIRCUITS INTÉGRÉS (6 composants) - Inchangé            │
├───────────────────────────────────────────────────────────────┤
│  74hc595, ne555, lm358, lm393, uln2003, cd4017                │
└───────────────────────────────────────────────────────────────┘


┌───────────────────────────────────────────────────────────────┐
│  5. 🎛️ ENTRÉES & CONTRÔLES (5 composants) - Fusion            │
├───────────────────────────────────────────────────────────────┤
│  Basiques:         push-button, potentiometer                 │
│  Avancés:          joystick-analog, rotary-encoder,           │
│                    keypad-4x4                                 │
└───────────────────────────────────────────────────────────────┘


┌───────────────────────────────────────────────────────────────┐
│  6. 🔊 AUDIO (2 composants) - Inchangé                        │
├───────────────────────────────────────────────────────────────┤
│  buzzer-active, buzzer-passive                                │
└───────────────────────────────────────────────────────────────┘


┌───────────────────────────────────────────────────────────────┐
│  7. 🌡️ CAPTEURS ENVIRONNEMENTAUX (5 composants)               │
├───────────────────────────────────────────────────────────────┤
│  Température:      dht11, ds18b20, bmp280 (+ pression)        │
│  Lumière:          ldr                                        │
│  Mouvement PIR:    pir-hc-sr501                               │
└───────────────────────────────────────────────────────────────┘


┌───────────────────────────────────────────────────────────────┐
│  8. 📏 CAPTEURS DISTANCE & POSITION (3 composants)            │
├───────────────────────────────────────────────────────────────┤
│  Ultrason:         hcsr04                                     │
│  Infrarouge:       bpw34 (photodiode), l14g1 (phototrans.)    │
└───────────────────────────────────────────────────────────────┘


┌───────────────────────────────────────────────────────────────┐
│  9. 🧭 CAPTEURS MOUVEMENT (1 composant)                       │
├───────────────────────────────────────────────────────────────┤
│  IMU 6 axes:       mpu6050                                    │
└───────────────────────────────────────────────────────────────┘


┌───────────────────────────────────────────────────────────────┐
│  10. ⚙️ MOTEURS & DRIVERS (3 composants) ✅ NETTOYÉ           │
├───────────────────────────────────────────────────────────────┤
│  Servo:            sg90                                       │
│  H-Bridge:         l298n ✅ UN SEUL !                          │
│  Stepper:          28byj-48                                   │
└───────────────────────────────────────────────────────────────┘


┌───────────────────────────────────────────────────────────────┐
│  11. 🔌 ALIMENTATION & RÉGULATION (6 composants)              │
├───────────────────────────────────────────────────────────────┤
│  Régulateurs:      lm7805, ams1117-3v3                        │
│  Chargeur:         tp4056                                     │
│  Convertisseur:    step-down-lm2596                           │
│  Protection:       p6ke6v8 (TVS), mov-14d471k (varistor)     │
└───────────────────────────────────────────────────────────────┘


┌───────────────────────────────────────────────────────────────┐
│  12. 📶 COMMUNICATION SANS FIL (3 composants)                 │
├───────────────────────────────────────────────────────────────┤
│  WiFi:             esp8266                                    │
│  Bluetooth:        hc-05                                      │
│  RF 2.4GHz:        nrf24l01                                   │
└───────────────────────────────────────────────────────────────┘


┌───────────────────────────────────────────────────────────────┐
│  13. 📺 AFFICHEURS (3 composants) - Inchangé                  │
├───────────────────────────────────────────────────────────────┤
│  lcd-16x2-i2c, oled-128x64, 7segment-4digit                   │
└───────────────────────────────────────────────────────────────┘


┌───────────────────────────────────────────────────────────────┐
│  14. 🎴 MODULES & PÉRIPHÉRIQUES (6 composants)                │
├───────────────────────────────────────────────────────────────┤
│  Temps:            ds1307-rtc, crystal-16mhz ✅ CORRECT        │
│  Stockage:         sd-card-module                             │
│  Commutation:      relay-5v, relay-module-1ch                 │
│  Identification:   rfid-rc522 ✅ CORRECT                       │
└───────────────────────────────────────────────────────────────┘
```

---

## 📊 DIAGRAMME DE FLUX - MIGRATION

```
┌─────────────────────────────────────────────────────────────────┐
│                   FLUX DE MIGRATION                             │
└─────────────────────────────────────────────────────────────────┘


CATÉGORIES SUPPRIMÉES → NOUVELLES DESTINATIONS
════════════════════════════════════════════════

┌──────────────┐
│     LED      │ ────────┐
│  (6 comp.)   │         │
└──────────────┘         │    ┌────────────────┐
                         ├───→│   ÉCLAIRAGE    │
┌──────────────┐         │    │  (9 composants)│
│ LED-Avancees │ ────────┘    └────────────────┘
│  (3 comp.)   │
└──────────────┘


┌──────────────┐
│ Résistances  │ ────────┐
│  (84 comp.)  │         │
└──────────────┘         │
                         │
┌──────────────┐         │    ┌────────────────────┐
│Condensateurs │ ────────├───→│ COMPOSANTS PASSIFS │
│  (4 comp.)   │         │    │   (89 composants)  │
└──────────────┘         │    └────────────────────┘
                         │
┌──────────────┐         │
│  Polyfuse    │ ────────┘
│  (from T&D)  │
└──────────────┘


┌──────────────┐         ┌────────────────────────┐
│ Transistors- │ ───────→│  SEMI-CONDUCTEURS     │
│   Diodes     │ (11)    │    (12 composants)    │
│  (15 comp.)  │         └────────────────────────┘
└──────────────┘
      │
      │ (4 vers autres)
      ├──→ p6ke6v8, mov → ALIMENTATION
      ├──→ crystal → MODULES
      └──→ polyfuse → PASSIFS


┌──────────────┐
│   Capteurs   │ ────────┐
│  (5 comp.)   │         │    ┌───────────────────────┐
└──────────────┘         ├───→│ CAPTEURS ENVIRONNEMENT│
                         │    │    (5 composants)     │
┌──────────────┐         │    └───────────────────────┘
│  Capteurs-   │ ────────┤
│   Avances    │ (4)     │    ┌───────────────────────┐
│  (4 comp.)   │         ├───→│ CAPTEURS DISTANCE     │
└──────────────┘         │    │    (3 composants)     │
                         │    └───────────────────────┘
                         │
                         │    ┌───────────────────────┐
                         └───→│ CAPTEURS MOUVEMENT    │
                              │    (1 composant)      │
                              └───────────────────────┘


┌──────────────┐
│ Actionneurs  │ ────────┐
│  (3 comp.)   │  ❌ L298N → SUPPRIMER
└──────────────┘         │
                         │    ┌────────────────────┐
┌──────────────┐         ├───→│  MOTEURS & DRIVERS │
│  Moteurs-    │ ────────┘    │   (3 composants)   │
│   Avances    │ ✅ L298N     └────────────────────┘
│  (3 comp.)   │  ❌ MOSFET → SEMI-CONDUCTEURS
└──────────────┘


┌──────────────┐         ┌────────────────────┐
│  Entrées +   │ ───────→│ ENTRÉES & CONTRÔLES│
│  Interfaces  │         │   (5 composants)   │
│  (6 comp.)   │         └────────────────────┘
└──────────────┘
      │ (1 vers autre)
      └──→ RFID → MODULES


┌──────────────┐         ┌────────────────────┐
│ Alimentation │ ───────→│   ALIMENTATION &   │
│   + Module   │ (6)     │     RÉGULATION     │
│  converter   │         │   (6 composants)   │
└──────────────┘         └────────────────────┘
```

---

## 🎯 MATRICE DE DÉCISION - OÙ PLACER UN NOUVEAU COMPOSANT ?

```
┌─────────────────────────────────────────────────────────────────┐
│              ARBRE DE DÉCISION POUR AJOUT                       │
└─────────────────────────────────────────────────────────────────┘

Nouveau composant à ajouter
        │
        ▼
  ┌─────────────┐
  │ Émet de la  │  OUI → 💡 ÉCLAIRAGE
  │  lumière ?  │          (LED, matrices, bandes)
  └─────────────┘
        │ NON
        ▼
  ┌─────────────┐
  │  Composant  │  OUI → ⚡ COMPOSANTS PASSIFS
  │   passif    │          (R, C, L, fusibles)
  │  (R/C/L) ?  │
  └─────────────┘
        │ NON
        ▼
  ┌─────────────┐
  │ Transistor  │  OUI → 🔺 SEMI-CONDUCTEURS
  │ ou diode ?  │          (NPN, PNP, diodes, MOSFET)
  └─────────────┘
        │ NON
        ▼
  ┌─────────────┐
  │ Circuit     │  OUI → 🔲 CIRCUITS INTÉGRÉS
  │  intégré    │          (74HC, NE555, ampli-op)
  │  logique ?  │
  └─────────────┘
        │ NON
        ▼
  ┌─────────────┐
  │  Interface  │  OUI → 🎛️ ENTRÉES & CONTRÔLES
  │ utilisateur │          (boutons, joysticks)
  │   input ?   │
  └─────────────┘
        │ NON
        ▼
  ┌─────────────┐
  │  Produit    │  OUI → 🔊 AUDIO
  │  du son ?   │          (buzzers, haut-parleurs)
  └─────────────┘
        │ NON
        ▼
  ┌─────────────┐
  │  Mesure     │  OUI ──┐
  │ température │        │
  │  humidité   │        │ 🌡️ CAPTEURS ENVIRONNEMENT
  │  pression   │        │    (DHT, BMP, LDR, PIR)
  │  lumière ?  │        │
  └─────────────┘        │
        │ NON            │
        ▼                │
  ┌─────────────┐        │
  │  Mesure     │  OUI ──┤
  │  distance   │        │ 📏 CAPTEURS DISTANCE
  │ position IR │        │    (ultrason, IR)
  │ ultrason ?  │        │
  └─────────────┘        │
        │ NON            │
        ▼                │
  ┌─────────────┐        │
  │  Mesure     │  OUI ──┘
  │ mouvement,  │        🧭 CAPTEURS MOUVEMENT
  │ accélération│           (IMU, gyro, magnéto)
  │  rotation ? │
  └─────────────┘
        │ NON
        ▼
  ┌─────────────┐
  │  Moteur ou  │  OUI → ⚙️ MOTEURS & DRIVERS
  │   driver    │          (servo, H-bridge, stepper)
  │  moteur ?   │
  └─────────────┘
        │ NON
        ▼
  ┌─────────────┐
  │ Régulation  │  OUI → 🔌 ALIMENTATION
  │ alimentation│          (régulateurs, convertisseurs)
  │ protection? │
  └─────────────┘
        │ NON
        ▼
  ┌─────────────┐
  │Communication│  OUI → 📶 COMMUNICATION
  │  sans fil   │          (WiFi, BT, RF, LoRa)
  │ WiFi/BT/RF? │
  └─────────────┘
        │ NON
        ▼
  ┌─────────────┐
  │  Affichage  │  OUI → 📺 AFFICHEURS
  │  texte ou   │          (LCD, OLED, 7seg)
  │  graphique? │
  └─────────────┘
        │ NON
        ▼
  ┌─────────────┐
  │   Module    │  OUI → 🎴 MODULES & PÉRIPHÉRIQUES
  │  complet    │          (RTC, SD, relais, RFID)
  │ périphérique│
  └─────────────┘
```

---

**Fin de l'architecture visuelle**
