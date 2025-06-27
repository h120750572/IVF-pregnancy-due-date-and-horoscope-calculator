// 試管嬰兒懷孕計算工具函數

/**
 * 計算兩個日期之間的天數差
 * @param {Date} date1 
 * @param {Date} date2 
 * @returns {number} 天數差
 */
export function calculateDaysDifference(date1, date2) {
  const timeDiff = date2.getTime() - date1.getTime();
  return Math.floor(timeDiff / (1000 * 3600 * 24));
}

/**
 * 根據LMP計算預產期
 * @param {Date} lmpDate 最後月經日期
 * @returns {Date} 預產期
 */
export function calculateEDCFromLMP(lmpDate) {
  const edc = new Date(lmpDate);
  edc.setDate(edc.getDate() + 280);
  return edc;
}

/**
 * 根據胚胎植入日期計算LMP
 * @param {Date} implantDate 植入日期
 * @param {number} embryoDay 胚胎天數 (2, 3, 5)
 * @returns {Date} 計算出的LMP
 */
export function calculateLMPFromImplant(implantDate, embryoDay) {
  const lmp = new Date(implantDate);
  let daysToSubtract;
  
  switch (embryoDay) {
    case 2:
      daysToSubtract = 16;
      break;
    case 3:
      daysToSubtract = 17;
      break;
    case 5:
      daysToSubtract = 19;
      break;
    default:
      daysToSubtract = 17; // 預設為3天胚胎
  }
  
  lmp.setDate(lmp.getDate() - daysToSubtract);
  return lmp;
}

/**
 * 計算懷孕週數
 * @param {Date} lmpDate LMP日期
 * @param {Date} currentDate 當前日期
 * @returns {Object} {weeks: 週數, days: 天數}
 */
export function calculatePregnancyWeeks(lmpDate, currentDate = new Date()) {
  const daysDiff = calculateDaysDifference(lmpDate, currentDate);
  
  // 如果是負數，表示LMP在未來，返回0
  if (daysDiff < 0) {
    return { weeks: 0, days: 0 };
  }
  
  const weeks = Math.floor(daysDiff / 7);
  const days = daysDiff % 7;
  
  return { weeks, days };
}

/**
 * 根據懷孕週數估算胎兒體重
 * @param {number} weeks 懷孕週數
 * @returns {Object} {min: 最小體重, max: 最大體重, average: 平均體重}
 */
export function estimateFetalWeight(weeks) {
  // 基於醫學資料的胎兒體重估算表
  const weightData = {
    12: { min: 14, max: 20, average: 17 },
    16: { min: 100, max: 120, average: 110 },
    20: { min: 300, max: 350, average: 325 },
    24: { min: 600, max: 700, average: 650 },
    28: { min: 1100, max: 1200, average: 1150 },
    32: { min: 1700, max: 1900, average: 1800 },
    36: { min: 2500, max: 2800, average: 2650 },
    40: { min: 3200, max: 3500, average: 3350 }
  };
  
  // 找到最接近的週數
  const availableWeeks = Object.keys(weightData).map(Number).sort((a, b) => a - b);
  let closestWeek = availableWeeks[0];
  
  for (let week of availableWeeks) {
    if (weeks >= week) {
      closestWeek = week;
    } else {
      break;
    }
  }
  
  // 如果週數太小或太大，返回邊界值
  if (weeks < 12) {
    return { min: 0, max: 14, average: 7 };
  }
  if (weeks > 40) {
    return weightData[40];
  }
  
  return weightData[closestWeek];
}

/**
 * 根據日期計算星座
 * @param {Date} date 日期
 * @returns {string} 星座名稱
 */
export function calculateZodiacSign(date) {
  const month = date.getMonth() + 1; // JavaScript月份從0開始
  const day = date.getDate();
  
  const zodiacSigns = [
    { name: '摩羯座', start: { month: 12, day: 22 }, end: { month: 1, day: 19 } },
    { name: '水瓶座', start: { month: 1, day: 20 }, end: { month: 2, day: 18 } },
    { name: '雙魚座', start: { month: 2, day: 19 }, end: { month: 3, day: 20 } },
    { name: '牡羊座', start: { month: 3, day: 21 }, end: { month: 4, day: 19 } },
    { name: '金牛座', start: { month: 4, day: 20 }, end: { month: 5, day: 20 } },
    { name: '雙子座', start: { month: 5, day: 21 }, end: { month: 6, day: 20 } },
    { name: '巨蟹座', start: { month: 6, day: 21 }, end: { month: 7, day: 22 } },
    { name: '獅子座', start: { month: 7, day: 23 }, end: { month: 8, day: 22 } },
    { name: '處女座', start: { month: 8, day: 23 }, end: { month: 9, day: 22 } },
    { name: '天秤座', start: { month: 9, day: 23 }, end: { month: 10, day: 22 } },
    { name: '天蠍座', start: { month: 10, day: 23 }, end: { month: 11, day: 21 } },
    { name: '射手座', start: { month: 11, day: 22 }, end: { month: 12, day: 21 } }
  ];
  
  for (let sign of zodiacSigns) {
    if (sign.name === '摩羯座') {
      // 摩羯座跨年，特殊處理
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
        return sign.name;
      }
    } else {
      if ((month === sign.start.month && day >= sign.start.day) ||
          (month === sign.end.month && day <= sign.end.day)) {
        return sign.name;
      }
    }
  }
  
  return '未知';
}

/**
 * 格式化日期為字串
 * @param {Date} date 日期
 * @returns {string} 格式化的日期字串
 */
export function formatDate(date) {
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * 格式化懷孕週數
 * @param {Object} pregnancyWeeks {weeks, days}
 * @returns {string} 格式化的週數字串
 */
export function formatPregnancyWeeks(pregnancyWeeks) {
  return `${pregnancyWeeks.weeks}週${pregnancyWeeks.days}天`;
}

/**
 * 獲取星座特質描述
 * @param {string} zodiacSign 星座名稱
 * @returns {string} 星座特質描述
 */
export function getZodiacTraits(zodiacSign) {
  const traits = {
    '牡羊座': '勇敢、熱情、積極進取，天生的領導者',
    '金牛座': '穩重、務實、有耐心，追求安全感',
    '雙子座': '聰明、好奇、善於溝通，適應力強',
    '巨蟹座': '溫柔、體貼、重視家庭，情感豐富',
    '獅子座': '自信、大方、有魅力，喜歡成為焦點',
    '處女座': '細心、完美主義、有條理，注重細節',
    '天秤座': '優雅、和諧、公正，追求平衡',
    '天蠍座': '神秘、專注、意志堅強，洞察力敏銳',
    '射手座': '樂觀、自由、愛冒險，追求真理',
    '摩羯座': '踏實、有責任感、目標明確，堅持不懈',
    '水瓶座': '獨立、創新、人道主義，思想前衛',
    '雙魚座': '浪漫、直覺、富有同情心，想像力豐富'
  };
  
  return traits[zodiacSign] || '每個寶寶都是獨特的小天使';
}

