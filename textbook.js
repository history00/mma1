// textbook.js — ПОЛНАЯ ВЕРСИЯ

let sb;

async function loadTextbookMaterials() {
    const container = document.getElementById('materials-container');
    const noMaterials = document.getElementById('no-materials');
    container.innerHTML = '';

    try {
        const { data, error } = await sb
            .from('textbook_links')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;

        if (data.length === 0) {
            noMaterials.style.display = 'block';
            return;
        }

        noMaterials.style.display = 'none';

        data.forEach(material => {
            const item = document.createElement('a');
            item.href = material.url;
            item.target = "_blank";
            item.className = 'textbook-item';
            item.innerHTML = `
                <span class="tb-icon">📄</span>
                <div class="tb-info">
                    <h3>${material.title}</h3>
                    <p>PDF — нажмите чтобы открыть</p>
                </div>
            `;
            container.appendChild(item);
        });
    } catch (e) {
        console.error(e);
        container.innerHTML = `<p style="color:#ff6b6b; text-align:center;">Ошибка загрузки материалов</p>`;
    }
}

// Поиск
document.getElementById('textbook-search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const items = document.querySelectorAll('.textbook-item');
    
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(term) ? 'flex' : 'none';
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    await loadTextbookMaterials();
});

// Функции модальных окон (как в других файлах)
function showClassSelector() {
    document.getElementById('class-selector-modal').style.display = 'block';
}

function closeClassSelector() {
    document.getElementById('class-selector-modal').style.display = 'none';
}

function selectClass(className) {
    document.getElementById('selected-class').textContent = className;
    closeClassSelector();
    showWheelModal();
}

function showWheelModal() {
    document.getElementById('wheel-modal').style.display = 'block';
    setTimeout(() => {
        if (typeof initWheel === 'function') initWheel(document.getElementById('selected-class').textContent);
    }, 300);
}

function closeWheelModal() {
    document.getElementById('wheel-modal').style.display = 'none';
}
