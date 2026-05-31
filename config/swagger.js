const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Pulse-Check-API',
    description: 'A minimal Dead Man\'s Switch API for device monitoring',
    version: '1.0.0'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    }
  ],
  components: {
    schemas: {
      MonitorCreateRequest: {
        type: 'object',
        required: ['id', 'timeout', 'alert_email'],
        properties: {
          id: {
            type: 'string',
            example: 'device-123'
          },
          timeout: {
            type: 'number',
            description: 'Timeout in milliseconds before the monitor expires',
            example: 60000
          },
          alert_email: {
            type: 'string',
            example: 'admin@critmon.com'
          },
          name: {
            type: 'string',
            example: 'Solar Farm A'
          }
        }
      },
      MonitorResponse: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          alert_email: { type: 'string' },
          timeout: { type: 'number' },
          status: { type: 'string', example: 'ACTIVE' },
          lastHeartbeat: { type: 'number', format: 'int64' },
          createdAt: { type: 'number', format: 'int64' },
          updatedAt: { type: 'number', format: 'int64' }
        }
      },
      HeartbeatResponse: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          status: { type: 'string', example: 'ACTIVE' },
          lastHeartbeat: { type: 'number', format: 'int64' },
          updatedAt: { type: 'number', format: 'int64' }
        }
      }
    }
  },
  paths: {
    '/monitors': {
      post: {
        summary: 'Create a new monitor',
        tags: ['Monitors'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MonitorCreateRequest' }
            }
          }
        },
        responses: {
          201: {
            description: 'Monitor created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MonitorResponse' }
              }
            }
          },
          400: {
            description: 'Validation error'
          },
          409: {
            description: 'Monitor ID already exists'
          }
        }
      },
      get: {
        summary: 'List all monitors',
        tags: ['Monitors'],
        responses: {
          200: {
            description: 'List of monitors',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    monitors: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/MonitorResponse' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/monitors/{id}': {
      get: {
        summary: 'Get a single monitor',
        tags: ['Monitors'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'Monitor details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MonitorResponse' }
              }
            }
          },
          404: {
            description: 'Monitor not found'
          }
        }
      }
    },
    '/monitors/{id}/heartbeat': {
      post: {
        summary: 'Send a heartbeat to reset the monitor timer',
        tags: ['Monitors'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'Heartbeat received',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HeartbeatResponse' }
              }
            }
          },
          404: {
            description: 'Monitor not found'
          }
        }
      }
    },
    '/monitors/{id}/pause': {
      post: {
        summary: 'Pause a monitor',
        tags: ['Monitors'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'Monitor paused',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MonitorResponse' }
              }
            }
          },
          404: {
            description: 'Monitor not found'
          }
        }
      }
    },
    '/monitors/{id}/resume': {
      post: {
        summary: 'Resume a monitor',
        tags: ['Monitors'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'Monitor resumed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MonitorResponse' }
              }
            }
          },
          404: {
            description: 'Monitor not found'
          }
        }
      }
    }
  }
};

module.exports = swaggerSpec;
