import omit from 'lodash/omit';
import { getNodeMap, getId, arrayify } from '@scipe/jsonld';
import { createId } from '@scipe/librarian';

export function getWorkflowActionOrder(type = '') {
  type = type['@type'] || type;

  switch (type) {
    case 'CreateReleaseAction':
      return 1;
    case 'DeclareAction':
      return 2;
    case 'ReviewAction':
      return 3;
    case 'AssessAction':
      return 4;
    case 'PayAction':
      return 5;
    case 'PublishAction':
      return 6;

    default:
      return 0;
  }
}

// !! keep in sync with `createPotentialAuthorizeActionFlatData`
export function createParticipants(action, { agentRoleName } = {}) {
  const type = action['@type'] || action;
  if (typeof type !== 'string') return [];

  switch (type) {
    case 'EndorseAction':
      // audience must be `agentRoleName`
      return [
        {
          '@id': createId('blank')['@id'],
          '@type': 'Audience',
          audienceType: agentRoleName
        }
      ];

    case 'PublishAction':
    case 'AssessAction':
      return [
        {
          '@id': createId('blank')['@id'],
          '@type': 'Audience',
          audienceType: 'editor'
        },
        {
          '@id': createId('blank')['@id'],
          '@type': 'Audience',
          audienceType: 'producer'
        }
      ];

    case 'ReviewAction':
      if (agentRoleName === 'editor' || agentRoleName === 'producer') {
        return [
          {
            '@id': createId('blank')['@id'],
            '@type': 'Audience',
            audienceType: 'editor'
          },
          {
            '@id': createId('blank')['@id'],
            '@type': 'Audience',
            audienceType: 'producer'
          }
        ];
      } else {
        return [];
      }

    case 'PayAction':
    case 'DeclareAction':
    case 'CreateReleaseAction':
      return [
        {
          '@id': createId('blank')['@id'],
          '@type': 'Audience',
          audienceType: 'author'
        }
      ];

    case 'AuthorizeAction':
    case 'DeauthorizeAction':
    case 'AssignAction':
    case 'UnassignAction':
    case 'CommunicateAction':
    case 'StartWorkflowStageAction':
    case 'ScheduleAction':
      return [
        {
          '@id': createId('blank')['@id'],
          '@type': 'Audience',
          audienceType: 'editor'
        },
        {
          '@id': createId('blank')['@id'],
          '@type': 'Audience',
          audienceType: 'producer'
        },
        {
          '@id': createId('blank')['@id'],
          '@type': 'Audience',
          audienceType: 'author'
        },
        {
          '@id': createId('blank')['@id'],
          '@type': 'Audience',
          audienceType: 'reviewer'
        }
      ];

    default:
      return [];
  }
}

// !! keep in sync with `createParticipants` and `syncAuthorizeActions`
export function createPotentialAuthorizeActionFlatData(
  action,
  { agentRoleName } = {}
) {
  const type = action['@type'] || action;
  if (typeof type !== 'string') return { authorizeActions: [], nodeMap: [] };

  let authorizeActions;
  switch (type) {
    case 'PublishAction':
    case 'AssessAction': {
      authorizeActions = [
        {
          '@id': createId('blank')['@id'],
          '@type': 'AuthorizeAction',
          actionStatus: 'PotentialActionStatus',
          completeOn: 'OnObjectCompletedActionStatus',
          participant: createParticipants('AuthorizeAction'),
          recipient: [
            {
              '@id': createId('blank')['@id'],
              '@type': 'Audience',
              audienceType: 'author'
            },
            {
              '@id': createId('blank')['@id'],
              '@type': 'Audience',
              audienceType: 'reviewer'
            }
          ]
        }
      ];
      break;
    }

    case 'ReviewAction': {
      if (agentRoleName === 'reviewer') {
        authorizeActions = [
          {
            '@id': createId('blank')['@id'],
            '@type': 'AuthorizeAction',
            actionStatus: 'PotentialActionStatus',
            completeOn: 'OnObjectCompletedActionStatus',
            participant: createParticipants('AuthorizeAction'),
            recipient: [
              {
                '@id': createId('blank')['@id'],
                '@type': 'Audience',
                audienceType: 'editor'
              },
              {
                '@id': createId('blank')['@id'],
                '@type': 'Audience',
                audienceType: 'producer'
              }
            ]
          },
          {
            '@id': createId('blank')['@id'],
            '@type': 'AuthorizeAction',
            actionStatus: 'PotentialActionStatus',
            completeOn: 'OnWorkflowStageEnd',
            participant: createParticipants('AuthorizeAction'),
            recipient: [
              {
                '@id': createId('blank')['@id'],
                '@type': 'Audience',
                audienceType: 'author'
              }
            ]
          }
        ];
      } else {
        authorizeActions = [];
      }
      break;
    }

    case 'PayAction':
    case 'DeclareAction':
    case 'CreateReleaseAction': {
      authorizeActions = [
        {
          '@id': createId('blank')['@id'],
          '@type': 'AuthorizeAction',
          actionStatus: 'PotentialActionStatus',
          completeOn: 'OnObjectCompletedActionStatus',
          participant: createParticipants('AuthorizeAction'),
          recipient: [
            {
              '@id': createId('blank')['@id'],
              '@type': 'Audience',
              audienceType: 'editor'
            },
            {
              '@id': createId('blank')['@id'],
              '@type': 'Audience',
              audienceType: 'producer'
            },
            {
              '@id': createId('blank')['@id'],
              '@type': 'Audience',
              audienceType: 'reviewer'
            }
          ]
        }
      ];
      break;
    }

    default:
      authorizeActions = [];
      break;
  }

  const nodeMap = {};
  authorizeActions = authorizeActions.map(authorizeAction => {
    const overwrite = {};
    ['participant', 'recipient'].forEach(p => {
      if (authorizeAction[p]) {
        authorizeAction[p].forEach(node => {
          nodeMap[getId(node)] = node;
        });
        overwrite[p] = authorizeAction[p].map(getId);
      }
    });

    const flatNode = Object.assign({}, authorizeAction, overwrite);
    nodeMap[getId(flatNode)] = flatNode;
    return flatNode;
  });

  return { authorizeActions, nodeMap };
}

