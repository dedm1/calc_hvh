const GEAR_TOTAL = 13122;
const GEAR_CLASSES = ['knight', 'wizard', 'ranger', 'noble', 'outcast'];
const COMMON_TO_SILVER = 65610 / 19715;
const BASE_CUMULATIVE = 50;

const GEAR_TIERS = [
    { id: 'heroic', weight: 2187 },
    { id: 'mythic', weight: 729 },
    { id: 'red', weight: 243 },
    { id: 'legendary', weight: 81 },
    { id: 'purple', weight: 27 },
    { id: 'blue', weight: 9 },
    { id: 'green', weight: 3 }
];

const KEY_TYPES = [
    {
        id: 'silver',
        coefficient: '5',
        defaults: { personal: 25, hardmod: 25, cumulative: 50 }
    },
    {
        id: 'gold',
        coefficient: '5:1',
        defaults: { personal: 5, hardmod: 5, cumulative: 10 }
    }
];

const KEYS_I18N = {
    ru: {
        navTokens: 'Токены',
        navKeys: 'Ключи',
        title: 'Калькулятор ключей',
        gearTitle: 'Экипировка',
        keysTitle: 'Ключи',
        colClass: 'Класс',
        colHeroic: 'Героический',
        colMythic: 'Мифический',
        colRed: 'Красные',
        colLegendary: 'Легендарный',
        colPurple: 'Эпик',
        colBlue: 'Редкий',
        colGreen: 'Хороший',
        colGray: 'Обычный',
        colComplete: '% Готово',
        colKeyType: 'Тип ключа',
        colPersonal: 'Личный %',
        colHardmod: 'Хардмод %',
        colCumulative: 'Совокупный %',
        colCoefficient: 'Коэффициент',
        colKeysNeeded: 'Ключи до полного героического',
        colRuns: 'Примерное число запусков хардмода',
        classKnight: 'Рыцарь',
        classWizard: 'Волшебник',
        classRanger: 'Рейнджер',
        classNoble: 'Благородный',
        classOutcast: 'Разбойник',
        keySilver: 'Серебряный',
        keyGold: 'Золотой'
    },
    en: {
        navTokens: 'Tokens',
        navKeys: 'Keys',
        title: 'Key Calculator',
        gearTitle: 'Gear',
        keysTitle: 'Keys',
        colClass: 'Class',
        colHeroic: 'Heroic',
        colMythic: 'Mythic',
        colRed: 'Red',
        colLegendary: 'Legendary',
        colPurple: 'Purple',
        colBlue: 'Blue',
        colGreen: 'Green',
        colGray: 'Gray',
        colComplete: '% Complete',
        colKeyType: 'Key Type',
        colPersonal: 'Personal %',
        colHardmod: 'Hardmode %',
        colCumulative: 'Cumulative %',
        colCoefficient: 'Coefficient',
        colKeysNeeded: 'Keys to full heroic',
        colRuns: 'Approx. hardmode runs',
        classKnight: 'Knight',
        classWizard: 'Wizard',
        classRanger: 'Ranger',
        classNoble: 'Noble',
        classOutcast: 'Rogue',
        keySilver: 'Silver',
        keyGold: 'Gold'
    }
};

function classLabel(key, lang) {
    const map = {
        knight: 'classKnight',
        wizard: 'classWizard',
        ranger: 'classRanger',
        noble: 'classNoble',
        outcast: 'classOutcast'
    };
    return KEYS_I18N[lang][map[key]];
}

function keyTypeLabel(id, lang) {
    return KEYS_I18N[lang][id === 'silver' ? 'keySilver' : 'keyGold'];
}
