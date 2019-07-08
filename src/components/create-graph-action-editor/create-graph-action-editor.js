import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { createId } from '@scipe/librarian';
import { getId, arrayify, getNodeMap } from '@scipe/jsonld';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import capitalize from 'lodash/capitalize';
import Iconoclass from '@scipe/iconoclass';
import {
  getIconNameFromSchema,
  getWorkflowStageAssessAction,
  getWorkflowStageActions
} from '../../utils/graph';
import BemTags from '../../utils/bem-tags';
import ExpansionPanel from '../expansion-panel';
import ExpansionPanelPreview from '../expansion-panel-preview';
import ExpansionPanelGroup from '../expansion-panel-group';
import PaperInput from '../paper-input';
import PaperActionButton from '../paper-action-button';
import LinkBar from '../link-bar';
import {
  RolesColumnLayout,
  RolesColumnLayoutHeader,
  RolesColumnLayoutBody
} from '../roles-column-layout';
import {
  createParticipants,
  createPotentialAuthorizeActionFlatData
} from '../../utils/create-graph-action-utils';
import StageRole from './stage-role';
import Modal from '../modal';
import CreateGraphActionEditorModal from './create-graph-action-editor-modal';
import withOnSubmit from '../../hoc/with-on-submit';

const ControlledPaperInput = withOnSubmit(PaperInput);

// TODO update to React.createRef()

export default class CreateGraphActionEditor extends Component {
  static propTypes = {
    potentialServices: PropTypes.arrayOf(PropTypes.object), // if undefined we don't show the add service controls
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    periodical: PropTypes.object,
    createGraphAction: PropTypes.object,
    onChange: PropTypes.func,
    layout: PropTypes.oneOf(['singleColumn', 'multiColumn'])
  };

  static defaultProps = {
    createGraphAction: {},
    onChange: noop
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.modalAction) {
      const nextAction = arrayify(
        nextProps.createGraphAction.result['@graph']
      ).find(node => getId(node) === getId(prevState.modalAction));
      if (nextAction) {
        return {
          modalAction: nextAction
        };
      }
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.state = {
      links: [],
      modalActionId: null,
      modalStageId: null
    };
  }

  handleChange = nextNodeMap => {
    const { createGraphAction } = this.props;
    // TODO post processing pipeline here instead of spread all over the place ? simpler but less performant (probably worth doing...)

    const nextCreateGraphAction = Object.assign({}, createGraphAction, {
      result: Object.assign({}, createGraphAction.result, {
        '@graph': Object.values(nextNodeMap)
      })
    });

    this.props.onChange(nextCreateGraphAction);
  };

  handleChangeStageName(stage, nodeMap, e) {
    const nextNodeMap = Object.assign({}, nodeMap, {
      [getId(stage)]: Object.assign({}, stage, {
        [e.target.name]: e.target.value
      })
    });
    this.handleChange(nextNodeMap);
  }

  handleDeleteStage(stage, nodeMap, e) {
    const overwrite = {};
    const publishAction = Object.values(nodeMap).find(
      node => node['@type'] === 'PublishAction'
    );

    // aggegate the action part of the deleted stage
    const stageActionIds = new Set();
    arrayify(stage.result).forEach(actionId => {
      stageActionIds.add(getId(actionId));
      const action = nodeMap[getId(actionId)];
      if (action && action['@type'] === 'CreateReleaseAction') {
        const graph = nodeMap[getId(action.result)];
        if (graph && graph.potentialAction) {
          arrayify(graph.potentialAction).forEach(actionId => {
            stageActionIds.add(getId(actionId));
          });
        }
      }
    });

    if (stageActionIds.size) {
      if (publishAction && publishAction.publishActionInstanceOf) {
        const nextPublishAction = Object.assign({}, publishAction, {
          publishActionInstanceOf: arrayify(
            publishAction.publishActionInstanceOf
          ).filter(id => !stageActionIds.has(getId(id)))
        });
        if (!nextPublishAction.publishActionInstanceOf.length) {
          delete nextPublishAction.publishActionInstanceOf;
        }
        overwrite[getId(nextPublishAction)] = nextPublishAction;
      }
    }

    // Note: we do _not_ delete `stageActionIds` from `nodeMap` so that the Graph root detection works in the workflow validation (there can only be 1 graph not resulting from any node) => we need to keep the action as we don't garbage collect the Graph (see https://github.com/scienceai/app-suite/issues/791)
    this.handleChange(Object.assign(omit(nodeMap, [getId(stage)]), overwrite));
  }

  handleHighlightNextStage(contextStageId, stageId, id) {
    this.setState({
      links: arrayify(this.createLink(stageId, id, contextStageId, true))
    });
  }

