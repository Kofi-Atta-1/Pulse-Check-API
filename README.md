# Pulse-Check-API
A minimal Dead Man’s Switch API built with plain JavaScript, Express, and in-memory storage.

## Overview
This service tracks device monitors and fires alerts when a heartbeat is missed. It keeps the implementation simple with one Express app, a single in-memory `Map`, and a lightweight state machine.

## Architecture
- `server.js` initializes Express and loads the routes.
- `routes/monitors.js` defines the REST API surface.
- `services/monitorService.js` contains the monitor state logic and timer lifecycle.
- `data/store.js` contains the in-memory `Map` of monitors.

### Flow
```text
POST /monitors
      ↓
createMonitor() → store monitor
      ↓
polling loop → every 3 seconds
      ↓
check active monitors
      ↓
if deadline missed → mark DOWN + alert
```

## Data model
Monitors are plain objects:
```js
{
  id: 'device-123',
  name: 'Solar Farm A',
  alertEmail: 'admin@critmon.com',
  timeoutSeconds: 60,
  lastPingAt: 1680000000000,
  nextDeadlineAt: 1680000060000,
  state: 'ACTIVE',
  createdAt: 1680000000000,
  updatedAt: 1680000000000
}
```

State values:
- `ACTIVE`
- `PAUSED`
- `DOWN`

## Endpoints
### Create monitor
POST `/monitors`

Body:
```json
{
  "id": "device-123",
  "timeout": 60,
  "alert_email": "admin@critmon.com",
  "name": "Solar Farm A"
}
```
Response: `201 Created`

### Heartbeat
POST `/monitors/:id/heartbeat`

Resets the countdown and keeps the monitor active.

### Pause monitor
POST `/monitors/:id/pause`

Pauses monitoring and prevents alerts until the monitor is resumed or pinged.

### Resume monitor
POST `/monitors/:id/resume`

Restarts the monitor timer from the current time.

### List monitors
GET `/monitors`

### Get monitor details
GET `/monitors/:id`

## Timer lifecycle
- A single `setInterval()` runs every 3 seconds.
- It iterates all monitors in the in-memory `Map`.
- Only monitors in `ACTIVE` state are checked.
- If the current time passes `nextDeadlineAt`, the monitor transitions to `DOWN` and logs an alert.

## Developer's Choice
Added explicit resume behavior via `POST /monitors/:id/resume`.

Why:
- It makes pause/resume behavior clearer for users.
- It avoids hidden state changes from implicitly resuming on heartbeat.
- It supports maintenance workflows cleanly.

## Run locally
1. `npm install`
2. `npm start`

The server listens on `http://localhost:3000`.

## Notes
- No database is used; storage is in memory.
- No classes are used; plain functions and objects are easier to follow.
- The alert is logged as JSON, e.g. `{"ALERT":"Device device-123 is down!","time":"..."}`.
- Restarting the server clears all monitor state.
