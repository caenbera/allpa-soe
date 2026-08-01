export type UserRole = "superadmin" | "company_admin" | "member";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  companyId: string | null;
  createdAt: number;
}

export interface SuperadminAccessGrant {
  granted: boolean;
  grantedAt: number | null;
  grantedBy: string | null;
  note?: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  logoURL: string | null;
  plan: "free" | "pro" | "enterprise";
  ownerUid: string;
  createdAt: number;
  superadminAccessGrant: SuperadminAccessGrant;
}

export interface CompanyMember {
  uid: string;
  role: "admin" | "member";
  permissions: string[];
  invitedBy: string | null;
  joinedAt: number;
}

export interface SidebarBlock {
  id: string;
  name: string;
  icon: string;
  order: number;
  isDefault: boolean;
  createdBy: string;
}

export interface SidebarPage {
  id: string;
  blockId: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
  isDefault: boolean;
  parentPageId: string | null;
}

export type SectionStatus = "pendiente" | "en_progreso" | "en_revision" | "completado";
export type SectionPriority = "baja" | "media" | "alta";

export interface PageSection {
  id: string;
  pageId: string;
  title: string;
  icon: string;
  order: number;
  status: SectionStatus;
  priority: SectionPriority;
  assignees: string[];
  isExpanded: boolean;
  richContent: string;
}

export interface ChecklistItem {
  id: string;
  sectionId: string;
  text: string;
  done: boolean;
  assignee: string | null;
  dueDate: number | null;
  order: number;
  noteCount: number;
}

export interface ChecklistNote {
  id: string;
  itemId: string;
  authorUid: string;
  authorName: string;
  text: string;
  createdAt: number;
}

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export interface Invitation {
  token: string;
  companyId: string;
  companyName: string;
  email: string | null;
  role: "admin" | "member";
  invitedBy: string;
  invitedByName: string;
  status: InvitationStatus;
  createdAt: number;
  expiresAt: number;
}
