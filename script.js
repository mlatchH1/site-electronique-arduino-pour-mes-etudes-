let db = [];
let currentIdx = null;
let projectDirHandle = null; // Handle vers le dossier "projet" (obligatoire pour sauvegarder)
let favoriteComponents = JSON.parse(localStorage.getItem('lab_favorite_components') || '[]');

// --- FONCTIONS UTILITAIRES ---
// Nettoie les noms de fichiers pour l'affichage (retire numéros et extension)
function cleanImageName(filename) {
    return filename
        .replace('.png', '')
        .replace('.jpg', '')
        .replace(/^\d+-/, '')  // Retire "01-", "02-", etc. au début
        .replace(/-/g, ' ')     // Remplace les tirets par des espaces
        .replace(/\b\w/g, l => l.toUpperCase()); // Première lettre en majuscule
}

// Calcule le code couleur d'une résistance (4 bandes)
function getResistorColorCode(value) {
    const colors = {
        0: 'Noir', 1: 'Marron', 2: 'Rouge', 3: 'Orange', 4: 'Jaune',
        5: 'Vert', 6: 'Bleu', 7: 'Violet', 8: 'Gris', 9: 'Blanc'
    };
    
    let ohms = value;
    let multiplier = 0;
    
    // Convertir kΩ et MΩ en Ω
    if (typeof value === 'string') {
        if (value.includes('M')) {
            ohms = parseFloat(value) * 1000000;
        } else if (value.includes('k')) {
            ohms = parseFloat(value) * 1000;
        } else {
            ohms = parseFloat(value);
        }
    }
    
    // Trouver le multiplicateur
    while (ohms >= 100 && multiplier < 9) {
        ohms /= 10;
        multiplier++;
    }
    
    const digit1 = Math.floor(ohms / 10);
    const digit2 = Math.floor(ohms % 10);
    
    return `${colors[digit1]}-${colors[digit2]}-${colors[multiplier]}-Or`;
}

// Génère automatiquement toutes les résistances standard
function generateStandardResistors() {
    const e12 = [10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82];
    const multipliers = [1, 10, 100, 1000, 10000, 100000, 1000000];
    const resistors = [];
    
    multipliers.forEach(mult => {
        e12.forEach(base => {
            const value = base * mult;
            let displayValue, id;
            
            if (value >= 1000000) {
                displayValue = (value / 1000000) + 'MΩ';
                id = 'resistor-' + (value / 1000000) + 'm';
            } else if (value >= 1000) {
                displayValue = (value / 1000) + 'kΩ';
                id = 'resistor-' + (value / 1000) + 'k';
            } else {
                displayValue = value + 'Ω';
                id = 'resistor-' + value;
            }
            
            resistors.push({
                id: id,
                name: 'Résistance ' + displayValue,
                value: value,
                displayValue: displayValue,
                tolerance: '±5%',
                power: '0.25W',
                price: 0.05,
                buyLink: 'https://www.amazon.fr/s?k=résistance+' + displayValue.replace('Ω', 'ohm').replace('k', 'k').replace('M', 'M'),
                colorCode: getResistorColorCode(value),
                symbole: 'images/composants/Resistances/_shared/symbole/symbole.png',
                description: `Résistance de ${displayValue}, utilisée pour limiter le courant ou créer des diviseurs de tension.`,
                usage: 'Limitation de courant, pull-up/pull-down, diviseur de tension, protection de composants.',
                pinoutFolder: 'images/composants/Resistances/_shared/brochage',
                footprintFolder: 'images/composants/Resistances/_shared/empreinte',
                formula: `Loi d'Ohm: I = V / R\nPuissance: P = V² / R\nAvec R = ${displayValue}`,
                calculator: {
                    variables: [
                        {id: 'i', label: 'Courant (I)', unit: 'A', default: (5/value).toFixed(3), formula: `v / ${value}`},
                        {id: 'v', label: 'Tension (V)', unit: 'V', default: 5, formula: `i * ${value}`},
                        {id: 'p', label: 'Puissance (P)', unit: 'W', default: (25/value).toFixed(3), formula: `v * v / ${value}`}
                    ]
                }
            });
        });
    });
    
    return resistors;
}

// --- MODALES PERSONNALISÉES ---
function customAlert(message, title = 'Information') {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-confirm-modal');
        const titleEl = document.getElementById('custom-confirm-title');
        const messageEl = document.getElementById('custom-confirm-message');
        const okBtn = document.getElementById('custom-confirm-ok');
        const cancelBtn = document.getElementById('custom-confirm-cancel');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        cancelBtn.style.display = 'none'; // Cacher le bouton Annuler
        okBtn.textContent = 'OK';
        okBtn.style.background = 'var(--primary)';
        modal.style.display = 'flex';
        
        const handleOk = () => {
            modal.style.display = 'none';
            cancelBtn.style.display = 'block'; // Réafficher pour les prochains confirm
            okBtn.textContent = 'Confirmer';
            okBtn.style.background = 'var(--danger)';
            okBtn.removeEventListener('click', handleOk);
            resolve(true);
        };
        
        okBtn.addEventListener('click', handleOk);
    });
}

function customConfirm(message, title = 'Confirmation') {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-confirm-modal');
        const titleEl = document.getElementById('custom-confirm-title');
        const messageEl = document.getElementById('custom-confirm-message');
        const okBtn = document.getElementById('custom-confirm-ok');
        const cancelBtn = document.getElementById('custom-confirm-cancel');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        modal.style.display = 'flex';
        
        const handleOk = () => {
            modal.style.display = 'none';
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
            resolve(true);
        };
        
        const handleCancel = () => {
            modal.style.display = 'none';
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
            resolve(false);
        };
        
        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', handleCancel);
    });
}

function customPrompt(message, defaultValue = '', title = 'Saisie') {
    return new Promise((resolve) => {
        const modal = document.getElementById('custom-prompt-modal');
        const titleEl = document.getElementById('custom-prompt-title');
        const messageEl = document.getElementById('custom-prompt-message');
        const inputEl = document.getElementById('custom-prompt-input');
        const okBtn = document.getElementById('custom-prompt-ok');
        const cancelBtn = document.getElementById('custom-prompt-cancel');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        inputEl.value = defaultValue;
        modal.style.display = 'flex';
        inputEl.focus();
        inputEl.select();
        
        const handleOk = () => {
            const value = inputEl.value;
            modal.style.display = 'none';
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
            inputEl.removeEventListener('keypress', handleKeypress);
            resolve(value || null);
        };
        
        const handleCancel = () => {
            modal.style.display = 'none';
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
            inputEl.removeEventListener('keypress', handleKeypress);
            resolve(null);
        };
        
        const handleKeypress = (e) => {
            if (e.key === 'Enter') handleOk();
            if (e.key === 'Escape') handleCancel();
        };
        
        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', handleCancel);
        inputEl.addEventListener('keypress', handleKeypress);
    });
}

// --- BASE DE DONNÉES DES CARTES ARDUINO ---
const arduinoBoards = [
    {
        id: 'uno',
        name: 'Arduino Uno',
        icon: '🔵',
        microcontroller: 'ATmega328P',
        voltage: '5V',
        clock: '16 MHz',
        flash: '32 KB',
        sram: '2 KB',
        eeprom: '1 KB',
        digitalPins: 14,
        analogPins: 6,
        pwmPins: 6,
        currentPerPin: '20 mA',
        usbType: 'USB Type-B',
        dimensions: '68.6 × 53.4 mm',
        description: 'La carte Arduino Uno est la carte la plus populaire et idéale pour débuter. Basée sur le microcontrôleur ATmega328P, elle dispose de 14 broches numériques et 6 entrées analogiques.',
        features: [
            '14 broches numériques (dont 6 PWM)',
            '6 entrées analogiques (10 bits)',
            'Interface UART, SPI, I2C',
            'Alimentation via USB ou 7-12V DC',
            'LED intégrée sur la broche 13',
            'Bouton reset'
        ],
        pinout: 'Broches numériques: D0-D13 (D0/D1 réservés pour UART)\nBroches analogiques: A0-A5\nPWM: D3, D5, D6, D9, D10, D11\nSPI: D10 (SS), D11 (MOSI), D12 (MISO), D13 (SCK)\nI2C: A4 (SDA), A5 (SCL)',
        applications: 'Parfait pour : robotique de base, domotique, projets éducatifs, prototypage rapide, contrôle de moteurs, capteurs simples.'
    },
    {
        id: 'mega',
        name: 'Arduino Mega 2560',
        icon: '🔴',
        microcontroller: 'ATmega2560',
        voltage: '5V',
        clock: '16 MHz',
        flash: '256 KB',
        sram: '8 KB',
        eeprom: '4 KB',
        digitalPins: 54,
        analogPins: 16,
        pwmPins: 15,
        currentPerPin: '20 mA',
        usbType: 'USB Type-B',
        dimensions: '101.52 × 53.3 mm',
        description: 'L\'Arduino Mega 2560 est la carte la plus puissante de la gamme classique Arduino. Avec 54 broches numériques et 16 entrées analogiques, elle est idéale pour les projets complexes nécessitant de nombreuses connexions.',
        features: [
            '54 broches numériques (dont 15 PWM)',
            '16 entrées analogiques (10 bits)',
            '4 ports série UART matériels',
            'Interface SPI et I2C',
            'Alimentation via USB ou 7-12V DC',
            '256 KB de mémoire Flash',
            '8 KB de SRAM',
            'Compatible avec la plupart des shields Uno'
        ],
        pinout: 'Broches numériques: D0-D53\nBroches analogiques: A0-A15\nPWM: D2-D13, D44-D46\nUART0: D0 (RX0), D1 (TX0)\nUART1: D19 (RX1), D18 (TX1)\nUART2: D17 (RX2), D16 (TX2)\nUART3: D15 (RX3), D14 (TX3)\nSPI: D50 (MISO), D51 (MOSI), D52 (SCK), D53 (SS)\nI2C: D20 (SDA), D21 (SCL)',
        applications: 'Idéal pour : imprimantes 3D, CNC, projets robotiques avancés, affichages multiples, nombreux capteurs/actionneurs, interfaces complexes, contrôle multi-moteurs.'
    },
    {
        id: 'nano-esp32',
        name: 'Arduino Nano ESP32',
        icon: '🟢',
        microcontroller: 'ESP32-S3',
        voltage: '3.3V',
        clock: '240 MHz',
        flash: '8 MB (+ 128 MB PSRAM)',
        sram: '512 KB',
        eeprom: 'Émulé',
        digitalPins: 21,
        analogPins: 8,
        pwmPins: 21,
        currentPerPin: '40 mA',
        usbType: 'USB Type-C',
        dimensions: '45 × 18 mm',
        description: 'L\'Arduino Nano ESP32 combine le format compact du Nano avec la puissance de l\'ESP32-S3. Il intègre WiFi et Bluetooth, parfait pour l\'IoT.',
        features: [
            'WiFi 802.11 b/g/n intégré',
            'Bluetooth 5.0 (BLE)',
            '21 broches GPIO (toutes PWM)',
            '8 entrées analogiques (12 bits)',
            'Interface UART, SPI, I2C',
            'USB Type-C natif',
            'Support MicroPython et Arduino IDE',
            '128 MB PSRAM pour l\'IA embarquée'
        ],
        pinout: 'Broches numériques: D0-D13, A0-A7\nTous les GPIO supportent PWM\nADC: 12 bits sur 8 canaux\nSPI: D13 (SCK), D12 (MISO), D11 (MOSI)\nI2C: A4 (SDA), A5 (SCL)\nUART: D0 (RX), D1 (TX)',
        applications: 'Idéal pour : IoT, projets WiFi/Bluetooth, serveurs web embarqués, domotique connectée, surveillance à distance, applications ML/IA légères.'
    }
];

