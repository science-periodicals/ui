import { getAgent } from '@scipe/librarian';
import { unprefix, getId } from '@scipe/jsonld';

export default function getAgentName(
  agent,
  fallbackName = 'Anonymous contributor'
) {
  if (!agent) return fallbackName;

  agent = getAgent(agent);
  const agentId = getId(agent);

  return (
    agent.name ||
    (agent.givenName &&
      agent.familyName &&
      `${agent.givenName} ${agent.familyName}`) ||
    (agentId && unprefix(agentId)) ||
    (agent.email && agent.email.replace(/^mailto:/i, '')) ||
    fallbackName
  );
}
