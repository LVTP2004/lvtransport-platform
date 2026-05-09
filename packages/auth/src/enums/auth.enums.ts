export enum AccountType { CUSTOMER='customer', DRIVER='driver', ADMIN='admin' }
export enum UserRole { CUSTOMER='customer', BUSINESS_CUSTOMER='business_customer', VIP_CUSTOMER='vip_customer', DRIVER='driver', FLEET_DRIVER='fleet_driver', ADMIN='admin', OPS_ADMIN='ops_admin', SUPER_ADMIN='super_admin' }
export enum Permission {
  BOOK_RIDE='book:ride',
  MANAGE_PROFILE='manage:profile',
  VIEW_DRIVER_QUEUE='view:driver_queue',
  DRIVER_UPDATE_STATUS='driver:update_status',
  DRIVER_UPLOAD_DOCUMENTS='driver:upload_documents',
  ADMIN_READ='admin:read',
  ADMIN_WRITE='admin:write',
  ADMIN_SECURE_ACTION='admin:secure_action',
  AUDIT_READ='audit:read'
}
export enum AccountStatus { PENDING_VERIFICATION='pending_verification', ACTIVE='active', SUSPENDED='suspended', LOCKED='locked', DELETED='deleted' }
export enum OnboardingStep { ACCOUNT='account', PROFILE='profile', VERIFICATION='verification', KYC='kyc', DRIVER_DOCUMENTS='driver_documents', COMPLETE='complete' }
export enum AuthProvider { EMAIL_PASSWORD='email_password', GOOGLE='google', APPLE='apple', FIREBASE='firebase', BIOMETRIC='biometric' }
