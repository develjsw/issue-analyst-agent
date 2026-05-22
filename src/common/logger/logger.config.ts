import { Params } from 'nestjs-pino';

const isProd = process.env.NODE_ENV === 'production';

export const loggerConfig: Params = {
  pinoHttp: {
    level: isProd ? 'info' : 'debug',
    ...(!isProd && {
      transport: { target: 'pino-pretty', options: { singleLine: true } },
    }),
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        '*.password',
        '*.apiKey',
        '*.OPENAI_API_KEY',
      ],
      censor: '[REDACTED]',
    },
  },
};
