# DESIGN.md — HBS 2030 Design System
*Version 2.1.0 — Saudi Intelligent Enterprise Standard (حلول الغد)*

---

## 1. Product Principles & Design Vision

1. **Saudi-First Architecture & Soul**: Designed natively with Right-to-Left (RTL) optical balance and typography. Fully aligned with Saudi Labor Law, MHRSD/Qiwa terminology, GOSI contributions, and Mudad WPS wage protection standards.
2. **High-Density Operational Clarity**: Deliver dense, actionable data and enterprise workflows without visual clutter, heavy unrequested gradients, or unnecessary nesting.
3. **Proactive Compliance & Zero-Surprises**: Surface document expiry, regulatory shifts, and labor policy thresholds ahead of time through standardized countdown states (120d, 90d, 60d, 30d, 15d, 7d, Expired).
4. **Explainable AI (Hamed Co-pilot)**: Every AI proposal must provide source grounding, confidence indicators, and human-in-the-loop authorization modals before committing financial, legal, or employee record changes.
5. **Universal Accessibility (WCAG 2.2 AA)**: Strict contrast ratios (>= 4.5:1 for body copy), minimum touch targets of 44x44px, visible keyboard focus rings, and screen-reader accessibility.

---

## 2. Color System & Semantic Tokens

### 2.1 Core Brand Palette

| Token Name | HEX Value | CSS Variable | Semantic Usage |
| :--- | :--- | :--- | :--- |
| **Forest Green (Primary)** | `#0F2F24` | `--ds-brand-forest` | Main navigation, high-level headers, authoritative branding |
| **Deep Forest (Dark)** | `#0A221A` | `--ds-brand-deep` | Sidebar dark container, modal backdrop overlays |
| **Emerald Green (Action)** | `#18B982` | `--ds-brand-emerald` | Primary action buttons, active tabs, verified status badges |
| **Emerald Hover** | `#13996A` | `--ds-brand-emerald-hover` | Interactive hover and active focus states for emerald elements |
| **Emerald Subtle** | `rgba(24, 185, 130, 0.12)` | `--ds-brand-emerald-soft` | Table row selection highlight, soft badge backgrounds |
| **Saudi Gold (Milestone)** | `#D4AF37` | `--ds-sand-gold` | Saudi Vision 2030 badges, key executive milestones, honors |
| **Graphite Dark (Text)** | `#0F172A` | `--ds-text-primary` | Primary headings, prominent values, high-contrast text |
| **Graphite Medium (Muted)**| `#475569` | `--ds-text-secondary` | Body text, table labels, descriptive annotations |
| **Graphite Light (Subtle)** | `#94A3B8` | `--ds-text-muted` | Placeholder text, timestamps, secondary metadata |
| **Warm Canvas (Background)**| `#FDFDFB` | `--ds-bg-canvas` | Main application background (warm neutral off-white) |
| **Pure Surface** | `#FFFFFF` | `--ds-bg-surface` | Data cards, panels, dialogs, table surfaces |
| **Subtle Neutral Surface** | `#F8F9FA` | `--ds-bg-subtle` | Table headers, secondary toolbars, disabled form fields |
| **Light Divider Border** | `#E2E8F0` | `--ds-border-light` | Card boundaries, input borders, structural dividers |
| **Subtle Divider Border** | `#F1F5F9` | `--ds-border-subtle` | Table row borders, nested dividers |

### 2.2 Semantic & Operational Status Tokens

| Semantic State | Background | Border | Text | Icon / Dot | Operational Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Success / Active** | `#ECFDF5` | `#A7F3D0` | `#065F46` | `#10B981` | Approved requests, active accounts, completed WPS runs |
| **Warning / Attention** | `#FFFBEB` | `#FDE68A` | `#92400E` | `#F59E0B` | Expiry in < 30 days, pending supervisor review |
| **Danger / Expired** | `#FEF2F2` | `#FECACA` | `#991B1B` | `#EF4444` | Expired Iqama/permits, salary rejection, policy violations |
| **Info / Scheduled** | `#F0F9FF` | `#BAE6FD` | `#075985` | `#0284C7` | Informational updates, draft regulatory proposals |
| **Neutral / Draft** | `#F8FAFC` | `#E2E8F0` | `#475569` | `#64748B` | Draft items, archived records, cancelled requests |

---

## 3. Typography Tokens & Hierarchy

### 3.1 Typeface Families
* **Arabic Primary**: `IBM Plex Sans Arabic`, `Noto Sans Arabic`, sans-serif
* **English Secondary**: `Inter`, `IBM Plex Sans`, system-ui, sans-serif
* **Monospace / Numerical Data**: `JetBrains Mono`, `ui-monospace`, monospace (for IBAN, National IDs, Iqama, and audits)

### 3.2 Typographic Scale

