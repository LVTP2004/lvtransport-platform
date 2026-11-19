// Reuse the actual independently authenticated portals at the existing public routes.
export { App as AdminAccess } from '../../../admin/src/app/VerifiedPortal';
export { App as DriverAccess } from '../../../driver/src/app/VerifiedPortal';

// Presentation and read-only operational observations; no new governance authority.
export { default as GovernanceAccess } from './FounderDashboard';
