// 星座倒推胚胎植入期間計算函數

// 星座日期範圍定義
export const ZODIAC_RANGES = {
  aries: { name: '牡羊座', emoji: '♈', start: [3, 21], end: [4, 19], traits: '充滿活力、勇敢、領導力強' },
  taurus: { name: '金牛座', emoji: '♉', start: [4, 20], end: [5, 20], traits: '穩重踏實、有耐心、重視安全感' },
  gemini: { name: '雙子座', emoji: '♊', start: [5, 21], end: [6, 20], traits: '聰明機智、善於溝通、適應力強' },
  cancer: { name: '巨蟹座', emoji: '♋', start: [6, 21], end: [7, 22], traits: '溫柔體貼、重視家庭、直覺敏銳' },
  leo: { name: '獅子座', emoji: '♌', start: [7, 23], end: [8, 22], traits: '自信大方、有創造力、天生領袖' },
  virgo: { name: '處女座', emoji: '♍', start: [8, 23], end: [9, 22], traits: '細心謹慎、追求完美、分析能力強' },
  libra: { name: '天秤座', emoji: '♎', start: [9, 23], end: [10, 22], traits: '優雅和諧、重視公平、社交能力佳' },
  scorpio: { name: '天蠍座', emoji: '♏', start: [10, 23], end: [11, 21], traits: '神秘深沉、意志堅強、洞察力敏銳' },
  sagittarius: { name: '射手座', emoji: '♐', start: [11, 22], end: [12, 21], traits: '樂觀開朗、愛好自由、富有冒險精神' },
  capricorn: { name: '摩羯座', emoji: '♑', start: [12, 22], end: [1, 19], traits: '務實穩重、有責任感、目標明確' },
  aquarius: { name: '水瓶座', emoji: '♒', start: [1, 20], end: [2, 18], traits: '獨立創新、思想前衛、人道主義' },
  pisces: { name: '雙魚座', emoji: '♓', start: [2, 19], end: [3, 20], traits: '溫柔浪漫、富有想像力、同理心強' }
};

/**
 * 獲取指定星座在目標年份的出生日期範圍
 * @param {string} zodiac - 星座英文名稱
 * @param {number} targetYear - 目標年份
 * @returns {Object} 包含開始和結束日期的對象
 */
export function getZodiacBirthRange(zodiac, targetYear) {
  if (!ZODIAC_RANGES[zodiac]) {
    throw new Error(`未知的星座: ${zodiac}`);
  }

  const zodiacInfo = ZODIAC_RANGES[zodiac];
  const [startMonth, startDay] = zodiacInfo.start;
  const [endMonth, endDay] = zodiacInfo.end;

  let startDate, endDate;

  // 處理跨年星座（摩羯座）
  if (zodiac === 'capricorn') {
    startDate = new Date(targetYear - 1, startMonth - 1, startDay);
    endDate = new Date(targetYear, endMonth - 1, endDay);
  } else {
    startDate = new Date(targetYear, startMonth - 1, startDay);
    if (endMonth < startMonth) {
      // 跨年情況
      endDate = new Date(targetYear + 1, endMonth - 1, endDay);
    } else {
      endDate = new Date(targetYear, endMonth - 1, endDay);
    }
  }

  return { startDate, endDate };
}

/**
 * 從出生日期範圍計算LMP日期範圍
 * @param {Date} birthStart - 出生日期開始
 * @param {Date} birthEnd - 出生日期結束
 * @returns {Object} 包含LMP開始和結束日期的對象
 */
export function calculateLMPRange(birthStart, birthEnd) {
  const pregnancyDays = 280; // 懷孕期為280天（40週）
  
  const lmpStart = new Date(birthStart.getTime() - pregnancyDays * 24 * 60 * 60 * 1000);
  const lmpEnd = new Date(birthEnd.getTime() - pregnancyDays * 24 * 60 * 60 * 1000);
  
  return { lmpStart, lmpEnd };
}

