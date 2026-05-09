export class AdminFareManagementService {
    rules = [];
    listRules() {
        return this.rules;
    }
    upsertRule(rule) {
        this.rules = this.rules.filter((r) => r.id !== rule.id).concat(rule);
    }
}
