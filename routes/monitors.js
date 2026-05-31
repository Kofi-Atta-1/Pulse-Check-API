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
    const result = monitorService.heartbeatMonitor(req.params.id);
    return res.status(200).json({ message: 'Heartbeat received', result });
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Unexpected heartbeat error' });
  }
});

router.post('/:id/pause', (req, res) => {
  try {
    const result = monitorService.pauseMonitor(req.params.id);
    return res.status(200).json({ message: 'Monitor paused', result });
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Unexpected pause error' });
  }
});

router.post('/:id/resume', (req, res) => {
  try {
    const result = monitorService.resumeMonitor(req.params.id);
    return res.status(200).json({ message: 'Monitor resumed', result });
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
  res.json({ monitor: monitorService.getMonitor(req.params.id) });
});

module.exports = router;
