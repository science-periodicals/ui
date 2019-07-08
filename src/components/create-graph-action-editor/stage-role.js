import React, { Component } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import { arrayify, getId, getNodeMap } from '@scipe/jsonld';
import { createId } from '@scipe/librarian';
import Iconoclass from '@scipe/iconoclass';
import { ROLE_NAMES } from '../roles-column-layout';
import CreateGraphActionEditorActionPreview from './create-graph-action-editor-action-preview';
import ActionAutocomplete from '../autocomplete/action-autocomplete';
import BemTags from '../../utils/bem-tags';
import { getWorkflowStageActions } from '../../utils/graph';
import {
  createParticipants,
  getWorkflowActionOrder,
  createPotentialAuthorizeActionFlatData,
  addEndorseAction,
  syncAuthorizeActions
} from '../../utils/create-graph-action-utils';

export default class StageRole extends Component {
  static propTypes = {
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    periodical: PropTypes.object,
    roleName: PropTypes.oneOf(ROLE_NAMES),
    stage: PropTypes.object,
    productionStageId: PropTypes.string,
    uploadStageId: PropTypes.string,
    nodeMap: PropTypes.object,
    stages: PropTypes.array,
    onChange: PropTypes.func,
    onHighlightNextStage: PropTypes.func,
    onOpenModal: PropTypes.func, // function(actionId, stageId, opts)
    potentialServices: PropTypes.arrayOf(PropTypes.object), // if undefined we don't show the add service controls
    potentialOffers: PropTypes.arrayOf(PropTypes.object)
  };

  static defaultProps = {
    onHighlightNextStage: noop
  };

  constructor(props) {
    super(props);
    this.state = {
      showAdd: false
    };
  }

  handleAddAction = (value, addedAction) => {
    if (addedAction) {
      // !! we need to handle requiresCompletionOf:
      // - DeclareAction, ReviewAction and PayAction block AssessAction or PublishAction (if no AssessAction)

      const {
        nodeMap,
        stage,
        productionStageId,
        onChange,
        roleName
      } = this.props;

      const nextAgent = {
        '@id': createId('blank')['@id'],
        '@type': 'Role',
        roleName: roleName
      };

      const participants = createParticipants(addedAction, {
        agentRoleName: roleName
      });

      const nextAction = Object.assign(
        {
          actionStatus: 'ActiveActionStatus',
          expectedDuration: 'P3D' // !! need to be lower than the `expectedDuration` of the AssessAction
        },
        addedAction,
        {
          '@id': createId('blank')['@id'],
          '@type': addedAction['@type'],
          agent: getId(nextAgent)
        }
      );
      if (participants.length) {
        nextAction.participant = participants.map(participant =>
          getId(participant)
        );
      }

      const participantMap = getNodeMap(participants);

      const {
        authorizeActions,
        nodeMap: authorizeActionsNodeMap
      } = createPotentialAuthorizeActionFlatData(addedAction, {
        agentRoleName: roleName
      });
      if (authorizeActions.length) {
        nextAction.potentialAction = authorizeActions.map(getId);
      }

      if (addedAction['@type'] === 'CreateReleaseAction') {
        // The addedAction is a CreateReleaseAction => Need to move all the
        // action result of the stage to potential action of the CreateReleaseAction

        const nextGraph = {
          '@id': createId('blank')['@id'],
          '@type': 'Graph'
        };

        nextAction.result = getId(nextGraph);

        const resultsToMove = arrayify(stage.result)
          .filter(actionId => {
            const action = nodeMap[getId(actionId)];
            return action;
          })
          .map(actionId => getId(actionId));

        if (resultsToMove.length) {
          nextGraph.potentialAction = resultsToMove;
        }

        const nextStage = Object.assign({}, stage, {
          result: arrayify(stage.result)
            .filter(
              actionId =>
                !resultsToMove.some(action => getId(action) === getId(actionId))
            )
            .concat(getId(nextAction))
        });

        let nextNodeMap = Object.assign(
          {},
          nodeMap,
          {
            [getId(nextAgent)]: nextAgent,
            [getId(nextAction)]: nextAction,
            [getId(nextGraph)]: nextGraph,
            [getId(nextStage)]: nextStage
          },
          participantMap,
          authorizeActionsNodeMap
        );

        // add default endorse action if we are in the production stage
        if (getId(stage) === productionStageId) {
          nextNodeMap = addEndorseAction(
            nextNodeMap[getId(nextAction)],
            'editor',
            nextNodeMap
          );
        }

        onChange(syncAuthorizeActions(nextNodeMap));
      } else {
        // the added action is not a CreateReleaseAction
        let upd, nextReviewRating, nextResultReview, nextPriceSpecification;

        if (nextAction['@type'] === 'ReviewAction') {
          nextReviewRating = {
            '@id': createId('blank')['@id'],
            '@type': 'Rating',
            bestRating: 5,
            worstRating: 1
          };
          nextResultReview = {
            '@id': createId('blank')['@id'],
            '@type': 'Review',
            reviewRating: getId(nextReviewRating)
          };
          nextAction.resultReview = getId(nextResultReview);
        }

        if (nextAction['@type'] === 'PayAction') {
          nextPriceSpecification = {
            '@id': createId('blank')['@id'],
            '@type': 'PriceSpecification',
            priceCurrency: 'USD',
            price: 0,
            valueAddedTaxIncluded: false,
            platformFeesIncluded: false
          };
          nextAction.priceSpecification = getId(nextPriceSpecification);
        }

        const actions = getWorkflowStageActions(stage, nodeMap);
        const createReleaseAction = actions.find(
          action => action['@type'] === 'CreateReleaseAction'
        );

        if (createReleaseAction) {
          // attach as potential action of the graph
          const graph = nodeMap[getId(createReleaseAction.result)];
          if (graph) {
            upd = Object.assign({}, graph, {
              potentialAction: arrayify(graph.potentialAction).concat(
                getId(nextAction)
              )
            });
          }
        } else {
          upd = Object.assign({}, stage, {
            result: arrayify(stage.result).concat(getId(nextAction))
          });
        }

        if (upd) {
          const nextNodeMap = Object.assign(
            {},
            nodeMap,
            {
              [getId(nextAgent)]: nextAgent,
              [getId(nextAction)]: nextAction,
              [getId(upd)]: upd
            },
            nextResultReview
              ? { [getId(nextResultReview)]: nextResultReview }
              : undefined,
            nextReviewRating
              ? { [getId(nextReviewRating)]: nextReviewRating }
              : undefined,
            nextPriceSpecification
              ? { [getId(nextPriceSpecification)]: nextPriceSpecification }
              : undefined,
            participantMap,
            authorizeActionsNodeMap
          );

          // handle `requiresCompletionOf`
          // - ReviewAction, DeclareAction and PayAction block AssessAction or PublishAction (if no AssessAction)
          let blockedAction;
          const workflowStageActions = getWorkflowStageActions(
            stage,
            nextNodeMap
          );

          if (
            nextAction['@type'] === 'DeclareAction' ||
            nextAction['@type'] === 'ReviewAction' ||
            nextAction['@type'] === 'PayAction'
          ) {
            blockedAction =
              workflowStageActions.find(
                action => action['@type'] === 'AssessAction'
              ) ||
              workflowStageActions.find(
                action => action['@type'] === 'PublishAction'
              );
          }

          if (blockedAction) {
            nextNodeMap[getId(blockedAction)] = Object.assign(
              {},
              blockedAction,
              {
                requiresCompletionOf: arrayify(
                  blockedAction.requiresCompletionOf
                ).concat(getId(nextAction))
              }
            );
          }

          onChange(syncAuthorizeActions(nextNodeMap));
        }
      }
      this.autocomplete.reset();
    }
    this.setState({ showAdd: false });
  };

