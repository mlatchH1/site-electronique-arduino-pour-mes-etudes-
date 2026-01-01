// --- GESTION DES ONGLETS ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active-nav'));
    
    document.getElementById(tabId).classList.add('active');
    document.getElementById('nav-' + tabId.split('-')[1]).classList.add('active-nav');
}

// --- CONFIGURATION ---
function toggleConfig() {
    const p = document.getElementById("configPanel");
    p.style.display = (p.style.display === "block") ? "none" : "block";
}

function getBaseUrl() {
    let ip = document.getElementById("ipInput").value;
    if (!ip) {
        alert("⚠️ Règle l'IP dans les paramètres !");
        toggleConfig();
        return null;
    }
    return ip.startsWith("http") ? ip : "http://" + ip;
}

// --- ACTIONS ---
function envoyerSignal(etat) {
    const url = getBaseUrl();
    if (!url) return;
    fetch(`${url}/led?status=${etat}`).catch(err => console.log("ESP hors ligne"));
}

function envoyerMessage() {
    const url = getBaseUrl();
    if (!url) return;
    let msg = document.getElementById("monTexte").value;
    fetch(`${url}/msg?valeur=${encodeURIComponent(msg)}`)
        .then(() => alert("Envoyé !"))
        .catch(err => alert("Erreur connexion"));
}

// --- MÉMOIRE ---
window.onload = () => {
    const savedIP = localStorage.getItem("esp32_ip");
    if (savedIP) document.getElementById("ipInput").value = savedIP;
};

document.getElementById("ipInput").oninput = (e) => {
    localStorage.setItem("esp32_ip", e.target.value);
};
