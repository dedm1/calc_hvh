const chipStates = new Map();
let searchMode = 'lower';
let difficulty = 'hard';
let currentLang = 'en';
let lastResult = null;
let chipClickTimer = null;
let chipClickId = null;

function t(key) {
    return I18N[currentLang][key];
}

function getItems() {
    return getActiveLevels(difficulty);
}

function getChipState(id) {
    return chipStates.get(id) || 'normal';
}

function setChipState(id, state) {
    if (state === 'normal') chipStates.delete(id);
    else chipStates.set(id, state);
}

function getExcludedCount() {
    return getItems().filter(item => getChipState(item.id) === 'excluded').length;
}

function getRequiredCount() {
    return getItems().filter(item => getChipState(item.id) === 'required').length;
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
    updateTargetLimits();
    if (lastResult) calculate();
}

function getMaxTarget() {
    return getItems()
        .filter(item => getChipState(item.id) !== 'excluded')
        .reduce((sum, item) => sum + item.v, 0);
}

function clampTarget(val) {
    const max = getMaxTarget();
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 0) return 0;
    return Math.min(num, max);
}

function updateTargetLimits() {
    const input = document.getElementById('target');
    const max = getMaxTarget();
    input.max = max;
    input.value = clampTarget(input.value);
    onTargetChange();
}

function stepTarget(delta) {
    const input = document.getElementById('target');
    input.value = clampTarget(parseInt(input.value || 0, 10) + delta);
    onTargetChange();
}

function onTargetChange() {
    const input = document.getElementById('target');
    input.value = clampTarget(input.value);
    const val = parseInt(input.value, 10) || 0;
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
    document.getElementById('target').value = clampTarget(val);
    onTargetChange();
}

function renderChips() {
    const container = document.getElementById('chips');
    const items = getItems();
    container.innerHTML = items.map(item => {
        const state = getChipState(item.id);
        const classes = ['chip'];
        if (item.isSuper) classes.push('super');
        if (state === 'excluded') classes.push('excluded');
        if (state === 'required') classes.push('required');
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

function handleChipClick(id) {
    const state = getChipState(id);

    if (state === 'required') {
        if (chipClickTimer) {
            clearTimeout(chipClickTimer);
            chipClickTimer = null;
            chipClickId = null;
        }
        setChipState(id, 'normal');
        renderChips();
        updateTargetLimits();
        return;
    }

    if (chipClickTimer && chipClickId === id) {
        clearTimeout(chipClickTimer);
        chipClickTimer = null;
        chipClickId = null;
        setChipState(id, 'required');
        renderChips();
        updateTargetLimits();
        return;
    }

    if (chipClickTimer) {
        clearTimeout(chipClickTimer);
    }

    chipClickId = id;
    chipClickTimer = setTimeout(() => {
        chipClickTimer = null;
        chipClickId = null;
        const current = getChipState(id);
        if (current === 'excluded') setChipState(id, 'normal');
        else setChipState(id, 'excluded');
        renderChips();
        updateTargetLimits();
    }, 280);
}

function excludeAll() {
    getItems().forEach(i => setChipState(i.id, 'excluded'));
    renderChips();
    updateTargetLimits();
}

function includeAll() {
    chipStates.clear();
    renderChips();
    updateTargetLimits();
}

function findBestCombination(target, required, optional, mode) {
    const reqSum = required.reduce((sum, item) => sum + item.v, 0);
    const reqComb = [...required];
    let bestSum = mode === 'lower' ? -1 : Infinity;
    let bestComb = [];

    if (mode === 'lower' && reqSum > target) {
        return { bestSum: -1, bestComb: [] };
    }

    const totalCombs = 1 << optional.length;
    for (let i = 0; i < totalCombs; i++) {
        let currentSum = reqSum;
        const currentComb = [...reqComb];

        for (let j = 0; j < optional.length; j++) {
            if ((i >> j) & 1) {
                currentSum += optional[j].v;
                currentComb.push(optional[j]);
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

    if (required.length && bestComb.length === 0 && mode === 'higher' && reqSum >= target) {
        return { bestSum: reqSum, bestComb: reqComb };
    }

    return { bestSum, bestComb };
}

function calculate() {
    const target = parseInt(document.getElementById('target').value, 10);
    const items = getItems();
    const required = items.filter(item => getChipState(item.id) === 'required');
    const optional = items.filter(item => getChipState(item.id) === 'normal');
    const available = required.length + optional.length;
    const { bestSum, bestComb } = findBestCombination(target, required, optional, searchMode);
    const superCount = bestComb.filter(item => item.isSuper).length;

    lastResult = {
        target,
        bestSum,
        bestComb,
        available,
        superCount,
        excluded: getExcludedCount(),
        required: getRequiredCount()
    };
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

    const { target, bestSum, bestComb, available, superCount, excluded, required } = data;

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

    const requiredIds = new Set(
        getItems().filter(item => getChipState(item.id) === 'required').map(item => item.id)
    );

    const pills = bestComb.length
        ? bestComb.map(c => {
            let cls = c.isSuper ? 'pill super' : 'pill';
            if (requiredIds.has(c.id)) cls += ' required';
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
            <span><strong>${required}</strong>${t('required')}</span>
            <span><strong>${excluded}</strong>${t('excluded')}</span>
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
        if (chip) handleChipClick(parseInt(chip.dataset.id, 10));
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
    updateTargetLimits();
}

init();
