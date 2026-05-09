import { AccountStatus, AccountType, OnboardingStep, Permission, UserRole } from '../enums/auth.enums';

export interface UserProfile { firstName: string; lastName: string; phone?: string; timezone?: string; }
export interface BusinessCustomerProfile { companyName: string; travelPolicyId?: string; costCenter?: string; }
export interface VipCustomerProfile { tier: 'gold' | 'platinum' | 'black'; conciergeEnabled: boolean; }
export interface DriverProfile { licenseNumber?: string; vehicleId?: string; documentVerificationStatus: 'pending' | 'approved' | 'rejected'; }

export interface UserAccount {
  id: string;
  email: string;
  accountType: AccountType;
  roles: UserRole[];
  permissions: Permission[];
  status: AccountStatus;
  onboardingStep: OnboardingStep;
  profile: UserProfile;
  businessProfile?: BusinessCustomerProfile;
  vipProfile?: VipCustomerProfile;
  driverProfile?: DriverProfile;
  trustedDevices?: string[];
}
