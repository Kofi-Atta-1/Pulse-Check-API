const { monitors } = require('../data/store');

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
    state: 'ACTIVE',
    createdAt: timestamp,
    updatedAt: timestamp
  };

  monitors.set(id, monitor);
  return monitor;
};

const getMonitor = (id) => monitors.get(id) || null;

const listMonitors = () => Array.from(monitors.values());

const pauseMonitor = (id) => null;

const resumeMonitor = (id) => null;

const heartbeatMonitor = (id) => null;

module.exports = {
  createMonitor,
  getMonitor,
  listMonitors,
  pauseMonitor,
  resumeMonitor,
  heartbeatMonitor
};
