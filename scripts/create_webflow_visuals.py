from pathlib import Path
import arabic_reshaper
from bidi.algorithm import get_display
import matplotlib.pyplot as plt
from matplotlib import font_manager

OUT = Path('/home/ubuntu/hbs-hr/docs')
OUT.mkdir(parents=True, exist_ok=True)
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
font_manager.fontManager.addfont(FONT)
plt.rcParams['font.family'] = 'DejaVu Sans'
plt.rcParams['axes.unicode_minus'] = False

def ar(text: str) -> str:
    return text

PHASES = [
    ('1. الحوكمة والنطاق', 3280, 3),
    ('2. نظام التصميم', 5480, 5),
    ('3. الصفحات الأساسية', 13480, 7),
    ('4. CMS والمحتوى', 7180, 4),
    ('5. التحويل والتكامل', 5760, 4),
    ('6. SEO والجودة والإطلاق', 5420, 3),
    ('مراجعة الإدارة', 0, 4),
]

LABOR = sum(cost for _, cost, _ in PHASES)
RISK = round(LABOR * 0.12, 2)
TOTAL = LABOR + RISK
GREEN = '#174D3C'
MID = '#3E7B62'
LIGHT = '#A5C5B2'
GOLD = '#B9924A'
MIST = '#E7F0EA'
TEXT = '#21382F'

def style(fig):
    fig.patch.set_facecolor('#FBFCFA')

# 1. Cost distribution
phase_names = [name for name, cost, _ in PHASES if cost]
costs = [cost for _, cost, _ in PHASES if cost]
colors = [GREEN, MID, '#5E9678', '#84AE94', GOLD, '#A4B9A8']
fig, ax = plt.subplots(figsize=(13, 8))
style(fig)
bars = ax.barh(range(len(costs)), costs, color=colors, height=0.64)
ax.set_yticks(range(len(costs)))
ax.set_yticklabels([ar(x) for x in phase_names], fontsize=11, color=TEXT)
ax.invert_yaxis()
ax.set_xlabel(ar('التكلفة بالريال السعودي'), color=TEXT, fontsize=11)
ax.set_title(ar('توزيع تكلفة العمل حسب مرحلة تطوير Webflow'), color=GREEN, fontsize=18, fontweight='bold', pad=18)
ax.grid(axis='x', color='#D9E4DC', linewidth=0.8)
ax.set_axisbelow(True)
for side in ['top', 'right', 'left']:
    ax.spines[side].set_visible(False)
ax.spines['bottom'].set_color('#B8C9BE')
for bar, cost in zip(bars, costs):
    ax.text(cost + 160, bar.get_y() + bar.get_height()/2, f'{cost:,.0f} SAR', va='center', fontsize=10, color=TEXT)
ax.text(0.98, -0.13, ar(f'إجمالي تكلفة العمل: {LABOR:,.0f} SAR | احتياطي المخاطر: {RISK:,.0f} SAR | الإجمالي قبل الضريبة: {TOTAL:,.0f} SAR'), transform=ax.transAxes, ha='right', fontsize=10, color=TEXT, bbox=dict(boxstyle='round,pad=0.5', facecolor=MIST, edgecolor='none'))
plt.tight_layout()
fig.savefig(OUT / 'webflow_cost_distribution.png', dpi=220, bbox_inches='tight')
plt.close(fig)

# 2. Timeline Gantt
fig, ax = plt.subplots(figsize=(14, 7.5))
style(fig)
start = 0
timeline_colors = [GREEN, MID, '#5E9678', '#84AE94', GOLD, '#A4B9A8', '#D4B872']
for index, ((name, _, duration), color) in enumerate(zip(PHASES, timeline_colors)):
    ax.barh(index, duration, left=start, height=0.58, color=color, edgecolor='white', linewidth=1.2)
    ax.text(start + duration/2, index, ar(f'{duration} أيام'), ha='center', va='center', color='white' if index < 4 else TEXT, fontsize=10, fontweight='bold')
    start += duration
ax.set_yticks(range(len(PHASES)))
ax.set_yticklabels([ar(x[0]) for x in PHASES], fontsize=11, color=TEXT)
ax.invert_yaxis()
ax.set_xlim(0, start + 2)
ax.set_xticks(range(0, start + 1, 5))
ax.set_xticklabels([ar(f'اليوم {x}') for x in range(0, start + 1, 5)], fontsize=10, color=TEXT)
ax.set_title(ar('الجدول الزمني التقديري لتنفيذ مشروع Webflow'), color=GREEN, fontsize=18, fontweight='bold', pad=18)
ax.grid(axis='x', color='#D9E4DC', linewidth=0.8)
ax.set_axisbelow(True)
for side in ['top', 'right', 'left']:
    ax.spines[side].set_visible(False)