  handleDeleteAction = action => {
    const { stage, nodeMap, onChange } = this.props;
    const workflowStageActions = getWorkflowStageActions(stage, nodeMap);
    const createReleaseAction = workflowStageActions.find(
      action => action['@type'] === 'CreateReleaseAction'
    );

    let graph, nextNodeMap;
    if (createReleaseAction) {
      graph = nodeMap[getId(createReleaseAction.result)];
    }

    if (
      graph &&
      arrayify(graph.potentialAction).some(
        actionId => getId(actionId) === getId(action)
      )
    ) {
      const nextGraph = Object.assign({}, graph, {
        potentialAction: arrayify(graph.potentialAction).filter(
          potentialActionId => getId(potentialActionId) !== getId(action)
        )
      });
      if (!nextGraph.potentialAction.length) {
        delete nextGraph.potentialAction;
      }
      nextNodeMap = Object.assign({}, nodeMap, {
        [getId(nextGraph)]: nextGraph
      });
    } else {
      const nextStage = Object.assign({}, stage, {
        result: arrayify(stage.result).filter(
          resultId => getId(resultId) !== getId(action)
        )
      });
      if (!nextStage.result.length) {
        delete nextStage.result;
      }
      nextNodeMap = Object.assign({}, nodeMap, {
        [getId(nextStage)]: nextStage
      });
    }

    // backport potential action (if any)
    if (nextNodeMap && action['@type'] === 'CreateReleaseAction') {
      const potentialActionIds = arrayify(graph.potentialAction)
        .map(getId)
        .filter(Boolean);

      if (potentialActionIds.length) {
        let nextStage = nextNodeMap[getId(stage)];
        if (nextStage) {
          nextStage = Object.assign({}, nextStage, {
            result: arrayify(nextStage.result)
              .filter(resultId => !potentialActionIds.includes(getId(resultId)))
              .concat(potentialActionIds)
          });
          nextNodeMap[getId(nextStage)] = nextStage;
        }
      }
    }

    // handle `requiresCompletionOf` and `publishActionInstanceOf`

    // - remove action @id from `requiresCompletionOf` and `publishActionInstanceOf`
    nextNodeMap = Object.values(nextNodeMap).reduce((map, node) => {
      if (
        (node.requiresCompletionOf &&
          arrayify(node.requiresCompletionOf).includes(getId(action))) ||
        (node.publishActionInstanceOf &&
          arrayify(node.publishActionInstanceOf).includes(getId(action)))
      ) {
        const nextNode = Object.assign({}, node, {
          requiresCompletionOf: arrayify(node.requiresCompletionOf).filter(
            id => id !== getId(action)
          ),
          publishActionInstanceOf: arrayify(
            node.publishActionInstanceOf
          ).filter(id => id !== getId(action))
        });

        if (!nextNode.requiresCompletionOf.length) {
          delete nextNode.requiresCompletionOf;
        }
        if (!nextNode.publishActionInstanceOf.length) {
          delete nextNode.publishActionInstanceOf;
        }

        map[getId(node)] = nextNode;
      } else {
        map[getId(node)] = node;
      }

      return map;
    }, {});

    // Note: we do _not_ delete `action` from nextNodeMap so that the Graph root detection works in the workflow validation (there can only be 1 graph not resulting from any node) => we need to keep the action as we don't garbage collect the Graph (see https://github.com/scienceai/app-suite/issues/791)
    onChange(syncAuthorizeActions(nextNodeMap));
  };

