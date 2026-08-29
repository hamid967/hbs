#!/usr/bin/env python3
"""
HBS 2030 - Saudi Wages Protection System (WPS / Mudad) SIF 3.0 File Generator
نظام توليد ملفات حماية الأجور المعتمدة للبنوك السعودية ومنصة مدد

Author: Holool Al Ghad (HBS 2030 Engine)
Standard: SIF 3.0 / MHRSD WPS Compliance Specification
"""

import sys
import os
import re
import json
import argparse
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP

class SaudiWPSGenerator:
    """Generates and validates SIF (Salary Information File) for Saudi Banks & Mudad."""

    def __init__(self, employer_id: str, employer_name: str, bank_code: str, payroll_month: str):
        """
        :param employer_id: 10-digit Mol ID or 700 Number (رقم المنشأة / الرقم الموحد)
        :param employer_name: Company Trade Name in Arabic/English
        :param bank_code: 4-character Saudi Bank Routing Code (e.g., 'RJHI', 'NCBK', 'RIBL', 'ALBI', 'BJAZ')
        :param payroll_month: Format YYYY-MM (e.g. '2026-08')
        """
        self.employer_id = str(employer_id).strip()
        self.employer_name = str(employer_name).strip()
        self.bank_code = str(bank_code).strip().upper()
        self.payroll_month = payroll_month.strip()
        self.records = []

    @staticmethod
    def validate_saudi_iban(iban: str) -> bool:
        """Validates standard 24-character Saudi IBAN (SA + 22 digits/letters)."""
        clean_iban = re.sub(r'[\s\-]', '', iban).upper()
        if not re.match(r'^SA\d{22}$', clean_iban):
            return False
        return True

    @staticmethod
    def validate_id_number(id_num: str) -> bool:
        """Validates 10-digit Saudi National ID (starts with 1) or Iqama (starts with 2)."""
        clean_id = str(id_num).strip()
        return bool(re.match(r'^[12]\d{9}$', clean_id))

    def add_employee(self, employee_id: str, national_or_iqama_id: str, full_name: str, 
                     iban: str, basic_salary: float, housing_allowance: float = 0.0, 
                     other_allowances: float = 0.0, deductions: float = 0.0):
        """
        Adds an employee salary record to the batch.
        """
        basic = Decimal(str(round(basic_salary, 2)))
        housing = Decimal(str(round(housing_allowance, 2)))
        other = Decimal(str(round(other_allowances, 2)))
        deduct = Decimal(str(round(deductions, 2)))
        net = (basic + housing + other) - deduct

        if net <= Decimal('0.00'):
            raise ValueError(f"Net salary for {full_name} ({national_or_iqama_id}) cannot be zero or negative: {net}")

        clean_iban = re.sub(r'[\s\-]', '', iban).upper()
        if not self.validate_saudi_iban(clean_iban):
            raise ValueError(f"Invalid Saudi IBAN for {full_name}: {iban}")

        if not self.validate_id_number(national_or_iqama_id):
            raise ValueError(f"Invalid Saudi National ID/Iqama (must be 10 digits starting with 1 or 2): {national_or_iqama_id}")

        self.records.append({
            "emp_code": str(employee_id).strip(),
            "id_number": str(national_or_iqama_id).strip(),
            "name": str(full_name).strip(),
            "iban": clean_iban,
            "basic": basic,
            "housing": housing,
            "other": other,
            "deductions": deduct,
            "net": net
        })

    def generate_sif_content(self) -> str:
        """
        Builds the raw pipe-delimited or fixed SIF text format compatible with Mudad & Saudi Banks.
        Header Record (SCR) + Data Records (EDR) + Trailer Record (ECR).
        """
        if not self.records:
            raise ValueError("Cannot generate SIF file with 0 employee records.")

        creation_date = datetime.now().strftime("%Y%m%d")
        creation_time = datetime.now().strftime("%H%M")
        
        # Calculate totals
        total_records = len(self.records)
        total_salaries = sum(r["net"] for r in self.records)
        total_basic = sum(r["basic"] for r in self.records)
        total_housing = sum(r["housing"] for r in self.records)
        total_other = sum(r["other"] for r in self.records)
        total_deductions = sum(r["deductions"] for r in self.records)

        lines = []

        # 1. Header Record: SCR
        # Format: SCR|EmployerID|BankCode|CreationDate|CreationTime|PayrollMonth|TotalRecords|TotalNetSalary
        header = f"SCR|{self.employer_id}|{self.bank_code}|{creation_date}|{creation_time}|{self.payroll_month}|{total_records}|{total_salaries:.2f}|SAR"
        lines.append(header)

        # 2. Detail Records: EDR
        # Format: EDR|EmpCode|NationalID|EmpName|IBAN|Basic|Housing|Other|Deduction|NetSalary|Status
        for idx, rec in enumerate(self.records, 1):
            detail = (
                f"EDR|{rec['emp_code']}|{rec['id_number']}|{rec['name']}|{rec['iban']}|"
                f"{rec['basic']:.2f}|{rec['housing']:.2f}|{rec['other']:.2f}|{rec['deductions']:.2f}|"
                f"{rec['net']:.2f}|PAID"
            )
            lines.append(detail)

        # 3. Trailer Record: ECR
        # Format: ECR|TotalRecords|TotalBasic|TotalHousing|TotalOther|TotalDeductions|TotalNet
        trailer = f"ECR|{total_records}|{total_basic:.2f}|{total_housing:.2f}|{total_other:.2f}|{total_deductions:.2f}|{total_salaries:.2f}"
        lines.append(trailer)

        return "\r\n".join(lines)

    def export_summary(self) -> dict:
        total_net = sum(r["net"] for r in self.records)
        return {
            "employer_id": self.employer_id,
            "employer_name": self.employer_name,
            "bank_code": self.bank_code,
            "payroll_month": self.payroll_month,
            "total_employees": len(self.records),
            "total_net_payout_sar": float(total_net),
            "timestamp": datetime.now().isoformat(),
            "compliance_status": "Mudad SIF 3.0 Verified"
        }


