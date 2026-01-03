let db = JSON.parse(localStorage.getItem('lab_pro_db')) || [];
let currentIdx = null;
let githubConfig = JSON.parse(localStorage.getItem('github_config')) || null;
let autoSyncEnabled = localStorage.getItem('github_autosync') === 'true';

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
                description: 'LED standard rouge, la plus courante dans les projets Arduino. Tension de seuil typique de 2V.',
                usage: 'Utilisée comme indicateur d\'état, alarme visuelle, décoration. Toujours utiliser avec une résistance de limitation de courant (220-330Ω pour Arduino 5V).',
                pinout: 'Anode (+) : patte longue\nCathode (-) : patte courte, côté plat',
                formula: 'Résistance = (Vcc - Vled) / I\nExemple: R = (5V - 2V) / 0.02A = 150Ω (utiliser 220Ω standard)'
            },
            {
                id: 'led-rgb',
                name: 'LED RGB commune cathode',
                voltage: '2-3.5V (selon couleur)',
                current: '20 mA par canal',
                description: 'LED tricolore permettant de créer toutes les couleurs en mélangeant rouge, vert et bleu.',
                usage: 'Éclairage RGB, indicateurs multicolores, ambiance lumineuse. Nécessite 3 résistances (une par couleur) et 4 fils.',
                pinout: 'Cathode commune (GND) : 2e patte (la plus longue)\nRouge : 1ère patte\nVert : 3e patte\nBleu : 4e patte',
                formula: 'R(rouge) = (Vcc - 2V) / 0.02A\nR(vert) = (Vcc - 3.2V) / 0.02A\nR(bleu) = (Vcc - 3.2V) / 0.02A'
            }
        ]
    },
    {
        id: 'resistor',
        name: 'Résistances',
        icon: '⚡',
        description: 'Composants passifs limitant le courant',
        components: [
            {
                id: 'resistor-220',
                name: 'Résistance 220Ω',
                tolerance: '±5%',
                power: '0.25W',
                colorCode: 'Rouge-Rouge-Marron-Or',
                description: 'Résistance très courante, idéale pour limiter le courant des LED avec Arduino (5V).',
                usage: 'Protection LED, pull-up/pull-down, diviseur de tension.',
                formula: 'I = V / R = 5V / 220Ω = 22.7 mA\nP = V² / R = 25 / 220 = 0.114W (OK pour 0.25W)'
            },
            {
                id: 'resistor-10k',
                name: 'Résistance 10kΩ',
                tolerance: '±5%',
                power: '0.25W',
                colorCode: 'Marron-Noir-Orange-Or',
                description: 'Résistance de pull-up/pull-down standard pour boutons et switches.',
                usage: 'Pull-up/pull-down pour boutons, diviseur de tension, protection d\'entrées.',
                formula: 'I (pull-up à 5V) = V / R = 5V / 10kΩ = 0.5 mA'
            }
        ]
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
                description: 'Condensateur de découplage/filtrage très utilisé en électronique numérique.',
                usage: 'Filtrage alimentation, découplage IC, anti-rebond bouton. Placer au plus près des broches VCC/GND des circuits intégrés.',
                formula: 'Fréquence de coupure (avec R=1kΩ): fc = 1/(2πRC) = 1/(2π × 1000 × 100e-9) = 1.59 kHz'
            },
            {
                id: 'cap-1000u',
                name: 'Condensateur électrolytique 1000µF',
                voltage: '16V ou 25V',
                type: 'Électrolytique (polarisé)',
                description: 'Grand condensateur pour filtrage et réservoir d\'énergie. ATTENTION : polarisé !',
                usage: 'Filtrage alimentation, réservoir d\'énergie, lissage tension. Respecter la polarité : + vers VCC, - vers GND.',
                pinout: 'Patte longue : + (positif)\nPatte courte : - (négatif, souvent marqué par une bande)',
                formula: 'Énergie stockée: E = 0.5 × C × V² = 0.5 × 0.001 × 16² = 0.128 J'
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
                description: 'Capteur numérique de température et humidité, très populaire et bon marché.',
                usage: 'Station météo, monitoring environnemental, régulation climatique. Nécessite la bibliothèque DHT.',
                pinout: 'VCC : 3.3V ou 5V\nDATA : broche numérique (avec pull-up 10kΩ)\nGND : masse',
                code: '#include <DHT.h>\nDHT dht(PIN, DHT11);\nvoid setup() { dht.begin(); }\nfloat t = dht.readTemperature();\nfloat h = dht.readHumidity();'
            },
            {
                id: 'hcsr04',
                name: 'HC-SR04 Ultrason',
                voltage: '5V',
                range: '2-400 cm',
                accuracy: '±3mm',
                description: 'Capteur de distance à ultrasons très précis et abordable.',
                usage: 'Mesure de distance, détection d\'obstacles, robot autonome, stationnement.',
                pinout: 'VCC : 5V\nTrig : broche numérique (envoi impulsion)\nEcho : broche numérique (réception)\nGND : masse',
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
                description: 'Petit servomoteur très populaire, précis et abordable pour les projets Arduino.',
                usage: 'Robotique, bras articulé, volet motorisé, direction RC. Signal PWM 50Hz (20ms), impulsions 1-2ms.',
                pinout: 'Marron/Noir : GND\nRouge : VCC (5V externe recommandé)\nOrange/Jaune : Signal PWM',
                code: '#include <Servo.h>\nServo servo;\nvoid setup() { servo.attach(9); }\nservo.write(90); // Position 90°'
            },
            {
                id: 'relay-5v',
                name: 'Relais 5V 10A',
                voltage: '5V (bobine)',
                current: '10A max (contact)',
                description: 'Relais électromécanique permettant de contrôler des charges AC/DC puissantes.',
                usage: 'Domotique, contrôle de lampes 220V, moteurs puissants, électrovannes. DANGER : 220V !',
                pinout: 'VCC : 5V\nGND : masse\nIN : signal de commande (LOW = activé)\nCOM, NO, NC : contacts de puissance',
                warning: '⚠️ ATTENTION : Manipuler avec précaution, risque électrique 220V AC !'
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
                description: 'Registre à décalage permettant d\'étendre les sorties numériques avec seulement 3 broches.',
                usage: 'Multiplexage LED, afficheurs 7 segments, expansion GPIO. Cascadable.',
                pinout: 'DS (14) : données série\nSHCP (11) : horloge shift\nSTCP (12) : horloge stockage (latch)\nQ0-Q7 : sorties parallèles',
                code: 'shiftOut(dataPin, clockPin, MSBFIRST, value);\ndigitalWrite(latchPin, HIGH);'
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
        return (el && el.value !== "") ? parseFloat(el.value) : null;
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
    list.innerHTML = componentCategories.map(cat => `
        <div class="folder-item" onclick="showComponentList('${cat.id}')" style="border-left: 5px solid var(--accent);">
            <div class="folder-thumb" style="font-size:28px;">${cat.icon}</div>
            <div style="flex:1">
                <b>${cat.name}</b><br>
                <span style="font-size:11px; opacity:0.6;">${cat.description}</span>
            </div>
            <span style="font-size:18px;">→</span>
        </div>
    `).join('');
}

