const excluded = new Set();
let searchMode = 'lower';
let difficulty = 'hard';
let currentLang = 'ru';
let lastResult = null;

function t(key) {
    return I18N[currentLang][key];
}

function getItems() {
    return getActiveLevels(difficulty);
}

function setLang(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (I18N[lang][key]) el.textContent = I18N[lang][key];
    });
    renderPresets();
    renderChips();
    renderResult(lastResult);
}

function setSearchMode(mode) {
    searchMode = mode;
    document.querySelectorAll('[data-mode]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
}

function setDifficulty(next) {
    difficulty = next;
    document.querySelectorAll('[data-difficulty]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.difficulty === next);
    });
    renderChips();
    if (lastResult) calculate();
}

function stepTarget(delta) {
    const input = document.getElementById('target');
    input.value = Math.max(0, parseInt(input.value || 0, 10) + delta);
    onTargetChange();
}

function onTargetChange() {
    const val = parseInt(document.getElementById('target').value, 10);
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.val, 10) === val);
    });
}

function renderPresets() {
    const container = document.getElementById('presets');
    const current = parseInt(document.getElementById('target').value, 10);
    container.innerHTML = PRESETS.map(v =>
        `<button class="preset-btn${v === current ? ' active' : ''}" data-val="${v}" type="button">${v.toLocaleString()}</button>`
    ).join('');
}

function setPreset(val) {
    document.getElementById('target').value = val;
    onTargetChange();
}

function renderChips() {
    const container = document.getElementById('chips');
    const items = getItems();
    container.innerHTML = items.map(item => {
        const classes = ['chip'];
        if (item.isSuper) classes.push('super');
        if (excluded.has(item.id)) classes.push('excluded');
        const superLabel = item.isSuper ? `<div class="chip-type">${t('superTag')}</div>` : '';
        return `
            <div class="${classes.join(' ')}" data-id="${item.id}">
                ${superLabel}
                <div class="chip-id">LV ${item.id}</div>
                <div class="chip-val">${item.v}</div>
            </div>
        `;
    }).join('');
}

function toggleChip(id) {
    if (excluded.has(id)) excluded.delete(id);
    else excluded.add(id);
    renderChips();
}

function excludeAll() {
    getItems().forEach(i => excluded.add(i.id));
    renderChips();
}

function includeAll() {
    excluded.clear();
    renderChips();
}

function findBestCombination(target, available, mode) {
    let bestSum = mode === 'lower' ? -1 : Infinity;
    let bestComb = [];

    const totalCombs = 1 << available.length;
    for (let i = 0; i < totalCombs; i++) {
        let currentSum = 0;
        const currentComb = [];

        for (let j = 0; j < available.length; j++) {
            if ((i >> j) & 1) {
                currentSum += available[j].v;
                currentComb.push(available[j]);
            }
        }

        if (mode === 'lower') {
            if (currentSum <= target) {
                if (currentSum > bestSum || (currentSum === bestSum && currentComb.length < bestComb.length)) {
                    bestSum = currentSum;
                    bestComb = currentComb;
                }
            }
        } else if (currentSum >= target) {
            if (currentSum < bestSum || (currentSum === bestSum && currentComb.length < bestComb.length)) {
                bestSum = currentSum;
                bestComb = currentComb;
            }
        }
    }

    return { bestSum, bestComb };
}

function calculate() {
    const target = parseInt(document.getElementById('target').value, 10);
    const available = getItems().filter(item => !excluded.has(item.id));
    const { bestSum, bestComb } = findBestCombination(target, available, searchMode);
    const superCount = bestComb.filter(item => item.isSuper).length;

    lastResult = { target, bestSum, bestComb, available: available.length, superCount };
    renderResult(lastResult);
}

function renderResult(data) {
    const card = document.getElementById('result-card');
    const el = document.getElementById('result');

    if (!data) {
        card.className = 'card result-card';
        el.innerHTML = `<p class="result-empty">${t('resultEmpty')}</p>`;
        return;
    }

    const { target, bestSum, bestComb, available, superCount } = data;

    if (bestSum === -1 || bestSum === Infinity) {
        card.className = 'card result-card error';
        el.innerHTML = `<p class="result-empty">${t('noSolution')}</p>`;
        return;
    }

    const diff = bestSum - target;
    let diffHtml;
    if (diff === 0) {
        diffHtml = `<span class="ok">✓ ${t('exact')}</span>`;
    } else if (diff < 0) {
        diffHtml = `<span class="warn">${t('diffBelow')} ${Math.abs(diff)}</span>`;
    } else {
        diffHtml = `<span class="warn">${t('diffAbove')} ${diff}</span>`;
    }

    const pills = bestComb.length
        ? bestComb.map(c => {
            const cls = c.isSuper ? 'pill super' : 'pill';
            return `<span class="${cls}"><span class="pill-id">#${c.id}</span>${c.v}</span>`;
        }).join('')
        : '<span class="pill">0</span>';

    const superTotalHtml = `<p class="result-super-total">${t('superTotal')}: <strong>${superCount}</strong></p>`;

    card.className = 'card result-card success';
    el.innerHTML = `
        <p class="result-sum">${bestSum.toLocaleString()}</p>
        <p class="result-diff">${t('target')}: ${target.toLocaleString()} · ${diffHtml}</p>
        <div class="result-pills">${pills}</div>
        <div class="stats">
            <span><strong>${bestComb.length}</strong>${t('tokens')}</span>
            <span class="stat-super"><strong>${superCount}</strong>${t('superTotal')}</span>
            <span><strong>${excluded.size}</strong>${t('excluded')}</span>
            <span><strong>${available}</strong>${t('available')}</span>
        </div>
        ${superTotalHtml}
    `;
}

function bindEvents() {
    document.querySelector('.lang-bar').addEventListener('click', e => {
        const btn = e.target.closest('.lang-btn');
        if (btn) setLang(btn.dataset.lang);
    });

    document.querySelector('.difficulty-toggle').addEventListener('click', e => {
        const btn = e.target.closest('[data-difficulty]');
        if (btn) setDifficulty(btn.dataset.difficulty);
    });

    document.querySelector('.mode-toggle:not(.difficulty-toggle)').addEventListener('click', e => {
        const btn = e.target.closest('[data-mode]');
        if (btn) setSearchMode(btn.dataset.mode);
    });

    document.getElementById('presets').addEventListener('click', e => {
        const btn = e.target.closest('.preset-btn');
        if (btn) setPreset(parseInt(btn.dataset.val, 10));
    });

    document.getElementById('chips').addEventListener('click', e => {
        const chip = e.target.closest('.chip');
        if (chip) toggleChip(parseInt(chip.dataset.id, 10));
    });

    document.getElementById('target').addEventListener('input', onTargetChange);

    document.querySelector('[data-action="step-down"]').addEventListener('click', () => stepTarget(-10));
    document.querySelector('[data-action="step-up"]').addEventListener('click', () => stepTarget(10));
    document.querySelector('[data-action="exclude-all"]').addEventListener('click', excludeAll);
    document.querySelector('[data-action="include-all"]').addEventListener('click', includeAll);
    document.querySelector('[data-action="calculate"]').addEventListener('click', calculate);
}

function init() {
    bindEvents();
    setLang(currentLang);
}

init();
