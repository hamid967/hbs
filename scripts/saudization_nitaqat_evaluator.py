#!/usr/bin/env python3
"""
HBS 2030 - Saudi Nitaqat & Saudization Optimizer (نطاقات وقوى التوطين)
محاكي ومحسّن نسب التوطين ونطاقات وفق معايير وزارة الموارد البشرية

Author: Holool Al Ghad (HBS 2030 Engine)
Scope: Sector formulas, Special weights (Disability, Part-time), Threshold Simulation
"""

import sys
import json
from decimal import Decimal, ROUND_HALF_UP

class SaudiNitaqatEvaluator:
    # Sector Nitaqat Thresholds for Medium-to-Large Enterprises (approx. MHRSD matrix)
    SECTOR_THRESHOLDS = {
        "tech": {
            "name": "تقنية المعلومات والاتصالات",
            "red_max": 15.0,
            "low_green_max": 25.0,
            "mid_green_max": 40.0,
            "high_green_max": 60.0,
            "platinum_min": 60.01
        },
        "contracting": {
            "name": "التشييد والبناء والمقاولات",
            "red_max": 6.0,
            "low_green_max": 12.0,
            "mid_green_max": 18.0,
            "high_green_max": 25.0,
            "platinum_min": 25.01
        },
        "retail": {
            "name": "التجارة والتجزئة",
            "red_max": 20.0,
            "low_green_max": 35.0,
            "mid_green_max": 50.0,
            "high_green_max": 70.0,
            "platinum_min": 70.01
        },
        "finance": {
            "name": "الخدمات المالية والتأمين",
            "red_max": 40.0,
            "low_green_max": 60.0,
            "mid_green_max": 75.0,
            "high_green_max": 85.0,
            "platinum_min": 85.01
        },
        "manufacturing": {
            "name": "الصناعة والتعدين",
            "red_max": 10.0,
            "low_green_max": 20.0,
            "mid_green_max": 30.0,
            "high_green_max": 45.0,
            "platinum_min": 45.01
        }
    }

    @classmethod
    def evaluate(cls, sector_key: str, full_time_saudis: int, part_time_saudis: int, 
                 disabled_saudis: int, expats_count: int) -> dict:
        """
        Calculates exact Nitaqat score and points.
        :param disabled_saudis: Each counts as 4.0 points (subject to 10% cap of total Saudis)
        :param part_time_saudis: Each counts as 0.5 points
        """
        sector = cls.SECTOR_THRESHOLDS.get(sector_key, cls.SECTOR_THRESHOLDS["tech"])
        
        raw_saudis_count = full_time_saudis + part_time_saudis + disabled_saudis
        total_workforce_headcount = raw_saudis_count + expats_count

        if total_workforce_headcount == 0:
            return {"error": "Workforce cannot be 0."}

        # Calculate Disability weight with MHRSD 10% maximum rule
        max_disabled_allowed = max(1, int(raw_saudis_count * 0.10)) if raw_saudis_count > 0 else 0
        credited_disabled_4x = min(disabled_saudis, max_disabled_allowed)
        excess_disabled = disabled_saudis - credited_disabled_4x

        saudi_points = (
            (full_time_saudis * 1.0) +
            (part_time_saudis * 0.5) +
            (credited_disabled_4x * 4.0) +
            (excess_disabled * 1.0)
        )

        effective_saudization_pct = (saudi_points / total_workforce_headcount) * 100.0

        # Classify Nitaqat Band
        if effective_saudization_pct < sector["red_max"]:
            tier = "النطاق الأحمر (Red - Non-compliant)"
            tier_color = "red"
            status = "حرج - إيقاف خدمات قوى وتأشيرات العمل"
        elif effective_saudization_pct < sector["low_green_max"]:
            tier = "النطاق الأخضر المنخفض (Low Green)"
            tier_color = "yellow"
            status = "مقبول جزئياً - لا يمكن طلب تأشيرات جديدة"
        elif effective_saudization_pct < sector["mid_green_max"]:
            tier = "النطاق الأخضر المتوسط (Mid Green)"
            tier_color = "emerald"
            status = "آمن - يحق إصدار تأشيرات محدودة ونقل كفالة"
        elif effective_saudization_pct < sector["high_green_max"]:
            tier = "النطاق الأخضر المرتفع (High Green)"
            tier_color = "teal"
            status = "ممتاز - أولوية في المعاملات والتأشيرات الفورية"
        else:
            tier = "النطاق البلاتيني (Platinum)"
            tier_color = "gold"
            status = "امتياز سيادي - تسهيلات حكومية كاملة وتأشيرات فورية"

        # Calculate Saudis needed to reach Platinum
        target_plat_pct = sector["platinum_min"] / 100.0
        # required_points / total >= target
        # (points + x) / (total + x) >= target
        # points + x >= target*total + target*x => x(1 - target) >= target*total - points
        saudis_to_platinum = 0
        if effective_saudization_pct < sector["platinum_min"]:
            needed_numerator = (target_plat_pct * total_workforce_headcount) - saudi_points
            needed_denominator = 1.0 - target_plat_pct
            if needed_denominator > 0:
                saudis_to_platinum = max(1, int((needed_numerator / needed_denominator) + 0.999))

        return {
            "sector": sector["name"],
            "headcount": {
                "total_workforce": total_workforce_headcount,
                "saudis_headcount": raw_saudis_count,
                "expats_headcount": expats_count,
            },
            "points_breakdown": {
                "full_time_saudis_points": full_time_saudis * 1.0,
                "part_time_points": part_time_saudis * 0.5,
                "special_needs_points": (credited_disabled_4x * 4.0) + (excess_disabled * 1.0),
                "total_saudi_points": saudi_points
            },
            "saudization_rate_pct": round(effective_saudization_pct, 2),
            "nitaqat_tier": tier,
            "operational_status": status,
            "saudis_needed_for_platinum": saudis_to_platinum
        }


def run_benchmark():
    print("=================================================================")
    print(" HBS 2030 - Saudi Nitaqat & Workforce Saudization Evaluator")
    print("=================================================================")
    
    test_org = SaudiNitaqatEvaluator.evaluate(
        sector_key="tech",
        full_time_saudis=45,
        part_time_saudis=6,
        disabled_saudis=2,
        expats_count=20
    )

    print(f"\n[القطاع]: {test_org['sector']}")
    print(f"  - إجمالي القوى العاملة: {test_org['headcount']['total_workforce']} موظفاً (سعوديين: {test_org['headcount']['saudis_headcount']} | مقيمين: {test_org['headcount']['expats_headcount']})")
    print(f"  - نقاط التوطين المحتسبة: {test_org['points_breakdown']['total_saudi_points']} نقطة")
    print(f"  - نسبة التوطين الفعلية: {test_org['saudization_rate_pct']}%")
    print(f"  - النطاق المحقق: {test_org['nitaqat_tier']}")
    print(f"  - الحالة والامتيازات: {test_org['operational_status']}")
    print(f"  - عدد الكفاءات الوطنية المطلوبة للبلاتيني: {test_org['saudis_needed_for_platinum']} موظفاً")

    print("\n=================================================================")


if __name__ == "__main__":
    run_benchmark()
