# SaudiAddressField Component Documentation
*HBS 2030 Design System — Saudi National Address Component Specification*

---

## 1. Overview & Purpose

The `SaudiAddressField` component is a standardized, reusable React form control tailored specifically for the Kingdom of Saudi Arabia's National Address format (العنوان الوطني السعودي), certified by Saudi Post (سبل / SPL).

It centralizes city dropdowns, district/street fields, 5-digit postal code validation, and optional SPL parameters (Building Number, Additional Number, and Short Address Code) across onboarding, employee profiles, branch setups, and government compliance workflows.

---

## 2. Component Import & Path

```tsx
import { 
  SaudiAddressField, 
  type SaudiAddressValue, 
  isValidSaudiPostalCode,
  isValidSaudiBuildingNumber,
  isValidSaudiAdditionalNumber,
  SAUDI_CITIES 
} from "@/components/ui/SaudiAddressField";
```

---

## 3. Props Specification

| Prop Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | `"saudi-address"` | Base unique identifier used for ARIA labels and HTML `for` associations. |
| `value` | `Partial<SaudiAddressValue>` | `{}` | Controlled or initial address state object. |
| `onChange` | `(address: SaudiAddressValue) => void` | `undefined` | Callback fired on any field edit returning the updated address object. |
| `required` | `boolean` | `false` | Visual required asterisks and internal validation requirements. |
| `disabled` | `boolean` | `false` | Disables all inputs, dropdowns, and interactive buttons. |
| `className` | `string` | `undefined` | Additional Tailwind utility classes applied to the root card container. |
| `error` | `string` | `undefined` | Explicit error message rendered at the bottom with a warning badge. |
| `showNationalAddressDetails` | `boolean` | `true` | Toggles the secondary box for Building No, Additional No, and Short Code. |
| `defaultCity` | `string` | `"الرياض"` | Initial city preselected if `value.city` is not provided. |

### Data Interface (`SaudiAddressValue`)

```typescript
export interface SaudiAddressValue {
  city: string;             // Mandatory e.g., "الرياض", "جدة"
  district: string;         // e.g., "حي النخيل"
  street: string;           // e.g., "طريق الملك فهد"
  postalCode: string;       // 5 numeric digits (10000 - 99999)
  buildingNumber?: string;  // 4 numeric digits (optional)
  additionalNumber?: string;// 4 numeric digits (optional)
  shortAddress?: string;    // 8-character code e.g., "RRRD2929"
}
```

---

## 4. Validation Rules (Saudi Post SPL Standards)

1. **Postal Code (الرمز البريدي)**:
   - **Rule**: Exactly 5 numeric digits.
   - **Range**: `10000` to `99999` (cannot start with `0`).
   - **Regex**: `/^[1-9]\d{4}$/`
   - **Behavior**: Auto-strips non-numeric characters, caps length at 5 digits.

2. **Building Number (رقم المبنى)**:
   - **Rule**: Exactly 4 numeric digits.
   - **Regex**: `/^\d{4}$/` (when provided).

3. **Additional Number (الرقم الإضافي)**:
   - **Rule**: Exactly 4 numeric digits.
   - **Regex**: `/^\d{4}$/` (when provided).

4. **Short National Address (العنوان المختصر)**:
   - **Rule**: 4 letters + 4 digits (e.g. `RRRD2929`).
   - **Behavior**: Auto-capitalizes input letters in real-time.

---

## 5. Usage Stories & Code Examples

### Story 1: Basic Form Integration (Standard Employee Profile)

```tsx
import React, { useState } from "react";
import { SaudiAddressField, type SaudiAddressValue } from "@/components/ui/SaudiAddressField";
import { Button } from "@/components/ui/button";

export function EmployeeAddressForm() {
  const [address, setAddress] = useState<SaudiAddressValue>({
    city: "الرياض",
    district: "حي الملز",
    street: "شارع صلاح الدين الأيوبي",
    postalCode: "12836",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving National Address:", address);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <SaudiAddressField
        id="employee-address"
        required
        value={address}
        onChange={setAddress}
      />
      <Button type="submit" className="bg-ds-emerald text-white">
        حفظ العنوان الوطني
      </Button>
    </form>
  );
}
```

### Story 2: Compact Mode (Without Secondary National Address Details)

Useful for quick signups, checkout, or simple branch locations:

```tsx
<SaudiAddressField
  id="company-branch-address"
  value={branchAddress}
  onChange={setBranchAddress}
  showNationalAddressDetails={false}
  defaultCity="جدة"
/>
```

### Story 3: Controlled with React Hook Form / Form Validation

```tsx
import { useForm, Controller } from "react-hook-form";
import { 
  SaudiAddressField, 
  isValidSaudiPostalCode 
} from "@/components/ui/SaudiAddressField";

export function BranchRegistrationForm() {
  const { control, handleSubmit, formState: { errors } } = useForm();

  return (
    <Controller
      name="nationalAddress"
      control={control}
      rules={{
        validate: (value) => {
          if (!value?.city) return "المدينة مطلوبة";
          if (!value?.district) return "الحي مطلوب";
          if (!value?.street) return "الشارع مطلوب";
          if (!isValidSaudiPostalCode(value?.postalCode)) {
            return "الرمز البريدي غير صحيح (يجب أن يتكون من 5 أرقام)";
          }
          return true;
        },
      }}
      render={({ field, fieldState }) => (
        <SaudiAddressField
          id="branch-address"
          required
          value={field.value}
          onChange={field.onChange}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
```

---

## 6. Accessibility & UX Compliance (WCAG 2.2 AA)

* **Explicit ARIA Associations**: Every child `<input>` and `<select>` is assigned a unique `id` bound to its visual `<Label htmlFor="...">`.
* **Direction & Numeral Integrity**:
  - Root container enforces `dir="rtl"`.
  - Postal code, building numbers, and additional numbers enforce `dir="ltr"` and `font-mono` with `text-right` alignment to ensure natural reading of digits without reversal.
* **Error Semantics**: Live error states render with both color borders (`border-rose-300`) and explicit descriptive icon badges (`<AlertCircle />`).
* **Touch-Friendly**: Input heights conform to a minimum of 40px (desktop) and 44px on touch viewports.
