import winston, { loggers, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import treeify from 'object-treeify';

const dailyRotateFileTransport = new DailyRotateFile({
  dirname: 'logs',
  filename: 'kit-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14'
});

const treeFormat = winston.format((info) => {
  
  info.message = '\n\n' + treeify(info);
  
  return info;
})();

const level = 'info';

const consoleTrans = new transports.Console({
  level,
  format: format.combine(
    treeFormat,
    format.printf(info => info.message)
  )
});
winston.add(consoleTrans);

const defaultLogger = loggers.add('default', {
  level,
  format: format.combine(
    format.colorize(),
    format.json()
  ),
  defaultMeta: {},
  transports: [consoleTrans, dailyRotateFileTransport],
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
const formLogger = toolsLogger.child({
  ...toolsLogger.defaultMeta,
  domain: `server.tools.form`,
  formName: 'myFormName',
});
const canvasLogger = toolsLogger.child({
  ...toolsLogger.defaultMeta,
  domain: `server.tools.canvas`,
  canvasName: 'myCanvasName',
});
const canvasImageLogger = canvasLogger.child({
  ...canvasLogger.defaultMeta,
  domain: `server.tools.canvas.images`,
  imageName: 'myImageName',
});

loggers.loggers.set('server', serverLogger);
loggers.loggers.set('server.tools', toolsLogger);
loggers.loggers.set('server.tools.form', formLogger);
loggers.loggers.set('server.tools.canvas', canvasLogger);
loggers.loggers.set('server.tools.canvas.images', canvasImageLogger);

// export async function handle({ event, resolve }) {
//   if (event.url.pathname.startsWith('/custom')) {
//     return new Response('custom response');
//   }
// 	serverLogger.info('handle', { event });
 
//   const response = await resolve(event);

//   return response;
// }
