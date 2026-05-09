import { OnboardingStep } from '../enums/auth.enums';
export interface OnboardingState { step: OnboardingStep; completedSteps: OnboardingStep[]; requiresKyc: boolean; requiresDocumentVerification: boolean; accountVerified: boolean; }