function showComponentList(categoryId) {
    const category = componentCategories.find(c => c.id === categoryId);
    if (!category) return;
    
    document.getElementById('component-list-title').innerText = category.name;
    document.getElementById('component-list-content').innerHTML = category.components.map(comp => `
        <div class="folder-item" onclick="showComponentDetail('${categoryId}', '${comp.id}')" style="border-left: 5px solid var(--primary);">
            <div class="folder-thumb" style="font-size:24px;">${category.icon}</div>
            <div style="flex:1">
                <b>${comp.name}</b><br>
                <span style="font-size:11px; opacity:0.6;">${comp.voltage || comp.type || ''}</span>
            </div>
            <span style="font-size:18px;">→</span>
        </div>
    `).join('');
    
    openModal('modal-component-list');
}

function showComponentDetail(categoryId, componentId) {
    const category = componentCategories.find(c => c.id === categoryId);
    if (!category) return;
    const component = category.components.find(c => c.id === componentId);
    if (!component) return;
    
    closeModal('modal-component-list');
    
    document.getElementById('component-detail-title').innerText = component.name;
    let detailHTML = `
        <div style="text-align:center; font-size:48px; margin:20px 0;">${category.icon}</div>
        
        <div class="card">
            <h3 style="color:var(--accent); margin-top:0;">📋 Description</h3>
            <p>${component.description}</p>
        </div>

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
    
    if (component.pinout) {
        detailHTML += `
        <div class="card">
            <h3 style="color:var(--accent); margin-top:0;">📌 Brochage</h3>
            <pre style="background:#0f172a; padding:15px; border-radius:8px; font-size:12px; line-height:1.6; white-space:pre-wrap;">${component.pinout}</pre>
        </div>`;
    }
    
    if (component.formula) {
        detailHTML += `
        <div class="card">
            <h3 style="color:var(--accent); margin-top:0;">🧮 Formules</h3>
            <pre style="background:#0f172a; padding:15px; border-radius:8px; font-size:12px; line-height:1.6; white-space:pre-wrap;">${component.formula}</pre>
        </div>`;
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
    
    // Mettre à jour le compteur
    if (countEl) {
        countEl.innerText = db.length + ' projet' + (db.length > 1 ? 's' : '');
    }
    
    if (db.length === 0) {
        list.innerHTML = `
            <div class="card" style="text-align:center; padding:40px 20px;">
                <div style="font-size:48px; margin-bottom:20px;">📂</div>
                <h3 style="color:var(--accent);">Aucun projet pour le moment</h3>
                <p style="color:#94a3b8; margin:20px 0;">Créez votre premier projet ou restaurez une sauvegarde</p>
                <button class="btn" style="background:var(--primary); max-width:300px; margin:10px auto;" onclick="newFolder()">+ CRÉER UN PROJET</button>
                <button class="btn" style="background:var(--success); max-width:300px; margin:10px auto;" onclick="document.getElementById('import-file').click()">📥 RESTAURER UNE SAUVEGARDE</button>
            </div>
        `;
        return;
    }
    
    list.innerHTML = db.map((f, i) => `
        <div class="folder-item" onclick="openFolder(${i})">
            <div class="folder-thumb">${f.img ? `<img src="${f.img}" style="width:100%;height:100%;border-radius:10px;object-fit:cover">` : '📂'}</div>
            <div style="flex:1"><b>${f.name}</b><br><span style="font-size:10px; opacity:0.6;">${f.status}</span></div>
        </div>`).join('');
}

function openFolder(i) {
    currentIdx = i; const f = db[i];
    document.getElementById('edit-title').innerText = f.name;
    document.getElementById('edit-notes').value = f.notes || "";
    document.getElementById('edit-code').value = f.code || "";
    if(f.img) {
        document.getElementById('proj-img-preview').src = f.img;
        document.getElementById('proj-img-preview').style.display = 'block';
    } else {
        document.getElementById('proj-img-preview').style.display = 'none';
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
                <b style="font-size:13px;">${comp.name}</b><br>
                <span style="font-size:10px; opacity:0.6;">${comp.category}</span>
            </div>
            <button onclick="removeProjectComponent(${idx}); event.stopPropagation();" style="background:var(--danger); color:white; border:none; padding:5px 10px; border-radius:5px; font-size:11px;">✕</button>
        </div>
    `).join('');
}

