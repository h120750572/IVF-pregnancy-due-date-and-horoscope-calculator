#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
星座倒推胚胎植入期間計算邏輯測試
"""

from datetime import datetime, timedelta
from typing import Tuple, List, Dict

class ZodiacReverseCalculator:
    """星座倒推計算器"""
    
    # 星座日期範圍定義 (月, 日)
    ZODIAC_RANGES = {
        'aries': {'name': '牡羊座', 'start': (3, 21), 'end': (4, 19)},
        'taurus': {'name': '金牛座', 'start': (4, 20), 'end': (5, 20)},
        'gemini': {'name': '雙子座', 'start': (5, 21), 'end': (6, 20)},
        'cancer': {'name': '巨蟹座', 'start': (6, 21), 'end': (7, 22)},
        'leo': {'name': '獅子座', 'start': (7, 23), 'end': (8, 22)},
        'virgo': {'name': '處女座', 'start': (8, 23), 'end': (9, 22)},
        'libra': {'name': '天秤座', 'start': (9, 23), 'end': (10, 22)},
        'scorpio': {'name': '天蠍座', 'start': (10, 23), 'end': (11, 21)},
        'sagittarius': {'name': '射手座', 'start': (11, 22), 'end': (12, 21)},
        'capricorn': {'name': '摩羯座', 'start': (12, 22), 'end': (1, 19)},
        'aquarius': {'name': '水瓶座', 'start': (1, 20), 'end': (2, 18)},
        'pisces': {'name': '雙魚座', 'start': (2, 19), 'end': (3, 20)}
    }
    
    def get_zodiac_birth_range(self, zodiac: str, target_year: int) -> Tuple[datetime, datetime]:
        """
        獲取指定星座在目標年份的出生日期範圍
        
        Args:
            zodiac: 星座英文名稱
            target_year: 目標年份
            
        Returns:
            (開始日期, 結束日期)
        """
        if zodiac not in self.ZODIAC_RANGES:
            raise ValueError(f"未知的星座: {zodiac}")
        
        zodiac_info = self.ZODIAC_RANGES[zodiac]
        start_month, start_day = zodiac_info['start']
        end_month, end_day = zodiac_info['end']
        
        # 處理跨年星座（摩羯座）
        if zodiac == 'capricorn':
            # 摩羯座：12月22日 - 1月19日
            start_date = datetime(target_year - 1, start_month, start_day)
            end_date = datetime(target_year, end_month, end_day)
        else:
            start_date = datetime(target_year, start_month, start_day)
            if end_month < start_month:  # 跨年情況
                end_date = datetime(target_year + 1, end_month, end_day)
            else:
                end_date = datetime(target_year, end_month, end_day)
        
        return start_date, end_date
    
    def calculate_lmp_range(self, birth_start: datetime, birth_end: datetime) -> Tuple[datetime, datetime]:
        """
        從出生日期範圍計算LMP日期範圍
        
        Args:
            birth_start: 出生日期開始
            birth_end: 出生日期結束
            
        Returns:
            (LMP開始日期, LMP結束日期)
        """
        # 懷孕期為280天（40週）
        pregnancy_days = 280
        
        lmp_start = birth_start - timedelta(days=pregnancy_days)
        lmp_end = birth_end - timedelta(days=pregnancy_days)
        
        return lmp_start, lmp_end
    
    def calculate_implantation_range(self, lmp_start: datetime, lmp_end: datetime, 
                                   embryo_type: str) -> Tuple[datetime, datetime]:
        """
        從LMP日期範圍計算胚胎植入日期範圍
        
        Args:
            lmp_start: LMP開始日期
            lmp_end: LMP結束日期
            embryo_type: 胚胎類型 ('fresh_day3', 'fresh_day5', 'frozen_day3', 'frozen_day5')
            
        Returns:
            (植入開始日期, 植入結束日期)
        """
        # 不同胚胎類型的植入時間偏移
        implantation_offsets = {
            'fresh_day3': 17,    # 新鮮第3天胚胎
            'fresh_day5': 19,    # 新鮮第5天囊胚
            'frozen_day3': 17,   # 冷凍第3天胚胎
            'frozen_day5': 19    # 冷凍第5天囊胚
        }
        
        if embryo_type not in implantation_offsets:
            raise ValueError(f"未知的胚胎類型: {embryo_type}")
        
        offset_days = implantation_offsets[embryo_type]
        
        implant_start = lmp_start + timedelta(days=offset_days)
        implant_end = lmp_end + timedelta(days=offset_days)
        
        return implant_start, implant_end
    
    def calculate_zodiac_implantation(self, zodiac: str, target_year: int, 
                                    embryo_type: str = 'fresh_day5') -> Dict:
        """
        完整的星座倒推胚胎植入計算
        
        Args:
            zodiac: 星座英文名稱
            target_year: 目標年份
            embryo_type: 胚胎類型
            
        Returns:
            包含所有計算結果的字典
        """
        # 1. 獲取星座出生日期範圍
        birth_start, birth_end = self.get_zodiac_birth_range(zodiac, target_year)
        
        # 2. 計算LMP日期範圍
        lmp_start, lmp_end = self.calculate_lmp_range(birth_start, birth_end)
        
        # 3. 計算胚胎植入日期範圍
        implant_start, implant_end = self.calculate_implantation_range(
            lmp_start, lmp_end, embryo_type)
        
        return {
            'zodiac': self.ZODIAC_RANGES[zodiac]['name'],
            'zodiac_key': zodiac,
            'target_year': target_year,
            'embryo_type': embryo_type,
            'birth_range': {
                'start': birth_start.strftime('%Y-%m-%d'),
                'end': birth_end.strftime('%Y-%m-%d')
            },
            'lmp_range': {
                'start': lmp_start.strftime('%Y-%m-%d'),
                'end': lmp_end.strftime('%Y-%m-%d')
            },
            'implantation_range': {
                'start': implant_start.strftime('%Y-%m-%d'),
                'end': implant_end.strftime('%Y-%m-%d')
            }
        }

def test_zodiac_calculations():
    """測試星座倒推計算功能"""
    calculator = ZodiacReverseCalculator()
    
    print("=== 星座倒推胚胎植入期間計算測試 ===\n")
    
    # 測試所有星座
    test_cases = [
        ('aries', 2025, 'fresh_day5'),
        ('cancer', 2025, 'fresh_day5'),
        ('libra', 2025, 'fresh_day5'),
        ('capricorn', 2025, 'fresh_day5'),  # 跨年星座
    ]
    
    for zodiac, year, embryo_type in test_cases:
        try:
            result = calculator.calculate_zodiac_implantation(zodiac, year, embryo_type)
            
            print(f"🌟 {result['zodiac']} ({year}年)")
            print(f"   出生日期範圍: {result['birth_range']['start']} ~ {result['birth_range']['end']}")
            print(f"   LMP日期範圍: {result['lmp_range']['start']} ~ {result['lmp_range']['end']}")
            print(f"   建議植入期間: {result['implantation_range']['start']} ~ {result['implantation_range']['end']}")
            print(f"   胚胎類型: {embryo_type}")
            print()
            
        except Exception as e:
            print(f"❌ 計算 {zodiac} 時發生錯誤: {e}")
    
    # 測試不同胚胎類型
    print("=== 不同胚胎類型比較 (獅子座 2025年) ===\n")
    embryo_types = ['fresh_day3', 'fresh_day5', 'frozen_day3', 'frozen_day5']
    
    for embryo_type in embryo_types:
        result = calculator.calculate_zodiac_implantation('leo', 2025, embryo_type)
        print(f"📅 {embryo_type}: {result['implantation_range']['start']} ~ {result['implantation_range']['end']}")
    
    print("\n=== 驗證計算邏輯 ===")
    
    # 驗證：如果在建議的植入期間植入，是否真的會生出目標星座的寶寶
    result = calculator.calculate_zodiac_implantation('leo', 2025, 'fresh_day5')
    implant_date = datetime.strptime(result['implantation_range']['start'], '%Y-%m-%d')
    
    # 從植入日期正推計算預產期
    lmp_from_implant = implant_date - timedelta(days=19)  # 第5天囊胚
    due_date = lmp_from_implant + timedelta(days=280)
    
    print(f"✅ 驗證獅子座計算:")
    print(f"   建議植入日期: {implant_date.strftime('%Y-%m-%d')}")
    print(f"   推算LMP: {lmp_from_implant.strftime('%Y-%m-%d')}")
    print(f"   預產期: {due_date.strftime('%Y-%m-%d')}")
    print(f"   獅子座範圍: 7月23日 - 8月22日")
    
    # 檢查預產期是否在獅子座範圍內
    if (due_date.month == 7 and due_date.day >= 23) or (due_date.month == 8 and due_date.day <= 22):
        print("   ✅ 驗證成功：預產期在獅子座範圍內")
    else:
        print("   ❌ 驗證失敗：預產期不在獅子座範圍內")

if __name__ == "__main__":
    test_zodiac_calculations()