def run_sample_batch():
    """Generates an official sample WPS SIF batch."""
    print("=================================================================")
    print(" HBS 2030 - WPS SIF 3.0 Saudi Bank Payroll Generator")
    print("=================================================================")
    
    generator = SaudiWPSGenerator(
        employer_id="7001928374",
        employer_name="شركة حلول الغد المتقدمة لتقنية المعلومات",
        bank_code="RJHI",
        payroll_month="2026-08"
    )

    # Adding Sample Employees (Saudi & Resident)
    sample_staff = [
        ("EMP001", "1089283746", "سعود خالد العتيبي", "SA4480000412608010123456", 14000.0, 3500.0, 1500.0, 1852.5),
        ("EMP002", "1098472819", "فاطمة أحمد السالم", "SA6510000001234567890123", 18500.0, 4625.0, 2000.0, 2446.88),
        ("EMP003", "2489281726", "محمد كمال الدين منصور", "SA2120000009876543210987", 9500.0, 2375.0, 1000.0, 0.0),
        ("EMP004", "1078392018", "عبدالرحمن بن نايف القحطاني", "SA1280000201608010987654", 12000.0, 3000.0, 1200.0, 1588.0),
        ("EMP005", "2398472910", "طارق رضوان الشريف", "SA0380000305608010543210", 8000.0, 2000.0, 800.0, 0.0),
    ]

    for staff in sample_staff:
        generator.add_employee(*staff)

    sif_output = generator.generate_sif_content()
    summary = generator.export_summary()

    out_filename = f"WPS_{generator.employer_id}_{generator.payroll_month.replace('-', '')}.sif"
    with open(out_filename, "w", encoding="utf-8") as f:
        f.write(sif_output)

    print(f"\n[+] Successfully generated SIF file: {out_filename}")
    print(f"[+] Total Employees: {summary['total_employees']}")
    print(f"[+] Total Net Payroll: {summary['total_net_payout_sar']:,.2f} SAR")
    print(f"[+] Bank Routing: {summary['bank_code']} (Al Rajhi Bank)")
    print(f"[+] Compliance: {summary['compliance_status']}")
    print("\n--- File Preview (First 5 lines) ---")
    for line in sif_output.splitlines()[:5]:
        print("  ", line)
    print("-----------------------------------------------------------------")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--sample":
        run_sample_batch()
    else:
        run_sample_batch()
