import groupBy from 'lodash/groupBy';
import uniqBy from 'lodash/uniqBy';
import uniq from 'lodash/uniq';
import flatten from 'lodash/flatten';
import capitalize from 'lodash/capitalize';
import decamelize from 'decamelize';
import { getId, arrayify, getNodeMap, unprefix } from '@scipe/jsonld';
import {
  getScopeId,
  schema,
  getActiveRoles,
  getParts,
  getAgent,
  getRootPart
} from '@scipe/librarian';
import ds3Mime from '@scipe/ds3-mime';
import { WORKFLOW_ROLE_NAMES } from '../constants';

export function getDisplayName(
  blindingData,
  role = {},
  {
    subject,
    alwaysPrefix,
    name, // fallback for role.name (subRoleName)
    roleName = 'user' /* fallback */,
    addAnonymousDisplayName = true,
    addRoleNameSuffix = false
  } = {}
) {
  // For action editable offline, role may miss the userId => we resolve it here
  role = blindingData.resolve(role);

  roleName = role.roleName || roleName;
  const unroled = getAgent(role);

  const unroledId = getId(unroled);

  const isBlinded = blindingData.isBlinded(role, { roleName });
  const anonymousIdentifier = blindingData.getAnonymousIdentifier(role, {
    roleName
  });

  subject = subject || roleName;
  const anonymousName =
    anonymousIdentifier != null
      ? `${alwaysPrefix ? 'Anonymous ' : ''}${capitalize(
          subject
        )} ${anonymousIdentifier}`
      : `Anonymous ${subject}`; // we don't know the index so we use Anonymous to make it clear

  if (isBlinded) {
    return anonymousName;
  }

  // Not anonymous
  let displayName;
  if (unroledId && unroledId.startsWith('user:')) {
    displayName = capitalize(unprefix(unroledId));
  } else {
    displayName = unroled.name || unroled.alternateName || roleName;
  }

  if (
    !blindingData.allVisible &&
    addAnonymousDisplayName &&
    anonymousIdentifier != null
  ) {
    displayName = `${displayName} "${anonymousName}"`;
  }

  if (addRoleNameSuffix && roleName !== 'user') {
    displayName = `${displayName} (${(role && role.name) || name || roleName})`;
  }

  return displayName;
}

export function getUserBadgeLabel(
  blindingData,
  role = {},
  { roleName = 'user' /* fallback */ } = {}
) {
  // For action editable offline, role may miss the userId => we resolve it here
  role = blindingData.resolve(role);

  roleName = role.roleName || roleName;
  const isBlinded = blindingData.isBlinded(role, { roleName });
  if (isBlinded) {
    const anonymousIdentifier = blindingData.getAnonymousIdentifier(role, {
      roleName
    });
    if (anonymousIdentifier != null) {
      return `${roleName.charAt(0).toUpperCase()}${anonymousIdentifier}`;
    }
    return;
  }

  const unroled = getAgent(role);
  const unroledId = getId(unroled);
  if (unroledId && unroledId.startsWith('user:')) {
    return unprefix(unroledId)
      .charAt(0)
      .toUpperCase();
  }
}

/**
 * Get an `object` Periodical.
 * `object` is typically a Graph or a Periodical
 */
export function getPeriodical(object) {
  if (object && object.isPartOf) {
    const rootPart = getRootPart(object);
    if (schema.is(rootPart, 'Periodical')) {
      return rootPart;
    }
  }

  if (schema.is(object, 'Periodical')) {
    return object;
  }
}

export function getDisplayOrganizationClasses() {
  return uniq(
    ['Organization'].concat(
      // all subclasses
      flatten(
        [
          'Corporation',
          'EducationalOrganization',
          'GovernmentOrganization'
        ].map(type =>
          [type].concat(Array.from(schema.getSubClasses(type, true)))
        )
      ),
      // random pick
      ['NGO', 'Hospital']
    )
  ).map(type => {
    const label =
      type === 'NGO'
        ? type
        : decamelize(type, '_')
            .split('_')
            .map(part => capitalize(part))
            .join(' ');

    return { type, label };
  });
}

