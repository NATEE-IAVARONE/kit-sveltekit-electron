import winston, { loggers, format, transports } from 'winston';

const level = 'info';

const consoleTrans = new transports.Console({
  level,
  format: format.simple(),
});
winston.add(consoleTrans);

const defaultLogger = loggers.add('default', {
  level,
  format: format.combine(
    format.colorize(),
    format.json()
  ),
  defaultMeta: {},
  transports: [consoleTrans],
});

const serverLogger = defaultLogger.child({
  ...defaultLogger.defaultMeta,
  domain: `server`,
});
const toolsLogger = serverLogger.child({
  ...serverLogger.defaultMeta,
  domain: `server.tools`,
  toolName: 'myToolName',
});
const canvasLogger = toolsLogger.child({
  ...toolsLogger.defaultMeta,
  domain: `server.tools.canvas`,
  canvasName: 'myCanvasName',
});

loggers.loggers.set('server', serverLogger);
loggers.loggers.set('server.tools', toolsLogger);
loggers.loggers.set('server.tools.canvas', canvasLogger);

export async function handle({ event, resolve }) {
  if (event.url.pathname.startsWith('/custom')) {
    return new Response('custom response');
  }
	serverLogger.info('handle', { event });
 
  const response = await resolve(event);

  return response;
}