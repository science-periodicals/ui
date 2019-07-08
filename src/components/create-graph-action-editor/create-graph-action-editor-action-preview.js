import React from 'react';
import PropTypes from 'prop-types';
import Fuse from 'fuse.js';
import moment from 'moment';
import pluralize from 'pluralize';
import capitalize from 'lodash/capitalize';
import {
  getId,
  arrayify,
  textify,
  unrole,
  getNodeMap
} from '@scipe/jsonld';
import Iconoclass from '@scipe/iconoclass';
import { createId } from '@scipe/librarian';
import { API_LABELS } from '../../constants';
import Value from '../value';
import PaperAutocomplete from '../paper-autocomplete';
import BemTags from '../../utils/bem-tags';
import {
  createParticipants,
  createPotentialAuthorizeActionFlatData
} from '../../utils/create-graph-action-utils';
import AutoAbridge from '../auto-abridge';
import Tooltip, { TooltipContent } from '../tooltip';
import PaperButton from '../paper-button';
import { getIconNameFromSchema } from '../../utils/graph';
import Divider from '../divider';
import PaperCheckbox from '../paper-checkbox';

export default class CreateGraphActionEditorActionPreview extends React.Component {
  static propTypes = {
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    nodeMap: PropTypes.object.isRequired,
    action: PropTypes.object.isRequired,
    stage: PropTypes.object.isRequired,
    stages: PropTypes.array.isRequired,
    onDeleteAction: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onHighlightNextStage: PropTypes.func.isRequired,
    onOpenModal: PropTypes.func.isRequired,
    productionStageId: PropTypes.string,
    uploadStageId: PropTypes.string
  };

  handleDeleteAction = e => {
    const { action } = this.props;
    this.props.onDeleteAction(action);
  };

  handleUnlinkStage = (stage, e) => {
    // action is an assess action
    const { action, nodeMap } = this.props;

    const stageId = getId(stage);

    const nextNodeMap = Object.assign({}, nodeMap, {
      [getId(action)]: Object.assign({}, action, {
        potentialResult: arrayify(action.potentialResult).filter(
          potentialResult => getId(potentialResult) !== stageId
        ),
        // remove decision letters
        potentialAction: arrayify(action.potentialAction).filter(
          potentialActionId => {
            const potentialAction = nodeMap[potentialActionId] || {};
            return getId(potentialAction.ifMatch) !== stageId;
          }
        )
      })
    });
    if (!nextNodeMap[getId(action)].potentialResult.length) {
      delete nextNodeMap[getId(action)].potentialResult;
    }
    if (!nextNodeMap[getId(action)].potentialAction.length) {
      delete nextNodeMap[getId(action)].potentialAction;
    }

    this.props.onChange(nextNodeMap);
  };

  handleMouseOver = (stageId, e) => {
    e.stopPropagation();
    this.props.onHighlightNextStage(stageId, e.target.id);
  };

  handleMouseLeave = e => {
    this.props.onHighlightNextStage(null);
  };

  handleOpenModal = e => {
    const { action, stage } = this.props;

    this.props.onOpenModal(getId(action), getId(stage));
  };

  handleToggleMakePublic = e => {
    const { action, nodeMap, onChange } = this.props;
    const publishAction = Object.values(nodeMap).find(
      node => node['@type'] === 'PublishAction'
    );
    if (publishAction) {
      onChange(
        Object.assign({}, nodeMap, {
          [getId(publishAction)]: Object.assign({}, publishAction, {
            publishActionInstanceOf: arrayify(
              publishAction.publishActionInstanceOf
            )
              .filter(id => getId(id) !== getId(action))
              .concat(e.target.checked ? getId(action) : [])
          })
        })
      );
    }
  };