export function getDisplaySize(encoding) {
  let size = encoding.contentSize;
  if (size != null) {
    if (size < 1000) {
      // bytes
      size = size + 'B';
    } else if (size < 1e6) {
      // KB
      size = Math.round(size / 1000) + 'KB';
    } else {
      // MB
      size = Math.round(size / 1e6) + 'MB';
    }
  }
  return size;
}

export function getCssType(resourceType) {
  resourceType =
    resourceType && typeof resourceType === 'object'
      ? resourceType['@type']
      : resourceType;

  // see CSS for available classes
  if (
    schema.is(resourceType, 'Image') ||
    schema.is(resourceType, 'ImageObject')
  ) {
    return 'image';
  }
  if (
    schema.is(resourceType, 'Video') ||
    schema.is(resourceType, 'VideoObject')
  ) {
    return 'video';
  }
  if (
    schema.is(resourceType, 'Audio') ||
    schema.is(resourceType, 'AudioObject')
  ) {
    return 'audio';
  }
  if (
    schema.is(resourceType, 'Dataset') ||
    schema.is(resourceType, 'DataDownload')
  ) {
    return 'data';
  }
  if (
    schema.is(resourceType, 'Table') ||
    schema.is(resourceType, 'TableObject')
  ) {
    return 'table';
  }
  if (
    schema.is(resourceType, 'ScholarlyArticle') ||
    schema.is(resourceType, 'DocumentObject')
  ) {
    return 'text';
  }
  if (
    schema.is(resourceType, 'Formula') ||
    schema.is(resourceType, 'FormulaObject')
  ) {
    return 'formula';
  }
  if (
    schema.is(resourceType, 'SoftwareSourceCode') ||
    schema.is(resourceType, 'SoftwareSourceCodeObject')
  ) {
    return 'code';
  }
  return 'other';
}

export function getIconNameFromSchema(
  thing = {},
  fallbackIconName = 'fileText'
) {
  const type = thing['@type'] || thing;

  switch (type) {
    case 'Image':
    case 'ImageObject':
      return 'fileImage';

    case 'Audio':
    case 'AudioObject':
      return 'fileAudio';

    case 'Video':
    case 'VideoObject':
      return 'fileMedia';

    case 'Table':
    case 'TableObject':
    case 'Dataset':
    case 'DataDownload':
      return 'fileData';

    case 'Article':
    case 'ScholarlyArticle':
    case 'DocumentObject':
      if (
        arrayify(thing.encoding)
          .concat(thing)
          .some(
            encoding =>
              encoding.fileFormat && encoding.fileFormat.startsWith(ds3Mime)
          )
      ) {
        return 'ds3';
      }
      // TODO 'manuscript' instead ?
      return 'fileText';

    case 'SoftwareSourceCode':
    case 'SoftwareSourceCodeObject':
      return 'fileCode';

    case 'Formula':
    case 'FormulaObject':
      return 'fileFormula';

    case 'AllocateAction':
      return 'compassRound';
    case 'DeclareAction':
      return 'declaration';
    case 'AssessAction':
      return 'gavel';
    case 'CreateOfferAction':
      return 'priceTag';

    case 'SubmitAction':
    case 'CreateReleaseAction':
      return 'publish';

    case 'JoinAction':
    case 'InviteAction':
    case 'AuthorizeContributorAction':
      return 'personAdd';

    case 'LeaveAction':
    case 'DeauthorizeContributorAction':
      return 'personOutline';

    case 'CheckAction':
      return 'signature';
    case 'BuyAction':
      return 'priceTag';
    case 'PayAction':
      return 'money';
    case 'ReviewAction':
      return 'glasses';
    case 'ScheduleAction':
      return 'calendar';
    case 'TagAction':
      return 'label';
    case 'EndorseAction':
      return 'thumbUp';
    case 'CommentAction':
      return 'comment';
    case 'TypesettingAction':
      return 'formatSize';

    case 'DeauthorizeAction':
      return 'delete';
    case 'AuthorizeAction':
      return 'admin';
    case 'CreateGraphAction':
      return 'star';
    case 'CreatePeriodicalAction':
      return 'journal';
    case 'UpdateAction':
      return 'statusPass';
    case 'AssignAction':
      return 'supervisor';
    case 'UnassignAction':
      return 'personUnassigned';
    case 'PrepareAction':
      if (thing.actionStatus === 'PotentialActionStatus') {
        return 'warning';
      }
      return 'pencil';
    case 'WaitAction':
      return 'time';
    // status facet
    case 'active':
      return 'layers';
    case 'published':
      return 'statusPass';
    case 'rejected':
      return 'statusError';

    default:
      return fallbackIconName;
  }
}

