#!/usr/bin/env python3
"""
HBS 2030 - Saudi GOSI (General Organization for Social Insurance) Calculation Engine
محرك احتساب اشتراكات التأمينات الاجتماعية وساند والأخطار المهنية

Author: Holool Al Ghad (HBS 2030 Engine)
Legal Reference: Saudi Social Insurance Law & SANED Royal Decrees
"""

import sys
import json
from decimal import Decimal, ROUND_HALF_UP

class SaudiGOSICalculator:
    # GOSI Parameters
    MAX_CONTRIBUTION_SALARY = Decimal('45000.00')  # الحد الأقصى للأجر الخاضع للاشتراك
    MIN_SAUDI_GOSI_SALARY = Decimal('1500.00')     # الحد الأدنى للنظام
    NITAQAT_FULL_WEIGHT_SALARY = Decimal('4000.00') # الحد الأدنى لاحتساب نقطة توطين كاملة

    # Saudi Citizen Rates
    SAUDI_ANNUITIES_EMP_RATE = Decimal('0.09')    # معاشات (الموظف) 9%
    SAUDI_ANNUITIES_ORG_RATE = Decimal('0.09')    # معاشات (المنشأة) 9%
    SAUDI_SANED_EMP_RATE = Decimal('0.0075')       # ساند (الموظف) 0.75%
    SAUDI_SANED_ORG_RATE = Decimal('0.0075')       # ساند (المنشأة) 0.75%
    HAZARDS_ORG_RATE = Decimal('0.02')             # أخطار مهنية (المنشأة) 2%

    @classmethod
    def calculate_employee_gosi(cls, is_saudi: bool, basic_salary: float, housing_allowance: float = 0.0) -> dict:
        """
        Calculates exact GOSI deductions and employer contributions for a single employee.
        :param is_saudi: True if Saudi national, False for Expatriate/Resident.
        :param basic_salary: Monthly Basic Salary in SAR.
        :param housing_allowance: Monthly Housing Allowance in SAR.
        """
        raw_basic = Decimal(str(round(basic_salary, 2)))
        raw_housing = Decimal(str(round(housing_allowance, 2)))
        
        # GOSI subject wage = Basic + Housing Allowance
        subject_wage = raw_basic + raw_housing
        
        # Cap wage to 45,000 SAR
        applicable_wage = min(subject_wage, cls.MAX_CONTRIBUTION_SALARY)

        if is_saudi:
            emp_annuities = (applicable_wage * cls.SAUDI_ANNUITIES_EMP_RATE).quantize(Decimal('.01'), rounding=ROUND_HALF_UP)
            org_annuities = (applicable_wage * cls.SAUDI_ANNUITIES_ORG_RATE).quantize(Decimal('.01'), rounding=ROUND_HALF_UP)
            
            emp_saned = (applicable_wage * cls.SAUDI_SANED_EMP_RATE).quantize(Decimal('.01'), rounding=ROUND_HALF_UP)
            org_saned = (applicable_wage * cls.SAUDI_SANED_ORG_RATE).quantize(Decimal('.01'), rounding=ROUND_HALF_UP)
            
            org_hazards = (applicable_wage * cls.HAZARDS_ORG_RATE).quantize(Decimal('.01'), rounding=ROUND_HALF_UP)
            
            total_emp_deduction = emp_annuities + emp_saned
            total_org_contribution = org_annuities + org_saned + org_hazards
            total_gosi_pool = total_emp_deduction + total_org_contribution

            nitaqat_weight = 1.0 if subject_wage >= cls.NITAQAT_FULL_WEIGHT_SALARY else (
                0.5 if subject_wage >= Decimal('3000.00') else 0.0
            )

            return {
                "nationality": "سعودي (Saudi Citizen)",
                "is_saudi": True,
                "basic_salary": float(raw_basic),
                "housing_allowance": float(raw_housing),
                "subject_wage": float(applicable_wage),
                "is_capped": subject_wage > cls.MAX_CONTRIBUTION_SALARY,
                "employee_deduction": {
                    "annuities_9pct": float(emp_annuities),
                    "saned_0_75pct": float(emp_saned),
                    "total_employee_deduction": float(total_emp_deduction),
                    "effective_pct": "9.75%"
                },
                "employer_contribution": {
                    "annuities_9pct": float(org_annuities),
                    "saned_0_75pct": float(org_saned),
                    "occupational_hazards_2pct": float(org_hazards),
                    "total_employer_contribution": float(total_org_contribution),
                    "effective_pct": "11.75%"
                },
                "total_gosi_transfer": float(total_gosi_pool),
                "total_effective_rate": "21.50%",
                "nitaqat_point_weight": nitaqat_weight
            }
        else:
            # Expatriates: Only 2% Occupational Hazards borne by Employer
            org_hazards = (applicable_wage * cls.HAZARDS_ORG_RATE).quantize(Decimal('.01'), rounding=ROUND_HALF_UP)
            
            return {
                "nationality": "مقيم / غير سعودي (Resident Expatriate)",
                "is_saudi": False,
                "basic_salary": float(raw_basic),
                "housing_allowance": float(raw_housing),
                "subject_wage": float(applicable_wage),
                "is_capped": subject_wage > cls.MAX_CONTRIBUTION_SALARY,
                "employee_deduction": {
                    "annuities_9pct": 0.0,
                    "saned_0_75pct": 0.0,
                    "total_employee_deduction": 0.0,
                    "effective_pct": "0.00%"
                },
                "employer_contribution": {
                    "annuities_9pct": 0.0,
                    "saned_0_75pct": 0.0,
                    "occupational_hazards_2pct": float(org_hazards),
                    "total_employer_contribution": float(org_hazards),
                    "effective_pct": "2.00%"
                },
                "total_gosi_transfer": float(org_hazards),
                "total_effective_rate": "2.00%",
                "nitaqat_point_weight": 0.0
            }


def test_suite():
    print("=================================================================")
    print(" HBS 2030 - Saudi GOSI & SANED Contribution Benchmark")
    print("=================================================================")
    
    calc = SaudiGOSICalculator()
    
    # Test Cases
    cases = [
        ("سعودي - راتب متوسط", True, 10000, 2500),
        ("سعودي - الحد الأقصى (Capped)", True, 42000, 10500),
        ("مقيم - مهندس برمجيات", False, 12000, 3000),
        ("سعودي - راتب جزئي دون 4000", True, 3500, 0),
    ]

    for label, is_saudi, basic, housing in cases:
        res = calc.calculate_employee_gosi(is_saudi, basic, housing)
        print(f"\n[Case]: {label}")
        print(f"  - الراتب الخاضع للاشتراك: {res['subject_wage']:,.2f} ر.س {'(سقف 45 ألف)' if res['is_capped'] else ''}")
        print(f"  - خصم الموظف ({res['employee_deduction']['effective_pct']}): {res['employee_deduction']['total_employee_deduction']:,.2f} ر.س")
        print(f"  - مساهمة المنشأة ({res['employer_contribution']['effective_pct']}): {res['employer_contribution']['total_employer_contribution']:,.2f} ر.س")
        print(f"  - إجمالي سداد التأمينات الشهري: {res['total_gosi_transfer']:,.2f} ر.س ({res['total_effective_rate']})")
        if is_saudi:
            print(f"  - وزن نقطة نطاقات (التوطين): {res['nitaqat_point_weight']} نقطة")

    print("\n=================================================================")

if __name__ == "__main__":
    test_suite()