  createLink(sourceId, sinkId, contextStageId, extraWidth) {
    // TODO cleanup and pass down ref callback all the way down to AssessActionEditor

    const { layout } = this.props;

    let $source, $sink;
    if (sourceId && sinkId) {
      $source = findDOMNode(this.refs[sourceId]);
      $sink = document.getElementById(sinkId);
    }

    if ($source && $sink) {
      // fix sink offset (as sink can be nested in between element with position relative)
      // if sinkId is not in this.refs sink is a list item from an AssessAction
      let $el = $sink;
      // we need to go from the list item in the assess action to the stage
      let correction = 0;
      while (!$el.classList.contains('stage')) {
        $el = $el.parentElement;
        const styles = window.getComputedStyle($el);
        if (styles && styles.position === 'relative') {
          correction += $el.offsetTop;
        }
      }

      // no idea why but sometimes it seems that the DOM tree is bugged and the parentElement leading to the stage lead to the first stage instead of the correct one
      // this is a workaround
      if (contextStageId && $el.classList.contains('stage') && !$el.offsetTop) {
        const $stage = findDOMNode(this.refs[contextStageId]);
        if ($stage) {
          correction += $stage.offsetTop;
        }
      }

      const sourceOffset = $source.offsetTop + 9;
      const sinkOffset =
        $sink.offsetTop + correction + (sinkId in this.refs ? 9 : 0);

      const offsets = [sourceOffset, sinkOffset].sort((a, b) => a - b);
      const height = offsets[1] - offsets[0];
      const top = offsets[0];

      // this is used to compensate some extra padding due to the lack of tabs on large screen
      const extra = layout === 'multiColumn' ? 4 : 12;

      return {
        id: `link-${sourceId}-${sinkId}`,
        type: 'requirement',
        horizontalTopExtraWidth:
          extraWidth && sourceOffset === offsets[1] ? extra : 0,
        horizontalBottomExtraWidth:
          extraWidth && sourceOffset === offsets[0] ? extra : 0,
        sourceOffset,
        sinkOffset,
        sourceType: 'other',
        sinkType: 'other',
        top,
        height
      };
    }
  }

  handleMouseLeave = e => {
    this.setState({ links: [] });
  };

  handleMouseOver(stage, nodeMap, e) {
    e.stopPropagation();
    let links = [];

    const assessAction = getWorkflowStageAssessAction(stage, nodeMap);

    if (assessAction) {
      arrayify(assessAction.potentialResult).forEach(sourceId => {
        sourceId = getId(sourceId);
        if (sourceId in this.refs) {
          const link = this.createLink(sourceId, getId(stage));
          if (link) {
            links.push(link);
          }
        }
      });
    }
    this.setState({ links });
  }

  handleAddStage(productionStageId, nodeMap, e) {
    e.preventDefault();

    // NOTE: see also create-graph-action-editor-action-preview.js handleSubmit method of StageAutocomplete
    // (stage can also be created there)

    // create a new stage (and the required accompanying AssessAction)
    const nextAgent = {
      '@id': createId('blank')['@id'],
      '@type': 'Role',
      roleName: 'editor'
    };

    const nextAssessActionParticipants = createParticipants('AssessAction');

    const nextAssessAction = {
      '@id': createId('blank')['@id'],
      '@type': 'AssessAction',
      actionStatus: 'ActiveActionStatus',
      expectedDuration: 'P4D', // need to be after what's defined in StageRole for added actions
      agent: getId(nextAgent),
      participant: nextAssessActionParticipants.map(participant =>
        getId(participant)
      ),
      potentialResult: [
        productionStageId,
        Object.keys(nodeMap).find(id => nodeMap[id]['@type'] === 'RejectAction')
      ]
    };

    const {
      authorizeActions,
      nodeMap: authorizeActionsNodeMap
    } = createPotentialAuthorizeActionFlatData(nextAssessAction, {
      agentRoleName: nextAgent.roleName
    });
    if (authorizeActions.length) {
      nextAssessAction.potentialAction = authorizeActions.map(getId);
    }

    const nextStageParticipants = createParticipants(
      'StartWorkflowStageAction'
    );

    const nextStage = {
      '@id': createId('blank')['@id'],
      '@type': 'StartWorkflowStageAction',
      participant: nextStageParticipants.map(participant => getId(participant)),
      result: [getId(nextAssessAction)]
    };

    const nextNodeMap = Object.assign(
      {},
      nodeMap,
      {
        [getId(nextStage)]: nextStage,
        [getId(nextAssessAction)]: nextAssessAction,
        [getId(nextAgent)]: nextAgent
      },
      getNodeMap(nextAssessActionParticipants.concat(nextStageParticipants)),
      authorizeActionsNodeMap
    );

    this.handleChange(nextNodeMap);
  }