function openComponentPicker() {
    const content = document.getElementById('component-picker-content');
    content.innerHTML = componentCategories.map(cat => `
        <div style="margin-bottom:20px;">
            <h4 style="color:var(--accent); margin-bottom:10px;">${cat.icon} ${cat.name}</h4>
            ${cat.components.map(comp => `
                <div class="folder-item" onclick="addComponentToProject('${cat.id}', '${comp.id}')" style="border-left:3px solid var(--primary); margin-bottom:8px; cursor:pointer;">
                    <div class="folder-thumb" style="width:40px; height:40px; font-size:20px;">${cat.icon}</div>
                    <div style="flex:1">
                        <b style="font-size:13px;">${comp.name}</b><br>
                        <span style="font-size:10px; opacity:0.6;">${comp.voltage || comp.type || ''}</span>
                    </div>
                    <span style="font-size:16px;">+</span>
                </div>
            `).join('')}
        </div>
    `).join('');
    
    openModal('modal-component-picker');
}

function addComponentToProject(catId, compId) {
    const category = componentCategories.find(c => c.id === catId);
    if (!category) return;
    const component = category.components.find(c => c.id === compId);
    if (!component) return;
    
    const f = db[currentIdx];
    if (!f.components) f.components = [];
    
    // Vérifier si le composant n'est pas déjà ajouté
    if (f.components.find(c => c.id === compId)) {
        alert('Ce composant est déjà dans votre projet !');
        return;
    }
    
    f.components.push({
        id: compId,
        categoryId: catId,
        name: component.name,
        category: category.name,
        icon: category.icon,
        data: component
    });
    
    save();
    renderProjectComponents();
    closeModal('modal-component-picker');
    alert('Composant ajouté ! 💡');
}

