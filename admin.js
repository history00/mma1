// admin.js — ПОЛНАЯ ВЕРСИЯ

let sb;
let currentPin = '';
const CORRECT_PIN = '12341';

function enterPin(num) {
    if (currentPin.length < 5) {
        currentPin += num;
        updatePinDots();
    }
    if (currentPin.length === 5) {
        setTimeout(submitPin, 200);
    }
}

function clearPin() {
    currentPin = currentPin.slice(0, -1);
    updatePinDots();
}

function updatePinDots() {
    const dots = document.querySelectorAll('#pin-dots span');
    dots.forEach((dot, i) => {
        dot.style.background = i < currentPin.length ? '#d4af37' : '#333';
    });
}

function submitPin() {
    if (currentPin === CORRECT_PIN) {
        document.getElementById('pin-screen').classList.remove('active');
        document.getElementById('admin-panel').classList.add('active');
        loadAllData();
    } else {
        const dots = document.querySelectorAll('#pin-dots span');
        dots.forEach(dot => dot.style.background = '#ff6b6b');
        setTimeout(() => {
            currentPin = '';
            updatePinDots();
        }, 600);
    }
}

async function loadAllData() {
    await loadTextbookMaterialsAdmin();
    await loadAllResults();
}

async function addTextbookMaterial() {
    const title = document.getElementById('new-material-title').value.trim();
    const url = document.getElementById('new-material-url').value.trim();

    if (!title || !url) return alert('Заполните все поля');

    await sb.from('textbook_links').insert({ title, url });
    document.getElementById('new-material-title').value = '';
    document.getElementById('new-material-url').value = '';
    loadTextbookMaterialsAdmin();
}

async function loadTextbookMaterialsAdmin() {
    const list = document.getElementById('textbook-materials-list');
    const { data } = await sb.from('textbook_links').select('*').order('created_at');

    let html = '';
    data.forEach(item => {
        html += `
            <div class="material-row">
                <span>📄 ${item.title}</span>
                <span class="url-text">${item.url}</span>
                <button onclick="deleteMaterial('${item.id}')" class="delete-btn">✕</button>
            </div>
        `;
    });
    list.innerHTML = html;
}

async function deleteMaterial(id) {
    if (confirm('Удалить материал?')) {
        await sb.from('textbook_links').delete().eq('id', id);
        loadTextbookMaterialsAdmin();
    }
}

async function loadAllResults() {
    const list = document.getElementById('all-results-list');
    const { data } = await sb.from('results').select('*').order('created_at', { ascending: false });

    let html = '<h3>Последние результаты</h3>';
    data.forEach(r => {
        html += `
            <div class="result-row">
                <strong>${r.player_name}</strong> — ${r.score}/${r.total} (${r.pct}%)
                <span>${r.quiz_title}</span>
                <span>${formatTime(r.time_sec)}</span>
            </div>
        `;
    });
    list.innerHTML = html;
}

function formatTime(sec) {
    return sec < 60 ? `${sec} сек` : `${Math.floor(sec/60)} мин ${sec%60} сек`;
}

async function clearAllResultsAdmin() {
    if (confirm('УДАЛИТЬ ВСЕ РЕЗУЛЬТАТЫ? Это действие необратимо!')) {
        await sb.from('results').delete().neq('id', '0000');
        alert('Все результаты очищены');
        loadAllResults();
    }
}

function showTab(n) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(`tab-${n}`).classList.add('active');
}

function copySQL() {
    const sql = `...ваш SQL скрипт...`;
    navigator.clipboard.writeText(sql);
    alert('SQL скопирован');
}

document.addEventListener('DOMContentLoaded', () => {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
});
