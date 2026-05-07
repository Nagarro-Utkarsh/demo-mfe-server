import { createElement } from 'react';
import { extname } from 'node:path';
import { RenderMode } from '../types.js';
import { renderToString } from 'react-dom/server';
import { readFileSync, existsSync } from 'node:fs';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { getFragmentPaths, getBuildId, loadFragment } from './shared.js';

const MIME: Record<string, string> = {
  '.css': 'text/css',
  '.map': 'application/json',
  '.js': 'application/javascript',
};

export async function getFragment(req: FastifyRequest, reply: FastifyReply) {
  const { pageName } = req.params as { pageName: string };
  const { ssrEntry, clientEntry, cssFile } = getFragmentPaths(pageName);

  if (!existsSync(ssrEntry))
    return reply
      .status(404)
      .send({ error: `Fragment "${pageName}" has not been built yet. Run: node build.js` });

  const buildId = getBuildId(pageName);
  const { css, mountId, Component, getServerData } = await loadFragment(pageName);

  const props = getServerData ? await getServerData(req.query) : undefined;
  let html = '';
  try {
    html = renderToString(createElement(Component, props));
  } catch (err) {
    console.error('SSR render error:', err);
  }
  const js = existsSync(clientEntry) ? readFileSync(clientEntry, 'utf-8') : '';
  const assetBase = `${req.protocol}://${req.host}/fragment/${pageName}`;

  reply.header('Cache-Control', 'no-store');
  return reply.send({
    js,
    css,
    html,
    props,
    mountId,
    jsUrl: existsSync(clientEntry) ? `${assetBase}/index.js?v=${buildId}` : '',
    cssUrl: existsSync(cssFile) ? `${assetBase}/index.css?v=${buildId}` : '',
  });
}

export async function postFragment(req: FastifyRequest, reply: FastifyReply) {
  const { pageName } = req.params as { pageName: string };
  const { data, mode = RenderMode.SSR } = req.body as {
    mode?: RenderMode;
    isServerData?: boolean;
    data?: Record<string, unknown>;
  };

  const { locale, tenantName, tenantEnv, countryCode, userType } = req.query as any;

  const { ssrEntry, clientEntry, cssFile } = getFragmentPaths(pageName);

  if (!existsSync(ssrEntry))
    return reply
      .status(404)
      .send({ error: `Fragment "${pageName}" has not been built yet. Run: node build.js` });

  const buildId = getBuildId(pageName);
  const { css, mountId, Component, getServerData } = await loadFragment(pageName);

  const query = {
    ...(req.query as Record<string, string>),
    ...((data as Record<string, string>) ?? {}),
  };
  const props = getServerData ? await getServerData(query) : data;
  let html = '';
  try {
    html = renderToString(createElement(Component, props));
  } catch (err) {
    console.error('SSR render error:', err);
  }
  const js = existsSync(clientEntry) ? readFileSync(clientEntry, 'utf-8') : '';
  const assetBase = `${req.protocol}://${req.host}/fragment/${pageName}`;

  reply.header('Cache-Control', 'no-store');
  return reply.send({
    js,
    css,
    html,
    props,
    mountId,
    jsUrl: existsSync(clientEntry) ? `${assetBase}/index.js?v=${buildId}` : '',
    cssUrl: existsSync(cssFile) ? `${assetBase}/index.css?v=${buildId}` : '',
  });
}

export async function getFragmentFile(req: FastifyRequest, reply: FastifyReply) {
  const { pageName, fileName } = req.params as { pageName: string; fileName: string };
  const { clientEntry } = getFragmentPaths(pageName);
  const { resolve } = await import('node:path');
  const { dirname } = await import('node:path');
  const filePath = resolve(dirname(clientEntry), fileName);

  if (!existsSync(filePath)) {
    return reply.status(404).send({
      error: `File "${fileName}" for fragment "${pageName}" was not found`,
    });
  }

  reply.header('Cache-Control', 'public, max-age=31536000, immutable');
  return reply
    .type(MIME[extname(fileName)] ?? 'application/octet-stream')
    .send(readFileSync(filePath));
}