// --- BASE DE DONNÉES DES COMPOSANTS ---
const componentCategories = [
    {
        id: 'eclairage',
        folderName: 'led',
        name: 'Éclairage',
        icon: '💡',
        description: 'LED standard et avancées',
        components: [
            {
                id: 'led-red',
                name: 'LED Rouge 5mm',
                voltage: '1.8-2.2V',
                current: '20 mA',
                wavelength: '620-625 nm',
                price: 0.08,
                buyLink: 'https://www.amazon.fr/s?k=led+rouge+5mm+arduino',
                symbole: 'images/composants/led/_shared/symbole/symbole.png',
                description: 'LED standard rouge, la plus courante dans les projets électroniques. Tension de seuil typique de 2V.',
                usage: 'Utilisée comme indicateur d\'état, alarme visuelle, décoration. Toujours utiliser avec une résistance de limitation de courant.',
                pinout: 'Anode (+) : patte longue\nCathode (-) : patte courte, côté plat',
                pinoutFolder: 'images/composants/led/_shared/brochage',
                footprint: 'Espacement des pattes: 2.54mm (0.1")\nDiamètre du corps: 5mm\nHauteur totale: ~8.5mm',
                footprintFolder: 'images/composants/led/_shared/empreinte',
                formula: 'R = (Vcc - Vled) / I',
                calculator: {
                    variables: [
                        {id: 'r', label: 'Résistance (R)', unit: 'Ω', default: 150, formula: '(vcc - vled) / i'},
                        {id: 'vcc', label: 'Tension source (Vcc)', unit: 'V', default: 5, formula: '(r * i) + vled'},
                        {id: 'i', label: 'Courant (I)', unit: 'A', default: 0.02, formula: '(vcc - vled) / r'},
                        {id: 'vled', label: 'Tension LED (Vled)', unit: 'V', default: 2, fixed: true, formula: '0'}
                    ]
                }
            },
            {
                id: 'led-rgb',
                name: 'LED RGB commune cathode',
                voltage: '2-3.5V (selon couleur)',
                current: '20 mA par canal',
                price: 0.25,
                buyLink: 'https://www.amazon.fr/s?k=led+rgb+5mm+cathode+commune',
                symbole: 'images/composants/led/led-rgb/symbole/symbole.png',
                description: 'LED tricolore permettant de créer toutes les couleurs en mélangeant rouge, vert et bleu.',
                usage: 'Éclairage RGB, indicateurs multicolores, ambiance lumineuse. Nécessite 3 résistances (une par couleur) et 4 fils.',
                pinout: 'Cathode commune (GND) : 2e patte (la plus longue)\nRouge : 1ère patte\nVert : 3e patte\nBleu : 4e patte',
                pinoutFolder: 'images/composants/led/led-rgb/brochage',
                footprint: 'Espacement des pattes: 2.54mm (0.1")\nConfiguration: 4 pattes en ligne\nDiamètre du corps: 5mm',
                footprintFolder: 'images/composants/led/led-rgb/empreinte',
                formula: 'R = (Vcc - Vled) / I\nRouge: Vled ≈ 2V\nVert: Vled ≈ 3.2V\nBleu: Vled ≈ 3.2V\nI = 20mA par canal',
                calculator: {
                    variables: [
                        {id: 'r', label: 'Résistance (R)', unit: 'Ω', default: 150, formula: '(vcc - vled) / i'},
                        {id: 'vcc', label: 'Tension source (Vcc)', unit: 'V', default: 5, formula: '(r * i) + vled'},
                        {id: 'i', label: 'Courant (I)', unit: 'A', default: 0.02, formula: '(vcc - vled) / r'},
                        {id: 'vled', label: 'Tension LED (Vled)', unit: 'V', default: 2, formula: '0', note: 'Rouge:2V, Vert/Bleu:3.2V'}
                    ]
                }
            },
            {
                id: 'led-green',
                name: 'LED verte',
                voltage: '2-3.2V',
                current: '20 mA',
                price: 0.08,
                buyLink: 'https://www.amazon.fr/s?k=led+verte+5mm+arduino',
                symbole: 'images/composants/led/_shared/symbole/symbole.png',
                description: 'LED standard verte, très populaire pour les indicateurs d\'état.',
                usage: 'Indicateur ON/OFF, état système, signalisation.',
                pinout: 'Anode (+) : patte longue\nCathode (-) : patte courte, côté plat',
                pinoutFolder: 'images/composants/led/_shared/brochage',
                footprint: 'Espacement des pattes: 2.54mm (0.1")\nDiamètre du corps: 5mm',
                footprintFolder: 'images/composants/led/_shared/empreinte',
                formula: 'R = (Vcc - Vled) / I\nAvec Vled ≈ 2.2V et I = 20mA',
                calculator: {
                    variables: [
                        {id: 'r', label: 'Résistance (R)', unit: 'Ω', default: 140, formula: '(vcc - vled) / i'},
                        {id: 'vcc', label: 'Tension source (Vcc)', unit: 'V', default: 5, formula: '(r * i) + vled'},
                        {id: 'i', label: 'Courant (I)', unit: 'A', default: 0.02, formula: '(vcc - vled) / r'},
                        {id: 'vled', label: 'Tension LED (Vled)', unit: 'V', default: 2.2, fixed: true, formula: '0'}
                    ]
                }
            },
            {
                id: 'led-blue',
                name: 'LED bleue',
                voltage: '3-3.5V',
                current: '20 mA',
                price: 0.10,
                buyLink: 'https://www.amazon.fr/s?k=led+bleue+5mm+arduino',
                symbole: 'images/composants/led/_shared/symbole/symbole.png',
                description: 'LED bleue haute luminosité, tension directe plus élevée.',
                usage: 'Indicateurs, éclairage décoratif, affichage.',
                pinout: 'Anode (+) : patte longue\nCathode (-) : patte courte, côté plat',
                pinoutFolder: 'images/composants/led/_shared/brochage',
                footprint: 'Espacement des pattes: 2.54mm (0.1")\nDiamètre du corps: 5mm',
                footprintFolder: 'images/composants/led/_shared/empreinte',
                formula: 'R = (Vcc - Vled) / I\nAvec Vled ≈ 3.2V et I = 20mA',
                calculator: {
                    variables: [
                        {id: 'r', label: 'Résistance (R)', unit: 'Ω', default: 90, formula: '(vcc - vled) / i'},
                        {id: 'vcc', label: 'Tension source (Vcc)', unit: 'V', default: 5, formula: '(r * i) + vled'},
                        {id: 'i', label: 'Courant (I)', unit: 'A', default: 0.02, formula: '(vcc - vled) / r'},
                        {id: 'vled', label: 'Tension LED (Vled)', unit: 'V', default: 3.2, fixed: true, formula: '0'}
                    ]
                }
            },
            {
                id: 'led-yellow',
                name: 'LED jaune',
                voltage: '2-2.2V',
                current: '20 mA',
                price: 0.08,
                buyLink: 'https://www.amazon.fr/s?k=led+jaune+5mm+arduino',
                symbole: 'images/composants/led/_shared/symbole/symbole.png',
                description: 'LED jaune/ambre, parfaite pour les signaux d\'avertissement.',
                usage: 'Signaux d\'alerte, indicateurs, feux de signalisation.',
                pinout: 'Anode (+) : patte longue\nCathode (-) : patte courte, côté plat',
                pinoutFolder: 'images/composants/led/_shared/brochage',
                footprint: 'Espacement des pattes: 2.54mm (0.1")\nDiamètre du corps: 5mm',
                footprintFolder: 'images/composants/led/_shared/empreinte',
                formula: 'R = (Vcc - Vled) / I\nAvec Vled ≈ 2.1V et I = 20mA',
                calculator: {
                    variables: [
                        {id: 'r', label: 'Résistance (R)', unit: 'Ω', default: 145, formula: '(vcc - vled) / i'},
                        {id: 'vcc', label: 'Tension source (Vcc)', unit: 'V', default: 5, formula: '(r * i) + vled'},
                        {id: 'i', label: 'Courant (I)', unit: 'A', default: 0.02, formula: '(vcc - vled) / r'},
                        {id: 'vled', label: 'Tension LED (Vled)', unit: 'V', default: 2.1, fixed: true, formula: '0'}
                    ]
                }
            },
            {
                id: 'led-white',
                name: 'LED blanche',
                voltage: '3-3.5V',
                current: '20 mA',
                price: 0.12,
                buyLink: 'https://www.amazon.fr/s?k=led+blanche+5mm+arduino',
                symbole: 'images/composants/led/_shared/symbole/symbole.png',
                description: 'LED blanche haute luminosité pour éclairage général.',
                usage: 'Éclairage, lampe torche, rétroéclairage.',
                pinout: 'Anode (+) : patte longue\nCathode (-) : patte courte, côté plat',
                pinoutFolder: 'images/composants/led/_shared/brochage',
                footprint: 'Espacement des pattes: 2.54mm (0.1")\nDiamètre du corps: 5mm',
                footprintFolder: 'images/composants/led/_shared/empreinte',
                formula: 'R = (Vcc - Vled) / I\nAvec Vled ≈ 3.2V et I = 20mA',
                calculator: {
                    variables: [
                        {id: 'r', label: 'Résistance (R)', unit: 'Ω', default: 90, formula: '(vcc - vled) / i'},
                        {id: 'vcc', label: 'Tension source (Vcc)', unit: 'V', default: 5, formula: '(r * i) + vled'},
                        {id: 'i', label: 'Courant (I)', unit: 'A', default: 0.02, formula: '(vcc - vled) / r'},
                        {id: 'vled', label: 'Tension LED (Vled)', unit: 'V', default: 3.2, fixed: true, formula: '0'}
                    ]
                }
            },
            {
                id: 'ws2812b',
                name: 'WS2812B Néopixel LED RGB',
                voltage: '5V',
                current: '~60mA (blanc max)',
                price: 0.50,
                buyLink: 'https://www.amazon.fr/s?k=ws2812b+led+rgb+adressable',
                symbole: 'images/composants/LED-Avancees/ws2812b/symbole/symbole.png',
                description: 'LED RGB adressable individuellement. Circuit de contrôle intégré, chainable.',
                usage: 'Éclairage décoratif, affichage, indicateurs RGB, projets artistiques.',
                pinout: 'VDD/VCC : 5V\nGND : masse\nDIN : données (depuis Arduino)\nDOUT : sortie données (vers LED suivante)',
                pinoutFolder: 'images/composants/LED-Avancees/ws2812b/brochage',
                footprint: 'Puce : 5×5mm (5050 SMD)\nDisponible : strip, anneau, matrice\nEspacement strip : 16.6mm/LED (60 LED/m)',
                footprintFolder: 'images/composants/LED-Avancees/ws2812b/empreinte',
                formula: 'Couleurs : 16.7 millions (RGB 24 bits)\nCourant max : 60mA/LED (blanc 100%)\nProtocole : 800kHz single-wire\nRésistance DATA : 220-470Ω recommandée',
                code: '#include <Adafruit_NeoPixel.h>\n\n#define PIN 6\n#define NUMPIXELS 8\n\nAdafruit_NeoPixel strip(NUMPIXELS, PIN, NEO_GRB + NEO_KHZ800);\n\nvoid setup() {\n  strip.begin();\n  strip.show();\n}\n\nvoid loop() {\n  // Arc-en-ciel rotatif\n  for(int i=0; i<NUMPIXELS; i++) {\n    int hue = (i * 65536 / NUMPIXELS) + millis()/10;\n    strip.setPixelColor(i, strip.gamma32(strip.ColorHSV(hue)));\n  }\n  strip.show();\n  delay(20);\n}',
                libraries: ['Adafruit_NeoPixel'],
                warning: '⚠️ Alimentation : condensateur 1000µF sur rail 5V ! Résistance 220-470Ω sur DATA !'
            },
            {
                id: 'rgb-strip-5050',
                name: 'Bande LED RGB 5050 (non-adressable)',
                voltage: '12V',
                current: '~1.2A/mètre (60 LED)',
                price: 8.00,
                buyLink: 'https://www.amazon.fr/s?k=bande+led+rgb+5050',
                symbole: 'images/composants/LED-Avancees/rgb-strip-5050/symbole/symbole.png',
                description: 'Bande LED RGB 12V à contrôle analogique. Nécessite MOSFETs ou driver RGB.',
                usage: 'Éclairage d\'ambiance, rétro-éclairage, décoration, effets lumineux.',
                pinout: '12V : alimentation +\nR/G/B : canaux couleurs (commande via MOSFET)\nGND : masse commune',
                pinoutFolder: 'images/composants/LED-Avancees/rgb-strip-5050/brochage',
                footprint: 'LED : 5×5mm (5050 SMD)\nDensités : 30, 60 ou 144 LED/m\nLargeur bande : 10mm',
                footprintFolder: 'images/composants/LED-Avancees/rgb-strip-5050/empreinte',
                formula: 'Consommation : ~14.4W/m (60 LED/m blanc max)\nCourant par canal : ~400mA/m\nChute tension : ~3V par 5m → alimentation par sections',
                code: '// Avec 3× IRF520 MOSFET\nint redPin = 9;\nint greenPin = 10;\nint bluePin = 11;\n\nvoid setup() {\n  pinMode(redPin, OUTPUT);\n  pinMode(greenPin, OUTPUT);\n  pinMode(bluePin, OUTPUT);\n}\n\nvoid loop() {\n  // Fade rouge\n  for(int i=0; i<=255; i++) {\n    analogWrite(redPin, i);\n    delay(10);\n  }\n  analogWrite(redPin, 0);\n  \n  // Mélange magenta\n  analogWrite(redPin, 255);\n  analogWrite(bluePin, 255);\n  delay(1000);\n}',
                warning: '⚠️ Alimentation 12V séparée obligatoire ! Ne pas brancher sur Arduino.'
            },
            {
                id: 'matrix-8x8',
                name: 'Matrice LED 8×8 MAX7219',
                voltage: '5V',
                interface: 'SPI (3 fils)',
                price: 5.00,
                buyLink: 'https://www.amazon.fr/s?k=matrice+led+8x8+max7219',
                symbole: 'images/composants/LED-Avancees/matrix-8x8/symbole/symbole.png',
                description: 'Matrice LED 8×8 avec driver MAX7219. Contrôle facile par SPI, chainable.',
                usage: 'Affichage de symboles, animations, scrolling texte, horloges.',
                pinout: 'VCC : 5V\nGND : masse\nDIN : données SPI\nCS/LOAD : chip select\nCLK : horloge SPI',
                pinoutFolder: 'images/composants/LED-Avancees/matrix-8x8/brochage',
                footprint: 'Module : 32 × 32mm\nLED rouge 3mm\nChainable en série',
                footprintFolder: 'images/composants/LED-Avancees/matrix-8x8/empreinte',
                formula: 'Résolution : 8×8 = 64 LEDs\nLuminosité : 16 niveaux\nMultiplexage automatique par MAX7219\nCourant max : 320mA',
                code: '#include <MD_Parola.h>\n#include <MD_MAX72xx.h>\n\n#define CLK_PIN 13\n#define DATA_PIN 11\n#define CS_PIN 10\n#define MAX_DEVICES 1\n\nMD_Parola matrix = MD_Parola(MD_MAX72XX::FC16_HW, CS_PIN, MAX_DEVICES);\n\nvoid setup() {\n  matrix.begin();\n  matrix.setIntensity(5);\n}\n\nvoid loop() {\n  matrix.displayText("HELLO", PA_CENTER, 50, 0, PA_SCROLL_LEFT);\n  while(!matrix.displayAnimate());\n  delay(1000);\n}',
                libraries: ['MD_Parola', 'MD_MAX72xx']
            }
        ]
    },
    {
        id: 'interfaces',
        folderName: 'Entrees',
        name: 'Interfaces Utilisateur',
        icon: '🎛️',
        description: 'Boutons, potentiomètres, joysticks, RFID, encodeurs',
        components: [
            {
                id: 'push-button',
                name: 'Bouton poussoir',
                voltage: '12V max',
                current: '50 mA',
                price: 0.15,
                buyLink: 'https://www.amazon.fr/s?k=bouton+poussoir+tactile+6x6',
                symbole: 'images/composants/Entrees/push-button/symbole/symbole.png',
                description: 'Bouton tactile momentané, se ferme quand appuyé, s\'ouvre au relâchement.',
                usage: 'Commandes, menus, interactions utilisateur. Nécessite une résistance de pull-up ou pull-down (10kΩ).',
                pinout: 'Borne 1A et 1B : connectées ensemble\nBorne 2A et 2B : connectées ensemble\nCircuit ouvert au repos, fermé quand appuyé',
                pinoutFolder: 'images/composants/Entrees/push-button/brochage',
                footprint: 'Bouton 6×6mm : espacement 2.54mm\nBouton 12×12mm : espacement 5mm',
                footprintFolder: 'images/composants/Entrees/push-button/empreinte',
                code: 'const int buttonPin = 2;\npinMode(buttonPin, INPUT_PULLUP); // Pull-up interne\nint state = digitalRead(buttonPin); // LOW si appuyé\nif (state == LOW) { /* Action */ }'
            },
            {
                id: 'potentiometer',
                name: 'Potentiomètre 10kΩ',
                voltage: '5V',
                resistance: '10kΩ',
                price: 0.35,
                buyLink: 'https://www.amazon.fr/s?k=potentiometre+10k+lineaire',
                symbole: 'images/composants/Entrees/potentiometer/symbole/symbole.png',
                description: 'Résistance variable à 3 broches pour contrôle analogique précis.',
                usage: 'Réglage de volume, luminosité, vitesse moteur, seuils. Entrée analogique 0-1023.',
                pinout: 'VCC : alimentation (+5V)\nGND : masse (0V)\nOUT : curseur variable (broche centrale)',
                pinoutFolder: 'images/composants/Entrees/potentiometer/brochage',
                footprint: 'Type linéaire : 9mm de diamètre\nEspacement des pattes: 5mm',
                footprintFolder: 'images/composants/Entrees/potentiometer/empreinte',
                formula: 'Vout = (Position / 1023) × Vcc',
                calculator: {
                    variables: [
                        {id: 'vout', label: 'Tension sortie (Vout)', unit: 'V', default: 2.5, formula: '(position / 1023) * vcc'},
                        {id: 'position', label: 'Position ADC (0-1023)', unit: '', default: 512, formula: '(vout / vcc) * 1023'},
                        {id: 'vcc', label: 'Tension source (Vcc)', unit: 'V', default: 5, formula: 'vout / (position / 1023)'}
                    ]
                },
                code: 'int potPin = A0;\nint value = analogRead(potPin); // 0-1023\nint mapped = map(value, 0, 1023, 0, 255); // Conversion 0-255'
            },
            {
                id: 'joystick-analog',
                name: 'Joystick Analogique 2 Axes',
                voltage: '5V',
                output: '2× analogique (0-1023) + 1× bouton digital',
                price: 2.00,
                buyLink: 'https://www.amazon.fr/s?k=joystick+analogique+2+axes',
                symbole: 'images/composants/Interfaces/joystick-analog/symbole/symbole.png',
                description: 'Joystick à 2 axes (X/Y) avec bouton-poussoir intégré. Potentiomètres 10kΩ.',
                usage: 'Contrôle de robots, jeux, drones, caméras pan/tilt, menus interactifs.',
                pinout: 'VCC : 5V\nGND : masse\nVRx : axe X analogique\nVRy : axe Y analogique\nSW : bouton (actif LOW)',
                pinoutFolder: 'images/composants/Interfaces/joystick-analog/brochage',
                footprint: 'Module : 37 × 28mm\nHauteur joystick : 32mm\nFixations : 4 trous M3',
                footprintFolder: 'images/composants/Interfaces/joystick-analog/empreinte',
                formula: 'Position repos : ~512 (centre)\nPlage : 0-1023 (ADC 10 bits)\nDébattement : ±25° environ',
                code: 'int joyX = A0;\nint joyY = A1;\nint joyBtn = 2;\n\nvoid setup() {\n  pinMode(joyBtn, INPUT_PULLUP);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int x = analogRead(joyX);\n  int y = analogRead(joyY);\n  bool btn = !digitalRead(joyBtn);\n  \n  Serial.print("X:"); Serial.print(x);\n  Serial.print(" Y:"); Serial.print(y);\n  Serial.print(" BTN:"); Serial.println(btn);\n  delay(100);\n}'
            },
            {
                id: 'keypad-4x4',
                name: 'Clavier Matriciel 4×4',
                voltage: '3-5V',
                keys: '16 touches',
                price: 2.50,
                buyLink: 'https://www.amazon.fr/s?k=clavier+matriciel+4x4+membrane',
                symbole: 'images/composants/Interfaces/keypad-4x4/symbole/symbole.png',
                description: 'Clavier à matrice 16 touches. Nécessite 8 broches Arduino (4 lignes + 4 colonnes).',
                usage: 'Code PIN, calculatrices, systèmes de sécurité, saisie numérique.',
                pinout: 'R1-R4 : lignes (rows)\nC1-C4 : colonnes (columns)\nMatrice par scan : une broche active à la fois',
                pinoutFolder: 'images/composants/Interfaces/keypad-4x4/brochage',
                footprint: 'Dimensions : 69 × 77mm\nEspacement touches : 15mm\nConnecteur 8 broches',
                footprintFolder: 'images/composants/Interfaces/keypad-4x4/empreinte',
                formula: 'Touches : 16 (0-9, A-D, *, #)\nRésistances pull-up internes utilisées\nScan cyclique : détection par ligne',
                code: '#include <Keypad.h>\n\nconst byte ROWS = 4;\nconst byte COLS = 4;\nchar keys[ROWS][COLS] = {\n  {\'1\',\'2\',\'3\',\'A\'},\n  {\'4\',\'5\',\'6\',\'B\'},\n  {\'7\',\'8\',\'9\',\'C\'},\n  {\'*\',\'0\',\'#\',\'D\'}\n};\nbyte rowPins[ROWS] = {9, 8, 7, 6};\nbyte colPins[COLS] = {5, 4, 3, 2};\n\nKeypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);\n\nvoid setup() { Serial.begin(9600); }\nvoid loop() {\n  char key = keypad.getKey();\n  if(key) Serial.println(key);\n}',
                libraries: ['Keypad']
            },
            {
                id: 'rfid-rc522',
                name: 'RFID RC522 13.56MHz',
                voltage: '3.3V',
                interface: 'SPI',
                frequency: '13.56MHz',
                price: 3.00,
                buyLink: 'https://www.amazon.fr/s?k=rfid+rc522+lecteur+mifare',
                symbole: 'images/composants/Interfaces/rfid-rc522/symbole/symbole.png',
                description: 'Lecteur RFID/NFC pour cartes et tags Mifare. Distance de lecture ~3cm.',
                usage: 'Contrôle d\'accès, identification, systèmes de paiement, inventaire.',
                pinout: 'SDA/SS : chip select\nSCK : SPI clock\nMOSI : SPI data out\nMISO : SPI data in\nIRQ : interruption (opt.)\nGND : masse\nRST : reset\n3.3V : alimentation',
                pinoutFolder: 'images/composants/Interfaces/rfid-rc522/brochage',
                footprint: 'Module : 60 × 39mm\nAntenne intégrée PCB\n8 broches 2.54mm',
                footprintFolder: 'images/composants/Interfaces/rfid-rc522/empreinte',
                formula: 'Fréquence : 13.56MHz (ISO 14443A)\nPortée : 0-60mm (dépend de la carte)\nVitesse : jusqu\'à 10 Mbit/s\nUID : 4 ou 7 octets',
                code: '#include <SPI.h>\n#include <MFRC522.h>\n\nMFRC522 rfid(10, 9); // SS, RST\n\nvoid setup() {\n  Serial.begin(9600);\n  SPI.begin();\n  rfid.PCD_Init();\n}\n\nvoid loop() {\n  if(!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) return;\n  \n  Serial.print("UID:");\n  for(byte i=0; i<rfid.uid.size; i++) {\n    Serial.print(rfid.uid.uidByte[i] < 0x10 ? " 0" : " ");\n    Serial.print(rfid.uid.uidByte[i], HEX);\n  }\n  Serial.println();\n  rfid.PICC_HaltA();\n  delay(1000);\n}',
                libraries: ['MFRC522'],
                warning: '⚠️ Alimentation 3.3V uniquement ! 5V détruira le module.'
            },
            {
                id: 'rotary-encoder',
                name: 'Encodeur Rotatif KY-040',
                voltage: '5V',
                output: '2× digital (CLK/DT) + 1× bouton',
                price: 1.50,
                buyLink: 'https://www.amazon.fr/s?k=encodeur+rotatif+ky-040',
                symbole: 'images/composants/Interfaces/rotary-encoder/symbole/symbole.png',
                description: 'Encodeur rotatif incrémental avec bouton-poussoir. Détecte rotation et direction.',
                usage: 'Réglages de volume, navigation dans menus, contrôle de position, interface utilisateur.',
                pinout: 'CLK : signal A (horloge)\nDT : signal B (data)\nSW : bouton poussoir\n+ : 5V\nGND : masse',
                pinoutFolder: 'images/composants/Interfaces/rotary-encoder/brochage',
                footprint: 'Module : 26 × 19mm\nEncodeur : Ø18mm × 15mm',
                footprintFolder: 'images/composants/Interfaces/rotary-encoder/empreinte',
                formula: 'Impulsions : 20 par tour\nRésolution : 18° par cran\nRotation : infinie (pas de limite)',
                code: 'int clkPin = 2;\nint dtPin = 3;\nint swPin = 4;\nint counter = 0;\nint clkLast;\n\nvoid setup() {\n  pinMode(clkPin, INPUT);\n  pinMode(dtPin, INPUT);\n  pinMode(swPin, INPUT_PULLUP);\n  clkLast = digitalRead(clkPin);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int clkNow = digitalRead(clkPin);\n  if(clkNow != clkLast) {\n    if(digitalRead(dtPin) != clkNow) counter++;\n    else counter--;\n    Serial.println(counter);\n  }\n  clkLast = clkNow;\n  \n  if(!digitalRead(swPin)) {\n    counter = 0;\n    delay(200);\n  }\n}'
            }
        ]
    },
    {
        id: 'audio',
        folderName: 'Audio',
        name: 'Audio',
        icon: '🔊',
        description: 'Buzzers et haut-parleurs',
        components: [
            {
                id: 'buzzer-active',
                name: 'Buzzer actif',
                voltage: '3.5-5V',
                frequency: 'Fixe (~2kHz)',
                price: 0.50,
                buyLink: 'https://www.amazon.fr/s?k=buzzer+actif+5v+arduino',
                symbole: 'images/composants/Audio/buzzer-active/symbole/symbole.png',
                description: 'Buzzer avec oscillateur intégré, émet un son fixe quand alimenté.',
                usage: 'Alarmes, notifications simples, bips. Brancher directement sur une sortie digitale.',
                pinout: '+ (long/marqué rouge) : signal 5V\n- (court) : GND',
                pinoutFolder: 'images/composants/Audio/buzzer-active/brochage',
                footprint: 'Diamètre: 12mm\nHauteur: 9.5mm',
                footprintFolder: 'images/composants/Audio/buzzer-active/empreinte',
                code: 'int buzzerPin = 8;\npinMode(buzzerPin, OUTPUT);\ndigitalWrite(buzzerPin, HIGH); // Son ON\ndelay(1000);\ndigitalWrite(buzzerPin, LOW); // Son OFF'
            },
            {
                id: 'buzzer-passive',
                name: 'Buzzer passif',
                voltage: '3-5V',
                frequency: 'Variable (contrôlable)',
                price: 0.60,
                buyLink: 'https://www.amazon.fr/s?k=buzzer+passif+5v+arduino',
                symbole: 'images/composants/Audio/buzzer-passive/symbole/symbole.png',
                description: 'Buzzer sans oscillateur, nécessite un signal PWM pour générer différentes fréquences.',
                usage: 'Mélodies, notes de musique, alarmes variables. Utiliser tone() pour contrôler la fréquence.',
                pinout: '+ (marqué) : signal PWM\n- : GND',
                pinoutFolder: 'images/composants/Audio/buzzer-passive/brochage',
                footprint: 'Diamètre: 12mm\nHauteur: 9.5mm',
                footprintFolder: 'images/composants/Audio/buzzer-passive/empreinte',
                formula: 'Fréquence (Hz) = Note musicale\nDo : 262Hz, Ré : 294Hz, Mi : 330Hz...',
                code: 'int buzzerPin = 8;\ntone(buzzerPin, 1000); // 1000 Hz\ndelay(500);\nnoTone(buzzerPin); // Arrêt\n// Mélodie: tone(buzzerPin, 262, 250); // Do pendant 250ms'
            }
        ]
    },
    {
        id: 'resistor',
        folderName: 'Resistances',
        name: 'Résistances',
        icon: '⚡',
        description: 'Composants passifs limitant le courant',
        components: generateStandardResistors()
    },
    {
        id: 'capacitor',
        folderName: 'Condensateurs',
        name: 'Condensateurs',
        icon: '🔋',
        description: 'Stockage d\'énergie électrique',
        components: [
            {
                id: 'cap-100n',
                name: 'Condensateur céramique 100nF',
                voltage: '50V',
                type: 'Céramique',
                price: 0.10,
                buyLink: 'https://www.amazon.fr/s?k=condensateur+ceramique+100nf+50v',
                symbole: 'images/composants/Condensateurs/cap-100n/symbole/symbole.png',
                description: 'Condensateur de découplage/filtrage très utilisé en électronique numérique.',
                usage: 'Filtrage alimentation, découplage IC, anti-rebond bouton. Placer au plus près des broches VCC/GND des circuits intégrés.',
                pinout: 'Pas de polarité : peut se brancher dans les deux sens\nPatte 1 : borne\nPatte 2 : borne',
                pinoutFolder: 'images/composants/Condensateurs/cap-100n/brochage',
                footprint: 'Espacement des pattes: 2.54mm ou 5.08mm\nDimensions: 4-6mm largeur',
                footprintFolder: 'images/composants/Condensateurs/cap-100n/empreinte',
                formula: 'Fréquence de coupure: fc = 1 / (2πRC)\nAvec C = 100nF',
                calculator: {
                    variables: [
                        {id: 'fc', label: 'Fréquence coupure', unit: 'Hz', default: 159, formula: '1 / (2 * 3.14159 * r * 1000 * 100e-9)'},
                        {id: 'r', label: 'Résistance', unit: 'kΩ', default: 10, formula: '1 / (2 * 3.14159 * fc * 100e-9) / 1000'}
                    ]
                }
            },
            {
                id: 'cap-1000u',
                name: 'Condensateur électrolytique 1000µF',
                voltage: '16V ou 25V',
                type: 'Électrolytique (polarisé)',
                price: 0.25,
                buyLink: 'https://www.amazon.fr/s?k=condensateur+1000uf+25v+electrolytique',
                symbole: 'images/composants/Condensateurs/cap-1000u/symbole/symbole.png',
                description: 'Grand condensateur pour filtrage et réservoir d\'énergie. ATTENTION : polarisé !',
                usage: 'Filtrage alimentation, réservoir d\'énergie, lissage tension. Respecter la polarité : + vers VCC, - vers GND.',
                pinout: 'Patte longue : + (positif)\nPatte courte : - (négatif, souvent marqué par une bande)',
                pinoutFolder: 'images/composants/Condensateurs/cap-1000u/brochage',
                footprint: 'Diamètre: 6.3-8mm\nEspacement des pattes: 2.5mm\nHauteur: 11-13mm',
                footprintFolder: 'images/composants/Condensateurs/cap-1000u/empreinte',
                formula: 'Énergie stockée: E = 0.5 × C × V²\nAvec C = 1000µF = 0.001F',
                calculator: {
                    variables: [
                        {id: 'energie', label: 'Énergie stockée', unit: 'J', default: 0.128, formula: '0.5 * 0.001 * v * v'},
                        {id: 'v', label: 'Tension', unit: 'V', default: 16, formula: 'Math.sqrt(energie / (0.5 * 0.001))'}
                    ]
                },
                warning: 'Polarisé ! Bande marquage = patte négative. Explosion si inversion !'
            },
            {
                id: 'inductor-100uh',
                name: 'Inductance 100µH',
                inductance: '100µH',
                current: '1A max',
                resistance: '<0.5Ω DCR',
                price: 0.40,
                buyLink: 'https://www.amazon.fr/s?k=inductance+100uh+bobine',
                symbole: 'images/composants/Passifs/inductor-100uh/symbole/symbole.png',
                description: 'Bobine d\'inductance pour filtrage, stockage énergie, filtres LC, alimentations à découpage.',
                usage: 'Filtre LC passe-bas, alimentation buck/boost, suppression bruit, découplage RF.',
                pinout: 'Pas de polarité\n2 pattes symétriques',
                pinoutFolder: 'images/composants/Passifs/inductor-100uh/brochage',
                footprint: 'Radial ou axial\nDiamètre : 6-10mm\nTolérance : ±10-20%',
                footprintFolder: 'images/composants/Passifs/inductor-100uh/empreinte',
                formula: 'Impédance : XL = 2πfL\nÉnergie stockée : E = ½ L I²\nFiltre LC : fc = 1/(2π√(LC))\nConstante temps : τ = L/R',
                code: '// === FILTRE LC PASSE-BAS (anti-bruit alimentation) ===\n// Montage :\n//  [+Vin bruité] → [Inductance 100µH] → [+Vout filtré]\n//                                         |\n//                                    [100µF] → GND\n\n// Fréquence coupure :\n// fc = 1/(2π√(LC)) = 1/(2π√(100µH × 100µF))\n//    = 1/(2π × 0.0001) ≈ 1591 Hz\n\n// Supprime bruit >1.6kHz (PWM, switching)\n\n// Code Arduino normal\nvoid setup() {\n  pinMode(9, OUTPUT);\n}\n\nvoid loop() {\n  analogWrite(9, 128); // PWM 490Hz\n  // Inductance + condensateur filtrent\n  // → Sortie quasi-DC propre\n}',
                warning: 'Courant max 1A ! Au-delà : saturation magnétique, inductance chute. Vérifier DCR pour pertes.'
            },
            {
                id: 'inductor-10mh',
                name: 'Inductance 10mH (choke)',
                inductance: '10mH',
                current: '100mA max',
                resistance: '50Ω DCR',
                price: 0.60,
                buyLink: 'https://www.amazon.fr/s?k=inductance+10mh+choke+ferrite',
                symbole: 'images/composants/Passifs/inductor-10mh/symbole/symbole.png',
                description: 'Bobine haute inductance (choke RF) pour filtrage basses fréquences et découplage alimentation.',
                usage: 'Filtrage audio, découplage alimentation, suppression ondulation, filtre anti-parasite.',
                pinout: 'Pas de polarité\n2 pattes symétriques',
                pinoutFolder: 'images/composants/Passifs/inductor-10mh/brochage',
                footprint: 'Radial ou axial\nNoyau ferrite\nGrande taille (10-15mm)',
                footprintFolder: 'images/composants/Passifs/inductor-10mh/empreinte',
                formula: 'Impédance @ 1kHz : XL = 2π×1000×0.01 = 62.8Ω\nAtténuation : 20log(XL/R)\nFiltre LC : fc = 1/(2π√(LC))\nQ factor : Q = XL/DCR',
                code: '// === FILTRE ALIMENTATION AUDIO (anti-ronflette) ===\n// Suppression ronflette 50Hz secteur\n\n// Montage :\n//  [+9V alim] → [Inductance 10mH] → [+9V audio propre]\n//                                     |\n//                                [1000µF] → GND\n\n// Fréquence coupure :\n// fc = 1/(2π√(10mH × 1000µF)) = 15.9 Hz\n\n// Atténuation 50Hz :\n// XL @ 50Hz = 2π × 50 × 0.01 = 3.14Ω\n// Gain = C×XL ≈ -20dB @ 50Hz\n\n// Élimine buzz 50Hz sur ampli audio !\n\n// Code préampli micro :\nint micPin = A0;\nvoid loop() {\n  int audio = analogRead(micPin);\n  // Signal ultra-propre sans 50Hz\n}',
                warning: 'DCR élevé (50Ω) : chute tension 5V @ 100mA ! Courant limité, seulement signaux faibles.'
            }
        ]
    },
    {
        id: 'sensor',
        folderName: 'Capteurs',
        name: 'Capteurs',
        icon: '📡',
        description: 'Mesure de grandeurs physiques',
        components: [
            {
                id: 'dht11',
                name: 'DHT11 Température/Humidité',
                voltage: '3.3-5V',
                range: 'Température: 0-50°C, Humidité: 20-80%',
                accuracy: '±2°C, ±5%',
                price: 1.50,
                buyLink: 'https://www.amazon.fr/s?k=dht11+capteur+temperature+humidite',
                symbole: 'images/composants/Capteurs/dht11/symbole/symbole.png',
                description: 'Capteur numérique de température et humidité, très populaire et bon marché.',
                usage: 'Station météo, monitoring environnemental, régulation climatique. Nécessite la bibliothèque DHT.',
                pinout: 'VCC : 3.3V ou 5V\nDATA : broche numérique (avec pull-up 10kΩ)\nGND : masse',
                pinoutFolder: 'images/composants/Capteurs/dht11/brochage',
                footprint: 'Module: 15.5 × 12 × 5.5mm\nEspacement des pattes: 2.54mm',
                footprintFolder: 'images/composants/Capteurs/dht11/empreinte',
                formula: 'Protocole série 1-wire\nRésistance pull-up : R = 4.7kΩ à 10kΩ\nTemps de lecture : ~250ms minimum entre mesures',
                code: '#include <DHT.h>\nDHT dht(PIN, DHT11);\nvoid setup() { dht.begin(); }\nfloat t = dht.readTemperature();\nfloat h = dht.readHumidity();'
            },
            {
                id: 'ldr',
                name: 'Photorésistance (LDR)',
                voltage: '5V max',
                resistance: '1kΩ - 1MΩ (selon lumière)',
                price: 0.20,
                buyLink: 'https://www.amazon.fr/s?k=photoresistance+ldr+5mm',
                symbole: 'images/composants/Capteurs/ldr/symbole/symbole.png',
                description: 'Capteur de lumière dont la résistance varie selon l\'intensité lumineuse.',
                usage: 'Détection jour/nuit, allumage automatique, photomètre. Utiliser en diviseur de tension avec une résistance fixe.',
                pinout: 'Pas de polarité : peut se brancher dans les deux sens',
                pinoutFolder: 'images/composants/Capteurs/ldr/brochage',
                footprint: 'Diamètre: 5mm\nEspacement des pattes: variable',
                footprintFolder: 'images/composants/Capteurs/ldr/empreinte',
                formula: 'Diviseur de tension: Vout = Vcc × R / (R + RLDR)',
                calculator: {
                    variables: [
                        {id: 'vout', label: 'Tension sortie', unit: 'V', default: 3.33, formula: 'vcc * r / (r + rldr)'},
                        {id: 'vcc', label: 'Tension source', unit: 'V', default: 5, formula: 'vout * (r + rldr) / r'},
                        {id: 'r', label: 'Résistance fixe', unit: 'kΩ', default: 10, formula: 'rldr * vout / (vcc - vout)'},
                        {id: 'rldr', label: 'Résistance LDR', unit: 'kΩ', default: 5, formula: 'r * (vcc - vout) / vout'}
                    ]
                },
                code: 'int ldrPin = A0;\nint value = analogRead(ldrPin); // 0-1023\nfloat voltage = value * (5.0 / 1023.0);'
            },
            {
                id: 'bpw34',
                name: 'BPW34 Photodiode PIN',
                voltage: '60V reverse max',
                current: '50mA forward max',
                sensitivity: '400-1100nm (IR optimisé)',
                price: 0.60,
                buyLink: 'https://www.amazon.fr/s?k=bpw34+photodiode+pin+infrarouge',
                symbole: 'images/composants/Capteurs/bpw34/symbole/symbole.png',
                description: 'Photodiode PIN haute vitesse pour détection lumière rapide. Sensible infrarouge.',
                usage: 'Détection IR, barrière laser, encodeur optique, récepteur télécommande, photomètre rapide.',
                pinout: 'Cathode : patte longue (vers +)\nAnode : patte courte (vers -)\nMode photoconductive : reverse bias',
                pinoutFolder: 'images/composants/Capteurs/bpw34/brochage',
                footprint: 'Boîtier T-1 3/4 (5mm)\nAngle vision : ±65°\nSurface active : 7.5mm²',
                footprintFolder: 'images/composants/Capteurs/bpw34/empreinte',
                formula: 'Mode photoconductive (rapide) :\nVreverse : 5V via résistance\nCourant lumière : 50µA typique pleine lumière\nRésistance charge : 10-100kΩ\nBande passante : >100kHz',
                code: '// === DÉTECTEUR BARRIÈRE INFRAROUGE ===\nint photoPin = A0;\nint ledIR = 13; // LED IR émettrice optionnelle\n\nvoid setup() {\n  pinMode(ledIR, OUTPUT);\n  digitalWrite(ledIR, HIGH); // Émission IR\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int light = analogRead(photoPin);\n  Serial.println(light);\n  \n  if(light < 100) { // Seuil obscurité\n    Serial.println("Barrière coupée !");\n  }\n  delay(10);\n}\n\n// MONTAGE :\n//  [+5V] → [BPW34 cathode]\n//  [BPW34 anode] → [10kΩ] → GND\n//  Point milieu → Arduino A0\n// Lumière ↑ → courant ↑ → voltage A0 ↓',
                warning: 'Monter en reverse bias pour rapidité max. Sensible IR (940nm) : utiliser LED IR émettrice.'
            },
            {
                id: 'l14g1',
                name: 'L14G1 Phototransistor NPN',
                voltage: '30V max',
                current: '100mA max',
                gain: 'hFE lumière : 100-200',
                price: 0.60,
                buyLink: 'https://www.amazon.fr/s?k=phototransistor+npn+5mm',
                symbole: 'images/composants/Capteurs/l14g1/symbole/symbole.png',
                description: 'Phototransistor NPN avec amplification intégrée. Plus sensible que photodiode.',
                usage: 'Détecteur présence, compteur optique, suiveur de ligne robot, détection objets.',
                pinout: 'C : collecteur (patte longue)\nE : émetteur (patte courte)\nBase : photosensible (pas de connexion)',
                pinoutFolder: 'images/composants/Capteurs/l14g1/brochage',
                footprint: 'Boîtier T-1 3/4 (5mm)\nAngle vision : ±20° (directionnel)\nLentille focalisante',
                footprintFolder: 'images/composants/Capteurs/l14g1/empreinte',
                formula: 'Courant obscurité : <100nA\nCourant lumière : 0.5-5mA (selon intensité)\nSaturation : Vce < 0.4V si lumière forte\nRésistance collecteur : 1-10kΩ',
                code: '// === COMPTEUR OPTIQUE (roue codeuse) ===\nint sensorPin = 2; // Phototransistor\nvolatile int count = 0;\n\nvoid setup() {\n  pinMode(sensorPin, INPUT);\n  attachInterrupt(digitalPinToInterrupt(sensorPin), \n                  countPulse, FALLING);\n  Serial.begin(9600);\n}\n\nvoid countPulse() {\n  count++;\n}\n\nvoid loop() {\n  Serial.print("Impulsions : ");\n  Serial.println(count);\n  delay(1000);\n}\n\n// MONTAGE :\n//  [+5V] → [Résistance 4.7kΩ] → [Phototransistor C]\n//  [Phototransistor E] → GND\n//  Point collecteur → Arduino Pin 2\n// Roue crantée passe devant → interruptions lumière',
                warning: 'Plus lent que photodiode (~10kHz vs 100kHz). Gain élevé = très sensible parasites.'
            },
            {
                id: 'hcsr04',
                name: 'HC-SR04 Ultrason',
                voltage: '5V',
                range: '2-400 cm',
                accuracy: '±3mm',
                price: 1.20,
                buyLink: 'https://www.amazon.fr/s?k=hc-sr04+capteur+ultrason+distance',
                symbole: 'images/composants/Capteurs/hcsr04/symbole/symbole.png',
                description: 'Capteur de distance à ultrasons très précis et abordable.',
                usage: 'Mesure de distance, détection d\'obstacles, robot autonome, stationnement.',
                pinout: 'VCC : 5V\nTrig : broche numérique (envoi impulsion)\nEcho : broche numérique (réception)\nGND : masse',
                pinoutFolder: 'images/composants/Capteurs/hcsr04/brochage',
                footprint: 'Module: 45 × 20 × 15mm\nCapteurs espacés de 26mm',
                footprintFolder: 'images/composants/Capteurs/hcsr04/empreinte',
                formula: 'Distance (cm) = (Durée × Vitesse_son) / 2\nVitesse du son = 340 m/s = 0.034 cm/μs\nDiviser par 2 car aller-retour',
                calculator: {
                    variables: [
                        {id: 'distance', label: 'Distance', unit: 'cm', default: 17, formula: 'duree * 0.034 / 2'},
                        {id: 'duree', label: 'Durée écho', unit: 'μs', default: 1000, formula: 'distance / (0.034 / 2)'}
                    ]
                },
                code: 'digitalWrite(trig, HIGH);\ndelayMicroseconds(10);\ndigitalWrite(trig, LOW);\nlong duration = pulseIn(echo, HIGH);\nint distance = duration * 0.034 / 2;'
            },
            {
                id: 'mpu6050',
                name: 'MPU6050 Gyroscope + Accéléromètre',
                voltage: '3-5V',
                interface: 'I2C',
                price: 3.50,
                buyLink: 'https://www.amazon.fr/s?k=mpu6050+gy-521+gyroscope+accelerometre',
                symbole: 'images/composants/Capteurs-Avances/mpu6050/symbole/symbole.png',
                description: 'Capteur IMU 6 axes (3 axes accéléromètre + 3 axes gyroscope). Très utilisé en robotique.',
                usage: 'Drones, robots équilibrés, suivi de mouvement, détection d\'orientation.',
                pinout: 'VCC : 3-5V\nGND : masse\nSCL : I2C clock\nSDA : I2C data\nXDA/XCL : I2C auxiliaire (magnétomètre optionnel)\nAD0 : sélection adresse I2C\nINT : interruption (optionnel)',
                pinoutFolder: 'images/composants/Capteurs-Avances/mpu6050/brochage',
                footprint: 'Module GY-521 : 21 × 16mm\nPuce : QFN-24 4×4mm',
                footprintFolder: 'images/composants/Capteurs-Avances/mpu6050/empreinte',
                formula: 'Accéléromètre : ±2g, ±4g, ±8g, ±16g\nGyroscope : ±250, ±500, ±1000, ±2000 °/s\nAdresse I2C : 0x68 ou 0x69 (selon AD0)',
                code: '#include <Wire.h>\n#include <MPU6050.h>\nMPU6050 mpu;\n\nvoid setup() {\n  Wire.begin();\n  mpu.initialize();\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  int16_t ax, ay, az, gx, gy, gz;\n  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);\n  Serial.print("Accel: "); Serial.println(ax);\n  delay(100);\n}',
                libraries: ['MPU6050'],
                datasheet: 'InvenSense MPU-6050'
            },
            {
                id: 'bmp280',
                name: 'BMP280 Pression + Température',
                voltage: '1.8-3.6V (3.3V recommandé)',
                interface: 'I2C ou SPI',
                price: 2.50,
                buyLink: 'https://www.amazon.fr/s?k=bmp280+capteur+pression+temperature',
                symbole: 'images/composants/Capteurs-Avances/bmp280/symbole/symbole.png',
                description: 'Capteur barométrique de précision. Mesure pression atmosphérique et température.',
                usage: 'Stations météo, altimètres, prévisions météo, drones.',
                pinout: 'VCC : 3.3V\nGND : masse\nSCL : I2C/SPI clock\nSDA : I2C data / SPI MOSI\nCSB : chip select (SPI)\nSDO : SPI MISO / adresse I2C',
                pinoutFolder: 'images/composants/Capteurs-Avances/bmp280/brochage',
                footprint: 'Module : 11.5 × 12.5mm\nPuce : LGA-8 2×2.5mm',
                footprintFolder: 'images/composants/Capteurs-Avances/bmp280/empreinte',
                formula: 'Plage pression : 300-1100 hPa\nRésolution : 0.01 hPa (0.08 Pa)\nAltitude : h = 44330 × (1-(P/P0)^0.1903)\nTempérature : -40 à +85°C',
                code: '#include <Adafruit_BMP280.h>\nAdafruit_BMP280 bmp;\n\nvoid setup() {\n  bmp.begin(0x76);\n}\n\nvoid loop() {\n  Serial.print("Pression: "); Serial.print(bmp.readPressure()/100); Serial.println(" hPa");\n  Serial.print("Temp: "); Serial.print(bmp.readTemperature()); Serial.println(" °C");\n  delay(1000);\n}',
                libraries: ['Adafruit_BMP280']
            },
            {
                id: 'ds18b20',
                name: 'DS18B20 Température Numérique',
                voltage: '3-5.5V',
                interface: '1-Wire',
                accuracy: '±0.5°C',
                price: 1.80,
                buyLink: 'https://www.amazon.fr/s?k=ds18b20+capteur+temperature+etanche',
                symbole: 'images/composants/Capteurs-Avances/ds18b20/symbole/symbole.png',
                description: 'Capteur de température numérique étanche, très précis. Bus 1-Wire permet plusieurs capteurs sur une broche.',
                usage: 'Aquariophilie, chauffage, climatisation, monitoring température précise.',
                pinout: 'GND : masse (noir)\nVDD : 3-5V (rouge)\nDQ : données 1-Wire (jaune) + résistance pull-up 4.7kΩ',
                pinoutFolder: 'images/composants/Capteurs-Avances/ds18b20/brochage',
                footprint: 'TO-92 (transistor) ou étanche inox Ø6mm',
                footprintFolder: 'images/composants/Capteurs-Avances/ds18b20/empreinte',
                formula: 'Plage : -55 à +125°C\nPrécision : ±0.5°C (-10 à +85°C)\nRésolution : 9 à 12 bits (0.5°C à 0.0625°C)\nAdresse unique 64 bits',
                code: '#include <OneWire.h>\n#include <DallasTemperature.h>\n\nOneWire oneWire(2);\nDallasTemperature sensors(&oneWire);\n\nvoid setup() {\n  sensors.begin();\n}\n\nvoid loop() {\n  sensors.requestTemperatures();\n  float temp = sensors.getTempCByIndex(0);\n  Serial.println(temp);\n  delay(1000);\n}',
                libraries: ['OneWire', 'DallasTemperature'],
                warning: 'Résistance pull-up 4.7kΩ obligatoire sur DQ !'
            },
            {
                id: 'pir-hc-sr501',
                name: 'HC-SR501 Détecteur PIR',
                voltage: '4.5-20V',
                output: 'Digital HIGH/LOW',
                range: '3-7m',
                price: 2.00,
                buyLink: 'https://www.amazon.fr/s?k=hc-sr501+capteur+mouvement+pir',
                symbole: 'images/composants/Capteurs-Avances/pir-hc-sr501/symbole/symbole.png',
                description: 'Capteur de mouvement infrarouge passif. Détecte les mouvements humains/animaux.',
                usage: 'Sécurité, éclairage automatique, alarmes, économie d\'énergie.',
                pinout: 'VCC : 5-12V\nOUT : signal digital (HIGH si mouvement)\nGND : masse',
                pinoutFolder: 'images/composants/Capteurs-Avances/pir-hc-sr501/brochage',
                footprint: 'Module : 32 × 24mm\nLentille Fresnel : Ø23mm',
                footprintFolder: 'images/composants/Capteurs-Avances/pir-hc-sr501/empreinte',
                formula: 'Portée : 3-7m (réglable)\nAngle détection : 110°\nDélai : 0.3-200s (réglable)\nModes : répétable / non-répétable',
                code: 'int pirPin = 2;\n\nvoid setup() {\n  pinMode(pirPin, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if(digitalRead(pirPin) == HIGH) {\n    Serial.println("Mouvement détecté !");\n  }\n  delay(100);\n}',
                warning: 'Temps de préchauffage : 60 secondes après mise sous tension.'
            }
        ]
    },
    {
        id: 'actuator',
        folderName: 'Actionneurs',
        name: 'Actionneurs',
        icon: '⚙️',
        description: 'Moteurs, servos, relais',
        components: [
            {
                id: 'sg90',
                name: 'Servo SG90',
                voltage: '4.8-6V',
                torque: '1.8 kg·cm à 4.8V',
                angle: '0-180°',
                price: 2.50,
                buyLink: 'https://www.amazon.fr/s?k=servo+sg90+9g',
                symbole: 'images/composants/Actionneurs/sg90/symbole/symbole.png',
                description: 'Petit servomoteur très populaire, précis et abordable pour les projets Arduino.',
                usage: 'Robotique, bras articulé, volet motorisé, direction RC. Signal PWM 50Hz (20ms), impulsions 1-2ms.',
                pinout: 'Marron/Noir : GND\nRouge : VCC (5V externe recommandé)\nOrange/Jaune : Signal PWM',
                pinoutFolder: 'images/composants/Actionneurs/sg90/brochage',
                footprint: 'Corps: 22.5 × 12 × 29mm\nFixes: 32mm entre trous de montage',
                footprintFolder: 'images/composants/Actionneurs/sg90/empreinte',
                formula: 'Durée (ms) = 1 + (Angle / 180)\nFréquence : 50Hz (période 20ms)',
                calculator: {
                    variables: [
                        {id: 'duree', label: 'Durée impulsion', unit: 'ms', default: 1.5, formula: '1 + (angle / 180)'},
                        {id: 'angle', label: 'Angle', unit: '°', default: 90, formula: '(duree - 1) * 180'}
                    ]
                },
                code: '#include <Servo.h>\nServo servo;\nvoid setup() { servo.attach(9); }\nservo.write(90); // Position 90°'
            },
            {
                id: 'relay-5v',
                name: 'Relais 5V 10A',
                voltage: '5V (bobine)',
                current: '10A max (contact)',
                price: 1.80,
                buyLink: 'https://www.amazon.fr/s?k=module+relais+5v+10a',
                symbole: 'images/composants/Actionneurs/relay-5v/symbole/symbole.png',
                description: 'Relais électromécanique permettant de contrôler des charges AC/DC puissantes.',
                usage: 'Domotique, contrôle de lampes 220V, moteurs puissants, électrovannes. DANGER : 220V !',
                pinout: 'VCC : 5V\nGND : masse\nIN : signal de commande (LOW = activé)\nCOM, NO, NC : contacts de puissance',
                pinoutFolder: 'images/composants/Actionneurs/relay-5v/brochage',
                footprint: 'Module: 50 × 26 × 18mm\nBorniers à vis pour haute tension',
                footprintFolder: 'images/composants/Actionneurs/relay-5v/empreinte',
                formula: 'Courant bobine : I = V / R\nPuissance commutée : P = V × I',
                calculator: {
                    variables: [
                        {id: 'puissance', label: 'Puissance commutée', unit: 'W', default: 220, formula: 'v * i'},
                        {id: 'v', label: 'Tension charge', unit: 'V', default: 220, formula: 'puissance / i'},
                        {id: 'i', label: 'Courant charge', unit: 'A', default: 1, formula: 'puissance / v'}
                    ]
                },
                warning: '⚠️ ATTENTION : Manipuler avec précaution, risque électrique 220V AC !',
                code: 'digitalWrite(relayPin, LOW); // Activer\ndelay(1000);\ndigitalWrite(relayPin, HIGH); // Désactiver'
            },
            {
                id: 'l298n',
                name: 'L298N Pont en H Double',
                voltage: '5-35V (moteurs)',
                current: '2A par canal (3A max)',
                channels: '2 moteurs DC ou 1 stepper',
                price: 3.50,
                buyLink: 'https://www.amazon.fr/s?k=l298n+module+driver+moteur',
                symbole: 'images/composants/Actionneurs/l298n/symbole/symbole.png',
                description: 'Contrôleur double pont en H pour piloter moteurs DC et moteurs pas-à-pas. Très populaire en robotique.',
                usage: 'Robots mobiles, voitures RC, bras robotiques, CNC, contrôle bidirectionnel de moteurs DC 6-12V.',
                pinout: 'Module complet :\nIN1-IN4 : signaux de commande (depuis Arduino)\nENA, ENB : activation PWM vitesse\nOUT1-OUT4 : sorties moteurs\n+12V : alimentation moteurs (5-35V)\nGND : masse commune\n+5V : régulateur intégré (si jumper présent)',
                pinoutFolder: 'images/composants/Actionneurs/l298n/brochage',
                footprint: 'Module : 43 × 43 × 27mm\nBorniers à vis : alimentation + sorties moteurs\nPuissance dissipée : radiateur intégré',
                footprintFolder: 'images/composants/Actionneurs/l298n/empreinte',
                formula: 'Courant max continu : 2A par canal\nCourant crête : 3A\nChute de tension : ~2V (à travers les ponts)\nPuissance dissipée : P = I² × Rds ≈ 1-2W par ampère\nVitesse PWM : 0-255 (analogWrite)',
                calculator: {
                    variables: [
                        {id: 'pmoteur', label: 'Puissance moteur', unit: 'W', default: 15, formula: '(vin - 2) * i'},
                        {id: 'vin', label: 'Tension alimentation', unit: 'V', default: 12, formula: '(pmoteur / i) + 2'},
                        {id: 'i', label: 'Courant moteur', unit: 'A', default: 1.5, formula: 'pmoteur / (vin - 2)'}
                    ]
                },
                code: '// === CONTRÔLE MOTEUR DC AVEC L298N ===\n// Moteur A (OUT1/OUT2)\nint ENA = 9;   // PWM vitesse moteur A\nint IN1 = 8;   // Direction 1\nint IN2 = 7;   // Direction 2\n\n// Moteur B (OUT3/OUT4)\nint ENB = 3;   // PWM vitesse moteur B\nint IN3 = 5;\nint IN4 = 4;\n\nvoid setup() {\n  pinMode(ENA, OUTPUT);\n  pinMode(ENB, OUTPUT);\n  pinMode(IN1, OUTPUT);\n  pinMode(IN2, OUTPUT);\n  pinMode(IN3, OUTPUT);\n  pinMode(IN4, OUTPUT);\n}\n\nvoid loop() {\n  // MOTEUR A : Avant à 70% vitesse\n  digitalWrite(IN1, HIGH);\n  digitalWrite(IN2, LOW);\n  analogWrite(ENA, 180); // 0-255\n  \n  // MOTEUR B : Arrière à 50% vitesse\n  digitalWrite(IN3, LOW);\n  digitalWrite(IN4, HIGH);\n  analogWrite(ENB, 128);\n  \n  delay(2000);\n  \n  // STOP\n  analogWrite(ENA, 0);\n  analogWrite(ENB, 0);\n  delay(1000);\n}\n\n// === FONCTIONS UTILES ===\nvoid motorA(int speed) {\n  // speed : -255 à +255\n  if(speed > 0) {\n    digitalWrite(IN1, HIGH);\n    digitalWrite(IN2, LOW);\n    analogWrite(ENA, speed);\n  } else if(speed < 0) {\n    digitalWrite(IN1, LOW);\n    digitalWrite(IN2, HIGH);\n    analogWrite(ENA, -speed);\n  } else {\n    analogWrite(ENA, 0);\n  }\n}\n\nvoid motorB(int speed) {\n  if(speed > 0) {\n    digitalWrite(IN3, HIGH);\n    digitalWrite(IN4, LOW);\n    analogWrite(ENB, speed);\n  } else if(speed < 0) {\n    digitalWrite(IN3, LOW);\n    digitalWrite(IN4, HIGH);\n    analogWrite(ENB, -speed);\n  } else {\n    analogWrite(ENB, 0);\n  }\n}',
                warning: '⚠️ Ne jamais dépasser 2A par canal en continu ! Ajouter radiateur si moteurs puissants. Diodes de roue libre intégrées.',
                datasheet: 'ST Microelectronics L298N Dual H-Bridge'
            },
            {
                id: '28byj-48',
                name: '28BYJ-48 Moteur Pas-à-Pas + ULN2003',
                voltage: '5-12V',
                steps: '4096 pas/tour (avec réducteur 1:64)',
                price: 3.00,
                buyLink: 'https://www.amazon.fr/s?k=28byj-48+uln2003+moteur+pas+a+pas',
                symbole: 'images/composants/Moteurs-Avances/28byj-48/symbole/symbole.png',
                description: 'Moteur pas-à-pas unipolaire avec driver ULN2003. Très précis, faible coût.',
                usage: 'Positionnement angulaire, horloges, imprimantes, automatisation.',
                pinout: 'Driver ULN2003:\nIN1-IN4 : commandes pas\n+/- : 5-12V alimentation\nCâble moteur : connecteur 5 fils (rouge = +5V)',
                pinoutFolder: 'images/composants/Moteurs-Avances/28byj-48/brochage',
                footprint: 'Moteur : Ø28mm × 19mm L\nArbre : Ø5mm\nModule driver : 35 × 32mm',
                footprintFolder: 'images/composants/Moteurs-Avances/28byj-48/empreinte',
                formula: 'Pas/tour moteur : 64\nRatio réducteur : 1:64\nPas/tour total : 4096 (précision 0.088°)\nCouple : ~300 g·cm à 5V',
                code: '#include <Stepper.h>\nconst int stepsPerRevolution = 2048; // Half-step mode\nStepper stepper(stepsPerRevolution, 8, 10, 9, 11);\n\nvoid setup() {\n  stepper.setSpeed(10); // RPM\n}\n\nvoid loop() {\n  stepper.step(2048);   // 1 tour\n  delay(1000);\n  stepper.step(-2048);  // retour\n  delay(1000);\n}',
                libraries: ['Stepper']
            }
        ]
    },
    {
        id: 'ic',
        folderName: 'Circuits-Integres',
        name: 'Circuits Intégrés',
        icon: '🔲',
        description: 'Puces et modules',
        components: [
            {
                id: '74hc595',
                name: '74HC595 Registre à décalage',
                voltage: '2-6V',
                outputs: '8 sorties',
                price: 0.40,
                buyLink: 'https://www.amazon.fr/s?k=74hc595+shift+register+dip16',
                symbole: 'images/composants/Circuits-Integres/74hc595/symbole/symbole.png',
                description: 'Registre à décalage permettant d\'étendre les sorties numériques avec seulement 3 broches.',
                usage: 'Multiplexage LED, afficheurs 7 segments, expansion GPIO. Cascadable.',
                pinout: 'DS (14) : données série\nSHCP (11) : horloge shift\nSTCP (12) : horloge stockage (latch)\nOE (13) : Output Enable (actif LOW)\nMR (10) : Master Reset (actif LOW)\nQ0-Q7 (15,1-7) : sorties parallèles\nQ7\' (9) : sortie série (cascade)\nVCC (16) : alimentation\nGND (8) : masse',
                pinoutFolder: 'images/composants/Circuits-Integres/74hc595/brochage',
                footprint: 'Boîtier DIP-16\nEspacement des pattes: 2.54mm\nLargeur: 7.62mm\nLongueur: 19.5mm',
                footprintFolder: 'images/composants/Circuits-Integres/74hc595/empreinte',
                formula: 'Nombre de sorties avec N registres : Sorties = 8 × N\nConsommation : ~80 µA par MHz',
                code: 'int latchPin = 8;\nint clockPin = 12;\nint dataPin = 11;\n\nvoid setup() {\n  pinMode(latchPin, OUTPUT);\n  pinMode(clockPin, OUTPUT);\n  pinMode(dataPin, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(latchPin, LOW);\n  shiftOut(dataPin, clockPin, MSBFIRST, 0b10101010);\n  digitalWrite(latchPin, HIGH);\n}'
            },
            {
                id: 'ne555',
                name: 'NE555 Timer Universel',
                voltage: '4.5-16V',
                current: '200mA max sortie',
                frequency: '0.1Hz - 500kHz',
                price: 0.30,
                buyLink: 'https://www.amazon.fr/s?k=ne555+timer+ic+dip8',
                symbole: 'images/composants/Circuits-Integres/ne555/symbole/symbole.png',
                description: 'Le circuit intégré timer le plus populaire au monde. Génère des impulsions, retards, oscillations.',
                usage: 'Oscillateur, clignotant LED, PWM, générateur fréquences, retardateur, sirène.',
                pinout: 'Pin 1 : GND\nPin 2 : Trigger (active à 1/3 Vcc)\nPin 3 : Output (sortie)\nPin 4 : Reset (actif LOW)\nPin 5 : Control Voltage\nPin 6 : Threshold (compare à 2/3 Vcc)\nPin 7 : Discharge\nPin 8 : Vcc (4.5-16V)',
                pinoutFolder: 'images/composants/Circuits-Integres/ne555/brochage',
                footprint: 'Boîtier DIP-8\nEspacement : 2.54mm\nLargeur : 7.62mm',
                footprintFolder: 'images/composants/Circuits-Integres/ne555/empreinte',
                formula: 'Mode astable (oscillateur) :\nFréquence : f = 1.44 / ((R1+2×R2)×C)\nDuty cycle : D = (R1+R2)/(R1+2×R2)\n\nMode monostable (retard) :\nTemps HIGH : T = 1.1 × R × C',
                code: '// OSCILLATEUR SIMPLE (clignotant LED)\n// Montage astable :\n//  Pin 8 (+Vcc) → [10kΩ R1] → Pin 7\n//  Pin 7 → [10kΩ R2] → Pin 6+2\n//  Pin 6+2 → [10µF] → GND\n//  Pin 3 → [330Ω] → LED → GND\n//  Pin 4 → Vcc (Reset)\n//  Pin 1 → GND\n\n// Fréquence : 1.44/((10k+20k)×10µF) = 4.8 Hz\n// LED clignote ~5 fois par seconde\n\n// Aucun Arduino nécessaire !\n// 555 fonctionne de manière autonome.',
                warning: 'Pin 4 (Reset) : toujours connecter à Vcc ! Sinon le timer ne fonctionne pas.'
            },
            {
                id: 'lm358',
                name: 'LM358 Ampli-Op Double',
                voltage: '3-32V single supply',
                bandwidth: '1MHz',
                slew: '0.6V/µs',
                price: 0.50,
                buyLink: 'https://www.amazon.fr/s?k=lm358+dual+op+amp+dip8',
                symbole: 'images/composants/Circuits-Integres/lm358/symbole/symbole.png',
                description: 'Amplificateur opérationnel double, alimentation simple (pas de voltage négatif). Très polyvalent.',
                usage: 'Amplification signal, comparateur, filtres actifs, suiveur, sommateur.',
                pinout: 'Pin 1 : OUT A\nPin 2 : IN- A (inverseur)\nPin 3 : IN+ A (non-inverseur)\nPin 4 : GND\nPin 5 : IN+ B\nPin 6 : IN- B\nPin 7 : OUT B\nPin 8 : Vcc',
                pinoutFolder: 'images/composants/Circuits-Integres/lm358/brochage',
                footprint: 'Boîtier DIP-8\nDeux ampli-op indépendants',
                footprintFolder: 'images/composants/Circuits-Integres/lm358/empreinte',
                formula: 'Gain non-inverseur : G = 1 + (Rf/R1)\nGain inverseur : G = -(Rf/R1)\nSuiveur : G = 1 (buffer)\nComparateur : Vout = HIGH si V+ > V-',
                code: '// === COMPARATEUR SIMPLE (détecteur seuil) ===\n// Compare signal capteur à 2.5V\n\n// MONTAGE :\n//  LM358 Pin 8 → 5V\n//  LM358 Pin 4 → GND\n//  Pin 3 (IN+) → Capteur (0-5V)\n//  Pin 2 (IN-) → Diviseur 2.5V (10kΩ + 10kΩ)\n//  Pin 1 (OUT) → Arduino Pin 7\n\nint seuil = 7;\nvoid setup() {\n  pinMode(seuil, INPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if(digitalRead(seuil)) {\n    Serial.println("Capteur > 2.5V");\n  } else {\n    Serial.println("Capteur < 2.5V");\n  }\n  delay(100);\n}',
                warning: 'Rail-to-rail limité : sortie ne va pas complètement à GND/Vcc.'
            },
            {
                id: 'uln2003',
                name: 'ULN2003 Driver Darlington',
                voltage: '50V max',
                current: '500mA par canal (7 canaux)',
                channels: '7 drivers indépendants',
                price: 0.60,
                buyLink: 'https://www.amazon.fr/s?k=uln2003+darlington+array+dip16',
                symbole: 'images/composants/Circuits-Integres/uln2003/symbole/symbole.png',
                description: 'Array de 7 transistors Darlington. Pilote charges inductives (moteurs, relais, LEDs haute puissance).',
                usage: 'Moteur pas-à-pas 28BYJ-48, relais multiples, LEDs haute puissance, solénoïdes.',
                pinout: 'Pin 1-7 : Entrées (compatible 5V)\nPin 8 : GND (commun)\nPin 9 : COM (commun sorties, diodes retour)\nPin 10-16 : Sorties (collecteurs ouverts)',
                pinoutFolder: 'images/composants/Circuits-Integres/uln2003/brochage',
                footprint: 'Boîtier DIP-16\n7 canaux indépendants\nDiodes de roue libre intégrées',
                footprintFolder: 'images/composants/Circuits-Integres/uln2003/empreinte',
                formula: 'Courant max par canal : 500mA\nCourant total : 2.5A max\nChute tension : ~1V (Darlington)\nGain typique : 1000 (10µA → 10mA)',
                code: '// === MOTEUR PAS-À-PAS 28BYJ-48 ===\n#include <Stepper.h>\n\nconst int stepsPerRev = 2048; // 28BYJ-48\nStepper motor(stepsPerRev, 8, 10, 9, 11);\n\nvoid setup() {\n  motor.setSpeed(10); // 10 RPM\n}\n\nvoid loop() {\n  motor.step(2048);  // 1 tour horaire\n  delay(500);\n  motor.step(-2048); // 1 tour anti-horaire\n  delay(500);\n}\n\n// MONTAGE ULN2003 :\n//  Arduino 8,9,10,11 → ULN2003 IN1-4\n//  ULN2003 OUT1-4 → Moteur coils\n//  ULN2003 COM → +5V moteur\n//  ULN2003 GND → GND commun',
                libraries: ['Stepper'],
                warning: 'COM (pin 9) DOIT être connecté à l\'alimentation des charges inductives !'
            },
            {
                id: 'lm393',
                name: 'LM393 Comparateur Double',
                voltage: '2-36V',
                current: '20mA sortie',
                response: '1.3µs (ultra-rapide)',
                price: 0.40,
                buyLink: 'https://www.amazon.fr/s?k=lm393+dual+comparator+dip8',
                symbole: 'images/composants/Circuits-Integres/lm393/symbole/symbole.png',
                description: 'Comparateur de tension double, collecteur ouvert. Plus rapide qu\'ampli-op pour comparaisons.',
                usage: 'Détection seuil, trigger Schmitt, oscillateur, détecteur zéro-crossing.',
                pinout: 'Pin 1 : OUT A (collecteur ouvert)\nPin 2 : IN- A\nPin 3 : IN+ A\nPin 4 : GND\nPin 5 : IN+ B\nPin 6 : IN- B\nPin 7 : OUT B (collecteur ouvert)\nPin 8 : Vcc',
                pinoutFolder: 'images/composants/Circuits-Integres/lm393/brochage',
                footprint: 'Boîtier DIP-8\nSortie collecteur ouvert (pull-up nécessaire)',
                footprintFolder: 'images/composants/Circuits-Integres/lm393/empreinte',
                formula: 'Si V+ > V- : sortie OPEN (HIGH avec pull-up)\nSi V+ < V- : sortie GND (LOW)\nRésistance pull-up : 10kΩ typique\nHystérésis Schmitt : R1/(R1+R2) × Vcc',
                code: '// === DÉTECTEUR LUMINOSITÉ (avec LDR) ===\nint ldrPin = A0;\nint comparatorPin = 7; // Sortie LM393\nint ledPin = 13;\n\nvoid setup() {\n  pinMode(comparatorPin, INPUT);\n  pinMode(ledPin, OUTPUT);\n  Serial.begin(9600);\n}\n\nvoid loop() {\n  if(digitalRead(comparatorPin) == LOW) {\n    digitalWrite(ledPin, HIGH); // Sombre détecté\n    Serial.println("SOMBRE");\n  } else {\n    digitalWrite(ledPin, LOW);\n    Serial.println("LUMINEUX");\n  }\n  delay(200);\n}\n\n// MONTAGE :\n//  LDR + 10kΩ diviseur → LM393 Pin 3 (IN+)\n//  Potentiomètre seuil → LM393 Pin 2 (IN-)\n//  LM393 Pin 1 (OUT) → [10kΩ pull-up] → 5V\n//  LM393 Pin 1 → Arduino Pin 7',
                warning: 'Sortie collecteur ouvert : résistance pull-up 10kΩ OBLIGATOIRE vers Vcc !'
            },
            {
                id: 'cd4017',
                name: 'CD4017 Compteur Décade',
                voltage: '3-15V',
                outputs: '10 sorties séquentielles',
                frequency: '5MHz max',
                price: 0.50,
                buyLink: 'https://www.amazon.fr/s?k=cd4017+decade+counter+dip16',
                symbole: 'images/composants/Circuits-Integres/cd4017/symbole/symbole.png',
                description: 'Compteur décade Johnson avec 10 sorties décodées. Séquenceur ultra-simple.',
                usage: 'Séquenceur LED, chenillard, compteur visuel, jeu électronique, division fréquence.',
                pinout: 'Pin 14 : CLK (horloge)\nPin 13 : Enable (actif LOW)\nPin 15 : Reset\nPin 12 : CO (carry out, /10)\nPin 3,2,4,7,10,1,5,6,9,11 : Q0-Q9 (sorties)\nPin 8 : GND\nPin 16 : Vcc',
                pinoutFolder: 'images/composants/Circuits-Integres/cd4017/brochage',
                footprint: 'Boîtier DIP-16\nLogique CMOS',
                footprintFolder: 'images/composants/Circuits-Integres/cd4017/empreinte',
                formula: 'Horloge → active sortie suivante à chaque front montant\nReset : HIGH → retour à Q0\nCarry Out : pulse tous les 10 clocks (division par 10)',
                code: '// === CHENILLARD 555 + CD4017 ===\n// Montage sans Arduino !\n\n// NE555 en astable → CLK du CD4017\n// 10 LED connectées aux sorties Q0-Q9\n\n// Fréquence 555 : 1.44/((R1+2×R2)×C)\n// Exemple : R1=10k, R2=47k, C=10µF\n// f = 1.44/((10k+94k)×10µF) ≈ 1.4 Hz\n\n// MONTAGE CD4017 :\n//  Pin 14 (CLK) ← NE555 Pin 3\n//  Pin 13 (EN) → GND (toujours actif)\n//  Pin 15 (RST) → GND (pas de reset)\n//  Pins Q0-Q9 → [330Ω] → LED → GND\n\n// Effet : chenillard automatique, 1 LED allumée\n// à la fois, rotation continue !',
                warning: 'Pin 13 (Enable) : connecter à GND pour activer. HIGH = désactivé !'
            }
        ]
    },
    // Catégories sans dossiers d'images (commentées temporairement)
    /*
    {
        id: 'display',
        folderName: 'Afficheurs',
        name: 'Afficheurs',
        icon: '📺',
        description: 'Écrans LCD, OLED et afficheurs',
        components: [
            {
                id: 'lcd-16x2-i2c',
                name: 'LCD 16×2 I2C',
                voltage: '5V',
                interface: 'I2C (adresse 0x27 ou 0x3F)',
                price: 4.50,
                buyLink: 'https://www.amazon.fr/s?k=lcd+16x2+i2c+1602+arduino',
                symbole: 'images/composants/Afficheurs/lcd-16x2-i2c/symbole/symbole.png',
                description: 'Écran LCD 2 lignes de 16 caractères avec interface I2C (seulement 4 fils nécessaires).',
                usage: 'Affichage de texte, menus, données capteurs, interface utilisateur. Très populaire dans les projets Arduino.',
                pinout: 'GND : masse\nVCC : 5V\nSDA : données I2C (A4 sur Uno)\nSCL : horloge I2C (A5 sur Uno)',
                pinoutFolder: 'images/composants/Afficheurs/lcd-16x2-i2c/brochage',
                footprint: 'Dimensions: 80 × 36 × 13mm\n4 trous de fixation M3',
                footprintFolder: 'images/composants/Afficheurs/lcd-16x2-i2c/empreinte',
                formula: 'Adresses I2C communes : 0x27, 0x3F\nVitesse I2C : 100kHz (standard)\nCaractères affichables : 16×2 = 32',
                code: '#include <LiquidCrystal_I2C.h>\nLiquidCrystal_I2C lcd(0x27, 16, 2);\n\nvoid setup() {\n  lcd.init();\n  lcd.backlight();\n  lcd.print("Hello World!");\n}\n\nvoid loop() {\n  lcd.setCursor(0, 1);\n  lcd.print(millis()/1000);\n  delay(100);\n}',
                libraries: ['LiquidCrystal_I2C'],
                datasheet: 'Standard HD44780 compatible'
            },
            {
                id: 'oled-128x64',
                name: 'OLED 128×64 I2C/SPI',
                voltage: '3.3-5V',
                interface: 'I2C ou SPI',
                resolution: '128×64 pixels',
                price: 5.00,
                buyLink: 'https://www.amazon.fr/s?k=oled+128x64+i2c+ssd1306',
                symbole: 'images/composants/Afficheurs/oled-128x64/symbole/symbole.png',
                description: 'Écran OLED graphique monochrome haute résolution. Contraste élevé, faible consommation.',
                usage: 'Affichage graphique, texte, images, menus, données. Idéal pour les projets portables.',
                pinout: 'Mode I2C:\nGND : masse\nVCC : 3.3-5V\nSCL : horloge I2C\nSDA : données I2C',
                pinoutFolder: 'images/composants/Afficheurs/oled-128x64/brochage',
                footprint: 'Dimensions écran: 27 × 27mm\nZone active: 128×64 pixels\nModule: 35 × 35mm',
                footprintFolder: 'images/composants/Afficheurs/oled-128x64/empreinte',
                formula: 'Résolution : 128×64 = 8192 pixels\nConsommation : ~20mA (écran allumé)\nAdresse I2C : 0x3C ou 0x3D',
                code: '#include <Adafruit_SSD1306.h>\n#include <Adafruit_GFX.h>\n\nAdafruit_SSD1306 display(128, 64, &Wire, -1);\n\nvoid setup() {\n  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);\n  display.clearDisplay();\n  display.setTextSize(2);\n  display.setTextColor(WHITE);\n  display.setCursor(0, 0);\n  display.println("OLED OK!");\n  display.display();\n}',
                libraries: ['Adafruit_SSD1306', 'Adafruit_GFX']
            },
            {
                id: '7segment-4digit',
                name: 'Afficheur 7 segments 4 chiffres',
                voltage: '5V',
                type: 'Cathode commune / Anode commune',
                price: 2.50,
                buyLink: 'https://www.amazon.fr/s?k=afficheur+7+segments+tm1637',
                symbole: 'images/composants/Afficheurs/7segment-4digit/symbole/symbole.png',
                description: 'Afficheur numérique 4 chiffres à 7 segments. Nécessite multiplexage ou driver TM1637.',
                usage: 'Affichage de nombres, horloges, compteurs, températures.',
                pinout: 'Version TM1637:\nCLK : horloge\nDIO : données\nVCC : 5V\nGND : masse',
                pinoutFolder: 'images/composants/Afficheurs/7segment-4digit/brochage',
                footprint: 'Dimensions: 42 × 24 × 12mm\nHauteur chiffres: 0.56"',
                footprintFolder: 'images/composants/Afficheurs/7segment-4digit/empreinte',
                formula: 'Courant par segment : ~20mA\nMultiplexage : 1 chiffre actif à la fois\nFréquence refresh : >50Hz pour éviter scintillement',
                code: '#include <TM1637Display.h>\n\nTM1637Display display(CLK, DIO);\n\nvoid setup() {\n  display.setBrightness(0x0f);\n}\n\nvoid loop() {\n  display.showNumberDec(1234);\n  delay(1000);\n}',
                libraries: ['TM1637Display']
            }
        ]
    },
    {
        id: 'communication',
        folderName: 'Communication',
        name: 'Communication',
        icon: '📡',
        description: 'Modules WiFi, Bluetooth, RF',
        components: [
            {
                id: 'esp8266',
                name: 'ESP8266 WiFi',
                voltage: '3.3V',
                interface: 'UART, SPI, I2C',
                price: 4.00,
                buyLink: 'https://www.amazon.fr/s?k=esp8266+nodemcu+wifi',
                symbole: 'images/composants/Communication/esp8266/symbole/symbole.png',
                description: 'Module WiFi low-cost avec microcontrôleur intégré. Peut fonctionner de manière autonome.',
                usage: 'IoT, serveur web, client HTTP, MQTT, connexion WiFi pour Arduino.',
                pinout: 'VCC : 3.3V (max 250mA)\nGND : masse\nTX : transmit UART\nRX : receive UART\nCH_PD : chip enable (HIGH)\nGPIO : broches d\'entrée/sortie',
                pinoutFolder: 'images/composants/Communication/esp8266/brochage',
                footprint: 'Module ESP-01 : 24.75 × 14.5mm\nESP-12E/F : 24 × 16mm',
                footprintFolder: 'images/composants/Communication/esp8266/empreinte',
                formula: 'Portée WiFi : ~100m (champ libre)\nConsommation : 80mA actif, 20µA deep sleep\nFréquence : 2.4GHz (802.11 b/g/n)',
                code: '#include <ESP8266WiFi.h>\n\nconst char* ssid = "MonWiFi";\nconst char* password = "motdepasse";\n\nvoid setup() {\n  WiFi.begin(ssid, password);\n  while (WiFi.status() != WL_CONNECTED) delay(500);\n  Serial.println(WiFi.localIP());\n}',
                libraries: ['ESP8266WiFi'],
                warning: '⚠️ Alimentation 3.3V UNIQUEMENT ! 5V détruira le module.'
            },
            {
                id: 'hc-05',
                name: 'HC-05 Bluetooth',
                voltage: '3.6-6V',
                interface: 'UART',
                range: '~10m',
                price: 5.00,
                buyLink: 'https://www.amazon.fr/s?k=hc-05+module+bluetooth+uart',
                symbole: 'images/composants/Communication/hc-05/symbole/symbole.png',
                description: 'Module Bluetooth 2.0 SPP maître/esclave. Communication série sans fil facile.',
                usage: 'Contrôle sans fil Arduino, transmission de données, télécommande smartphone.',
                pinout: 'VCC : 3.6-6V\nGND : masse\nTXD : transmit (vers RX Arduino)\nRXD : receive (vers TX Arduino via diviseur tension!)\nSTATE : état connexion\nEN/KEY : mode AT (config)',
                pinoutFolder: 'images/composants/Communication/hc-05/brochage',
                footprint: 'Module: 36.5 × 15.5mm\nEspacement des pattes: 2.0mm',
                footprintFolder: 'images/composants/Communication/hc-05/empreinte',
                formula: 'Baud rate défaut : 9600 bps\nPortée : ~10m (sans obstacle)\nConsommation : 30-40mA actif',
                code: '#include <SoftwareSerial.h>\nSoftwareSerial BT(10, 11); // RX, TX\n\nvoid setup() {\n  Serial.begin(9600);\n  BT.begin(9600);\n}\n\nvoid loop() {\n  if(BT.available()) Serial.write(BT.read());\n  if(Serial.available()) BT.write(Serial.read());\n}',
                libraries: ['SoftwareSerial'],
                warning: '⚠️ RXD du HC-05 supporte max 3.3V ! Utiliser diviseur de tension avec Arduino 5V.'
            },
            {
                id: 'nrf24l01',
                name: 'nRF24L01+ Radio 2.4GHz',
                voltage: '1.9-3.6V',
                interface: 'SPI',
                range: '~100m (avec antenne PA+LNA)',
                price: 2.50,
                buyLink: 'https://www.amazon.fr/s?k=nrf24l01+module+radio+2.4ghz',
                symbole: 'images/composants/Communication/nrf24l01/symbole/symbole.png',
                description: 'Module radio 2.4GHz bidirectionnel. Communication longue portée, faible consommation.',
                usage: 'Télécommande RC, réseau mesh, transmission de données, domotique.',
                pinout: 'VCC : 3.3V\nGND : masse\nCE : chip enable\nCSN : chip select\nSCK : SPI clock\nMOSI : SPI MOSI\nMISO : SPI MISO\nIRQ : interrupt (optionnel)',
                pinoutFolder: 'images/composants/Communication/nrf24l01/brochage',
                footprint: 'Module standard : 29 × 15mm\nPA+LNA : 36 × 16mm + antenne',
                footprintFolder: 'images/composants/Communication/nrf24l01/empreinte',
                formula: 'Portée : 100m (module amplifié)\nDébit : 250kbps à 2Mbps\nCanaux : 126 canaux (2.4-2.525 GHz)\nConsommation : 11.3mA RX, 7mA TX (0dBm)',
                code: '#include <RF24.h>\nRF24 radio(7, 8); // CE, CSN\nconst byte address[6] = "00001";\n\nvoid setup() {\n  radio.begin();\n  radio.openWritingPipe(address);\n  radio.setPALevel(RF24_PA_MIN);\n  radio.stopListening();\n}\n\nvoid loop() {\n  const char text[] = "Hello";\n  radio.write(&text, sizeof(text));\n  delay(1000);\n}',
                libraries: ['RF24'],
                warning: '⚠️ Alimenter en 3.3V ! Ajouter condensateur 10µF près du module.'
            }
        ]
    },
    {
        id: 'power',
        folderName: 'Alimentation',
        name: 'Alimentation',
        icon: '🔌',
        description: 'Régulateurs et gestion de l\'énergie',
        components: [
            {
                id: 'lm7805',
                name: 'LM7805 Régulateur 5V',
                voltage: '7-35V (entrée) → 5V (sortie)',
                current: '1.5A max',
                price: 0.50,
                buyLink: 'https://www.amazon.fr/s?k=lm7805+regulateur+5v+to220',
                symbole: 'images/composants/Alimentation/lm7805/symbole/symbole.png',
                description: 'Régulateur de tension linéaire 5V très populaire. Simple et fiable.',
                usage: 'Alimentation stabilisée 5V pour Arduino, capteurs, circuits logiques.',
                pinout: 'PIN 1 (gauche) : Entrée (Vin)\nPIN 2 (milieu) : Masse (GND)\nPIN 3 (droite) : Sortie 5V (Vout)',
                pinoutFolder: 'images/composants/Alimentation/lm7805/brochage',
                footprint: 'Boîtier TO-220\nEspacement des pattes: 2.54mm\nTrou de fixation : M3',
                footprintFolder: 'images/composants/Alimentation/lm7805/empreinte',
                formula: 'Chute de tension minimale : 2V\nPuissance dissipée : P = (Vin-Vout) × I\nCondensateurs recommandés : 100nF sortie + 330nF entrée',
                code: '// Pas de code, composant passif\n// Montage typique :\n// Vin (7-12V) → LM7805 → 5V stabilisé\n// Ajouter condensateur 100nF en sortie',
                warning: '⚠️ Dissipe beaucoup de chaleur ! Ajouter radiateur si I > 500mA.'
            },
            {
                id: 'ams1117-3v3',
                name: 'AMS1117-3.3V',
                voltage: '4.5-15V (entrée) → 3.3V (sortie)',
                current: '1A max',
                price: 0.40,
                buyLink: 'https://www.amazon.fr/s?k=ams1117+3.3v+regulateur+ldo',
                symbole: 'images/composants/Alimentation/ams1117-3v3/symbole/symbole.png',
                description: 'Régulateur low-dropout (LDO) 3.3V compact.',
                usage: 'Alimentation 3.3V pour ESP32, capteurs, modules RF.',
                pinout: 'GND : masse (pin central)\nVout : 3.3V sortie\nVin : entrée (4.5-15V)',
                pinoutFolder: 'images/composants/Alimentation/ams1117-3v3/brochage',
                footprint: 'Boîtier SOT-223 ou TO-252',
                footprintFolder: 'images/composants/Alimentation/ams1117-3v3/empreinte',
                formula: 'Dropout voltage : 1.2V typ.\nPuissance dissipée : P = (Vin-3.3) × I\nCondensateur sortie : 22µF minimum',
                code: '// Composant passif\n// Idéal pour alimenter ESP8266/ESP32',
                warning: 'Attention au pinout : différent selon boîtier !'
            },
            {
                id: 'tp4056',
                name: 'TP4056 Chargeur Li-ion',
                voltage: '4.5-8V USB',
                current: '1A (configurable)',
                price: 1.00,
                buyLink: 'https://www.amazon.fr/s?k=tp4056+module+chargeur+batterie+lithium',
                symbole: 'images/composants/Alimentation/tp4056/symbole/symbole.png',
                description: 'Module de charge pour batterie Li-ion/Li-Po 18650. Protection intégrée.',
                usage: 'Chargeur USB pour projets portables, power banks DIY.',
                pinout: 'IN+ / IN- : entrée 5V USB\nB+ / B- : batterie Li-ion\nOUT+ / OUT- : sortie protégée',
                pinoutFolder: 'images/composants/Alimentation/tp4056/brochage',
                footprint: 'Module: 26 × 17mm',
                footprintFolder: 'images/composants/Alimentation/tp4056/empreinte',
                formula: 'Tension charge : 4.2V\nCourant charge : réglable par résistance (1A défaut)\nProtection : surchauffe, surcharge, décharge profonde',
                code: '// Aucun code nécessaire\n// Brancher batterie 18650\n// Alimenter en 5V USB\n// LED rouge : charge en cours\n// LED bleue : charge terminée',
                warning: '⚠️ Batteries Li-ion dangereuses si mal utilisées ! Ne jamais court-circuiter.'
            }
        ]
    },
    {
        id: 'semiconductors',
        folderName: 'Semi-Conducteurs',
        name: 'Semi-Conducteurs de Puissance',
        icon: '⚡',
        description: 'MOSFETs, transistors, thyristors de puissance',
        components: [
            {
                id: 'irf520',
                name: 'IRF520 MOSFET N',
                voltage: '100V max (Drain-Source)',
                current: '9.2A',
                price: 0.80,
                buyLink: 'https://www.amazon.fr/s?k=irf520+mosfet+n-channel+to220',
                symbole: 'images/composants/Moteurs-Avances/irf520/symbole/symbole.png',
                description: 'Transistor MOSFET de puissance. Commutation de charges lourdes avec signal Arduino.',
                usage: 'Contrôle moteurs DC, bandes LED 12V, électrovannes, charges inductives.',
                pinout: 'Gate : commande (depuis Arduino)\nDrain : charge (+)\nSource : charge (-) vers GND',
                pinoutFolder: 'images/composants/Moteurs-Avances/irf520/brochage',
                footprint: 'Boîtier TO-220\nEspacement pattes : 2.54mm\nTrou fixation : M3',
                footprintFolder: 'images/composants/Moteurs-Avances/irf520/empreinte',
                formula: 'VGS(th) : 2-4V (tension seuil)\nRDS(on) : 0.27Ω (à VGS=10V)\nPuissance max : 40W (avec radiateur)',
                code: 'int mosfetPin = 9;\n\nvoid setup() {\n  pinMode(mosfetPin, OUTPUT);\n}\n\nvoid loop() {\n  // PWM pour contrôle vitesse\n  analogWrite(mosfetPin, 128); // 50%\n  delay(2000);\n  analogWrite(mosfetPin, 255); // 100%\n  delay(2000);\n}',
                warning: '⚠️ Diode de roue libre obligatoire avec charges inductives ! Radiateur si I > 2A.'
            }
        ]
    },
    {
        id: 'transistors-diodes',
        folderName: 'Transistors-Diodes',
        name: 'Transistors & Diodes',
        icon: '🔺',
        description: 'Composants semi-conducteurs discrets',
        components: [
            {
                id: '2n2222',
                name: '2N2222 Transistor NPN',
                voltage: '40V max (Vce)',
                current: '800mA max (Ic)',
                gain: 'hFE 100-300',
                price: 0.10,
                buyLink: 'https://www.amazon.fr/s?k=2n2222+transistor+npn+to92',
                symbole: 'images/composants/Transistors-Diodes/2n2222/symbole/symbole.png',
                description: 'Transistor bipolaire NPN usage général. Amplification et commutation.',
                usage: 'Commande de relais, LED, buzzers, petits moteurs. Amplification audio.',
                pinout: 'E : émetteur (GND)\nB : base (résistance depuis Arduino)\nC : collecteur (charge)',
                pinoutFolder: 'images/composants/Transistors-Diodes/2n2222/brochage',
                footprint: 'Boîtier TO-92\nEspacement pattes : 2.54mm',
                footprintFolder: 'images/composants/Transistors-Diodes/2n2222/empreinte',
                formula: 'Saturation : Vce(sat) ~0.3V\nBase-émetteur : Vbe ~0.7V\nRésistance base : Rb = (Vcc - 0.7) / (Ic / hFE)\nPuissance max : 500mW',
                code: 'int basePin = 7;\nint load = 12; // LED, relais...\n\nvoid setup() {\n  pinMode(basePin, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(basePin, HIGH); // Transistor saturé\n  delay(1000);\n  digitalWrite(basePin, LOW);  // Transistor bloqué\n  delay(1000);\n}\n\n// Calcul résistance base :\n// Ic = 100mA, hFE = 100\n// Ib = Ic/hFE = 1mA\n// Rb = (5 - 0.7)/0.001 = 4.3kΩ → utiliser 4.7kΩ'
            },
            {
                id: 'bc547',
                name: 'BC547 Transistor NPN',
                voltage: '45V max',
                current: '100mA max',
                gain: 'hFE 110-800',
                price: 0.08,
                buyLink: 'https://www.amazon.fr/s?k=bc547+transistor+npn+to92',
                symbole: 'images/composants/Transistors-Diodes/bc547/symbole/symbole.png',
                description: 'Transistor NPN petits signaux. Très répandu, faible coût.',
                usage: 'Commutation de LED, pilotage de transistors Darlington, amplification.',
                pinout: 'C : collecteur\nB : base\nE : émetteur\n(vue de face, pattes vers bas)',
                pinoutFolder: 'images/composants/Transistors-Diodes/bc547/brochage',
                footprint: 'Boîtier TO-92\nPattes : C-B-E',
                footprintFolder: 'images/composants/Transistors-Diodes/bc547/empreinte',
                formula: 'Vce(sat) : 0.2V typ.\nVbe : 0.7V\nFréquence transition : 300MHz\nIdéal pour charges < 100mA',
                code: '// Identique au 2N2222\n// Utilisé pour charges plus faibles\nint transistorPin = 8;\n\nvoid setup() {\n  pinMode(transistorPin, OUTPUT);\n}\n\nvoid loop() {\n  analogWrite(transistorPin, 128); // PWM 50%\n}'
            },
            {
                id: '1n4007',
                name: '1N4007 Diode de Redressement',
                voltage: '1000V (PIV)',
                current: '1A',
                forward: 'Vf 1.1V @ 1A',
                price: 0.05,
                buyLink: 'https://www.amazon.fr/s?k=1n4007+diode+redressement+1a',
                symbole: 'images/composants/Transistors-Diodes/1n4007/symbole/symbole.png',
                description: 'Diode de redressement classique. Protection, redressement, roue libre.',
                usage: 'Diode de roue libre (moteurs, relais), redressement AC→DC, protection polarité.',
                pinout: 'Anode : anneau absent\nCathode : anneau noir (vers +)',
                pinoutFolder: 'images/composants/Transistors-Diodes/1n4007/brochage',
                footprint: 'Boîtier DO-41\nLongueur : 5.2mm\nDiamètre : 2.7mm',
                footprintFolder: 'images/composants/Transistors-Diodes/1n4007/empreinte',
                formula: 'Chute de tension : ~1V (forward)\nCourant inverse : <5µA\nTemps de récupération : 30µs\nUsage : diode de roue libre obligatoire avec inductances !',
                code: '// Pas de code - composant passif\n// MONTAGE ROUE LIBRE :\n// Moteur DC ou relais :\n//   [+12V] → [Bobine] → [MOSFET] → [GND]\n//                ↓\n//            [1N4007 cathode vers +12V]\n//                ↓\n//              [GND]\n\n// Protection contre retour de tension inductif',
                warning: 'Respecter polarité : cathode (anneau) vers potentiel POSITIF pour roue libre !'
            },
            {
                id: '1n4148',
                name: '1N4148 Diode Signal Rapide',
                voltage: '100V',
                current: '200mA',
                speed: '4ns (temps de commutation)',
                price: 0.05,
                buyLink: 'https://www.amazon.fr/s?k=1n4148+diode+signal+rapide',
                symbole: 'images/composants/Transistors-Diodes/1n4148/symbole/symbole.png',
                description: 'Diode de signal rapide. Commutation ultra-rapide pour applications hautes fréquences.',
                usage: 'Circuits logiques, décodage, protection, clamping, signaux RF.',
                pinout: 'Anode : côté sans marquage\nCathode : anneau noir',
                pinoutFolder: 'images/composants/Transistors-Diodes/1n4148/brochage',
                footprint: 'Boîtier DO-35\nLongueur : 3.6mm\nDiamètre : 2mm',
                footprintFolder: 'images/composants/Transistors-Diodes/1n4148/empreinte',
                formula: 'Vf : 1V @ 10mA\nTemps récupération : 4ns\nCapacité jonction : 2pF\nIdéal pour signaux rapides',
                code: '// Protection ESD sur entrées\n// Clavier matriciel anti-ghosting\n// Pas de code spécifique'
            },
            {
                id: 'zener-5v1',
                name: 'Diode Zener 5.1V (1N4733)',
                voltage: '5.1V (tension Zener)',
                power: '1W',
                tolerance: '±5%',
                price: 0.15,
                buyLink: 'https://www.amazon.fr/s?k=diode+zener+5.1v+1w',
                symbole: 'images/composants/Transistors-Diodes/zener-5v1/symbole/symbole.png',
                description: 'Diode Zener pour régulation et protection de tension.',
                usage: 'Protection surtension, régulation grossière, référence de tension.',
                pinout: 'Cathode : anneau (vers tension à réguler)\nAnode : vers GND via résistance',
                pinoutFolder: 'images/composants/Transistors-Diodes/zener-5v1/brochage',
                footprint: 'DO-41 (1W)\nPuissance dissipée : P = Iz × Vz',
                footprintFolder: 'images/composants/Transistors-Diodes/zener-5v1/empreinte',
                formula: 'Tension Zener : 5.1V nominal\nRésistance série : R = (Vin - Vz) / Iz\nCourant Zener min : 5mA (pour stabilité)\nPuissance max : 1W',
                code: '// Circuit protection 5V\n// Si Vin > 5.1V → Zener conduit et limite\n\n// MONTAGE :\n//  [Vin] → [Résistance] → [Vout 5V]\n//                           |\n//                      [Zener 5.1V cathode]\n//                           |\n//                         [GND]\n\n// Exemple : Vin=9V, Iload=50mA\n// R = (9-5.1)/(0.05+0.01) = 65Ω → 68Ω\n// P_zener = 5.1×0.01 = 51mW OK'
            },
            {
                id: '1n5819',
                name: '1N5819 Diode Schottky',
                voltage: '40V',
                current: '1A',
                forward: 'Vf 0.4V @ 1A (très faible !)',
                price: 0.15,
                buyLink: 'https://www.amazon.fr/s?k=1n5819+diode+schottky+1a',
                symbole: 'images/composants/Transistors-Diodes/1n5819/symbole/symbole.png',
                description: 'Diode Schottky à faible chute de tension. Idéale pour alimentations et haute fréquence.',
                usage: 'Protection polarité inversée, redressement basse tension (3.3V, 5V), alimentations à découpage.',
                pinout: 'Anode : pas d\'anneau\nCathode : anneau (vers +)',
                pinoutFolder: 'images/composants/Transistors-Diodes/1n5819/brochage',
                footprint: 'Boîtier DO-41\nSimilaire à 1N4007',
                footprintFolder: 'images/composants/Transistors-Diodes/1n5819/empreinte',
                formula: 'Chute tension : 0.4V (vs 1V pour 1N4007)\nTemps récupération : <10ns (très rapide)\nRendement : +60% par rapport à diode classique\nUsage : circuits basse tension où chaque volt compte',
                code: '// Protection polarité inversée\n// Montage série avec alimentation :\n//  [+Vin] → [1N5819 anode→cathode] → [+Vout]\n//  Perte seulement 0.4V au lieu de 1V\n\n// Idéal pour circuit 5V sur batterie\n// Économise 0.6V par rapport à 1N4007',
                warning: 'Attention : tension inverse limitée (40V max) ! Ne pas utiliser sur secteur 220V.'
            },
            {
                id: '2n2907',
                name: '2N2907 Transistor PNP',
                voltage: '60V max',
                current: '600mA max',
                gain: 'hFE 100-300',
                price: 0.12,
                buyLink: 'https://www.amazon.fr/s?k=2n2907+transistor+pnp+to92',
                symbole: 'images/composants/Transistors-Diodes/2n2907/symbole/symbole.png',
                description: 'Transistor bipolaire PNP complémentaire du 2N2222. Commutation côté +.',
                usage: 'Commutation high-side, inverseur, push-pull, circuits complémentaires.',
                pinout: 'E : émetteur (vers +Vcc)\nB : base (résistance vers commande)\nC : collecteur (charge)',
                pinoutFolder: 'images/composants/Transistors-Diodes/2n2907/brochage',
                footprint: 'Boîtier TO-92\nComplémentaire du 2N2222',
                footprintFolder: 'images/composants/Transistors-Diodes/2n2907/empreinte',
                formula: 'PNP : conduit quand base < émetteur\nVeb : ~0.7V (inverse du NPN)\nSaturation : base à 0V = ON\nUtilisation : commutation côté +',
                code: '// === COMMUTATION HIGH-SIDE (PNP) ===\nint controlPin = 7;\nint loadPin = 12; // LED avec résistance\n\nvoid setup() {\n  pinMode(controlPin, OUTPUT);\n}\n\nvoid loop() {\n  // PNP : LOW = ON, HIGH = OFF\n  digitalWrite(controlPin, LOW);  // Charge alimentée\n  delay(1000);\n  digitalWrite(controlPin, HIGH); // Charge coupée\n  delay(1000);\n}\n\n// MONTAGE :\n//  [+5V] → [Émetteur PNP]\n//            [Collecteur] → [Charge] → [GND]\n//  [Arduino Pin] → [Résistance 10kΩ] → [Base]\n//  [+5V] ← [Résistance 10kΩ pull-up] → [Base]',
                warning: 'Attention polarité inverse du NPN ! Base LOW = transistor ON.'
            },
            {
                id: 'tip120',
                name: 'TIP120 Darlington NPN Puissance',
                voltage: '60V max',
                current: '5A continu (8A pic)',
                gain: 'hFE 1000 min (super gain)',
                power: '65W max',
                price: 0.60,
                buyLink: 'https://www.amazon.fr/s?k=tip120+darlington+npn+to220',
                symbole: 'images/composants/Transistors-Diodes/tip120/symbole/symbole.png',
                description: 'Transistor Darlington haute puissance. Pilote moteurs, lampes, charges lourdes avec courant faible.',
                usage: 'Moteur DC puissance, lampes 12V, solénoïdes, pilotage charge inductive forte.',
                pinout: 'B : base (pin gauche)\nC : collecteur (pin centre)\nE : émetteur (pin droite)\nVue de face (boîtier vers vous)',
                pinoutFolder: 'images/composants/Transistors-Diodes/tip120/brochage',
                footprint: 'Boîtier TO-220\nNécessite dissipateur thermique >2A\nIsolant mica si besoin électrique',
                footprintFolder: 'images/composants/Transistors-Diodes/tip120/empreinte',
                formula: 'Gain Darlington : hFE = 1000-4000\nBase : Ib = Ic / 1000 (très faible !)\nChute Vce(sat) : 2V (Darlington double)\nPuissance dissipée : P = Vce × Ic',
                code: '// === MOTEUR DC 12V 2A ===\nint motorPin = 9; // PWM\n\nvoid setup() {\n  pinMode(motorPin, OUTPUT);\n}\n\nvoid loop() {\n  // Vitesse progressive\n  for(int speed = 0; speed <= 255; speed += 5) {\n    analogWrite(motorPin, speed);\n    delay(50);\n  }\n  delay(1000);\n  analogWrite(motorPin, 0); // Stop\n  delay(1000);\n}\n\n// MONTAGE :\n//  Arduino Pin 9 → [1kΩ] → TIP120 Base\n//  TIP120 Collecteur → Moteur (+)\n//  Moteur (-) → +12V externe\n//  TIP120 Émetteur → GND commun\n//  [Diode 1N4007 cathode→anode] en parallèle moteur\n\n// Calcul : Ib = 2A / 1000 = 2mA (Arduino fournit 40mA OK)',
                warning: '⚠️ Diode de roue libre OBLIGATOIRE ! Chute 2V, prévoir alimentation supérieure. Dissipateur >2A.'
            },
            {
                id: 'bt136',
                name: 'BT136 TRIAC 600V',
                voltage: '600V (secteur 220V OK)',
                current: '4A RMS',
                trigger: '5-50mA',
                price: 1.20,
                buyLink: 'https://www.amazon.fr/s?k=bt136+triac+600v+4a',
                symbole: 'images/composants/Transistors-Diodes/bt136/symbole/symbole.png',
                description: 'TRIAC pour contrôle de puissance AC. Gradateur, variateur lumière, dimmer.',
                usage: 'Variateur lumière 220V, contrôle chauffage, gradateur moteur AC.',
                pinout: 'T1 : Anode 1 (MT1)\nT2 : Anode 2 (MT2)\nG : Gâchette (Gate)',
                pinoutFolder: 'images/composants/Transistors-Diodes/bt136/brochage',
                footprint: 'Boîtier TO-220\nDissipateur obligatoire >1A',
                footprintFolder: 'images/composants/Transistors-Diodes/bt136/empreinte',
                formula: 'Courant gate : 5-50mA pour déclencher\nAngle phase : 0-180° (contrôle puissance)\nPuissance : P = V × I × cos(φ)\nDétection zéro-crossing pour dimmer propre',
                code: '// ⚠️⚠️⚠️ DANGER 220V ! Isolation obligatoire ! ⚠️⚠️⚠️\n// Utiliser module dimmer AC avec optocoupleur\n\n#include <RBDdimmer.h>\ndimmerLamp dimmer(9); // Pin avec détection zéro\n\nvoid setup() {\n  dimmer.begin(NORMAL_MODE, ON);\n}\n\nvoid loop() {\n  // Variation 0-100%\n  for(int i = 0; i <= 100; i++) {\n    dimmer.setPower(i);\n    delay(20);\n  }\n  delay(500);\n  for(int i = 100; i >= 0; i--) {\n    dimmer.setPower(i);\n    delay(20);\n  }\n  delay(500);\n}\n\n// ⚠️ NE JAMAIS brancher TRIAC directement à Arduino !\n// Utiliser module dimmer AC avec :\n//  - Optocoupleur isolation (MOC3021)\n//  - Détection zéro-crossing\n//  - Protection fusible',
                libraries: ['RBDdimmer'],
                warning: '⚠️⚠️⚠️ 220V MORTEL ! Isolation galvanique OBLIGATOIRE. Optocoupleur requis. Ne JAMAIS connecter directement ! ⚠️⚠️⚠️'
            },
            {
                id: 'bt169',
                name: 'BT169 Thyristor/SCR 400V',
                voltage: '400V (secteur 220V)',
                current: '8A RMS',
                trigger: '200µA (ultra-sensible)',
                price: 1.00,
                buyLink: 'https://www.amazon.fr/s?k=bt169+thyristor+scr+400v',
                symbole: 'images/composants/Transistors-Diodes/bt169/symbole/symbole.png',
                description: 'Thyristor (SCR) unidirectionnel. Contrôle demi-alternance AC, latching.',
                usage: 'Contrôle chauffage, chargeur batterie, protection surintensité, crowbar.',
                pinout: 'A : Anode\nK : Cathode\nG : Gâchette (Gate)',
                pinoutFolder: 'images/composants/Transistors-Diodes/bt169/brochage',
                footprint: 'Boîtier TO-220\nConduction unidirectionnelle (vs TRIAC bidirectionnel)',
                footprintFolder: 'images/composants/Transistors-Diodes/bt169/empreinte',
                formula: 'Latching : une fois activé, reste ON jusqu\'à I < holding\nDemi-alternance : contrôle seulement alternance positive\nAngle amorçage : 0-180° → puissance variable',
                code: '// === CIRCUIT CROWBAR (protection surtension) ===\n// Si Vin > 5.7V → SCR court-circuite → fusible saute\n\n// MONTAGE (protection 5V) :\n//  [+Vin] → [Fusible 1A] → [+Vout 5V]\n//                             |\n//  SCR Anode ←---------------┘\n//  SCR Cathode → GND\n//  SCR Gate ← Zener 5.6V cathode\n//  Zener anode → GND\n\n// Fonctionnement :\n//  Vin < 5.6V : Zener bloquée, SCR OFF\n//  Vin > 5.6V : Zener conduit → gate activée\n//               → SCR ON → court-circuit\n//               → fusible saute (protection)\n\n// ⚠️ Circuit de protection uniquement !\n// Pas de code Arduino, action électronique pure.',
                warning: 'SCR = latch permanent ! Une fois ON, reste ON même si gate 0V. Coupure seulement si courant < holding.'
            },
            {
                id: 'pc817',
                name: 'PC817 Optocoupleur',
                voltage: '5000V isolation',
                current: '50mA LED, 50mA transistor',
                ctr: 'CTR 80-160% (gain)',
                price: 0.30,
                buyLink: 'https://www.amazon.fr/s?k=pc817+optocoupleur+dip4',
                symbole: 'images/composants/Transistors-Diodes/pc817/symbole/symbole.png',
                description: 'Optocoupleur LED + phototransistor. Isolation galvanique entre circuits.',
                usage: 'Isolation secteur 220V, protection µC, communication isolée, détection 0-crossing.',
                pinout: 'Pin 1 : Anode LED\nPin 2 : Cathode LED\nPin 3 : Émetteur phototransistor\nPin 4 : Collecteur phototransistor',
                pinoutFolder: 'images/composants/Transistors-Diodes/pc817/brochage',
                footprint: 'Boîtier DIP-4\nEspacement : 7.62mm\nIsolation : 5000V',
                footprintFolder: 'images/composants/Transistors-Diodes/pc817/empreinte',
                formula: 'Résistance LED : R = (Vin - 1.2) / 10mA\nCourant LED : 10-20mA typique\nCTR (gain) : 80-160%\nFréquence max : 80kHz',
                code: '// === ISOLATION CIRCUIT DANGEREUX ===\n// Côté Arduino (sécurisé) :\nint signalPin = 8;\n\nvoid setup() {\n  pinMode(signalPin, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(signalPin, HIGH); // Active optocoupleur\n  delay(1000);\n  digitalWrite(signalPin, LOW);\n  delay(1000);\n}\n\n// MONTAGE :\n// [Arduino 5V] → [Résistance 220Ω] → [PC817 Pin1 anode]\n//                                     [PC817 Pin2 cathode] → [GND]\n// \n// Circuit isolé (peut être 220V !) :\n// [+Vcc isolé] → [Charge] → [PC817 Pin4 collecteur]\n//                            [PC817 Pin3 émetteur] → [GND isolé]\n\n// ⚠️ AUCUNE connexion électrique entre les deux côtés !',
                libraries: [],
                warning: '⚠️ Isolation galvanique ! Jamais de connexion GND commune entre les 2 côtés.'
            },
            {
                id: 'crystal-16mhz',
                name: 'Cristal Quartz 16MHz',
                frequency: '16.000 MHz',
                tolerance: '±30 ppm',
                load: '18-20 pF',
                price: 0.50,
                buyLink: 'https://www.amazon.fr/s?k=crystal+quartz+16mhz+hc49',
                symbole: 'images/composants/Passifs/crystal-16mhz/symbole/symbole.png',
                description: 'Cristal quartz 16MHz pour horloge précise Arduino. Oscillateur externe.',
                usage: 'Arduino DIY, ATmega328P standalone, horloges précises, communication série.',
                pinout: 'Pin 1 et 2 : connexions cristal (pas de polarité)\nBoîtier HC-49S : 2 pattes',
                pinoutFolder: 'images/composants/Passifs/crystal-16mhz/brochage',
                footprint: 'Boîtier HC-49S\nEspacement : 5mm\nHauteur : 13mm',
                footprintFolder: 'images/composants/Passifs/crystal-16mhz/empreinte',
                formula: 'Fréquence : 16 MHz (précis à ±30 ppm)\nCondensateurs charge : 2× 22pF vers GND\nCycle machine AVR : 62.5 ns\nBaud rate UART : sans erreur jusqu\'à 115200',
                code: '// MONTAGE ARDUINO STANDALONE :\n// ATmega328P :\n//   Pin 9 (XTAL1) → [22pF] → GND\n//                 → [Crystal] → Pin 10 (XTAL2)\n//   Pin 10 (XTAL2) → [22pF] → GND\n\n// Dans Arduino IDE, sélectionner :\n// Outils > Horloge > 16MHz (external)\n\n// Code normal fonctionne ensuite\nvoid setup() {\n  Serial.begin(9600); // Précision garantie\n}\n\n// Sans quartz : oscillateur interne RC 8MHz ±10% (imprécis)\n// Avec quartz 16MHz : précision ±0.003% (30 ppm)',
                warning: 'Condensateurs 22pF obligatoires ! Valeur critique pour oscillation.'
            },
            {
                id: 'p6ke6v8',
                name: 'P6KE6.8A TVS Diode 6.8V',
                voltage: 'Standoff 6.8V, Clamp 11V',
                power: '600W (10/1000µs pulse)',
                response: '<1ps (instantané)',
                price: 0.40,
                buyLink: 'https://www.amazon.fr/s?k=p6ke6.8a+tvs+diode+protection',
                symbole: 'images/composants/Protection/p6ke6v8/symbole/symbole.png',
                description: 'Diode TVS (Transient Voltage Suppressor) protection contre surtensions ultra-rapides (ESD, foudre).',
                usage: 'Protection ligne 5V, ESD, surtensions transitoires, entrées/sorties sensibles.',
                pinout: 'Bidirectionnelle (A suffix) : pas de polarité\nUnidirectionnelle (CA suffix) : anode/cathode\nBoîtier axial',
                pinoutFolder: 'images/composants/Protection/p6ke6v8/brochage',
                footprint: 'Boîtier DO-204 (axial)\nÉnergie : 600W crête\nTemps réponse : picosecondes',
                footprintFolder: 'images/composants/Protection/p6ke6v8/empreinte',
                formula: 'Voltage standoff : 6.8V (tension travail max)\nBreakdown : 7.5V typique (conduit)\nClamp voltage : 11V @ 39A (écrêtage)\nÉnergie : 600W pendant 10µs',
                code: '// MONTAGE PROTECTION LIGNE 5V :\n//  [+5V] ───┬─── Circuit protégé\n//           │\n//      [P6KE6.8A]\n//           │\n//         [GND]\n\n// Fonctionnement automatique :\n//  Voltage normal < 6.8V : TVS = circuit ouvert\n//  Spike > 7.5V : TVS conduit instantanément\n//                  → limite à 11V max\n//                  → absorbe 600W pic\n//  ESD 15kV : absorbée en <1ns\n\n// Code Arduino normal - protection invisible\nvoid setup() {\n  pinMode(A0, INPUT);\n}\n\nvoid loop() {\n  int val = analogRead(A0);\n  // TVS protège contre ESD sur pin A0\n}',
                warning: 'Choisir voltage standoff > voltage normal circuit. TVS conduit = absorption surtension, pas blocage !'
            },
            {
                id: 'mov-14d471k',
                name: 'MOV 14D471K Varistor 275V',
                voltage: '275V RMS (secteur 230V)',
                energy: '70J',
                clamp: '455V @ 100A',
                price: 0.50,
                buyLink: 'https://www.amazon.fr/s?k=varistor+mov+275v+parafoudre',
                symbole: 'images/composants/Protection/mov-14d471k/symbole/symbole.png',
                description: 'Varistor MOV (Metal Oxide Varistor) protection contre surtensions secteur 230V AC.',
                usage: 'Protection secteur 220V, parafoudre, suppresseur transitoires AC.',
                pinout: 'Pas de polarité\n2 pattes symétriques\nMontage parallèle avec ligne',
                pinoutFolder: 'images/composants/Protection/mov-14d471k/brochage',
                footprint: 'Disque 14mm diamètre\nÉnergie : 70 Joules\nPas de pattes : 7.5mm',
                footprintFolder: 'images/composants/Protection/mov-14d471k/empreinte',
                formula: 'Voltage nominal : 275V RMS (secteur 230V)\nÉnergie max : 70J\nClamp voltage : 455V @ 100A (écrêtage)\nCapacitance : 470pF (471 = code)',
                code: '// MONTAGE PROTECTION SECTEUR 220V :\n//  [Phase 220V] ───┬─── Appareil\n//                  │\n//             [MOV 275V]\n//                  │\n//               [Neutre]\n\n// Souvent combiné avec fusible :\n//  Phase → [Fusible] → [MOV] → Appareil\n//                       │\n//                    Neutre\n\n// ⚠️ Protection PASSIVE, aucun code !\n// MOV absorbe surtensions, fusible coupe si trop long.\n\n// Exemple foudre indirecte :\n//  Spike 1000V, 200A → MOV limite à 455V\n//                    → Absorbe 70J max\n//                    → Protège électronique',
                warning: '⚠️ MOV peut exploser si énergie > 70J ! Toujours combiner avec fusible. Vérifier diamètre enclosure.'
            },
            {
                id: 'polyfuse',
                name: 'Fusible Réarmable PTC (Polyfuse)',
                current: '500mA - 3A (selon modèle)',
                voltage: '60V max',
                trip: 'Double du courant nominal',
                price: 0.30,
                buyLink: 'https://www.amazon.fr/s?k=polyfuse+fusible+rearmable+ptc',
                symbole: 'images/composants/Protection/polyfuse/symbole/symbole.png',
                description: 'Fusible réarmable à coefficient de température positif. Protection surintensité auto-réarmable.',
                usage: 'Protection USB, alimentation, court-circuits, sécurité circuits.',
                pinout: 'Pas de polarité\n2 pattes symétriques',
                pinoutFolder: 'images/composants/Protection/polyfuse/brochage',
                footprint: 'Radial ou SMD\nEspace pattes : 5mm (radial)',
                footprintFolder: 'images/composants/Protection/polyfuse/empreinte',
                formula: 'Courant hold : courant max permanent\nCourant trip : ~2× hold (déclenchement)\nRésistance : <1Ω (froid), >1kΩ (chaud)\nRéarmement : 10-60 secondes après refroidissement',
                code: '// MONTAGE PROTECTION USB :\n//  [+5V USB] → [Polyfuse 500mA] → [+5V Circuit]\n//  Si court-circuit → résistance augmente → limite courant\n//  Protection automatique, pas de remplacement nécessaire\n\n// Exemple Arduino :\n//  USB → Polyfuse 500mA → Vin Arduino\n//  Court-circuit Vin-GND → polyfuse s\'ouvre\n//  Après correction → se réarme automatiquement\n\n// Code Arduino normal - protection transparente\nvoid setup() {\n  pinMode(13, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}',
                warning: 'Choisir courant légèrement supérieur à consommation normale. Réarmement automatique après refroidissement.'
            }
        ]
    },
    {
        id: 'modules',
        folderName: 'Modules',
        name: 'Modules Divers',
        icon: '📦',
        description: 'RTC, SD Card, relais, convertisseurs',
        components: [
            {
                id: 'ds1307-rtc',
                name: 'DS1307 Module RTC (Real Time Clock)',
                voltage: '5V (+ pile CR2032 3V backup)',
                interface: 'I2C',
                accuracy: '±2 min/mois',
                price: 2.50,
                buyLink: 'https://www.amazon.fr/s?k=ds1307+rtc+module+horloge+i2c',
                symbole: 'images/composants/Modules/ds1307-rtc/symbole/symbole.png',
                description: 'Horloge temps réel avec batterie de sauvegarde. Conserve date/heure sans alimentation.',
                usage: 'Horloges, datalogging, timers, réveils, automation temporisée.',
                pinout: 'VCC : 5V\nGND : masse\nSDA : I2C data (A4)\nSCL : I2C clock (A5)\nDS : sortie 1Hz (opt)\nSQ : square wave (opt)\nBattery : pile CR2032',
                pinoutFolder: 'images/composants/Modules/ds1307-rtc/brochage',
                footprint: 'Module : 38 × 22mm\nEmplacement pile CR2032\nEEPROM 24C32 souvent intégrée',
                footprintFolder: 'images/composants/Modules/ds1307-rtc/empreinte',
                formula: 'Adresse I2C : 0x68\nConsommation : 1.5mA (5V), 500nA (backup)\nPrécision : ~±2 ppm à 25°C\nPlage : secondes à année 2099',
                code: '#include <RTClib.h>\nRTC_DS1307 rtc;\n\nvoid setup() {\n  Serial.begin(9600);\n  rtc.begin();\n  \n  // Régler l\'heure (une seule fois !)\n  // rtc.adjust(DateTime(2026, 1, 7, 14, 30, 0));\n}\n\nvoid loop() {\n  DateTime now = rtc.now();\n  Serial.print(now.year()); Serial.print(\'/\');\n  Serial.print(now.month()); Serial.print(\'/\');\n  Serial.print(now.day()); Serial.print(\' \');\n  Serial.print(now.hour()); Serial.print(\':\');\n  Serial.print(now.minute()); Serial.print(\':\');\n  Serial.println(now.second());\n  delay(1000);\n}',
                libraries: ['RTClib'],
                warning: 'Installer pile CR2032 pour conserver heure sans alimentation !'
            },
            {
                id: 'sd-card-module',
                name: 'Module Lecteur Carte SD',
                voltage: '3.3-5V (avec régulateur)',
                interface: 'SPI',
                capacity: 'SD/SDHC jusqu\'à 32GB (FAT32)',
                price: 1.50,
                buyLink: 'https://www.amazon.fr/s?k=module+carte+sd+spi+arduino',
                symbole: 'images/composants/Modules/sd-card-module/symbole/symbole.png',
                description: 'Lecteur de carte micro SD/SD. Stockage de données, logs, fichiers.',
                usage: 'Datalogger, enregistrement capteurs, fichiers audio, sauvegarde configuration.',
                pinout: 'CS : chip select\nSCK : SPI clock\nMOSI : data in\nMISO : data out\nVCC : 5V (régulé 3.3V)\nGND : masse',
                pinoutFolder: 'images/composants/Modules/sd-card-module/brochage',
                footprint: 'Module : 42 × 24mm\nSlot micro SD push-push\nRégulateur 3.3V intégré',
                footprintFolder: 'images/composants/Modules/sd-card-module/empreinte',
                formula: 'Vitesse SPI : jusqu\'à 25MHz\nFormat : FAT16/FAT32 uniquement\nConsommation : ~100mA (écriture)\nLatence écriture : ~10ms/bloc',
                code: '#include <SD.h>\n\nconst int chipSelect = 10;\n\nvoid setup() {\n  Serial.begin(9600);\n  if(!SD.begin(chipSelect)) {\n    Serial.println("Erreur SD !");\n    return;\n  }\n  \n  File dataFile = SD.open("data.txt", FILE_WRITE);\n  if(dataFile) {\n    dataFile.println("Température,Humidité");\n    dataFile.close();\n  }\n}\n\nvoid loop() {\n  File dataFile = SD.open("data.txt", FILE_WRITE);\n  if(dataFile) {\n    dataFile.print(analogRead(A0));\n    dataFile.print(",");\n    dataFile.println(analogRead(A1));\n    dataFile.close();\n  }\n  delay(5000);\n}',
                libraries: ['SD'],
                warning: '⚠️ Formater carte en FAT32 ! Utiliser CS sur pin 10 ou définir dans SD.begin()'
            },
            {
                id: 'relay-module-1ch',
                name: 'Module Relais 1 Canal 5V',
                voltage: '5V (bobine), 250VAC/10A (contact)',
                control: 'Actif LOW ou HIGH (selon module)',
                price: 1.80,
                buyLink: 'https://www.amazon.fr/s?k=module+relais+5v+1+canal',
                symbole: 'images/composants/Modules/relay-module-1ch/symbole/symbole.png',
                description: 'Module relais avec optoisolateur et diode de protection. Commande charges 220V.',
                usage: 'Domotique, contrôle lampes 220V, électrovannes, chauffage.',
                pinout: 'VCC : 5V\nGND : masse\nIN : signal commande (actif LOW)\nCOM : commun contact\nNO : normalement ouvert\nNC : normalement fermé',
                pinoutFolder: 'images/composants/Modules/relay-module-1ch/brochage',
                footprint: 'Module : 50 × 26mm\nBornier à vis (COM/NO/NC)\nLED indicateur état',
                footprintFolder: 'images/composants/Modules/relay-module-1ch/empreinte',
                formula: 'Contact : 10A @ 250VAC, 10A @ 30VDC\nBobine : 70mA @ 5V\nIsolation : 4000V (optocoupleur)\nVie : ~100000 cycles',
                code: 'int relayPin = 7;\n\nvoid setup() {\n  pinMode(relayPin, OUTPUT);\n  digitalWrite(relayPin, HIGH); // OFF (actif LOW)\n}\n\nvoid loop() {\n  digitalWrite(relayPin, LOW);  // ON\n  delay(3000);\n  digitalWrite(relayPin, HIGH); // OFF\n  delay(3000);\n}',
                warning: '⚠️⚠️ DANGER 220V ! Ne manipuler que hors tension. Vérifier actif HIGH/LOW selon module.'
            },
            {
                id: 'step-down-lm2596',
                name: 'LM2596 Buck Converter (Step-Down)',
                voltage: '4-40V (entrée) → 1.25-37V (sortie)',
                current: '3A max',
                efficiency: '~92%',
                price: 1.20,
                buyLink: 'https://www.amazon.fr/s?k=lm2596+step+down+buck+converter',
                symbole: 'images/composants/Modules/step-down-lm2596/symbole/symbole.png',
                description: 'Convertisseur DC-DC abaisseur de tension ajustable. Haute efficacité.',
                usage: 'Alimentation efficace Arduino depuis batterie 12V, réduction de tension.',
                pinout: 'IN+ / IN- : entrée (4-40V)\nOUT+ / OUT- : sortie ajustable\nPotentiomètre : réglage Vout',
                pinoutFolder: 'images/composants/Modules/step-down-lm2596/brochage',
                footprint: 'Module : 43 × 21mm\nRadiateur aluminium intégré\nPotentiomètre bleu réglage',
                footprintFolder: 'images/composants/Modules/step-down-lm2596/empreinte',
                formula: 'Efficacité : η = (Vout × Iout) / (Vin × Iin)\nFréquence switching : 150kHz\nOndulation : <30mV\nDifférentiel min : Vin ≥ Vout + 1.5V',
                code: '// Pas de code - module hardware\n// UTILISATION :\n// 1. Brancher entrée (ex: batterie 12V)\n// 2. Tourner potentiomètre\n// 3. Mesurer sortie avec multimètre\n// 4. Ajuster à 5V pour Arduino\n\n// ATTENTION : régler tension AVANT de brancher charge !',
                warning: 'Mesurer Vout avec multimètre AVANT branchement ! Survoltage = destruction Arduino.'
            }
        ]
    },
    {
        id: 'iot-wireless',
        folderName: 'IoT-Sans-Fil',
        name: 'IoT & Sans-Fil',
        icon: '📡',
        description: 'ESP8266, ESP32, modules WiFi/Bluetooth',
        components: [
            {
                id: 'esp8266-01',
                name: 'ESP8266-01 WiFi Module',
                voltage: '3.3V (DANGER : pas 5V !)',
                wifi: '802.11 b/g/n 2.4GHz',
                gpio: '2 GPIO disponibles',
                price: 3.00,
                buyLink: 'https://www.amazon.fr/s?k=esp8266-01+esp-01+wifi',
                symbole: 'images/composants/IoT-Sans-Fil/esp8266-01/symbole/symbole.png',
                description: 'Module WiFi ultra-compact et peu coûteux. Programmable avec Arduino IDE.',
                usage: 'IoT, serveur web, MQTT, capteurs WiFi, contrôle à distance.',
                pinout: 'VCC : 3.3V (300mA !)\nGND : masse\nTX/RX : UART\nCH_PD : enable (HIGH)\nGPIO0 : mode flash (LOW boot)\nGPIO2 : libre\nRST : reset',
                pinoutFolder: 'images/composants/IoT-Sans-Fil/esp8266-01/brochage',
                footprint: 'Module : 24.75 × 14.5mm\n8 pins (2×4)\nAntenne PCB intégrée',
                footprintFolder: 'images/composants/IoT-Sans-Fil/esp8266-01/empreinte',
                formula: 'Consommation : 70mA (moyenne), 340mA (pic TX)\nPortée WiFi : ~50m intérieur\nFréquence CPU : 80MHz\nFlash : 512KB à 4MB',
                code: '#include <ESP8266WiFi.h>\n\nconst char* ssid = "VotreWiFi";\nconst char* password = "VotreMotDePasse";\n\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.begin(ssid, password);\n  \n  while(WiFi.status() != WL_CONNECTED) {\n    delay(500);\n    Serial.print(".");\n  }\n  \n  Serial.println("\\nConnecté !");\n  Serial.println(WiFi.localIP());\n}\n\nvoid loop() {\n  // Votre code WiFi ici\n}',
                libraries: ['ESP8266WiFi'],
                warning: '⚠️ CRITIQUE : 3.3V MAX ! Alimenter en 5V = destruction immédiate. Convertisseur de niveau logique si Arduino 5V.'
            },
            {
                id: 'esp32-devkit',
                name: 'ESP32 DevKit v1',
                voltage: '5V USB / 3.3V logic',
                wifi: 'WiFi + Bluetooth 4.2 BLE',
                gpio: '30 GPIO, 18 ADC 12-bit, 2 DAC',
                price: 7.00,
                buyLink: 'https://www.amazon.fr/s?k=esp32+devkit+v1+wifi+bluetooth',
                symbole: 'images/composants/IoT-Sans-Fil/esp32-devkit/symbole/symbole.png',
                description: 'Carte puissante dual-core avec WiFi et Bluetooth. Alternative Arduino avec networking intégré.',
                usage: 'Projets IoT avancés, serveurs web, Bluetooth, multitâche, IA embarquée.',
                pinout: 'GPIO : 0-39 (certains réservés)\nADC : 18 canaux 12-bit\nDAC : GPIO25, GPIO26\nTouch : 10 pins capacitives\nPWM : tous GPIO\nI2C, SPI, UART multiples',
                pinoutFolder: 'images/composants/IoT-Sans-Fil/esp32-devkit/brochage',
                footprint: 'Carte : 55 × 28mm\n2×19 pins (breadboard)\nUSB micro (ou Type-C)',
                footprintFolder: 'images/composants/IoT-Sans-Fil/esp32-devkit/empreinte',
                formula: 'CPU : Dual-core 240MHz\nRAM : 520KB SRAM\nFlash : 4MB\nConsommation : 80mA (WiFi), 160mA (WiFi+BT)\nDeep sleep : 10µA',
                code: '#include <WiFi.h>\n#include <WebServer.h>\n\nconst char* ssid = "VotreWiFi";\nconst char* password = "MotDePasse";\n\nWebServer server(80);\n\nvoid handleRoot() {\n  server.send(200, "text/html", "<h1>ESP32 Web Server</h1>");\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  WiFi.begin(ssid, password);\n  \n  while(WiFi.status() != WL_CONNECTED) {\n    delay(500);\n    Serial.print(".");\n  }\n  \n  Serial.println("\\nIP: " + WiFi.localIP().toString());\n  \n  server.on("/", handleRoot);\n  server.begin();\n}\n\nvoid loop() {\n  server.handleClient();\n}',
                libraries: ['WiFi', 'WebServer', 'BluetoothSerial'],
                datasheet: 'Espressif ESP32-WROOM-32'
            },
            {
                id: 'neo-6m-gps',
                name: 'NEO-6M Module GPS',
                voltage: '3.3-5V',
                interface: 'UART (9600 baud)',
                accuracy: '2.5m CEP',
                price: 12.00,
                buyLink: 'https://www.amazon.fr/s?k=neo-6m+gps+module+antenne',
                symbole: 'images/composants/IoT-Sans-Fil/neo-6m-gps/symbole/symbole.png',
                description: 'Module GPS avec antenne céramique. Localisation précise satellite.',
                usage: 'Tracker GPS, drone, voiture autonome, géolocalisation, horodatage précis.',
                pinout: 'VCC : 3.3-5V\nGND : masse\nTX : vers RX Arduino\nRX : vers TX Arduino\nPPS : pulse per second (opt)',
                pinoutFolder: 'images/composants/IoT-Sans-Fil/neo-6m-gps/brochage',
                footprint: 'Module : 25 × 35mm\nAntenne céramique 25×25mm\nConnecteur UART 4 pins',
                footprintFolder: 'images/composants/IoT-Sans-Fil/neo-6m-gps/empreinte',
                formula: 'Précision : 2.5m CEP (50%)\nAltitude : ±0.5m\nVitesse : ±0.1 m/s\nCanaux : 50 (recherche), 22 (tracking)\nFréquence MAJ : 5Hz',
                code: '#include <TinyGPS++.h>\n#include <SoftwareSerial.h>\n\nTinyGPSPlus gps;\nSoftwareSerial ss(4, 3); // RX, TX\n\nvoid setup() {\n  Serial.begin(9600);\n  ss.begin(9600);\n}\n\nvoid loop() {\n  while(ss.available() > 0) {\n    gps.encode(ss.read());\n    if(gps.location.isUpdated()) {\n      Serial.print("Lat: ");\n      Serial.println(gps.location.lat(), 6);\n      Serial.print("Lng: ");\n      Serial.println(gps.location.lng(), 6);\n      Serial.print("Altitude: ");\n      Serial.println(gps.altitude.meters());\n    }\n  }\n}',
                libraries: ['TinyGPSPlus'],
                warning: 'Nécessite vue dégagée du ciel. Acquisition satellites : 30s-2min au premier démarrage.'
            },
            {
                id: 'tft-1.8-st7735',
                name: 'TFT 1.8" 128×160 ST7735',
                voltage: '3.3-5V',
                interface: 'SPI',
                resolution: '128×160 pixels, 65K couleurs',
                price: 8.00,
                buyLink: 'https://www.amazon.fr/s?k=tft+1.8+st7735+spi+128x160',
                symbole: 'images/composants/IoT-Sans-Fil/tft-1.8-st7735/symbole/symbole.png',
                description: 'Écran TFT couleur avec contrôleur ST7735. Affichage graphique compact.',
                usage: 'Interface graphique, graphiques, images, menus, jeux, oscilloscope DIY.',
                pinout: 'VCC : 5V (ou 3.3V)\nGND : masse\nCS : chip select\nRESET : reset\nA0/DC : data/command\nSDA/MOSI : data\nSCK : clock\nLED : rétroéclairage (3.3V)',
                pinoutFolder: 'images/composants/IoT-Sans-Fil/tft-1.8-st7735/brochage',
                footprint: 'Écran : 35 × 50mm\nZone active : 28 × 35mm\nSlot carte SD (souvent)',
                footprintFolder: 'images/composants/IoT-Sans-Fil/tft-1.8-st7735/empreinte',
                formula: 'Pixels : 128×160 = 20480\nCouleurs : RGB565 (65536)\nConsommation : ~80mA\nVitesse SPI : jusqu\'à 15MHz',
                code: '#include <Adafruit_GFX.h>\n#include <Adafruit_ST7735.h>\n\n#define TFT_CS   10\n#define TFT_RST  9\n#define TFT_DC   8\n\nAdafruit_ST7735 tft = Adafruit_ST7735(TFT_CS, TFT_DC, TFT_RST);\n\nvoid setup() {\n  tft.initR(INITR_BLACKTAB);\n  tft.fillScreen(ST77XX_BLACK);\n  \n  tft.setCursor(10, 50);\n  tft.setTextColor(ST77XX_WHITE);\n  tft.setTextSize(2);\n  tft.println("Hello");\n  tft.setTextColor(ST77XX_GREEN);\n  tft.println("Arduino!");\n  \n  // Dessin\n  tft.drawCircle(64, 100, 30, ST77XX_BLUE);\n  tft.fillRect(30, 130, 68, 20, ST77XX_RED);\n}\n\nvoid loop() {\n  // Animation, graphiques...\n}',
                libraries: ['Adafruit_GFX', 'Adafruit_ST7735'],
                datasheet: 'Sitronix ST7735R'
            }
        ]
    }
    */
];