  renderRoleSummaryBarTooltip(
    bem,
    activeActionAudiences,
    stagedActionAudiences,
    completedActionAudiences,
    endedWorkflowStageAudiences
  ) {
    return (
      <TooltipContent>
        <div className={bem`__tooltip-content`}>
          <h3 className={bem`__tooltip-content-title`}>
            Action Audience & Participants
          </h3>
          <ul className={bem`__tooltip-content-list`}>
            <li className={bem`__tooltip-content-list-item`}>
              <h4 className={bem`__tooltip-content-segment-name`}>
                On Action Activated (can view and comment)
              </h4>
              {activeActionAudiences.length ? (
                <ul className={bem`__tooltip-content-audience-type-list`}>
                  {activeActionAudiences.map(audience => {
                    return (
                      <li
                        key={getId(audience)}
                        className={bem`__tooltip-content-audience-type-list-item`}
                      >
                        <Iconoclass
                          size="14px"
                          iconName={`role${capitalize(
                            audience.audienceType
                          )}Group`}
                          className={bem`__tooltip-content-audience-type-icon`}
                        />
                        {pluralize(audience.audienceType)}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                'No additional Audience or Participants'
              )}
            </li>

            <li className={bem`__tooltip-content-list-item`}>
              <h4 className={bem`__tooltip-content-segment-name`}>
                On Action Staged (can view and comment)
              </h4>
              {stagedActionAudiences.length ? (
                <ul className={bem`__tooltip-content-audience-type-list`}>
                  <li
                    className={bem`__tooltip-content-audience-type-list-item-icon`}
                  >
                    <Iconoclass
                      size="14px"
                      iconName="add"
                      className={bem`__tooltip-content-audience-type-icon`}
                    />
                  </li>
                  {stagedActionAudiences.map(audience => {
                    return (
                      <li
                        key={getId(audience)}
                        className={bem`__tooltip-content-audience-type-list-item`}
                      >
                        <Iconoclass
                          size="14px"
                          iconName={`role${capitalize(
                            audience.audienceType
                          )}Group`}
                          className={bem`__tooltip-content-audience-type-icon`}
                        />
                        {pluralize(audience.audienceType)}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                'No additional Audience or Participants'
              )}
            </li>

            <li className={bem`__tooltip-content-list-item`}>
              <h4 className={bem`__tooltip-content-segment-name`}>
                On Action Completed (can view)
              </h4>
              {completedActionAudiences.length ? (
                <ul className={bem`__tooltip-content-audience-type-list`}>
                  <li
                    className={bem`__tooltip-content-audience-type-list-item-icon`}
                  >
                    <Iconoclass
                      size="14px"
                      iconName="add"
                      className={bem`__tooltip-content-audience-type-icon`}
                    />
                  </li>
                  {completedActionAudiences.map(audience => (
                    <li
                      key={getId(audience)}
                      className={bem`__tooltip-content-audience-type-list-item`}
                    >
                      <Iconoclass
                        size="14px"
                        iconName={`role${capitalize(
                          audience.audienceType
                        )}Group`}
                        className={bem`__tooltip-content-audience-type-icon`}
                      />
                      {pluralize(audience.audienceType)}
                    </li>
                  ))}
                </ul>
              ) : (
                'No additional audiences'
              )}
            </li>

            <li className={bem`__tooltip-content-list-item`}>
              <h4 className={bem`__tooltip-content-segment-name`}>
                On Stage Completed (can view)
              </h4>
              {endedWorkflowStageAudiences.length ? (
                <ul className={bem`__tooltip-content-audience-type-list`}>
                  <li
                    className={bem`__tooltip-content-audience-type-list-item-icon`}
                  >
                    <Iconoclass
                      size="14px"
                      iconName="add"
                      className={bem`__tooltip-content-audience-type-icon`}
                    />
                  </li>
                  {endedWorkflowStageAudiences.map(audience => (
                    <li
                      key={getId(audience)}
                      className={bem`__tooltip-content-audience-type-list-item`}
                    >
                      <Iconoclass
                        size="14px"
                        iconName={`role${capitalize(
                          audience.audienceType
                        )}Group`}
                        className={bem`__tooltip-content-audience-type-icon`}
                      />
                      {pluralize(audience.audienceType)}
                    </li>
                  ))}
                </ul>
              ) : (
                'No additional audiences'
              )}
            </li>
          </ul>
        </div>
      </TooltipContent>
    );
  }

  renderRoleSummaryBar(bem) {
    const { action, nodeMap } = this.props;

    const endorseAction =
      nodeMap[
        getId(
          arrayify(action.potentialAction).find(actionId => {
            const action = nodeMap[actionId];
            return action && action['@type'] === 'EndorseAction';
          })
        )
      ];

    const endorseActionAgent =
      nodeMap[getId(endorseAction && endorseAction.agent)];

    const agent = nodeMap[getId(action.agent)];

    const activeActionAudiences = arrayify(action.participant)
      .map(participantId => {
        const participant = nodeMap[participantId];
        if (participant) {
          return nodeMap[getId(unrole(participant, 'participant'))];
        }
      })
      .filter(participant => participant && participant.audienceType);

    const authorizeOnObjectStagedAction =
      nodeMap[
        arrayify(action.potentialAction).find(actionId => {
          const action = nodeMap[actionId];
          return (
            action['@type'] === 'AuthorizeAction' &&
            action.completeOn === 'OnObjectStagedActionStatus'
          );
        })
      ];

    const stagedActionAudiences = arrayify(
      authorizeOnObjectStagedAction && authorizeOnObjectStagedAction.recipient
    )
      .map(recipientId => {
        const recipient = nodeMap[recipientId];
        if (recipient) {
          return nodeMap[getId(unrole(recipient, 'recipient'))];
        }
      })
      .filter(
        recipient =>
          recipient &&
          recipient.audienceType &&
          !activeActionAudiences.some(
            audience => audience.audienceType === recipient.audienceType
          )
      );

    const authorizeOnObjectCompletedAction =
      nodeMap[
        arrayify(action.potentialAction).find(actionId => {
          const action = nodeMap[actionId];
          return (
            action['@type'] === 'AuthorizeAction' &&
            action.completeOn === 'OnObjectCompletedActionStatus'
          );
        })
      ];

    const completedActionAudiences = arrayify(
      authorizeOnObjectCompletedAction &&
        authorizeOnObjectCompletedAction.recipient
    )
      .map(recipientId => {
        const recipient = nodeMap[recipientId];
        if (recipient) {
          return nodeMap[getId(unrole(recipient, 'recipient'))];
        }
      })
      .filter(
        recipient =>
          recipient &&
          recipient.audienceType &&
          !activeActionAudiences.some(
            audience => audience.audienceType === recipient.audienceType
          ) &&
          !stagedActionAudiences.some(
            audience => audience.audienceType === recipient.audienceType
          )
      );

    const authorizeOnWorkflowStageEndAction =
      nodeMap[
        arrayify(action.potentialAction).find(actionId => {
          const action = nodeMap[actionId];
          return (
            action['@type'] === 'AuthorizeAction' &&
            action.completeOn === 'OnWorkflowStageEnd'
          );
        })
      ];

    const endedWorkflowStageAudiences = arrayify(
      authorizeOnWorkflowStageEndAction &&
        authorizeOnWorkflowStageEndAction.recipient
    )
      .map(recipientId => {
        const recipient = nodeMap[recipientId];
        if (recipient) {
          return nodeMap[getId(unrole(recipient, 'recipient'))];
        }
      })
      .filter(
        recipient =>
          recipient &&
          recipient.audienceType &&
          !activeActionAudiences.some(
            audience => audience.audienceType === recipient.audienceType
          ) &&
          !stagedActionAudiences.some(
            audience => audience.audienceType === recipient.audienceType
          ) &&
          !completedActionAudiences.some(
            audience => audience.audienceType === recipient.audienceType
          )
      );

    const body = (
      <div className={bem`__role-summary-bar__`}>
        {/* The agent */}

        <Tooltip
          className={bem`__agent-tooltip`}
          displayText={`Agent: ${
            agent.name ? `${agent.name} (${agent.roleName})` : agent.roleName
          }`}
        >
          <Iconoclass
            iconName={`role${capitalize(agent.roleName)}`}
            className={bem`__role-icon --agent`}
            size="16px"
          />
        </Tooltip>

        <Iconoclass
          iconName="arrowOpenRight"
          className={bem`__pointer-icon`}
          size="16px"
          style={{ opacity: '0.6' }}
        />

        {/* Audience when action is active */}
        <Tooltip className={bem`__tooltip`}>
          {this.renderRoleSummaryBarTooltip(
            bem,
            activeActionAudiences,
            stagedActionAudiences,
            completedActionAudiences,
            endedWorkflowStageAudiences
          )}
          {activeActionAudiences.length ||
          stagedActionAudiences.length ||
          completedActionAudiences.length ||
          endedWorkflowStageAudiences.length ? (
            <div className={bem`__segment --active`}>
              <div className={bem`__segment-icons`}>
                {activeActionAudiences.map(audience => (
                  <Iconoclass
                    key={getId(audience)}
                    iconName={`role${capitalize(audience.audienceType)}Group`}
                    className={bem`__role-icon`}
                    size="16px"
                  />
                ))}
              </div>
              {/* Added audiences when action is staged */}
              <div className={bem`__segment --action-staged`}>
                <div className={bem`__segment-icons`}>
                  {stagedActionAudiences.map(audience => (
                    <Iconoclass
                      key={getId(audience)}
                      iconName={`role${capitalize(audience.audienceType)}Group`}
                      className={bem`__role-icon`}
                      size="16px"
                    />
                  ))}
                </div>

                {/* Added audiences when action is completed */}
                <div className={bem`__segment --action-complete`}>
                  <div className={bem`__segment-icons`}>
                    {completedActionAudiences.map(audience => (
                      <Iconoclass
                        key={getId(audience)}
                        iconName={`role${capitalize(
                          audience.audienceType
                        )}Group`}
                        className={bem`__role-icon`}
                        size="16px"
                      />
                    ))}
                  </div>
                  {/* Added audiences when stage is completed */}
                  <div className={bem`__segment --stage-complete`}>
                    <div className={bem`__segment-icons`}>
                      {endedWorkflowStageAudiences.map((audience, i) => (
                        <Iconoclass
                          key={getId(audience)}
                          iconName={`role${capitalize(
                            audience.audienceType
                          )}Group`}
                          className={bem`__role-icon`}
                          size="16px"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={bem`__no-audience`}>No Audience</div>
          )}
        </Tooltip>
        {!!endorseActionAgent && (
          <Tooltip
            displayText={`Endorser: ${
              endorseActionAgent.name
                ? `${endorseActionAgent.name} (${endorseActionAgent.roleName})`
                : endorseActionAgent.roleName
            }`}
          >
            <Iconoclass
              iconName="checkDouble"
              className={bem`__role-icon`}
              size="16px"
            />
          </Tooltip>
        )}
      </div>
    );

    bem`~`; // force bem to exit from subclass stub before returning
    return body;
  }

  render() {
    const {
      stage,
      uploadStageId,
      productionStageId,
      action,
      nodeMap,
      disabled,
      readOnly
    } = this.props;

    const isDeletable =
      !readOnly &&
      ((action['@type'] === 'CreateReleaseAction' &&
        getId(stage) !== uploadStageId) ||
        (action['@type'] !== 'CreateReleaseAction' &&
          action['@type'] !== 'PublishAction' &&
          action['@type'] !== 'AssessAction'));

    let potentialResults = [];
    let productionStage, rejectionStage;
    if (action['@type'] === 'AssessAction') {
      arrayify(action.potentialResult).forEach(actionId => {
        actionId = getId(actionId);
        const potentialResult = nodeMap[actionId];
        if (actionId === productionStageId) {
          productionStage = potentialResult;
        } else if (potentialResult['@type'] === 'RejectAction') {
          rejectionStage = potentialResult;
        }
        potentialResults.push(potentialResult);
      });

      // be sure that Production Stage is first followed by RejectAction
      potentialResults = [rejectionStage, productionStage]
        .concat(
          potentialResults.filter(
            potentialResult =>
              potentialResult !== productionStage &&
              potentialResult !== rejectionStage
          )
        )
        .filter(Boolean);
    }

    const nQuestions =
      action['@type'] === 'DeclareAction'
        ? arrayify(action.question).length
        : action['@type'] === 'ReviewAction'
        ? arrayify(action.answer).filter(answerId => {
            const answer = nodeMap[answerId];
            return answer && answer['@type'] === 'Answer';
          }).length
        : 0;

    const nServices = arrayify(action.potentialService).length;
    const nOffers = arrayify(action.expectsAcceptanceOf).length;
    const requiresProductionQualityContent =
      action.releaseRequirement === 'ProductionReleaseRequirement';

    const publishAction = Object.values(nodeMap).find(
      node => node['@type'] === 'PublishAction'
    );
    const willBePublished = arrayify(
      publishAction && publishAction.publishActionInstanceOf
    ).some(id => getId(id) === getId(action));

    const bem = BemTags();

    return (
      <div className={bem`create-graph-action-editor-action-preview`}>
        <div className={bem`__stage-header`}>
          <span className={bem`__stage-header-title`}>
            <Iconoclass
              iconName={getIconNameFromSchema(action)}
              size="20px"
              round={true}
              className={bem`__stage-header-icon`}
            />
            <Value tagName="h3" className={bem`__stage-header-text`}>
              {action.name || API_LABELS[action['@type']]}
            </Value>
          </span>
          <div className={bem`__controls --single-column`}>
            {isDeletable && (
              <Iconoclass
                iconName="trash"
                size="18px"
                disabled={disabled}
                onClick={this.handleDeleteAction}
                elementType="button"
              />
            )}
            {!readOnly && (
              <Iconoclass
                iconName="gear"
                size="18px"
                onClick={this.handleOpenModal}
                disabled={disabled}
                elementType="button"
              />
            )}
          </div>
        </div>

        {/* summary */}
        <div className={bem`__section --summary-header`}>
          <div className={bem`__role-summary-header`}>
            <span>{API_LABELS[action['@type']]}</span>
            {!!action.expectedDuration && (
              <span>
                {moment.duration(action.expectedDuration).asDays()} days
              </span>
            )}
          </div>
          {this.renderRoleSummaryBar(bem)}

          <PaperCheckbox
            name="publishActionInstanceOf"
            className={bem`__public`}
            checked={willBePublished}
            onChange={this.handleToggleMakePublic}
          >
            Make public at publication
          </PaperCheckbox>

          <div className={bem`__controls --multi-column`}>
            {isDeletable ? (
              <PaperButton
                disabled={disabled}
                onClick={this.handleDeleteAction}
              >
                <Iconoclass iconName="trash" size="18px" />
                Delete
              </PaperButton>
            ) : (
              <span />
            )}
            {!readOnly && (
              <PaperButton onClick={this.handleOpenModal} disabled={disabled}>
                <Iconoclass iconName="gear" size="18px" />
                Settings
              </PaperButton>
            )}
          </div>

          {!!(
            action.description ||
            nQuestions ||
            nServices ||
            nOffers ||
            requiresProductionQualityContent
          ) && (
            <div className={bem`__summary-text`}>
              {!!action.description && (
                <div className={bem`__summary-description`}>
                  <AutoAbridge ellipsis={true}>
                    {textify(action.description)}
                  </AutoAbridge>
                </div>
              )}

              {!!action.description &&
                !!(nQuestions || nServices || nOffers) && (
                  <Divider type="minor" marginTop={8} marginBottom={8} />
                )}

              <ul className={bem`__summary-counts`}>
                {requiresProductionQualityContent && (
                  <li className={bem`__summary-counts-item`}>
                    requires production quality content
                  </li>
                )}

                {nQuestions > 0 && (
                  <li
                    className={bem`__summary-counts-item`}
                  >{`${nQuestions} ${pluralize('Question', nQuestions)}`}</li>
                )}
                {nServices > 0 && (
                  <li
                    className={bem`__summary-counts-item`}
                  >{`${nServices} ${pluralize('Service', nServices)}`}</li>
                )}
                {nOffers > 0 && (
                  <li className={bem`__summary-counts-item`}>
                    {`${nOffers} ${pluralize('Offer', nOffers)}`} (
                    <abr title="Article Processing Charges">APC</abr>)
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* assessment choices and link bar */}
        {action['@type'] === 'AssessAction' && (
          <div className={bem`__section`}>
            <header className={bem`__choice-header`}>Assessment Choices</header>
            <ul className={bem`__choice-list`}>
              {potentialResults.map(potentialResult => (
                <li
                  key={getId(potentialResult)}
                  id={
                    `${getId(action)}-${getId(
                      potentialResult
                    )}` /* Keep in sync with CreateGraphActionEditor  TODO pass down a ref or smtg */
                  }
                  className={bem`__list-item`}
                  onMouseOver={this.handleMouseOver.bind(
                    this,
                    getId(potentialResult)
                  )}
                  onMouseLeave={this.handleMouseLeave}
                >
                  <div className={bem`__assess-option`}>
                    <div
                      className={
                        potentialResult['@type'] === 'RejectAction'
                          ? bem`__node-dot --open`
                          : bem`__node-dot`
                      }
                    />
                    {potentialResult['@type'] === 'RejectAction'
                      ? 'Reject Submission'
                      : `Move to ${potentialResult.name ||
                          API_LABELS[potentialResult['@type']] ||
                          'Untitled stage'}`}
                  </div>

                  {!readOnly &&
                    potentialResult['@type'] !== 'RejectAction' &&
                    getId(potentialResult) !== productionStageId && (
                      <Iconoclass
                        iconName="delete"
                        disabled={disabled}
                        onClick={this.handleUnlinkStage.bind(
                          this,
                          potentialResult
                        )}
                        elementType="button"
                        size="1.5em"
                      />
                    )}
                </li>
              ))}

              {!readOnly && (
                <li className={bem`__list-item --add`}>
                  <div className={bem`__node-dot --open`} />
                  <StageAutocomplete {...this.props} />
                  <div style={{ width: '1.5em' }} />
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    );
  }
}

class StageAutocomplete extends React.Component {
  static propTypes = {
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    nodeMap: PropTypes.object.isRequired,
    action: PropTypes.object.isRequired,
    stage: PropTypes.object.isRequired,
    stages: PropTypes.array.isRequired,
    productionStageId: PropTypes.string,
    uploadStageId: PropTypes.string,
    onChange: PropTypes.func.isRequired
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const items = getItems(nextProps);
    return {
      items,
      fuse: new Fuse(items, { keys: ['name'] })
    };
  }

  constructor(props) {
    super(props);
    const items = getItems(props);
    this.state = {
      items,
      fuse: new Fuse(items, { keys: ['name'] })
    };
  }

  handleChange = (e, value, itemValueDoesMatch) => {
    this.setState({
      items: value ? this.state.fuse.search(value) : getItems(this.props)
    });
  };

  handleSubmit = (value, item) => {
    const {
      nodeMap,
      action: assessAction,
      productionStageId,
      onChange
    } = this.props;

    let nextNodeMap;
    // TODO handle decision letters

    if (item) {
      // add an existing stage
      nextNodeMap = Object.assign({}, nodeMap, {
        [getId(assessAction)]: Object.assign({}, assessAction, {
          potentialResult: arrayify(assessAction.potentialResult).concat(
            getId(item)
          )
        })
      });
    } else {
      // create a new stage (and the required accompanying AssessAction)

      // NOTE: see also create-graph-action-editor.js handleAddStage method
      // (stage can also be created there)

      const newAgent = {
        '@id': createId('blank')['@id'],
        '@type': 'Role',
        roleName: 'editor'
      };

      const newAssessActionParticipants = createParticipants('AssessAction');
      const newAssessAction = {
        '@id': createId('blank')['@id'],
        '@type': 'AssessAction',
        actionStatus: 'ActiveActionStatus',
        expectedDuration: 'P4D', // need to be after what's defined in StageRole for added actions
        agent: getId(newAgent),
        participant: newAssessActionParticipants.map(participant =>
          getId(participant)
        ),
        potentialResult: [
          productionStageId,
          Object.keys(nodeMap).find(
            id => nodeMap[id]['@type'] === 'RejectAction'
          )
        ]
      };

      const {
        authorizeActions,
        nodeMap: authorizeActionsNodeMap
      } = createPotentialAuthorizeActionFlatData(newAssessAction, {
        agentRoleName: newAgent.roleName
      });
      if (authorizeActions.length) {
        newAssessAction.potentialAction = authorizeActions.map(getId);
      }

      const newStageParticipants = createParticipants(
        'StartWorkflowStageAction'
      );
      const newStage = {
        '@id': createId('blank')['@id'],
        '@type': 'StartWorkflowStageAction',
        name: value,
        participant: newStageParticipants.map(participant =>
          getId(participant)
        ),
        result: [getId(newAssessAction)]
      };

      nextNodeMap = Object.assign(
        {},
        nodeMap,
        {
          [getId(assessAction)]: Object.assign({}, assessAction, {
            potentialResult: arrayify(assessAction.potentialResult).concat(
              getId(newStage)
            )
          }),
          [getId(newStage)]: newStage,
          [getId(newAssessAction)]: newAssessAction,
          [getId(newAgent)]: newAgent
        },
        getNodeMap(newAssessActionParticipants.concat(newStageParticipants)),
        authorizeActionsNodeMap
      );
    }
    onChange(nextNodeMap);
    this.autocomplete.reset();
  };

  renderItem(item, isHighlighted, style) {
    return (
      <li
        key={item['@id'] || item['@type']}
        className={isHighlighted ? 'highlighted' : ''}
        style={{ lineHeight: '24px' }}
      >
        {item.name || 'Untitled stage'}
      </li>
    );
  }

  renderMenu(items, value, style) {
    return (
      <ol className="paper-autocomplete__results">
        {items.length ? items : null}
      </ol>
    );
  }

  render() {
    const { items } = this.state;
    const { disabled, readOnly } = this.props;

    const bem = BemTags();
    return (
      <PaperAutocomplete
        className={bem`stage-autocomplete`}
        inputProps={{
          name: 'stage',
          label: 'Add stage',
          disabled: disabled,
          readOnly: readOnly
        }}
        ref={el => {
          this.autocomplete = el;
        }}
        items={items}
        allowUnlistedInput={true}
        onSelect={this.handleSubmit}
        onSubmit={this.handleSubmit}
        onChange={this.handleChange}
        renderItem={this.renderItem}
        renderMenu={this.renderMenu}
        getItemValue={item => item.name || item['@type']}
        floatLabel={false}
      />
    );
  }
}

function getItems(props) {
  const { stages, action, productionStageId } = props;
  const selectedItemIds = new Set(
    arrayify(action && action.potentialResult).map(potentialResult =>
      getId(potentialResult)
    )
  );

  return stages.filter(stage => {
    const stageId = getId(stage);
    return !selectedItemIds.has(stageId) && stageId !== productionStageId;
  });
}
