import Fastify from 'fastify';
import view from '@fastify/view';
import Handlebars from 'handlebars';
import compress from '@fastify/compress';
import proxy from '@fastify/http-proxy';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  redirectToPreview,
  getPreview,
  getPreviewByPage,
} from './controller/preview.controller.js';
import { getStandalone } from './controller/standalone.controller.js';
import { getFragment, postFragment, getFragmentFile } from './controller/fragment.controller.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function buildApp() {
  const fastify = Fastify({ logger: false, bodyLimit: 10000000000000 });

  await fastify.register(compress, {
    encodings: ['gzip', 'deflate'],
    customTypes: /^text\/(html|css)$/,
  });

  await fastify.register(view, {
    engine: { handlebars: Handlebars },
    root: resolve(__dirname, 'views'),
  });

  fastify.addHook('onRequest', async (_req, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
  });

  fastify.get('/', redirectToPreview);
  fastify.get('/preview', getPreview);
  fastify.get('/preview/:pageName', getPreviewByPage);
  fastify.get('/fragment/:pageName', getFragment);
  fastify.get('/standalone/:pageName/:locale', getStandalone);
  fastify.post('/fragment/:pageName', postFragment);
  fastify.get('/fragment/:pageName/:fileName', getFragmentFile);

  if (process.env.ENABLE_API_PROXY === 'true') {
    await fastify.register(proxy, {
      prefix: '/api',
      rewritePrefix: '/api',
      upstream: process.env.API_PROXY_UPSTREAM ?? 'http://local-dev.amway-global.net:10000',
    });
  }

  return fastify;
}
