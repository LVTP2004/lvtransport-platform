export type MoniBranch =
  | "moni_ride"
  | "moni_business"
  | "moni_logistics"
  | "moni_interim"
  | "moni_lift"
  | "moni_rail"
  | "moni_eats"
  | "moni_admin"
  | "moni_finance"
  | "moni_support";

export type SupportedLanguage = "nl" | "es" | "en" | "fr";

export type HumanRole =
  | "ceo_founder"
  | "operations_admin"
  | "finance_admin"
  | "support_admin"
  | "dispatcher"
  | "compliance_officer";

export type DecisionRiskLevel = "low" | "medium" | "high" | "critical";

export type TaskState =
  | "created"
  | "queued"
  | "in_progress"
  | "waiting_for_ai"
  | "waiting_for_human_approval"
  | "blocked_missing_context"
  | "ready_for_execution"
  | "executed"
  | "cancelled"
  | "failed"
  | "archived";

export type ApprovalDomain =
  | "operations"
  | "legal"
  | "financial"
  | "contractual"
  | "strategic"
  | "external_communications";

export type ActionType =
  | "draft_document"
  | "draft_email"
  | "prepare_invoice"
  | "recommend_dispatch"
  | "recommend_staffing"
  | "recommend_logistics"
  | "recommend_tracking_action"
  | "generate_summary"
  | "escalate_issue";

export interface AgentCapabilities {
  branch: MoniBranch;
  supportedLanguages: SupportedLanguage[];
  allowedActions: ActionType[];
  restrictedActions: ActionType[];
  requiredIntegrations: Array<
    | "bookings"
    | "payments"
    | "drivers"
    | "business_accounts"
    | "logistics"
    | "tracking"
    | "admin_dashboard"
  >;
}

export interface AgentRegistration {
  agentId: string;
  displayName: string;
  branch: MoniBranch;
  version: string;
  active: boolean;
  capabilities: AgentCapabilities;
  ownerRole: HumanRole;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionRule {
  role: HumanRole | "moni_assistant" | MoniBranch;
  action: ActionType;
  approvalRequired: boolean;
  approvalDomain?: ApprovalDomain;
  approvalAuthority?: HumanRole;
  constraints: string[];
}

export interface SharedContextReference {
  contextId: string;
  domain:
    | "booking"
    | "driver"
    | "customer"
    | "fleet"
    | "invoice"
    | "incident"
    | "contract"
    | "policy";
  sourceSystem:
    | "bookings"
    | "payments"
    | "drivers"
    | "business_accounts"
    | "logistics"
    | "tracking"
    | "manual_input";
  sourceRecordId: string;
  summary: string;
  language: SupportedLanguage;
  confidence: number;
  redactionLevel: "public_safe" | "internal" | "restricted";
  lastSyncedAt: string;
}

export interface DecisionSupportInput {
  decisionId: string;
  title: string;
  branch: MoniBranch;
  riskLevel: DecisionRiskLevel;
  requiredDataPoints: string[];
  availableContext: SharedContextReference[];
  missingDataPoints: string[];
  recommendedOptions: DecisionOption[];
  generatedAt: string;
}

export interface DecisionOption {
  optionId: string;
  label: string;
  rationale: string;
  risks: string[];
  estimatedImpact: string;
  requiresFounderApproval: boolean;
}

export interface ApprovalRequest {
  approvalId: string;
  taskId: string;
  domain: ApprovalDomain;
  requestedBy: "moni_assistant" | MoniBranch;
  requestedTo: HumanRole;
  summary: string;
  payloadRef: string;
  dueAt?: string;
  status: "pending" | "approved" | "rejected" | "expired";
  createdAt: string;
  resolvedAt?: string;
}

export interface EscalationEvent {
  escalationId: string;
  taskId: string;
  reason:
    | "critical_risk"
    | "legal_financial_boundary"
    | "missing_mandatory_approval"
    | "safety_incident"
    | "conflicting_data";
  severity: DecisionRiskLevel;
  target: "leonardo_daniel_vargas_hinojosa";
  summary: string;
  requiredConfirmation: boolean;
  createdAt: string;
}

export interface AuditRecord {
  auditId: string;
  taskId: string;
  actorType: "human" | "ai" | "system";
  actorId: string;
  action: ActionType | "approval_decision" | "state_transition";
  branch?: MoniBranch;
  beforeState?: TaskState;
  afterState?: TaskState;
  metadata: Record<string, string | number | boolean | null>;
  timestamp: string;
}

export interface OperationsTask {
  taskId: string;
  branch: MoniBranch;
  locale: SupportedLanguage;
  action: ActionType;
  riskLevel: DecisionRiskLevel;
  state: TaskState;
  createdBy: string;
  assignedAgentId?: string;
  contextRefs: string[];
  requiredApprovals: ApprovalDomain[];
  escalationRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentDraftDTO {
  documentId: string;
  docType: "operations_report" | "incident_report" | "contract_draft" | "policy_memo";
  branch: MoniBranch;
  language: SupportedLanguage;
  title: string;
  body: string;
  disclaimers: string[];
  requiresApproval: boolean;
  status: "draft" | "pending_approval" | "approved" | "rejected";
}

export interface EmailDraftDTO {
  emailId: string;
  branch: MoniBranch;
  language: SupportedLanguage;
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  category: "customer" | "partner" | "internal";
  requiresApproval: boolean;
  status: "draft" | "pending_approval" | "approved" | "rejected";
}

export interface InvoiceDraftDTO {
  draftId: string;
  branch: MoniBranch;
  customerAccountId: string;
  currency: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
  }>;
  subtotal: number;
  totalVat: number;
  total: number;
  assumptions: string[];
  requiresFinanceApproval: boolean;
  status: "draft" | "pending_approval" | "approved" | "rejected";
}
