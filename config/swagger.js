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
  paths: {
    '/monitors': {
      post: {
        summary: 'Create a new monitor',
        tags: ['Monitors'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['id', 'timeout', 'alert_email'],
                properties: {
                  id: {
                    type: 'string',
                    example: 'device-123'
                  },
                  timeout: {
                    type: 'number',
                    example: 60
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
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Monitor created successfully'
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
            description: 'List of monitors'
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
            description: 'Monitor details'
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
            description: 'Heartbeat received'
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
            description: 'Monitor paused'
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
            description: 'Monitor resumed'
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
