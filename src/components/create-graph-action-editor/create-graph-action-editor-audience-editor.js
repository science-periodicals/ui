import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { getId, arrayify, unrole, getNodeMap } from '@scipe/jsonld';
import { createId } from '@scipe/librarian';
import PaperCheckbox from '../paper-checkbox';
import { LayoutWrapRows, LayoutWrapItem } from '../layout-wrap-rows';
import {
  StyleFormGroup,
  StyleFormGroupTitle
} from './create-graph-action-editor-modal';
import {
  createParticipants,
  syncAuthorizeActions
} from '../../utils/create-graph-action-utils';

export default class CreateGraphActionEditorAudienceEditor extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    action: PropTypes.object,
    stageId: PropTypes.string.isRequired,
    nodeMap: PropTypes.object
  };

  static defaultProps = {
    nodeMap: {},
    action: {},
    onChange: noop
  };

  handleToggleAudience = e => {
    const { action, nodeMap, onChange } = this.props;

    const isChecked = e.target.value;
    const audienceType = e.target.name;

    if (isChecked) {
      // Add an active audience
      const newAudience = {
        '@id': createId('blank')['@id'],
        '@type': 'Audience',
        audienceType
      };

      // We need to remove any authorizeActions with the same `audienceType` (those are no longer needed)
      let nextPotentialActions = [];
      arrayify(action.potentialAction).forEach(potentialActionId => {
        const potentialAction = nodeMap[potentialActionId];
        if (potentialAction) {
          if (
            potentialAction['@type'] === 'AuthorizeAction' &&
            arrayify(potentialAction.recipient).some(recipientId => {
              const recipient = nodeMap[getId(recipientId)];
              return recipient && recipient.audienceType === audienceType;
            })
          ) {
            if (arrayify(potentialAction.recipient).length > 0) {
              // we include an updated `AuthorizeAction` in `nextPotentialActions`
              const nextAuthorizeAction = Object.assign({}, potentialAction, {
                recipient: arrayify(potentialAction.recipient).filter(
                  recipientId => {
                    const recipient = nodeMap[getId(recipientId)];
                    return (
                      !recipient || recipient.audienceType !== audienceType
                    );
                  }
                )
              });

              if (nextAuthorizeAction.recipient.length) {
                nextPotentialActions.push(nextAuthorizeAction);
              }
            } else {
              // we don't include `action` in `nextPotentialActions`
            }
          } else {
            nextPotentialActions.push(potentialAction);
          }
        }
      });

      const nextAction = Object.assign({}, action, {
        participant: arrayify(action.participant)
          .filter(participantId => {
            const participant = nodeMap[participantId];
            if (participant) {
              const unroled =
                nodeMap[getId(unrole(participant, 'participant'))];
              if (unroled && unroled.audienceType === audienceType) {
                return false;
              }
            }
            return true;
          })
          .concat(getId(newAudience)),
        potentialAction: nextPotentialActions.map(getId)
      });

      if (!nextAction.potentialAction.length) {
        delete nextAction.potentialAction;
      }

      const nextNodeMap = Object.assign(
        {},
        nodeMap,
        {
          [getId(newAudience)]: newAudience,
          [getId(action)]: nextAction
        },
        getNodeMap(nextPotentialActions)
      );

      onChange(syncAuthorizeActions(nextNodeMap));
    } else {
      // Remove an active audience
      // !! if we remove an active audience of an action with a potential
      // endorse action whose agent roleName is audienceType, we may need to add
      // back a potential AuthorizeAction so that the endorser get access to the
      // action to endorse

      const nextAuthorizeActions = [];
      const nextAuthorizeActionsRecipients = [];
      const nextAuthorizeActionsParticipants = [];

      arrayify(action.potentialAction).forEach(potentialActionId => {
        const potentialAction = nodeMap[getId(potentialActionId)];
        if (
          potentialAction &&
          potentialAction['@type'] === 'EndorseAction' &&
          potentialAction.agent
        ) {
          const agent = nodeMap[getId(potentialAction.agent)];
          if (
            agent &&
            agent.roleName &&
            agent.roleName === audienceType &&
            !arrayify(action.potentialAction).some(actionId => {
              const action = nodeMap[getId(actionId)];
              return (
                action &&
                action['@type'] === 'AuthorizeAction' &&
                action.completeOn === 'OnObjectStagedActionStatus' &&
                action.recipient &&
                arrayify(action.recipient).some(recipientId => {
                  const recipient = nodeMap[getId(recipientId)];
                  return recipient && recipient.audienceType === audienceType;
                })
              );
            })
          ) {
            const authorizeActionRecipient = {
              '@id': createId('blank')['@id'],
              '@type': 'Audience',
              audienceType
            };
            nextAuthorizeActionsRecipients.push(authorizeActionRecipient);

            const authorizeActionParticipants = createParticipants(
              'AuthorizeAction'
            );

            const authorizeAction = {
              '@id': createId('blank')['@id'],
              '@type': 'AuthorizeAction',
              actionStatus: 'PotentialActionStatus',
              completeOn: 'OnObjectStagedActionStatus',
              recipient: getId(authorizeActionRecipient)
            };

            nextAuthorizeActions.push(authorizeAction);

            if (authorizeActionParticipants.length) {
              authorizeAction.participant = authorizeActionParticipants.map(
                getId
              );
              nextAuthorizeActionsParticipants.push(
                ...authorizeActionParticipants
              );
            }
          }
        }
      });

      const nextAction = Object.assign({}, action, {
        participant: arrayify(action.participant).filter(participantId => {
          const participant = nodeMap[participantId];
          if (participant) {
            const unroled = nodeMap[getId(unrole(participant, 'participant'))];
            if (unroled && unroled.audienceType === audienceType) {
              return false;
            }
          }
          return true;
        }),
        potentialAction: arrayify(action.potentialAction).concat(
          nextAuthorizeActions.map(getId)
        )
      });

      if (!nextAction.participant.length) {
        delete nextAction.participant;
      }
      if (!nextAction.potentialAction.length) {
        delete nextAction.potentialAction;
      }

      const nextNodeMap = Object.assign(
        {},
        nodeMap,
        {
          [getId(action)]: nextAction
        },
        getNodeMap(nextAuthorizeActions),
        getNodeMap(nextAuthorizeActionsRecipients),
        getNodeMap(nextAuthorizeActionsParticipants)
      );

      onChange(syncAuthorizeActions(nextNodeMap));
    }
  };

  handleToggleAuthorizeAction(trigger, e) {
    const { stageId, action, nodeMap, onChange } = this.props;

    const isChecked = e.target.value;
    const audienceType = e.target.name;

    if (isChecked) {
      // Add an authorize action

      const newAudience = {
        '@id': createId('blank')['@id'],
        '@type': 'Audience',
        audienceType
      };

      let nextAuthorizeAction = arrayify(action.potentialAction)
        .map(id => nodeMap[id])
        .filter(Boolean)
        .find(potentialAction => {
          return (
            potentialAction['@type'] === 'AuthorizeAction' &&
            potentialAction.completeOn === trigger
          );
        });

      const nextAuthorizeActionParticipants = createParticipants(
        'AuthorizeAction'
      );

      nextAuthorizeAction = Object.assign(
        {
          '@id': createId('blank')['@id'],
          '@type': 'AuthorizeAction',
          actionStatus: 'PotentialActionStatus',
          completeOn: trigger
        },
        nextAuthorizeAction,
        {
          recipient: arrayify(
            nextAuthorizeAction && nextAuthorizeAction.recipient
          )
            .filter(recipientId => {
              const recipient = nodeMap[recipientId];
              const unroled = nodeMap[getId(unrole(recipient, 'recipient'))];
              if (unroled && unroled.audienceType === audienceType) {
                return false;
              }
              return true;
            })
            .concat(getId(newAudience))
        }
      );
      if (nextAuthorizeActionParticipants.length) {
        nextAuthorizeAction.participant = nextAuthorizeActionParticipants.map(
          getId
        );
      } else {
        delete nextAuthorizeAction.participant;
      }

      // we remove any future (after `trigger`) AuthorizeAction with the same `audienceType`. (audiences are additive so an audience added on `OnObjectCompletedActionStatus` already covers any future event (such is `OnWorkflowStageEnd`))
      let nextPotentialActions = [nextAuthorizeAction];
      arrayify(action.potentialAction).forEach(potentialActionId => {
        const action = nodeMap[getId(potentialActionId)];
        if (action && getId(nextAuthorizeAction) !== potentialActionId) {
          // We remove authorize action triggered after or remove audienceType from their audience
          if (
            action &&
            action['@type'] === 'AuthorizeAction' &&
            (action.completeOn === 'OnObjectStagedActionStatus' ||
              action.completeOn === 'OnObjectCompletedActionStatus' ||
              action.completeOn === 'OnWorkflowStageEnd') &&
            (((trigger === 'OnObjectStagedActionStatus' &&
              (action.completeOn === 'OnObjectCompletedActionStatus' ||
                action.completeOn === 'OnWorkflowStageEnd')) ||
              (trigger === 'OnObjectCompletedActionStatus' &&
                action.completeOn === 'OnWorkflowStageEnd')) &&
              arrayify(action.recipient).some(recipientId => {
                const recipient = nodeMap[getId(recipientId)];
                return recipient && recipient.audienceType === audienceType;
              }))
          ) {
            if (arrayify(action.recipient).length > 1) {
              // we include an updated `action` in `nextPotentialActions`
              nextPotentialActions.push(
                Object.assign({}, action, {
                  recipient: arrayify(action.recipient).filter(recipientId => {
                    const recipient = nodeMap[getId(recipientId)];
                    return (
                      !recipient || recipient.audienceType !== audienceType
                    );
                  })
                })
              );
            } else {
              // we don't include `action` in `nextPotentialActions`
            }
          } else {
            nextPotentialActions.push(action);
          }
        }
      });

      const nextAction = Object.assign({}, action, {
        potentialAction: nextPotentialActions.map(getId)
      });

      const nextNodeMap = Object.assign(
        {},
        nodeMap,
        {
          [getId(newAudience)]: newAudience,
          [getId(nextAuthorizeAction)]: nextAuthorizeAction,
          [getId(nextAction)]: nextAction
        },
        getNodeMap(nextAuthorizeActionParticipants),
        getNodeMap(nextPotentialActions)
      );

      onChange(syncAuthorizeActions(nextNodeMap));
    } else {
      // Remove an authorize action (note that by design they won't be other
      // potential authorize actions to remove as they were already removed when a
      // new audience was selected (see above))

      const authorizeAction = arrayify(action.potentialAction)
        .map(id => nodeMap[id])
        .filter(Boolean)
        .find(potentialAction => {
          return (
            potentialAction['@type'] === 'AuthorizeAction' &&
            potentialAction.completeOn === trigger
          );
        });

      if (authorizeAction) {
        const nextAuthorizeAction = Object.assign({}, authorizeAction, {
          recipient: arrayify(authorizeAction.recipient).filter(recipientId => {
            const recipient = nodeMap[recipientId];
            const unroled = nodeMap[getId(unrole(recipient, 'recipient'))];
            if (unroled && unroled.audienceType === audienceType) {
              return false;
            }
            return true;
          })
        });

        let nextAction = action;
        if (!nextAuthorizeAction.recipient.length) {
          nextAction = Object.assign({}, action, {
            potentialAction: arrayify(action.potentialAction).filter(
              potentialAction =>
                getId(potentialAction) !== getId(authorizeAction)
            )
          });
          if (!nextAction.potentialAction.length) {
            delete nextAction.potentialAction;
          }
        }

        const nextNodeMap = Object.assign({}, nodeMap, {
          [getId(nextAuthorizeAction)]: nextAuthorizeAction,
          [getId(nextAction)]: nextAction
        });

        onChange(syncAuthorizeActions(nextNodeMap));
      }
    }
  }

  render() {
    const { action, nodeMap, disabled } = this.props;

    return (
      <Fragment>
        <StyleFormGroup>
          <fieldset>
            <StyleFormGroupTitle tagName="legend">
              When action is active (selected roles can view)
            </StyleFormGroupTitle>

            <LayoutWrapRows>
              {['author', 'reviewer', 'editor', 'producer'].map(
                audienceType => (
                  <LayoutWrapItem key={audienceType}>
                    <PaperCheckbox
                      name={audienceType}
                      checked={hasAudienceWhenActionIsActive(
                        audienceType,
                        action,
                        nodeMap
                      )}
                      onChange={this.handleToggleAudience}
                      disabled={
                        disabled ||
                        /* honor default required audience for each action @type */
                        (action['@type'] === 'PayAction' &&
                          audienceType === 'author') ||
                        (action['@type'] === 'DeclareAction' &&
                          audienceType === 'author') ||
                        (action['@type'] === 'CreateReleaseAction' &&
                          audienceType === 'author') ||
                        (action['@type'] === 'AssessAction' &&
                          audienceType === 'editor') ||
                        (action['@type'] === 'PublishAction' &&
                          audienceType === 'producer')
                      }
                    >
                      {`${audienceType}s`}
                    </PaperCheckbox>
                  </LayoutWrapItem>
                )
              )}
            </LayoutWrapRows>
          </fieldset>
        </StyleFormGroup>

        <StyleFormGroup>
          <fieldset>
            <StyleFormGroupTitle tagName="legend">
              When action is staged (selected roles can view and comment)
            </StyleFormGroupTitle>

            <LayoutWrapRows>
              {['author', 'reviewer', 'editor', 'producer'].map(
                audienceType => (
                  <LayoutWrapItem key={audienceType}>
                    <PaperCheckbox
                      name={audienceType}
                      checked={hasAudienceWhenActionIsStaged(
                        audienceType,
                        action,
                        nodeMap
                      )}
                      onChange={this.handleToggleAuthorizeAction.bind(
                        this,
                        'OnObjectStagedActionStatus'
                      )}
                      disabled={
                        disabled ||
                        hasAudienceWhenActionIsActive(
                          audienceType,
                          action,
                          nodeMap
                        ) ||
                        arrayify(action.potentialAction).some(actionId => {
                          // if there is an endorsement, we can't uncheck the audience required for the endorsement completion
                          const action = nodeMap[actionId];
                          const agent = nodeMap[getId(action && action.agent)];
                          return (
                            action &&
                            action['@type'] === 'EndorseAction' &&
                            agent &&
                            agent.roleName === audienceType
                          );
                        })
                      }
                    >
                      {`${audienceType}s`}
                    </PaperCheckbox>
                  </LayoutWrapItem>
                )
              )}
            </LayoutWrapRows>
          </fieldset>
        </StyleFormGroup>

        <StyleFormGroup>
          <fieldset>
            <StyleFormGroupTitle tagName="legend">
              When action is completed (selected roles can view)
            </StyleFormGroupTitle>

            <LayoutWrapRows>
              {['author', 'reviewer', 'editor', 'producer'].map(
                audienceType => (
                  <LayoutWrapItem key={audienceType}>
                    <PaperCheckbox
                      name={audienceType}
                      checked={hasAudienceWhenActionIsCompleted(
                        audienceType,
                        action,
                        nodeMap
                      )}
                      onChange={this.handleToggleAuthorizeAction.bind(
                        this,
                        'OnObjectCompletedActionStatus'
                      )}
                      disabled={
                        disabled ||
                        hasAudienceWhenActionIsActive(
                          audienceType,
                          action,
                          nodeMap
                        ) ||
                        hasAudienceWhenActionIsStaged(
                          audienceType,
                          action,
                          nodeMap
                        ) ||
                        needsAudienceTypeOnObjectCompletedActionStatus(
                          audienceType,
                          action,
                          nodeMap
                        )
                      }
                    >
                      {`${audienceType}s`}
                    </PaperCheckbox>
                  </LayoutWrapItem>
                )
              )}
            </LayoutWrapRows>
          </fieldset>
        </StyleFormGroup>

        <StyleFormGroup>
          <fieldset>
            <StyleFormGroupTitle tagName="legend">
              When stage is completed (selected roles can view)
            </StyleFormGroupTitle>

            <LayoutWrapRows>
              {['author', 'reviewer', 'editor', 'producer'].map(
                audienceType => (
                  <LayoutWrapItem key={audienceType}>
                    <PaperCheckbox
                      name={audienceType}
                      checked={hasAudienceWhenStageIsCompleted(
                        audienceType,
                        action,
                        nodeMap
                      )}
                      onChange={this.handleToggleAuthorizeAction.bind(
                        this,
                        'OnWorkflowStageEnd'
                      )}
                      disabled={
                        disabled ||
                        hasAudienceWhenActionIsActive(
                          audienceType,
                          action,
                          nodeMap
                        ) ||
                        hasAudienceWhenActionIsStaged(
                          audienceType,
                          action,
                          nodeMap
                        ) ||
                        hasAudienceWhenActionIsCompleted(
                          audienceType,
                          action,
                          nodeMap
                        )
                      }
                    >
                      {`${audienceType}s`}
                    </PaperCheckbox>
                  </LayoutWrapItem>
                )
              )}
            </LayoutWrapRows>
          </fieldset>
        </StyleFormGroup>
      </Fragment>
    );
  }
}

