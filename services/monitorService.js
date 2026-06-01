const { monitors, monitorTimers } = require('../data/store');

const REQUIRED_FIELDS = ['id', 'timeout', 'alert_email'];

const validateMonitorPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    const error = new Error('Request body must be a JSON object');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  for (const field of REQUIRED_FIELDS) {
    if (!payload[field]) {
      const error = new Error(`${field} is required`);
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
  }

  if (typeof payload.id !== 'string' || payload.id.trim() === '') {
    const error = new Error('id must be a non-empty string');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const timeoutValue = Number(payload.timeout);
  if (!Number.isFinite(timeoutValue) || timeoutValue <= 0) {
    const error = new Error('timeout must be a positive number');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (typeof payload.alert_email !== 'string' || payload.alert_email.trim() === '') {
    const error = new Error('alert_email must be a non-empty string');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
};

const clearMonitorTimer = (id) => {
  const timer = monitorTimers.get(id);
  if (timer) {
    clearTimeout(timer);
    monitorTimers.delete(id);
  }
};

const logTimeoutAlert = (monitor) => {
  const alert = {
    event: 'timeout',
    monitor_id: monitor.id,
    status: 'DOWN',
    alert_email: monitor.alert_email,
    timeout: monitor.timeout,
    timestamp: new Date().toISOString(),
    message: `Monitor '${monitor.id}' did not receive a heartbeat within ${monitor.timeout}ms.`
  };

  console.log(JSON.stringify(alert));
};

const expireMonitor = (id) => {
  const monitor = monitors.get(id);
  if (!monitor) {
    return;
  }

  // If the monitor is not active when the timer fires, it is likely stale.
  if (monitor.status !== 'ACTIVE') {
    clearMonitorTimer(id);
    return;
  }

  monitor.status = 'DOWN';
  monitor.updatedAt = Date.now();
  clearMonitorTimer(id);
  logTimeoutAlert(monitor);
};

const getExistingMonitor = (id) => {
  const monitor = monitors.get(id);
  if (!monitor) {
    const error = new Error(`Monitor with id '${id}' does not exist`);
    error.code = 'NOT_FOUND';
    throw error;
  }
  return monitor;
};

const startMonitorTimer = (monitor) => {
  if (!monitor || typeof monitor.timeout !== 'number' || monitor.timeout <= 0) {
    return;
  }

  clearMonitorTimer(monitor.id);

  const timer = setTimeout(() => expireMonitor(monitor.id), monitor.timeout);
  monitorTimers.set(monitor.id, timer);
};

const createMonitor = (payload) => {
  validateMonitorPayload(payload);

  const id = payload.id.trim();
  if (monitors.has(id)) {
    const error = new Error(`Monitor with id '${id}' already exists`);
    error.code = 'DUPLICATE_ID';
    throw error;
  }

  const timestamp = Date.now();
  const monitor = {
    id,
    name: payload.name ? payload.name.trim() : id,
    alert_email: payload.alert_email.trim(),
    timeout: Number(payload.timeout),
    status: 'ACTIVE',
    lastHeartbeat: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  monitors.set(id, monitor);
  startMonitorTimer(monitor);
  return monitor;
};

const getMonitor = (id) => monitors.get(id) || null;

const listMonitors = () => Array.from(monitors.values());

const heartbeatMonitor = (id) => {
  const monitor = getExistingMonitor(id);

  if (monitor.status === 'PAUSED' || monitor.status === 'DOWN') {
    monitor.status = 'ACTIVE';
  }

  monitor.lastHeartbeat = Date.now();
  monitor.updatedAt = monitor.lastHeartbeat;
  startMonitorTimer(monitor);

  return monitor;
};

const pauseMonitor = (id) => {
  const monitor = getExistingMonitor(id);

  // Stop the active timer and freeze the monitor in PAUSED state.
  // This ensures no timeout alert can fire while the monitor is paused.
  monitor.status = 'PAUSED';
  monitor.updatedAt = Date.now();
  clearMonitorTimer(id);

  return monitor;
};

const resumeMonitor = (id) => {
  const monitor = getExistingMonitor(id);

  monitor.status = 'ACTIVE';
  monitor.updatedAt = Date.now();
  startMonitorTimer(monitor);

  return monitor;
};

module.exports = {
  createMonitor,
  getMonitor,
  listMonitors,
  pauseMonitor,
  resumeMonitor,
  heartbeatMonitor
};