/**
 * resource can be a list of encoding
 */
export function getRootEncoding(resource = {}) {
  const encodings = Array.isArray(resource)
    ? resource
    : arrayify(resource.distribution || resource.encoding);
  const nodeMap = getNodeMap(encodings);

  let root = encodings[0];
  if (!root) return;
  let tmp;
  while ((tmp = nodeMap[getId(root.isBasedOn)])) {
    root = tmp;
  }

  return root;
}

export function getParentResource(resourceId, resourceIds, nodeMap) {
  if (resourceId == null) {
    return;
  }
  for (let key of resourceIds) {
    if (key !== resourceId && nodeMap[key]) {
      if (
        nodeMap[key].hasPart &&
        ~arrayify(nodeMap[key].hasPart).indexOf(resourceId)
      ) {
        return nodeMap[key];
      }
    }
  }
}

export function getPotentialDependencies(resourceId, resourceIds, resourceMap) {
  const resource = resourceMap[resourceId];
  if (!resource) return [];
  const isBasedOn = new Set(resource.isBasedOn || []);
  return resourceIds.filter(rId => {
    return rId !== resourceId && !isBasedOn.has(rId);
  });
}

export function getRequirements(resourceId, nodeMap) {
  let requirements = {};

  const partIds = [resourceId]
    .concat(getParts(resourceId, nodeMap))
    .map(getId)
    .filter(Boolean);
  for (let partId of partIds) {
    const node = nodeMap[partId];
    if (node && node.isBasedOn) {
      arrayify(node.isBasedOn).forEach(base => {
        const id = getId(base);
        if (id in requirements) {
          requirements[id].add(partId);
        } else {
          requirements[id] = new Set([partId]);
        }
      });
    }
  }

  return requirements;
}

/**
 * get resources dependent on resourceId
 */
export function getDependents(resourceId, resourceIds = [], nodeMap = {}) {
  if (resourceId == null) return [];

  let dependents = new Set();
  for (let key of resourceIds) {
    const node = nodeMap[key];
    if (node) {
      const rId = getId(node);
      if (node.isBasedOn && ~arrayify(node.isBasedOn).indexOf(resourceId)) {
        dependents.add(rId);
      }
    }
  }
  return Array.from(dependents);
}

export function isDeprecatedResource(resourceId, nodeMap = {}) {
  // To be deprecated, a resource has a root encoding based on an encoding that doesn't belong anymore to any of the parent resource encoded by a DocumentObject
  const resource = nodeMap[getId(resourceId)];
  if (!resource) return false;

  const sourceEncodingIds = new Set();
  let rootId = getId(resource.isPartOf);
  while (rootId) {
    const root = nodeMap[rootId];
    if (root) {
      rootId = getId(root.isPartOf);
      arrayify(root.encoding)
        .concat(arrayify(root.distribution))
        .forEach(encodingId => {
          const encoding = nodeMap[getId(encodingId)];
          if (encoding && schema.is(encoding, 'DocumentObject')) {
            sourceEncodingIds.add(getId(encoding));
          }
        });
    } else {
      rootId = null;
    }
  }
  if (!sourceEncodingIds.size) return false;

  if (schema.is(resource, 'Image') && !resource.encoding) {
    // multi part figure case
    return arrayify(resource.hasPart).some(partId =>
      isDeprecatedResource(partId, nodeMap)
    );
  }

  const encodings = arrayify(resource.distribution || resource.encoding)
    .map(encodingId => nodeMap[getId(encodingId)])
    .filter(Boolean);

  const rootEncoding = getRootEncoding(encodings);
  if (!rootEncoding) return false;

  return arrayify(rootEncoding.isBasedOn).some(uri => {
    uri = getId(uri);
    if (!uri) return false;
    return !sourceEncodingIds.has(uri);
  });
}

