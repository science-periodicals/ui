import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import noop from 'lodash/noop';
import pick from 'lodash/pick';
import pickBy from 'lodash/pickBy';
import capitalize from 'lodash/capitalize';
import pluralize from 'pluralize';
import { arrayify, getId } from '@scipe/jsonld';
import {
  needActionAssignment,
  isActionAssigned,
  getStageActions,
  getActionPotentialAssignee,
  getActionPotentialAssigners,
  getSourceRoleId,
  getAgentId
} from '@scipe/librarian';
import Iconoclass from '@scipe/iconoclass';
import UserBadgeMenu from './user-badge-menu';
import MenuItem, { MenuCardItem, MenuItemLabel } from './menu/menu-item';
import { getDisplayName, getUserBadgeLabel } from '../utils/graph';

export default class WorkflowActionUserBadgeMenu extends React.Component {
  static propTypes = {
    'data-testid': PropTypes.string,
    className: PropTypes.string,
    user: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        '@id': PropTypes.string.isRequired
      })
    ]).isRequired,
    roleName: PropTypes.oneOf(['author', 'reviewer', 'editor', 'producer']),
    graph: PropTypes.object,
    acl: PropTypes.object.isRequired,

    stage: PropTypes.object, // required if not readOnly
    action: PropTypes.object.isRequired,

    canAssign: PropTypes.bool, // sometimes we need to overwrite what is infered from the graph and permissions
    readOnly: PropTypes.bool, // Note that this is different from disabled
    disabled: PropTypes.bool,

    closeOnSubmit: PropTypes.bool,
    isProgressing: PropTypes.bool,

    onAction: PropTypes.func,

    heartbeat: PropTypes.bool
  };

  static defaultProps = {
    graph: {},

    portal: false,

    isProgressing: false,
    closeOnSubmit: true,

    onAction: noop
  };

  handleAssignment(assignee, assigner) {
    const { action, onAction } = this.props;

    onAction(
      pickBy({
        '@type': 'AssignAction',
        actionStatus: 'CompletedActionStatus',
        agent: Object.assign(
          { '@type': 'ContributorRole' },
          pick(assigner, ['@id', '@type', 'roleName', 'name']),
          { agent: getAgentId(assigner) }
        ),
        participant: action.participant,
        recipient: Object.assign(
          { '@type': 'ContributorRole' },
          pick(assignee, ['@id', '@type', 'roleName', 'name']),
          { recipient: getAgentId(assignee) }
        ),
        object: getId(action)
      })
    );
  }

  handleUnassign(role) {
    const { action, onAction } = this.props;

    onAction(
      pickBy({
        '@type': 'UnassignAction',
        actionStatus: 'CompletedActionStatus',
        agent: Object.assign(
          { '@type': 'ContributorRole' },
          pick(role, ['@id', '@type', 'roleName', 'name']),
          { agent: getAgentId(role) }
        ),
        participant: action.participant,
        object: getId(action)
      })
    );
  }

  renderPotentialAssignees(disabled, blindingData) {
    const { graph, action, stage, user, roleName } = this.props;

    const potentialAssigneeRoles = getActionPotentialAssignee(action, graph, {
      workflowActions: getStageActions(stage)
    });

    if (!potentialAssigneeRoles.length) {
      return (
        <MenuCardItem key="assignee">
          <div className="workflow-action-user-badge-menu__assignment-warning">
            <div className="workflow-action-user-badge-menu__assignment-warning__header">
              <div className="workflow-action-user-badge-menu__assignment-warning__header__icon">
                <Iconoclass iconName="warning" round={true} size={'18px'} />
              </div>
              <div>No potential assignee</div>
            </div>
            <div className="workflow-action-user-badge-menu__assignment-warning__body">
              Add{' '}
              <strong>
                {pluralize(
                  action.agent && action.agent.roleName && action.agent.name
                    ? action.agent.name
                    : (action.agent && action.agent.roleName) || roleName
                )}
              </strong>{' '}
              so the action can be assigned and completed.
            </div>
          </div>
        </MenuCardItem>
      );
    }

    let potentialAssignerRoles = getActionPotentialAssigners(
      action,
      graph,
      user
    );

    // Add self to potentialAssignerRoles if self is part of `potentialAssigneeRoles`
    const userId = getAgentId(user);
    const selfAssigneeRoles = potentialAssigneeRoles.filter(
      role =>
        userId &&
        getAgentId(role) === userId &&
        !potentialAssignerRoles.some(_role => getId(role) === getId(_role))
    );
    potentialAssignerRoles = potentialAssignerRoles.concat(selfAssigneeRoles);

    const menuItems = [
      <MenuItemLabel key={'assignee'}>Assign To</MenuItemLabel>
    ];

    potentialAssigneeRoles.forEach(assignee => {
      potentialAssignerRoles.forEach(assigner => {
        let assigneeDisplayName = (
          <span>
            <span className="workflow-action-user-badge-menu__menu-item-name">
              {getDisplayName(blindingData, assignee, {
                addRoleNameSuffix: true
              })}
            </span>
          </span>
        );

        let assignerDisplayName = (
          <span>
            <span className="workflow-action-user-badge-menu__menu-item-name">
              {getDisplayName(blindingData, assigner, {
                addAnonymousDisplayName: false,
                addRoleNameSuffix: true
              })}
            </span>
          </span>
        );

        menuItems.push(
          <MenuItem
            divider={true}
            onClick={this.handleAssignment.bind(this, assignee, assigner)}
            key={`${getId(assignee)}-${getId(assigner)}`}
            disabled={disabled}
            fixedHeight={false}
            className="workflow-action-user-badge-menu__multi-line-menu-item"
          >
            <div>{assigneeDisplayName}</div>
            <div className="workflow-action-user-badge-menu__menu-item-assigner">
              Assigned by {assignerDisplayName}
            </div>
          </MenuItem>
        );
      });
    });

    return menuItems;
  }

  renderAssigner(blindingData) {
    const { acl, action } = this.props;

    let assignerRole = arrayify(action.participant).find(
      participant => participant.roleName === 'assigner'
    );

    if (!assignerRole) {
      return null;
    }

    const assignerRoleId = getSourceRoleId(assignerRole);
    if (assignerRoleId) {
      assignerRole =
        acl.findRole(assignerRoleId, { active: false }) || assignerRole;
    }

    return (
      <Fragment key="assigner">
        <MenuItemLabel>Assigned by</MenuItemLabel>

        <MenuItem
          disabled={true}
          icon={{
            iconName: 'none',
            size: '18px'
          }}
          key="assigner"
        >
          <span className="menu__item-text menu__item-text--right-icon">
            <span className="menu__item-text__left">
              {getDisplayName(blindingData, assignerRole)}
            </span>
            <Iconoclass iconName="supervisor" />
          </span>
        </MenuItem>
      </Fragment>
    );
  }

  renderUnassign(blindingData, disabled) {
    const { user, graph, action } = this.props;

    const roles = getActionPotentialAssigners(action, graph, user);

    return (
      <Fragment key="unassign">
        {roles.map(role => (
          <MenuItem
            divider={true}
            onClick={this.handleUnassign.bind(this, role)}
            key={`unassign-${getId(role)}`}
            disabled={disabled}
            fixedHeight={false}
            className="workflow-action-user-badge-menu__multi-line-menu-item"
          >
            {roles.length === 1
              ? 'Unassign'
              : `Unassign as ${role.name || role.roleName}`}
          </MenuItem>
        ))}
      </Fragment>
    );
  }

  render() {
    const {
      className,
      acl,
      user,
      action,
      isProgressing,
      heartbeat,
      canAssign: _canAssign,
      disabled: _disabled,
      readOnly
    } = this.props;

    const disabled = _disabled || (getId(action) || '').startsWith('workflow:');
    const blindingData = acl.getBlindingData(user, {
      ignoreEndDateOnPublicationOrRejection: true
    });

    // !! action.agent may miss some properties so we get back the full role from the Graph
    const agent = acl.findRole(action.agent) || action.agent;
    let assigneeOrAgent = agent;
    let assigner = arrayify(action.participant).find(
      participant => participant.roleName === 'assigner'
    );
    const assignerId = getSourceRoleId(assigner);
    if (assignerId) {
      assigner = acl.findRole(assignerId, { active: false }) || assigner;
    }

    const actionNeedsToBeAssignedToBePerformed = needActionAssignment(action);
    const isComplete = action.actionStatus === 'CompletedActionStatus';
    const canAssign =
      !readOnly &&
      !isComplete &&
      (_canAssign == null
        ? acl.checkPermission(user, 'AssignActionPermission', { action })
        : _canAssign);

    const isAssigned = isActionAssigned(action);

    let invite;
    if (!isAssigned) {
      const pendingInviteActions = acl.getPendingInviteActions();
      invite = pendingInviteActions.find(inviteAction =>
        arrayify(inviteAction.purpose).some(
          purpose => getId(purpose) === getId(action)
        )
      );
      if (invite) {
        assigneeOrAgent = invite.recipient;
        assigner = invite.agent;
      }
    }

    const isBlinded = blindingData.isBlinded(assigneeOrAgent);

    let menuItems = [];
    if (canAssign && !isAssigned && !isComplete) {
      menuItems.push(this.renderPotentialAssignees(disabled, blindingData));
    }

    if (assigner) {
      menuItems.push(
        <Fragment key="assigner">
          <MenuItemLabel>Assigned by</MenuItemLabel>

          <MenuItem
            disabled={true}
            icon={{
              iconName: 'none',
              size: '18px'
            }}
            key="assigner"
          >
            <span className="menu__item-text menu__item-text--right-icon">
              <span className="menu__item-text__left">
                {getDisplayName(blindingData, assigner)}
              </span>
              <Iconoclass iconName="supervisor" />
            </span>
          </MenuItem>
        </Fragment>
      );
    }

    if (canAssign && isAssigned && !isComplete) {
      menuItems.push(this.renderUnassign(blindingData, disabled));
    }
    menuItems = menuItems.filter(Boolean);

    return (
      <UserBadgeMenu
        data-testid={this.props['data-testid']}
        className={classNames(className, 'workflow-action-user-badge-menu')}
        iconName={
          isAssigned || getId(assigneeOrAgent) || (!isBlinded && !!invite)
            ? undefined
            : invite && isBlinded
            ? 'anonymous'
            : actionNeedsToBeAssignedToBePerformed
            ? 'personWarning'
            : 'personUnassigned'
        }
        required={
          actionNeedsToBeAssignedToBePerformed &&
          !isAssigned &&
          !getId(assigneeOrAgent)
        }
        anonymous={isBlinded}
        queued={
          (!isAssigned && !!invite) ||
          (!isAssigned &&
            getId(assigneeOrAgent) &&
            (action.actionStatus === 'ActiveActionStatus' ||
              action.actionStatus === 'StagedActionStatus' ||
              action.actionStatus === 'EndorsedActionStatus'))
        }
        statusIconName={
          !isAssigned && !!invite
            ? 'time'
            : !!assigneeOrAgent &&
              assigneeOrAgent['@type'] === 'ServiceProviderRole'
            ? 'bot'
            : undefined
        }
        userBadgeLabel={getUserBadgeLabel(blindingData, assigneeOrAgent)}
        name={
          isAssigned || getId(assigneeOrAgent) || (!isBlinded && !!invite)
            ? getDisplayName(blindingData, assigneeOrAgent, {
                addRoleNameSuffix: true
              })
            : !canAssign &&
              !isAssigned &&
              !getId(assigneeOrAgent) &&
              agent &&
              agent.roleName
            ? agent.name
              ? `${capitalize(agent.name)} (${
                  invite ? 'waiting for invite acceptance' : 'unassigned'
                })`
              : `${capitalize(agent.roleName)} (${
                  invite ? 'waiting for invite acceptance' : 'unassigned'
                })`
            : undefined
        }
        userId={getAgentId(blindingData.resolve(assigneeOrAgent))}
        roleName={(assigneeOrAgent && assigneeOrAgent.roleName) || 'user'}
        size={24}
        align="left"
        progressMode={isProgressing ? 'spinUp' : 'none'}
        displayName={
          isAssigned ||
          !!getId(assigneeOrAgent) ||
          !!(
            !canAssign &&
            !isAssigned &&
            !getId(assigneeOrAgent) &&
            agent &&
            agent.roleName
          )
        }
        displayRoleName={isAssigned}
        portal={true}
        heartbeat={heartbeat}
      >
        {menuItems.length ? menuItems : null}
      </UserBadgeMenu>
    );
  }
}
