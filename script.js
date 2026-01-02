let db = JSON.parse(localStorage.getItem('lab_pro_db')) || [];
let currentIdx = null;

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

// --- MOTEUR DE CALCUL MULTIDIRECTIONNEL ---
function runMath(id) {
    const val = (k) => {
        let el = document.getElementById('m-' + id + '-' + k);
        return (el && el.value !== "") ? parseFloat(el.value) : null;
    };
    
    let res = document.getElementById('res-' + id);
    let v = {}; // Objet local pour les valeurs

    // Exemple de logique multidirectionnelle (Calcul n'importe quelle inconnue)
    if(id === 'ohm') {
        v = { u: val('u'), r: val('r'), i: val('i') };
        if(v.r && v.i) res.innerText = (v.r * v.i).toFixed(3) + " V";
        else if(v.u && v.i) res.innerText = (v.u / v.i).toFixed(3) + " Ω";
        else if(v.u && v.r) res.innerText = (v.u / v.r).toFixed(3) + " A";
        else res.innerText = "---";
    }
    else if(id === 'pwr') {
        v = { p: val('p'), u: val('u'), i: val('i') };
        if(v.u && v.i) res.innerText = (v.u * v.i).toFixed(3) + " W";
        else if(v.p && v.u) res.innerText = (v.p / v.u).toFixed(3) + " A";
        else if(v.p && v.i) res.innerText = (v.p / v.i).toFixed(3) + " V";
        else res.innerText = "---";
    }
    else if(id === 'joule') {
        v = { p: val('p'), r: val('r'), i: val('i') };
        if(v.r && v.i) res.innerText = (v.r * v.i * v.i).toFixed(3) + " W";
        else res.innerText = "---";
    }
    else if(id === 'adc') {
        v = { v: val('v'), x: val('x') };
        if(v.x !== null) res.innerText = ((v.x / 4095) * 3.3).toFixed(3) + " V";
        else if(v.v !== null) res.innerText = Math.round((v.v / 3.3) * 4095);
        else res.innerText = "---";
    }
    else if(id === 'div') {
        v = { vs: val('vs'), ve: val('ve'), r1: val('r1'), r2: val('r2') };
        if(v.ve && v.r1 && v.r2) res.innerText = (v.ve * v.r2 / (v.r1 + v.r2)).toFixed(3) + " V";
        else res.innerText = "---";
    }
    else if(id === 'led') {
        v = { r:val('r'), vcc:val('vcc'), vl:val('vl'), i:val('i') };
        if(v.vcc && v.vl && v.i) res.innerText = ((v.vcc - v.vl) / v.i).toFixed(1) + " Ω";
        else res.innerText = "---";
    }
    else if(id === 'pwm') {
        v = { v: val('v'), vc: val('vc'), d: val('d') };
        if(v.vc && v.d !== null) res.innerText = (v.vc * v.d / 100).toFixed(3) + " V";
        else res.innerText = "---";
    }
    else if(id === 'bat') {
        v = { h: val('h'), ca: val('ca'), co: val('co') };
        if(v.ca && v.co) res.innerText = (v.ca / v.co).toFixed(1) + " h";
        else res.innerText = "---";
    }
    else if(id === 'baud') {
        v = { t: val('t'), b: val('b'), bd: val('bd') };
        if(v.b && v.bd) res.innerText = (v.b / v.bd).toFixed(3) + " s";
        else res.innerText = "---";
    }
    else if(id === 'servo') {
        v = { angle: val('angle'), pulse: val('pulse') };
        if(v.pulse !== null) res.innerText = ((v.pulse - 1000) / 10).toFixed(1) + " °";
        else if(v.angle !== null) res.innerText = (1000 + v.angle * 10) + " µs";
        else res.innerText = "---";
    }
    else if(id === 'buzzer') {
        v = { f: val('f'), t: val('t') };
        if(v.t) res.innerText = (1 / v.t).toFixed(1) + " Hz";
        else if(v.f) res.innerText = (1 / v.f).toFixed(6) + " s";
        else res.innerText = "---";
    }
    else if(id === 'motor') {
        v = { rpm: val('rpm'), v: val('v'), vmax: val('vmax'), rpmmax: val('rpmmax') };
        if(v.v && v.vmax && v.rpmmax) res.innerText = ((v.v / v.vmax) * v.rpmmax).toFixed(0) + " RPM";
        else res.innerText = "---";
    }
    else if(id === 'button') {
        v = { r: val('r'), vcc: val('vcc'), i: val('i') };
        if(v.vcc && v.i) res.innerText = (v.vcc / v.i).toFixed(1) + " Ω";
        else res.innerText = "---";
    }
    else if(id === 'ant') {
        v = { l: val('l'), f: val('f') };
        if(v.f) res.innerText = (75 / v.f).toFixed(3) + " m";
        else if(v.l) res.innerText = (75 / v.l).toFixed(2) + " MHz";
        else res.innerText = "---";
    }
    else if(id === 'dbm') {
        v = { p: val('p'), d: val('d') };
        if(v.d !== null) res.innerText = (Math.pow(10, v.d / 10)).toFixed(3) + " mW";
        else if(v.p) res.innerText = (10 * Math.log10(v.p)).toFixed(1) + " dBm";
        else res.innerText = "---";
    }
    else if(id === 'wav') {
        v = { l: val('l'), f: val('f') };
        if(v.f) res.innerText = (300 / v.f).toFixed(3) + " m";
        else if(v.l) res.innerText = (300 / v.l).toFixed(2) + " MHz";
        else res.innerText = "---";
    }
    else if(id === 'fspl') {
        v = { p: val('p'), d: val('d'), f: val('f') };
        if(v.d && v.f) res.innerText = (20 * Math.log10(v.d) + 20 * Math.log10(v.f) + 32.4).toFixed(1) + " dB";
        else res.innerText = "---";
    }
    else if(id === 'rc') {
        v = { f:val('f'), r:val('r'), c:val('c') };
        if(v.r && v.c) res.innerText = (1 / (2 * Math.PI * v.r * v.c)).toFixed(2) + " Hz";
        else res.innerText = "---";
    }
    else if(id === 'db_v') {
        v = { g: val('g'), v1: val('v1'), v2: val('v2') };
        if(v.v1 && v.v2) res.innerText = (20 * Math.log10(v.v2 / v.v1)).toFixed(1) + " dB";
        else res.innerText = "---";
    }
    else if(id === 'db_p') {
        v = { g: val('g'), p1: val('p1'), p2: val('p2') };
        if(v.p1 && v.p2) res.innerText = (10 * Math.log10(v.p2 / v.p1)).toFixed(1) + " dB";
        else res.innerText = "---";
    }
    else if(id === 'sampling') {
        v = { fs: val('fs'), fm: val('fm') };
        if(v.fm) res.innerText = (2 * v.fm) + " Hz";
        else res.innerText = "---";
    }    else if(id === 'tau_rc') {
        v = { t: val('t'), r: val('r'), c: val('c') };
        if(v.r && v.c) res.innerText = (v.r * v.c).toFixed(6) + " s";
        else res.innerText = "---";
    }    else if(id === 'temp') {
        v = { tj: val('tj'), ta: val('ta'), p: val('p'), rt: val('rt') };
        if(v.ta && v.p && v.rt) res.innerText = (v.ta + v.p * v.rt).toFixed(1) + " °C";
        else res.innerText = "---";
    }
    else if(id === 'torque') {
        v = { c: val('c'), p: val('p'), w: val('w') };
        if(v.p && v.w) res.innerText = (v.p / v.w).toFixed(3) + " Nm";
        else res.innerText = "---";
    }
    else if(id === 'r_wire') {
        const rho = { cu: 1.68e-8, al: 2.65e-8, fe: 9.71e-8, ag: 1.59e-8, au: 2.44e-8 };
        v = { r: val('r'), l: val('l'), s: val('s'), mat: document.getElementById('m-' + id + '-mat').value };
        if(v.l && v.s && v.mat) res.innerText = (rho[v.mat] * v.l / v.s).toFixed(6) + " Ω";
        else res.innerText = "---";
    }
    else if(id === 'l_par') {
        v = { lp: val('lp'), l1: val('l1'), l2: val('l2') };
        if(v.l1 && v.l2) res.innerText = (1 / (1/v.l1 + 1/v.l2)).toFixed(6) + " H";
        else res.innerText = "---";
    }
    else if(id === 'l_ser') {
        v = { ls: val('ls'), l1: val('l1'), l2: val('l2') };
        if(v.l1 && v.l2) res.innerText = (v.l1 + v.l2).toFixed(6) + " H";
        else res.innerText = "---";
    }
    else if(id === 'res_lc') {
        v = { f: val('f'), l: val('l'), c: val('c') };
        if(v.l && v.c) res.innerText = (1 / (2 * Math.PI * Math.sqrt(v.l * v.c))).toFixed(1) + " Hz";
        else res.innerText = "---";
    }
    else {
        res.innerText = "---";
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
}

function renderTools() {
    const list = document.getElementById('formula-list');
    list.innerHTML = "";
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
    document.getElementById('folder-list').innerHTML = db.map((f, i) => `
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
    document.getElementById('modal-project').style.display = 'flex';
}

function newFolder() {
    let n = prompt("Nom du projet ?");
    if(n) { db.push({name:n, status:'En cours', notes:'', code:'', img:''}); save(); renderFolders(); }
}

function saveProject() {
    db[currentIdx].notes = document.getElementById('edit-notes').value;
    db[currentIdx].code = document.getElementById('edit-code').value;
    save(); renderFolders(); closeModal('modal-project');
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

function copyCode() {
    navigator.clipboard.writeText(document.getElementById('edit-code').value);
    alert('Code copié dans le presse-papiers ! Collez-le dans l\'IDE Arduino.');
}

window.onload = () => {
    let ip = localStorage.getItem('lab_ip');
    if(ip) document.getElementById('home-status').innerText = "IP: " + ip;
    renderFolders();
};
