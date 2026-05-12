import { RecordAuditEntryDto, RecordFraudSignalDto } from '../dto/security.dto';

export class SecurityArchitectureService {
  recordFraudSignal(dto: RecordFraudSignalDto) {
    return {
      implementation: 'placeholder',
      queuedForAnalysis: true,
      normalizedSignal: dto.signalType,
      source: dto.source,
    };
  }

  recordAuditEntry(dto: RecordAuditEntryDto) {
    return {
      implementation: 'placeholder',
      stored: true,
      action: dto.action,
    };
  }
}
