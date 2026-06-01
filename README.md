# Pulse-Check-API
A minimal Dead Man’s Switch API built with Express and in-memory storage.

## Project overview
Pulse-Check-API tracks monitor heartbeats and marks targets as `DOWN` when a timeout expires. It uses a single Express app, a simple service layer, and per-monitor `setTimeout` timers to keep the lifecycle easy to reason about.

## Architecture
- `server.js`: application entrypoint and middleware setup.
- `routes/monitors.js`: REST endpoints for monitor operations.
- `services/monitorService.js`: core monitor lifecycle, validation, and timer management.
- `data/store.js`: in-memory storage for monitor records and timer handles.
- `config/swagger.js`: API documentation served at `/api-docs`.

### Design principles
- keep domain logic in the service layer
- avoid persistent storage complexity
- use one active timer per monitor
- do not use cron jobs, queues, or external caches

## Setup instructions
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open API docs at:
   ```text
   http://localhost:3000/api-docs
   ```

## API documentation
### Create monitor
`POST /monitors`

Request body:
```json
{
  "id": "device-123",
  "timeout": 60000,
  "alert_email": "admin@critmon.com",
  "name": "Solar Farm A"
}
```

Success response:
```json
{
  "message": "Monitor created",
  "monitor": {
    "id": "device-123",
    "name": "Solar Farm A",
    "alert_email": "admin@critmon.com",
    "timeout": 60000,
    "status": "ACTIVE",
    "lastHeartbeat": 1680000000000,
    "createdAt": 1680000000000,
    "updatedAt": 1680000000000
  }
}
```

### Heartbeat
`POST /monitors/:id/heartbeat`

Behavior:
- existing `ACTIVE` monitor resets the timeout and updates `lastHeartbeat`
- `PAUSED` monitor is automatically unpaused and restarted
- if monitor does not exist, returns `404`
- current implementation also recovers `DOWN` monitors to `ACTIVE`

Success response:
```json
{
  "message": "Heartbeat received",
  "monitor": {
    "id": "device-123",
    "status": "ACTIVE",
    "lastHeartbeat": 1680000060000,
    "updatedAt": 1680000060000
  }
}
```

### Pause monitor
`POST /monitors/:id/pause`

Behavior:
- sets `status` to `PAUSED`
- clears the active timeout
- prevents timeout alerts while paused

### Resume monitor
`POST /monitors/:id/resume`

Behavior:
- sets `status` to `ACTIVE`
- restarts the timeout from the current time

### List monitors
`GET /monitors`

### Get monitor details
`GET /monitors/:id`

Returns the monitor object or `404` if the monitor does not exist.

## State transition explanation
Monitors move through three states:
- `ACTIVE`: timer is running and heartbeat is expected
- `PAUSED`: timer is stopped and no alert will fire
- `DOWN`: timeout expired and an alert was logged

Transitions:
- `ACTIVE` → `PAUSED` via `/pause`
- `PAUSED` → `ACTIVE` via `/heartbeat` or `/resume`
- `ACTIVE` → `DOWN` when the timer expires
- `DOWN` → `ACTIVE` when `/heartbeat` is received (current recovery choice)

> Note: in this implementation, a heartbeat after `DOWN` automatically recovers the monitor to `ACTIVE`. This is the chosen behavior for the prototype and is documented here.

## Future improvements
- add request validation middleware instead of inline checks
- return proper `404` for missing monitor detail requests
- persist monitors in a database for production state durability
- add DELETE support to remove monitors and clear timers
- add integration tests for timer expiration and pause/resume transitions
