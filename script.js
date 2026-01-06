let db = [];
let currentIdx = null;
let projectDirHandle = null; // Handle vers le dossier "projet" (obligatoire pour sauvegarder)

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
        id: 'led',
        name: 'LED',
        icon: '💡',
        description: 'Diodes électroluminescentes',
        components: [
            {
                id: 'led-red',
                name: 'LED Rouge 5mm',
                voltage: '1.8-2.2V',
                current: '20 mA',
                wavelength: '620-625 nm',
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
            }
        ]
    },
    {
        id: 'input',
        name: 'Entrées',
        icon: '🎛️',
        description: 'Boutons, potentiomètres et commandes',
        components: [
            {
                id: 'push-button',
                name: 'Bouton poussoir',
                voltage: '12V max',
                current: '50 mA',
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
            }
        ]
    },
    {
        id: 'audio',
        name: 'Audio',
        icon: '🔊',
        description: 'Buzzers et haut-parleurs',
        components: [
            {
                id: 'buzzer-active',
                name: 'Buzzer actif',
                voltage: '3.5-5V',
                frequency: 'Fixe (~2kHz)',
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
        name: 'Résistances',
        icon: '⚡',
        description: 'Composants passifs limitant le courant',
        components: generateStandardResistors()
    },
    {
        id: 'capacitor',
        name: 'Condensateurs',
        icon: '🔋',
        description: 'Stockage d\'énergie électrique',
        components: [
            {
                id: 'cap-100n',
                name: 'Condensateur céramique 100nF',
                voltage: '50V',
                type: 'Céramique',
                symbole: 'images/composants/Condensateurs/cap-100n/symbole/symbole.png',
                description: 'Condensateur de découplage/filtrage très utilisé en électronique numérique.',
                usage: 'Filtrage alimentation, découplage IC, anti-rebond bouton. Placer au plus près des broches VCC/GND des circuits intégrés.',
                pinout: 'Pas de polarité : peut se brancher dans les deux sens\nPatte 1 : borne\nPatte 2 : borne',
                pinoutFolder: 'images/composants/Condensateurs/cap-100n/brochage',
                footprint: 'Espacement des pattes: 2.54mm ou 5.08mm\nDimensions: 4-6mm largeur',
                footprintFolder: 'images/composants/Condensateurs/cap-100n/empreinte',
                formula: 'Fréquence de coupure: fc = 1 / (2πRC)\nAvec C = 100nF',
                calculator: {
                    inputs: [{id: 'r', label: 'Résistance (kΩ)', default: 10}],
                    calc: '1 / (2 * 3.14159 * r * 1000 * 100e-9)',
                    result: 'Fréquence de coupure: {result} Hz'
                }
            },
            {
                id: 'cap-1000u',
                name: 'Condensateur électrolytique 1000µF',
                voltage: '16V ou 25V',
                type: 'Électrolytique (polarisé)',
                symbole: 'images/composants/Condensateurs/cap-1000u/symbole/symbole.png',
                description: 'Grand condensateur pour filtrage et réservoir d\'énergie. ATTENTION : polarisé !',
                usage: 'Filtrage alimentation, réservoir d\'énergie, lissage tension. Respecter la polarité : + vers VCC, - vers GND.',
                pinout: 'Patte longue : + (positif)\nPatte courte : - (négatif, souvent marqué par une bande)',
                pinoutFolder: 'images/composants/Condensateurs/cap-1000u/brochage',
                footprint: 'Diamètre: 6.3-8mm\nEspacement des pattes: 2.5mm\nHauteur: 11-13mm',
                footprintFolder: 'images/composants/Condensateurs/cap-1000u/empreinte',
                formula: 'Énergie stockée: E = 0.5 × C × V²\nAvec C = 1000µF = 0.001F',
                calculator: {
                    inputs: [{id: 'v', label: 'Tension (V)', default: 16}],
                    calc: '0.5 * 0.001 * v * v',
                    result: 'Énergie stockée: {result} J'
                }
            }
        ]
    },
    {
        id: 'sensor',
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
                symbole: 'images/composants/Capteurs/ldr/symbole/symbole.png',
                description: 'Capteur de lumière dont la résistance varie selon l\'intensité lumineuse.',
                usage: 'Détection jour/nuit, allumage automatique, photomètre. Utiliser en diviseur de tension avec une résistance fixe.',
                pinout: 'Pas de polarité : peut se brancher dans les deux sens',
                pinoutFolder: 'images/composants/Capteurs/ldr/brochage',
                footprint: 'Diamètre: 5mm\nEspacement des pattes: variable',
                footprintFolder: 'images/composants/Capteurs/ldr/empreinte',
                formula: 'Diviseur de tension: Vout = Vcc × R / (R + RLDR)',
                calculator: {
                    inputs: [{id: 'vcc', label: 'Tension source (V)', default: 5}, {id: 'r', label: 'Résistance fixe (kΩ)', default: 10}, {id: 'rldr', label: 'Résistance LDR (kΩ)', default: 5}],
                    calc: 'vcc * r / (r + rldr)',
                    result: 'Tension sortie: {result} V'
                },
                code: 'int ldrPin = A0;\nint value = analogRead(ldrPin); // 0-1023\nfloat voltage = value * (5.0 / 1023.0);'
            },
            {
                id: 'hcsr04',
                name: 'HC-SR04 Ultrason',
                voltage: '5V',
                range: '2-400 cm',
                accuracy: '±3mm',
                symbole: 'images/composants/Capteurs/hcsr04/symbole/symbole.png',
                description: 'Capteur de distance à ultrasons très précis et abordable.',
                usage: 'Mesure de distance, détection d\'obstacles, robot autonome, stationnement.',
                pinout: 'VCC : 5V\nTrig : broche numérique (envoi impulsion)\nEcho : broche numérique (réception)\nGND : masse',
                pinoutFolder: 'images/composants/Capteurs/hcsr04/brochage',
                footprint: 'Module: 45 × 20 × 15mm\nCapteurs espacés de 26mm',
                footprintFolder: 'images/composants/Capteurs/hcsr04/empreinte',
                formula: 'Distance (cm) = (Durée × Vitesse_son) / 2\nVitesse du son = 340 m/s = 0.034 cm/μs\nDiviser par 2 car aller-retour',
                calculator: {
                    inputs: [{id: 'duree', label: 'Durée (μs)', default: 1000}],
                    calc: 'duree * 0.034 / 2',
                    result: 'Distance: {result} cm'
                },
                code: 'digitalWrite(trig, HIGH);\ndelayMicroseconds(10);\ndigitalWrite(trig, LOW);\nlong duration = pulseIn(echo, HIGH);\nint distance = duration * 0.034 / 2;'
            }
        ]
    },
    {
        id: 'actuator',
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
                symbole: 'images/composants/Actionneurs/sg90/symbole/symbole.png',
                description: 'Petit servomoteur très populaire, précis et abordable pour les projets Arduino.',
                usage: 'Robotique, bras articulé, volet motorisé, direction RC. Signal PWM 50Hz (20ms), impulsions 1-2ms.',
                pinout: 'Marron/Noir : GND\nRouge : VCC (5V externe recommandé)\nOrange/Jaune : Signal PWM',
                pinoutFolder: 'images/composants/Actionneurs/sg90/brochage',
                footprint: 'Corps: 22.5 × 12 × 29mm\nFixes: 32mm entre trous de montage',
                footprintFolder: 'images/composants/Actionneurs/sg90/empreinte',
                formula: 'Durée (ms) = 1 + (Angle / 180)\nFréquence : 50Hz (période 20ms)',
                calculator: {
                    inputs: [{id: 'angle', label: 'Angle (0-180°)', default: 90}],
                    calc: '1 + (angle / 180)',
                    result: 'Durée impulsion: {result} ms'
                },
                code: '#include <Servo.h>\nServo servo;\nvoid setup() { servo.attach(9); }\nservo.write(90); // Position 90°'
            },
            {
                id: 'relay-5v',
                name: 'Relais 5V 10A',
                voltage: '5V (bobine)',
                current: '10A max (contact)',
                symbole: 'images/composants/Actionneurs/relay-5v/symbole/symbole.png',
                description: 'Relais électromécanique permettant de contrôler des charges AC/DC puissantes.',
                usage: 'Domotique, contrôle de lampes 220V, moteurs puissants, électrovannes. DANGER : 220V !',
                pinout: 'VCC : 5V\nGND : masse\nIN : signal de commande (LOW = activé)\nCOM, NO, NC : contacts de puissance',
                pinoutFolder: 'images/composants/Actionneurs/relay-5v/brochage',
                footprint: 'Module: 50 × 26 × 18mm\nBorniers à vis pour haute tension',
                footprintFolder: 'images/composants/Actionneurs/relay-5v/empreinte',
                formula: 'Courant bobine : I = V / R\nPuissance commutée : P = V × I',
                calculator: {
                    inputs: [{id: 'v', label: 'Tension charge (V)', default: 220}, {id: 'i', label: 'Courant charge (A)', default: 1}],
                    calc: 'v * i',
                    result: 'Puissance commutée: {result} W'
                },
                warning: '⚠️ ATTENTION : Manipuler avec précaution, risque électrique 220V AC !',
                code: 'digitalWrite(relayPin, LOW); // Activer\ndelay(1000);\ndigitalWrite(relayPin, HIGH); // Désactiver'
            }
        ]
    },
    {
        id: 'ic',
        name: 'Circuits Intégrés',
        icon: '🔲',
        description: 'Puces et modules',
        components: [
            {
                id: '74hc595',
                name: '74HC595 Registre à décalage',
                voltage: '2-6V',
                outputs: '8 sorties',
                symbole: 'images/composants/Circuits-Integres/74hc595/symbole/symbole.png',
                description: 'Registre à décalage permettant d\'étendre les sorties numériques avec seulement 3 broches.',
                usage: 'Multiplexage LED, afficheurs 7 segments, expansion GPIO. Cascadable.',
                pinout: 'DS (14) : données série\nSHCP (11) : horloge shift\nSTCP (12) : horloge stockage (latch)\nOE (13) : Output Enable (actif LOW)\nMR (10) : Master Reset (actif LOW)\nQ0-Q7 (15,1-7) : sorties parallèles\nQ7\' (9) : sortie série (cascade)\nVCC (16) : alimentation\nGND (8) : masse',
                pinoutFolder: 'images/composants/Circuits-Integres/74hc595/brochage',
                footprint: 'Boîtier DIP-16\nEspacement des pattes: 2.54mm\nLargeur: 7.62mm\nLongueur: 19.5mm',
                footprintFolder: 'images/composants/Circuits-Integres/74hc595/empreinte',
                formula: 'Nombre de sorties avec N registres : Sorties = 8 × N\nConsommation : ~80 µA par MHz',
                code: 'int latchPin = 8;\nint clockPin = 12;\nint dataPin = 11;\n\nvoid setup() {\n  pinMode(latchPin, OUTPUT);\n  pinMode(clockPin, OUTPUT);\n  pinMode(dataPin, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(latchPin, LOW);\n  shiftOut(dataPin, clockPin, MSBFIRST, 0b10101010);\n  digitalWrite(latchPin, HIGH);\n}'
            }
        ]
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

            default:
                res.innerText = "---";
        }
    } catch(e) {
        console.error('Erreur calcul pour ' + id + ':', e);
        res.innerText = "Erreur";
    }
}