/**
 * 從LMP日期範圍計算胚胎植入日期範圍
 * @param {Date} lmpStart - LMP開始日期
 * @param {Date} lmpEnd - LMP結束日期
 * @param {string} embryoType - 胚胎類型
 * @returns {Object} 包含植入開始和結束日期的對象
 */
export function calculateImplantationRange(lmpStart, lmpEnd, embryoType) {
  // 不同胚胎類型的植入時間偏移
  const implantationOffsets = {
    'fresh_day3': 17,    // 新鮮第3天胚胎
    'fresh_day5': 19,    // 新鮮第5天囊胚
    'frozen_day3': 17,   // 冷凍第3天胚胎
    'frozen_day5': 19    // 冷凍第5天囊胚
  };

  if (!implantationOffsets[embryoType]) {
    throw new Error(`未知的胚胎類型: ${embryoType}`);
  }

  const offsetDays = implantationOffsets[embryoType];
  
  const implantStart = new Date(lmpStart.getTime() + offsetDays * 24 * 60 * 60 * 1000);
  const implantEnd = new Date(lmpEnd.getTime() + offsetDays * 24 * 60 * 60 * 1000);
  
  return { implantStart, implantEnd };
}

/**
 * 完整的星座倒推胚胎植入計算
 * @param {string} zodiac - 星座英文名稱
 * @param {number} targetYear - 目標年份
 * @param {string} embryoType - 胚胎類型
 * @returns {Object} 包含所有計算結果的對象
 */
export function calculateZodiacImplantation(zodiac, targetYear, embryoType = 'fresh_day5') {
  // 1. 獲取星座出生日期範圍
  const { startDate: birthStart, endDate: birthEnd } = getZodiacBirthRange(zodiac, targetYear);
  
  // 2. 計算LMP日期範圍
  const { lmpStart, lmpEnd } = calculateLMPRange(birthStart, birthEnd);
  
  // 3. 計算胚胎植入日期範圍
  const { implantStart, implantEnd } = calculateImplantationRange(lmpStart, lmpEnd, embryoType);
  
  return {
    zodiac: ZODIAC_RANGES[zodiac].name,
    zodiacKey: zodiac,
    zodiacEmoji: ZODIAC_RANGES[zodiac].emoji,
    zodiacTraits: ZODIAC_RANGES[zodiac].traits,
    targetYear,
    embryoType,
    birthRange: {
      start: birthStart,
      end: birthEnd,
      startStr: formatDate(birthStart),
      endStr: formatDate(birthEnd)
    },
    lmpRange: {
      start: lmpStart,
      end: lmpEnd,
      startStr: formatDate(lmpStart),
      endStr: formatDate(lmpEnd)
    },
    implantationRange: {
      start: implantStart,
      end: implantEnd,
      startStr: formatDate(implantStart),
      endStr: formatDate(implantEnd)
    }
  };
}

/**
 * 格式化日期為 YYYY-MM-DD 格式
 * @param {Date} date - 要格式化的日期
 * @returns {string} 格式化後的日期字符串
 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * 獲取胚胎類型的中文名稱
 * @param {string} embryoType - 胚胎類型英文代碼
 * @returns {string} 胚胎類型中文名稱
 */
export function getEmbryoTypeName(embryoType) {
  const embryoTypeNames = {
    'fresh_day3': '新鮮第3天胚胎',
    'fresh_day5': '新鮮第5天囊胚',
    'frozen_day3': '冷凍第3天胚胎',
    'frozen_day5': '冷凍第5天囊胚'
  };
  
  return embryoTypeNames[embryoType] || embryoType;
}

/**
 * 檢查植入日期是否在合理範圍內（未來6個月到2年內）
 * @param {Date} implantDate - 植入日期
 * @returns {boolean} 是否在合理範圍內
 */
export function isImplantationDateReasonable(implantDate) {
  const now = new Date();
  const sixMonthsLater = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
  const twoYearsLater = new Date(now.getTime() + 2 * 365 * 24 * 60 * 60 * 1000);
  
  return implantDate >= sixMonthsLater && implantDate <= twoYearsLater;
}

