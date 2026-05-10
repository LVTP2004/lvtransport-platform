import { RecordFraudSignalDto } from '../dto/security.dto';

export class SecurityArchitectureService {
  recordFraudSignal(dto: RecordFraudSignalDto) {
    return {
      implementation: 'placeholder',
      queuedForAnalysis: true,
      normalizedSignal: dto.signalType,
    };
  }
}