// === CATÉGORIES DE PROJETS ===
const projectCategories = [
    { id: 'input', name: 'Entrées', icon: '🎛️', color: '#3b82f6' },
    { id: 'output', name: 'Sorties', icon: '💡', color: '#22c55e' },
    { id: 'sensor', name: 'Capteurs', icon: '🌡️', color: '#f59e0b' },
    { id: 'actuator', name: 'Actionneurs', icon: '⚙️', color: '#8b5cf6' },
    { id: 'communication', name: 'Communication', icon: '📡', color: '#06b6d4' },
    { id: 'display', name: 'Affichage', icon: '📺', color: '#ec4899' },
    { id: 'other', name: 'Autre', icon: '📂', color: '#6b7280' }
];

const difficultyLevels = [
    { id: 'beginner', name: 'Débutant', icon: '🟢', color: '#22c55e' },
    { id: 'intermediate', name: 'Intermédiaire', icon: '🟡', color: '#f59e0b' },
    { id: 'advanced', name: 'Avancé', icon: '🔴', color: '#ef4444' }
];

let currentFilter = { category: 'all', difficulty: 'all', tag: '', favorites: false };
let recentProjects = JSON.parse(localStorage.getItem('recentProjects') || '[]');

// Templates de projets pré-configurés
const projectTemplates = [
    {
        id: 'led-blink',
        name: '💡 LED Clignotante',
        category: 'output',
        difficulty: 'beginner',
        description: 'Faire clignoter une LED - Le premier projet Arduino',
        components: [
            { categoryId: 'led', id: 'led-red', name: 'LED Rouge', icon: '💡', quantity: 1 },
            { categoryId: 'resistances', id: 'resistor-220', name: 'Résistance 220Ω', icon: '⚡', quantity: 1 }
        ],
        code: `// LED Clignotante - Premier projet Arduino
const int LED_PIN = 13;  // LED sur la pin 13

void setup() {
  pinMode(LED_PIN, OUTPUT);  // Configurer la pin en sortie
}

void loop() {
  digitalWrite(LED_PIN, HIGH);  // Allumer la LED
  delay(1000);                  // Attendre 1 seconde
  digitalWrite(LED_PIN, LOW);   // Éteindre la LED
  delay(1000);                  // Attendre 1 seconde
}`,
        notes: `**Branchement :**
- LED (+) → Pin 13
- Résistance 220Ω → LED (-)
- Résistance (-) → GND

**Explication :**
Ce programme fait clignoter une LED toutes les secondes. C'est le "Hello World" d'Arduino !`
    },
    {
        id: 'servo-sweep',
        name: '⚙️ Servo Moteur',
        category: 'actuator',
        difficulty: 'beginner',
        description: 'Contrôler un servomoteur SG90 (balayage 0-180°)',
        components: [
            { categoryId: 'actuator', id: 'sg90', name: 'Servo SG90', icon: '⚙️', quantity: 1 }
        ],
        code: `// Servo Moteur - Balayage 0° à 180°
#include <Servo.h>

Servo monServo;
const int SERVO_PIN = 9;

void setup() {
  monServo.attach(SERVO_PIN);  // Attacher le servo à la pin 9
}

void loop() {
  // Balayage de 0° à 180°
  for (int angle = 0; angle <= 180; angle++) {
    monServo.write(angle);
    delay(15);
  }
  
  // Retour de 180° à 0°
  for (int angle = 180; angle >= 0; angle--) {
    monServo.write(angle);
    delay(15);
  }
}`,
        notes: `**Branchement :**
- Fil ORANGE → Pin 9 (signal)
- Fil ROUGE → 5V
- Fil MARRON → GND

**Attention :** Ne pas alimenter le servo depuis l'Arduino si plusieurs servos ou charge importante !`
    },
    {
        id: 'button-led',
        name: '🎛️ Bouton → LED',
        category: 'input',
        difficulty: 'beginner',
        description: 'Allumer une LED avec un bouton poussoir',
        components: [
            { categoryId: 'led', id: 'led-green', name: 'LED Verte', icon: '💡', quantity: 1 },
            { categoryId: 'resistances', id: 'resistor-220', name: 'Résistance 220Ω', icon: '⚡', quantity: 1 },
            { categoryId: 'entrees', id: 'push-button', name: 'Bouton Poussoir', icon: '🎛️', quantity: 1 },
            { categoryId: 'resistances', id: 'resistor-10k', name: 'Résistance 10kΩ', icon: '⚡', quantity: 1 }
        ],
        code: `// Bouton Poussoir → LED
const int BUTTON_PIN = 2;
const int LED_PIN = 13;

void setup() {
  pinMode(BUTTON_PIN, INPUT);   // Bouton en entrée
  pinMode(LED_PIN, OUTPUT);      // LED en sortie
}

void loop() {
  int buttonState = digitalRead(BUTTON_PIN);
  
  if (buttonState == HIGH) {
    digitalWrite(LED_PIN, HIGH);  // Bouton appuyé → LED ON
  } else {
    digitalWrite(LED_PIN, LOW);   // Bouton relâché → LED OFF
  }
}`,
        notes: `**Branchement :**
- Bouton pin 1 → 5V
- Bouton pin 2 → Pin 2 + Résistance 10kΩ vers GND
- LED (+) → Pin 13
- Résistance 220Ω → LED (-)
- Résistance (-) → GND`
    },
    {
        id: 'ultrasonic-distance',
        name: '📏 Capteur Distance HC-SR04',
        category: 'sensor',
        difficulty: 'intermediate',
        description: 'Mesurer une distance avec le capteur ultrason',
        components: [
            { categoryId: 'capteurs', id: 'hcsr04', name: 'HC-SR04', icon: '📡', quantity: 1 }
        ],
        code: `// Capteur Ultrason HC-SR04
const int TRIG_PIN = 9;
const int ECHO_PIN = 10;

void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

void loop() {
  // Envoyer une impulsion
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Mesurer le temps de retour
  long duree = pulseIn(ECHO_PIN, HIGH);
  
  // Calculer la distance (cm)
  float distance = duree * 0.034 / 2;
  
  Serial.print("Distance: ");
  Serial.print(distance);
  Serial.println(" cm");
  
  delay(500);
}`,
        notes: `**Branchement :**
- VCC → 5V
- GND → GND
- TRIG → Pin 9
- ECHO → Pin 10

**Formule :** distance = (temps × vitesse_son) / 2
Vitesse son = 340 m/s = 0.034 cm/µs`
    },
    {
        id: 'dht11-temp',
        name: '🌡️ Température DHT11',
        category: 'sensor',
        difficulty: 'intermediate',
        description: 'Lire température et humidité avec DHT11',
        components: [
            { categoryId: 'capteurs', id: 'dht11', name: 'DHT11', icon: '🌡️', quantity: 1 },
            { categoryId: 'resistances', id: 'resistor-10k', name: 'Résistance 10kΩ', icon: '⚡', quantity: 1 }
        ],
        code: `// Capteur DHT11 - Température et Humidité
#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
  Serial.println("Capteur DHT11 initialisé");
}

void loop() {
  delay(2000);  // Attendre 2 secondes entre les lectures
  
  float humidite = dht.readHumidity();
  float temperature = dht.readTemperature();
  
  if (isnan(humidite) || isnan(temperature)) {
    Serial.println("Erreur lecture capteur !");
    return;
  }
  
  Serial.print("Humidité: ");
  Serial.print(humidite);
  Serial.print(" %  ");
  Serial.print("Température: ");
  Serial.print(temperature);
  Serial.println(" °C");
}`,
        notes: `**Branchement :**
- VCC → 5V
- GND → GND
- DATA → Pin 2
- Résistance 10kΩ entre VCC et DATA (pull-up)

**Librairie requise :** DHT sensor library (Adafruit)`
    },
    {
        id: 'lcd-display',
        name: '📺 Afficheur LCD 16x2',
        category: 'display',
        difficulty: 'intermediate',
        description: 'Afficher du texte sur un écran LCD I2C',
        components: [
            { categoryId: 'afficheurs', id: 'lcd-16x2-i2c', name: 'LCD 16x2 I2C', icon: '📺', quantity: 1 }
        ],
        code: `// Afficheur LCD 16x2 I2C
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// Adresse I2C: 0x27 ou 0x3F (selon module)
LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  lcd.init();           // Initialiser le LCD
  lcd.backlight();      // Allumer le rétro-éclairage
  
  lcd.setCursor(0, 0);  // Colonne 0, Ligne 0
  lcd.print("Arduino LCD");
  
  lcd.setCursor(0, 1);  // Colonne 0, Ligne 1
  lcd.print("I2C Display");
}

void loop() {
  // Afficher un compteur
  static int compteur = 0;
  lcd.setCursor(12, 1);
  lcd.print(compteur);
  compteur++;
  delay(1000);
}`,
        notes: `**Branchement I2C :**
- VCC → 5V
- GND → GND
- SDA → A4 (Uno) ou SDA (Mega)
- SCL → A5 (Uno) ou SCL (Mega)

**Librairie requise :** LiquidCrystal_I2C`
    }
];

