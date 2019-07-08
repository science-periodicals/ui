import React, { Component } from 'react';
import PropTypes from 'prop-types';
import pick from 'lodash/pick';
import noop from 'lodash/noop';
import { getActiveRoles, getAgentId } from '@scipe/librarian';
import { getId } from '@scipe/jsonld';
import UserBadgeMenu from './user-badge-menu';
import MenuItem from './menu/menu-item';
import { getDisplayName, getUserBadgeLabel } from '../utils/graph';
import { getWorkflowParticipantsAclData } from '../utils/participant-utils';

export default class WorkflowParticipantsList extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    user: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        '@id': PropTypes.string.isRequired
      })
    ]).isRequired,
    roleName: PropTypes.oneOf(['author', 'reviewer', 'editor', 'producer'])
      .isRequired,
    inviteActions: PropTypes.array,
    acl: PropTypes.object.isRequired,
    workflowSpecification: PropTypes.object, // from the workflow template
    graph: PropTypes.object,
    onAction: PropTypes.func,
    onDelete: PropTypes.func
  };

  static defaultProps = {
    user: {},
    graph: {},
    workflowSpecification: {},
    inviteActions: [],
    onAction: noop,
    onDelete: noop
  };

  handleDelete(inviteAction) {
    this.props.onDelete(inviteAction);
  }

  handleActivateInvite(inviteAction) {
    const { user, roleName, onAction } = this.props;
    onAction(
      Object.assign({}, inviteAction, {
        actionStatus: 'ActiveActionStatus',
        agent:
          roleName || (inviteAction.agent && inviteAction.agent.roleName)
            ? Object.assign(
                { '@type': 'ContributorRole', roleName },
                pick(
                  inviteAction.agent,
                  ['@type', 'roleName', 'startDate', 'endDate'].concat(
                    inviteAction.agent && inviteAction.agent.roleName
                      ? 'name'
                      : []
                  )
                ),
                { agent: getId(user) }
              )
            : getId(user)
      }),
      { close: true }
    );
  }

  render() {
    const {
      roleName,
      graph,
      user,
      acl,
      workflowSpecification,
      disabled,
      inviteActions
    } = this.props;

    const blindingData = acl.getBlindingData(user, {
      ignoreEndDateOnPublicationOrRejection: true
    });

    const activeRoles = getActiveRoles(graph, {
      ignoreEndDateOnPublicationOrRejection: true
    }).filter(role => role.roleName === roleName);

    const subRoleNamesByUserIds = activeRoles.reduce(
      (subRoleNamesByUserIds, role) => {
        const userId = getAgentId(role);
        if (userId) {
          if (!(userId in subRoleNamesByUserIds)) {
            subRoleNamesByUserIds[userId] = {};
          }
          if (role.roleName && role.name) {
            subRoleNamesByUserIds[userId][role.name] = true;
          }
        }
        return subRoleNamesByUserIds;
      },
      {}
    );

    const { canAddParticipant } = getWorkflowParticipantsAclData(
      user,
      acl,
      roleName,
      workflowSpecification,
      graph
    );

    const participants = [];
    Object.keys(subRoleNamesByUserIds).forEach(userId => {
      const subRoleNames = Object.keys(subRoleNamesByUserIds[userId]);
      const isServiceProviderRole = activeRoles.every(
        role =>
          getAgentId(role) === userId && role['@type'] === 'ServiceProviderRole'
      );

      const isBlinded = blindingData.isBlinded(userId, { roleName });

      participants.push(
        <li key={userId} className="workflow-participants-list__item">
          <UserBadgeMenu
            userId={userId}
            name={getDisplayName(blindingData, userId, {
              roleName,
              addRoleNameSuffix: true,
              name: subRoleNames.join(',')
            })}
            anonymous={isBlinded}
            userBadgeLabel={getUserBadgeLabel(blindingData, userId, {
              roleName
            })}
            statusIconName={isServiceProviderRole ? 'bot' : undefined}
            roleName={roleName}
            subRoleNames={subRoleNames}
            size={24}
            align="left"
          />
        </li>
      );
    });

    const activeInvites = inviteActions.filter(
      action =>
        action['@type'] === 'InviteAction' &&
        action.actionStatus === 'ActiveActionStatus' &&
        action.recipient &&
        action.recipient.roleName === roleName
    );

    activeInvites.forEach(invite => {
      const { recipient } = invite;

      const isBlinded = blindingData.isBlinded(recipient, { roleName });

      participants.push(
        <li
          key={getId(invite) || getAgentId(recipient)}
          className="workflow-participants-list__item"
        >
          <UserBadgeMenu
            statusIconName="time"
            userId={getAgentId(recipient)}
            name={getDisplayName(blindingData, recipient, {
              roleName,
              addRoleNameSuffix: true,
              name: recipient.roleName ? recipient.name : undefined
            })}
            iconName={isBlinded ? 'anonymous' : undefined}
            anonymous={isBlinded}
            userBadgeLabel={getUserBadgeLabel(blindingData, recipient, {
              roleName
            })}
            queued={true}
            roleName={recipient.roleName || roleName}
            subRoleName={recipient.roleName ? recipient.name : undefined}
            size={24}
            align="left"
          >
            <MenuItem disabled={true}>Waiting for acceptance</MenuItem>
            <MenuItem
              divider={true}
              icon="trash"
              disabled={disabled || !canAddParticipant}
              onClick={this.handleDelete.bind(this, invite)}
            >
              Delete
            </MenuItem>
            {/* TODO Add a send reminder menu */}
          </UserBadgeMenu>
        </li>
      );
    });

    const queuedInvites = inviteActions.filter(
      action =>
        action['@type'] === 'InviteAction' &&
        action.actionStatus === 'PotentialActionStatus' &&
        action.recipient &&
        action.recipient.roleName === roleName
    );

    queuedInvites.forEach(invite => {
      const { recipient } = invite;
      const isBlinded = blindingData.isBlinded(recipient, { roleName });

      participants.push(
        <li
          key={getId(invite) || getAgentId(recipient)}
          className="workflow-participants-list__item"
        >
          <UserBadgeMenu
            statusIconName="hourglassOutline"
            userId={getAgentId(recipient)}
            name={getDisplayName(blindingData, recipient, {
              roleName,
              addRoleNameSuffix: true,
              name: recipient.roleName ? recipient.name : undefined
            })}
            iconName={isBlinded ? 'anonymous' : undefined}
            anonymous={isBlinded}
            userBadgeLabel={getUserBadgeLabel(blindingData, recipient, {
              roleName
            })}
            queued={true}
            roleName={recipient.roleName || roleName}
            subRoleName={recipient.roleName ? recipient.name : undefined}
            size={24}
            align="left"
          >
            <MenuItem disabled={true}>Queued invite</MenuItem>
            <MenuItem
              icon="email"
              disabled={disabled || !canAddParticipant}
              onClick={this.handleActivateInvite.bind(this, invite)}
            >
              Send invite
            </MenuItem>
            <MenuItem
              icon="trash"
              disabled={disabled || !canAddParticipant}
              onClick={this.handleDelete.bind(this, invite)}
            >
              Delete
            </MenuItem>
          </UserBadgeMenu>
        </li>
      );
    });

    return <ul className="workflow-participants-list">{participants}</ul>;
  }
}
