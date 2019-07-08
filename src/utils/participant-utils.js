import { getId, arrayify, getNodeMap } from '@scipe/jsonld';

/**
 * Return value helping to decide if user can / should invite additional
 * participants for the role `roleName`
 */
export function getWorkflowParticipantsAclData(
  user,
  acl,
  roleName,
  workflowSpecification = {},
  graph = {}
) {
  const createGraphAction = arrayify(workflowSpecification.potentialAction)[0];
  const nodeMap = getNodeMap(
    arrayify(
      createGraphAction &&
        createGraphAction.result &&
        createGraphAction.result['@graph']
    )
  );

  const participantNeeded = Object.values(nodeMap).some(node => {
    if (roleName === 'producer' && arrayify(node.potentialService).length) {
      return true;
    }

    const nodeId = getId(node);
    if (nodeId && nodeId.startsWith('workflow:')) {
      const agent = nodeMap[getId(node.agent)];
      if (agent) {
        return agent.roleName === roleName;
      }
    }
  });

  const canAddParticipant =
    !graph.datePublished &&
    !graph.dateRejected &&
    participantNeeded &&
    ((acl.checkPermission(user, 'AdminPermission') ||
      acl.checkPermission(user, 'ReadPermission') ||
      acl.checkPermission(user, 'WritePermission')) &&
      acl.checkPermission(user, 'InvitePermission', {
        permissionScope: roleName
      }));

  return {
    participantNeeded,
    canAddParticipant
  };
}
