import winston, { loggers, format, transports } from 'winston';
import Transport from 'winston-transport';
import DailyRotateFile from 'winston-daily-rotate-file';
import treeify from 'object-treeify';
import { set } from 'lodash-es';

function cleanDomainSection(domSec:string) {
  return domSec.split('_')[0];
}

class CustomTransport extends Transport {
  constructor(opts?: winston.transport.TransportStreamOptions | undefined) {
    super(opts);

    //
    // Consume any custom options here. e.g.:
    // - Connection information for databases
    // - Authentication information for APIs (e.g. loggly, papertrail,
    //   logentries, etc.).
    //
  }

  refined = {};

  log(info, callback) {

    const domain: string = info.domain;
    
    set(this.refined, domain, {});

    const domainSections = domain.split('.');

    Object.entries(info).forEach(([key, val]) => {
      const sections = key.split('_');
      if (sections.length === 1) return;

      const cleanSection = cleanDomainSection(sections[0]);

      const baseIndex = domainSections.findIndex(domSec => {
        const cleanDomSec = cleanDomainSection(domSec);

        return cleanDomSec === cleanSection;
      });

      //const baseIndex = domainSections.indexOf(cleanSection);
      if (baseIndex < 0) return;

      sections.shift();
      sections.unshift(...domainSections.slice(0, baseIndex + 1));

      const dotNotation = sections.join('.');
      console.log({dotNotation});
      set(this.refined, dotNotation, val);
    });


    console.log('\n\n' + treeify(this.refined));

    callback();
  }
};

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
  transports: [consoleTrans, dailyRotateFileTransport, new CustomTransport()],
});

const serverLogger = defaultLogger.child({
  ...defaultLogger.defaultMeta,
  domain: `server`,
});
const toolLogger = serverLogger.child({
  ...serverLogger.defaultMeta,
  domain: `server.tool`,
});
const formLogger = toolLogger.child({
  ...toolLogger.defaultMeta,
  domain: `server.tool.form`,
});
const canvasLogger = toolLogger.child({
  ...toolLogger.defaultMeta,
  domain: `server.tool.canvas`,
});
const canvasImageLogger = canvasLogger.child({
  ...canvasLogger.defaultMeta,
  domain: `server.tool.canvas.image`,
});

loggers.loggers.set('server', serverLogger);
loggers.loggers.set('server.tool', toolLogger);
loggers.loggers.set('server.tool.form', formLogger);
loggers.loggers.set('server.tool.canvas', canvasLogger);
loggers.loggers.set('server.tool.canvas.image', canvasImageLogger);

// export async function handle({ event, resolve }) {
//   if (event.url.pathname.startsWith('/custom')) {
//     return new Response('custom response');
//   }
// 	serverLogger.info('handle', { event });
 
//   const response = await resolve(event);

//   return response;
// }
