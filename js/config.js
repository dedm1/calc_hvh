const LEVELS = [
    { id: 1, normal: 25, hard: 30, type: 'weapon' },
    { id: 2, normal: 50, hard: 55, type: 'weapon' },
    { id: 3, normal: 75, hard: 80, type: 'weapon' },
    { id: 4, normal: 100, hard: 110, type: 'weapon' },
    { id: 5, normal: 100, hard: 110, type: 'super' },
    { id: 6, normal: 125, hard: 130, type: 'weapon' },
    { id: 7, normal: 150, hard: 160, type: 'weapon' },
    { id: 8, normal: 175, hard: 190, type: 'weapon' },
    { id: 9, normal: 200, hard: 220, type: 'weapon' },
    { id: 10, normal: 200, hard: 220, type: 'super' },
    { id: 11, normal: 225, hard: 250, type: 'weapon' },
    { id: 12, normal: 250, hard: 270, type: 'weapon' },
    { id: 13, normal: 275, hard: 300, type: 'weapon' },
    { id: 14, normal: 300, hard: 330, type: 'weapon' },
    { id: 15, normal: 300, hard: 330, type: 'super' },
    { id: 16, normal: 350, hard: 400, type: 'weapon' },
    { id: 17, normal: 375, hard: 425, type: 'weapon' },
    { id: 18, normal: 400, hard: 450, type: 'weapon' },
    { id: 19, normal: 425, hard: 475, type: 'weapon' },
    { id: 20, normal: 400, hard: 440, type: 'super' }
];

const PRESETS = [1500, 1700, 1970, 2200, 2500];

const I18N = {
    ru: {
        navTokens: 'Токены',
        navKeys: 'Ключи',
        title: 'Калькулятор HMA токенов',
        subtitle: 'Тапни токен · выбери сумму · считай',
        targetTitle: 'Целевая сумма',
        difficultyTitle: 'Сложность',
        difficultyNormal: 'Обычный',
        difficultyHard: 'Хард',
        modeTitle: 'Режим поиска',
        modeLower: 'Ближайшее ниже',
        modeHigher: 'Ближайшее выше',
        excludeTitle: 'Исключить токены',
        excludeHint: 'Нажми на карточку — токен не будет использоваться',
        excludeAll: 'Исключить все',
        includeAll: 'Включить все',
        calcBtn: 'Найти комбинацию',
        resultTitle: 'Результат',
        resultEmpty: 'Нажми «Найти комбинацию»',
        noSolution: 'Решение не найдено',
        target: 'Цель',
        exact: 'Точное совпадение!',
        diffBelow: 'ниже на',
        diffAbove: 'выше на',
        tokens: 'токенов',
        excluded: 'исключено',
        available: 'доступно',
        superTag: 'SUPER',
        superTotal: 'Super'
    },
    en: {
        navTokens: 'Tokens',
        navKeys: 'Keys',
        title: 'HMA Token Calculator',
        subtitle: 'Tap token · pick sum · calculate',
        targetTitle: 'Target Sum',
        difficultyTitle: 'Difficulty',
        difficultyNormal: 'Normal',
        difficultyHard: 'Hard',
        modeTitle: 'Search Mode',
        modeLower: 'Nearest below',
        modeHigher: 'Nearest above',
        excludeTitle: 'Exclude Tokens',
        excludeHint: 'Tap a card — token won\'t be used',
        excludeAll: 'Exclude all',
        includeAll: 'Include all',
        calcBtn: 'Find combination',
        resultTitle: 'Result',
        resultEmpty: 'Tap «Find combination»',
        noSolution: 'No solution found',
        target: 'Target',
        exact: 'Exact match!',
        diffBelow: 'below by',
        diffAbove: 'above by',
        tokens: 'tokens',
        excluded: 'excluded',
        available: 'available',
        superTag: 'SUPER',
        superTotal: 'Super'
    }
};

function getActiveLevels(difficulty) {
    return LEVELS.map(level => ({
        id: level.id,
        v: difficulty === 'hard' ? level.hard : level.normal,
        type: level.type,
        isSuper: level.type === 'super'
    }));
}
