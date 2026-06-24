let currentLang = 'en';

function t(key) {
    return KEYS_I18N[currentLang][key];
}

function setLang(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (KEYS_I18N[lang][key]) el.textContent = KEYS_I18N[lang][key];
    });
    document.querySelectorAll('[data-class]').forEach(el => {
        el.textContent = classLabel(el.dataset.class, lang);
    });
    document.querySelectorAll('[data-key-type]').forEach(el => {
        el.textContent = keyTypeLabel(el.dataset.keyType, lang);
    });
}

function getTotalCommon() {
    let total = 0;
    document.querySelectorAll('#gearTable tbody tr').forEach(row => {
        total += parseInt(row.querySelector('.common').textContent, 10) || 0;
    });
    return total;
}

function updateGearRow(row) {
    const inputs = row.querySelectorAll('.gear-input');
    let upgradedCommonEquivalent = 0;
    
    inputs.forEach((input, index) => {
        const val = parseInt(input.value, 10) || 0;
        if (val > 0) {
            // Умножаем количество предметов на их "вес" в обычных (серых) предметах
            upgradedCommonEquivalent += val * GEAR_TIERS[index].weight;
        }
    });

    const commonNeeded = Math.max(0, GEAR_TOTAL - upgradedCommonEquivalent);
    const percent = Math.min(100, (upgradedCommonEquivalent / GEAR_TOTAL) * 100);
    
    row.querySelector('.common').textContent = commonNeeded;
    row.querySelector('.percent').textContent = percent.toFixed(2) + '%';
}

function updateAllGearRows() {
    document.querySelectorAll('#gearTable tbody tr').forEach(row => {
        updateGearRow(row);
    });
}

function updateKeys() {
    const totalCommon = getTotalCommon();
    const silverKeys = Math.round(totalCommon / COMMON_TO_SILVER);
    const goldKeys = Math.round(silverKeys / 5);

    const silverRow = document.querySelector('#keyTable tr[data-key-id="silver"]');
    const goldRow = document.querySelector('#keyTable tr[data-key-id="gold"]');

    const silverCumulative = Math.max(0.01, parseFloat(silverRow.querySelector('[data-field="cumulative"]').value) || 50);
    const goldCumulative = Math.max(0.01, parseFloat(goldRow.querySelector('[data-field="cumulative"]').value) || 10);

    // Формула из примера: при 50% шанса runs = keys
    const silverRuns = Math.round(silverKeys * 50 / silverCumulative);
    const goldRuns = Math.round(goldKeys * 50 / goldCumulative);

    silverRow.querySelector('.keys-needed').textContent = silverKeys.toLocaleString();
    silverRow.querySelector('.runs-needed').textContent = silverRuns.toLocaleString();
    goldRow.querySelector('.keys-needed').textContent = goldKeys.toLocaleString();
    goldRow.querySelector('.runs-needed').textContent = goldRuns.toLocaleString();
}

function updateCumulative(row) {
    const personal = parseFloat(row.querySelector('[data-field="personal"]').value) || 0;
    const hardmod = parseFloat(row.querySelector('[data-field="hardmod"]').value) || 0;
    row.querySelector('[data-field="cumulative"]').value = Math.min(100, personal + hardmod);
}

function bindEvents() {
    document.querySelector('.lang-bar').addEventListener('click', e => {
        const btn = e.target.closest('.lang-btn');
        if (btn) setLang(btn.dataset.lang);
    });

    document.getElementById('gearTable').addEventListener('input', e => {
        const input = e.target.closest('.gear-input');
        if (input) {
            updateGearRow(input.closest('tr'));
            updateKeys();
        }
    });

    document.getElementById('keyTable').addEventListener('input', e => {
        const input = e.target.closest('.key-input');
        if (!input) return;

        const row = input.closest('tr');
        const field = input.dataset.field;

        let val = parseFloat(input.value) || 0;
        val = Math.max(0, Math.min(100, val));
        input.value = val;

        if (field === 'personal' || field === 'hardmod') {
            updateCumulative(row);
        }

        updateKeys();
    });
}

function init() {
    bindEvents();
    updateAllGearRows();
    updateKeys();
    // Устанавливаем язык при загрузке
    setLang(currentLang);
}

init();
