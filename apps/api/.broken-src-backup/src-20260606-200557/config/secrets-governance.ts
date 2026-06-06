type SecretSeverity = 'critical' | 'warning';

type SecretSpec = {
  key: string;
  requiredInProduction: boolean;
  requiredInAllEnvironments?: boolean;
  placeholderTokens?: string[];
};

type SecretValidationCheck = {
  key: string;
  status: 'pass' | 'fail';
  severity: SecretSeverity;
  message: string;
};

const specs: SecretSpec[] = [
  { key: 'GOOGLE_MAPS_API_KEY', requiredInProduction: true, placeholderTokens: ['PLACEHOLDER'] },
  { key: 'STRIPE_SECRET_KEY', requiredInProduction: true, placeholderTokens: ['PLACEHOLDER', 'TEST'] },
  { key: 'PAYCONIQ_API_KEY', requiredInProduction: false },
  { key: 'MAIL_PROVIDER_API_KEY', requiredInProduction: false },
  { key: 'MAIL_FROM_ADDRESS', requiredInProduction: false },
  { key: 'JWT_SECRET', requiredInProduction: true, requiredInAllEnvironments: true, placeholderTokens: ['PLACEHOLDER', 'CHANGEME'] },
];

const hasPlaceholder = (value: string | undefined, tokens: string[]): boolean => {
  if (!value) return false;
  const normalized = value.toUpperCase();
  return tokens.some((token) => normalized.includes(token.toUpperCase()));
};

export const startupSecretValidation = {
  validate(nodeEnv: string) {
    const isProduction = nodeEnv === 'production';
    const checks: SecretValidationCheck[] = specs.map((spec) => {
      const value = process.env[spec.key];
      const isRequired = spec.requiredInAllEnvironments || (isProduction && spec.requiredInProduction);
      const includesPlaceholder = hasPlaceholder(value, spec.placeholderTokens ?? []);
      const missing = !value || value.trim().length === 0;
      const invalid = includesPlaceholder || (isRequired && missing);

      return {
        key: spec.key,
        status: invalid ? 'fail' : 'pass',
        severity: isRequired ? 'critical' : 'warning',
        message: invalid
          ? missing
            ? `${spec.key} is missing for ${nodeEnv} runtime.`
            : `${spec.key} contains placeholder token and is not runtime-safe.`
          : `${spec.key} validated.`,
      };
    });

    const criticalFailures = checks.filter((c) => c.status === 'fail' && c.severity === 'critical');
    const warningFailures = checks.filter((c) => c.status === 'fail' && c.severity === 'warning');

    return {
      generatedAt: new Date().toISOString(),
      nodeEnv,
      status: criticalFailures.length > 0 ? 'blocked' : warningFailures.length > 0 ? 'degraded' : 'ready',
      checks,
      summary: {
        total: checks.length,
        criticalFailures: criticalFailures.length,
        warningFailures: warningFailures.length,
      },
    };
  },
};

