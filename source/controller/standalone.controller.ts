import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { existsSync } from 'node:fs';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { getFragmentPaths, getBuildId, loadFragment } from './shared.js';


export async function getStandalone(req: FastifyRequest, reply: FastifyReply) {
  const { pageName } = req.params as { pageName: string};
  const { ssrEntry, clientEntry, cssFile } = getFragmentPaths(pageName);

  if (!existsSync(ssrEntry))
    return reply
      .status(404)
      .type('text/html')
      .send(`<p>Fragment "${pageName}" not found. Run: node build.js</p>`);

  const buildId = getBuildId(pageName);
  const { mountId, css, Component, getServerData } = await loadFragment(pageName);
  const base = `/fragment/${pageName}`;

  const query = { ...(req.query as Record<string, string>) };
  const props = getServerData ? await getServerData(query) : undefined;
  let html = '';
  try {
    html = renderToString(createElement(Component, props));
  } catch (err) {
    console.error('SSR render error:', err);
  }

  reply.header('Cache-Control', 'no-store');
  return reply.view('standalone', {
    pageName,
    mountId,
    html,
    css,
    propsJson: JSON.stringify(props),
    cssUrl: existsSync(cssFile) ? `${base}/index.css?v=${buildId}` : '',
    jsUrl: existsSync(clientEntry) ? `${base}/index.js?v=${buildId}` : '',
    ...({}),
  });
}
