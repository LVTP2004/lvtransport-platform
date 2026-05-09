import { AdminFareRule } from '../interfaces/admin-fare-rule.interface';

export class AdminFareManagementService {
  private rules: AdminFareRule[] = [];

  listRules(): AdminFareRule[] {
    return this.rules;
  }

  upsertRule(rule: AdminFareRule): void {
    this.rules = this.rules.filter((r) => r.id !== rule.id).concat(rule);
  }
}