function removeProjectComponent(idx) {
    const f = db[currentIdx];
    if (confirm('Retirer ce composant du projet ?')) {
        f.components.splice(idx, 1);
        save();
        renderProjectComponents();
    }
}

function viewProjectComponent(idx) {
    const f = db[currentIdx];
    const comp = f.components[idx];
    showComponentDetail(comp.categoryId, comp.id);
}

function newFolder() {
    let n = prompt("Nom du projet ?");
    if(n) { 
        db.push({name:n, status:'En cours', notes:'', code:'', img:'', components:[]}); 
        save(); 
        renderFolders();
        
        // Synchronisation automatique GitHub si activée
        if (autoSyncEnabled && githubConfig) {
            setTimeout(() => syncWithGitHub(), 500);
        }
    }
}

function saveProject() {
    db[currentIdx].notes = document.getElementById('edit-notes').value;
    db[currentIdx].code = document.getElementById('edit-code').value;
    save(); 
    renderFolders(); 
    closeModal('modal-project');
    
    // Synchronisation automatique GitHub si activée
    if (autoSyncEnabled && githubConfig) {
        setTimeout(() => syncWithGitHub(), 500);
    }
    
    // Rappel de sauvegarde tous les 3 projets
    if (db.length > 0 && db.length % 3 === 0) {
        const lastBackup = localStorage.getItem('lab_last_backup');
        const now = Date.now();
        const dayInMs = 24 * 60 * 60 * 1000;
        
        if (!lastBackup || (now - parseInt(lastBackup)) > dayInMs) {
            setTimeout(() => {
                if (confirm('💾 Vous avez ' + db.length + ' projets !\n\nSouhaitez-vous les sauvegarder maintenant ?')) {
                    localStorage.setItem('lab_last_backup', now.toString());
                    exportProjects();
                } else {
                    localStorage.setItem('lab_last_backup', now.toString());
                }
            }, 500);
        }
    }
}

function deleteFolder() {
    if(confirm('Supprimer ce projet ?')) {
        db.splice(currentIdx, 1);
        save(); renderFolders(); closeModal('modal-project');
        
        // Synchronisation automatique GitHub si activée
        if (autoSyncEnabled && githubConfig) {
            setTimeout(() => syncWithGitHub(), 500);
        }
    }
}

function previewFile() {
    const file = document.getElementById('img-upload').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            db[currentIdx].img = e.target.result;
            document.getElementById('proj-img-preview').src = e.target.result;
            document.getElementById('proj-img-preview').style.display = 'block';
            save();
        };
        reader.readAsDataURL(file);
    }
}

// --- WIFI & ESP32 ---
function saveWifi() {
    localStorage.setItem('lab_ip', document.getElementById('ip-input').value);
    document.getElementById('home-status').innerText = "IP: " + document.getElementById('ip-input').value;
    closeModal('modal-wifi');
}

function sendCmd(cmd) {
    let ip = localStorage.getItem('lab_ip');
    if(!ip) return alert("Configurez l'IP dans les options !");
    fetch(`http://${ip}/${cmd}`)
    .then(r => r.text())
    .then(t => alert("Réponse: " + t))
    .catch(() => alert("Erreur de connexion"));
}

function envoyerCode() {
    let mode = document.querySelector('input[name="code-mode"]:checked').value;
    if (mode !== 'wifi') return alert('Sélectionnez le mode WiFi pour exécuter.');
    let ip = localStorage.getItem('lab_ip');
    if(!ip) return alert("Réglez l'IP !");
    let code = document.getElementById('edit-code').value;
    fetch(`http://${ip}/execute`, { method: 'POST', body: code, mode: 'no-cors' })
    .then(() => alert("Commandes exécutées via WiFi !"))
    .catch(() => alert("Erreur : ESP32 injoignable"));
}

function save() { localStorage.setItem('lab_pro_db', JSON.stringify(db)); }
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
    alert('Code copié dans le presse-papiers ! Collez-le dans l\'IDE Arduino.');
}