// --- BASE DE DONNÉES MASSIVE (100 FORMULES) ---
const formulas = [
    // ⚡ ÉLECTRICITÉ & PUISSANCE (1-20)
    { cat: 'Elec', id:'ohm', name:"Loi d'Ohm", math:"U = R × I", ins:[{id:'u',n:'Tension U (V)'},{id:'r',n:'Résistance R (Ω)'},{id:'i',n:'Intensité I (A)'}], desc:"La loi d'Ohm relie la tension U, la résistance R et l'intensité I dans un circuit électrique : U = R × I. Elle permet de calculer une inconnue si les deux autres sont connues.", history:"Découverte par Georg Simon Ohm en 1827, publiée dans son ouvrage 'Die galvanische Kette'."},
    { cat: 'Elec', id:'pwr', name:"Puissance en courant continu", math:"P = U × I", ins:[{id:'p',n:'Puissance P (W)'},{id:'u',n:'Tension U (V)'},{id:'i',n:'Intensité I (A)'}], desc:"La puissance électrique en régime continu est le produit de la tension par l'intensité.", history:"Formule dérivée de la loi de Joule, utilisée depuis le 19e siècle."},
    { cat: 'Elec', id:'joule', name:"Effet Joule", math:"P = R × I²", ins:[{id:'p',n:'Puissance P (W)'},{id:'r',n:'Résistance R (Ω)'},{id:'i',n:'Intensité I (A)'}], desc:"L'effet Joule décrit la puissance dissipée sous forme de chaleur dans une résistance : P = R × I². Il explique l'échauffement des fils électriques.", history:"Découvert indépendamment par James Prescott Joule en 1841 et par Heinrich Lenz en 1842."},
    { cat: 'Elec', id:'r_ser', name:"Résistances en série", math:"R1 + R2 + R3", ins:[{id:'rs',n:'Résistance totale Rtot (Ω)'},{id:'r1',n:'Résistance R1 (Ω)'},{id:'r2',n:'Résistance R2 (Ω)'},{id:'r3',n:'Résistance R3 (Ω)'}], desc:"En série, la résistance totale est la somme des résistances individuelles.", history:"Principe établi par Georg Ohm dans ses expériences sur les circuits."},
    { cat: 'Elec', id:'r_par', name:"Résistances en parallèle", math:"1/Req = 1/R1 + 1/R2", ins:[{id:'rp',n:'Résistance totale Rtot (Ω)'},{id:'r1',n:'Résistance R1 (Ω)'},{id:'r2',n:'Résistance R2 (Ω)'}], desc:"En parallèle, l'inverse de la résistance totale est la somme des inverses des résistances.", history:"Découvert par Ohm et ses successeurs au 19e siècle."},
    { cat: 'Elec', id:'c_ser', name:"Condensateurs en série", math:"(C1*C2)/(C1+C2)", ins:[{id:'cs',n:'Capacité totale Ctot (F)'},{id:'c1',n:'Capacité C1 (F)'},{id:'c2',n:'Capacité C2 (F)'}], desc:"En série, la capacité totale est le produit divisé par la somme.", history:"Formule analogue aux résistances en parallèle, établie au 19e siècle."},
    { cat: 'Elec', id:'c_par', name:"Condensateurs en parallèle", math:"C1 + C2", ins:[{id:'cp',n:'Capacité totale Ctot (F)'},{id:'c1',n:'Capacité C1 (F)'},{id:'c2',n:'Capacité C2 (F)'}], desc:"En parallèle, la capacité totale est la somme des capacités individuelles.", history:"Principe similaire aux résistances en série."},
    { cat: 'Elec', id:'e_cap', name:"Énergie stockée dans un condensateur", math:"E = 0.5 × C × U²", ins:[{id:'e',n:'Énergie E (J)'},{id:'c',n:'Capacité C (F)'},{id:'u',n:'Tension U (V)'}], desc:"L'énergie stockée dans un condensateur chargé est proportionnelle à sa capacité et au carré de la tension.", history:"Découverte par les physiciens du 19e siècle lors de l'étude des phénomènes électrostatiques."},
    { cat: 'Elec', id:'e_ind', name:"Énergie stockée dans une bobine", math:"E = 0.5 × L × I²", ins:[{id:'e',n:'Énergie E (J)'},{id:'l',n:'Inductance L (H)'},{id:'i',n:'Intensité I (A)'}], desc:"L'énergie stockée dans une bobine parcourue par un courant est proportionnelle à son inductance et au carré de l'intensité.", history:"Établie par les travaux de Faraday et Henry au 19e siècle sur l'induction électromagnétique."},
    { cat: 'Elec', id:'react_c', name:"Réactance capacitive", math:"Xc = 1 / (2πfC)", ins:[{id:'xc',n:'Réactance Xc (Ω)'},{id:'f',n:'Fréquence f (Hz)'},{id:'c',n:'Capacité C (F)'}], desc:"La réactance capacitive oppose une résistance apparente au passage du courant alternatif.", history:"Concept développé avec l'avènement de l'électricité alternative par Tesla et Westinghouse."},
    { cat: 'Elec', id:'react_l', name:"Réactance inductive", math:"Xl = 2πfL", ins:[{id:'xl',n:'Réactance Xl (Ω)'},{id:'f',n:'Fréquence f (Hz)'},{id:'l',n:'Inductance L (H)'}], desc:"La réactance inductive oppose une résistance apparente au passage du courant alternatif dans une bobine.", history:"Liée aux découvertes de Faraday sur l'induction électromagnétique."},
    { cat: 'Elec', id:'z_rlc', name:"Impédance d'un circuit RLC", math:"√(R² + X²)", ins:[{id:'z',n:'Impédance Z (Ω)'},{id:'r',n:'Résistance R (Ω)'},{id:'x',n:'Réactance X (Ω)'}], desc:"L'impédance est la résistance totale d'un circuit en alternatif, combinant résistance et réactance.", history:"Concept clé de l'électrotechnique développé au 20e siècle."},
    { cat: 'Elec', id:'res_lc', name:"Fréquence de résonance LC", math:"f = 1/(2π√(LC))", ins:[{id:'f',n:'f (Hz)'},{id:'l',n:'L (H)'},{id:'c',n:'C (F)'}]},
    { cat: 'Elec', id:'duty_pwm', name:"Rapport cyclique PWM", math:"Duty% = (Ton / Tperiod) × 100", ins:[{id:'duty',n:'Rapport cyclique (%)'},{id:'ton',n:'Temps haut (ms)'},{id:'tperiod',n:'Période (ms)'}], desc:"Calcule le rapport cyclique d'un signal PWM pour contrôler la tension moyenne.", history:"Utilisé dans les variateurs de vitesse et les alimentations à découpage."},
    { cat: 'Elec', id:'led_serie', name:"LED en série - Résistance", math:"R = (Vcc - n×Vled) / I", ins:[{id:'r',n:'Résistance R (Ω)'},{id:'vcc',n:'Tension source (V)'},{id:'n',n:'Nombre de LED'},{id:'vled',n:'Tension par LED (V)'},{id:'i',n:'Courant (A)'}], desc:"Calcule la résistance pour plusieurs LED en série.", history:"Montage courant pour économiser l'énergie par rapport au montage parallèle."},
    { cat: 'Elec', id:'temp_conv', name:"Conversion Celsius ↔ Fahrenheit", math:"°F = (°C × 9/5) + 32", ins:[{id:'c',n:'Celsius (°C)'},{id:'f',n:'Fahrenheit (°F)'}], desc:"Convertit entre les échelles de température Celsius et Fahrenheit.", history:"Échelle Fahrenheit créée par Daniel Gabriel Fahrenheit en 1724."},
    { cat: 'Elec', id:'temp_kelvin', name:"Conversion Celsius ↔ Kelvin", math:"K = °C + 273.15", ins:[{id:'c',n:'Celsius (°C)'},{id:'k',n:'Kelvin (K)'}], desc:"Convertit entre Celsius et Kelvin (échelle absolue).", history:"Échelle Kelvin proposée par William Thomson (Lord Kelvin) en 1848."},

    // 🤖 MICRO / ESP32 (21-40)
    { cat: 'Micro', id:'adc', name:"Conversion analogique-numérique 12 bits", math:"V = (X/4095) * 3.3", ins:[{id:'v',n:'Tension V (V)'},{id:'x',n:'Valeur numérique X (0-4095)'}], desc:"Convertit une tension analogique en valeur numérique sur 12 bits pour les microcontrôleurs.", history:"Technologie développée dans les années 1970 avec les premiers ADC intégrés."},
    { cat: 'Micro', id:'div', name:"Pont diviseur de tension", math:"Vs = Ve * R2/(R1+R2)", ins:[{id:'vs',n:'Tension de sortie Vs (V)'},{id:'ve',n:'Tension d\'entrée Ve (V)'},{id:'r1',n:'Résistance R1 (Ω)'},{id:'r2',n:'Résistance R2 (Ω)'}], desc:"Le pont diviseur permet de réduire une tension d'entrée Ve en une tension de sortie Vs plus faible, utile pour adapter les signaux.", history:"Principe connu depuis le 19e siècle, largement utilisé en électronique analogique."},
    { cat: 'Micro', id:'led', name:"Calcul de la résistance pour une LED", math:"R = (Vcc-Vl)/I", ins:[{id:'r',n:'Résistance R (Ω)'},{id:'vcc',n:'Tension d\'alimentation Vcc (V)'},{id:'vl',n:'Tension de la LED Vl (V)'},{id:'i',n:'Courant de la LED I (A)'}], desc:"Calcule la résistance nécessaire pour limiter le courant dans une LED.", history:"Utilisé depuis l'invention des LED dans les années 1960."},
    { cat: 'Micro', id:'pwm', name:"Tension moyenne d'un signal PWM", math:"Vcc * Duty", ins:[{id:'v',n:'Tension moyenne V (V)'},{id:'vc',n:'Tension d\'alimentation Vcc (V)'},{id:'d',n:'Rapport cyclique Duty (%)'}], desc:"La modulation de largeur d'impulsion permet de simuler une tension variable.", history:"Technique inventée dans les années 1960 pour le contrôle des moteurs."},
    { cat: 'Micro', id:'bat', name:"Autonomie d'une batterie", math:"Cap / Conso", ins:[{id:'h',n:'Autonomie (heures)'},{id:'ca',n:'Capacité (mAh)'},{id:'co',n:'Consommation (mA)'}], desc:"Estime la durée de fonctionnement d'une batterie en fonction de sa capacité et de la consommation.", history:"Calcul essentiel pour les applications portables depuis les années 1980."},
    { cat: 'Micro', id:'servo', name:"Position d'un servo", math:"angle = (pulse - 1000) / 10", ins:[{id:'angle',n:'Angle (°)'},{id:'pulse',n:'Largeur d\'impulsion (µs)'}], desc:"Calcule l'angle d'un servo en fonction de la largeur d'impulsion PWM.", history:"Les servos utilisent un signal PWM standardisé (500-2500 µs pour 0-180°)."},
    { cat: 'Micro', id:'buzzer', name:"Fréquence d'un buzzer", math:"f = 1 / T", ins:[{id:'f',n:'Fréquence (Hz)'},{id:'t',n:'Période T (s)'}], desc:"La fréquence d'un buzzer est l'inverse de sa période.", history:"Les buzzers piezoélectriques sont courants dans les kits Arduino pour les alertes sonores."},
    { cat: 'Micro', id:'motor', name:"Vitesse d'un moteur DC", math:"RPM = (V / Vmax) * RPMmax", ins:[{id:'rpm',n:'Vitesse (RPM)'},{id:'v',n:'Tension V (V)'},{id:'vmax',n:'Tension max Vmax (V)'},{id:'rpmmax',n:'Vitesse max RPMmax (RPM)'}], desc:"Estime la vitesse d'un moteur DC en fonction de la tension appliquée.", history:"Les moteurs DC sont pilotés via PWM pour contrôler la vitesse."},
    { cat: 'Micro', id:'button', name:"Résistance pull-up", math:"R = Vcc / I", ins:[{id:'r',n:'Résistance R (Ω)'},{id:'vcc',n:'Tension Vcc (V)'},{id:'i',n:'Courant I (A)'}], desc:"Calcule la résistance pull-up pour un bouton afin de limiter le courant.", history:"Les résistances pull-up internes des microcontrôleurs simplifient les circuits."},
    { cat: 'Micro', id:'dist_robot', name:"Distance parcourue - Robot", math:"D = π × Ø × N", ins:[{id:'d',n:'Distance (cm)'},{id:'diam',n:'Diamètre roue (cm)'},{id:'n',n:'Nombre de tours'}], desc:"Calcule la distance parcourue par un robot à roues.", history:"Formule fondamentale en robotique mobile pour l'odométrie."},
    { cat: 'Micro', id:'adc_10bit', name:"Conversion ADC 10 bits (Arduino Uno)", math:"V = (X/1023) × Vref", ins:[{id:'v',n:'Tension (V)'},{id:'x',n:'Valeur ADC (0-1023)'},{id:'vref',n:'Vref (V)'}], desc:"Convertit la valeur ADC 10 bits en tension pour Arduino Uno.", history:"Arduino Uno utilise un ADC 10 bits avec Vref = 5V par défaut."},
    { cat: 'Micro', id:'freq_note', name:"Note musicale → Fréquence", math:"Notes standards", ins:[{id:'note',n:'Note (Do, Ré, Mi...)'},{id:'freq',n:'Fréquence (Hz)'}], desc:"Correspondance entre notes musicales et fréquences. Do4=262Hz, La4=440Hz (référence).", history:"La4=440Hz adopté comme standard international en 1939."},
    { cat: 'Micro', id:'time_delay', name:"Délai en microsecondes", math:"µs = ms × 1000", ins:[{id:'us',n:'Microsecondes (µs)'},{id:'ms',n:'Millisecondes (ms)'}], desc:"Convertit millisecondes en microsecondes pour les fonctions delay().", history:"delayMicroseconds() utile pour les temporisations précises."},
    { cat: 'Micro', id:'i2c_speed', name:"Vitesse I2C", math:"Standard: 100kHz, Fast: 400kHz", ins:[{id:'speed',n:'Vitesse (kHz)'},{id:'mode',n:'Mode (Standard/Fast)'}], desc:"Vitesses standard du bus I2C pour communication entre composants.", history:"Bus I2C développé par Philips en 1982."},
    { cat: 'Elec', id:'i_div', name:"Diviseur de courant", math:"I1 = Itotal × R2/(R1+R2)", ins:[{id:'i1',n:'Courant branche 1 (A)'},{id:'itot',n:'Courant total (A)'},{id:'r1',n:'Résistance R1 (Ω)'},{id:'r2',n:'Résistance R2 (Ω)'}], desc:"Calcule la répartition du courant dans deux résistances en parallèle. Le courant est inversement proportionnel aux résistances.", history:"Dérivé de la loi d'Ohm et des lois de Kirchhoff (1845)."},
    { cat: 'Micro', id:'led_par', name:"LED en parallèle - Résistance par branche", math:"R = (Vcc - Vled) / I", ins:[{id:'r',n:'Résistance par LED (Ω)'},{id:'vcc',n:'Tension source (V)'},{id:'vled',n:'Tension LED (V)'},{id:'i',n:'Courant par LED (A)'}], desc:"Chaque LED en parallèle nécessite sa propre résistance pour éviter la destruction. JAMAIS de LED en parallèle sans résistances individuelles !", history:"Erreur courante chez les débutants : les LED ont des Vf légèrement différentes, une seule résistance commune cause un déséquilibre fatal."},
    { cat: 'Elec', id:'v_ripple', name:"Ondulation tension (Ripple)", math:"ΔV = I / (f × C)", ins:[{id:'dv',n:'Ondulation ΔV (V)'},{id:'i',n:'Courant de charge (A)'},{id:'f',n:'Fréquence (Hz)'},{id:'c',n:'Capacité C (F)'}], desc:"Calcule l'ondulation résiduelle d'une tension filtrée par condensateur. Crucial pour les alimentations stabilisées.", history:"Fondamental en électronique de puissance pour dimensionner les condensateurs de filtrage."},
    { cat: 'Micro', id:'neo_power', name:"Consommation Néopixels", math:"P = N × 0.06 × Brightness", ins:[{id:'p',n:'Consommation (W)'},{id:'n',n:'Nombre de LEDs'},{id:'b',n:'Luminosité (0-1)'}], desc:"Estime la consommation d'une bande de Néopixels WS2812B. Chaque pixel consomme ~60mA max (blanc 100%).", history:"LED RGB addressables très populaires, mais très gourmandes en courant. Alimentation externe obligatoire au-delà de 10 LEDs."},
    { cat: 'Micro', id:'sr04_temp', name:"HC-SR04 compensation température", math:"Distance = (Durée × (331.3 + 0.606×T)) / 20000", ins:[{id:'dist',n:'Distance (cm)'},{id:'duree',n:'Durée echo (µs)'},{id:'temp',n:'Température (°C)'}], desc:"Calcul précis de distance avec HC-SR04 en compensant la vitesse du son selon la température. Vitesse son = 331.3 + 0.606×T m/s.", history:"La vitesse du son varie de ~6% entre -10°C et +30°C, affectant la précision."},
    
    // 📡 RADIO / RF (41-60)
    { cat: 'RF', id:'ant', name:"Longueur d'une antenne quart d'onde", math:"L = 75 / f", ins:[{id:'l',n:'Longueur L (m)'},{id:'f',n:'Fréquence f (MHz)'}], desc:"Calcule la longueur optimale d'une antenne pour une fréquence donnée.", history:"Basé sur les travaux de Hertz et Marconi à la fin du 19e siècle."},
    { cat: 'RF', id:'dbm', name:"Conversion dBm en mW", math:"10^(dBm/10)", ins:[{id:'p',n:'Puissance P (mW)'},{id:'d',n:'Puissance en dBm'}], desc:"Convertit l'unité logarithmique dBm en puissance absolue en mW.", history:"Unité introduite dans les télécommunications au 20e siècle."},
    { cat: 'RF', id:'wav', name:"Longueur d'onde", math:"λ = 300 / f", ins:[{id:'l',n:'Longueur d\'onde λ (m)'},{id:'f',n:'Fréquence f (MHz)'}], desc:"Relie la longueur d'onde à la fréquence dans l'air.", history:"Découverte par James Clerk Maxwell dans ses équations de l'électromagnétisme."},
    { cat: 'RF', id:'fspl', name:"Perte de propagation en espace libre", math:"20log(d) + 20log(f) + 32.4", ins:[{id:'p',n:'Perte P (dB)'},{id:'d',n:'Distance d (km)'},{id:'f',n:'Fréquence f (MHz)'}], desc:"Calcule l'atténuation du signal radio en fonction de la distance et de la fréquence.", history:"Formule établie par les ingénieurs radio dans les années 1940."},
    
    // 🔬 SIGNAL & AUDIO (61-80)
    { cat: 'Sig', id:'rc', name:"Fréquence de coupure d'un filtre RC", math:"Fc = 1/(2πRC)", ins:[{id:'f',n:'Fréquence de coupure Fc (Hz)'},{id:'r',n:'Résistance R (Ω)'},{id:'c',n:'Capacité C (F)'}], desc:"Détermine la fréquence à partir de laquelle un filtre RC atténue le signal.", history:"Fondamental en traitement du signal analogique depuis les années 1920."},
    { cat: 'Sig', id:'db_v', name:"Gain en tension en décibels", math:"20log(V2/V1)", ins:[{id:'g',n:'Gain G (dB)'},{id:'v1',n:'Tension d\'entrée V1 (V)'},{id:'v2',n:'Tension de sortie V2 (V)'}], desc:"Mesure l'amplification d'un signal en tension en échelle logarithmique.", history:"Unité dB introduite par Alexander Graham Bell en 1920."},
    { cat: 'Sig', id:'db_p', name:"Gain en puissance en décibels", math:"10log(P2/P1)", ins:[{id:'g',n:'Gain G (dB)'},{id:'p1',n:'Puissance d\'entrée P1 (W)'},{id:'p2',n:'Puissance de sortie P2 (W)'}], desc:"Mesure l'amplification d'un signal en puissance en échelle logarithmique.", history:"Extension de l'unité dB pour les puissances."},
    { cat: 'Sig', id:'sampling', name:"Théorème de Nyquist-Shannon", math:"fs = 2 * fmax", ins:[{id:'fs',n:'Fréquence d\'échantillonnage fs (Hz)'},{id:'fm',n:'Fréquence maximale fmax (Hz)'}], desc:"Définit la fréquence minimale d'échantillonnage pour éviter la perte d'information.", history:"Énoncé par Harry Nyquist en 1928 et Claude Shannon en 1949."},
    { cat: 'Sig', id:'tau_rc', name:"Constante de temps RC", math:"τ = R × C", ins:[{id:'t',n:'Constante de temps τ (s)'},{id:'r',n:'Résistance R (Ω)'},{id:'c',n:'Capacité C (F)'}], desc:"Mesure le temps de charge/décharge d'un circuit RC.", history:"Concept fondamental en électronique analogique."},

    // 🏗️ INGÉNIERIE (81-100)
    { cat: 'Inge', id:'temp', name:"Température de jonction", math:"Tj = Ta + P*Rth", ins:[{id:'tj',n:'Température de jonction Tj (°C)'},{id:'ta',n:'Température ambiante Ta (°C)'},{id:'p',n:'Puissance dissipée P (W)'},{id:'rt',n:'Résistance thermique Rth (°C/W)'}], desc:"Calcule la température interne d'un composant électronique.", history:"Important en thermique des circuits intégrés depuis les années 1970."},
    { cat: 'Inge', id:'torque', name:"Couple d'un moteur électrique", math:"P / ω", ins:[{id:'c',n:'Couple C (N·m)'},{id:'p',n:'Puissance P (W)'},{id:'w',n:'Vitesse angulaire ω (rad/s)'}], desc:"Relie la puissance mécanique à la vitesse de rotation.", history:"Fondamental en électromécanique depuis l'invention des moteurs."},
    { cat: 'Inge', id:'r_wire', name:"Loi de Pouillet", math:"R = ρ × L / S", ins:[{id:'r',n:'Résistance R (Ω)'},{id:'l',n:'Longueur L (m)'},{id:'s',n:'Section S (m²)'},{id:'mat',n:'Matériau'}], desc:"La loi de Pouillet calcule la résistance d'un conducteur en fonction de sa résistivité ρ, longueur L et section S.", history:"Énoncée par Claude Pouillet en 1837, basée sur les travaux d'Ohm."},
    { cat: 'Elec', id:'l_ser', name:"Inductances en série", math:"L1 + L2", ins:[{id:'ls',n:'Inductance totale Ltot (H)'},{id:'l1',n:'Inductance L1 (H)'},{id:'l2',n:'Inductance L2 (H)'}], desc:"En série, l'inductance totale est la somme des inductances individuelles.", history:"Analogue aux résistances en série."},
    { cat: 'Elec', id:'l_par', name:"Inductances en parallèle", math:"1/Ltot = 1/L1 + 1/L2", ins:[{id:'lp',n:'Inductance totale Ltot (H)'},{id:'l1',n:'Inductance L1 (H)'},{id:'l2',n:'Inductance L2 (H)'}], desc:"En parallèle, l'inverse de l'inductance totale est la somme des inverses.", history:"Analogue aux résistances en parallèle."},
    { cat: 'Elec', id:'res_lc', name:"Fréquence de résonance LC", math:"f = 1/(2π√(LC))", ins:[{id:'f',n:'Fréquence f (Hz)'},{id:'l',n:'Inductance L (H)'},{id:'c',n:'Capacité C (F)'}], desc:"Fréquence à laquelle un circuit LC oscille naturellement.", history:"Découverte par les physiciens du 19e siècle lors de l'étude des oscillations électriques."},
];

