// admin.js — ПОЛНАЯ ВЕРСИЯ

let sb;
const PIN_CODE = "12341";
let enteredPin = "";

// ====================== PIN ЛОГИКА ======================

function enterPin(num) {
    if (enteredPin.length < 5) {
        enteredPin += num.toString();
        updatePinDots();
    }
    
    if (enteredPin.length === 5) {
        setTimeout(submitPin, 150);
    }
}

function clearPin() {
    enteredPin = enteredPin.slice(0, -1);
    updatePinDots();
}

function updatePinDots() {
    const dots = document.querySelectorAll('#pin-dots span');
    dots.forEach((dot, i) => {
        if (i < enteredPin.length) {
            dot.style.backgroundColor = '#d4af37';
        } else {
            dot.style.backgroundColor = '#444';
        }
    });
}

function submitPin() {
    if (enteredPin === PIN_CODE) {
        // Правильный PIN
        document.getElementById('pin-screen').classList.add('hidden');
        document.getElementById('admin-main').classList.remove('hidden');
        loadAdminData();
    } else {
        // Неправильный PIN
        const dots = document.querySelectorAll('#pin-dots span');
        dots.forEach(dot => {
            dot.style.backgroundColor = '#ff4757';
            dot.style.animation = 'shake 0.3s';
        });
        
        setTimeout(() => {
            enteredPin = "";
            updatePinDots();
        }, 600);
    }
}

// ====================== ВКЛАДКА УЧЕБНИК ======================

async function addMaterial() {
    const title = document.getElementById('material-title').value.trim();
    const url = document.getElementById('material-url').value.trim();

    if (!title || !url) {
        alert('Заполните оба поля!');
        return;
    }

    if (!url.startsWith('http')) {
        alert('Ссылка должна начинаться с http:// или https://');
        return;
    }

    try {
        const { error } = await sb.from('textbook_links').insert({
            title: title,
            url: url
        });

        if (error) throw error;

        // Очищаем поля
        document.getElementById('material-title').value = '';
        document.getElementById('material-url').value = '';

        // Перезагружаем список
        loadMaterialsAdmin();
    } catch (e) {
        console.error('Ошибка добавления материала:', e);
        alert('Ошибка при добавлении материала');
    }
}

async function loadMaterialsAdmin() {
    const list = document.getElementById('admin-materials-list');
    list.innerHTML = '<p>Загрузка...</p>';

    try {
        const { data, error } = await sb
            .from('textbook_links')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;

        if (data.length === 0) {
            list.innerHTML = '<p style="color:#aaa; text-align:center;">Материалов нет</p>';
            return;
        }

        let html = '';
        data.forEach(item => {
            html += `
                <div class="admin-item">
                    <div class="item-content">
                        <div class="item-title">📄 ${item.title}</div>
                        <div class="item-url">${item.url}</div>
                    </div>
                    <button onclick="deleteMaterial('${item.id}')" class="btn-delete-small">✕</button>
                </div>
            `;
        });

        list.innerHTML = html;
    } catch (e) {
        console.error('Ошибка загрузки материалов:', e);
        list.innerHTML = '<p style="color:#ff6b6b;">Ошибка загрузки</p>';
    }
}

async function deleteMaterial(id) {
    if (!confirm('Удалить материал?')) return;

    try {
        const { error } = await sb.from('textbook_links').delete().eq('id', id);
        
        if (error) throw error;

        loadMaterialsAdmin();
    } catch (e) {
        console.error('Ошибка удаления:', e);
        alert('Ошибка удаления материала');
    }
}

// ====================== ВКЛАДКА ЛИДЕРЫ ======================

async function loadResultsAdmin() {
    const list = document.getElementById('admin-results-list');
    list.innerHTML = '<p>Загрузка...</p>';

    try {
        const { data, error } = await sb
            .from('results')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (data.length === 0) {
            list.innerHTML = '<p style="color:#aaa; text-align:center;">Результатов нет</p>';
            return;
        }

        let html = '';
        data.forEach((result, index) => {
            const date = new Date(result.created_at).toLocaleDateString('ru-RU');
            const time = formatTime(result.time_sec);
            
            html += `
                <div class="admin-item">
                    <div class="item-content">
                        <div class="item-title">${index + 1}. ${result.player_name}</div>
                        <div class="item-details">
                            ${result.score}/${result.total} баллов (${result.pct}%) | 
                            ${result.quiz_title} | 
                            ${time} | 
                            ${date}
                        </div>
                    </div>
                </div>
            `;
        });

        list.innerHTML = html;
    } catch (e) {
        console.error('Ошибка загрузки результатов:', e);
        list.innerHTML = '<p style="color:#ff6b6b;">Ошибка загрузки</p>';
    }
}

async function clearAllResults() {
    if (!confirm('⚠️ УДАЛИТЬ ВСЕ РЕЗУЛЬТАТЫ? Это действие необратимо!')) return;

    try {
        // Удаляем все записи из таблицы results
        const { error } = await sb.from('results').delete().neq('id', '00000000-0000-0000-0000-000000000000');

        if (error) throw error;

        alert('✅ Все результаты удалены!');
        loadResultsAdmin();
    } catch (e) {
        console.error('Ошибка очистки:', e);
        alert('❌ Ошибка при удалении результатов');
    }
}

// ====================== ОБЩИЕ ФУНКЦИИ ======================

function showAdminTab(tabNum) {
    // Скрываем все вкладки
    const tabs = document.querySelectorAll('.admin-tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Убираем активность со всех кнопок
    const buttons = document.querySelectorAll('.admin-tab');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Показываем нужную вкладку
    document.getElementById(`admin-tab-${tabNum}`).classList.add('active');

    // Активируем кнопку
    event.target.classList.add('active');
}

function formatTime(seconds) {
    if (seconds < 60) return `${seconds} сек`;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min} мин ${sec} сек`;
}

function loadAdminData() {
    loadMaterialsAdmin();
    loadResultsAdmin();
}

// ====================== ИНИЦИАЛИЗАЦИЯ ======================

document.addEventListener('DOMContentLoaded', () => {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Админ-панель инициализирована');
});