// --- EXPORT/IMPORT DES PROJETS ---
function exportProjects() {
    if (db.length === 0) {
        alert('Aucun projet à exporter !');
        return;
    }
    
    const data = {
        version: '1.0',
        date: new Date().toISOString(),
        projects: db,
        ip: localStorage.getItem('lab_ip')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mes-projets-arduino-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    closeModal('modal-settings-menu');
    alert(`✅ ${db.length} projet(s) sauvegardé(s) !\n\n` +
          `📁 Fichier téléchargé avec succès.\n\n` +
          `💡 Conseil : Conservez ce fichier dans un endroit sûr\n` +
          `(Google Drive, Dropbox, clé USB...)`);
}

function importProjects(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            if (!data.projects || !Array.isArray(data.projects)) {
                alert('❌ Fichier invalide !');
                return;
            }
            
            const confirmMsg = `Voulez-vous restaurer ${data.projects.length} projet(s) ?\n\n` +
                `Date de sauvegarde: ${data.date ? new Date(data.date).toLocaleString('fr-FR') : 'Inconnue'}\n\n` +
                `⚠️ Cela remplacera tous vos projets actuels (${db.length} projet(s)).`;
            
            if (confirm(confirmMsg)) {
                db = data.projects;
                
                // Restaurer aussi l'IP si présente
                if (data.ip) {
                    localStorage.setItem('lab_ip', data.ip);
                }
                
                save();
                renderFolders();
                closeModal('modal-settings-menu');
                alert(`✅ ${db.length} projet(s) restauré(s) avec succès !`);
            }
        } catch (error) {
            console.error('Erreur import:', error);
            alert('❌ Erreur lors de l\'import du fichier !\n\nVérifiez que le fichier est correct.');
        }
    };
    reader.readAsText(file);
    
    // Reset input pour permettre de réimporter le même fichier
    event.target.value = '';
}

// ========================================
// GITHUB SYNCHRONIZATION
// ========================================

function saveGitHubConfig() {
    const token = document.getElementById('github-token').value.trim();
    const username = document.getElementById('github-username').value.trim();
    const repo = document.getElementById('github-repo').value.trim();
    
    if (!token || !username || !repo) {
        alert('⚠️ Veuillez remplir tous les champs GitHub (token, username, repo)');
        return;
    }
    
    githubConfig = { token, username, repo };
    localStorage.setItem('github_config', JSON.stringify(githubConfig));
    
    updateGitHubStatus('🟢 Configuré - Prêt à synchroniser');
    alert('✅ Configuration GitHub enregistrée !\n\nVous pouvez maintenant synchroniser vos projets.');
}

function toggleAutoSync(enabled) {
    autoSyncEnabled = enabled;
    localStorage.setItem('github_autosync', enabled ? 'true' : 'false');
    
    if (enabled && !githubConfig) {
        alert('⚠️ Veuillez d\'abord configurer GitHub avant d\'activer la synchronisation automatique.');
        document.getElementById('auto-sync').checked = false;
        autoSyncEnabled = false;
        localStorage.setItem('github_autosync', 'false');
    } else if (enabled) {
        alert('✅ Synchronisation automatique activée !\n\nVos projets seront synchronisés après chaque modification.');
    }
}

function updateGitHubStatus(message, color = '#94a3b8') {
    const statusEl = document.getElementById('github-status');
    if (statusEl) {
        statusEl.innerHTML = message;
        statusEl.style.color = color;
    }
    
    // Mettre à jour l'indicateur dans la barre de projets
    const indicator = document.getElementById('github-sync-indicator');
    if (indicator) {
        if (!githubConfig) {
            indicator.textContent = '⚫';
            indicator.title = 'GitHub non configuré - Cliquez pour configurer';
        } else if (message.includes('🔄')) {
            indicator.textContent = '🔄';
            indicator.title = 'Synchronisation en cours...';
        } else if (message.includes('🟢')) {
            indicator.textContent = '🟢';
            indicator.title = 'Synchronisé avec GitHub - ' + (autoSyncEnabled ? 'Auto-sync activé' : 'Auto-sync désactivé');
        } else if (message.includes('🔴')) {
            indicator.textContent = '🔴';
            indicator.title = 'Erreur de synchronisation - Cliquez pour voir les détails';
        }
    }
}

