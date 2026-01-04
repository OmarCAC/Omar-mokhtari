
export const TOOL_CATEGORIES = [
  { id: 'all', label: 'Tous' },
  { id: 'ai', label: '🤖 Studio Expert IA' }, // Nouvelle catégorie
  { id: 'startup', label: '🚀 Spécial Startups' },
  { id: 'compta', label: 'Comptabilité & Fiscalité' },
  { id: 'rh', label: 'RH & Paie' },
  { id: 'gestion', label: 'Gestion & Juridique' }
];

export const AVAILABLE_ICONS = [
  'calculate', 'trending_up', 'payments', 'receipt_long', 'description', 
  'checklist', 'query_stats', 'target', 'calendar_month', 'group', 
  'business_center', 'gavel', 'policy', 'verified', 'rocket_launch',
  'savings', 'account_balance', 'analytics', 'pie_chart', 'currency_exchange',
  'receipt', 'edit_document', 'fact_check', 'inventory_2', 'price_check',
  'psychology', 'smart_toy', 'history_edu'
];

export const TOOL_ADMIN_PATHS: Record<string, string> = {
  'tool-calculator': '/admin/calculateur',
  'tool-calendar': '/admin/fiscal'
};
