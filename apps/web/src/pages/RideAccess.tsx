import { Link } from 'react-router-dom';
import CustomerAccount from './CustomerAccount';

const ignoreConnection = () => {};

export default function RideAccess() {
  return <main className="min-h-screen bg-[#101010] px-5 py-8 text-white">
    <div className="mx-auto max-w-5xl space-y-8">
      <nav aria-label="MONI Ride" className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/" className="text-sm font-semibold text-lv-champagne underline underline-offset-4">LVTransport</Link>
        <Link to="/booking" className="rounded-lg bg-lv-gold px-4 py-3 font-semibold text-black">Boek een rit</Link>
      </nav>
      <header>
        <h1 className="text-4xl font-semibold">MONI Ride</h1>
        <p className="mt-3 text-lv-mist">Maak een account aan of meld u aan om uw reserveringen te bekijken.</p>
      </header>
      <CustomerAccount onConnection={ignoreConnection} revision={0} suggestedEmail="" />
    </div>
  </main>;
}