export function addEndorseAction(action, audienceType, nodeMap) {
  const endorseActionId = arrayify(action.potentialAction).find(actionId => {
    const action = nodeMap[actionId];
    return action && action['@type'] === 'EndorseAction';
  });

  let endorseAction = nodeMap[getId(endorseActionId)];
  let nextEndorseActionAgent;
  if (endorseAction) {
    nextEndorseActionAgent = Object.assign(
      omit(nodeMap[getId(endorseAction.agent)], ['name']),
      {
        roleName: audienceType
      }
    );
  } else {
    // Create endorse action
    let txt;
    switch (action['@type']) {
      case 'ReviewAction':
        txt = 'review';
        break;
      case 'AssessAction':
        txt = 'assessment';
        break;
      case 'CreateReleaseAction':
        txt = 'release';
        break;
      case 'DeclareAction':
        txt = 'answers';
        break;
      case 'AllocateAction':
        txt = 'allocation';
        break;
      case 'ScheduleAction':
        txt = 'schedule';
        break;
      case 'PayAction':
        txt = 'payment';
        break;
      case 'BuyAction':
        txt = 'purchase';
        break;
      default:
        txt = 'action';
        break;
    }

    nextEndorseActionAgent = {
      '@id': createId('blank')['@id'],
      '@type': 'ContributorRole',
      roleName: audienceType
    };

    // Note participant of EndorseAction is set server side
    endorseAction = {
      '@id': createId('blank')['@id'],
      '@type': 'EndorseAction',
      name: `Endorse ${txt}`,
      agent: getId(nextEndorseActionAgent),
      expectedDuration: 'P1D'
    };
  }

  const nextEndorseActionParticipants = createParticipants(endorseAction, {
    agentRoleName: audienceType
  });
  endorseAction = Object.assign({}, endorseAction, {
    participant: nextEndorseActionParticipants.map(getId)
  });

  // create an associated authorize action with an `OnObjectStagedActionStatus` trigger (if needed)
  let nextAuthorizeAction,
    nextAuthorizeActionRecipient,
    nextAuthorizeActionParticipants;

  const authorizeActions = arrayify(action.potentialAction)
    .map(actionId => nodeMap[actionId])
    .filter(action => action && action['@type'] === 'AuthorizeAction');

  if (
    !authorizeActions.some(authorizeAction => {
      return (
        action.completeOn === 'OnObjectStagedActionStatus' &&
        arrayify(action.recipient).some(recipientId => {
          const recipient = nodeMap[getId(recipientId)];
          return recipient && recipient.audienceType === audienceType;
        })
      );
    })
  ) {
    nextAuthorizeAction = authorizeActions.find(
      authorizeAction => action.completeOn === 'OnObjectStagedActionStatus'
    );

    nextAuthorizeActionRecipient = {
      '@id': createId('blank')['@id'],
      '@type': 'Audience',
      audienceType: audienceType
    };

    if (nextAuthorizeAction) {
      nextAuthorizeAction = Object.assign({}, nextAuthorizeAction, {
        recipient: arrayify(nextAuthorizeAction.recipient).concat(
          getId(nextAuthorizeActionRecipient)
        )
      });
    } else {
      nextAuthorizeActionParticipants = createParticipants('AuthorizeAction');

      nextAuthorizeAction = {
        '@id': createId('blank')['@id'],
        '@type': 'AuthorizeAction',
        actionStatus: 'PotentialActionStatus',
        completeOn: 'OnObjectStagedActionStatus',
        recipient: getId(nextAuthorizeActionRecipient)
      };

      if (nextAuthorizeActionParticipants.length) {
        nextAuthorizeAction.participant = nextAuthorizeActionParticipants.map(
          getId
        );
      }
    }
  }

  const nextNodeMap = Object.assign(
    {},
    nodeMap,
    {
      [getId(nextEndorseActionAgent)]: nextEndorseActionAgent,
      [getId(endorseAction)]: endorseAction,
      [getId(action)]: Object.assign({}, action, {
        [action['@type'] === 'PayAction'
          ? 'endorseOn'
          : 'completeOn']: 'OnEndorsed',
        potentialAction: arrayify(action.potentialAction)
          .filter(actionId => {
            return (
              getId(actionId) !== getId(endorseAction) &&
              getId(actionId) !== getId(nextAuthorizeAction)
            );
          })
          .concat(getId(endorseAction))
          .concat(nextAuthorizeAction ? getId(nextAuthorizeAction) : [])
      })
    },
    getNodeMap(nextEndorseActionParticipants),
    nextAuthorizeAction
      ? { [getId(nextAuthorizeAction)]: nextAuthorizeAction }
      : undefined,
    nextAuthorizeActionRecipient
      ? {
          [getId(nextAuthorizeActionRecipient)]: nextAuthorizeActionRecipient
        }
      : undefined,
    nextAuthorizeActionParticipants
      ? getNodeMap(nextAuthorizeActionParticipants)
      : undefined
  );

  return nextNodeMap;
}

