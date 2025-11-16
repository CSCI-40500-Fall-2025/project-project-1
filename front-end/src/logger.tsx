import log from 'loglevel';

// Use lowest level for CI / testing
log.setLevel('trace'); // capture all logs

// Action logger 
const logAction = (
  level: 'error' | 'warn' | 'info' | 'debug' | 'trace',
  action: string,
  details?: string
) => {
  const time = new Date().toISOString();
  const message = `[${time}] [ACTION] ${action}${details ? `: ${details}` : ''}`;
  log[level](message);
};

export default logAction; 
