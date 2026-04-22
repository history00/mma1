// textbook.js — ПОЛНАЯ ВЕРСИЯ

let sb;

async function loadMaterials() {
    const list = document.getElementById('materials-list');
    const noMaterials = document.getElementById('no-materials');
    
    list.innerHTML = '';

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
            item.rel = "noopener noreferrer";
            item.className = 'textbook-item';
            item.innerHTML = `
                <span class="tb-icon">📄</span>
                <div class="tb-info">
                    <h3>${material.title}</h3>
                    <p>PDF — нажмите чтобы открыть</p>
                </div>
                <span class="arrow">→</span>
            `;
            list.appendChild(item);
        });

    } catch (e) {
        console.error('Ошибка загрузки материалов:', e);
        list.innerHTML = '<p style="color:#ff6b6b;text-align:center;">Ошибка загрузки</p>';
    }
}

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
        if (typeof initWheel === 'function') {
            initWheel(document.getElementById('selected-class').textContent);
        }
    }, 300);
}

function closeWheelModal() {
    document.getElementById('wheel-modal').style.display = 'none';
}

window.onclick = function(event) {
    const classModal = document.getElementById('class-selector-modal');
    const wheelModal = document.getElementById('wheel-modal');
    
    if (event.target === classModal) closeClassSelector();
    if (event.target === wheelModal) closeWheelModal();
}

document.addEventListener('DOMContentLoaded', async () => {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    await loadMaterials();
});