// --- NAVIGATION & INTERFACE ---
function switchView(id) {
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
    const list = document.getElementById('component-categories');
    list.innerHTML = `
        <div id="categories-section">
            <h3 style="color:var(--accent); margin:0 20px 15px 20px; font-size:16px;">📂 Catégories</h3>
            <div id="categories-list">
                ${componentCategories.map(cat => `
                    <div class="folder-item category-item" data-category-id="${cat.id}" data-category-name="${cat.name.toLowerCase()}" data-category-desc="${cat.description.toLowerCase()}" onclick="showComponentList('${cat.id}')" style="border-left: 5px solid var(--accent);">
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
            const componentImagePath = item.component.imagePath || `images/composants/${item.category.id}/${item.component.id}/apercu/composant.png`;
            return `
            <div class="folder-item" onclick="showComponentDetail('${item.category.id}', '${item.component.id}')" style="border-left: 5px solid var(--primary); margin:0 20px 10px 20px;">
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

function showComponentList(categoryId) {
    const category = componentCategories.find(c => c.id === categoryId);
    if (!category) return;
    
    document.getElementById('component-list-title').innerText = category.name;
    document.getElementById('component-list-content').innerHTML = category.components.map(comp => {
        const componentImagePath = comp.imagePath || `images/composants/${categoryId}/${comp.id}/apercu/composant.png`;
        return `
        <div class="folder-item component-item" data-comp-name="${comp.name.toLowerCase()}" data-comp-voltage="${(comp.voltage || comp.type || '').toLowerCase()}" onclick="showComponentDetail('${categoryId}', '${comp.id}')" style="border-left: 5px solid var(--primary);">
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

function showComponentDetail(categoryId, componentId) {
    const category = componentCategories.find(c => c.id === categoryId);
    if (!category) return;
    const component = category.components.find(c => c.id === componentId);
    if (!component) return;
    
    closeModal('modal-component-list');
    
    document.getElementById('component-detail-title').innerText = component.name;
    
    // Image du composant
    const componentImagePath = component.imagePath || `images/composants/${categoryId}/${componentId}/apercu/composant.png`;
    
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
    
    list.innerHTML = sortedDb.map((f) => {
        const originalIndex = db.indexOf(f);
        const lastUpdate = f.updatedAt || f.createdAt;
        const dateStr = lastUpdate ? new Date(lastUpdate).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: 'numeric'}) : '';
        return `
        <div class="folder-item" onclick="openFolder(${originalIndex})">
            <div class="folder-thumb">${f.img ? `<img src="${f.img}" style="width:100%;height:100%;border-radius:10px;object-fit:cover">` : '📂'}</div>
            <div style="flex:1"><b>${f.name}</b><br><span style="font-size:10px; opacity:0.6;">${f.status}${dateStr ? ' • ' + dateStr : ''}</span></div>
        </div>`;
    }).join('');
}

