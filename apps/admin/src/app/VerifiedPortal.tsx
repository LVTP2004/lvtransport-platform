import { BookingOperations } from './BookingOperations';
import { createLVTransportFirebaseProvider } from '@lvtransport/auth';
import { GoogleLoginBoundary } from '../modules/auth/components/GoogleLoginBoundary';

const createAdminGoogleProvider = () => createLVTransportFirebaseProvider('admin');

// The boundary verifies the server identity before mounting persisted booking operations.
export function App() {
  return <GoogleLoginBoundary title="Admin Login" createProvider={createAdminGoogleProvider} expectedRole="admin"
    renderOperations={({ client }) => <BookingOperations client={client} />} />;
}