async function syncWithGitHub() {
    if (!githubConfig) {
        alert('⚠️ Veuillez d\'abord configurer GitHub dans les paramètres.');
        return;
    }
    
    const { token, username, repo } = githubConfig;
    const fileName = 'projects.json';
    const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${fileName}`;
    
    try {
        updateGitHubStatus('🔄 Synchronisation en cours...', '#fbbf24');
        
        // 1. Récupérer le fichier existant sur GitHub (s'il existe)
        let remoteSha = null;
        let remoteData = null;
        
        try {
            const getResponse = await fetch(apiUrl, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (getResponse.ok) {
                const fileData = await getResponse.json();
                remoteSha = fileData.sha;
                const content = atob(fileData.content);
                remoteData = JSON.parse(content);
            }
        } catch (err) {
            // Fichier n'existe pas encore, c'est OK
            console.log('Aucun fichier distant trouvé, création d\'un nouveau fichier');
        }
        
        // 2. Fusionner les données locales et distantes
        let mergedData = mergeProjects(remoteData, {
            projects: db,
            settings: {
                wifi_ip: localStorage.getItem('lab_ip') || ''
            },
            timestamp: new Date().toISOString()
        });
        
        // 3. Uploader vers GitHub
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(mergedData, null, 2))));
        
        const putResponse = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Sync projects - ${new Date().toLocaleString('fr-FR')}`,
                content: content,
                sha: remoteSha || undefined
            })
        });
        
        if (!putResponse.ok) {
            const error = await putResponse.json();
            throw new Error(error.message || 'Erreur lors de la synchronisation');
        }
        
        // 4. Mettre à jour les données locales avec les données fusionnées
        db = mergedData.projects;
        localStorage.setItem('lab_pro_db', JSON.stringify(db));
        if (mergedData.settings.wifi_ip) {
            localStorage.setItem('lab_ip', mergedData.settings.wifi_ip);
        }
        
        renderFolders();
        updateGitHubStatus('🟢 Synchronisé - ' + new Date().toLocaleTimeString('fr-FR'), '#22c55e');
        
        alert('✅ Synchronisation réussie !\n\n' +
              `📁 ${mergedData.projects.length} projet(s) synchronisé(s)\n` +
              `🕒 ${new Date().toLocaleString('fr-FR')}`);
        
    } catch (error) {
        console.error('Erreur de synchronisation:', error);
        updateGitHubStatus('🔴 Erreur de synchronisation', '#ef4444');
        alert('❌ Erreur de synchronisation GitHub :\n\n' + error.message + '\n\n' +
              'Vérifiez :\n' +
              '• Votre token GitHub\n' +
              '• Le nom d\'utilisateur et du dépôt\n' +
              '• Que le dépôt existe\n' +
              '• Que le token a les permissions "repo"');
    }
}

function mergeProjects(remote, local) {
    // Si pas de données distantes, utiliser les locales
    if (!remote || !remote.projects) {
        return local;
    }
    
    // Si pas de données locales, utiliser les distantes
    if (!local || !local.projects || local.projects.length === 0) {
        return remote;
    }
    
    // Fusionner : garder les projets les plus récents et ajouter les nouveaux
    const merged = { ...local };
    const localMap = new Map(local.projects.map(p => [p.title, p]));
    
    for (const remoteProject of remote.projects) {
        const localProject = localMap.get(remoteProject.title);
        
        if (!localProject) {
            // Projet existe seulement sur GitHub, l'ajouter
            merged.projects.push(remoteProject);
        }
        // Si le projet existe des deux côtés, garder la version locale (last-write-wins)
    }
    
    // Mettre à jour le timestamp
    merged.timestamp = new Date().toISOString();
    
    return merged;
}

window.onload = () => {
    let ip = localStorage.getItem('lab_ip');
    if(ip) document.getElementById('home-status').innerText = "IP: " + ip;
    renderFolders();
    
    // Charger la configuration GitHub
    if (githubConfig) {
        document.getElementById('github-token').value = githubConfig.token;
        document.getElementById('github-username').value = githubConfig.username;
        document.getElementById('github-repo').value = githubConfig.repo;
        updateGitHubStatus('🟢 Configuré - Prêt à synchroniser', '#22c55e');
    } else {
        updateGitHubStatus('⚫ Non configuré');
    }
    
    if (autoSyncEnabled) {
        document.getElementById('auto-sync').checked = true;
    }
    
    // Message de bienvenue au premier lancement
    const firstVisit = !localStorage.getItem('lab_visited');
    if (firstVisit) {
        localStorage.setItem('lab_visited', 'true');
        setTimeout(() => {
            alert('👋 Bienvenue sur ESP32 Lab Pro !\n\n' +
                  '💡 Vos projets sont sauvegardés localement dans votre navigateur.\n\n' +
                  '💾 Pensez à exporter régulièrement vos projets\n' +
                  '(Menu ⚙️ → Sauvegarder les projets)\n\n' +
                  'Bon travail ! 🚀');
        }, 1000);
    }
};