/**
 * Call that function when an action is added or removed from the workflow
 * or when audience change to ensure that the authorize actions remain
 * valid / in sync
 *
 * - `DeclareAction`, `PayAction` and `ReviewAction` must be made available to editor on
 *  completion `OnObjectCompletedActionStatus`
 * - All `AssessAction` and `CreateReleaseAction` must be made available to
 *  reviewers and producer on completion `OnObjectCompletedActionStatus` (if the
 *  stage has a ReviewAction involving a reviewer or producer)
 */
export function syncAuthorizeActions(nodeMap) {
  const overwrite = {};

  Object.values(nodeMap).forEach(node => {
    if (
      node['@type'] === 'CreateReleaseAction' ||
      node['@type'] === 'AssessAction' ||
      node['@type'] === 'ReviewAction' ||
      node['@type'] === 'DeclareAction' ||
      node['@type'] === 'PayAction'
    ) {
      const action = node;

      const authorizeActions = arrayify(action.potentialAction)
        .map(potentialActionId => {
          return nodeMap[getId(potentialActionId)];
        })
        .filter(
          potentialAction =>
            potentialAction && potentialAction['@type'] === 'AuthorizeAction'
        );

      const hasReviewer = Object.values(nodeMap).some(node => {
        if (node['@type'] === 'ReviewAction') {
          const agent = nodeMap[getId(node.agent)];
          return agent && agent.roleName === 'reviewer';
        }
        return false;
      });

      const hasProducer = Object.values(nodeMap).some(node => {
        if (node['@type'] === 'ReviewAction') {
          const agent = nodeMap[getId(node.agent)];
          return agent && agent.roleName === 'producer';
        }
        return false;
      });

      let audienceTypes = [];
      switch (action['@type']) {
        case 'DeclareAction':
        case 'PayAction':
        case 'ReviewAction':
          // must be made available to editor on complete (`OnObjectCompletedActionStatus`)
          audienceTypes.push('editor');
          break;

        case 'CreateReleaseAction':
          // must be made available to reviewer or producer (only is the
          // workflow has a whole needs reviewers or producers) on complete
          // (`OnObjectCompletedActionStatus`)
          audienceTypes.push('editor');
          if (hasReviewer) {
            audienceTypes.push('reviewer');
          }
          if (hasProducer) {
            audienceTypes.push('producer');
          }
          break;

        case 'AssessAction':
          // must be made available to reviewer or producer (only is the
          // workflow has a whole needs reviewers or producers) on complete
          // (`OnObjectCompletedActionStatus`)
          if (hasReviewer) {
            audienceTypes.push('reviewer');
          }
          if (hasProducer) {
            audienceTypes.push('producer');
          }
          break;

        default:
          break;
      }

      if (audienceTypes.length) {
        audienceTypes = audienceTypes.filter(audienceType => {
          return (
            !arrayify(action.participant).some(participantId => {
              const participant = nodeMap[getId(participantId)];
              return participant && participant.audienceType === audienceType;
            }) &&
            !authorizeActions.some(authorizeAction => {
              return (
                (authorizeAction.completeOn === 'OnObjectStagedActionStatus' ||
                  authorizeAction.completeOn ===
                    'OnObjectCompletedActionStatus') &&
                arrayify(authorizeAction.recipient).some(recipientId => {
                  const recipient = nodeMap[getId(recipientId)];
                  return recipient && recipient.audienceType === audienceType;
                })
              );
            })
          );
        });

        if (audienceTypes.length) {
          let nextPotentialActions = arrayify(action.potentialAction);

          // remove future (`OnWorkflowStageEnd`) authorize action for `audienceTypes`
          const futureAuthorizeAction = authorizeActions.find(
            authorizeAction =>
              authorizeAction.completeOn === 'OnWorkflowStageEnd' &&
              arrayify(authorizeAction.recipient).some(recipientId => {
                const recipient = nodeMap[getId(recipientId)];
                return (
                  recipient &&
                  audienceTypes.some(
                    audienceType => recipient.audienceType === audienceType
                  )
                );
              })
          );

          if (futureAuthorizeAction) {
            const nextFutureAuthorizeAction = Object.assign(
              {},
              futureAuthorizeAction,
              {
                recipient: arrayify(futureAuthorizeAction.recipient).filter(
                  recipientId => {
                    const recipient = nodeMap[getId(recipientId)];
                    return (
                      !recipient ||
                      !audienceTypes.some(
                        audienceType => recipient.audienceType == audienceType
                      )
                    );
                  }
                )
              }
            );

            if (nextFutureAuthorizeAction.recipient.length) {
              overwrite[
                getId(nextFutureAuthorizeAction)
              ] = nextFutureAuthorizeAction;
            } else {
              nextPotentialActions = nextPotentialActions.filter(
                nextPotentialActionId =>
                  getId(nextPotentialActionId) !==
                  getId(nextFutureAuthorizeAction)
              );
            }
          }

          let nextAuthorizeAction = authorizeActions.find(
            authorizeAction =>
              authorizeAction.completeOn === 'OnObjectCompletedActionStatus'
          );

          if (nextAuthorizeAction) {
            const recipients = audienceTypes.map(audienceType => {
              return {
                '@id': createId('blank')['@id'],
                '@type': 'Audience',
                audienceType
              };
            });
            overwrite[getId(action)] = Object.assign({}, action, {
              potentialAction: nextPotentialActions
            });
            overwrite[getId(nextAuthorizeAction)] = Object.assign(
              {},
              nextAuthorizeAction,
              {
                recipient: arrayify(nextAuthorizeAction.recipient).concat(
                  recipients.map(getId)
                )
              }
            );
            Object.assign(overwrite, getNodeMap(recipients));
          } else {
            const participants = createParticipants('AuthorizeAction');
            const recipients = audienceTypes.map(audienceType => {
              return {
                '@id': createId('blank')['@id'],
                '@type': 'Audience',
                audienceType
              };
            });
            nextAuthorizeAction = {
              '@id': createId('blank')['@id'],
              '@type': 'AuthorizeAction',
              actionStatus: 'PotentialActionStatus',
              completeOn: 'OnObjectCompletedActionStatus',
              participant: participants.map(getId),
              recipient: recipients.map(getId)
            };

            overwrite[getId(action)] = Object.assign({}, action, {
              potentialAction: nextPotentialActions.concat(
                getId(nextAuthorizeAction)
              )
            });
            overwrite[getId(nextAuthorizeAction)] = nextAuthorizeAction;
            Object.assign(
              overwrite,
              getNodeMap(participants),
              getNodeMap(recipients)
            );
          }
        }
      }
    }
  });

  return Object.assign({}, nodeMap, overwrite);
}