// --- MOTEUR DE CALCUL MULTIDIRECTIONNEL AMÉLIORÉ ---
function runMath(id) {
    const val = (k) => {
        let el = document.getElementById('m-' + id + '-' + k);
        if (!el) return null;
        let v = el.value.trim();
        if (v === '' || v === null || v === undefined) return null;
        let num = parseFloat(v);
        return isNaN(num) ? null : num;
    };
    
    let res = document.getElementById('res-' + id);
    if (!res) return;
    
    let v = {};
    const PI = Math.PI;

    try {
        switch(id) {
            // ⚡ ÉLECTRICITÉ
            case 'ohm': // U = R × I
                v = { u: val('u'), r: val('r'), i: val('i') };
                if(v.r && v.i) res.innerText = (v.r * v.i).toFixed(3) + " V";
                else if(v.u && v.i && v.i !== 0) res.innerText = (v.u / v.i).toFixed(3) + " Ω";
                else if(v.u && v.r && v.r !== 0) res.innerText = (v.u / v.r).toFixed(3) + " A";
                else res.innerText = "---";
                break;

            case 'pwr': // P = U × I
                v = { p: val('p'), u: val('u'), i: val('i') };
                if(v.u && v.i) res.innerText = (v.u * v.i).toFixed(3) + " W";
                else if(v.p && v.u && v.u !== 0) res.innerText = (v.p / v.u).toFixed(3) + " A";
                else if(v.p && v.i && v.i !== 0) res.innerText = (v.p / v.i).toFixed(3) + " V";
                else res.innerText = "---";
                break;

            case 'joule': // P = R × I²
                v = { p: val('p'), r: val('r'), i: val('i') };
                if(v.r && v.i) res.innerText = (v.r * v.i * v.i).toFixed(3) + " W";
                else if(v.p && v.r && v.r !== 0) res.innerText = Math.sqrt(v.p / v.r).toFixed(3) + " A";
                else if(v.p && v.i && v.i !== 0) res.innerText = (v.p / (v.i * v.i)).toFixed(3) + " Ω";
                else res.innerText = "---";
                break;

            case 'r_ser': // Rtot = R1 + R2 + R3
                v = { rs: val('rs'), r1: val('r1'), r2: val('r2'), r3: val('r3') };
                if(v.r1 && v.r2 && v.r3) {
                    // Calcul de Rtot
                    res.innerText = (v.r1 + v.r2 + v.r3).toFixed(3) + " Ω";
                } else if(v.r1 && v.r2) {
                    res.innerText = (v.r1 + v.r2).toFixed(3) + " Ω";
                } else if(v.rs && v.r1 && v.r2) {
                    // Calcul de R3 si Rtot, R1 et R2 connus
                    res.innerText = (v.rs - v.r1 - v.r2).toFixed(3) + " Ω (R3)";
                } else res.innerText = "---";
                break;

            case 'r_par': // 1/Req = 1/R1 + 1/R2
                v = { rp: val('rp'), r1: val('r1'), r2: val('r2') };
                if(v.r1 && v.r2 && v.r1 !== 0 && v.r2 !== 0) {
                    // Calcul de Rtot
                    res.innerText = (1 / (1/v.r1 + 1/v.r2)).toFixed(3) + " Ω";
                } else if(v.rp && v.r1 && v.rp !== 0 && v.r1 !== 0 && v.rp !== v.r1) {
                    // Calcul de R2 : R2 = (Rp*R1)/(R1-Rp)
                    res.innerText = ((v.rp * v.r1) / (v.r1 - v.rp)).toFixed(3) + " Ω (R2)";
                } else if(v.rp && v.r2 && v.rp !== 0 && v.r2 !== 0 && v.rp !== v.r2) {
                    // Calcul de R1 : R1 = (Rp*R2)/(R2-Rp)
                    res.innerText = ((v.rp * v.r2) / (v.r2 - v.rp)).toFixed(3) + " Ω (R1)";
                } else res.innerText = "---";
                break;

            case 'c_ser': // (C1*C2)/(C1+C2)
                v = { cs: val('cs'), c1: val('c1'), c2: val('c2') };
                if(v.c1 && v.c2 && (v.c1 + v.c2) !== 0) {
                    // Calcul de Ctot
                    res.innerText = ((v.c1 * v.c2) / (v.c1 + v.c2)).toFixed(9) + " F";
                } else if(v.cs && v.c1 && v.c1 > 0 && v.cs !== v.c1) {
                    // Calcul de C2 : C2 = (Cs*C1)/(C1-Cs)
                    res.innerText = ((v.cs * v.c1) / (v.c1 - v.cs)).toFixed(9) + " F (C2)";
                } else if(v.cs && v.c2 && v.c2 > 0 && v.cs !== v.c2) {
                    // Calcul de C1 : C1 = (Cs*C2)/(C2-Cs)
                    res.innerText = ((v.cs * v.c2) / (v.c2 - v.cs)).toFixed(9) + " F (C1)";
                } else res.innerText = "---";
                break;

            case 'c_par': // C1 + C2
                v = { cp: val('cp'), c1: val('c1'), c2: val('c2') };
                if(v.c1 && v.c2) {
                    // Calcul de Ctot
                    res.innerText = (v.c1 + v.c2).toFixed(9) + " F";
                } else if(v.cp && v.c1) {
                    // Calcul de C2 = Cp - C1
                    res.innerText = (v.cp - v.c1).toFixed(9) + " F (C2)";
                } else if(v.cp && v.c2) {
                    // Calcul de C1 = Cp - C2
                    res.innerText = (v.cp - v.c2).toFixed(9) + " F (C1)";
                } else res.innerText = "---";
                break;

            case 'e_cap': // E = 0.5 × C × U²
                v = { e: val('e'), c: val('c'), u: val('u') };
                if(v.c && v.u) res.innerText = (0.5 * v.c * v.u * v.u).toFixed(6) + " J";
                else if(v.e && v.u && v.u !== 0) res.innerText = (v.e / (0.5 * v.u * v.u)).toFixed(9) + " F";
                else if(v.e && v.c && v.c !== 0) res.innerText = Math.sqrt(v.e / (0.5 * v.c)).toFixed(3) + " V";
                else res.innerText = "---";
                break;

            case 'e_ind': // E = 0.5 × L × I²
                v = { e: val('e'), l: val('l'), i: val('i') };
                if(v.l && v.i) res.innerText = (0.5 * v.l * v.i * v.i).toFixed(6) + " J";
                else if(v.e && v.i && v.i !== 0) res.innerText = (v.e / (0.5 * v.i * v.i)).toFixed(6) + " H";
                else if(v.e && v.l && v.l !== 0) res.innerText = Math.sqrt(v.e / (0.5 * v.l)).toFixed(3) + " A";
                else res.innerText = "---";
                break;

            case 'react_c': // Xc = 1 / (2πfC)
                v = { xc: val('xc'), f: val('f'), c: val('c') };
                if(v.f && v.c && v.f !== 0 && v.c !== 0) {
                    // Calcul de Xc
                    res.innerText = (1 / (2 * PI * v.f * v.c)).toFixed(3) + " Ω";
                } else if(v.xc && v.f && v.xc !== 0 && v.f !== 0) {
                    // Calcul de C : C = 1/(2πfXc)
                    res.innerText = (1 / (2 * PI * v.f * v.xc)).toFixed(9) + " F";
                } else if(v.xc && v.c && v.xc !== 0 && v.c !== 0) {
                    // Calcul de f : f = 1/(2πXcC)
                    res.innerText = (1 / (2 * PI * v.xc * v.c)).toFixed(2) + " Hz";
                } else res.innerText = "---";
                break;

            case 'react_l': // Xl = 2πfL
                v = { xl: val('xl'), f: val('f'), l: val('l') };
                if(v.f && v.l) res.innerText = (2 * PI * v.f * v.l).toFixed(3) + " Ω";
                else if(v.xl && v.f && v.f !== 0) res.innerText = (v.xl / (2 * PI * v.f)).toFixed(6) + " H";
                else if(v.xl && v.l && v.l !== 0) res.innerText = (v.xl / (2 * PI * v.l)).toFixed(3) + " Hz";
                else res.innerText = "---";
                break;

            case 'z_rlc': // √(R² + X²)
                v = { z: val('z'), r: val('r'), x: val('x') };
                if(v.r !== null && v.x !== null) {
                    // Calcul de Z
                    res.innerText = Math.sqrt(v.r * v.r + v.x * v.x).toFixed(3) + " Ω";
                } else if(v.z && v.r !== null && v.z >= Math.abs(v.r)) {
                    // Calcul de X : X = √(Z²-R²)
                    res.innerText = Math.sqrt(v.z * v.z - v.r * v.r).toFixed(3) + " Ω (X)";
                } else if(v.z && v.x !== null && v.z >= Math.abs(v.x)) {
                    // Calcul de R : R = √(Z²-X²)
                    res.innerText = Math.sqrt(v.z * v.z - v.x * v.x).toFixed(3) + " Ω (R)";
                } else res.innerText = "---";
                break;

            case 'l_ser': // L1 + L2
                v = { ls: val('ls'), l1: val('l1'), l2: val('l2') };
                if(v.l1 && v.l2) {
                    // Calcul de Ltot
                    res.innerText = (v.l1 + v.l2).toFixed(6) + " H";
                } else if(v.ls && v.l1) {
                    // Calcul de L2 = Ls - L1
                    res.innerText = (v.ls - v.l1).toFixed(6) + " H (L2)";
                } else if(v.ls && v.l2) {
                    // Calcul de L1 = Ls - L2
                    res.innerText = (v.ls - v.l2).toFixed(6) + " H (L1)";
                } else res.innerText = "---";
                break;

            case 'l_par': // 1/Ltot = 1/L1 + 1/L2
                v = { lp: val('lp'), l1: val('l1'), l2: val('l2') };
                if(v.l1 && v.l2 && v.l1 !== 0 && v.l2 !== 0) {
                    // Calcul de Ltot
                    res.innerText = (1 / (1/v.l1 + 1/v.l2)).toFixed(6) + " H";
                } else if(v.lp && v.l1 && v.lp !== 0 && v.l1 !== 0 && v.lp !== v.l1) {
                    // Calcul de L2 : L2 = (Lp*L1)/(L1-Lp)
                    res.innerText = ((v.lp * v.l1) / (v.l1 - v.lp)).toFixed(6) + " H (L2)";
                } else if(v.lp && v.l2 && v.lp !== 0 && v.l2 !== 0 && v.lp !== v.l2) {
                    // Calcul de L1 : L1 = (Lp*L2)/(L2-Lp)
                    res.innerText = ((v.lp * v.l2) / (v.l2 - v.lp)).toFixed(6) + " H (L1)";
                } else res.innerText = "---";
                break;

            case 'res_lc': // f = 1/(2π√(LC))
                v = { f: val('f'), l: val('l'), c: val('c') };
                if(v.l && v.c && v.l > 0 && v.c > 0) {
                    // Calcul de f à partir de L et C
                    res.innerText = (1 / (2 * PI * Math.sqrt(v.l * v.c))).toFixed(2) + " Hz";
                } else if(v.f && v.c && v.f > 0 && v.c > 0) {
                    // Calcul de L à partir de f et C : L = 1/(4π²f²C)
                    res.innerText = (1 / (4 * PI * PI * v.f * v.f * v.c)).toFixed(6) + " H";
                } else if(v.f && v.l && v.f > 0 && v.l > 0) {
                    // Calcul de C à partir de f et L : C = 1/(4π²f²L)
                    res.innerText = (1 / (4 * PI * PI * v.f * v.f * v.l)).toFixed(9) + " F";
                } else res.innerText = "---";
                break;

            // 🤖 MICRO / ESP32
            case 'adc': // V = (X/4095) * 3.3
                v = { v: val('v'), x: val('x') };
                if(v.x !== null) res.innerText = ((v.x / 4095) * 3.3).toFixed(3) + " V";
                else if(v.v !== null) res.innerText = Math.round((v.v / 3.3) * 4095) + " (valeur numérique)";
                else res.innerText = "---";
                break;

            case 'div': // Vs = Ve * R2/(R1+R2)
                v = { vs: val('vs'), ve: val('ve'), r1: val('r1'), r2: val('r2') };
                if(v.ve && v.r1 && v.r2 && (v.r1 + v.r2) !== 0) {
                    // Calcul de Vs
                    res.innerText = (v.ve * v.r2 / (v.r1 + v.r2)).toFixed(3) + " V";
                } else if(v.vs && v.ve && v.r1 && v.vs !== 0 && v.ve !== 0) {
                    // Calcul de R2 : R2 = (Vs*R1)/(Ve-Vs)
                    if((v.ve - v.vs) !== 0) {
                        res.innerText = ((v.vs * v.r1) / (v.ve - v.vs)).toFixed(3) + " Ω (R2)";
                    } else res.innerText = "---";
                } else if(v.vs && v.ve && v.r2 && v.vs !== 0 && v.ve !== 0) {
                    // Calcul de R1 : R1 = R2*(Ve-Vs)/Vs
                    if(v.vs !== 0) {
                        res.innerText = (v.r2 * (v.ve - v.vs) / v.vs).toFixed(3) + " Ω (R1)";
                    } else res.innerText = "---";
                } else res.innerText = "---";
                break;

            case 'led': // R = (Vcc-Vl)/I
                v = { r: val('r'), vcc: val('vcc'), vl: val('vl'), i: val('i') };
                if(v.vcc && v.vl && v.i && v.i !== 0) {
                    // Calcul de R
                    res.innerText = ((v.vcc - v.vl) / v.i).toFixed(1) + " Ω";
                } else if(v.r && v.vl && v.i && v.r !== 0) {
                    // Calcul de Vcc : Vcc = Vl + R*I
                    res.innerText = (v.vl + v.r * v.i).toFixed(2) + " V (Vcc)";
                } else if(v.r && v.vcc && v.i && v.r !== 0) {
                    // Calcul de Vl : Vl = Vcc - R*I
                    res.innerText = (v.vcc - v.r * v.i).toFixed(2) + " V (LED)";
                } else if(v.r && v.vcc && v.vl && v.r !== 0) {
                    // Calcul de I : I = (Vcc-Vl)/R
                    res.innerText = ((v.vcc - v.vl) / v.r).toFixed(4) + " A";
                } else res.innerText = "---";
                break;

            case 'pwm': // Vavg = Vcc * Duty
                v = { v: val('v'), vc: val('vc'), d: val('d') };
                if(v.vc && v.d !== null) res.innerText = (v.vc * v.d / 100).toFixed(3) + " V";
                else if(v.v && v.vc && v.vc !== 0) res.innerText = ((v.v / v.vc) * 100).toFixed(1) + " %";
                else res.innerText = "---";
                break;

            case 'bat': // h = Cap / Conso
                v = { h: val('h'), ca: val('ca'), co: val('co') };
                if(v.ca && v.co && v.co !== 0) res.innerText = (v.ca / v.co).toFixed(1) + " h";
                else if(v.h && v.co) res.innerText = (v.h * v.co).toFixed(1) + " mAh";
                else if(v.h && v.ca && v.h !== 0) res.innerText = (v.ca / v.h).toFixed(1) + " mA";
                else res.innerText = "---";
                break;

            case 'servo': // angle = (pulse - 1000) / 10
                v = { angle: val('angle'), pulse: val('pulse') };
                if(v.pulse !== null) res.innerText = ((v.pulse - 1000) / 10).toFixed(1) + " °";
                else if(v.angle !== null) res.innerText = (1000 + v.angle * 10).toFixed(0) + " µs";
                else res.innerText = "---";
                break;

            case 'buzzer': // f = 1 / T
                v = { f: val('f'), t: val('t') };
                if(v.t && v.t !== 0) res.innerText = (1 / v.t).toFixed(1) + " Hz";
                else if(v.f && v.f !== 0) res.innerText = (1 / v.f).toFixed(6) + " s";
                else res.innerText = "---";
                break;

            case 'motor': // RPM = (V / Vmax) * RPMmax
                v = { rpm: val('rpm'), v: val('v'), vmax: val('vmax'), rpmmax: val('rpmmax') };
                if(v.v && v.vmax && v.rpmmax && v.vmax !== 0) {
                    // Calcul de RPM
                    res.innerText = ((v.v / v.vmax) * v.rpmmax).toFixed(0) + " RPM";
                } else if(v.rpm && v.vmax && v.rpmmax && v.rpmmax !== 0) {
                    // Calcul de V : V = (RPM*Vmax)/RPMmax
                    res.innerText = ((v.rpm * v.vmax) / v.rpmmax).toFixed(2) + " V";
                } else res.innerText = "---";
                break;

            case 'button': // R = Vcc / I
                v = { r: val('r'), vcc: val('vcc'), i: val('i') };
                if(v.vcc && v.i && v.i !== 0) {
                    // Calcul de R
                    res.innerText = (v.vcc / v.i).toFixed(1) + " Ω";
                } else if(v.r && v.i && v.r !== 0) {
                    // Calcul de Vcc : Vcc = R*I
                    res.innerText = (v.r * v.i).toFixed(2) + " V";
                } else if(v.r && v.vcc && v.r !== 0) {
                    // Calcul de I : I = Vcc/R
                    res.innerText = (v.vcc / v.r).toFixed(4) + " A";
                } else res.innerText = "---";
                break;

            // 📡 RADIO / RF
            case 'ant': // L = 75 / f
                v = { l: val('l'), f: val('f') };
                if(v.f && v.f !== 0) res.innerText = (75 / v.f).toFixed(3) + " m";
                else if(v.l && v.l !== 0) res.innerText = (75 / v.l).toFixed(2) + " MHz";
                else res.innerText = "---";
                break;

            case 'dbm': // P(mW) = 10^(dBm/10)
                v = { p: val('p'), d: val('d') };
                if(v.d !== null) res.innerText = Math.pow(10, v.d / 10).toFixed(3) + " mW";
                else if(v.p && v.p > 0) res.innerText = (10 * Math.log10(v.p)).toFixed(1) + " dBm";
                else res.innerText = "---";
                break;

            case 'wav': // λ = 300 / f
                v = { l: val('l'), f: val('f') };
                if(v.f && v.f !== 0) res.innerText = (300 / v.f).toFixed(3) + " m";
                else if(v.l && v.l !== 0) res.innerText = (300 / v.l).toFixed(2) + " MHz";
                else res.innerText = "---";
                break;

            case 'fspl': // 20log(d) + 20log(f) + 32.4
                v = { p: val('p'), d: val('d'), f: val('f') };
                if(v.d && v.f && v.d > 0 && v.f > 0) {
                    res.innerText = (20 * Math.log10(v.d) + 20 * Math.log10(v.f) + 32.4).toFixed(1) + " dB";
                } else res.innerText = "---";
                break;

            // 🔬 SIGNAL
            case 'rc': // Fc = 1/(2πRC)
                v = { f: val('f'), r: val('r'), c: val('c') };
                if(v.r && v.c && v.r > 0 && v.c > 0) {
                    // Calcul de Fc
                    res.innerText = (1 / (2 * PI * v.r * v.c)).toFixed(2) + " Hz";
                } else if(v.f && v.r && v.f > 0 && v.r > 0) {
                    // Calcul de C : C = 1/(2πfR)
                    res.innerText = (1 / (2 * PI * v.f * v.r)).toFixed(9) + " F";
                } else if(v.f && v.c && v.f > 0 && v.c > 0) {
                    // Calcul de R : R = 1/(2πfC)
                    res.innerText = (1 / (2 * PI * v.f * v.c)).toFixed(3) + " Ω";
                } else res.innerText = "---";
                break;

            case 'db_v': // G = 20log(V2/V1)
                v = { g: val('g'), v1: val('v1'), v2: val('v2') };
                if(v.v1 && v.v2 && v.v1 > 0 && v.v2 > 0) {
                    // Calcul de G
                    res.innerText = (20 * Math.log10(v.v2 / v.v1)).toFixed(1) + " dB";
                } else if(v.g !== null && v.v1 && v.v1 > 0) {
                    // Calcul de V2 : V2 = V1 * 10^(G/20)
                    res.innerText = (v.v1 * Math.pow(10, v.g / 20)).toFixed(3) + " V (V2)";
                } else if(v.g !== null && v.v2 && v.v2 > 0) {
                    // Calcul de V1 : V1 = V2 / 10^(G/20)
                    res.innerText = (v.v2 / Math.pow(10, v.g / 20)).toFixed(3) + " V (V1)";
                } else res.innerText = "---";
                break;

            case 'db_p': // G = 10log(P2/P1)
                v = { g: val('g'), p1: val('p1'), p2: val('p2') };
                if(v.p1 && v.p2 && v.p1 > 0 && v.p2 > 0) {
                    // Calcul de G
                    res.innerText = (10 * Math.log10(v.p2 / v.p1)).toFixed(1) + " dB";
                } else if(v.g !== null && v.p1 && v.p1 > 0) {
                    // Calcul de P2 : P2 = P1 * 10^(G/10)
                    res.innerText = (v.p1 * Math.pow(10, v.g / 10)).toFixed(3) + " W (P2)";
                } else if(v.g !== null && v.p2 && v.p2 > 0) {
                    // Calcul de P1 : P1 = P2 / 10^(G/10)
                    res.innerText = (v.p2 / Math.pow(10, v.g / 10)).toFixed(3) + " W (P1)";
                } else res.innerText = "---";
                break;

            case 'sampling': // fs = 2 * fmax
                v = { fs: val('fs'), fm: val('fm') };
                if(v.fm) res.innerText = (2 * v.fm).toFixed(1) + " Hz";
                else if(v.fs && v.fs !== 0) res.innerText = (v.fs / 2).toFixed(1) + " Hz";
                else res.innerText = "---";
                break;

            case 'tau_rc': // τ = R × C
                v = { t: val('t'), r: val('r'), c: val('c') };
                if(v.r && v.c) res.innerText = (v.r * v.c).toFixed(6) + " s";
                else if(v.t && v.r && v.r !== 0) res.innerText = (v.t / v.r).toFixed(9) + " F";
                else if(v.t && v.c && v.c !== 0) res.innerText = (v.t / v.c).toFixed(3) + " Ω";
                else res.innerText = "---";
                break;

            // NOUVEAUX CALCULATEURS
            case 'duty_pwm': // Duty% = (Ton / Tperiod) × 100
                v = { duty: val('duty'), ton: val('ton'), tperiod: val('tperiod') };
                if(v.ton && v.tperiod && v.tperiod !== 0) {
                    res.innerText = ((v.ton / v.tperiod) * 100).toFixed(1) + " %";
                } else if(v.duty && v.tperiod) {
                    res.innerText = ((v.duty / 100) * v.tperiod).toFixed(3) + " ms (Ton)";
                } else if(v.duty && v.ton && v.duty !== 0) {
                    res.innerText = (v.ton / (v.duty / 100)).toFixed(3) + " ms (Période)";
                } else res.innerText = "---";
                break;

            case 'led_serie': // R = (Vcc - n×Vled) / I
                v = { r: val('r'), vcc: val('vcc'), n: val('n'), vled: val('vled'), i: val('i') };
                if(v.vcc && v.n && v.vled && v.i && v.i !== 0) {
                    res.innerText = ((v.vcc - v.n * v.vled) / v.i).toFixed(1) + " Ω";
                } else if(v.r && v.n && v.vled && v.i) {
                    res.innerText = (v.n * v.vled + v.r * v.i).toFixed(2) + " V (Vcc)";
                } else if(v.r && v.vcc && v.vled && v.i && v.r !== 0) {
                    res.innerText = ((v.vcc - v.r * v.i) / v.vled).toFixed(0) + " LED max";
                } else res.innerText = "---";
                break;

            case 'temp_conv': // °F = (°C × 9/5) + 32
                v = { c: val('c'), f: val('f') };
                if(v.c !== null) res.innerText = ((v.c * 9/5) + 32).toFixed(1) + " °F";
                else if(v.f !== null) res.innerText = ((v.f - 32) * 5/9).toFixed(1) + " °C";
                else res.innerText = "---";
                break;

            case 'temp_kelvin': // K = °C + 273.15
                v = { c: val('c'), k: val('k') };
                if(v.c !== null) res.innerText = (v.c + 273.15).toFixed(2) + " K";
                else if(v.k !== null) res.innerText = (v.k - 273.15).toFixed(2) + " °C";
                else res.innerText = "---";
                break;

            case 'dist_robot': // D = π × Ø × N
                v = { d: val('d'), diam: val('diam'), n: val('n') };
                if(v.diam && v.n) {
                    res.innerText = (PI * v.diam * v.n).toFixed(2) + " cm";
                } else if(v.d && v.diam && v.diam !== 0) {
                    res.innerText = (v.d / (PI * v.diam)).toFixed(1) + " tours";
                } else if(v.d && v.n && v.n !== 0) {
                    res.innerText = (v.d / (PI * v.n)).toFixed(2) + " cm (Ø)";
                } else res.innerText = "---";
                break;

            case 'adc_10bit': // V = (X/1023) × Vref
                v = { v: val('v'), x: val('x'), vref: val('vref') };
                if(v.x !== null && v.vref) {
                    res.innerText = ((v.x / 1023) * v.vref).toFixed(3) + " V";
                } else if(v.v !== null && v.vref && v.vref !== 0) {
                    res.innerText = Math.round((v.v / v.vref) * 1023) + " (ADC)";
                } else res.innerText = "---";
                break;

            case 'freq_note': // Notes musicales
                const notes = {
                    'do': 262, 'do#': 277, 're': 294, 're#': 311,
                    'mi': 330, 'fa': 349, 'fa#': 370, 'sol': 392,
                    'sol#': 415, 'la': 440, 'la#': 466, 'si': 494
                };
                v = { note: val('note'), freq: val('freq') };
                if(v.note && notes[v.note.toLowerCase()]) {
                    res.innerText = notes[v.note.toLowerCase()] + " Hz";
                } else if(v.freq) {
                    let closestNote = '';
                    let minDiff = Infinity;
                    for (let n in notes) {
                        let diff = Math.abs(notes[n] - v.freq);
                        if (diff < minDiff) {
                            minDiff = diff;
                            closestNote = n.toUpperCase();
                        }
                    }
                    res.innerText = closestNote + " (" + notes[closestNote.toLowerCase()] + " Hz)";
                } else res.innerText = "---";
                break;

            case 'time_delay': // µs = ms × 1000
                v = { us: val('us'), ms: val('ms') };
                if(v.ms !== null) res.innerText = (v.ms * 1000).toFixed(0) + " µs";
                else if(v.us !== null) res.innerText = (v.us / 1000).toFixed(3) + " ms";
                else res.innerText = "---";
                break;

            case 'i2c_speed': // Vitesse I2C
                v = { speed: val('speed'), mode: val('mode') };
                const i2cModes = { 'standard': 100, 'fast': 400, 'fast-plus': 1000, 'high-speed': 3400 };
                if(v.mode && i2cModes[v.mode.toLowerCase()]) {
                    res.innerText = i2cModes[v.mode.toLowerCase()] + " kHz";
                } else if(v.speed) {
                    if(v.speed <= 100) res.innerText = "Mode Standard";
                    else if(v.speed <= 400) res.innerText = "Mode Fast";
                    else if(v.speed <= 1000) res.innerText = "Mode Fast-Plus";
                    else res.innerText = "Mode High-Speed";
                } else res.innerText = "---";
                break;

            // 🏗️ INGÉNIERIE
            case 'temp': // Tj = Ta + P*Rth
                v = { tj: val('tj'), ta: val('ta'), p: val('p'), rt: val('rt') };
                if(v.ta !== null && v.p && v.rt) {
                    // Calcul de Tj
                    res.innerText = (v.ta + v.p * v.rt).toFixed(1) + " °C";
                } else if(v.tj !== null && v.ta !== null && v.rt && v.rt !== 0) {
                    // Calcul de P : P = (Tj-Ta)/Rth
                    res.innerText = ((v.tj - v.ta) / v.rt).toFixed(2) + " W";
                } else if(v.tj !== null && v.ta !== null && v.p && v.p !== 0) {
                    // Calcul de Rth : Rth = (Tj-Ta)/P
                    res.innerText = ((v.tj - v.ta) / v.p).toFixed(2) + " °C/W";
                } else if(v.tj !== null && v.p && v.rt) {
                    // Calcul de Ta : Ta = Tj - P*Rth
                    res.innerText = (v.tj - v.p * v.rt).toFixed(1) + " °C (Ta)";
                } else res.innerText = "---";
                break;

            case 'torque': // C = P / ω
                v = { c: val('c'), p: val('p'), w: val('w') };
                if(v.p && v.w && v.w !== 0) res.innerText = (v.p / v.w).toFixed(3) + " N·m";
                else if(v.c && v.w) res.innerText = (v.c * v.w).toFixed(3) + " W";
                else if(v.c && v.p && v.c !== 0) res.innerText = (v.p / v.c).toFixed(3) + " rad/s";
                else res.innerText = "---";
                break;

            case 'r_wire': // R = ρ × L / S
                const rho = { cu: 1.68e-8, al: 2.65e-8, fe: 9.71e-8, ag: 1.59e-8, au: 2.44e-8 };
                const matEl = document.getElementById('m-' + id + '-mat');
                v = { r: val('r'), l: val('l'), s: val('s'), mat: matEl ? matEl.value : null };
                if(v.l && v.s && v.mat && v.s !== 0 && rho[v.mat]) {
                    // Calcul de R
                    res.innerText = (rho[v.mat] * v.l / v.s).toFixed(6) + " Ω";
                } else if(v.r && v.s && v.mat && rho[v.mat] && rho[v.mat] !== 0) {
                    // Calcul de L : L = R*S/ρ
                    res.innerText = ((v.r * v.s) / rho[v.mat]).toFixed(3) + " m";
                } else if(v.r && v.l && v.mat && v.l !== 0 && rho[v.mat] && rho[v.mat] !== 0) {
                    // Calcul de S : S = ρ*L/R
                    res.innerText = ((rho[v.mat] * v.l) / v.r).toFixed(9) + " m²";
                } else res.innerText = "---";
                break;

            // === NOUVEAUX CALCULATEURS AJOUTÉS ===
            
            case 'i_div': // Diviseur de courant : I1 = Itotal × R2/(R1+R2)
                v = { i1: val('i1'), itot: val('itot'), r1: val('r1'), r2: val('r2') };
                if(v.itot && v.r1 && v.r2 && (v.r1 + v.r2) !== 0) {
                    // Calcul de I1
                    const i1_result = v.itot * v.r2 / (v.r1 + v.r2);
                    const i2_result = v.itot * v.r1 / (v.r1 + v.r2);
                    res.innerText = `I1 = ${i1_result.toFixed(4)} A | I2 = ${i2_result.toFixed(4)} A`;
                } else if(v.i1 && v.r1 && v.r2 && v.r2 !== 0 && (v.r1 + v.r2) !== 0) {
                    // Calcul de Itotal depuis I1
                    res.innerText = (v.i1 * (v.r1 + v.r2) / v.r2).toFixed(4) + " A (Itotal)";
                } else res.innerText = "---";
                break;

            case 'led_par': // LED en parallèle : R = (Vcc - Vled) / I
                v = { r: val('r'), vcc: val('vcc'), vled: val('vled'), i: val('i') };
                if(v.vcc && v.vled && v.i && v.i !== 0 && v.vcc > v.vled) {
                    // Calcul résistance par branche
                    const r_calc = (v.vcc - v.vled) / v.i;
                    res.innerText = `${r_calc.toFixed(1)} Ω par LED | Puissance : ${((v.vcc - v.vled) * v.i).toFixed(2)} W`;
                } else if(v.r && v.vcc && v.vled && v.r !== 0 && v.vcc > v.vled) {
                    // Calcul courant
                    res.innerText = ((v.vcc - v.vled) / v.r).toFixed(4) + " A par LED";
                } else if(v.r && v.vled && v.i && v.i !== 0) {
                    // Calcul Vcc
                    res.innerText = (v.vled + v.r * v.i).toFixed(2) + " V (Vcc min)";
                } else res.innerText = "---";
                break;

            case 'v_ripple': // Ondulation : ΔV = I / (f × C)
                v = { dv: val('dv'), i: val('i'), f: val('f'), c: val('c') };
                if(v.i && v.f && v.c && v.f !== 0 && v.c !== 0) {
                    // Calcul ondulation
                    res.innerText = (v.i / (v.f * v.c)).toFixed(4) + " V ripple";
                } else if(v.dv && v.f && v.c && v.f !== 0 && v.dv !== 0) {
                    // Calcul courant max
                    res.innerText = (v.dv * v.f * v.c).toFixed(3) + " A max";
                } else if(v.dv && v.i && v.f && v.dv !== 0 && v.f !== 0) {
                    // Calcul capacité nécessaire
                    const c_calc = v.i / (v.f * v.dv);
                    const c_uF = c_calc * 1e6;
                    res.innerText = `${c_calc.toFixed(6)} F = ${c_uF.toFixed(1)} µF`;
                } else res.innerText = "---";
                break;

            case 'neo_power': // Néopixels : P = N × 0.06 × Brightness
                v = { p: val('p'), n: val('n'), b: val('b') };
                if(v.n && v.b !== null) {
                    // Calcul puissance
                    const watts = v.n * 0.06 * v.b;
                    const amps = watts / 5; // Alimentation 5V
                    res.innerText = `${watts.toFixed(2)} W | ${amps.toFixed(2)} A @ 5V`;
                } else if(v.p && v.b && v.b !== 0) {
                    // Calcul nombre de LEDs possible
                    res.innerText = Math.floor(v.p / (0.06 * v.b)) + " LEDs max";
                } else if(v.p && v.n && v.n !== 0) {
                    // Calcul luminosité max possible
                    res.innerText = (v.p / (v.n * 0.06)).toFixed(2) + " (0-1 brightness)";
                } else res.innerText = "---";
                break;

            case 'sr04_temp': // HC-SR04 avec compensation température
                v = { dist: val('dist'), duree: val('duree'), temp: val('temp') };
                if(v.duree && v.temp !== null) {
                    // Calcul distance avec compensation
                    const speedSound = 331.3 + (0.606 * v.temp); // m/s
                    const distance = (v.duree * speedSound) / 20000; // /2 (aller-retour) et /10000 (µs→s, m→cm)
                    res.innerText = `${distance.toFixed(2)} cm | Vitesse son: ${speedSound.toFixed(1)} m/s`;
                } else if(v.dist && v.temp !== null) {
                    // Calcul durée nécessaire
                    const speedSound = 331.3 + (0.606 * v.temp);
                    const duree_calc = (v.dist * 20000) / speedSound;
                    res.innerText = duree_calc.toFixed(0) + " µs";
                } else res.innerText = "---";
                break;

            default:
                res.innerText = "---";
        }
        
        // Sauvegarder dans l'historique si résultat valide
        if (res.innerText !== "---" && res.innerText !== "Erreur") {
            const formula = formulas.find(f => f.id === id);
            if (formula) {
                const inputs = {};
                formula.ins.forEach(input => {
                    const inputVal = val(input.id);
                    if (inputVal !== null) {
                        inputs[input.n] = inputVal + ' ' + (input.unit || '');
                    }
                });
                saveCalculation(id, inputs, res.innerText);
                
                // Mettre à jour le badge
                const badge = document.getElementById('history-count');
                if (badge && calculationHistory.length > 0) {
                    badge.textContent = calculationHistory.length;
                    badge.style.display = 'flex';
                }
            }
        }
    } catch(e) {
        console.error('Erreur calcul pour ' + id + ':', e);
        res.innerText = "Erreur";
    }
}