  handleClickAddAction = e => {
    this.setState({ showAdd: true });
    this.autocomplete.focus();
  };

  render() {
    const {
      roleName,
      stage,
      nodeMap,
      productionStageId,
      readOnly,
      disabled
    } = this.props;
    const workflowStageActions = getWorkflowStageActions(stage, nodeMap);

    const typeMap = arrayify(workflowStageActions).reduce(
      (typeMap, actionId) => {
        const action = nodeMap[getId(actionId)];
        if (action) {
          const agent = nodeMap[getId(action.agent)];
          if (agent && agent.roleName === roleName) {
            if (action['@type'] in typeMap) {
              typeMap[action['@type']].push(action);
            } else {
              typeMap[action['@type']] = [action];
            }
          }
        }
        return typeMap;
      },
      {}
    );

    const actionAutocompleteItems = getActionAutocompleteItems(
      roleName,
      typeMap,
      productionStageId,
      stage
    );

    const bem = BemTags();

    return (
      <div className={bem`stage-role`}>
        {Object.keys(typeMap)
          .sort((a, b) => {
            return getWorkflowActionOrder(a) - getWorkflowActionOrder(b);
          })
          .map(type => (
            <div key={type}>
              {typeMap[type].map(action => (
                <CreateGraphActionEditorActionPreview
                  key={getId(action)}
                  {...this.props}
                  onDeleteAction={this.handleDeleteAction}
                  action={action}
                />
              ))}
            </div>
          ))}

        {!readOnly && actionAutocompleteItems.length ? (
          <div
            className={bem`add-stage__ --${
              this.state.showAdd ? 'active' : 'inactive'
            }`}
          >
            <ActionAutocomplete
              ref={el => {
                this.autocomplete = el;
              }}
              items={actionAutocompleteItems}
              name="action"
              label="Add action"
              disabled={disabled}
              readOnly={readOnly}
              onSubmit={this.handleAddAction}
              onBlurCapture={() => this.setState({ showAdd: false })}
            />
            <Iconoclass
              iconName="add"
              disabled={disabled}
              onClick={this.handleClickAddAction}
              behavior={'button'}
              customClassName={bem`__button`}
            />
          </div>
        ) : null}
      </div>
    );
  }
}

function getActionAutocompleteItems(
  roleName,
  scopedTypeMap,
  productionStageId,
  stage
) {
  const actions = [];

  switch (roleName) {
    case 'editor':
    case 'producer':
    case 'reviewer':
      if (
        !('ReviewAction' in scopedTypeMap) ||
        scopedTypeMap['ReviewAction'].length < 5
      ) {
        actions.push({
          '@type': 'ReviewAction',
          actionStatus: 'ActiveActionStatus',
          name: 'Review',
          minInstances: 1,
          maxInstances: 1
        });
      }
      return actions;

    case 'author':
      if (!('PayAction' in scopedTypeMap)) {
        actions.push({
          '@type': 'PayAction',
          actionStatus: 'ActiveActionStatus',
          name: 'Pay'
        });
      }

      if (!('DeclareAction' in scopedTypeMap)) {
        actions.push({
          '@type': 'DeclareAction',
          actionStatus: 'ActiveActionStatus',
          name: 'Declarations'
        });
      }

      if (!('CreateReleaseAction' in scopedTypeMap)) {
        const action = {
          '@type': 'CreateReleaseAction',
          actionStatus: 'ActiveActionStatus',
          name:
            getId(stage) === productionStageId
              ? 'Upload proofs'
              : 'Upload files'
        };

        if (getId(stage) === productionStageId) {
          action.releaseRequirement = 'ProductionReleaseRequirement';
        }
        actions.push(action);
      }
      return actions;

    default:
      return actions;
  }
}
