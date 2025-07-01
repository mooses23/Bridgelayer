import { StatsD } from 'node-statsd';

export const statsd = new StatsD({
  host: process.env.DATADOG_AGENT_HOST || 'localhost',
  port: parseInt(process.env.DATADOG_AGENT_PORT || '8125', 10),
  prefix: 'firmsync.',
  errorHandler: (error) => {
    console.error('StatsD error:', error);
  },
});