  renderLinkBar() {
    const { links } = this.state;
    if (links.length) {
      return (
        <div className="link-bar__container">
          {links.map(link => (
            <LinkBar key={link.id} link={link} />
          ))}
        </div>
      );
    } else {
      return null;
    }
  }

  renderStageIcons(bem, stage, nodeMap, isDeletable = false) {
    const { disabled } = this.props;
    const actions = getWorkflowStageActions(stage, nodeMap);

    const iconNames = Array.from(
      new Set(
        arrayify(actions)
          .map(action => getIconNameFromSchema(action))
          .sort()
      )
    );

    return (
      <ul className={bem`action-icons`}>
        {iconNames.map(iconName => (
          <li className={bem`action-icon`} key={iconName}>
            <Iconoclass iconName={iconName} round={true} />
          </li>
        ))}
        {isDeletable && (
          <li className={bem`action-icon --delete`}>
            <Iconoclass
              className={bem`delete-icon`}
              disabled={disabled}
              iconName="trash"
              behavior="button"
              onClick={this.handleDeleteStage.bind(this, stage, nodeMap)}
              elementType="button"
              size="1.5em"
            />
          </li>
        )}
      </ul>
    );
  }

  handleOpenModal = (actionId, stageId) => {
    this.setState({
      modalActionId: actionId,
      modalStageId: stageId
    });
  };

  handleCloseModal = () => {
    this.setState({
      modalActionId: null,
      modalStageId: null
    });
  };

