import React from 'react';
import PropTypes from 'prop-types';
import pick from 'lodash/pick';
import noop from 'lodash/noop';
import { getId, unprefix } from '@scipe/jsonld';
import { getActiveRoles, getAgentId } from '@scipe/librarian';
import Iconoclass from '@scipe/iconoclass';
import Card from './card';
import UserBadge from './user-badge';
import AutoAbridge from './auto-abridge';
import bemify from '../utils/bemify';

export default class OrganizationMemberEditor extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    organization: PropTypes.object.isRequired,
    user: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        '@id': PropTypes.string.isRequired
      })
    ]).isRequired,

    editedUserId: PropTypes.string.isRequired, // must be an admin present in the `organization`
    isProgressing: PropTypes.bool,
    onAction: PropTypes.func
  };

  static defaultProps = {
    organization: {},
    onAction: noop
  };

  // global delete
  handleDelete(role, e) {
    e.preventDefault();
    const { organization, editedUserId, onAction, user } = this.props;
    const userId = getId(user);

    // TODO set participant to administrator (need librarian update)

    // issue a LeaveAction or DeauthorizeAction
    let action;
    if (editedUserId === userId) {
      action = {
        '@type': 'LeaveAction',
        actionStatus: 'CompletedActionStatus',
        agent: Object.assign(pick(role, ['@id', '@type', 'roleName', 'name']), {
          agent: getAgentId(role)
        }),
        object: getId(organization)
      };
    } else {
      action = {
        '@type': 'DeauthorizeContributorAction',
        actionStatus: 'CompletedActionStatus',
        agent: userId,
        recipient: Object.assign(
          pick(role, ['@id', '@type', 'roleName', 'name']),
          {
            recipient: getAgentId(role)
          }
        ),
        object: getId(organization)
      };
    }
    onAction(action);
  }

  render() {
    const { organization, editedUserId, isProgressing, disabled } = this.props;

    const activeRoles = getActiveRoles(organization);
    const agentIds = Array.from(
      new Set(activeRoles.map(role => getAgentId(role)).filter(Boolean))
    );

    const role = activeRoles.find(role => {
      return (
        getAgentId(role) === editedUserId && role.roleName === 'administrator'
      );
    });

    const editedUsername = unprefix(editedUserId);

    const bem = bemify('organization-member-editor');

    return (
      <Card className={bem``}>
        <header className={bem`__header`}>
          <div className={bem`__user-info`}>
            <UserBadge
              userId={editedUserId}
              progressMode={isProgressing ? 'bounce' : 'none'}
            />
            <AutoAbridge ellipsis={true}>{editedUsername}</AutoAbridge>

            {agentIds.length > 1 && (
              <Iconoclass
                iconName="delete"
                behavior="button"
                tagName="button"
                disabled={isProgressing || disabled}
                onClick={this.handleDelete.bind(this, role)}
              />
            )}
          </div>
        </header>
      </Card>
    );
  }
}
