const express = require('express');
const router = express.Router();
const monitorService = require('../services/monitorService');

router.post('/', (req, res) => {
  try {
    const monitor = monitorService.createMonitor(req.body);
    return res.status(201).json({ message: 'Monitor created', monitor });
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ error: error.message });
    }

    if (error.code === 'DUPLICATE_ID') {
      return res.status(409).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Unexpected error creating monitor' });
  }
});

router.post('/:id/heartbeat', (req, res) => {
  try {
    const monitor = monitorService.heartbeatMonitor(req.params.id);
    return res.status(200).json({ message: 'Heartbeat received', monitor });
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Unexpected heartbeat error' });
  }
});

router.post('/:id/pause', (req, res) => {
  try {
    const monitor = monitorService.pauseMonitor(req.params.id);
    return res.status(200).json({ message: 'Monitor paused', monitor });
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Unexpected pause error' });
  }
});

router.post('/:id/resume', (req, res) => {
  try {
    const monitor = monitorService.resumeMonitor(req.params.id);
    return res.status(200).json({ message: 'Monitor resumed', monitor });
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Unexpected resume error' });
  }
});

router.get('/', (req, res) => {
  res.json({ monitors: monitorService.listMonitors() });
});

router.get('/:id', (req, res) => {
  const monitor = monitorService.getMonitor(req.params.id);
  if (!monitor) {
    return res.status(404).json({ error: `Monitor with id '${req.params.id}' does not exist` });
  }
  return res.json({ monitor });
});

module.exports = router;
