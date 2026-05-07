import type { FastifyRequest, FastifyReply } from 'fastify';
import type { NavFragment } from '../types.js';
import { PORT } from '../env.js';
import { fragments as registeredFragments, defaultFragment } from '../fragment.config.js';

const navFragments: NavFragment[] = registeredFragments.map((f) => ({
  name: f.name,
  label: f.label ?? f.name,
  description: f.description ?? '',
}));

const buildShellContext = (initialFragment?: string) => ({
  defaultFragment,
  fragments: navFragments,
  port: PORT,
  ...(initialFragment ? { initialFragment } : {}),
});

export async function redirectToPreview(_req: FastifyRequest, reply: FastifyReply) {
  return reply.redirect('/preview');
}

export async function getPreview(_req: FastifyRequest, reply: FastifyReply) {
  return reply.view('index', buildShellContext());
}

export async function getPreviewByPage(req: FastifyRequest, reply: FastifyReply) {
  const { pageName } = req.params as { pageName: string };
  return reply.view('index', buildShellContext(pageName));
}