export function getResourceTree(resourceId, nodeMap, { sort = false } = {}) {
  resourceId = getId(resourceId);
  const resource = nodeMap[resourceId];

  let parts;
  if (resource) {
    parts = arrayify(resource.hasPart).filter(part => {
      return !isDeprecatedResource(part, nodeMap);
    });

    if (sort) {
      parts.sort((a, b) => {
        const rA = nodeMap[getId(a)] || a;
        const rB = nodeMap[getId(b)] || b;
        return compareResources(rA, rB);
      });
    }
  }

  const tree = {
    '@id': resourceId
  };

  if (parts && parts.length) {
    tree.hasPart = parts.map(part =>
      getResourceTree(getId(part), nodeMap, { sort })
    );
  }

  return tree;
}

export function getResourceInfo(
  graph,
  nodeMap,
  {
    strict = true, // only follow mainEntity
    sort = false
  } = {}
) {
  if (!graph) {
    graph = {};
  }
  if (!nodeMap) {
    nodeMap = getNodeMap(graph);
  }

  let resourceIds, topLevel;
  if (strict) {
    const mainEntityId = getId(graph.mainEntity);
    if (mainEntityId) {
      resourceIds = [getId(graph.mainEntity)]
        .concat(getParts(graph.mainEntity, nodeMap).sort(compareResources))
        .map(getId)
        .filter(id => {
          return !isDeprecatedResource(id, nodeMap);
        });
      topLevel = [getId(graph.mainEntity)];
    } else {
      resourceIds = [];
      topLevel = [];
    }
  } else {
    // legacy

    let resourceIds = [];
    let graphId = getId(graph);
    if (graphId) {
      graphId = graphId.split('?')[0];
    }
    const partIds = new Set();

    Object.keys(nodeMap).forEach(nodeId => {
      const node = nodeMap[nodeId];
      if (getScopeId(getId(node.resourceOf)) === getScopeId(graphId)) {
        resourceIds.push(nodeId);
      }

      arrayify(node.hasPart).forEach(part => {
        const partId = getId(part);
        if (partId) {
          partIds.add(partId);
        }
      });
    });

    const mainEntityId = getId(graph.mainEntity);
    resourceIds = resourceIds
      .filter(id => {
        return !isDeprecatedResource(id, nodeMap);
      })
      .filter(id => id !== mainEntityId);

    if (sort) {
      resourceIds.sort((a, b) => {
        const rA = nodeMap[getId(a)] || a;
        const rB = nodeMap[getId(b)] || b;
        return compareResources(rA, rB);
      });
    }
    if (mainEntityId && !isDeprecatedResource(mainEntityId, nodeMap)) {
      resourceIds.unshift(mainEntityId);
    }

    topLevel = resourceIds.filter(id => !partIds.has(id));
  }

  const resourceTree = topLevel
    .map(id => getResourceTree(id, nodeMap, { sort }))
    .reduce((resourceTree, subTree) => {
      return resourceTree.concat(subTree);
    }, []);

  return { resourceIds, resourceTree };
}

export function compareResources(a, b) {
  if (
    typeof a.position === 'number' &&
    typeof b.position === 'number' &&
    !isNaN(a.position) &&
    !isNaN(b.position)
  ) {
    return a.position - b.position;
  }

  let nameA = a.alternateName || a.name;
  let nameB = b.alternateName || b.name;

  // missing names sort last
  if (nameA != null && nameB == null) return -1;
  if (nameA == null && nameB != null) return 1;
  if (nameA == null && nameB == null) {
    const idA = getId(a);
    const idB = getId(b);
    if (idA != null && idB != null) {
      return idA.localeCompare(idB);
    } else {
      return 0;
    }
  }

  // supplementals get behind
  const suprx = /^\s*(supplemental|supporting|supplementary)/i;
  if (!suprx.test(nameA) && suprx.test(nameB)) return -1;
  if (suprx.test(nameA) && !suprx.test(nameB)) return 1;

  // sort numbers numerically for the same text part
  if (!/\d+$/.test(nameA)) nameA += '0';
  if (!/\d+$/.test(nameB)) nameB += '0';
  let [, strA, numA] = nameA.match(/^(.*?)(\d+)$/);
  let [, strB, numB] = nameB.match(/^(.*?)(\d+)$/);

  if (strA === strB) {
    numA = parseInt(numA, 10);
    numB = parseInt(numB, 10);
    if (numA < numB) return -1;
    if (numA > numB) return 1;
    return 0;
  }
  return strA.localeCompare(strB);
}