function hasAudienceWhenActionIsActive(audienceType, action, nodeMap) {
  return arrayify(action.participant).some(participantId => {
    const participant = nodeMap[participantId];
    if (participant) {
      const unroled = nodeMap[getId(unrole(participant, 'participant'))];
      if (unroled) {
        return unroled.audienceType === audienceType;
      }
    }
  });
}

function hasAudienceWhenActionIsStaged(audienceType, action, nodeMap) {
  return (
    hasAudienceWhenActionIsActive(audienceType, action, nodeMap) ||
    arrayify(action.potentialAction).some(potentialActionId => {
      const potentialAction = nodeMap[potentialActionId];
      if (potentialAction) {
        return (
          potentialAction['@type'] === 'AuthorizeAction' &&
          potentialAction.completeOn === 'OnObjectStagedActionStatus' &&
          arrayify(potentialAction.recipient).some(recipientId => {
            const recipient = nodeMap[recipientId];
            if (recipient) {
              const unroled = nodeMap[getId(unrole(recipient, 'recipient'))];
              if (unroled) {
                return unroled.audienceType === audienceType;
              }
            }
          })
        );
      }
    })
  );
}

function hasAudienceWhenActionIsCompleted(audienceType, action, nodeMap) {
  return (
    hasAudienceWhenActionIsActive(audienceType, action, nodeMap) ||
    hasAudienceWhenActionIsStaged(audienceType, action, nodeMap) ||
    arrayify(action.potentialAction).some(potentialActionId => {
      const potentialAction = nodeMap[potentialActionId];
      if (potentialAction) {
        return (
          potentialAction['@type'] === 'AuthorizeAction' &&
          potentialAction.completeOn === 'OnObjectCompletedActionStatus' &&
          arrayify(potentialAction.recipient).some(recipientId => {
            const recipient = nodeMap[recipientId];
            if (recipient) {
              const unroled = nodeMap[getId(unrole(recipient, 'recipient'))];
              if (unroled) {
                return unroled.audienceType === audienceType;
              }
            }
          })
        );
      }
    })
  );
}

