import { useEffect, useState, type FormEvent } from 'react';
import { createLVTransportFirebaseProvider, OperationsRequestError, type VerifiedOperationsClient } from '@lvtransport/auth';
import { GoogleLoginBoundary } from '../../../admin/src/modules/auth/components/GoogleLoginBoundary';

const createProvider = () => createLVTransportFirebaseProvider('applicant');
const endpoint = '/customer/driver-application';
const statusLabels = {
  pending: 'In beoordeling', approved: 'Goedgekeurd', corrections: 'Aanpassing gevraagd',
  rejected: 'Afgewezen', suspended: 'Geschorst',
};
type Application = { version: number; status: keyof typeof statusLabels; expired: boolean; history: { reason?: string }[] };

function DriverApplicationForm({ client }: { client: VerifiedOperationsClient }) {
  const [application, setApplication] = useState<Application | null>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    void client.request<{ application: Application | null }>(endpoint).then(result => {
      if (active) setApplication(result.application);
    }).catch(() => {
      if (active) setError('De aanvraag kon niet worden opgehaald. Gebruik een geverifieerd e-mailadres.');
    });
    return () => { active = false; };
  }, [client]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || application === undefined) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      const body = {
        registration: String(form.get('registration') ?? ''),
        driverValidUntil: new Date(String(form.get('driverExpiry'))).toISOString(),
        vehicleValidUntil: new Date(String(form.get('vehicleExpiry'))).toISOString(),
        expectedVersion: application?.version ?? 0,
      };
      const result = await client.request<{ application: Application }>(endpoint, { body });
      setApplication(result.application);
    } catch (cause) {
      if (cause instanceof OperationsRequestError && cause.code === 'VEHICLE_UNAVAILABLE') {
        setError('Het voertuig is niet beschikbaar. Vraag Control Tower om het voertuig te controleren.');
      } else {
        setError('De aanvraag is niet bevestigd. Controleer de gegevens en probeer het opnieuw.');
      }
    } finally {
      setBusy(false);
    }
  }

  const canSubmit = application === null || application?.status === 'rejected' || application?.status === 'corrections'
    || (application?.status === 'approved' && application.expired);

  return <section className="mt-4 space-y-3">
    {application === undefined && !error && <p role="status">Aanvraag laden…</p>}
    {error && <p role="alert">{error}</p>}
    {application && <p role="status">{application.status === 'approved' && application.expired ? 'Verlopen' : statusLabels[application.status]}</p>}
    {application?.history.at(-1)?.reason && <p>{application.history.at(-1)?.reason}</p>}
    {application?.status === 'approved' && !application.expired && <p>Control Tower laat u weten wanneer u toegang krijgt tot Drive.</p>}
    {canSubmit && <form className="grid gap-3" onSubmit={submit}>
      <label>Kenteken van het geregistreerde voertuig <input name="registration" required maxLength={24} /></label>
      <label>Rijbevoegdheid geldig tot <input name="driverExpiry" type="datetime-local" required /></label>
      <label>Voertuigvergunning geldig tot <input name="vehicleExpiry" type="datetime-local" required /></label>
      <button type="submit" className="btn-primary" disabled={busy}>Aanvraag indienen</button>
    </form>}
  </section>;
}

export default function DriverApplication() {
  return <GoogleLoginBoundary title="Aanmelden als chauffeur" expectedRole="customer" createProvider={createProvider}
    signInMessage="Meld u aan met een geverifieerd e-mailadres om uw chauffeursaanvraag te beheren."
    renderOperations={({ client }) => <DriverApplicationForm client={client} />} />;
}
