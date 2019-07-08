import React, { Component } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import classNames from 'classnames';
import WorkflowParticipantsList from './workflow-participants-list';
import { getWorkflowParticipantsAclData } from '../utils/participant-utils';

export default class WorkflowParticipants extends Component {
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

  render() {
    const {
      roleName,
      graph,
      user,
      acl,
      workflowSpecification,
      disabled,
      inviteActions,
      onAction,
      onDelete
    } = this.props;

    const { participantNeeded } = getWorkflowParticipantsAclData(
      user,
      acl,
      roleName,
      workflowSpecification,
      graph
    );

    return (
      <div
        className={classNames('workflow-participants', {
          'workflow-participants--no-participant-needed': !participantNeeded
        })}
      >
        {participantNeeded ? (
          <WorkflowParticipantsList
            disabled={disabled}
            user={user}
            roleName={roleName}
            inviteActions={inviteActions}
            acl={acl}
            workflowSpecification={workflowSpecification}
            graph={graph}
            onAction={onAction}
            onDelete={onDelete}
          />
        ) : (
          <span>None required </span>
        )}
      </div>
    );
  }
}