// --- NAVIGATION & INTERFACE ---
window.switchView = function(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
    document.getElementById(id).classList.add('active-view');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    let btnId = 'nav-' + id.split('-')[1];
    if(document.getElementById(btnId)) document.getElementById(btnId).classList.add('active');
    if(id === 'view-tools') renderTools();
    if(id === 'view-folders') renderFolders();
    if(id === 'view-boards') renderBoards();
    if(id === 'view-components') renderComponentCategories();
}

// --- CARTES ARDUINO ---
function renderBoards() {
    const list = document.getElementById('board-list');
    list.innerHTML = arduinoBoards.map(board => `
        <div class="folder-item" onclick="showBoardDetail('${board.id}')" style="border-left: 5px solid var(--success);">
            <div class="folder-thumb" style="font-size:28px;">${board.icon}</div>
            <div style="flex:1">
                <b>${board.name}</b><br>
                <span style="font-size:11px; opacity:0.6;">${board.microcontroller} • ${board.clock}</span>
            </div>
            <span style="font-size:18px;">→</span>
        </div>
    `).join('');
}

function showBoardDetail(boardId) {
    const board = arduinoBoards.find(b => b.id === boardId);
    if (!board) return;
    
    document.getElementById('board-detail-title').innerText = board.name;
    document.getElementById('board-detail-content').innerHTML = `
        <div style="text-align:center; font-size:48px; margin:20px 0;">${board.icon}</div>
        
        <div class="card">
            <h3 style="color:var(--accent); margin-top:0;">📋 Description</h3>
            <p>${board.description}</p>
        </div>

        <div class="card">
            <h3 style="color:var(--accent); margin-top:0;">⚙️ Caractéristiques</h3>
            <table style="width:100%; font-size:14px; line-height:1.8;">
                <tr><td style="color:#94a3b8;">Microcontrôleur</td><td><b>${board.microcontroller}</b></td></tr>
                <tr><td style="color:#94a3b8;">Tension</td><td><b>${board.voltage}</b></td></tr>
                <tr><td style="color:#94a3b8;">Fréquence</td><td><b>${board.clock}</b></td></tr>
                <tr><td style="color:#94a3b8;">Mémoire Flash</td><td><b>${board.flash}</b></td></tr>
                <tr><td style="color:#94a3b8;">SRAM</td><td><b>${board.sram}</b></td></tr>
                <tr><td style="color:#94a3b8;">EEPROM</td><td><b>${board.eeprom}</b></td></tr>
                <tr><td style="color:#94a3b8;">Broches numériques</td><td><b>${board.digitalPins}</b></td></tr>
                <tr><td style="color:#94a3b8;">Entrées analogiques</td><td><b>${board.analogPins}</b></td></tr>
                <tr><td style="color:#94a3b8;">Sorties PWM</td><td><b>${board.pwmPins}</b></td></tr>
                <tr><td style="color:#94a3b8;">Courant par broche</td><td><b>${board.currentPerPin}</b></td></tr>
                <tr><td style="color:#94a3b8;">USB</td><td><b>${board.usbType}</b></td></tr>
                <tr><td style="color:#94a3b8;">Dimensions</td><td><b>${board.dimensions}</b></td></tr>
            </table>
        </div>

        <div class="card">
            <h3 style="color:var(--accent); margin-top:0;">✨ Fonctionnalités</h3>
            <ul style="line-height:1.8; padding-left:20px;">
                ${board.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
        </div>

        <div class="card">
            <h3 style="color:var(--accent); margin-top:0;">📌 Brochage (Pinout)</h3>
            <pre style="background:#0f172a; padding:15px; border-radius:8px; font-size:12px; line-height:1.6; white-space:pre-wrap;">${board.pinout}</pre>
        </div>

        <div class="card">
            <h3 style="color:var(--accent); margin-top:0;">🎯 Applications</h3>
            <p>${board.applications}</p>
        </div>
    `;
    
    openModal('modal-board-detail');
}

// --- COMPOSANTS ---
function renderComponentCategories() {
    const list = document.getElementById('component-category-list');
    list.innerHTML = `
        <div id="categories-section">
            <h3 style="color:var(--accent); margin:0 20px 15px 20px; font-size:16px;">📂 Catégories</h3>
            <div id="categories-list">
                ${componentCategories.map(cat => `
                    <div class="folder-item category-item" 
                         data-category-id="${cat.id}" 
                         data-category-name="${cat.name.toLowerCase()}" 
                         data-category-desc="${cat.description.toLowerCase()}" 
                         onclick="showComponentList('${cat.id}')" 
                         style="border-left: 5px solid var(--accent); cursor: pointer;">
                        <div class="folder-thumb" style="font-size:28px;">${cat.icon}</div>
                        <div style="flex:1">
                            <b>${cat.name}</b><br>
                            <span style="font-size:11px; opacity:0.6;">${cat.description}</span>
                        </div>
                        <span style="font-size:18px;">→</span>
                    </div>
                `).join('')}
            </div>
        </div>
        <div id="components-section" style="display:none;">
            <h3 style="color:var(--accent); margin:20px 20px 15px 20px; font-size:16px;">⚡ Composants</h3>
            <div id="components-results"></div>
        </div>
    `;
}