ax.spines['bottom'].set_color('#B8C9BE')
ax.text(0.98, -0.15, ar('المدة: 30 يوم عمل (26 يوم تنفيذ + 4 أيام مراجعة إدارة) = 6.0 أسابيع على أساس 5 أيام عمل أسبوعياً'), transform=ax.transAxes, ha='right', fontsize=10, color=TEXT, bbox=dict(boxstyle='round,pad=0.5', facecolor=MIST, edgecolor='none'))
plt.tight_layout()
fig.savefig(OUT / 'webflow_timeline_gantt.png', dpi=220, bbox_inches='tight')
plt.close(fig)

# 3. Executive dashboard
fig = plt.figure(figsize=(15, 9), facecolor='#FBFCFA')
grid = fig.add_gridspec(2, 3, height_ratios=[1, 2], hspace=0.36, wspace=0.28)
cards = [
    (ar('تكلفة العمل'), f'{LABOR:,.0f}', 'SAR', GREEN),
    (ar('احتياطي المخاطر'), f'{RISK:,.0f}', 'SAR', GOLD),
    (ar('الإجمالي قبل الضريبة'), f'{TOTAL:,.0f}', 'SAR', MID),
]
for i, (label, value, unit, color) in enumerate(cards):
    ax = fig.add_subplot(grid[0, i])
    ax.set_facecolor(MIST)
    ax.set_xticks([]); ax.set_yticks([])
    for spine in ax.spines.values(): spine.set_visible(False)
    ax.text(0.94, 0.72, label, ha='right', va='center', fontsize=13, color=TEXT, transform=ax.transAxes)
    ax.text(0.94, 0.40, value, ha='right', va='center', fontsize=26, color=color, fontweight='bold', transform=ax.transAxes)
    ax.text(0.94, 0.18, unit, ha='right', va='center', fontsize=11, color=TEXT, transform=ax.transAxes)

ax1 = fig.add_subplot(grid[1, :2])
ax1.barh(range(len(costs)), costs, color=colors, height=0.58)
ax1.set_yticks(range(len(costs))); ax1.set_yticklabels([ar(x) for x in phase_names], fontsize=10, color=TEXT); ax1.invert_yaxis()
ax1.grid(axis='x', color='#D9E4DC'); ax1.set_axisbelow(True)
for s in ['top','right','left']: ax1.spines[s].set_visible(False)
ax1.set_title(ar('التكلفة حسب المرحلة'), loc='right', color=GREEN, fontsize=15, fontweight='bold')
for y, cost in enumerate(costs): ax1.text(cost + 150, y, f'{cost:,.0f}', va='center', color=TEXT, fontsize=9)
ax1.set_xlabel(ar('SAR'), color=TEXT)

ax2 = fig.add_subplot(grid[1, 2])
start = 0
for index, ((name, _, duration), color) in enumerate(zip(PHASES, timeline_colors)):
    ax2.barh(index, duration, left=start, height=0.52, color=color)
    start += duration
ax2.set_yticks(range(len(PHASES))); ax2.set_yticklabels([ar(x[0].replace('المرحلة ', '')) for x in PHASES], fontsize=8, color=TEXT); ax2.invert_yaxis()
ax2.grid(axis='x', color='#D9E4DC'); ax2.set_axisbelow(True)
for s in ['top','right','left']: ax2.spines[s].set_visible(False)
ax2.set_title(ar('تسلسل التنفيذ: 30 يوم عمل'), loc='right', color=GREEN, fontsize=15, fontweight='bold')
ax2.set_xlabel(ar('أيام العمل المتراكمة'), color=TEXT, fontsize=9)
fig.suptitle(ar('لوحة موجزة: ميزانية وجدول تطوير موقع Webflow'), x=0.96, ha='right', color=GREEN, fontsize=21, fontweight='bold')
fig.text(0.96, 0.02, ar('أساس النموذج: افتراضات تخطيطية قابلة للتعديل في ملف Excel. لا تشمل ضريبة القيمة المضافة أو رسوم الموردين غير المدخلة.'), ha='right', color=TEXT, fontsize=9)
fig.savefig(OUT / 'webflow_budget_timeline_dashboard.png', dpi=220, bbox_inches='tight')
plt.close(fig)

print('\n'.join(str(OUT / file) for file in ['webflow_cost_distribution.png', 'webflow_timeline_gantt.png', 'webflow_budget_timeline_dashboard.png']))
