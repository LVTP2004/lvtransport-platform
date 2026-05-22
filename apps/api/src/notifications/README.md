# Notification Architecture (Preparation Only)

This module provides scaffolding for a scalable, queue-first notification system without live provider integrations.

## Covered notification scenarios

- booking confirmation emails
- booking status update emails
- driver assignment notifications
- customer tracking link notifications
- admin alert notifications
- payment confirmation emails
- invoice email preparation
- cancellation emails
- support ticket notifications
- VIP/business customer notifications
- driver push notification preparation
- customer push notification preparation
- SMS/WhatsApp notification preparation

## Core architecture elements

- Notification DTOs/interfaces (`notification.dto.ts`, `notification.types.ts`)
- Notification lifecycle states (`draft` to `dead_letter`)
- Queue topology (`main`, `retry`, `dead_letter`, `webhook_events`)
- Retry/failure handling through backoff policy in `notification.architecture.ts`
- Delivery status models (`NotificationDeliveryLog`, `DeliveryAttempt`)
- Template registry (`notification.templates.ts`)
- Webhook event contracts (`NotificationWebhookEventDto`)

## Safety and non-production constraints

- No real SMTP credentials
- No real API keys
- No live SMS/WhatsApp provider connections
- No production push provider implementation
- No real email dispatch in this module
