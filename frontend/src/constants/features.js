export const FEATURES = {
  // 1. Governance
  SOCIETY_STRUCT: 'FEAT_SOCIETY_STRUCT',
  COMMITTEE: 'FEAT_COMMITTEE',
  RBAC: 'FEAT_RBAC',
  RESIDENTS: 'FEAT_RESIDENTS',

  // 2. Financial
  BILLING: 'FEAT_BILLING',
  INTEREST: 'FEAT_INTEREST',
  ACCOUNTING: 'FEAT_ACCOUNTING',
  PAYMENTS: 'FEAT_PAYMENTS',
  VOUCHERS: 'FEAT_VOUCHERS',

  // 3. Compliance
  SHARE_CERT: 'FEAT_SHARE_CERT',
  DOCUMENTS: 'FEAT_DOCUMENTS',
  FIN_YEAR: 'FEAT_FIN_YEAR',

  // 4. Operations
  MEETINGS: 'FEAT_MEETINGS',
  COMPLAINTS: 'FEAT_COMPLAINTS',
  NOTIFICATIONS: 'FEAT_NOTIFICATIONS',
  VISITORS: 'FEAT_VISITORS',
  ASSETS: 'FEAT_ASSETS',
};

export const FEATURE_DETAILS = [
  {
    category: 'Society Governance & Infrastructure',
    items: [
      { id: FEATURES.SOCIETY_STRUCT, label: 'Structural Mapping', description: 'Wings and units/flats management' },
      { id: FEATURES.COMMITTEE, label: 'Committee Directory', description: 'Office bearers and roles tracking' },
      { id: FEATURES.RBAC, label: 'Role-Based Access Control', description: 'Fine-grained permissions (MANAGE_ASSETS, etc.)' },
      { id: FEATURES.RESIDENTS, label: 'Resident Management', description: 'Owner/tenant linking to units' },
    ],
  },
  {
    category: 'Financial Management & Accounting',
    items: [
      { id: FEATURES.BILLING, label: 'Automated Maintenance Billing', description: 'Generation based on unit parameters' },
      { id: FEATURES.INTEREST, label: 'Outstanding & Interest Logic', description: 'Dues tracking and interest calculation' },
      { id: FEATURES.ACCOUNTING, label: 'Receipt & Expense Tracking', description: 'Digital ledger for income/expenditure' },
      { id: FEATURES.PAYMENTS, label: 'Integrated QR Payments', description: 'Dynamic UPI QR code generation' },
      { id: FEATURES.VOUCHERS, label: 'Accounting Vouchers', description: 'Professional Payment Vouchers generation' },
    ],
  },
  {
    category: 'Statutory Compliance & Reporting',
    items: [
      { id: FEATURES.SHARE_CERT, label: 'Share Certificate Generation', description: 'Issue and download share certificates' },
      { id: FEATURES.DOCUMENTS, label: 'Document Engine', description: 'PDF generation for Bills, Receipts, Vouchers' },
      { id: FEATURES.FIN_YEAR, label: 'Financial Year Cycles', description: 'Start and close financial years' },
    ],
  },
  {
    category: 'Community & Operations',
    items: [
      { id: FEATURES.MEETINGS, label: 'Meeting & RSVP Desk', description: 'Scheduling and attendance tracking' },
      { id: FEATURES.COMPLAINTS, label: 'Complaint Helpdesk', description: 'Grievance lodging and status tracking' },
      { id: FEATURES.NOTIFICATIONS, label: 'Notification System', description: 'Real-time alerts for bills and payments' },
      { id: FEATURES.VISITORS, label: 'Visitor Gate Log', description: 'Digital entry/exit tracking' },
      { id: FEATURES.ASSETS, label: 'Asset Management', description: 'Inventory tracking for society equipment' },
    ],
  },
];
