#!/usr/bin/env python3
"""
HBS 2030 - Saudi 7-Tier Document Expiry & Government Renewal Monitor
نظام الرصد الاستباقي للوثائق والإقامات والتراخيص الحكومية عبر 7 مستويات زمنية

Author: Holool Al Ghad (HBS 2030 Engine)
Scope: Iqama, Commercial Registration (CR), Qiwa Contracts, Balady License, Civil Defense
"""

import sys
import json
from datetime import datetime, date

class SaudiDocumentExpiryMonitor:
    # 7 Levels Definition
    LEVELS = [
        {"id": "L1", "min_days": 120, "max_days": 9999, "label": "مستقر وممتد", "color": "green", "action": "لا يتطلب إجراء"},
        {"id": "L2", "min_days": 90, "max_days": 119, "label": "رصد مبكر", "color": "emerald", "action": "إدراج في ميزانية الربع القادم"},
        {"id": "L3", "min_days": 60, "max_days": 89, "label": "تجهيز المخصصات", "color": "sky", "action": "تأكيد مخصصات سداد"},
        {"id": "L4", "min_days": 30, "max_days": 59, "label": "إشعار التجديد", "color": "amber", "action": "بدء إجراءات التجديد في مقيم/قوى"},
        {"id": "L5", "min_days": 15, "max_days": 29, "label": "تنبيه مرتفع", "color": "orange", "action": "سداد فوري ومتابعة توثيق العقد"},
        {"id": "L6", "min_days": 1, "max_days": 14, "label": "حرج جداً (داهم)", "color": "rose", "action": "تدخل مباشر لتجنب تجميد الحسابات"},
        {"id": "L7", "min_days": -9999, "max_days": 0, "label": "منتهي (مخالفة)", "color": "red", "action": "سداد الغرامة وتصحيح الوضع فوراً"}
    ]

    # Standard Government Fees in SAR (approximate statutory baseline)
    FEE_SCHEDULE = {
        "iqama_annual_fee": 650.0,
        "maktab_amal_levy_monthly": 800.0,  # 9600 SAR/year for excess expat
        "commercial_registration_annual": 200.0,
        "chamber_of_commerce": 500.0,
        "balady_license_sqm_base": 1200.0,
        "civil_defense_permit": 800.0
    }

    @classmethod
    def evaluate_document(cls, doc_type: str, doc_name: str, owner_name: str, expiry_date_str: str, 
                          is_expatriate_iqama: bool = False, dependent_count: int = 0) -> dict:
        """
        Evaluates a document against current reference date.
        """
        today = date.today()
        exp_date = datetime.strptime(expiry_date_str, "%Y-%m-%d").date()
        days_remaining = (exp_date - today).days

        # Classify into Level
        matched_level = cls.LEVELS[-1]
        for lvl in cls.LEVELS:
            if lvl["min_days"] <= days_remaining <= lvl["max_days"]:
                matched_level = lvl
                break

        # Calculate estimated government cost
        est_cost = 0.0
        if is_expatriate_iqama:
            # Jawazat 650 + Maktab Amal (9600 SAR/year) + Dependents (400 SAR/month/dep)
            est_cost = cls.FEE_SCHEDULE["iqama_annual_fee"] + (cls.FEE_SCHEDULE["maktab_amal_levy_monthly"] * 12) + (dependent_count * 4800.0)
        elif "سجل تجاري" in doc_type or "CR" in doc_type:
            est_cost = cls.FEE_SCHEDULE["commercial_registration_annual"] + cls.FEE_SCHEDULE["chamber_of_commerce"]
        elif "بلدي" in doc_type or "Balady" in doc_type:
            est_cost = cls.FEE_SCHEDULE["balady_license_sqm_base"]
        elif "دفاع مدني" in doc_type or "Civil" in doc_type:
            est_cost = cls.FEE_SCHEDULE["civil_defense_permit"]

        return {
            "doc_type": doc_type,
            "doc_name": doc_name,
            "owner_name": owner_name,
            "expiry_date": str(exp_date),
            "days_remaining": days_remaining,
            "level_id": matched_level["id"],
            "level_label": matched_level["label"],
            "urgency_color": matched_level["color"],
            "recommended_action": matched_level["action"],
            "is_expired": days_remaining <= 0,
            "estimated_renewal_cost_sar": est_cost
        }


def scan_demo_workforce():
    print("=================================================================")
    print(" HBS 2030 - 7-Tier Document & Government Expiry Monitor Scan")
    print("=================================================================")

    sample_docs = [
        ("إقامة عمل", "إقامة مهندس نظم", "م. أحمد الشربيني", "2026-09-12", True, 2),
        ("إقامة عمل", "إقامة مستشار مالي", "أ. حازم رضوان", "2026-10-05", True, 0),
        ("سجل تجاري", "السجل التجاري الرئيسي", "شركة حلول الغد", "2026-11-20", False, 0),
        ("رخصة بلدي", "رخصة المقر الرئيسي - الرياض", "مبنى الإدارة العامة", "2026-09-02", False, 0),
        ("عقد قوى", "عقد عمل موثق", "م. خالد القحطاني", "2027-02-15", False, 0),
        ("تصريح دفاع مدني", "شهادة سلامة المبنى", "فرع جدة", "2026-08-25", False, 0), # Expired or Critical
    ]

    results = []
    for doc in sample_docs:
        res = SaudiDocumentExpiryMonitor.evaluate_document(doc[0], doc[1], doc[2], doc[3], doc[4], doc[5])
        results.append(res)
        status_symbol = "⚠️" if res["days_remaining"] < 30 else ("🔴" if res["is_expired"] else "🟢")
        print(f"\n{status_symbol} [{res['level_id']}] {res['doc_name']} ({res['owner_name']})")
        print(f"    تاريخ الانتهاء: {res['expiry_date']} | المتبقي: {res['days_remaining']} يوماً")
        print(f"    الحالة: {res['level_label']} | الإجراء: {res['recommended_action']}")
        if res['estimated_renewal_cost_sar'] > 0:
            print(f"    تكلفة التجديد التقديرية (سداد): {res['estimated_renewal_cost_sar']:,.2f} ر.س")

    print("\n=================================================================")


if __name__ == "__main__":
    scan_demo_workforce()