function openFolder(i) {
    currentIdx = i; const f = db[i];
    document.getElementById('edit-title').innerText = f.name;
    document.getElementById('edit-notes').value = f.notes || "";
    document.getElementById('edit-code').value = f.code || "";
    
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
    
    document.getElementById('modal-project').style.display = 'flex';
}

function renderProjectComponents() {
    const f = db[currentIdx];
    if (!f.components) f.components = [];
    
    const container = document.getElementById('project-components');
    if (f.components.length === 0) {
        container.innerHTML = '<p style="color:#94a3b8; font-size:12px; font-style:italic;">Aucun composant ajouté</p>';
        return;
    }
    
    container.innerHTML = f.components.map((comp, idx) => `
        <div class="folder-item" style="margin-bottom:8px; padding:10px; border-left:3px solid var(--accent);" onclick="viewProjectComponent(${idx})">
            <div class="folder-thumb" style="width:40px; height:40px; font-size:20px;">${comp.icon}</div>
            <div style="flex:1">
                <b style="font-size:13px;">${comp.quantity || 1}x ${comp.name}</b><br>
                <span style="font-size:10px; opacity:0.6;">${comp.category}</span>
            </div>
            <button onclick="removeProjectComponent(${idx}); event.stopPropagation();" style="background:var(--danger); color:white; border:none; padding:5px 10px; border-radius:5px; font-size:11px;">✕</button>
        </div>
    `).join('');
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
                            ${cat.components.map(comp => `
                                <div class="folder-item component-selectable" data-cat-id="${cat.id}" data-comp-id="${comp.id}" data-comp-name="${comp.name.toLowerCase()}" data-comp-voltage="${(comp.voltage || comp.type || '').toLowerCase()}" onclick="toggleComponentSelection(this)" style="border-left:3px solid #475569; margin-bottom:8px; cursor:pointer;">
                                    <input type="checkbox" class="component-checkbox" style="width:20px; height:20px; margin-right:10px;">
                                    <div class="folder-thumb" style="width:40px; height:40px; font-size:20px;">${cat.icon}</div>
                                    <div style="flex:1">
                                        <b style="font-size:13px;">${comp.name}</b><br>
                                        <span style="font-size:10px; opacity:0.6;">${comp.voltage || comp.type || ''}</span>
                                    </div>
                                </div>
                            `).join('')}
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
        componentsResults.innerHTML = matchingComponents.map(item => `
            <div class="folder-item component-selectable" data-cat-id="${item.category.id}" data-comp-id="${item.component.id}" data-comp-name="${item.component.name.toLowerCase()}" data-comp-voltage="${(item.component.voltage || item.component.type || '').toLowerCase()}" onclick="toggleComponentSelection(this)" style="border-left:3px solid #475569; margin-bottom:8px; cursor:pointer;">
                <input type="checkbox" class="component-checkbox" style="width:20px; height:20px; margin-right:10px;">
                <div class="folder-thumb" style="width:40px; height:40px; font-size:20px;">${item.category.icon}</div>
                <div style="flex:1">
                    <b style="font-size:13px;">${item.component.name}</b><br>
                    <span style="font-size:10px; opacity:0.6;">${item.category.name} • ${item.component.voltage || item.component.type || ''}</span>
                </div>
            </div>
        `).join('');
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

function addMultipleComponents() {
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
    
    saveProjectToFolder(db[currentIdx]);
    renderProjectComponents();
    closeModal('modal-component-picker');
}

function addComponentToProject(catId, compId) {
    // Cette fonction n'est plus utilisée mais on la garde pour compatibilité
    const category = componentCategories.find(c => c.id === catId);
    if (!category) return;
    const component = category.components.find(c => c.id === compId);
    if (!component) return;
    
    const f = db[currentIdx];
    if (!f.components) f.components = [];
    
    // Demander la quantité
    customPrompt('Quantité de ce composant ?', '1', 'Ajouter un composant').then(quantity => {
        if (!quantity) return; // Annulé
        quantity = parseInt(quantity);
        if (isNaN(quantity) || quantity <= 0) {
            customAlert('Quantité invalide !', 'Erreur');
            return;
        }
        
        // Vérifier si le composant existe déjà
        const existing = f.components.find(c => c.id === compId);
        if (existing) {
            // Si déjà présent, augmenter la quantité
            existing.quantity += quantity;
            saveProjectToFolder(db[currentIdx]);
            renderProjectComponents();
            closeModal('modal-component-picker');
            customAlert('Quantité mise à jour ! 💡', 'Succès');
            return;
        }
        
        f.components.push({
            id: compId,
            categoryId: catId,
            name: component.name,
            category: category.name,
            icon: category.icon,
            quantity: quantity,
            data: component
        });
        
        saveProjectToFolder(db[currentIdx]);
        renderProjectComponents();
        closeModal('modal-component-picker');
        customAlert('Composant ajouté ! 💡', 'Succès');
    });
}

function removeProjectComponent(idx) {
    const f = db[currentIdx];
    customConfirm('Retirer ce composant du projet ?', 'Confirmation').then(result => {
        if (result) {
            f.components.splice(idx, 1);
            saveProjectToFolder(db[currentIdx]);
            renderProjectComponents();
        }
    });
}

function viewProjectComponent(idx) {
    const f = db[currentIdx];
    const comp = f.components[idx];
    showComponentDetail(comp.categoryId, comp.id);
}

function newFolder() {
    if (!projectDirHandle) {
        customAlert('⚠️ Aucun dossier configuré !\n\nVeuillez d\'abord configurer le dossier projet/ dans les paramètres.', 'Attention');
        return;
    }
    
    customPrompt('Nom du projet ?', '', 'Nouveau projet').then(n => {
        if(n) { 
            const now = new Date().toISOString();
            const newProject = {name:n, status:'En cours', notes:'', code:'', img:'', schemaPrincipe:'', schemaProteus:'', components:[], createdAt: now, updatedAt: now};
            db.push(newProject); 
            saveProjectToFolder(newProject);
            renderFolders();
        }
    });
}

function saveProject() {
    db[currentIdx].notes = document.getElementById('edit-notes').value;
    db[currentIdx].code = document.getElementById('edit-code').value;
    db[currentIdx].updatedAt = new Date().toISOString();
    saveProjectToFolder(db[currentIdx]);
    renderFolders(); 
    closeModal('modal-project');
}

function duplicateProject() {
    if (!projectDirHandle) {
        customAlert('⚠️ Aucun dossier configuré !', 'Attention');
        return;
    }
    
    const original = db[currentIdx];
    const now = new Date().toISOString();
    const copy = {
        name: original.name + ' (copie)',
        status: original.status,
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
    saveProjectToFolder(copy);
    renderFolders();
    closeModal('modal-project');
}

function deleteFolder() {
    customConfirm('Supprimer ce projet ?', 'Suppression').then(result => {
        if(result) {
            const project = db[currentIdx];
            deleteProjectFile(project);
            db.splice(currentIdx, 1);
            renderFolders(); 
            closeModal('modal-project');
        }
    });
}

function previewFile() {
    const file = document.getElementById('img-upload').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            db[currentIdx].img = e.target.result;
            document.getElementById('proj-img-preview').src = e.target.result;
            document.getElementById('proj-img-container').style.display = 'block';
            document.getElementById('proj-img-label').style.display = 'none';
            document.getElementById('proj-img-actions').style.display = 'flex';
            saveProjectToFolder(db[currentIdx]);
        };
        reader.readAsDataURL(file);
    }
}

