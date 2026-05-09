import { Permission, UserRole } from '../enums/auth.enums';
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.CUSTOMER]: [Permission.BOOK_RIDE, Permission.MANAGE_PROFILE],
  [UserRole.BUSINESS_CUSTOMER]: [Permission.BOOK_RIDE, Permission.MANAGE_PROFILE],
  [UserRole.VIP_CUSTOMER]: [Permission.BOOK_RIDE, Permission.MANAGE_PROFILE],
  [UserRole.DRIVER]: [Permission.DRIVER_UPDATE_STATUS],
  [UserRole.FLEET_DRIVER]: [Permission.DRIVER_UPDATE_STATUS, Permission.DRIVER_UPLOAD_DOCUMENTS],
  [UserRole.ADMIN]: [Permission.ADMIN_READ],
  [UserRole.OPS_ADMIN]: [Permission.ADMIN_READ, Permission.ADMIN_WRITE, Permission.AUDIT_READ],
  [UserRole.SUPER_ADMIN]: [Permission.ADMIN_READ, Permission.ADMIN_WRITE, Permission.ADMIN_SECURE_ACTION, Permission.AUDIT_READ]
};
