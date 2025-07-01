import client from 'prom-client';

// Create registry
export const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ register });

export const promClient = client;
