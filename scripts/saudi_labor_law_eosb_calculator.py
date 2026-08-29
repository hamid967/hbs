#!/usr/bin/env python3
"""
HBS 2030 - Saudi Labor Law End of Service Benefits (EOSB) Calculator
محرك احتساب مكافأة نهاية الخدمة وفق المادتين (84) و(85) من نظام العمل السعودي

Author: Holool Al Ghad (HBS 2030 Engine)
Reference: Articles 84, 85, 87 & 88 - Royal Decree No. M/51
"""

import sys
from datetime import datetime, date
from decimal import Decimal, ROUND_HALF_UP

class SaudiEOSBCalculator:
    """Calculates Saudi End of Service Award with day-by-day precision."""

    @classmethod
    def calculate_eosb(cls, start_date_str: str, end_date_str: str, last_wage: float, 
                       reason: str = "termination", unpaid_leave_days: int = 0) -> dict:
        """
        :param start_date_str: YYYY-MM-DD (e.g. 2021-03-01)
        :param end_date_str: YYYY-MM-DD (e.g. 2026-08-30)
        :param last_wage: Last Actual Wage (Basic + Housing + regular monthly allowances)
        :param reason: 'termination' (إنهاء/انتهاء عقد), 'resignation' (استقالة), 'force_majeure' (قوة قاهرة / زواج / وضع)
        :param unpaid_leave_days: Days of unpaid leave to deduct from tenure.
        """
        d_start = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        d_end = datetime.strptime(end_date_str, "%Y-%m-%d").date()

        if d_end <= d_start:
            raise ValueError("End date must be after start date.")

        total_days = (d_end - d_start).days - unpaid_leave_days
        if total_days <= 0:
            return {"error": "Net active service days cannot be zero."}

        # Calculate exact service years in floating point and breakdown
        service_years = Decimal(str(total_days)) / Decimal('365.25')
        
        # Breakdown years, months, days
        years = int(total_days // 365.25)
        remaining_days = total_days - int(years * 365.25)
        months = int(remaining_days // 30.4375)
        days = int(remaining_days - int(months * 30.4375))

        wage = Decimal(str(round(last_wage, 2)))

        # 1. Base Calculation (Article 84)
        # First 5 years = half month per year
        # Years beyond 5 = full month per year
        if service_years <= Decimal('5.0'):
            base_award = (wage * Decimal('0.5') * service_years)
            bracket_1_years = service_years
            bracket_2_years = Decimal('0.0')
        else:
            bracket_1_years = Decimal('5.0')
            bracket_2_years = service_years - Decimal('5.0')
            base_award = (wage * Decimal('0.5') * Decimal('5.0')) + (wage * Decimal('1.0') * bracket_2_years)

        base_award = base_award.quantize(Decimal('.01'), rounding=ROUND_HALF_UP)

        # 2. Entitlement Multiplier based on Termination Reason (Article 85 / 87)
        reason_label = ""
        multiplier_ratio = Decimal('1.0')
        article_applied = "المادة 84 (استحقاق كامل)"

        if reason == "resignation":
            article_applied = "المادة 85 (استقالة الموظف)"
            if service_years < Decimal('2.0'):
                multiplier_ratio = Decimal('0.0')
                reason_label = "استقالة قبل إكمال سنتين (لا يستحق مكافأة)"
            elif service_years <= Decimal('5.0'):
                multiplier_ratio = Decimal('1.0') / Decimal('3.0')
                reason_label = "استقالة بين سنتين و5 سنوات (ثلث المكافأة - 33.33%)"
            elif service_years <= Decimal('10.0'):
                multiplier_ratio = Decimal('2.0') / Decimal('3.0')
                reason_label = "استقالة بين 5 و10 سنوات (ثلثا المكافأة - 66.66%)"
            else:
                multiplier_ratio = Decimal('1.0')
                reason_label = "استقالة بعد إكمال 10 سنوات (استحقاق كامل 100%)"
        elif reason == "force_majeure":
            article_applied = "المادة 87 (استثناءات نظامية / قوة قاهرة)"
            multiplier_ratio = Decimal('1.0')
            reason_label = "استحقاق كامل استناداً للمادة 87"
        else:
            article_applied = "المادة 84 (إنهاء من المنشأة أو انتهاء العقد محدد المدة)"
            multiplier_ratio = Decimal('1.0')
            reason_label = "استحقاق كامل 100%"

        final_award = (base_award * multiplier_ratio).quantize(Decimal('.01'), rounding=ROUND_HALF_UP)

        return {
            "start_date": str(d_start),
            "end_date": str(d_end),
            "last_monthly_wage": float(wage),
            "total_active_days": total_days,
            "service_tenure_formatted": f"{years} سنة و {months} شهر و {days} يوم",
            "service_years_decimal": float(round(service_years, 3)),
            "applied_article": article_applied,
            "reason_summary": reason_label,
            "article_84_full_value_sar": float(base_award),
            "entitlement_percentage": f"{float(multiplier_ratio * 100):.1f}%",
            "final_payable_award_sar": float(final_award),
            "calculation_formula": f"(السنوات الأولى ≤ 5 × 0.5 راتب) + (السنوات > 5 × 1.0 راتب) × {float(multiplier_ratio * 100):.1f}%"
        }


def benchmark():
    print("=================================================================")
    print(" HBS 2030 - Saudi Labor Law EOSB End-of-Service Benchmark")
    print("=================================================================")
    
    test_cases = [
        ("إنهاء عقد بعد 7 سنوات وراتب 12,000", "2019-08-01", "2026-08-01", 12000, "termination"),
        ("استقالة بعد 3.5 سنوات وراتب 15,000", "2023-01-01", "2026-07-01", 15000, "resignation"),
        ("استقالة بعد 8 سنوات وراتب 20,000", "2018-08-01", "2026-08-01", 20000, "resignation"),
        ("استقالة بعد 12 سنة وراتب 25,000", "2014-08-01", "2026-08-01", 25000, "resignation"),
    ]

    for label, s_date, e_date, wage, reason in test_cases:
        res = SaudiEOSBCalculator.calculate_eosb(s_date, e_date, wage, reason)
        print(f"\n[الحالة]: {label}")
        print(f"  - مدة الخدمة: {res['service_tenure_formatted']} ({res['service_years_decimal']} سنة)")
        print(f"  - السند القانوني: {res['applied_article']}")
        print(f"  - نسبة الاستحقاق: {res['entitlement_percentage']} ({res['reason_summary']})")
        print(f"  - قيمة المكافأة النهائية المستحقة: {res['final_payable_award_sar']:,.2f} ر.س")

    print("\n=================================================================")

if __name__ == "__main__":
    benchmark()