| Level | Size (px / rem) | Line Height | Weight | Letter Spacing | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display 1** | `32px / 2.0rem` | `1.25` | `Bold (700)` | `-0.02em` | Main dashboard titles, hero headline |
| **Heading 1** | `24px / 1.5rem` | `1.30` | `Bold (700)` | `-0.01em` | Page headers, module primary titles |
| **Heading 2** | `20px / 1.25rem` | `1.40` | `SemiBold (600)` | `0` | Section cards, modal headers |
| **Heading 3** | `18px / 1.125rem` | `1.45` | `SemiBold (600)` | `0` | Sub-card headings, drawer section titles |
| **Body Large** | `16px / 1.0rem` | `1.60` | `Medium (500)` | `0` | Default body copy, form inputs, primary table cells |
| **Body Small** | `14px / 0.875rem` | `1.50` | `Regular (400) / Medium`| `0` | Secondary descriptions, filter chips, list subtitles |
| **Caption** | `12px / 0.75rem` | `1.40` | `Medium (500) / SemiBold`| `+0.01em` | Badges, metadata timestamps, table column headers |

---

## 4. Spacing & Spatial Grid System (4px Increments)

All spacing, margins, paddings, and component heights adhere to a strict **4px incremental grid**:

| Increment Token | Value in Pixels | Tailwind Class | Recommended Usage |
| :--- | :--- | :--- | :--- |
| **`space-1`** | `4px` | `p-1`, `gap-1`, `m-1` | Micro gaps between icons and labels, badge internal padding |
| **`space-2`** | `8px` | `p-2`, `gap-2`, `m-2` | Form input inner vertical padding, tight table cell gaps |
| **`space-3`** | `12px` | `p-3`, `gap-3`, `m-3` | Standard button vertical padding, filter toolbar gaps |
| **`space-4`** | `16px` | `p-4`, `gap-4`, `m-4` | Card inner padding, form group vertical spacing |
| **`space-5`** | `20px` | `p-5`, `gap-5`, `m-5` | Dense card padding, table action header spacing |
| **`space-6`** | `24px` | `p-6`, `gap-6`, `m-6` | Major card padding, inter-card section gaps |
| **`space-8`** | `32px` | `p-8`, `gap-8`, `m-8` | Page header to content margin, drawer section padding |
| **`space-10`** | `40px` | `p-10`, `gap-10`, `m-10`| Modal outer padding, executive dashboard separators |
| **`space-12`** | `48px` | `p-12`, `gap-12`, `m-12`| Top-level dashboard grid margins |

### Corner Radius & Mathematical Nesting Rules:
* **Cards & Panels**: `rounded-2xl` (16px) outer radius.
* **Nested Child Containers**: `rounded-xl` (12px) `[Outer Radius (16px) - Padding (16px) = 12px optical radius]`.
* **Buttons & Form Fields**: `rounded-xl` (12px).
* **Badges, Chips & Avatar Pills**: `rounded-full` (9999px).

---

## 5. Responsive Breakpoints & Adaptive Layouts

| Breakpoint | Minimum Width | Target Device | Layout Behavior |
| :--- | :--- | :--- | :--- |
| **Mobile (`sm`)** | `390px` | iOS / Android Smartphones | Single column, bottom drawer sheets, stacked table cards, 44px touch targets |
| **Tablet (`md`)** | `768px` | iPad / Android Tablets | Collapsible icon sidebar, 2-column KPI grids, responsive modal sheets |
| **Laptop (`lg`)** | `1024px` | Standard Laptops | Expanded sidebar, 3-column KPI grids, full data tables with horizontal scroll |
| **Desktop (`xl`)** | `1280px` | Desktop Displays | Full sidebar + quick tools drawer, 4-column metric cards, command bar |
| **Ultra-wide (`2xl`)**| `1536px` | Large Monitors | Max-width content wrapper (`max-w-7xl mx-auto`), optimal reading line length (< 75ch) |

---

## 6. Accessibility Rules (WCAG 2.2 AA Compliance)

1. **Color Independence**: Visual statuses never rely solely on color. Every status badge includes both a distinct icon (`CheckCircle2`, `AlertTriangle`, `Clock`, `XCircle`) and clear text.
2. **Contrast Ratios**: All body text and form inputs maintain a minimum contrast ratio of `4.5:1` against their backgrounds. Large text and UI components maintain at least `3.0:1`.
3. **Focus Visibility**: All interactive controls present high-contrast focus rings (`focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none`).
4. **Touch Targets**: All mobile and touch interactive targets are sized to at least `44×44px`.
5. **Keyboard Operability**: Full keyboard navigation across all menus, drawers, dropdowns, modals, and data table pagination.
6. **Motion Safety**: All transition and layout animations strictly wrap in `@media (prefers-reduced-motion: reduce)` to eliminate motion sickness risks.
7. **Zoom & Viewport**: Viewport scale is never restricted (`user-scalable=yes, maximum-scale=5.0`).