export function forEachResource(resourceTree, callback, ctx) {
  (Array.isArray(resourceTree)
    ? resourceTree
    : arrayify(resourceTree.hasPart)
  ).forEach(r => {
    callback.call(ctx || this, r);
    if (r.hasPart) {
      forEachResource(r, callback, ctx);
    }
  });
}

export function getResourceParts(node) {
  if (!node || !node.hasPart) {
    return [];
  }
  return arrayify(node.hasPart).reduce((prev, curr) => {
    var next = prev.concat(curr, getResourceParts(curr));
    return next;
  }, []);
}

/**
 * Note `object` is a resourceTree or a resource
 */
export function findResource(resourceId, object) {
  if (resourceId == null || object == null) {
    return;
  } else if (resourceId === (object['@id'] || object)) {
    return object;
  }

  if (Array.isArray(object) || object.hasPart) {
    const source = Array.isArray(object) ? object : arrayify(object.hasPart);
    for (let i = 0; i < source.length; i++) {
      var targetResource = findResource(resourceId, source[i]);
      if (targetResource != null) {
        return targetResource;
      }
    }
  }
}

export function getViewIdentityPermissionMatrix(permissions) {
  // Note: this is computed _without_ the public audience as the public audience is typically added after acceptance

  return WORKFLOW_ROLE_NAMES.map(rowRoleName => {
    const rowPermission = arrayify(permissions).find(permission => {
      return (
        permission.permissionType === 'ViewIdentityPermission' &&
        arrayify(permission.grantee).some(grantee => {
          return grantee.audienceType === rowRoleName;
        })
      );
    });
    const scopes = new Set(
      arrayify(rowPermission && rowPermission.permissionScope).map(
        permissionScope => {
          return permissionScope.audienceType;
        }
      )
    );
    return WORKFLOW_ROLE_NAMES.map(columnRoleName => {
      return scopes.has(columnRoleName);
    });
  });
}

export function getViewIdentityPermission(matrix) {
  const grouped = groupBy(WORKFLOW_ROLE_NAMES, roleName =>
    JSON.stringify(matrix[WORKFLOW_ROLE_NAMES.indexOf(roleName)])
  );

  return Object.keys(grouped)
    .filter(key => {
      return matrix[WORKFLOW_ROLE_NAMES.indexOf(grouped[key][0])].some(
        bool => bool
      );
    })
    .map(key => {
      return {
        '@type': 'DigitalDocumentPermission',
        permissionType: 'ViewIdentityPermission',
        grantee: grouped[key].map(roleName => {
          return {
            '@type': 'Audience',
            audienceType: roleName
          };
        }),
        permissionScope: WORKFLOW_ROLE_NAMES.filter(roleName => {
          return matrix[WORKFLOW_ROLE_NAMES.indexOf(grouped[key][0])][
            WORKFLOW_ROLE_NAMES.indexOf(roleName)
          ];
        }).map(roleName => {
          return {
            '@type': 'Audience',
            audienceType: roleName
          };
        })
      };
    });
}

/**
 * `object` is a Graph (release) or a workflow (CreateGraphAction)
 */
export function checkOpenAccess(object = {}) {
  // For now everything is OA...
  return true;
}

export function getWorkflowStageAssessAction(stage, nodeMap) {
  let assessActionId;
  assessActionId = getId(
    arrayify(stage.result).find(actionId => {
      const action = nodeMap[getId(actionId)];
      return action && action['@type'] === 'AssessAction';
    })
  );

  if (assessActionId == null) {
    // AssessAction may be a potential action of a CreateReleaseAction
    const createReleaseActionId = getId(
      arrayify(stage.result).find(actionId => {
        const action = nodeMap[getId(actionId)];
        return action && action['@type'] === 'CreateReleaseAction';
      })
    );
    const createReleaseAction = nodeMap[createReleaseActionId];
    if (createReleaseAction) {
      const graph = nodeMap[getId(createReleaseAction.result)];
      if (graph) {
        assessActionId = getId(
          arrayify(graph.potentialAction).find(actionId => {
            const action = nodeMap[getId(actionId)];
            return action && action['@type'] === 'AssessAction';
          })
        );
      }
    }
  }

  if (assessActionId) {
    return nodeMap[assessActionId];
  }
}

