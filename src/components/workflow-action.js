import React from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'react-collapse';
import { presets } from 'react-motion';
import moment from 'moment';
import classNames from 'classnames';
import pick from 'lodash/pick';
import pickBy from 'lodash/pickBy';
import noop from 'lodash/noop';
import {
  inferStartTime,
  getStageActions,
  getBlockingActions,
  needActionAssignment,
  isActionAssigned,
  getAgentId,
  getObjectId
} from '@scipe/librarian';
import { getId } from '@scipe/jsonld';
import Iconoclass from '@scipe/iconoclass';
import onClickOutside from 'react-onclickoutside';
import BemTags from '../utils/bem-tags';
import { getIconNameFromSchema } from '../utils/graph';
import WorkflowActionUserBadgeMenu from './workflow-action-user-badge-menu';
import MenuItem from './menu/menu-item';
import PaperDateInput from './paper-date-input';
import PaperTimeInput from './paper-time-input';
import ControlPanel from './control-panel';
import { Span, Div } from './elements';
import { API_LABELS } from '../constants';
import PaperButtonLink from './paper-button-link';
import Hyperlink from './hyperlink';
import ButtonMenu from './button-menu/button-menu';
import PaperButton from './paper-button';
import ActionIdentifier from './action-identifier';

class _WorkflowAction extends React.Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        '@id': PropTypes.string.isRequired
      })
    ]).isRequired,
    roleName: PropTypes.oneOf(['author', 'reviewer', 'editor', 'producer']),
    graph: PropTypes.object.isRequired,
    acl: PropTypes.object.isRequired,

    stage: PropTypes.object.isRequired,
    action: PropTypes.object.isRequired,

    canCommunicate: PropTypes.bool,
    canAssign: PropTypes.bool, // sometimes we need to overwrite what is infered from the graph and permissions

    readOnly: PropTypes.bool, // Note that this is different from disabled
    disabled: PropTypes.bool,

    error: PropTypes.instanceOf(Error),

    closeOnSubmit: PropTypes.bool,
    isProgressing: PropTypes.bool,

    isHovered: PropTypes.bool,
    onHover: PropTypes.func,
    onHoverOut: PropTypes.func,

    onOpen: PropTypes.func,
    onClose: PropTypes.func,

    onAction: PropTypes.func,
    onView: PropTypes.func,

    heartbeat: PropTypes.bool // for the workflow-action-user-badge-menu
  };

  static defaultProps = {
    isProgressing: false,
    closeOnSubmit: true,

    isHovered: false,
    onHover: noop,
    onHoverOut: noop,

    onOpen: noop,
    onClose: noop,

    onAction: noop,
    onView: noop
  };

  static getDerivedStateFromProps(props, state) {
    if (props.action.expectedDuration !== state.lastExpectedDuration) {
      return {
        canReschedule: false,
        dueDateTime: getDueDateTime(props.action, props.stage),
        lastExpectedDuration: props.action.expectedDuration
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      canReschedule: false,
      dueDateTime: getDueDateTime(props.action, props.stage),
      lastExpectedDuration: props.action.expectedDuration
    };
  }

  componentWillUnmount() {
    const { graph, onHoverOut, onClose } = this.props;
    onHoverOut(getId(graph));
    onClose(getId(graph));
  }

  toggleMenu = isOpen => {
    if (typeof isOpen !== 'boolean') isOpen = !this.state.isOpen;
    const { action, graph, onClose, onOpen } = this.props;
    if (this.state.isOpen) {
      onClose(getId(graph));
    } else {
      onOpen(getId(graph), getId(action));
    }
    this.setState({ isOpen });
  };

  handleHover = () => {
    const { action, graph } = this.props;
    const hoveredId =
      action['@type'] === 'EndorseAction' ? getObjectId(action) : getId(action);
    this.props.onHover(getId(graph), hoveredId);
  };

  handleHoverOut = () => {
    const { graph } = this.props;
    this.props.onHoverOut(getId(graph));
  };

  handleView = () => {
    this.props.onView(this.props.action);
    this.setState({ isOpen: false });
  };

  handleAssignment(role) {
    const { action, user, onAction } = this.props;

    if (role == null) {
      // Unassign
      onAction(
        pickBy({
          '@type': 'UnassignAction',
          actionStatus: 'CompletedActionStatus',
          agent: getId(user),
          participant: action.participant,
          object: getId(action)
        })
      );
    } else {
      // Assign
      onAction(
        pickBy({
          '@type': 'AssignAction',
          actionStatus: 'CompletedActionStatus',
          agent: getId(user),
          participant: action.participant,
          recipient: Object.assign(
            { '@type': 'ContributorRole' },
            pick(role, ['@id', '@type', 'roleName', 'name']),
            { recipient: getAgentId(role) }
          ),
          object: getId(action)
        })
      );
    }
  }

  handleCommunicate(role) {
    // role is assignee or assigner Role
    const { action, user, onAction } = this.props;
    onAction({
      '@type': 'CommunicateAction',
      actionStatus: 'PotentialActionStatus',
      agent: getId(user),
      recipient: Object.assign(
        { '@type': 'ContributorRole' },
        pick(role, ['@id', '@type', 'roleName', 'name']),
        {
          recipient: getAgentId(role)
        }
      ),
      object: getId(action)
    });
  }

  handleClickOutside(e) {
    const { graph, onClose } = this.props;

    if (
      this.state.isOpen &&
      (!e ||
        !e.target ||
        typeof e.target.className !== 'string' ||
        !e.target.className.includes('menu')) // Prevent clicking on portal menu to close the handler TODO improve ? maybe pass a prop to specify a list of classes ?
    ) {
      onClose(getId(graph));
      this.setState({ isOpen: false });
    }
  }

  handleAction = (action, data) => {
    const { closeOnSubmit, onAction, onClose, graph } = this.props;
    if (closeOnSubmit && data && data.close) {
      onClose(getId(graph));
      this.setState({ isOpen: false });
    }
    onAction(action, data);
  };

  handleDueDateTimeChange = nextDate => {
    const { action, stage } = this.props;
    let canReschedule = false;
    const startTime = inferStartTime(action, stage);

    if (startTime) {
      const startMoment = moment(startTime);
      const dueMoment = moment(getDueDateTime(action, stage));
      const nextDueMoment = moment(nextDate);
      if (
        !nextDueMoment.isSame(dueMoment) &&
        nextDueMoment.isAfter(startMoment)
      ) {
        canReschedule = true;
      }
    }
    this.setState({ dueDateTime: nextDate, canReschedule });
  };

  handleReschedule(role) {
    const { dueDateTime } = this.state;
    const { action, stage, onAction } = this.props;
    const startTime = inferStartTime(action, stage);

    if (startTime) {
      const startMoment = moment(startTime);
      const dueMoment = moment(getDueDateTime(action, stage));
      const nextDueMoment = moment(dueDateTime);
      if (
        !nextDueMoment.isSame(dueMoment) &&
        nextDueMoment.isAfter(startMoment)
      ) {
        const nextDuration = moment
          .duration(nextDueMoment.diff(startMoment))
          .toISOString();

        onAction(
          pickBy({
            '@type': 'ScheduleAction',
            actionStatus: 'CompletedActionStatus',
            agent: getId(role),
            participant: action.participant,
            object: getId(action),
            expectedDuration: nextDuration
          }),
          { reschedule: true }
        );
      }
    }
  }

  handleCancelInstance(role) {
    const { action, onAction } = this.props;

    onAction(
      pickBy({
        '@type': 'CancelAction',
        actionStatus: 'CompletedActionStatus',
        agent: getId(role),
        participant: action.participant,
        object: getId(action)
      }),
      { cancel: true }
    );
  }

  render() {
    const bem = BemTags('workflow-action');

    const { isOpen, dueDateTime, canReschedule } = this.state;
    const {
      acl,
      graph,
      action,
      user,
      error,
      stage,
      isProgressing,
      isHovered,
      disabled: _disabled,
      readOnly
    } = this.props;

    const disabled = _disabled || (getId(action) || '').startsWith('workflow:');

    // !! action.agent may miss the name property so we get back the full role from the Graph
    const agent = acl.findRole(action.agent) || action.agent;

    // this is used for isDuplicatable actions
    // those can only be smarted if they are assigned
    // they can only be duplicated by people who canAssign
    const agentId = getAgentId(agent);
    const isAssigned = isActionAssigned(action);
    const needAssignment = needActionAssignment(action);

    const isOwn = isAssigned ? getId(user) === agentId : false;

    const isFinalRelease = action['@type'] === 'PublishAction';
    const isComplete = action.actionStatus === 'CompletedActionStatus';

    const isOverdue =
      !isComplete &&
      action.expectedTime &&
      action.expectedTime < new Date().toISOString();

    const blockers = getBlockingActions(action, stage);
    const isBlocked = !!blockers.length;

    const stageActions = getStageActions(stage);

    const isCancelable = acl.checkPermission(user, 'CancelActionPermission', {
      action,
      workflowActions: stageActions
    });

    const isReschedulable = acl.checkPermission(
      user,
      'RescheduleActionPermission',
      {
        action,
        workflowActions: stageActions
      }
    );

    let statusIcon;
    if (error) {
      statusIcon = 'statusError';
    } else if (isBlocked) {
      statusIcon = 'lock';
    } else if (needAssignment && !isAssigned) {
      statusIcon = 'statusWarning';
    } else {
      switch (action.actionStatus) {
        case 'CompletedActionStatus': {
          const endorseActions = stageActions.filter(
            _action =>
              _action['@type'] === 'EndorseAction' &&
              getObjectId(_action) === getId(action)
          );

          if (
            endorseActions.length &&
            endorseActions.every(
              action => action.actionStatus === 'CompletedActionStatus'
            )
          ) {
            statusIcon = 'checkDouble';
          } else {
            statusIcon = 'check';
          }
          break;
        }
        case 'FailedActionStatus':
          statusIcon = 'statusError';
          break;
        default:
          statusIcon = 'none';
          break;
      }
    }

    const objectId = getObjectId(action);

    let endorsedAction;
    if (action['@type'] === 'EndorseAction') {
      endorsedAction = stageActions.find(action => getId(action) === objectId);
    }

    const userRoles = acl.getActiveRoles(user);

    return (
      <div
        className={classNames('workflow-action', {
          [bem`--hovered`]: isHovered,
          [bem`--final`]: isFinalRelease,
          [bem`--smart-open`]: isOpen,
          [bem`--blocked`]:
            isBlocked &&
            (action['@type'] !== 'CreateReleaseAction' || isFinalRelease),
          [bem`--own`]: !isComplete && !isBlocked && isOwn,
          [bem`--in-progress`]: isProgressing,
          [bem`--complete`]: isComplete,
          [bem`--overdue`]: isOverdue,
          [bem`--error`]: error,
          [bem`--need-assignment`]: needAssignment && !isAssigned
        })}
        onMouseEnter={this.handleHover}
        onMouseLeave={this.handleHoverOut}
      >
        <div className={bem`info`}>
          <div className={bem`assignment`}>
            <WorkflowActionUserBadgeMenu {...this.props} />
          </div>

          <span className="workflow-action__label" onClick={this.toggleMenu}>
            <Span>
              {action.name || API_LABELS[action['@type']] || action['@type']}
            </Span>
          </span>

          <span className="workflow-action__controls">
            {action.identifier && (
              <ActionIdentifier>{action.identifier}</ActionIdentifier>
            )}
            <Iconoclass
              elementType="button"
              iconName={
                isFinalRelease
                  ? 'star'
                  : getIconNameFromSchema(action, 'dropdown')
              }
              round={false}
              onClick={this.toggleMenu}
              iconSize={20}
              className={
                isComplete
                  ? bem`action-icon --done`
                  : isOverdue
                  ? bem`action-icon --overdue`
                  : bem`action-icon`
              }
              title={isComplete ? 'Done' : isOverdue ? 'Overdue' : 'Preview'}
              style={{
                position: 'relative',
                left: '8px'
              }}
            />
            {statusIcon == 'none' ? (
              <div
                className="workflow-action__status-icon-placeholder"
                style={{ position: 'relative', width: '22px' }}
              />
            ) : (
              <Iconoclass
                iconName={statusIcon}
                round={statusIcon !== 'time'}
                className="workflow-action__status-icon"
                iconSize={18}
                style={{
                  border: '2px solid white',
                  boxSizing: 'content-box',
                  backgroundColor: 'white'
                }}
              />
            )}
          </span>

          <div
            className={`workflow-action-handler ${
              isOpen
                ? 'workflow-action-handler--open'
                : 'workflow-action-handler--closed'
            }`}
          >
            <Collapse isOpened={isOpen} springConfig={presets.noWobble}>
              <div className="workflow-action-handler__contents">
                {/* Display && delete review instances */}
                {(action.minInstances != null ||
                  action.maxInstances != null) && (
                  <div className="workflow-action-handler__control-row">
                    <div className="workflow-action-handler__header">
                      <span className="workflow-action-handler__header-spacer">
                        {`${action.minInstances || 1} required - ${
                          action.maxInstances
                        } total`}
                      </span>
                    </div>

                    {!readOnly && isCancelable && (
                      <ControlPanel>
                        {userRoles.length === 1 ? (
                          <PaperButton
                            onClick={this.handleCancelInstance.bind(
                              this,
                              userRoles[0]
                            )}
                            disabled={disabled || isProgressing}
                          >
                            Cancel
                          </PaperButton>
                        ) : (
                          <ButtonMenu disabled={disabled || isProgressing}>
                            <span>Cancel As…</span>
                            {userRoles.map(role => (
                              <MenuItem
                                key={getId(role)}
                                icon="trash"
                                onClick={this.handleCancelInstance.bind(
                                  this,
                                  role
                                )}
                                disabled={disabled || isProgressing}
                              >
                                {role.name
                                  ? `${role.name} (${role.roleName})`
                                  : role.roleName}
                              </MenuItem>
                            ))}
                          </ButtonMenu>
                        )}
                      </ControlPanel>
                    )}
                  </div>
                )}

                {/* Display due date and reschedule  */}
                <div className="workflow-action-handler__control-row">
                  <div className="workflow-action-handler__header">
                    <span className="workflow-action-handler__header-spacer">
                      {`Due: `}
                    </span>
                    <span className="workflow-action-handler__header-left">
                      <PaperDateInput
                        label="Due date"
                        name="date"
                        value={dueDateTime}
                        readOnly={readOnly || !isReschedulable}
                        disabled={disabled || !isReschedulable || isProgressing}
                        onChange={this.handleDueDateTimeChange}
                        floatLabel={false}
                        portal={false}
                      />
                    </span>
                    <span className="workflow-action-handler__header-right">
                      <PaperTimeInput
                        label="Due time"
                        name="time"
                        readOnly={readOnly || !isReschedulable}
                        disabled={disabled || !isReschedulable || isProgressing}
                        floatLabel={false}
                        onChange={this.handleDueDateTimeChange}
                        value={dueDateTime}
                        portal={false}
                      >
                        <MenuItem value="09:00">
                          <span style={{ color: 'grey' }}>09:00 AM </span>{' '}
                          Morning
                        </MenuItem>
                        <MenuItem value="12:00">
                          <span style={{ color: 'grey' }}>12:00 PM </span>{' '}
                          Afternoon
                        </MenuItem>
                        <MenuItem value="18:00">
                          <span style={{ color: 'grey' }}>06:00 PM </span>{' '}
                          Evening
                        </MenuItem>
                      </PaperTimeInput>
                    </span>
                  </div>

                  {!readOnly && isReschedulable && (
                    <ControlPanel>
                      {userRoles.length === 1 ? (
                        <PaperButton
                          onClick={this.handleReschedule.bind(
                            this,
                            userRoles[0]
                          )}
                          disabled={disabled || !canReschedule || isProgressing}
                        >
                          Reschedule
                        </PaperButton>
                      ) : (
                        <ButtonMenu
                          disabled={disabled || !canReschedule || isProgressing}
                        >
                          <span>Reschedule As…</span>
                          {userRoles.map(role => (
                            <MenuItem
                              key={getId(role)}
                              onClick={this.handleReschedule.bind(this, role)}
                              disabled={
                                disabled || !canReschedule || isProgressing
                              }
                            >
                              {role.name
                                ? `${role.name} (${role.roleName})`
                                : role.roleName}
                            </MenuItem>
                          ))}
                        </ButtonMenu>
                      )}
                    </ControlPanel>
                  )}
                </div>

                <WorkflowActionHandlerBody>
                  {isBlocked && (
                    <div className="workflow-action-handler__blocked-warning">
                      <h4 className="workflow-action-handler__title">
                        Blocking Actions
                      </h4>
                      <ul className="workflow-action-handler__list">
                        {blockers.map(action => (
                          <li
                            className="workflow-action-handler__list-item workflow-action-handler__list-item--full-width"
                            key={getId(action) || action['@type']}
                          >
                            <Hyperlink
                              page="publisher"
                              graph={graph}
                              action={action}
                              onClick={this.handleView}
                            >
                              <Span>
                                {action.name ||
                                  API_LABELS[action['@type']] ||
                                  action['@type']}
                              </Span>
                            </Hyperlink>
                            <Iconoclass
                              elementType="div"
                              iconName={getIconNameFromSchema(action, 'none')}
                              iconSize={20}
                              className="workflow-action-handler__list-item__icon"
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {endorsedAction && (
                    <div className="workflow-action-handler__blocked-warning">
                      <h4 className="workflow-action-handler__title">
                        Action to endorse
                      </h4>
                      <div className="workflow-action-handler__endorsed-action">
                        <Hyperlink
                          page="publisher"
                          graph={graph}
                          action={endorsedAction}
                          onClick={this.handleView}
                        >
                          <Span>
                            {endorsedAction.name ||
                              API_LABELS[endorsedAction['@type']] ||
                              endorsedAction['@type']}
                          </Span>
                        </Hyperlink>
                        <Iconoclass
                          elementType="div"
                          iconName={getIconNameFromSchema(
                            endorsedAction,
                            'none'
                          )}
                          iconSize={20}
                          className="workflow-action-handler__list-item__icon"
                        />
                      </div>
                    </div>
                  )}

                  <Div className="workflow-action-handler__description">
                    {action.description || 'No description'}
                  </Div>
                </WorkflowActionHandlerBody>

                <WorkflowActionHandlerControls error={error}>
                  <PaperButtonLink
                    page="publisher"
                    graph={graph}
                    action={action}
                    onClick={this.handleView}
                  >
                    View
                  </PaperButtonLink>
                </WorkflowActionHandlerControls>
              </div>
            </Collapse>
          </div>
        </div>
      </div>
    );
  }
}

export const WorkflowAction = onClickOutside(_WorkflowAction);
WorkflowAction.defaultProps = Object.assign(
  {},
  _WorkflowAction.defaultProps,
  WorkflowAction.defaultProps,
  {
    outsideClickIgnoreClass: 'workflow-action-handler'
  }
);

export class WorkflowActionHandlerBody extends React.Component {
  render() {
    return (
      <div
        className={classNames(
          'workflow-action-handler__body',
          this.props.className
        )}
      >
        <div className="workflow-action-handler__body__content">
          {this.props.children}
        </div>
      </div>
    );
  }
}
WorkflowActionHandlerBody.propTypes = {
  children: PropTypes.any.isRequired,
  className: PropTypes.string
};

export class WorkflowActionHandlerControls extends React.Component {
  render() {
    const { error, children, hideControlOnError } = this.props;
    return (
      <ControlPanel
        className="workflow-action-handler__controls"
        error={error}
        hideControlOnError={hideControlOnError}
      >
        {children}
      </ControlPanel>
    );
  }
}
WorkflowActionHandlerControls.propTypes = {
  error: PropTypes.instanceOf(Error),
  hideControlOnError: PropTypes.bool,
  children: PropTypes.any.isRequired
};

function getDueDateTime(action, stage) {
  const startTime = inferStartTime(action, stage);

  return startTime
    ? action.expectedDuration
      ? moment(startTime)
          .add(moment.duration(action.expectedDuration))
          .toDate()
      : new Date(startTime)
    : new Date();
}
