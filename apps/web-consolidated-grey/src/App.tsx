import { FormEvent, useState } from 'react';

type BookingFormData = {
  pickup: string;
  destination: string;
  date: string;
  time: string;
  passengers: string;
  phone: string;
  notes: string;
};

const initialForm: BookingFormData = {
  pickup: '',
  destination: '',
  date: '',
  time: '',
  passengers: '1',
  phone: '',
  notes: '',
};

const WHATSAPP_PLACEHOLDER = '000000000000';

export default function App() {
  const [formData, setFormData] = useState<BookingFormData>(initialForm);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage('Sending booking request...');

    try {
      const response = await fetch('https://api.lvtransport.be/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Booking endpoint unavailable.');
      }

      setStatusMessage('Booking request sent. We will confirm shortly.');
      setFormData(initialForm);
    } catch {
      setStatusMessage(
        'Booking endpoint is not available yet. Please continue via WhatsApp contact.'
      );
    }
  };

  return (
    <div className="page">
      <header className="header" id="inicio">
        <div className="brand">LV Transport</div>
        <nav aria-label="Main menu">
          <a href="#inicio">Inicio</a>
          <a href="#servicios">Servicios</a>
          <a href="#precio">Precio</a>
          <a href="#mapa">Mapa</a>
          <a href="#reservar">Reservar</a>
          <a href="#contacto">Contacto</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">Private rides Belgium</p>
          <h1>LV Transport</h1>
          <p className="lead">Elegant private rides with fast booking and clear pricing.</p>
          <div className="hero-actions">
            <a className="btn btn-gold" href="#reservar">
              Reservar
            </a>
            <a className="btn btn-outline" href={`https://wa.me/${WHATSAPP_PLACEHOLDER}`}>
              WhatsApp
            </a>
          </div>
        </section>

        <section id="servicios" className="card-grid">
          {['Airport', 'City ride', 'Business', 'VIP'].map((service) => (
            <article key={service} className="card">
              <h2>{service}</h2>
            </article>
          ))}
        </section>

        <section id="precio" className="pricing">
          <h2>Precio</h2>
          <ul>
            <li>Airport desde €45</li>
            <li>City ride desde €25</li>
            <li>Business cotización</li>
          </ul>
        </section>

        <section id="reservar" className="booking">
          <h2>Reservar</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Pickup
              <input
                required
                value={formData.pickup}
                onChange={(event) => setFormData({ ...formData, pickup: event.target.value })}
              />
            </label>
            <label>
              Destination
              <input
                required
                value={formData.destination}
                onChange={(event) =>
                  setFormData({ ...formData, destination: event.target.value })
                }
              />
            </label>
            <label>
              Date
              <input
                required
                type="date"
                value={formData.date}
                onChange={(event) => setFormData({ ...formData, date: event.target.value })}
              />
            </label>
            <label>
              Time
              <input
                required
                type="time"
                value={formData.time}
                onChange={(event) => setFormData({ ...formData, time: event.target.value })}
              />
            </label>
            <label>
              Passengers
              <input
                required
                type="number"
                min={1}
                max={8}
                value={formData.passengers}
                onChange={(event) =>
                  setFormData({ ...formData, passengers: event.target.value })
                }
              />
            </label>
            <label>
              Phone / WhatsApp
              <input
                required
                value={formData.phone}
                onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
              />
            </label>
            <label>
              Notes (optional)
              <textarea
                value={formData.notes}
                onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
              />
            </label>
            <button className="btn btn-gold" type="submit">
              Send booking
            </button>
          </form>
          <p className="status">{statusMessage}</p>
        </section>

        <section id="mapa" className="map">
          <h2>Mapa</h2>
          <iframe
            title="LV Transport coverage map"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Antwerp%2C%20Belgium&output=embed"
          />
        </section>
      </main>

      <footer id="contacto" className="footer">
        <p>Contact: WhatsApp placeholder +{WHATSAPP_PLACEHOLDER}</p>
        <p>LV Transport • Belgium</p>
      </footer>
    </div>
  );
}