  render() {
    const {
      potentialServices,
      createGraphAction,
      readOnly,
      disabled,
      periodical,
      layout
    } = this.props;

    const { modalActionId, modalStageId } = this.state;

    // !! createGraphAction.result is defined as {'@graph': []}
    const nodeMap = getNodeMap(createGraphAction.result);
    const nodes = Object.values(nodeMap);
    // find the root graph (`graph`)
    // root Graph is the only Graph node that is not a result of another node
    const graphNodes = nodes.filter(
      node => node['@type'] === 'Graph' && node.version == null
    );
    const graph = graphNodes.find(
      graphNode => !nodes.some(node => getId(node.result) === getId(graphNode))
    );

    // we make sure to put upload stage first and production stage last
    const uploadStageId = getId(
      arrayify(graph.potentialAction).find(actionId => {
        const node = nodeMap[getId(actionId)];
        return node && node['@type'] === 'StartWorkflowStageAction';
      })
    );
    const uploadStage = nodeMap[uploadStageId];

    const stages = Object.keys(nodeMap)
      .filter(key => {
        const node = nodeMap[key];
        return node['@type'] === 'StartWorkflowStageAction';
      })
      .map(stageId => nodeMap[getId(stageId)]);

    const productionStage = stages.find(stage => {
      return arrayify(stage.result).some(actionId => {
        const action = nodeMap[getId(actionId)];
        return (
          action &&
          (action['@type'] === 'PublishAction' ||
            (nodeMap[getId(action.result)] &&
              arrayify(nodeMap[getId(action.result)].potentialAction).some(
                actionId => {
                  const action = nodeMap[getId(actionId)];
                  return action && action['@type'] === 'PublishAction';
                }
              )))
        );
      });
    });

    const productionStageId = getId(productionStage);

    // gather stage in order
    const s = new Set();
    function gatherStage(stage) {
      const assessAction = getWorkflowStageAssessAction(stage, nodeMap);

      if (assessAction) {
        arrayify(assessAction.potentialResult).forEach(stageId => {
          stageId = getId(stageId);
          stage = nodeMap[stageId];
          if (
            !s.has(stageId) &&
            (!stage || stage['@type'] !== 'RejectAction') &&
            stageId !== uploadStageId &&
            stageId !== productionStageId
          ) {
            s.add(stageId);
            if (stage) {
              gatherStage(stage);
            }
          }
        });
      }
    }

    if (uploadStage) {
      gatherStage(uploadStage);
    }

    // be sure that production stage is always last
    const linkedStages = [uploadStage]
      .concat(Array.from(s).map(id => nodeMap[id]))
      .concat(
        getId(productionStage) !== getId(uploadStage) ? productionStage : [] // there may be only 1 stage (combo upload / production stages)
      )
      .filter(Boolean);

    const unlinkedStages = stages.filter(
      stage =>
        !linkedStages.some(linkedStage => getId(linkedStage) === getId(stage))
    );

    const bem = BemTags();
    return (
      <div className={bem`create-graph-action-editor`}>
        {!!modalActionId && (
          <Modal>
            <CreateGraphActionEditorModal
              disabled={disabled}
              readOnly={readOnly}
              action={nodeMap[modalActionId]}
              stageId={modalStageId}
              productionStageId={productionStageId}
              periodical={periodical}
              nodeMap={nodeMap}
              potentialServices={potentialServices}
              onClose={this.handleCloseModal}
              onChange={this.handleChange}
            />
          </Modal>
        )}

        <ExpansionPanelGroup>
          {linkedStages.map(stage => (
            <ExpansionPanel
              className="stage"
              id={getId(stage)}
              key={getId(stage)}
              ref={getId(stage)}
            >
              <ExpansionPanelPreview
                onMouseOver={this.handleMouseOver.bind(this, stage, nodeMap)}
                onMouseLeave={this.handleMouseLeave}
              >
                <div className={bem`node-dot`} />
                <ControlledPaperInput
                  name="name"
                  label="stage"
                  readOnly={readOnly}
                  disabled={disabled}
                  floatLabel={false}
                  onSubmit={this.handleChangeStageName.bind(
                    this,
                    stage,
                    nodeMap
                  )}
                  value={stage.name || ''}
                  large={true}
                />
                {this.renderStageIcons(bem, stage, nodeMap)}
              </ExpansionPanelPreview>
              <RolesColumnLayout layout={layout}>
                <RolesColumnLayoutHeader>
                  {roleName => (
                    <div className={bem`__role-header`}>
                      <Iconoclass iconName={`role${capitalize(roleName)}`} />
                      <h4 className={bem`__role-title`}>{roleName}</h4>
                    </div>
                  )}
                </RolesColumnLayoutHeader>
                <RolesColumnLayoutBody>
                  {roleName => (
                    <StageRole
                      readOnly={readOnly}
                      disabled={disabled}
                      periodical={periodical}
                      productionStageId={productionStageId}
                      uploadStageId={uploadStageId}
                      onChange={this.handleChange}
                      path={stage.path}
                      stages={stages}
                      stage={stage}
                      nodeMap={nodeMap}
                      roleName={roleName}
                      onOpenModal={this.handleOpenModal}
                      onHighlightNextStage={this.handleHighlightNextStage.bind(
                        this,
                        getId(stage)
                      )}
                    />
                  )}
                </RolesColumnLayoutBody>
              </RolesColumnLayout>
            </ExpansionPanel>
          ))}
        </ExpansionPanelGroup>

        {this.renderLinkBar()}

        {!!unlinkedStages.length && (
          <section className="create-graph-action-editor__unconnected-stages">
            <h3 className="create-graph-action-editor__unconnected-stages__title">
              Unconnected stages
            </h3>

            <ExpansionPanelGroup>
              {unlinkedStages.map(stage => (
                <ExpansionPanel key={getId(stage)}>
                  <ExpansionPanelPreview>
                    <ControlledPaperInput
                      name="name"
                      label="stage"
                      readOnly={readOnly}
                      disabled={disabled}
                      floatLabel={false}
                      onSubmit={this.handleChangeStageName.bind(
                        this,
                        stage,
                        nodeMap
                      )}
                      value={stage.name || ''}
                      large={true}
                    />
                    {this.renderStageIcons(bem, stage, nodeMap, true)}
                  </ExpansionPanelPreview>
                  <RolesColumnLayout layout={layout}>
                    <RolesColumnLayoutHeader>
                      {roleName => (
                        <div className={bem`__role-header`}>
                          <Iconoclass
                            iconName={`role${capitalize(roleName)}`}
                          />
                          <h4 className={bem`__role-title`}>{roleName}</h4>
                        </div>
                      )}
                    </RolesColumnLayoutHeader>

                    <RolesColumnLayoutBody>
                      {roleName => (
                        <StageRole
                          readOnly={readOnly}
                          disabled={disabled}
                          productionStageId={productionStageId}
                          uploadStageId={uploadStageId}
                          onChange={this.handleChange}
                          path={stage.path}
                          stages={stages}
                          stage={stage}
                          nodeMap={nodeMap}
                          roleName={roleName}
                          onOpenModal={this.handleOpenModal}
                        />
                      )}
                    </RolesColumnLayoutBody>
                  </RolesColumnLayout>
                </ExpansionPanel>
              ))}
            </ExpansionPanelGroup>
          </section>
        )}

        {/* if there is only 1 stage, it must be a combo production / upload => we don't allow to add more */}
        {!readOnly && linkedStages.length > 1 && (
          <div className="create-graph-action-editor__add-stage">
            <PaperActionButton
              disabled={disabled}
              large={false}
              onClick={this.handleAddStage.bind(
                this,
                getId(productionStage),
                nodeMap
              )}
            />
          </div>
        )}
      </div>
    );
  }
}