function filterComponentCategories(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    const categoriesSection = document.getElementById('categories-section');
    const componentsSection = document.getElementById('components-section');
    const categoryItems = document.querySelectorAll('.category-item');
    const componentsResults = document.getElementById('components-results');
    
    if (term === '') {
        // Afficher toutes les catégories, masquer les composants
        categoryItems.forEach(item => item.style.display = 'flex');
        componentsSection.style.display = 'none';
        return;
    }
    
    // Filtrer les catégories
    let hasVisibleCategories = false;
    categoryItems.forEach(item => {
        const categoryName = item.getAttribute('data-category-name');
        const categoryDesc = item.getAttribute('data-category-desc');
        
        if (categoryName.includes(term) || categoryDesc.includes(term)) {
            item.style.display = 'flex';
            hasVisibleCategories = true;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Chercher dans tous les composants
    let matchingComponents = [];
    componentCategories.forEach(cat => {
        cat.components.forEach(comp => {
            const compName = comp.name.toLowerCase();
            const compVoltage = (comp.voltage || comp.type || '').toLowerCase();
            
            if (compName.includes(term) || compVoltage.includes(term)) {
                matchingComponents.push({
                    category: cat,
                    component: comp
                });
            }
        });
    });
    
    // Afficher les composants trouvés
    if (matchingComponents.length > 0) {
        componentsSection.style.display = 'block';
        componentsResults.innerHTML = matchingComponents.map(item => {
            const componentImagePath = item.component.imagePath || `images/composants/${item.category.folderName || item.category.id}/${item.component.id}/apercu/composant.png`;
            return `
            <div class="folder-item" 
                 onclick="showComponentDetail('${item.category.id}', '${item.component.id}')" 
                 style="border-left: 5px solid var(--primary); margin:0 20px 10px 20px; cursor: pointer;">
                <div class="folder-thumb" style="width:50px; height:50px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                    <img src="${componentImagePath}" 
                         alt="${item.component.name}" 
                         style="max-width:100%; max-height:100%; object-fit:contain;"
                         onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=font-size:24px;>${item.category.icon}</span>';">
                </div>
                <div style="flex:1">
                    <b>${item.component.name}</b><br>
                    <span style="font-size:11px; opacity:0.6;">${item.category.name} • ${item.component.voltage || item.component.type || ''}</span>
                </div>
                <span style="font-size:18px;">→</span>
            </div>
        `;
        }).join('');
    } else {
        componentsSection.style.display = 'none';
    }
}

window.showComponentList = function(categoryId) {
    const category = componentCategories.find(c => c.id === categoryId);
    if (!category) return;
    
    document.getElementById('component-list-title').innerText = category.name;
    const listContent = category.components.map(comp => {
        const componentImagePath = comp.imagePath || `images/composants/${category.folderName || categoryId}/${comp.id}/apercu/composant.png`;
        return `
        <div class="folder-item component-item" 
             data-comp-name="${comp.name.toLowerCase()}" 
             data-comp-voltage="${(comp.voltage || comp.type || '').toLowerCase()}"
             onclick="showComponentDetail('${categoryId}', '${comp.id}')"
             style="border-left: 5px solid var(--primary); cursor: pointer;">
            <div class="folder-thumb" style="width:50px; height:50px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                <img src="${componentImagePath}" 
                     alt="${comp.name}" 
                     style="max-width:100%; max-height:100%; object-fit:contain;"
                     onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=font-size:24px;>${category.icon}</span>';">
            </div>
            <div style="flex:1">
                <b>${comp.name}</b><br>
                <span style="font-size:11px; opacity:0.6;">${comp.voltage || comp.type || ''}</span>
            </div>
            <span style="font-size:18px;">→</span>
        </div>
    `;
    }).join('');
    
    document.getElementById('component-list-content').innerHTML = listContent;
    
    // Réinitialiser le champ de recherche
    const searchInput = document.getElementById('component-list-search');
    if (searchInput) searchInput.value = '';
    
    openModal('modal-component-list');
}

function filterComponentList(searchTerm) {
    const items = document.querySelectorAll('.component-item');
    const term = searchTerm.toLowerCase().trim();
    
    items.forEach(item => {
        const compName = item.getAttribute('data-comp-name');
        const compVoltage = item.getAttribute('data-comp-voltage');
        
        if (term === '' || compName.includes(term) || compVoltage.includes(term)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

window.showComponentDetail = function(categoryId, componentId) {
    console.log('showComponentDetail called:', categoryId, componentId);
    const category = componentCategories.find(c => c.id === categoryId);
    if (!category) {
        console.error('Category not found:', categoryId);
        return;
    }
    const component = category.components.find(c => c.id === componentId);
    if (!component) {
        console.error('Component not found:', componentId);
        return;
    }
    
    console.log('Opening component detail for:', component.name);
    closeModal('modal-component-list');
    
    const isFavorite = isComponentFavorite(categoryId, componentId);
    const favoriteIcon = isFavorite ? '⭐' : '☆';
    
    document.getElementById('component-detail-title').innerHTML = `
        ${component.name}
        <button onclick="toggleComponentFavorite('${categoryId}', '${componentId}')" 
                style="background:none; border:none; font-size:24px; cursor:pointer; margin-left:10px;" 
                title="${isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
            ${favoriteIcon}
        </button>
    `;
    
    // Image du composant
    const componentImagePath = component.imagePath || `images/composants/${category.folderName || categoryId}/${componentId}/apercu/composant.png`;
    
    let detailHTML = `
        <div style="text-align:center; margin:20px 0;">
            <img src="${componentImagePath}" 
                 alt="${component.name}" 
                 style="max-width:300px; max-height:250px; object-fit:contain;"
                 onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=font-size:48px;>${category.icon}</div>';">
        </div>
        
        <div class="card">
            <h3 style="color:var(--accent); margin-top:0;">📋 Description</h3>
            <p>${component.description}</p>
        </div>
    `;
    
    // Symbole électronique
    if (component.symbole) {
        detailHTML += `
        <div class="card">
            <h3 style="color:var(--accent); margin-top:0;">🔌 Symbole électronique</h3>
            <div style="text-align:center; background:#0f172a; padding:20px; border-radius:10px;">
                <img src="${component.symbole}" alt="Symbole ${component.name}" 
                     style="max-width:100%; max-height:200px; object-fit:contain;" 
                     onerror="this.parentElement.innerHTML='<p style=color:#94a3b8;>Image non disponible</p>';">
            </div>
        </div>`;
    }
    
    detailHTML += `
        <div class="card">
            <h3 style="color:var(--accent); margin-top:0;">⚙️ Caractéristiques</h3>
            <table style="width:100%; font-size:14px; line-height:1.8;">
    `;
    
    // Ajouter dynamiquement toutes les caractéristiques
    if (component.voltage) detailHTML += `<tr><td style="color:#94a3b8;">Tension</td><td><b>${component.voltage}</b></td></tr>`;
    if (component.current) detailHTML += `<tr><td style="color:#94a3b8;">Courant</td><td><b>${component.current}</b></td></tr>`;
    if (component.wavelength) detailHTML += `<tr><td style="color:#94a3b8;">Longueur d'onde</td><td><b>${component.wavelength}</b></td></tr>`;
    if (component.tolerance) detailHTML += `<tr><td style="color:#94a3b8;">Tolérance</td><td><b>${component.tolerance}</b></td></tr>`;
    if (component.power) detailHTML += `<tr><td style="color:#94a3b8;">Puissance</td><td><b>${component.power}</b></td></tr>`;
    if (component.colorCode) detailHTML += `<tr><td style="color:#94a3b8;">Code couleur</td><td><b>${component.colorCode}</b></td></tr>`;
    if (component.type) detailHTML += `<tr><td style="color:#94a3b8;">Type</td><td><b>${component.type}</b></td></tr>`;
    if (component.range) detailHTML += `<tr><td style="color:#94a3b8;">Plage</td><td><b>${component.range}</b></td></tr>`;
    if (component.accuracy) detailHTML += `<tr><td style="color:#94a3b8;">Précision</td><td><b>${component.accuracy}</b></td></tr>`;
    if (component.torque) detailHTML += `<tr><td style="color:#94a3b8;">Couple</td><td><b>${component.torque}</b></td></tr>`;
    if (component.angle) detailHTML += `<tr><td style="color:#94a3b8;">Angle</td><td><b>${component.angle}</b></td></tr>`;
    if (component.outputs) detailHTML += `<tr><td style="color:#94a3b8;">Sorties</td><td><b>${component.outputs}</b></td></tr>`;
    
    detailHTML += `</table></div>`;
    
    if (component.usage) {
        detailHTML += `
        <div class="card">
            <h3 style="color:var(--accent); margin-top:0;">💡 Utilisation</h3>
            <p>${component.usage}</p>
        </div>`;
    }
    
    // Prix et Achat
    if (component.price !== undefined && component.buyLink) {
        detailHTML += `
        <div class="card" style="background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border:2px solid #f59e0b;">
            <h3 style="color:#f59e0b; margin-top:0;">💰 Prix & Achat</h3>
            <div style="text-align:center; margin:20px 0;">
                <div style="font-size:36px; font-weight:bold; color:#fbbf24; margin-bottom:10px;">
                    ${component.price.toFixed(2)} €
                </div>
                <a href="${component.buyLink}" target="_blank" 
                   style="display:inline-block; background:#f59e0b; color:#0f172a; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold; font-size:14px; transition:all 0.3s;"
                   onmouseover="this.style.background='#fbbf24';" onmouseout="this.style.background='#f59e0b';">
                    🛒 ACHETER SUR AMAZON
                </a>
            </div>
            <p style="font-size:11px; color:#94a3b8; text-align:center; margin-top:15px;">
                ℹ️ Prix indicatif - Vérifier la disponibilité et le prix actuel sur Amazon
            </p>
        </div>`;
    }
    
    // Brochage (Pinout)
    if (component.pinout || component.pinoutFolder) {
        detailHTML += `
        <div class="card">
            <h3 style="color:var(--accent); margin-top:0;">📌 Brochage (Pinout)</h3>`;
        
        // Afficher les images du dossier si disponible
        if (component.pinoutFolder) {
            const pinoutImages = [
                '01-schema-complet.png',
                '02-schema-alternatif.png',
                '03-schema-simplifie.png'
            ];
            pinoutImages.forEach((imgName, index) => {
                detailHTML += `
                <div style="text-align:center; margin:20px 0;">
                    <div style="font-size:16px; font-weight:600; color:var(--accent); margin-bottom:12px; padding:8px 16px; background:rgba(59, 130, 246, 0.1); border-radius:6px; display:inline-block;">
                        📄 ${cleanImageName(imgName)}
                    </div>
                    <img src="${component.pinoutFolder}/${imgName}" 
                         alt="${imgName}" 
                         style="max-width:100%; border-radius:8px; display:block; margin:0 auto;"
                         onerror="this.parentElement.style.display='none';">
                </div>`;
            });
        }
        
        if (component.pinout) {
            detailHTML += `<pre style="background:#0f172a; padding:15px; border-radius:8px; font-size:12px; line-height:1.6; white-space:pre-wrap; margin-top:15px;">${component.pinout}</pre>`;
        }
        
        detailHTML += `</div>`;
    }
    
    // Empreinte (Footprint)
    if (component.footprint || component.footprintFolder) {
        detailHTML += `
        <div class="card">
            <h3 style="color:var(--accent); margin-top:0;">📐 Empreinte (Footprint)</h3>`;
        
        // Afficher les images du dossier si disponible
        if (component.footprintFolder) {
            const footprintImages = [
                '01-vue-dessus.png',
                '02-vue-cote.png',
                '03-vue-face.png',
                '04-dimensions.png',
                '05-vue-3d.png'
            ];
            footprintImages.forEach((imgName, index) => {
                detailHTML += `
                <div style="text-align:center; margin:20px 0;">
                    <div style="font-size:16px; font-weight:600; color:var(--accent); margin-bottom:12px; padding:8px 16px; background:rgba(59, 130, 246, 0.1); border-radius:6px; display:inline-block;">
                        📐 ${cleanImageName(imgName)}
                    </div>
                    <img src="${component.footprintFolder}/${imgName}" 
                         alt="${imgName}" 
                         style="max-width:100%; border-radius:8px; display:block; margin:0 auto;"
                         onerror="this.parentElement.style.display='none';">
                </div>`;
            });
        }
        
        if (component.footprint) {
            detailHTML += `<pre style="background:#0f172a; padding:15px; border-radius:8px; font-size:12px; line-height:1.6; white-space:pre-wrap; margin-top:15px;">${component.footprint}</pre>`;
        }
        
        detailHTML += `</div>`;
    }
    
    if (component.formula) {
        detailHTML += `
        <div class="card">
            <h3 style="color:var(--accent); margin-top:0;">🧮 Formules & Calculs</h3>
            <pre style="background:#0f172a; padding:15px; border-radius:8px; font-size:12px; line-height:1.6; white-space:pre-wrap;">${component.formula}</pre>`;
        
        // Ajouter calculateur interactif si disponible
        if (component.calculator && component.calculator.variables) {
            detailHTML += `
            <div style="margin-top:15px; padding:15px; background:#1e293b; border-radius:8px;">
                <h4 style="margin:0 0 15px 0; color:var(--primary);">⚡ Calculateur interactif</h4>
                
                <label style="display:block; margin-bottom:15px; font-size:14px; font-weight:bold;">
                    Je cherche :
                    <select id="calc-target-${componentId}" 
                            style="width:100%; padding:10px; margin-top:5px; background:#0f172a; border:1px solid #334155; border-radius:5px; color:white; font-size:14px;"
                            onchange="updateCalculatorInputs('${categoryId}', '${componentId}')">
                        ${component.calculator.variables.map(v => `<option value="${v.id}">${v.label}</option>`).join('')}
                    </select>
                </label>
                
                <div id="calc-inputs-${componentId}" style="display:grid; gap:10px; margin-bottom:15px;"></div>
                
                <div id="calc-result-${componentId}" style="padding:12px; background:#0f172a; border-radius:5px; border-left:4px solid var(--accent); font-weight:bold; font-size:15px; color:var(--accent);"></div>
            </div>`;
        } else if (component.calculator && component.calculator.inputs) {
            // Ancien format de calculateur (pour condensateurs, etc.)
            detailHTML += `
            <div style="margin-top:15px; padding:15px; background:#1e293b; border-radius:8px;">
                <h4 style="margin:0 0 15px 0; color:var(--primary);">⚡ Calculateur</h4>
                ${component.calculator.inputs.map(input => `
                    <label style="display:block; margin-bottom:10px; font-size:13px;">
                        ${input.label}
                        <input type="number" step="any" value="${input.default}" 
                               style="width:100%; padding:8px; margin-top:5px; background:#0f172a; border:1px solid #334155; border-radius:5px; color:white; font-size:14px;">
                    </label>
                `).join('')}
                <div style="padding:12px; background:#0f172a; border-radius:5px; border-left:4px solid var(--accent); font-weight:bold; font-size:15px; color:var(--accent); margin-top:10px;">
                    Résultat : Calculateur simple
                </div>
            </div>`;
        }
        
        detailHTML += `</div>`;
    }
    
    if (component.code) {
        detailHTML += `
        <div class="card">
            <h3 style="color:var(--accent); margin-top:0;">💻 Code exemple</h3>
            <pre style="background:#000; color:#22c55e; padding:15px; border-radius:8px; font-size:11px; line-height:1.4; white-space:pre-wrap; font-family:monospace;">${component.code}</pre>
        </div>`;
    }
    
    if (component.warning) {
        detailHTML += `
        <div class="card" style="border: 2px solid var(--danger); background:#3f1515;">
            <h3 style="color:var(--danger); margin-top:0;">⚠️ Avertissement</h3>
            <p style="color:var(--danger); font-weight:bold;">${component.warning}</p>
        </div>`;
    }
    
    document.getElementById('component-detail-content').innerHTML = detailHTML;
    openModal('modal-component-detail');
    
    // Initialiser le calculateur si disponible
    if (component.calculator) {
        updateCalculatorInputs(categoryId, componentId);
    }
}

// Mettre à jour les inputs du calculateur selon la variable cherchée
function updateCalculatorInputs(categoryId, componentId) {
    const category = componentCategories.find(c => c.id === categoryId);
    if (!category) return;
    const component = category.components.find(c => c.id === componentId);
    if (!component || !component.calculator || !component.calculator.variables) return;
    
    const targetSelect = document.getElementById(`calc-target-${componentId}`);
    const inputsDiv = document.getElementById(`calc-inputs-${componentId}`);
    if (!targetSelect || !inputsDiv) return;
    
    const targetVar = targetSelect.value;
    const targetVariable = component.calculator.variables.find(v => v.id === targetVar);
    if (!targetVariable) return;
    
    // Générer les inputs pour les autres variables
    inputsDiv.innerHTML = '';
    component.calculator.variables.forEach(variable => {
        if (variable.id === targetVar) return; // Skip la variable cherchée
        
        const isFixed = variable.fixed || false;
        inputsDiv.innerHTML += `
        <label style="display:flex; align-items:center; gap:10px; font-size:13px;">
            <span style="min-width:150px; color:${isFixed ? '#94a3b8' : 'white'};">${variable.label}${isFixed ? ' (fixe)' : ''} :</span>
            <input type="number" step="any" id="calc-input-${componentId}-${variable.id}" value="${variable.default}" 
                   ${isFixed ? 'readonly' : ''}
                   style="flex:1; padding:8px; background:${isFixed ? '#1e293b' : '#0f172a'}; border:1px solid #334155; border-radius:5px; color:${isFixed ? '#94a3b8' : 'white'}; font-size:14px;"
                   oninput="calculateComponent('${categoryId}', '${componentId}')">
        </label>`;
    });
    
    calculateComponent(categoryId, componentId);
}

// Fonction pour calculer les valeurs du composant
function calculateComponent(categoryId, componentId) {
    const category = componentCategories.find(c => c.id === categoryId);
    if (!category) return;
    const component = category.components.find(c => c.id === componentId);
    if (!component || !component.calculator || !component.calculator.variables) return;
    
    const targetSelect = document.getElementById(`calc-target-${componentId}`);
    const resultDiv = document.getElementById(`calc-result-${componentId}`);
    if (!targetSelect || !resultDiv) return;
    
    const targetVar = targetSelect.value;
    const targetVariable = component.calculator.variables.find(v => v.id === targetVar);
    if (!targetVariable) return;
    
    // Récupérer les valeurs des inputs
    const values = {};
    component.calculator.variables.forEach(variable => {
        if (variable.id === targetVar) return;
        const elem = document.getElementById(`calc-input-${componentId}-${variable.id}`);
        if (elem) {
            values[variable.id] = parseFloat(elem.value) || 0;
        }
    });
    
    // Calculer le résultat avec la formule de la variable cible
    try {
        let calcFormula = targetVariable.formula;
        if (!calcFormula || calcFormula === '0') {
            resultDiv.innerHTML = `${targetVariable.label} : Valeur fixe`;
            return;
        }
        
        // Remplacer les variables par leurs valeurs
        Object.keys(values).forEach(varId => {
            const regex = new RegExp(`\\b${varId}\\b`, 'g');
            calcFormula = calcFormula.replace(regex, values[varId]);
        });
        
        const result = eval(calcFormula);
        
        // Formater le résultat
        let displayResult = result;
        if (!isNaN(result)) {
            if (result > 1000000) {
                displayResult = (result / 1000000).toFixed(2) + 'M';
            } else if (result > 1000) {
                displayResult = (result / 1000).toFixed(2) + 'k';
            } else {
                displayResult = result.toFixed(3);
            }
        }
        
        resultDiv.innerHTML = `${targetVariable.label} = <span style="font-size:18px;">${displayResult} ${targetVariable.unit || ''}</span>`;
    } catch (error) {
        resultDiv.innerHTML = `Erreur de calcul`;
        console.error('Erreur calcul:', error);
    }
}

function renderTools() {
    const list = document.getElementById('formula-list');
    const cats = { Elec:'⚡ Électricité', Micro:'🤖 Micro/ESP32', RF:'📡 Radio/RF', Sig:'🔬 Signal', Inge:'🏗️ Ingénierie' };
    
    for (let key in cats) {
        list.innerHTML += `<div style="color:var(--accent); font-weight:bold; margin:20px 0 10px; font-size:12px; text-transform:uppercase; letter-spacing:1px;">${cats[key]}</div>`;
        formulas.filter(f => f.cat === key).forEach(f => {
            list.innerHTML += `<div class="formula-item" onclick="toggleCalc('${f.id}')"><div><b>${f.name}</b><br><small style="opacity:0.6">${f.math}</small></div><span id="arrow-${f.id}">➔</span></div><div id="calc-${f.id}" class="calc-container" style="display:none;"><div class="calc-result" id="res-${f.id}">---</div>${f.ins.map(i => i.id === 'mat' ? `<label>${i.n}</label><select id="m-${f.id}-${i.id}" onchange="runMath('${f.id}')"><option value="">Choisir...</option><option value="cu">Cuivre (1.68e-8 Ωm)</option><option value="al">Aluminium (2.65e-8 Ωm)</option><option value="fe">Fer (9.71e-8 Ωm)</option><option value="ag">Argent (1.59e-8 Ωm)</option><option value="au">Or (2.44e-8 Ωm)</option></select>` : `<label>${i.n}</label><input type="number" id="m-${f.id}-${i.id}" oninput="runMath('${f.id}')" placeholder="Saisir valeur...">`).join('')}<button class="btn" style="background:var(--danger); margin-top:15px;" onclick="clearCalc('${f.id}')">RESET</button>${f.desc ? `<p style="margin-top:15px; font-size:14px;">${f.desc}</p>` : ''}${f.history ? `<p style="font-size:12px; color:#94a3b8;"><small>${f.history}</small></p>` : ''}</div>`;
        });
    }
}

function toggleCalc(id) {
    let calc = document.getElementById('calc-' + id);
    let arrow = document.getElementById('arrow-' + id);
    if (calc.style.display === 'none') {
        calc.style.display = 'block';
        arrow.innerText = '⬇';
    } else {
        calc.style.display = 'none';
        arrow.innerText = '➔';
    }
}

// Fonction pour filtrer les projets
function filterProjects(type, value) {
    currentFilter[type] = value;
    renderFolders();
}

// Basculer favori
async function toggleFavorite(index) {
    db[index].favorite = !db[index].favorite;
    await saveProjectToFolder(db[index]);
    renderFolders();
}

// Ajouter aux récents
function addToRecents(index) {
    const projectName = db[index].name;
    const projectDate = db[index].createdAt;
    const recentId = `${projectName}_${projectDate}`;
    
    // Retirer si déjà présent
    recentProjects = recentProjects.filter(r => r.id !== recentId);
    
    // Ajouter au début
    recentProjects.unshift({
        id: recentId,
        index: index,
        name: projectName,
        accessedAt: new Date().toISOString()
    });
    
    // Garder seulement les 5 derniers
    recentProjects = recentProjects.slice(0, 5);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('recentProjects', JSON.stringify(recentProjects));
}

// Fonction pour obtenir tous les tags uniques
function getAllTags() {
    const tags = new Set();
    db.forEach(project => {
        if (project.tags && Array.isArray(project.tags)) {
            project.tags.forEach(tag => tags.add(tag));
        }
    });
    return Array.from(tags).sort();
}

// Fonction pour exporter tous les projets
// Fonction utilitaire pour afficher le temps relatif
function getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'à l\'instant';
    if (diffMins < 60) return `il y a ${diffMins}min`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;
    if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)}sem`;
    if (diffDays < 365) return `il y a ${Math.floor(diffDays / 30)}mois`;
    return `il y a ${Math.floor(diffDays / 365)}ans`;
}

// Fonction pour afficher les statistiques
function showStatistics() {
    if (!projectDirHandle) {
        customAlert('⚠️ Aucun dossier configuré !\n\nConfigurez le dossier projet/ pour voir les statistiques.', 'Attention');
        return;
    }
    
    // Calculer les statistiques
    const totalProjects = db.length;
    const statusCount = {
        'En cours': 0,
        'Terminé': 0,
        'Abandonné': 0
    };
    
    db.forEach(project => {
        const status = project.status || 'En cours';
        if (statusCount[status] !== undefined) {
            statusCount[status]++;
        }
    });
    
    // Trouver la dernière activité
    let lastActivity = null;
    db.forEach(project => {
        const date = project.updatedAt || project.createdAt;
        if (date && (!lastActivity || new Date(date) > new Date(lastActivity))) {
            lastActivity = date;
        }
    });
    
    const lastActivityStr = lastActivity ? 
        new Date(lastActivity).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'}) + 
        ' (' + getRelativeTime(lastActivity) + ')' : 
        'Aucune activité';
    
    // Trouver les composants les plus utilisés
    const componentCount = {};
    db.forEach(project => {
        if (project.components && Array.isArray(project.components)) {
            project.components.forEach(comp => {
                const key = comp.name || 'Inconnu';
                componentCount[key] = (componentCount[key] || 0) + (comp.quantity || 1);
            });
        }
    });
    
    const topComponents = Object.entries(componentCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => `${name} (${count}x)`)
        .join(', ') || 'Aucun composant';
    
    // Afficher les statistiques
    const message = `📊 STATISTIQUES\n\n` +
        `📂 Total de projets : ${totalProjects}\n\n` +
        `📈 État des projets :\n` +
        `  • En cours : ${statusCount['En cours']}\n` +
        `  • Terminés : ${statusCount['Terminé']}\n` +
        `  • Abandonnés : ${statusCount['Abandonné']}\n\n` +
        `⏰ Dernière activité :\n  ${lastActivityStr}\n\n` +
        `⚡ Top 5 composants :\n  ${topComponents}`;
    
    customAlert(message, 'Statistiques');
}

// Fonction pour filtrer les projets
function filterProjects(type, value) {
    currentFilter[type] = value;
    renderFolders();
}

// Fonction pour obtenir tous les tags uniques
function getAllTags() {
    const tags = new Set();
    db.forEach(project => {
        if (project.tags && Array.isArray(project.tags)) {
            project.tags.forEach(tag => tags.add(tag));
        }
    });
    return Array.from(tags).sort();
}

// Fonction pour exporter tous les projets
function exportAllProjects() {
    if (db.length === 0) {
        customAlert('⚠️ Aucun projet à exporter !', 'Attention');
        return;
    }
    
    const backup = {
        version: '1.0.0',
        date: new Date().toISOString(),
        projects: db,
        ip: localStorage.getItem('lab_ip')
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projets-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    customAlert(`✅ ${db.length} projet(s) exporté(s) !\n\nFichier téléchargé : projets-backup-${new Date().toISOString().split('T')[0]}.json`, 'Export réussi');
}

// Fonction pour exporter un seul projet
function exportSingleProject(index) {
    if (!db[index]) return;
    
    const project = db[index];
    const backup = {
        version: '1.0.0',
        date: new Date().toISOString(),
        projects: [project],
        ip: localStorage.getItem('lab_ip')
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = project.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    a.download = `projet-${safeName}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast(`Projet "${project.name}" exporté !`, 'success');
}

// Fonction pour exporter tous les projets (avec sélection possible)
function exportAllProjects() {
    if (db.length === 0) {
        showToast('Aucun projet à exporter !', 'warning');
        return;
    }
    
    const backup = {
        version: '1.0.0',
        date: new Date().toISOString(),
        projects: db,
        ip: localStorage.getItem('lab_ip')
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projets-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast(`${db.length} projet(s) exporté(s) !`, 'success');
}

// Fonction pour importer des projets
function importProjects() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const backup = JSON.parse(text);
            
            if (!backup.projects || !Array.isArray(backup.projects)) {
                customAlert('❌ Fichier invalide !\n\nLe fichier ne contient pas de projets.', 'Erreur');
                return;
            }
            
            // Demander confirmation
            const confirmed = await customConfirm(
                `Importer ${backup.projects.length} projet(s) ?\n\nCela ajoutera les projets à votre liste actuelle.`,
                'Importation'
            );
            
            if (confirmed) {
                let importedCount = 0;
                // Ajouter les projets importés avec async/await
                for (const project of backup.projects) {
                    // Vérifier que le projet n'existe pas déjà
                    const exists = db.find(p => p.name === project.name && p.createdAt === project.createdAt);
                    if (!exists) {
                        db.push(project);
                        // Sauvegarder immédiatement dans le dossier projet
                        if (projectDirHandle) {
                            try {
                                await saveProjectToFolder(project);
                            } catch (error) {
                                console.error('Erreur sauvegarde projet:', error);
                            }
                        }
                        importedCount++;
                    }
                }
                
                renderFolders();
                showToast(`${importedCount} projet(s) importé(s) et sauvegardé(s) !`, 'success');
            }
        } catch (error) {
            showToast('Erreur lors de l\'importation !\n' + error.message, 'error');
            console.error('Erreur import:', error);
        }
    };
    input.click();
}

// --- PROJETS ---
function renderFolders() {
    const list = document.getElementById('folder-list');
    const countEl = document.getElementById('project-count');
    const warningEl = document.getElementById('no-folder-warning');
    
    // Vérifier si un dossier est configuré
    if (!projectDirHandle) {
        if (warningEl) warningEl.style.display = 'block';
        if (list) list.style.display = 'none';
        if (countEl) countEl.innerText = '0';
        return;
    } else {
        if (warningEl) warningEl.style.display = 'none';
        if (list) list.style.display = 'block';
    }
    
    // Mettre à jour le compteur
    if (countEl) {
        countEl.innerText = db.length + ' projet' + (db.length > 1 ? 's' : '');
    }
    
    if (db.length === 0) {
        list.innerHTML = `
            <div class="card" style="text-align:center; padding:40px 20px;">
                <div style="font-size:48px; margin-bottom:20px;">📂</div>
                <h3 style="color:var(--accent);">Aucun projet pour le moment</h3>
                <p style="color:#94a3b8; margin:20px 0;">Créez votre premier projet en cliquant sur le bouton "+ NOUVEAU"</p>
            </div>
        `;
        return;
    }
    
    // Trier par date de modification (plus récent en premier)
    const sortedDb = [...db].sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return dateB - dateA;
    });
    
    // Appliquer les filtres
    let filteredDb = sortedDb.filter(f => {
        if (currentFilter.category !== 'all' && f.category !== currentFilter.category) return false;
        if (currentFilter.difficulty !== 'all' && f.difficulty !== currentFilter.difficulty) return false;
        if (currentFilter.tag && (!f.tags || !f.tags.includes(currentFilter.tag))) return false;
        if (currentFilter.favorites && !f.favorite) return false;
        return true;
    });
    
    list.innerHTML = filteredDb.map((f) => {
        const originalIndex = db.indexOf(f);
        const lastUpdate = f.updatedAt || f.createdAt;
        const dateStr = lastUpdate ? new Date(lastUpdate).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric'}) : '';
        const relativeTime = lastUpdate ? getRelativeTime(lastUpdate) : '';
        
        // Trouver la catégorie et la difficulté
        const category = projectCategories.find(c => c.id === (f.category || 'other')) || projectCategories[6];
        const difficulty = difficultyLevels.find(d => d.id === (f.difficulty || 'beginner')) || difficultyLevels[0];
        
        // Afficher les tags
        const tagsHtml = (f.tags && f.tags.length > 0) ? 
            f.tags.map(tag => `<span style="background:${category.color}30; color:${category.color}; padding:2px 6px; border-radius:4px; font-size:9px; margin-right:4px;">${tag}</span>`).join('') : '';
        
        return `
        <div class="folder-item" onclick="openFolder(${originalIndex})">
            <div class="folder-thumb">${f.img ? `<img src="${f.img}" style="width:100%;height:100%;border-radius:10px;object-fit:cover">` : '📂'}</div>
            <div style="flex:1">
                <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                    <b>${f.name}</b>
                    <span style="font-size:16px;" title="${category.name}">${category.icon}</span>
                    <span style="font-size:14px;" title="${difficulty.name}">${difficulty.icon}</span>
                    ${f.favorite ? '<span style="font-size:16px;" title="Favori">⭐</span>' : ''}
                </div>
                <div style="font-size:10px; opacity:0.6;">${f.status}${dateStr ? ' • 📅 ' + dateStr + (relativeTime ? ' (' + relativeTime + ')' : '') : ''}</div>
                ${tagsHtml ? `<div style="margin-top:4px;">${tagsHtml}</div>` : ''}
            </div>
            <div style="display:flex; gap:5px; align-items:center;">
                <button onclick="exportSingleProject(${originalIndex}); event.stopPropagation();" 
                        style="background:var(--accent); color:white; border:none; padding:6px 10px; border-radius:6px; font-size:11px; cursor:pointer;" 
                        title="Exporter ce projet">
                    💾
                </button>
                <button onclick="toggleFavorite(${originalIndex}); event.stopPropagation();" 
                        style="background:none; border:none; font-size:20px; cursor:pointer; opacity:0.5; transition:opacity 0.2s;" 
                        onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">
                    ${f.favorite ? '⭐' : '☆'}
                </button>
            </div>
        </div>`;
    }).join('');
}

function openFolder(i) {
    currentIdx = i; const f = db[i];
    document.getElementById('edit-title').innerText = f.name;
    document.getElementById('edit-notes').value = f.notes || "";
    document.getElementById('edit-code').value = f.code || "";
    
    // Charger catégorie, difficulté et tags
    document.getElementById('edit-category').value = f.category || 'other';
    document.getElementById('edit-difficulty').value = f.difficulty || 'beginner';
    document.getElementById('edit-tags').value = (f.tags && f.tags.length > 0) ? f.tags.join(', ') : '';
    
    // Photo du projet final
    if(f.img) {
        document.getElementById('proj-img-preview').src = f.img;
        document.getElementById('proj-img-container').style.display = 'block';
        document.getElementById('proj-img-label').style.display = 'none';
        document.getElementById('proj-img-actions').style.display = 'flex';
    } else {
        document.getElementById('proj-img-container').style.display = 'none';
        document.getElementById('proj-img-label').style.display = 'block';
        document.getElementById('proj-img-actions').style.display = 'none';
    }
    
    // Schéma de principe
    if(f.schemaPrincipe) {
        document.getElementById('schema-principe-preview').src = f.schemaPrincipe;
        document.getElementById('schema-principe-container').style.display = 'block';
        document.getElementById('schema-principe-label').style.display = 'none';
        document.getElementById('schema-principe-actions').style.display = 'flex';
    } else {
        document.getElementById('schema-principe-container').style.display = 'none';
        document.getElementById('schema-principe-label').style.display = 'block';
        document.getElementById('schema-principe-actions').style.display = 'none';
    }
    
    // Schéma Proteus
    if(f.schemaProteus) {
        document.getElementById('schema-proteus-preview').src = f.schemaProteus;
        document.getElementById('schema-proteus-container').style.display = 'block';
        document.getElementById('schema-proteus-label').style.display = 'none';
        document.getElementById('schema-proteus-actions').style.display = 'flex';
    } else {
        document.getElementById('schema-proteus-container').style.display = 'none';
        document.getElementById('schema-proteus-label').style.display = 'block';
        document.getElementById('schema-proteus-actions').style.display = 'none';
    }
    
    // Afficher les composants du projet
    renderProjectComponents();
    
    // Mettre à jour les statistiques
    updateProjectStatistics();
    
    document.getElementById('modal-project').style.display = 'flex';
}

// Calculer le coût total du projet
function calculateProjectCost(project) {
    if (!project.components || project.components.length === 0) return 0;
    
    let totalCost = 0;
    project.components.forEach(comp => {
        const category = componentCategories.find(c => c.id === comp.categoryId);
        const compId = comp.componentId || comp.id;
        const fullComponent = category?.components.find(c => c.id === compId);
        const price = fullComponent?.price || 0;
        const quantity = comp.quantity || 1;
        totalCost += price * quantity;
    });
    
    return totalCost;
}

// Mettre à jour l'affichage des statistiques du projet
function updateProjectStatistics() {
    const f = db[currentIdx];
    if (!f) return;
    
    const componentCount = f.components ? f.components.length : 0;
    const totalCost = calculateProjectCost(f);
    
    document.getElementById('stat-component-count').textContent = componentCount;
    document.getElementById('stat-total-cost').textContent = totalCost.toFixed(2) + ' €';
}

