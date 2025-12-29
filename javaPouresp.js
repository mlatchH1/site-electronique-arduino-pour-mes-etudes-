let projects = JSON.parse(localStorage.getItem('myProjects')) || [];

// --- NAVIGATION ---
function showModal() { document.getElementById('projectModal').style.display = 'block'; }
function hideModal() { document.getElementById('projectModal').style.display = 'none'; }
function toggleConfig() {
    const p = document.getElementById('configPanel');
    p.style.display = (p.style.display === 'block') ? 'none' : 'block';
}

function showHome() {
    document.getElementById('home-view')