import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import noop from 'lodash/noop';
import pick from 'lodash/pick';
import {
  getActiveRoles,
  getScopeId,
  getAgentId,
  getAgent
} from '@scipe/librarian';
import { unprefix, getId } from '@scipe/jsonld';
import {
  WorkflowActionHandlerBody,
  WorkflowActionHandlerControls
} from './workflow-action';
import UserAutocomplete from './autocomplete/user-autocomplete';
import JournalStaffAutocomplete from './autocomplete/journal-staff-autocomplete';
import AnonymizedRoleAutocomplete from './autocomplete/anonymized-role-autocomplete';
import PaperButton from './paper-button';
import ButtonMenu from './button-menu/button-menu';
import MenuItem from './menu/menu-item';

/**
 * Abstract away logic to provide the right autocomplete and controls
 * required to select a user to invite to an editorial workflow
 */
export default class WorkflowParticipantsHandler extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        '@id': PropTypes.string.isRequired
      })
    ]).isRequired,
    // ^^ `source`: where the potential participants come from: the journal or
    // any users on SA. Note that `journal` shouldn't be used for `author` and that
    // `users` should not be used when user cannot view the identity of the
    // participants he tries to invite
    roleName: PropTypes.oneOf(['author', 'reviewer', 'editor', 'producer'])
      .isRequired, // the `roleName` being invited / joining
    periodical: PropTypes.object,
    graph: PropTypes.object,
    acl: PropTypes.object.isRequired, // Graph ACL
    onAction: PropTypes.func,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    children: PropTypes.any
  };

  static defaultProps = {
    user: {},
    graph: {},
    periodical: {},
    onAction: noop,
    onChange: noop
  };

  static getDerivedStateFromProps(props, state) {
    if (props.roleName !== state.lastRoleName) {
      return {
        value: '',
        selectedItem: undefined,
        source: props.roleName === 'author' ? 'users' : 'journal',
        lastRoleName: props.roleName
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.state = {
      value: '',
      selectedItem: undefined,
      source: props.roleName === 'author' ? 'users' : 'journal',
      lastRoleName: props.roleName
    };
  }

  handleChange = (value, selectedItem) => {
    const { onChange } = this.props;
    this.setState({
      value,
      selectedItem
    });

    onChange(value, selectedItem);
  };

  handleFilter(filter) {
    const { onChange } = this.props;
    this.setState({
      source: filter,
      value: '',
      selectedItem: undefined
    });
    onChange('', undefined);
  }

  handleJoin = () => {
    const { user, roleName, graph, onAction } = this.props;
    const { selectedItem } = this.state;

    const joinAction = {
      '@type': 'JoinAction',
      actionStatus: 'CompletedActionStatus',
      agent: {
        '@type': 'ContributorRole',
        roleName: selectedItem.roleName || roleName,
        agent: getId(user)
      },
      object: getScopeId(graph)
    };

    if (
      getId(selectedItem) &&
      (getId(selectedItem).startsWith('role:') ||
        getId(selectedItem).startsWith('anon:'))
    ) {
      joinAction.agent['@id'] = getId(selectedItem);
    }

    if (
      selectedItem.roleName &&
      selectedItem.name &&
      selectedItem.name !== roleName
    ) {
      joinAction.agent.name = selectedItem.name;
    }
    onAction(joinAction, { close: true });
    this.setState({
      value: '',
      source: roleName === 'author' ? 'users' : 'journal',
      selectedItem: undefined
    });
    this.autocomplete.reset();
  };

  handleInvite(actionStatus, agent) {
    const { selectedItem } = this.state;
    const { graph, onAction, roleName } = this.props;

    if (selectedItem) {
      const invitedUser = getAgent(selectedItem);
      const recipient =
        typeof invitedUser === 'string'
          ? { '@id': invitedUser }
          : pick(invitedUser, ['@id', '@type', 'email', 'sameAs']);

      const inviteAction = {
        '@type': 'InviteAction',
        name: `Invite ${selectedItem.name || roleName}`,
        actionStatus,
        agent: getId(agent),
        recipient: {
          // Note: @id and `name` are added further downstream
          '@type': 'ContributorRole',
          roleName,
          recipient
        },
        object: getScopeId(graph)
      };

      if (
        getId(selectedItem) &&
        (getId(selectedItem).startsWith('role:') ||
          getId(selectedItem).startsWith('anon:'))
      ) {
        inviteAction.recipient['@id'] = getId(selectedItem);
        if (selectedItem.sameAs) {
          inviteAction.recipient.sameAs = selectedItem.sameAs;
        }
      }

      if (
        selectedItem.roleName &&
        selectedItem.name &&
        selectedItem.name !== roleName
      ) {
        inviteAction.recipient.name = selectedItem.name;
      }

      onAction(inviteAction, { close: true });
      this.setState({
        value: '',
        source: roleName === 'author' ? 'users' : 'journal',
        selectedItem: undefined
      });
      this.autocomplete.reset();
    }
  }

  render() {
    const {
      children,
      roleName,
      graph,
      periodical,
      user,
      disabled,
      acl
    } = this.props;
    const { selectedItem, source } = this.state;

    const username = unprefix(getId(user));
    const selectedUsername = unprefix(getAgentId(selectedItem));

    const userRoles = acl.getActiveRoles(user);

    const periodicalContributors = getActiveRoles(periodical);
    const graphContributors = getActiveRoles(graph);

    const blindingData = acl.getBlindingData(user, {
      ignoreEndDateOnPublicationOrRejection: true
    });
    const anonymousInvites = !blindingData.visibleRoleNames.has(roleName);

    let errorNoRoles, errorNoMoreRoles;
    if (source === 'journal') {
      if (!periodicalContributors.some(role => role.roleName === roleName)) {
        errorNoRoles = new Error(
          `The journal has no ${pluralize(
            roleName
          )}. Go to the journal settings to add new staff${
            !anonymousInvites && roleName === 'reviewer'
              ? ` or invite a guest ${roleName}`
              : ''
          }.`
        );
      }

      if (
        periodicalContributors
          .filter(role => role.roleName === roleName)
          .every(role => {
            return graphContributors.some(graphRole => {
              return (
                graphRole.roleName === role.roleName &&
                graphRole.name === role.name &&
                getAgentId(graphRole) === getAgentId(role)
              );
            });
          })
      ) {
        errorNoMoreRoles = new Error(
          `No staff to add. All the ${pluralize(
            roleName
          )} of the journal have already been added to the project. Go to the journal settings to add new staff.`
        );
      }
    }

    // TODO blacklist for autocompletes
    return (
      <div className="workflow-participants-handler">
        {!!(
          (source === 'journal' &&
            (!anonymousInvites || (!errorNoRoles && !errorNoMoreRoles))) ||
          source === 'users'
        ) && (
          <WorkflowActionHandlerBody>
            <div className="workflow-participants-handler__search">
              <div className="workflow-participants-handler__autocomplete">
                {source === 'users' ? (
                  <UserAutocomplete
                    ref={el => {
                      this.autocomplete = el;
                    }}
                    label="Search by username or email"
                    name="recipient"
                    roleName={roleName}
                    floatLabel={false}
                    value={this.state.value}
                    onSubmit={this.handleChange}
                    onChange={this.handleChange}
                  />
                ) : anonymousInvites ? (
                  <AnonymizedRoleAutocomplete
                    ref={el => {
                      this.autocomplete = el;
                    }}
                    label="Search by identifier or subject"
                    name="recipient"
                    graphId={getId(graph)}
                    roleName={roleName}
                    periodical={periodical}
                    floatLabel={false}
                    value={this.state.value}
                    onSubmit={this.handleChange}
                    onChange={this.handleChange}
                  />
                ) : (
                  <JournalStaffAutocomplete
                    ref={el => {
                      this.autocomplete = el;
                    }}
                    label="Search by username or title"
                    name="recipient"
                    roleName={roleName}
                    periodical={periodical}
                    floatLabel={false}
                    value={this.state.value}
                    onSubmit={this.handleChange}
                    onChange={this.handleChange}
                  />
                )}
              </div>
              {!!(roleName === 'reviewer' && !anonymousInvites) && (
                <ButtonMenu className="workflow-participants-handler__filter">
                  <span>
                    {source === 'journal'
                      ? 'Journal reviewers'
                      : 'Guest reviewers'}
                  </span>
                  <MenuItem
                    disabled={source === 'journal'}
                    onClick={this.handleFilter.bind(this, 'journal')}
                  >
                    Journal reviewers
                  </MenuItem>
                  <MenuItem
                    disabled={source === 'users'}
                    onClick={this.handleFilter.bind(this, 'users')}
                  >
                    Guest reviewers
                  </MenuItem>
                </ButtonMenu>
              )}
            </div>
            {children}
          </WorkflowActionHandlerBody>
        )}

        <WorkflowActionHandlerControls
          error={errorNoRoles || errorNoMoreRoles}
          hideControlOnError={true}
        >
          {selectedUsername === username ? (
            <PaperButton
              onClick={this.handleJoin}
              disabled={disabled || !selectedItem}
            >
              Join
            </PaperButton>
          ) : userRoles.length === 1 ? (
            <Fragment>
              <PaperButton
                onClick={this.handleInvite.bind(
                  this,
                  'ActiveActionStatus',
                  userRoles[0]
                )}
                disabled={disabled || !selectedItem}
              >
                Invite
              </PaperButton>
              <PaperButton
                onClick={this.handleInvite.bind(
                  this,
                  'PotentialActionStatus',
                  userRoles[0]
                )}
                disabled={disabled || !selectedItem}
              >
                Queue
              </PaperButton>
            </Fragment>
          ) : (
            <Fragment>
              <ButtonMenu disabled={disabled || !selectedItem}>
                <span>Invite as…</span>
                {userRoles.map(role => (
                  <MenuItem
                    key={getId(role)}
                    onClick={this.handleInvite.bind(
                      this,
                      'ActiveActionStatus',
                      role
                    )}
                    disabled={disabled || !selectedItem}
                  >
                    {role.name
                      ? `${role.name} (${role.roleName})`
                      : role.roleName}
                  </MenuItem>
                ))}
              </ButtonMenu>

              <ButtonMenu disabled={disabled || !selectedItem}>
                <span>Queue as …</span>
                {userRoles.map(role => (
                  <MenuItem
                    key={getId(role)}
                    onClick={this.handleInvite.bind(
                      this,
                      'PotentialActionStatus',
                      role
                    )}
                    disabled={disabled || !selectedItem}
                  >
                    {role.name
                      ? `${role.name} (${role.roleName})`
                      : role.roleName}
                  </MenuItem>
                ))}
              </ButtonMenu>
            </Fragment>
          )}
        </WorkflowActionHandlerControls>
      </div>
    );
  }
}