function previewSchemaPrincipe() {
    const file = document.getElementById('schema-principe-upload').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            db[currentIdx].schemaPrincipe = e.target.result;
            document.getElementById('schema-principe-preview').src = e.target.result;
            document.getElementById('schema-principe-container').style.display = 'block';
            document.getElementById('schema-principe-label').style.display = 'none';
            document.getElementById('schema-principe-actions').style.display = 'flex';
            saveProjectToFolder(db[currentIdx]);
        };
        reader.readAsDataURL(file);
    }
}

function previewSchemaProteus() {
    const file = document.getElementById('schema-proteus-upload').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            db[currentIdx].schemaProteus = e.target.result;
            document.getElementById('schema-proteus-preview').src = e.target.result;
            document.getElementById('schema-proteus-container').style.display = 'block';
            document.getElementById('schema-proteus-label').style.display = 'none';
            document.getElementById('schema-proteus-actions').style.display = 'flex';
            saveProjectToFolder(db[currentIdx]);
        };
        reader.readAsDataURL(file);
    }
}

function deleteImage(type) {
    customConfirm('Supprimer cette image ?', 'Suppression').then(result => {
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
        
        saveProjectToFolder(db[currentIdx]);
    });
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
// INITIALISATION AU CHARGEMENT
// ========================================

window.onload = async () => {
    let ip = localStorage.getItem('lab_ip');
    if(ip) document.getElementById('home-status').innerText = "IP: " + ip;
    
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
