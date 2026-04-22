// admin.js — ИСПРАВЛЕННАЯ ВЕРСИЯ

let sb;
const PIN_CODE = "12341";
let enteredPin = "";

function enterPin(num) {
    if (enteredPin.length < 5) {
        enteredPin += num;
        updateDots();
    }
    if (enteredPin.length === 5) {
        setTimeout(checkPin, 150);
    }
}

function clearPin() {
    enteredPin = enteredPin.slice(0, -1);
    updateDots();
}

function updateDots() {
    const dots = document.querySelectorAll('#pin-dots span');
    dots.forEach((dot, i) => {
        dot.style.backgroundColor = i < enteredPin.length ? '#d4af37' : '#333';
    });
}

function checkPin() {
    if (enteredPin === PIN_CODE) {
        document.getElementById('pin-screen').classList.add('hidden');
        document.getElementById('admin-main').classList.remove('hidden');
        loadAdminData();
    } else {
        const dots = document.querySelectorAll('#pin-dots span');
        dots.forEach(dot => dot.style.backgroundColor = '#ff4757');
        setTimeout(() => {
            enteredPin = "";
            updateDots();
        }, 800);
    }
}

function loadAdminData() {
    loadMaterialsAdmin();
}

async function addMaterial() {
    const title = document.getElementById('material-title').value.trim();
    const url = document.getElementById('material-url').value.trim();

    if (!title || !url) {
        alert("Заполните оба поля");
        return;
    }

    await sb.from('textbook_links').insert({ title: title, url: url });
    document.getElementById('material-title').value = '';
    document.getElementById('material-url').value = '';
    loadMaterialsAdmin();
}

async function loadMaterialsAdmin() {
    const list = document.getElementById('admin-materials-list');
    const { data } = await sb.from('textbook_links').select('*').order('created_at');

    let html = '';
    data.forEach(item => {
        html += `
            <div class="admin-material-item">
                <span>📄 ${item.title}</span>
                <span class="small-url">${item.url}</span>
                <button onclick="deleteMaterial('${item.id}')" class="delete-small">✕</button>
            </div>
        `;
    });
    list.innerHTML = html || '<p>Нет материалов</p>';
}

async function deleteMaterial(id) {
    if (confirm('Удалить материал?')) {
        await sb.from('textbook_links').delete().eq('id', id);
        loadMaterialsAdmin();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
});
