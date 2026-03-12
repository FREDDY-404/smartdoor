# Smart Door Dashboard

Next.js 14 admin dashboard for a Smart IoT Door system using Supabase Auth, Postgres, and Realtime.

## Features

- Admin login with Supabase Auth
- Protected App Router dashboard
- Overview with live door state, latest event, last seen, online indicator, and counters
- Activity log filtering and search
- Authorized RFID card management
- Device registration and token rotation
- Security monitoring for invalid RFID, OTP failures, denied access, and alarms
- Device event ingestion endpoint at `POST /api/device/events`

## Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres
- Supabase Realtime

## Required Supabase tables

The included schema creates:

- `profiles`
- `devices`
- `authorized_cards`
- `door_events`
- `device_status`

Run [`supabase_schema.sql`](/Users/freddy/Documents/Smart Door/dashboard/supabase_schema.sql) in the Supabase SQL editor.

## Environment

Copy [`.env.example`](/Users/freddy/Documents/Smart Door/dashboard/.env.example) to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Local setup

1. Install dependencies.

```bash
npm install
```

2. Run the SQL schema in Supabase.
3. Enable Realtime for `door_events`, `device_status`, `devices`, and `authorized_cards`.
4. Create a Supabase Auth user.
5. Promote that user to admin:

```sql
update public.profiles
set role = 'admin'
where id = 'YOUR_AUTH_USER_UUID';
```

6. Start the app.

```bash
npm run dev
```

Open `http://localhost:3000/login`.

## Device event payload

`POST /api/device/events`

```json
{
  "device_code": "front-door-01",
  "device_token": "server-generated-token",
  "event_type": "ACCESS_GRANTED",
  "uid": "04A2249B",
  "message": "RFID match for Alice",
  "metadata": {
    "source": "rfid"
  }
}
```

Supported `event_type` values:

- `SYSTEM_READY`
- `RFID_OK`
- `RFID_INVALID`
- `OTP_SENT`
- `OTP_FAILED`
- `ACCESS_GRANTED`
- `ACCESS_DENIED`
- `DOOR_UNLOCKED`
- `DOOR_LOCKED`
- `ALARM`
- `RESET`
- `CANCELLED`

## Notes

- Device secrets are stored in `devices.secret_token` and are never shown in full in the normal UI.
- The legacy route `POST /api/device/log` is kept as an alias to `POST /api/device/events`.
- The service role key is only used in server-side code.

## Edge Function: door-event-ingest

The repo also includes a Supabase Edge Function at
[`supabase/functions/door-event-ingest/index.ts`](/Users/freddy/Documents/Smart Door/dashboard/supabase/functions/door-event-ingest/index.ts)
for IoT event ingestion and email alerts.

### Function secrets

Set these before deployment:

```bash
supabase secrets set \
  SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY \
  RESEND_API_KEY=YOUR_RESEND_API_KEY \
  ADMIN_ALERT_EMAIL=alerts@example.com
```

### Deploy

```bash
supabase functions deploy door-event-ingest
```

### Expected headers

- `x-device-code`
- `x-device-token`

### Example request

```bash
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/door-event-ingest" \
  -H "Content-Type: application/json" \
  -H "x-device-code: front-door-01" \
  -H "x-device-token: YOUR_DEVICE_TOKEN" \
  -d '{
    "event": "RFID_OK",
    "uid": "A30B9D29",
    "message": "Authorized RFID scanned",
    "state_code": 1,
    "uptime_ms": 123456
  }'
```