function renderProjectComponents() {
    const f = db[currentIdx];
    if (!f.components) f.components = [];
    
    const container = document.getElementById('project-components');
    if (f.components.length === 0) {
        container.innerHTML = '<p style="color:#94a3b8; font-size:12px; font-style:italic;">Aucun composant ajouté</p>';
        return;
    }
    
    container.innerHTML = f.components.map((comp, idx) => {
        // Construire le chemin de l'image du composant
        const category = componentCategories.find(c => c.id === comp.categoryId);
        const compId = comp.componentId || comp.id; // Fallback pour anciens projets
        const componentImagePath = comp.imagePath || (category && compId ? 
            `images/composants/${category.folderName || comp.categoryId}/${compId}/apercu/composant.png` : null);
        
        // Récupérer le prix du composant
        const fullComponent = category?.components.find(c => c.id === compId);
        const price = fullComponent?.price;
        const buyLink = fullComponent?.buyLink;
        const quantity = comp.quantity || 1;
        
        // Calculer le prix total pour ce composant
        const totalPrice = price ? (price * quantity).toFixed(2) : null;
        const priceDisplay = price && buyLink ? 
            `<a href="${buyLink}" target="_blank" onclick="event.stopPropagation();" style="color:#fbbf24; text-decoration:none; font-size:12px; font-weight:bold;" title="Acheter sur Amazon">
                💰 ${totalPrice} € ${quantity > 1 ? `<span style="opacity:0.7;">(${price.toFixed(2)} € × ${quantity})</span>` : ''}
            </a>` : '';
        
        return `
        <div class="folder-item" style="margin-bottom:8px; padding:10px; border-left:3px solid var(--accent);" onclick="viewProjectComponent(${idx})">
            <div class="folder-thumb" style="width:40px; height:40px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                ${componentImagePath ? 
                    `<img src="${componentImagePath}" alt="${comp.name}" style="max-width:100%; max-height:100%; object-fit:contain;" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=font-size:20px;>${comp.icon}</span>';">` :
                    `<span style="font-size:20px;">${comp.icon}</span>`
                }
            </div>
            <div style="flex:1">
                <b style="font-size:13px;">${quantity}x ${comp.name}</b><br>
                <span style="font-size:10px; opacity:0.6;">${comp.category}</span>
                ${priceDisplay ? `<br>${priceDisplay}` : ''}
            </div>
            <button onclick="removeProjectComponent(${idx}); event.stopPropagation();" style="background:var(--danger); color:white; border:none; padding:5px 10px; border-radius:5px; font-size:11px;">✕</button>
        </div>
    `;
    }).join('');
}

function openComponentPicker() {
    const content = document.getElementById('component-picker-content');
    content.innerHTML = `
        <div style="margin-bottom:20px;">
            <!-- Barre de recherche -->
            <input type="text" id="component-picker-search" placeholder="🔍 Rechercher un composant..." 
                   style="width:100%; padding:12px 15px; background:#0f172a; border:1px solid var(--accent); color:white; border-radius:10px; font-size:14px; margin-bottom:15px; box-sizing:border-box;"
                   oninput="filterComponentPicker(this.value)">
            
            <button class="btn" style="background:var(--success); width:100%;" onclick="validateComponentSelection()">✅ VALIDER LA SÉLECTION</button>
        </div>
        
        <!-- Section Catégories -->
        <div id="picker-categories-section">
            <h3 style="color:var(--accent); margin:0 0 15px 0; font-size:16px;">📂 Catégories</h3>
            <div id="picker-categories-list">
                ${componentCategories.map((cat, idx) => `
                    <div class="picker-category-item" data-category-name="${cat.name.toLowerCase()}" data-category-desc="${cat.description.toLowerCase()}" style="margin-bottom:15px;">
                        <!-- En-tête de catégorie cliquable -->
                        <div class="folder-item" onclick="toggleCategoryPicker('${cat.id}')" style="border-left:5px solid var(--accent); cursor:pointer; margin-bottom:10px;">
                            <div class="folder-thumb" style="font-size:28px;">${cat.icon}</div>
                            <div style="flex:1">
                                <b>${cat.name}</b><br>
                                <span style="font-size:11px; opacity:0.6;">${cat.description}</span>
                            </div>
                            <span id="arrow-${cat.id}" style="font-size:20px; transition:transform 0.3s;">▼</span>
                        </div>
                        
                        <!-- Composants de la catégorie (masqués par défaut) -->
                        <div id="category-content-${cat.id}" style="display:none; padding-left:10px;">
                            ${cat.components.map(comp => {
                                const componentImagePath = comp.imagePath || `images/composants/${cat.folderName || cat.id}/${comp.id}/apercu/composant.png`;
                                return `
                                <div class="folder-item component-selectable" data-cat-id="${cat.id}" data-comp-id="${comp.id}" data-comp-name="${comp.name.toLowerCase()}" data-comp-voltage="${(comp.voltage || comp.type || '').toLowerCase()}" onclick="toggleComponentSelection(this)" style="border-left:3px solid #475569; margin-bottom:8px; cursor:pointer;">
                                    <input type="checkbox" class="component-checkbox" style="width:20px; height:20px; margin-right:10px;">
                                    <div class="folder-thumb" style="width:40px; height:40px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                                        <img src="${componentImagePath}" 
                                             alt="${comp.name}" 
                                             style="max-width:100%; max-height:100%; object-fit:contain;"
                                             onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=font-size:20px;>${cat.icon}</span>';">
                                    </div>
                                    <div style="flex:1">
                                        <b style="font-size:13px;">${comp.name}</b><br>
                                        <span style="font-size:10px; opacity:0.6;">${comp.voltage || comp.type || ''}</span>
                                    </div>
                                </div>
                            `;
                            }).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <!-- Section Composants (affichée lors de la recherche) -->
        <div id="picker-components-section" style="display:none;">
            <h3 style="color:var(--accent); margin:20px 0 15px 0; font-size:16px;">⚡ Composants</h3>
            <div id="picker-components-results"></div>
        </div>
    `;
    
    openModal('modal-component-picker');
}

function toggleCategoryPicker(categoryId) {
    const content = document.getElementById('category-content-' + categoryId);
    const arrow = document.getElementById('arrow-' + categoryId);
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
    } else {
        content.style.display = 'none';
        arrow.style.transform = 'rotate(0deg)';
    }
}

function filterComponentPicker(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    const categoriesSection = document.getElementById('picker-categories-section');
    const componentsSection = document.getElementById('picker-components-section');
    const categoryItems = document.querySelectorAll('.picker-category-item');
    const componentsResults = document.getElementById('picker-components-results');
    
    if (term === '') {
        // Tout réinitialiser : afficher les catégories, masquer la section composants, fermer les accordéons
        categoryItems.forEach(cat => {
            cat.style.display = 'block';
            // Fermer les catégories
            const categoryName = cat.getAttribute('data-category-name');
            const categoryId = componentCategories.find(c => c.name.toLowerCase() === categoryName)?.id;
            if (categoryId) {
                const content = document.getElementById('category-content-' + categoryId);
                const arrow = document.getElementById('arrow-' + categoryId);
                if (content) content.style.display = 'none';
                if (arrow) arrow.style.transform = 'rotate(0deg)';
            }
        });
        componentsSection.style.display = 'none';
        return;
    }
    
    // Filtrer les catégories (afficher/masquer mais NE PAS les ouvrir automatiquement)
    categoryItems.forEach(cat => {
        const categoryName = cat.getAttribute('data-category-name');
        const categoryDesc = cat.getAttribute('data-category-desc');
        const categoryId = componentCategories.find(c => c.name.toLowerCase() === categoryName)?.id;
        
        if (categoryName.includes(term) || categoryDesc.includes(term)) {
            // La catégorie correspond : l'afficher MAIS la laisser fermée
            cat.style.display = 'block';
        } else {
            // Vérifier si la catégorie contient des composants correspondants
            if (categoryId) {
                const content = document.getElementById('category-content-' + categoryId);
                const items = content.querySelectorAll('.component-selectable');
                let hasVisibleItems = false;
                
                items.forEach(item => {
                    const compName = item.getAttribute('data-comp-name');
                    const compVoltage = item.getAttribute('data-comp-voltage');
                    
                    if (compName.includes(term) || compVoltage.includes(term)) {
                        hasVisibleItems = true;
                    }
                });
                
                // Afficher la catégorie si elle contient des composants correspondants, mais la laisser fermée
                cat.style.display = hasVisibleItems ? 'block' : 'none';
            } else {
                cat.style.display = 'none';
            }
        }
    });
    
    // Chercher dans tous les composants pour la section "Composants"
    let matchingComponents = [];
    componentCategories.forEach(cat => {
        cat.components.forEach(comp => {
            const compName = comp.name.toLowerCase();
            const compVoltage = (comp.voltage || comp.type || '').toLowerCase();
            
            if (compName.includes(term) || compVoltage.includes(term)) {
                matchingComponents.push({
                    category: cat,
                    component: comp
                });
            }
        });
    });
    
    // Afficher la section composants avec tous les composants trouvés
    if (matchingComponents.length > 0) {
        componentsSection.style.display = 'block';
        componentsResults.innerHTML = matchingComponents.map(item => {
            const componentImagePath = item.component.imagePath || `images/composants/${item.category.folderName || item.category.id}/${item.component.id}/apercu/composant.png`;
            return `
            <div class="folder-item component-selectable" data-cat-id="${item.category.id}" data-comp-id="${item.component.id}" data-comp-name="${item.component.name.toLowerCase()}" data-comp-voltage="${(item.component.voltage || item.component.type || '').toLowerCase()}" onclick="toggleComponentSelection(this)" style="border-left:3px solid #475569; margin-bottom:8px; cursor:pointer;">
                <input type="checkbox" class="component-checkbox" style="width:20px; height:20px; margin-right:10px;">
                <div class="folder-thumb" style="width:40px; height:40px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                    <img src="${componentImagePath}" 
                         alt="${item.component.name}" 
                         style="max-width:100%; max-height:100%; object-fit:contain;"
                         onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=font-size:20px;>${item.category.icon}</span>';">
                </div>
                <div style="flex:1">
                    <b style="font-size:13px;">${item.component.name}</b><br>
                    <span style="font-size:10px; opacity:0.6;">${item.category.name} • ${item.component.voltage || item.component.type || ''}</span>
                </div>
            </div>
        `;
        }).join('');
    } else {
        componentsSection.style.display = 'none';
    }
}

function toggleComponentSelection(element) {
    const checkbox = element.querySelector('.component-checkbox');
    checkbox.checked = !checkbox.checked;
    
    if (checkbox.checked) {
        element.style.borderLeftColor = 'var(--accent)';
        element.style.background = '#1e293b';
    } else {
        element.style.borderLeftColor = '#475569';
        element.style.background = 'transparent';
    }
}

function validateComponentSelection() {
    const selected = document.querySelectorAll('.component-selectable input:checked');
    
    if (selected.length === 0) {
        customAlert('Aucun composant sélectionné !', 'Attention');
        return;
    }
    
    // Créer un formulaire pour les quantités
    let html = '<div style="padding:20px;">';
    html += '<h3 style="color:var(--accent); margin-bottom:20px;">Définir les quantités</h3>';
    
    selected.forEach((checkbox, idx) => {
        const item = checkbox.closest('.component-selectable');
        const catId = item.getAttribute('data-cat-id');
        const compId = item.getAttribute('data-comp-id');
        const category = componentCategories.find(c => c.id === catId);
        const component = category.components.find(c => c.id === compId);
        
        html += `
            <div style="margin-bottom:12px; padding:12px; background:#1e293b; border-radius:8px; display:flex; align-items:center; gap:10px;">
                <input type="number" id="qty-${idx}" data-cat-id="${catId}" data-comp-id="${compId}" placeholder="" min="1" 
                    style="width:60px; padding:8px; background:#0f172a; border:1px solid var(--accent); border-radius:5px; color:white; text-align:center;">
                <span style="color:white; font-size:14px;">× ${category.icon} ${component.name}</span>
            </div>
        `;
    });
    
    html += '<button class="btn" style="background:var(--success); width:100%; margin-top:10px;" onclick="addMultipleComponents()">✅ AJOUTER LES COMPOSANTS</button>';
    html += '</div>';
    
    document.getElementById('component-picker-content').innerHTML = html;
}

async function addMultipleComponents() {
    const inputs = document.querySelectorAll('[id^="qty-"]');
    const f = db[currentIdx];
    if (!f.components) f.components = [];
    
    let added = 0;
    inputs.forEach(input => {
        const catId = input.getAttribute('data-cat-id');
        const compId = input.getAttribute('data-comp-id');
        const quantity = parseInt(input.value) || 1;
        
        const category = componentCategories.find(c => c.id === catId);
        if (!category) return;
        const component = category.components.find(c => c.id === compId);
        if (!component) return;
        
        // Vérifier si le composant existe déjà
        const existing = f.components.find(c => c.id === compId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            f.components.push({
                id: compId,
                componentId: compId,
                categoryId: catId,
                name: component.name,
                category: category.name,
                icon: category.icon,
                quantity: quantity,
                data: component
            });
        }
        added++;
    });
    
    await saveProjectToFolder(db[currentIdx]);
    renderProjectComponents();
    updateProjectStatistics();
    closeModal('modal-component-picker');
}

async function addComponentToProject(catId, compId) {
    // Cette fonction n'est plus utilisée mais on la garde pour compatibilité
    const category = componentCategories.find(c => c.id === catId);
    if (!category) return;
    const component = category.components.find(c => c.id === compId);
    if (!component) return;
    
    const f = db[currentIdx];
    if (!f.components) f.components = [];
    
    // Demander la quantité
    const quantity_str = await customPrompt('Quantité de ce composant ?', '1', 'Ajouter un composant');
    if (!quantity_str) return; // Annulé
    const quantity = parseInt(quantity_str);
    if (isNaN(quantity) || quantity <= 0) {
        customAlert('Quantité invalide !', 'Erreur');
        return;
    }
    
    // Vérifier si le composant existe déjà
    const existing = f.components.find(c => c.id === compId);
    if (existing) {
        // Si déjà présent, augmenter la quantité
        existing.quantity += quantity;
        await saveProjectToFolder(db[currentIdx]);
        renderProjectComponents();
        updateProjectStatistics();
        closeModal('modal-component-picker');
        customAlert('Quantité mise à jour ! 💡', 'Succès');
        return;
    }
    
    f.components.push({
        id: compId,
        componentId: compId,  // Pour la construction du chemin d'image
        categoryId: catId,
        name: component.name,
        category: category.name,
        icon: category.icon,
        quantity: quantity,
        data: component
    });
    
    await saveProjectToFolder(db[currentIdx]);
    renderProjectComponents();
    updateProjectStatistics();
    closeModal('modal-component-picker');
    customAlert('Composant ajouté ! 💡', 'Succès');
}

async function removeProjectComponent(idx) {
    const f = db[currentIdx];
    const result = await customConfirm('Retirer ce composant du projet ?', 'Confirmation');
    if (result) {
        f.components.splice(idx, 1);
        await saveProjectToFolder(db[currentIdx]);
        renderProjectComponents();
        updateProjectStatistics();
    }
}

function viewProjectComponent(idx) {
    const f = db[currentIdx];
    const comp = f.components[idx];
    showComponentDetail(comp.categoryId, comp.id);
}

async function newFolder() {
    if (!projectDirHandle) {
        customAlert('⚠️ Aucun dossier configuré !\n\nVeuillez d\'abord configurer le dossier projet/ dans les paramètres.', 'Attention');
        return;
    }
    
    // Demander si l'utilisateur veut utiliser un template
    const useTemplate = await customConfirm('🎯 Créer depuis un template ?\n\nOK = Choisir un template\nAnnuler = Projet vierge', 'Nouveau projet');
    if (useTemplate) {
        openTemplateSelector();
    } else {
        await createEmptyProject();
    }
}

async function createEmptyProject() {
    const n = await customPrompt('Nom du projet ?', '', 'Nouveau projet');
    if(n) { 
        const now = new Date().toISOString();
        const newProject = {
            name: n, 
            status: 'En cours', 
            category: 'other',
            difficulty: 'beginner',
            tags: [],
            favorite: false,
            notes: '', 
            code: '', 
            img: '', 
            schemaPrincipe: '', 
            schemaProteus: '', 
            components: [], 
            createdAt: now, 
            updatedAt: now
        };
        db.push(newProject); 
        await saveProjectToFolder(newProject);
        renderFolders();
    }
}

function openTemplateSelector() {
    const content = `
        <div style="padding:20px;">
            <h3 style="color:var(--accent); margin-top:0;">🎯 Choisir un template</h3>
            <p style="color:#94a3b8; margin-bottom:20px;">Démarrez rapidement avec un projet pré-configuré</p>
            
            ${projectTemplates.map(template => {
                const category = projectCategories.find(c => c.id === template.category);
                const difficulty = difficultyLevels.find(d => d.id === template.difficulty);
                
                return `
                <div class="folder-item" onclick="createFromTemplate('${template.id}')" style="cursor:pointer; margin-bottom:15px; border-left:3px solid ${category.color};">
                    <div style="font-size:32px; margin-right:15px;">${template.name.split(' ')[0]}</div>
                    <div style="flex:1;">
                        <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                            <b>${template.name.substring(template.name.indexOf(' ') + 1)}</b>
                            <span title="${difficulty.name}">${difficulty.icon}</span>
                        </div>
                        <p style="font-size:12px; opacity:0.7; margin:0;">${template.description}</p>
                        <div style="font-size:10px; opacity:0.5; margin-top:4px;">
                            ${template.components.length} composant(s) • ${template.code.split('\n').length} lignes de code
                        </div>
                    </div>
                </div>`;
            }).join('')}
            
            <button class="btn" style="background:#475569; width:100%; margin-top:10px;" onclick="closeModal('modal-template-selector'); createEmptyProject();">
                📝 Créer un projet vierge
            </button>
        </div>
    `;
    
    // Créer la modale si elle n'existe pas
    let modal = document.getElementById('modal-template-selector');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-template-selector';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-header">
                <button onclick="closeModal('modal-template-selector')" style="color:var(--primary); background:none; border:none;">← Retour</button>
                <h3>Templates</h3>
                <div style="width:60px"></div>
            </div>
            <div id="template-selector-content" style="overflow-y:auto; flex:1;"></div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('template-selector-content').innerHTML = content;
    openModal('modal-template-selector');
}

async function createFromTemplate(templateId) {
    const template = projectTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    const n = await customPrompt('Nom du projet ?', template.name.substring(template.name.indexOf(' ') + 1), 'Créer depuis template');
    if(n) {
        const now = new Date().toISOString();
        const newProject = {
            name: n,
            status: 'En cours',
            category: template.category,
            difficulty: template.difficulty,
            tags: [],
            favorite: false,
            notes: template.notes || '',
            code: template.code,
            img: '',
            schemaPrincipe: '',
            schemaProteus: '',
            components: JSON.parse(JSON.stringify(template.components)),
            createdAt: now,
            updatedAt: now
        };
        
        db.push(newProject);
        await saveProjectToFolder(newProject);
        closeModal('modal-template-selector');
        renderFolders();
        customAlert(`✅ Projet créé depuis le template !\n\n📝 ${template.components.length} composant(s) ajouté(s)\n💻 Code pré-rempli`, 'Succès');
    }
}

async function saveProject() {
    db[currentIdx].notes = document.getElementById('edit-notes').value;
    db[currentIdx].code = document.getElementById('edit-code').value;
    db[currentIdx].category = document.getElementById('edit-category').value;
    db[currentIdx].difficulty = document.getElementById('edit-difficulty').value;
    
    // Sauvegarder les tags (convertir la chaîne en tableau)
    const tagsInput = document.getElementById('edit-tags').value;
    db[currentIdx].tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    db[currentIdx].updatedAt = new Date().toISOString();
    await saveProjectToFolder(db[currentIdx]);
    renderFolders(); 
    closeModal('modal-project');
}

async function duplicateProject() {
    if (!projectDirHandle) {
        customAlert('⚠️ Aucun dossier configuré !', 'Attention');
        return;
    }
    
    const original = db[currentIdx];
    const now = new Date().toISOString();
    const copy = {
        name: original.name + ' (copie)',
        status: original.status,
        category: original.category || 'other',
        difficulty: original.difficulty || 'beginner',
        tags: JSON.parse(JSON.stringify(original.tags || [])),
        favorite: false,
        notes: original.notes,
        code: original.code,
        img: original.img,
        schemaPrincipe: original.schemaPrincipe || '',
        schemaProteus: original.schemaProteus || '',
        components: JSON.parse(JSON.stringify(original.components || [])),
        createdAt: now,
        updatedAt: now
    };
    
    db.push(copy);
    await saveProjectToFolder(copy);
    renderFolders();
    closeModal('modal-project');
}

async function deleteFolder() {
    const result = await customConfirm('Supprimer ce projet ?', 'Suppression');
    if(result) {
        const project = db[currentIdx];
        await deleteProjectFile(project);
        db.splice(currentIdx, 1);
        renderFolders(); 
        closeModal('modal-project');
    }
}

async function previewFile() {
    const file = document.getElementById('img-upload').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            db[currentIdx].img = e.target.result;
            document.getElementById('proj-img-preview').src = e.target.result;
            document.getElementById('proj-img-container').style.display = 'block';
            document.getElementById('proj-img-label').style.display = 'none';
            document.getElementById('proj-img-actions').style.display = 'flex';
            await saveProjectToFolder(db[currentIdx]);
        };
        reader.readAsDataURL(file);
    }
}

async function previewSchemaPrincipe() {
    const file = document.getElementById('schema-principe-upload').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            db[currentIdx].schemaPrincipe = e.target.result;
            document.getElementById('schema-principe-preview').src = e.target.result;
            document.getElementById('schema-principe-container').style.display = 'block';
            document.getElementById('schema-principe-label').style.display = 'none';
            document.getElementById('schema-principe-actions').style.display = 'flex';
            await saveProjectToFolder(db[currentIdx]);
        };
        reader.readAsDataURL(file);
    }
}

async function previewSchemaProteus() {
    const file = document.getElementById('schema-proteus-upload').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            db[currentIdx].schemaProteus = e.target.result;
            document.getElementById('schema-proteus-preview').src = e.target.result;
            document.getElementById('schema-proteus-container').style.display = 'block';
            document.getElementById('schema-proteus-label').style.display = 'none';
            document.getElementById('schema-proteus-actions').style.display = 'flex';
            await saveProjectToFolder(db[currentIdx]);
        };
        reader.readAsDataURL(file);
    }
}

async function deleteImage(type) {
    const result = await customConfirm('Supprimer cette image ?', 'Suppression');
    if (!result) return;
        
        if (type === 'img') {
            db[currentIdx].img = '';
            document.getElementById('proj-img-container').style.display = 'none';
            document.getElementById('proj-img-label').style.display = 'block';
            document.getElementById('proj-img-actions').style.display = 'none';
            document.getElementById('img-upload').value = '';
        } else if (type === 'schemaPrincipe') {
            db[currentIdx].schemaPrincipe = '';
            document.getElementById('schema-principe-container').style.display = 'none';
            document.getElementById('schema-principe-label').style.display = 'block';
            document.getElementById('schema-principe-actions').style.display = 'none';
            document.getElementById('schema-principe-upload').value = '';
        } else if (type === 'schemaProteus') {
            db[currentIdx].schemaProteus = '';
            document.getElementById('schema-proteus-container').style.display = 'none';
            document.getElementById('schema-proteus-label').style.display = 'block';
            document.getElementById('schema-proteus-actions').style.display = 'none';
            document.getElementById('schema-proteus-upload').value = '';
        }
        
        await saveProjectToFolder(db[currentIdx]);
}

// --- WIFI & ESP32 ---
function saveWifi() {
    localStorage.setItem('lab_ip', document.getElementById('ip-input').value);
    document.getElementById('home-status').innerText = "IP: " + document.getElementById('ip-input').value;
    closeModal('modal-wifi');
}

function sendCmd(cmd) {
    let ip = localStorage.getItem('lab_ip');
    if(!ip) {
        customAlert("Configurez l'IP dans les options !", 'Configuration requise');
        return;
    }
    fetch(`http://${ip}/${cmd}`)
    .then(r => r.text())
    .then(t => customAlert("Réponse: " + t, 'Réponse ESP32'))
    .catch(() => customAlert("Erreur de connexion", 'Erreur'));
}

function envoyerCode() {
    let mode = document.querySelector('input[name="code-mode"]:checked').value;
    if (mode !== 'wifi') {
        customAlert('Sélectionnez le mode WiFi pour exécuter.', 'Mode incorrect');
        return;
    }
    let ip = localStorage.getItem('lab_ip');
    if(!ip) {
        customAlert("Réglez l'IP !", 'Configuration requise');
        return;
    }
    let code = document.getElementById('edit-code').value;
    fetch(`http://${ip}/execute`, { method: 'POST', body: code, mode: 'no-cors' })
    .then(() => customAlert("Commandes exécutées via WiFi !", 'Succès'))
    .catch(() => customAlert("Erreur : ESP32 injoignable", 'Erreur'));
}

// ========================================
// GESTION LOCALE DES PROJETS
// ========================================

// Sauvegarder le handle du dossier dans IndexedDB
async function saveFolderHandle(handle) {
    try {
        const db = await openDB();
        const tx = db.transaction('handles', 'readwrite');
        await tx.objectStore('handles').put(handle, 'projectDir');
        await tx.done;
        console.log('✅ Dossier sauvegardé pour la prochaine session');
    } catch (error) {
        console.error('Erreur sauvegarde handle:', error);
    }
}

// Récupérer le handle du dossier depuis IndexedDB
async function loadFolderHandle() {
    return new Promise(async (resolve, reject) => {
        try {
            console.log('🔍 Tentative de chargement du handle depuis IndexedDB...');
            const db = await openDB();
            const tx = db.transaction('handles', 'readonly');
            const request = tx.objectStore('handles').get('projectDir');
            
            request.onsuccess = () => {
                const handle = request.result;
                console.log('📦 Handle récupéré:', handle ? 'OUI' : 'NON');
                if (handle) {
                    console.log('📦 Handle type:', typeof handle, 'kind:', handle.kind);
                }
                resolve(handle);
            };
            
            request.onerror = () => {
                console.error('❌ Erreur lors de la récupération:', request.error);
                resolve(null);
            };
        } catch (error) {
            console.error('❌ Erreur chargement handle:', error);
            resolve(null);
        }
    });
}

// Ouvrir la base de données IndexedDB
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ArduinoLabDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('handles')) {
                db.createObjectStore('handles');
            }
        };
    });
}

// Charger automatiquement les projets depuis le dossier
async function loadProjectsFromFolder() {
    console.log('🚀 Démarrage loadProjectsFromFolder...');
    
    // Vérifier si File System Access API est disponible
    if (!('showDirectoryPicker' in window)) {
        console.log('❌ File System Access API non disponible - utilisez Chrome ou Edge');
        return;
    }
    
    console.log('✅ File System Access API disponible');
    
    // Essayer de récupérer le dossier sauvegardé
    try {
        const savedHandle = await loadFolderHandle();
        console.log('📁 savedHandle type:', typeof savedHandle, savedHandle);
        
        if (savedHandle && savedHandle.kind === 'directory') {
            console.log('📁 Handle trouvé dans IndexedDB');
            
            // Vérifier si on peut accéder au dossier
            try {
                // Demander la permission si nécessaire
                const permission = await savedHandle.requestPermission({ mode: 'readwrite' });
                console.log('🔑 Permission:', permission);
                
                if (permission === 'granted') {
                    projectDirHandle = savedHandle;
                    console.log('✅ Dossier restauré depuis la session précédente');
                    await loadAllProjects();
                    return;
                } else {
                    console.log('⚠️ Permission refusée');
                }
            } catch (err) {
                console.log('⚠️ Erreur accès dossier:', err.message, err);
            }
        } else {
            console.log('⚠️ Pas de handle valide dans IndexedDB');
        }
    } catch (error) {
        console.log('⚠️ Impossible de restaurer le dossier:', error.message, error);
    }
    
    // Si pas de dossier sauvegardé ou permission refusée
    console.log('⚠️ Aucun dossier configuré - l\'utilisateur doit sélectionner le dossier projet/');
}

// Demander l'accès au dossier projet/ (optionnel, via bouton)
async function requestProjectFolderAccess() {
    if (!('showDirectoryPicker' in window)) {
        customAlert('❌ Votre navigateur ne supporte pas cette fonctionnalité.\n\nUtilisez Chrome ou Edge.', 'Navigateur non supporté');
        return false;
    }
    
    try {
        projectDirHandle = await window.showDirectoryPicker({
            mode: 'readwrite',
            startIn: 'desktop'
        });
        
        // Sauvegarder le dossier pour la prochaine session
        await saveFolderHandle(projectDirHandle);
        
        await loadAllProjects();
        renderFolders();
        customAlert('✅ Dossier "projet" configuré !\n\nVos projets seront sauvegardés automatiquement dans ce dossier.\n\n💾 Le dossier sera mémorisé pour les prochaines visites.', 'Configuration réussie');
        return true;
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Erreur accès dossier:', error);
        }
        return false;
    }
}

// Charger tous les projets depuis le dossier
async function loadAllProjects() {
    if (!projectDirHandle) return;
    
    db = [];
    
    try {
        for await (const entry of projectDirHandle.values()) {
            if (entry.kind === 'file' && entry.name.endsWith('.json')) {
                const file = await entry.getFile();
                const content = await file.text();
                try {
                    const project = JSON.parse(content);
                    db.push(project);
                } catch (e) {
                    console.error('Erreur lecture projet:', entry.name, e);
                }
            }
        }
        console.log(`✅ ${db.length} projet(s) chargé(s) depuis le dossier`);
    } catch (error) {
        console.error('Erreur chargement projets:', error);
    }
}

// Sauvegarder un projet dans le dossier
async function saveProjectToFolder(project) {
    // Vérifier qu'un dossier est configuré
    if (!projectDirHandle) {
        customAlert('⚠️ Aucun dossier configuré !\n\nVeuillez configurer le dossier projet/ dans les paramètres.', 'Attention');
        return;
    }
    
    try {
        const fileName = project.name.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.json';
        const fileHandle = await projectDirHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(project, null, 2));
        await writable.close();
        console.log('✅ Projet sauvegardé dans le dossier:', fileName);
    } catch (error) {
        console.error('Erreur sauvegarde fichier:', error);
    }
}

// Supprimer un fichier projet
async function deleteProjectFile(project) {
    if (!projectDirHandle) return;
    
    try {
        const fileName = project.name.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.json';
        await projectDirHandle.removeEntry(fileName);
        console.log('✅ Projet supprimé du dossier:', fileName);
    } catch (error) {
        console.error('Erreur suppression fichier:', error);
    }
}

// localStorage n'est plus utilisé - tous les projets sont sauvegardés dans le dossier projet/
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function openModal(id) { document.getElementById(id).style.display = 'flex'; }

function toggleMode() {
    let mode = document.querySelector('input[name="code-mode"]:checked').value;
    let btnCopy = document.getElementById('btn-copy');
    let btnExecute = document.getElementById('btn-execute');
    if (mode === 'ide') {
        btnCopy.style.display = 'inline-block';
        btnExecute.style.display = 'none';
    } else {
        btnCopy.style.display = 'none';
        btnExecute.style.display = 'inline-block';
    }
}

function clearCalc(id) {
    if (!id) return; // Protection si id n'est pas défini
    const formula = formulas.find(f => f.id === id);
    if (!formula) return;
    formula.ins.forEach(input => {
        let elem = document.getElementById('m-' + id + '-' + input.id);
        if (elem) elem.value = '';
    });
    let resElem = document.getElementById('res-' + id);
    if (resElem) resElem.innerText = '---';
}

function copyCode() {
    navigator.clipboard.writeText(document.getElementById('edit-code').value);
    customAlert('Code copié dans le presse-papiers ! Collez-le dans l\'IDE Arduino.', 'Succès');
}

// ========================================
// SYSTÈME DE NOTIFICATIONS TOAST
// ========================================

function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const parts = message.split('\n');
    const title = parts[0];
    const content = parts.slice(1).join('<br>');
    
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            ${content ? `<div class="toast-message">${content}</div>` : ''}
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, duration);
}

// ========================================
// RACCOURCIS CLAVIER
// ========================================

document.addEventListener('keydown', (e) => {
    // Échap : fermer les modales
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal[style*="display: flex"], .modal[style*="display: block"]');
        modals.forEach(modal => modal.style.display = 'none');
    }
    
    // Ctrl+F : Focus sur la recherche (composants)
    if (e.ctrlKey && e.key === 'f') {
        const searchInput = document.getElementById('component-search');
        if (searchInput && document.getElementById('view-components').classList.contains('active-view')) {
            e.preventDefault();
            searchInput.focus();
        }
    }
    
    // Ctrl+S : Sauvegarder le projet en cours d'édition
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        const editModal = document.getElementById('modal-edit');
        if (editModal && editModal.style.display === 'flex' && currentIdx !== null) {
            saveEdit();
            showToast('Projet sauvegardé !', 'success');
        }
    }
    
    // Ctrl+N : Nouveau projet
    if (e.ctrlKey && e.key === 'n') {
        if (document.getElementById('view-folders').classList.contains('active-view')) {
            e.preventDefault();
            newFolder();
        }
    }
});

// ========================================
// FAVORIS COMPOSANTS
// ========================================

function toggleComponentFavorite(categoryId, componentId) {
    const key = `${categoryId}:${componentId}`;
    const index = favoriteComponents.indexOf(key);
    
    if (index > -1) {
        favoriteComponents.splice(index, 1);
        showToast('Retiré des favoris', 'info');
    } else {
        favoriteComponents.push(key);
        showToast('Ajouté aux favoris ⭐', 'success');
    }
    
    localStorage.setItem('lab_favorite_components', JSON.stringify(favoriteComponents));
    
    // Mettre à jour le badge
    updateFavoritesCount();
    
    // Rafraîchir l'affichage si on est dans les détails
    const detailModal = document.getElementById('modal-component-detail');
    if (detailModal && detailModal.style.display === 'flex') {
        showComponentDetail(categoryId, componentId);
    }
}

function updateFavoritesCount() {
    const badge = document.getElementById('favorites-count');
    if (badge) {
        if (favoriteComponents.length > 0) {
            badge.textContent = favoriteComponents.length;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

function isComponentFavorite(categoryId, componentId) {
    return favoriteComponents.includes(`${categoryId}:${componentId}`);
}

function showFavoriteComponents() {
    if (favoriteComponents.length === 0) {
        showToast('Aucun composant favori\nAjoutez-en depuis les détails !', 'info');
        return;
    }
    
    let html = '<div style="padding:20px;">';
    html += '<h3 style="color:var(--accent); margin-top:0;">⭐ Composants Favoris</h3>';
    
    favoriteComponents.forEach(key => {
        const [catId, compId] = key.split(':');
        const category = componentCategories.find(c => c.id === catId);
        if (!category) return;
        
        const component = category.components.find(c => c.id === compId);
        if (!component) return;
        
        html += `<div class="folder-item" onclick="closeModal('modal-favorites'); showComponentDetail('${catId}', '${compId}');" style="margin-bottom:10px;">
            <div class="folder-thumb">${category.icon}</div>
            <div style="flex:1">
                <b>${component.name}</b><br>
                <small style="color:#94a3b8;">${category.name}</small>
            </div>
            <span style="font-size:18px;">→</span>
        </div>`;
    });
    
    html += '</div>';
    
    const modal = document.createElement('div');
    modal.id = 'modal-favorites';
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div style="max-width:500px; width:90%; margin:auto; margin-top:10vh; animation: slideIn 0.2s ease;">
            <div class="card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3 style="margin:0; color:var(--accent);">⭐ Favoris</h3>
                    <button onclick="closeModal('modal-favorites')" style="background:none; border:none; font-size:24px; cursor:pointer;">✕</button>
                </div>
                ${html}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ========================================
// MODE PLEIN ÉCRAN POUR LE CODE
// ========================================

function toggleFullscreenCode() {
    const modal = document.getElementById('modal-edit');
    const codeEditor = document.getElementById('edit-code');
    
    if (!modal || !codeEditor) return;
    
    if (modal.classList.contains('fullscreen-mode')) {
        // Sortir du plein écran
        modal.classList.remove('fullscreen-mode');
        showToast('Mode normal', 'info', 1500);
    } else {
        // Passer en plein écran
        modal.classList.add('fullscreen-mode');
        codeEditor.style.height = 'calc(100vh - 180px)';
        showToast('Mode plein écran\nAppuyez sur Échap pour quitter', 'info', 2000);
    }
}

// ========================================
// COPIE RAPIDE AMÉLIORÉE
// ========================================

async function copyToClipboard(text, successMessage = 'Copié !') {
    try {
        await navigator.clipboard.writeText(text);
        showToast(successMessage, 'success', 2000);
        return true;
    } catch (err) {
        showToast('Erreur de copie', 'error');
        return false;
    }
}

// ========================================
// THÈME CLAIR/SOMBRE
// ========================================

function toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('lab_theme', newTheme);
    
    // Mettre à jour l'icône
    document.getElementById('theme-icon').textContent = newTheme === 'light' ? '☀️' : '🌙';
}

function loadTheme() {
    const savedTheme = localStorage.getItem('lab_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = savedTheme === 'light' ? '☀️' : '🌙';
}

// ========================================
// RECHERCHE DE COMPOSANTS
// ========================================

function searchComponents(query) {
    const search = query.toLowerCase().trim();
    const categoryList = document.getElementById('component-category-list');
    
    if (!categoryList) return;
    
    // Si recherche vide, tout afficher
    if (search === '') {
        renderComponentCategories();
        return;
    }
    
    // Filtrer les composants
    let html = '';
    let foundCount = 0;
    
    componentCategories.forEach(cat => {
        const matchingComponents = cat.components.filter(comp => {
            const name = comp.name ? comp.name.toLowerCase() : '';
            const desc = comp.description ? comp.description.toLowerCase() : '';
            const id = comp.id ? comp.id.toLowerCase() : '';
            return name.includes(search) || desc.includes(search) || id.includes(search);
        });
        
        if (matchingComponents.length > 0) {
            html += `<div style="margin-bottom:25px;">
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                    <span style="font-size:24px;">${cat.icon}</span>
                    <h3 style="margin:0; color:var(--accent);">${cat.name}</h3>
                    <span style="font-size:12px; color:#94a3b8;">(${matchingComponents.length})</span>
                </div>`;
            
            matchingComponents.forEach(comp => {
                foundCount++;
                html += `<div class="folder-item" onclick="openComponentDetail('${cat.id}', '${comp.id}')">
                    <div class="folder-thumb">${cat.icon}</div>
                    <div style="flex:1">
                        <b>${comp.name}</b><br>
                        <small style="color:#94a3b8;">${comp.description?.substring(0, 50) || ''}...</small>
                    </div>
                    <span style="font-size:18px;">→</span>
                </div>`;
            });
            
            html += '</div>';
        }
    });
    
    if (foundCount === 0) {
        html = `<div class="card" style="text-align:center; padding:40px;">
            <div style="font-size:48px; margin-bottom:15px;">🔍</div>
            <h3 style="color:var(--accent);">Aucun résultat</h3>
            <p style="color:#94a3b8;">Aucun composant ne correspond à "${query}"</p>
        </div>`;
    } else {
        html = `<div style="padding:10px 20px; background:var(--card); margin-bottom:15px; border-radius:10px; border-left:4px solid var(--success);">
            <b style="color:var(--success);">✓ ${foundCount} composant(s) trouvé(s)</b>
        </div>` + html;
    }
    
    categoryList.innerHTML = html;
}

// ========================================
// HISTORIQUE DES CALCULS
// ========================================

let calculationHistory = [];

function saveCalculation(formulaId, inputs, result) {
    const formula = formulas.find(f => f.id === formulaId);
    if (!formula) return;
    
    const calculation = {
        id: Date.now(),
        formulaId: formulaId,
        formulaName: formula.name,
        inputs: inputs,
        result: result,
        timestamp: new Date().toISOString()
    };
    
    calculationHistory.unshift(calculation);
    
    // Garder seulement les 20 derniers calculs
    if (calculationHistory.length > 20) {
        calculationHistory = calculationHistory.slice(0, 20);
    }
    
    // Sauvegarder dans localStorage
    localStorage.setItem('lab_calc_history', JSON.stringify(calculationHistory));
}

function loadCalculationHistory() {
    const saved = localStorage.getItem('lab_calc_history');
    if (saved) {
        try {
            calculationHistory = JSON.parse(saved);
        } catch(e) {
            calculationHistory = [];
        }
    }
}

function showCalculationHistory() {
    if (calculationHistory.length === 0) {
        customAlert('Aucun calcul dans l\'historique.', 'Historique');
        return;
    }
    
    let html = '<div style="max-height:400px; overflow-y:auto;">';
    
    calculationHistory.forEach((calc, index) => {
        const date = new Date(calc.timestamp);
        const timeStr = date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'});
        
        html += `<div class="card" style="margin-bottom:10px; padding:15px;">
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;">
                <b style="color:var(--accent);">${calc.formulaName}</b>
                <small style="color:#94a3b8;">${timeStr}</small>
            </div>
            <div style="font-size:13px; color:#cbd5e1;">
                ${Object.entries(calc.inputs).map(([key, val]) => `${key}: ${val}`).join(' | ')}
            </div>
            <div style="margin-top:8px; padding-top:8px; border-top:1px solid #334155;">
                <b style="color:var(--success);">Résultat: ${calc.result}</b>
            </div>
        </div>`;
    });
    
    html += '</div>';
    html += '<button class="btn" style="background:var(--danger); margin-top:10px;" onclick="clearCalculationHistory()">Effacer l\'historique</button>';
    
    customAlert(html, '📊 Historique des calculs (${calculationHistory.length})');
}

function clearCalculationHistory() {
    calculationHistory = [];
    localStorage.removeItem('lab_calc_history');
    customAlert('Historique effacé.', 'Succès');
}

// ========================================
// INITIALISATION AU CHARGEMENT
// ========================================

window.onload = async () => {
    let ip = localStorage.getItem('lab_ip');
    if(ip) document.getElementById('home-status').innerText = "IP: " + ip;
    
    // Charger le thème
    loadTheme();
    
    // Charger l'historique de calculs
    loadCalculationHistory();
    
    // Mettre à jour le compteur de favoris
    updateFavoritesCount();
    
    // Charger les projets
    await loadProjectsFromFolder();
    
    renderFolders();
    
    // Message de bienvenue au premier lancement
    const firstVisit = !localStorage.getItem('lab_visited');
    if (firstVisit) {
        localStorage.setItem('lab_visited', 'true');
        setTimeout(() => {
            customAlert('👋 Bienvenue sur ESP32 Lab Pro !\n\n' +
                  '📁 Tes projets sont sauvegardés localement\n\n' +
                  '💡 Crée, modifie et gère tes projets Arduino !\n\n' +
                  'Bon travail ! 🚀', 'Bienvenue');
        }, 1000);
    }
};
