# LVTransport Product Specification Lock

## Product identity

LVTransport.be is a premium, operational transport platform for Antwerpen/Belgium.

The product must feel:
- calm
- premium
- reliable
- operational
- mobile-first
- founder-controlled
- not noisy
- not demo-like
- not fake SaaS

## Homepage UX rules

The homepage first fold must prioritize:
1. Brand trust
2. Primary reservation CTA
3. Price/route calculation CTA
4. Clear premium transport positioning
5. Non-intrusive MoniRide

The first fold must not be overloaded with:
- admin panels
- driver controls
- fake tracking lifecycle
- fake bookings
- fake reviews
- technical cockpit language
- unnecessary animations
- noisy widgets

## Navigation lock

Preferred public labels:
- Inicio
- Reservar
- Calcular
- Contacto

Do not replace them with English labels unless explicitly requested.

## Booking behavior lock

Forbidden:
- fake confirmation codes
- hardcoded ride codes
- localStorage booking confirmation
- session-only booking success
- form submit that only prevents default
- placeholder phone/email as production contact

## Tracking behavior lock

Forbidden:
- hardcoded ETA
- hardcoded driver
- hardcoded license plate
- hardcoded 5-digit ride code
- fake lifecycle timeline presented as real

## MoniRide lock

MoniRide must be:
- non-intrusive
- small
- never blocking CTA
- never blocking forms
- never blocking maps

## Admin/Driver lock

Admin and Driver are operational surfaces.
Do not modify them during visual homepage tasks.

## Deploy lock

Agents must not modify:
- VPS configuration
- Nginx
- PM2
- ports
- DNS
- SSL
- Docker
- deployment folders