function hasAudienceWhenStageIsCompleted(audienceType, action, nodeMap) {
  return (
    hasAudienceWhenActionIsActive(audienceType, action, nodeMap) ||
    hasAudienceWhenActionIsStaged(audienceType, action, nodeMap) ||
    hasAudienceWhenActionIsCompleted(audienceType, action, nodeMap) ||
    arrayify(action.potentialAction).some(potentialActionId => {
      const potentialAction = nodeMap[potentialActionId];
      if (potentialAction) {
        return (
          potentialAction['@type'] === 'AuthorizeAction' &&
          potentialAction.completeOn === 'OnWorkflowStageEnd' &&
          arrayify(potentialAction.recipient).some(recipientId => {
            const recipient = nodeMap[recipientId];
            if (recipient) {
              const unroled = nodeMap[getId(unrole(recipient, 'recipient'))];
              if (unroled) {
                return unroled.audienceType === audienceType;
              }
            }
          })
        );
      }
    })
  );
}

// see rules defined in `syncAuthorizeActions` utils
function needsAudienceTypeOnObjectCompletedActionStatus(
  audienceType,
  action,
  nodeMap
) {
  const authorizeActions = arrayify(action.potentialAction)
    .map(potentialActionId => {
      return nodeMap[getId(potentialActionId)];
    })
    .filter(
      potentialAction =>
        potentialAction && potentialAction['@type'] === 'AuthorizeAction'
    );

  const hasAudienceType =
    arrayify(action.participant).some(participantId => {
      const participant = nodeMap[getId(participantId)];
      return participant && participant.audienceType === audienceType;
    }) ||
    authorizeActions.some(authorizeAction => {
      return (
        authorizeAction.completeOn === 'OnObjectStagedActionStatus' &&
        arrayify(authorizeAction.recipient).some(recipientId => {
          const recipient = nodeMap[getId(recipientId)];
          return recipient && recipient.audienceType === audienceType;
        })
      );
    });

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

  switch (action['@type']) {
    case 'DeclareAction':
    case 'PayAction':
    case 'ReviewAction':
      return audienceType === 'editor' && !hasAudienceType;

    case 'CreateReleaseAction':
      return (
        (audienceType === 'editor' && !hasAudienceType) ||
        (hasReviewer && audienceType === 'reviewer' && !hasAudienceType) ||
        (hasProducer && audienceType === 'producer' && !hasAudienceType)
      );

    case 'AssessAction': {
      return (
        (hasReviewer && audienceType === 'reviewer' && !hasAudienceType) ||
        (hasProducer && audienceType === 'producer' && !hasAudienceType)
      );
    }

    default:
      return false;
  }
}
