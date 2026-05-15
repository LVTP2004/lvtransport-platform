export default function HeroSection() {
  return (
    <section
      style={{
        background: '#0b0b0b',
        color: 'white',
        padding: '80px 40px',
        minHeight: '60vh'
      }}
    >
      <p style={{ color: '#d4af37', letterSpacing: '4px' }}>
        PREMIUM MOBILITY • ANTWERPEN
      </p>

      <h1
        style={{
          fontSize: '64px',
          marginTop: '20px',
          maxWidth: '900px'
        }}
      >
        LV Transport Platform
      </h1>

      <p
        style={{
          marginTop: '20px',
          maxWidth: '700px',
          color: '#d1d5db',
          fontSize: '18px',
          lineHeight: '1.7'
        }}
      >
        Premium taxi, airport transfer and operational mobility platform
        built for realtime coordination and luxury transportation.
      </p>
    </section>
  )
}