export function getWorkflowStageActions(stage, nodeMap, opts = {}) {
  let actions = arrayify(stage.result)
    .map(actionId => nodeMap[getId(actionId)])
    .filter(Boolean);

  let subStageActions = [];
  actions.forEach(action => {
    if (action['@type'] === 'CreateReleaseAction') {
      const graph = nodeMap[getId(action.result)];
      if (graph) {
        subStageActions = subStageActions.concat(
          arrayify(graph.potentialAction)
            .map(actionId => nodeMap[getId(actionId)])
            .filter(Boolean)
        );
      }
    }
  });

  actions = actions.concat(subStageActions);

  return actions;
}

// TODO remove on next major (14.0.0)
export function getPotentialAssignees(graph = {}, action = {}) {
  console.warn(
    'getPotentialAssignees (@scienceai/ui, utils/graph.js) is deprecated and will be removed in the next major version'
  );

  let activeAgents = getActiveRoles(graph);

  const { agent } = action;
  if (agent && agent.roleName) {
    activeAgents = activeAgents.filter(role => {
      return (
        role.roleName === agent.roleName &&
        (!agent.name || role.name === agent.name)
      );
    });
  }

  const agents = activeAgents.map(role => getAgent(role));

  return uniqBy(agents, x => x['@id'] || x.email || x);
}

/**
 * Note: `graph` is hydrated
 * a funderTree is a list of object of shape:
 * { funder , roles: [ {value (SponsorRole), roleProp (sponsor or funder), targets: [(list of resources)] } ] }
 */
export function getFunderTree(graph = {}) {
  const resources = arrayify(graph['@graph']).filter(
    node => getScopeId(getId(node.resourceOf)) === getScopeId(getId(graph))
  );

  const funderMap = resources.reduce((funderMap, resource) => {
    // funder of work or part of the work
    addFunderMapEntry(funderMap, resource);

    // contributors (and their affiliations (if any))
    ['author', 'contributor', 'editor', 'producer', 'reviewer'].forEach(
      roleProp => {
        arrayify(resource[roleProp]).forEach(role => {
          // affiliation can be expressed as a roleAffiliation
          arrayify(role.roleAffiliation).forEach(affiliation => {
            addFunderMapEntry(funderMap, affiliation);
          });

          // unrolified
          const contributor = arrayify(role[roleProp])[0] || role;
          addFunderMapEntry(funderMap, contributor);

          // Affiliations of the person
          arrayify(contributor.affiliation).forEach(affiliation => {
            addFunderMapEntry(funderMap, affiliation);
          });
        });
      }
    );

    return funderMap;
  }, {});

  // Sort by funder name alphabetical order
  const funderTree = Object.values(funderMap).sort((a, b) => {
    const nameA =
      a.funder.name || a.funder.alternateName || a.funder['@id'] || '';
    const nameB =
      b.funder.name || b.funder.alternateName || b.funder['@id'] || '';
    return nameA.localeCompare(nameB);
  });

  return funderTree;
}

/**
 * helper function for getFunderTree
 * - `sponsorRole` is a SponsorRole object
 * - `target` is a resource, person or organization (not roles)
 */
function addFunderMapEntry(funderMap, target) {
  ['funder', 'sponsor'].forEach(sponsorRoleProp => {
    arrayify(target[sponsorRoleProp]).forEach(sponsorRole => {
      const funder = arrayify(sponsorRole[sponsorRoleProp])[0] || sponsorRole;
      const funderId = getId(funder);
      if (funderId) {
        if (funderMap[funderId]) {
          const data = funderMap[funderId].roles.find(
            data =>
              getId(data.value) === getId(sponsorRole) &&
              data.roleProp === sponsorRoleProp
          );
          if (data) {
            if (
              !data.targets.some(_target => getId(_target) === getId(target))
            ) {
              data.targets.push(target);
            }
          } else {
            funderMap[funderId].roles.push({
              value: sponsorRole,
              roleProp: sponsorRoleProp,
              targets: [target]
            });
          }
        } else {
          funderMap[funderId] = {
            funder,
            roles: [
              {
                value: sponsorRole,
                roleProp: sponsorRoleProp,
                targets: [target]
              }
            ]
          };
        }
      }
    });
  });
  return funderMap;
}
