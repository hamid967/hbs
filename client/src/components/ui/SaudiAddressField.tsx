import * as React from "react";
import { Building2, MapPin, Navigation, Hash, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface SaudiAddressValue {
  city: string;
  district: string;
  street: string;
  postalCode: string;
  additionalNumber?: string;
  buildingNumber?: string;
  shortAddress?: string;
}

export interface SaudiAddressFieldProps {
  id?: string;
  value?: Partial<SaudiAddressValue>;
  onChange?: (address: SaudiAddressValue) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  error?: string;
  showNationalAddressDetails?: boolean;
  defaultCity?: string;
}

// Major Saudi Cities for Quick Selection
export const SAUDI_CITIES = [
  "الرياض",
  "جدة",
  "مكة المكرمة",
  "المدينة المنورة",
  "الدمام",
  "الخبر",
  "الظهران",
  "الأحساء",
  "الجبيل",
  "الطائف",
  "تبوك",
  "بريدة",
  "عنيزة",
  "أبها",
  "خميس مشيط",
  "جازان",
  "نجران",
  "حائل",
  "عرعر",
  "سكاكا",
  "ينبع",
  "حفر الباطن",
  "الخرج",
] as const;

/**
 * Validates Saudi 5-digit Postal Code format.
 * Format: Exactly 5 numeric digits (Range: 10000 - 99999).
 */
export function isValidSaudiPostalCode(postalCode: string): boolean {
  if (!postalCode) return false;
  const cleanCode = postalCode.trim();
  return /^[1-9]\d{4}$/.test(cleanCode);
}

/**
 * Validates Saudi 4-digit Additional Number format.
 * Format: Exactly 4 numeric digits.
 */
export function isValidSaudiAdditionalNumber(additionalNumber?: string): boolean {
  if (!additionalNumber) return true; // Optional field
  return /^\d{4}$/.test(additionalNumber.trim());
}

/**
 * Validates Saudi 4-digit Building Number format.
 * Format: Exactly 4 numeric digits.
 */
export function isValidSaudiBuildingNumber(buildingNumber?: string): boolean {
  if (!buildingNumber) return true; // Optional field
  return /^\d{4}$/.test(buildingNumber.trim());
}

export function SaudiAddressField({
  id = "saudi-address",
  value = {},
  onChange,
  disabled = false,
  required = false,
  className,
  error,
  showNationalAddressDetails = true,
  defaultCity = "الرياض",
}: SaudiAddressFieldProps) {
  const [address, setAddress] = React.useState<SaudiAddressValue>({
    city: value.city || defaultCity,
    district: value.district || "",
    street: value.street || "",
    postalCode: value.postalCode || "",
    additionalNumber: value.additionalNumber || "",
    buildingNumber: value.buildingNumber || "",
    shortAddress: value.shortAddress || "",
  });

  const [touched, setTouched] = React.useState<{ [K in keyof SaudiAddressValue]?: boolean }>({});

  React.useEffect(() => {
    if (value) {
      setAddress((prev) => ({
        city: value.city !== undefined ? value.city : prev.city,
        district: value.district !== undefined ? value.district : prev.district,
        street: value.street !== undefined ? value.street : prev.street,
        postalCode: value.postalCode !== undefined ? value.postalCode : prev.postalCode,
        additionalNumber: value.additionalNumber !== undefined ? value.additionalNumber : prev.additionalNumber,
        buildingNumber: value.buildingNumber !== undefined ? value.buildingNumber : prev.buildingNumber,
        shortAddress: value.shortAddress !== undefined ? value.shortAddress : prev.shortAddress,
      }));
    }
  }, [value]);

  const updateField = (field: keyof SaudiAddressValue, val: string) => {
    const updated = { ...address, [field]: val };
    setAddress(updated);
    onChange?.(updated);
  };

  const handleBlur = (field: keyof SaudiAddressValue) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isCustomCity = !SAUDI_CITIES.includes(address.city as any) && address.city !== "";
  const isPostalCodeValid = !address.postalCode || isValidSaudiPostalCode(address.postalCode);
  const isAdditionalNumValid = isValidSaudiAdditionalNumber(address.additionalNumber);
  const isBuildingNumValid = isValidSaudiBuildingNumber(address.buildingNumber);

  return (
    <div
      id={id}
      dir="rtl"
      className={cn(
        "space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5",
        error ? "border-rose-300 ring-1 ring-rose-200" : "border-slate-200",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <MapPin className="size-5" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              العنوان الوطني السعودي {required && <span className="text-rose-500">*</span>}
            </h4>
            <p className="text-xs text-slate-500">معتمد وفق الترميز البريدي لمؤسسة البريد السعودي (سبل / SPL)</p>
          </div>
        </div>

        {address.postalCode && isPostalCodeValid && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="size-3.5" />
            رمز بريدي معتمد
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* City Field */}
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-city`} className="text-xs font-bold text-slate-700">
            المدينة {required && <span className="text-rose-500">*</span>}
          </Label>
          <div className="flex gap-2">
            <Select
              disabled={disabled}
              value={isCustomCity ? "other" : address.city}
              onValueChange={(val) => {
                if (val !== "other") {
                  updateField("city", val);
                }
              }}
            >
              <SelectTrigger
                id={`${id}-city`}
                className="h-10 w-full rounded-xl border-slate-200 bg-slate-50/50 text-sm focus:border-emerald-600 focus:ring-emerald-600/20"
              >
                <SelectValue placeholder="اختر المدينة" />
              </SelectTrigger>
              <SelectContent dir="rtl" className="max-h-60 rounded-xl">
                {SAUDI_CITIES.map((c) => (
                  <SelectItem key={c} value={c} className="text-sm">
                    {c}
                  </SelectItem>
                ))}
                <SelectItem value="other" className="text-sm font-semibold text-emerald-700">
                  مدينة أخرى…
                </SelectItem>
              </SelectContent>
            </Select>

            {isCustomCity && (
              <Input
                placeholder="اسم المدينة"
                value={address.city}
                onChange={(e) => updateField("city", e.target.value)}
                disabled={disabled}
                className="h-10 w-1/2 rounded-xl border-slate-200 text-sm"
              />
            )}
          </div>
        </div>

        {/* District Field */}
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-district`} className="text-xs font-bold text-slate-700">
            الحي {required && <span className="text-rose-500">*</span>}
          </Label>
          <div className="relative">
            <Building2 className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              id={`${id}-district`}
              placeholder="مثال: حي النخيل، حي الملز"
              value={address.district}
              onChange={(e) => updateField("district", e.target.value)}
              onBlur={() => handleBlur("district")}
              disabled={disabled}
              className="h-10 rounded-xl border-slate-200 bg-slate-50/50 pr-9 text-sm focus:border-emerald-600 focus:ring-emerald-600/20"
            />
          </div>
        </div>

        {/* Street Field */}
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-street`} className="text-xs font-bold text-slate-700">
            الشارع {required && <span className="text-rose-500">*</span>}
          </Label>
          <div className="relative">
            <Navigation className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              id={`${id}-street`}
              placeholder="مثال: طريق الملك فهد، شارع العليا"
              value={address.street}
              onChange={(e) => updateField("street", e.target.value)}
              onBlur={() => handleBlur("street")}
              disabled={disabled}
              className="h-10 rounded-xl border-slate-200 bg-slate-50/50 pr-9 text-sm focus:border-emerald-600 focus:ring-emerald-600/20"
            />
          </div>
        </div>

        {/* Postal Code Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor={`${id}-postalCode`} className="text-xs font-bold text-slate-700">
              الرمز البريدي (5 أرقام) {required && <span className="text-rose-500">*</span>}
            </Label>
            <span className="text-[10px] text-slate-400 font-mono">5 Digits (SPL)</span>
          </div>
          <div className="relative">
            <Hash className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              id={`${id}-postalCode`}
              dir="ltr"
              inputMode="numeric"
              maxLength={5}
              placeholder="12345"
              value={address.postalCode}
              onChange={(e) => {
                const numericOnly = e.target.value.replace(/\D/g, "").slice(0, 5);
                updateField("postalCode", numericOnly);
              }}
              onBlur={() => handleBlur("postalCode")}
              disabled={disabled}
              className={cn(
                "h-10 rounded-xl border-slate-200 bg-slate-50/50 pr-9 text-right font-mono text-sm tracking-widest focus:border-emerald-600 focus:ring-emerald-600/20",
                touched.postalCode && address.postalCode && !isPostalCodeValid && "border-rose-300 bg-rose-50/40 text-rose-900"
              )}
            />
          </div>
          {touched.postalCode && address.postalCode && !isPostalCodeValid && (
            <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600">
              <AlertCircle className="size-3.5" />
              الرمز البريدي السعودي يتكون من 5 أرقام تبدأ من 1 إلى 9.
            </p>
          )}
        </div>
      </div>

      {/* Advanced National Address Attributes */}
      {showNationalAddressDetails && (
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
          <p className="mb-2.5 text-[11px] font-bold text-slate-700">تفاصيل العنوان الوطني الإضافية (اختياري)</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Building Number */}
            <div className="space-y-1">
              <Label htmlFor={`${id}-buildingNumber`} className="text-[11px] font-medium text-slate-600">
                رقم المبنى (4 أرقام)
              </Label>
              <Input
                id={`${id}-buildingNumber`}
                dir="ltr"
                inputMode="numeric"
                maxLength={4}
                placeholder="1234"
                value={address.buildingNumber || ""}
                onChange={(e) => {
                  const num = e.target.value.replace(/\D/g, "").slice(0, 4);
                  updateField("buildingNumber", num);
                }}
                disabled={disabled}
                className="h-9 rounded-lg border-slate-200 bg-white text-right font-mono text-xs"
              />
              {!isBuildingNumValid && (
                <span className="text-[10px] text-rose-600">يجب أن يتكون من 4 أرقام</span>
              )}
            </div>

            {/* Additional Number */}
            <div className="space-y-1">
              <Label htmlFor={`${id}-additionalNumber`} className="text-[11px] font-medium text-slate-600">
                الرقم الإضافي (4 أرقام)
              </Label>
              <Input
                id={`${id}-additionalNumber`}
                dir="ltr"
                inputMode="numeric"
                maxLength={4}
                placeholder="5678"
                value={address.additionalNumber || ""}
                onChange={(e) => {
                  const num = e.target.value.replace(/\D/g, "").slice(0, 4);
                  updateField("additionalNumber", num);
                }}
                disabled={disabled}
                className="h-9 rounded-lg border-slate-200 bg-white text-right font-mono text-xs"
              />
              {!isAdditionalNumValid && (
                <span className="text-[10px] text-rose-600">يجب أن يتكون من 4 أرقام</span>
              )}
            </div>

            {/* Short National Address Code */}
            <div className="space-y-1">
              <Label htmlFor={`${id}-shortAddress`} className="text-[11px] font-medium text-slate-600">
                العنوان المختصر (مثال: RRRD2929)
              </Label>
              <Input
                id={`${id}-shortAddress`}
                dir="ltr"
                maxLength={8}
                placeholder="RRRD2929"
                value={address.shortAddress || ""}
                onChange={(e) => updateField("shortAddress", e.target.value.toUpperCase())}
                disabled={disabled}
                className="h-9 rounded-lg border-slate-200 bg-white text-right font-mono text-xs uppercase"
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
export default SaudiAddressField;
