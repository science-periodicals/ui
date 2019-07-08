import React from 'react';
import PropTypes from 'prop-types';
import pick from 'lodash/pick';
import noop from 'lodash/noop';
import { arrayify, getId, unprefix } from '@scipe/jsonld';
import {
  getActiveRoles,
  createId,
  CONTACT_POINT_EDITORIAL_OFFICE,
  getAgentId,
  getAgent
} from '@scipe/librarian';
import Iconoclass from '@scipe/iconoclass';
import PaperSelect from './paper-select';
import PaperSwitch from './paper-switch';
import Divider from './divider';
import SubjectEditor from './subject-editor';
import Card from './card';
import UserBadge from './user-badge';
import RoleTitleAutocomplete from './autocomplete/role-title-autocomplete';
import AutoAbridge from './auto-abridge';

import BemTags from '../utils/bem-tags';
import Menu from './menu/menu';
import MenuItem from './menu/menu-item';

const PARTICIPANTS = [
  {
    '@type': 'Audience',
    audienceType: 'editor'
  },
  {
    '@type': 'Audience',
    audienceType: 'producer'
  }
];

export default class PeriodicalContributorEditor extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    periodical: PropTypes.object.isRequired,
    user: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        '@id': PropTypes.string.isRequired
      })
    ]).isRequired,

    acl: PropTypes.object.isRequired,
    editedUserId: PropTypes.string.isRequired,

    isProgressing: PropTypes.bool,

    onAction: PropTypes.func
  };

  static defaultProps = {
    periodical: {},
    onAction: noop
  };

  // handle action generated by the <Role /> component
  handleRoleAction = action => {
    this.props.onAction(action);
  };

  handleChangeIsAdmin = (isAdmin, e) => {
    e.preventDefault();
    let { periodical, user, editedUserId } = this.props;

    const userId = getId(user);
    const action = {
      '@type': isAdmin ? 'AuthorizeAction' : 'DeauthorizeAction',
      actionStatus: 'CompletedActionStatus',
      agent: userId,
      participant: PARTICIPANTS,
      object: getId(periodical),
      instrument: {
        '@type': 'DigitalDocumentPermission',
        grantee: editedUserId,
        permissionType: 'AdminPermission'
      }
    };
    this.props.onAction(action);
  };

  // global delete
  handleDelete(role, e) {
    e.preventDefault();
    const { periodical, editedUserId, onAction, user } = this.props;
    const userId = getId(user);

    // issue a LeaveAction or DeauthorizeAction
    let action;
    if (editedUserId === userId) {
      action = {
        '@type': 'LeaveAction',
        actionStatus: 'CompletedActionStatus',
        agent: Object.assign(pick(role, ['@id', '@type', 'roleName', 'name']), {
          agent: getAgentId(role)
        }),
        participant: PARTICIPANTS,
        object: getId(periodical)
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
        participant: PARTICIPANTS,
        object: getId(periodical)
      };
    }
    onAction(action);
  }

  handleAddRole(roleName) {
    const { periodical, editedUserId, onAction, user } = this.props;
    const userId = getId(user);

    let action;
    if (editedUserId === userId) {
      action = {
        '@type': 'JoinAction',
        actionStatus: 'CompletedActionStatus',
        agent: {
          '@type': 'ContributorRole',
          roleName,
          agent: userId
        },
        participant: PARTICIPANTS,
        object: getId(periodical)
      };
    } else {
      action = {
        '@type': 'AuthorizeContributorAction',
        actionStatus: 'CompletedActionStatus',
        agent: userId,
        recipient: {
          '@type': 'ContributorRole',
          roleName,
          recipient: editedUserId
        },
        participant: PARTICIPANTS,
        object: getId(periodical)
      };
    }
    onAction(action);
  }

  render() {
    const bem = BemTags();

    const {
      periodical,
      editedUserId,
      isProgressing,
      user,
      acl,
      disabled: _disabled
    } = this.props;

    let roles;

    const activeRoles = getActiveRoles(periodical);
    const agentIds = Array.from(
      new Set(activeRoles.map(role => getAgentId(role)).filter(Boolean))
    );

    roles = activeRoles
      .filter(role => {
        return (
          getAgentId(role) === editedUserId &&
          (role.roleName === 'editor' ||
            role.roleName === 'producer' ||
            role.roleName === 'reviewer')
        );
      })
      .sort((a, b) => {
        return a.startDate > b.startDate;
      });

    const editedUsername = unprefix(editedUserId);

    const isAdmin = acl.checkPermission(user, 'AdminPermission');
    const adminIds = new Set(
      arrayify(periodical.hasDigitalDocumentPermission)
        .filter(permission => {
          const granteeId = getId(permission.grantee);
          return (
            permission.permissionType === 'AdminPermission' &&
            granteeId &&
            granteeId.startsWith('user:')
          );
        })
        .map(permission => getId(permission.grantee))
    );

    const disabled =
      _disabled || isProgressing || !(editedUserId === getId(user) || isAdmin);

    const canEditAdminFields = !disabled && isAdmin;

    return (
      <Card className={bem`periodical-contributor-editor`}>
        <header className={bem`header`}>
          <div className={bem`user-info`}>
            <UserBadge
              userId={editedUserId}
              roleName={
                roles.some(role => role.roleName === 'editor')
                  ? 'editor'
                  : roles.some(role => role.roleName === 'producer')
                  ? 'producer'
                  : roles.some(role => role.roleName === 'reviewer')
                  ? 'reviewer'
                  : 'user'
              }
              progressMode={isProgressing ? 'bounce' : 'none'}
            />
            <AutoAbridge ellipsis={true}>{editedUsername}</AutoAbridge>

            {(editedUserId === getId(user) || isAdmin) &&
              agentIds.length > 1 &&
              (!adminIds.has(editedUserId) || adminIds.size > 1) &&
              roles.length === 1 && (
                <Iconoclass
                  tagName="button"
                  iconName="delete"
                  behavior="button"
                  disabled={isProgressing || _disabled}
                  onClick={this.handleDelete.bind(this, roles[0])}
                  className={bem`delete-button`}
                />
              )}
          </div>
        </header>

        {/* Admin control */}
        {roles.some(
          role => role.roleName === 'editor' || role.roleName === 'producer'
        ) && (
          <div className={bem`admin`}>
            Admin
            <PaperSwitch
              id={`${editedUsername}-admin`}
              checked={acl.checkPermission(editedUserId, 'AdminPermission')}
              onClick={this.handleChangeIsAdmin}
              disabled={
                disabled ||
                !canEditAdminFields ||
                // the admin switch is switched (on) and there is only 1 admin => we don't allow to unswitch it
                (acl.checkPermission(editedUserId, 'AdminPermission') &&
                  adminIds.size === 1)
              }
            />
          </div>
        )}

        <Divider />

        <div className={bem`body`}>
          <ul className={bem`list`}>
            {roles.map(role => (
              <li
                key={getId(role) || getAgentId(role) || getAgent(role).email}
                className={bem`list-item`}
              >
                <Role
                  {...this.props}
                  role={role}
                  disabled={disabled}
                  canLeave={roles.length > 1}
                  canEditAdminFields={canEditAdminFields}
                  onAction={this.handleRoleAction}
                />
              </li>
            ))}

            {/* Add role in case of existing periodical contributors */}
            {canEditAdminFields && (
              <li>
                <div className={bem`add-role`}>
                  <Menu iconName="add" portal={true}>
                    <MenuItem onClick={this.handleAddRole.bind(this, 'editor')}>
                      Editor role
                    </MenuItem>
                    <MenuItem
                      onClick={this.handleAddRole.bind(this, 'producer')}
                    >
                      Producer role
                    </MenuItem>
                    {!roles.some(role => role.roleName === 'reviewer') && (
                      <MenuItem
                        onClick={this.handleAddRole.bind(this, 'reviewer')}
                      >
                        Reviewer role
                      </MenuItem>
                    )}
                  </Menu>
                </div>
              </li>
            )}
          </ul>
        </div>
      </Card>
    );
  }
}

class Role extends React.Component {
  static propTypes = {
    periodical: PropTypes.object,
    roleName: PropTypes.string,
    role: PropTypes.object,
    editedUserId: PropTypes.string,
    user: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        '@id': PropTypes.string.isRequired
      })
    ]).isRequired,
    canEditAdminFields: PropTypes.bool,
    onAction: PropTypes.func, // only used for mutating an existing contributor
    disabled: PropTypes.bool,
    canLeave: PropTypes.bool,
    children: PropTypes.node
  };

  static defaultProps = {
    onAction: noop
  };

  reset() {
    if (this.autocomplete) {
      this.autocomplete.reset();
    }
  }

  handleLeave = e => {
    e.preventDefault();
    const { periodical, role, onAction, user, editedUserId } = this.props;
    const userId = getId(user);

    let action;
    if (editedUserId === userId) {
      action = {
        '@type': 'LeaveAction',
        actionStatus: 'CompletedActionStatus',
        agent: Object.assign(pick(role, ['@id', '@type', 'roleName', 'name']), {
          agent: getAgentId(role)
        }),
        participant: PARTICIPANTS,
        object: getId(periodical)
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
        participant: PARTICIPANTS,
        object: getId(periodical)
      };
    }
    onAction(action);
  };

  handleSubmitSubRoleName = value => {
    const { role, onAction, user } = this.props;
    if (this.autocomplete) {
      this.autocomplete.resetValue(value);
      this.autocomplete.blur();
    }

    onAction({
      '@type': 'UpdateAction',
      actionStatus: 'CompletedActionStatus',
      agent: getId(user),
      participant: PARTICIPANTS,
      object: { name: value },
      targetCollection: getId(role)
    });
  };

  handleChangeIsContactPoint = (isContactPoint, e) => {
    e.preventDefault();
    const { role, editedUserId, onAction, user } = this.props;
    const userId = getId(user);

    onAction({
      '@type': isContactPoint
        ? 'AssignContactPointAction'
        : 'UnassignContactPointAction',
      actionStatus: 'CompletedActionStatus',
      agent: userId,
      participant: PARTICIPANTS,
      object: createId('contact', CONTACT_POINT_EDITORIAL_OFFICE, editedUserId)[
        '@id'
      ],
      recipient: getId(role)
    });
  };

  handleAddSubject = subject => {
    const { role, user, onAction } = this.props;

    if (getId(subject)) {
      onAction({
        '@type': 'UpdateAction',
        actionStatus: 'CompletedActionStatus',
        agent: getId(user),
        participant: PARTICIPANTS,
        object: {
          about: arrayify(role.about)
            .filter(about => getId(about) !== getId(subject))
            .concat(pick(subject, ['@id', '@type', 'name']))
        },
        targetCollection: getId(role)
      });
    }
  };

  handleDeleteSubject = subjectIds => {
    const { role, user, onAction } = this.props;

    subjectIds = arrayify(subjectIds)
      .map(subjectId => getId(subjectId))
      .filter(subjectId => subjectId);

    if (subjectIds.length) {
      onAction({
        '@type': 'UpdateAction',
        actionStatus: 'CompletedActionStatus',
        agent: getId(user),
        participant: PARTICIPANTS,
        object: {
          about: arrayify(role.about).filter(
            about => !subjectIds.some(_about => getId(_about) === getId(about))
          )
        },
        targetCollection: getId(role)
      });
    }
  };

  render() {
    const {
      role,
      periodical,
      disabled,
      canEditAdminFields,
      editedUserId,
      canLeave,
      children
    } = this.props;

    const isContactPoint = arrayify(role.roleContactPoint).some(
      contactPoint =>
        contactPoint.contactType === CONTACT_POINT_EDITORIAL_OFFICE
    );

    const semanticTagsMap = arrayify(role.about)
      .filter(tag => {
        const tagId = getId(tag);
        return tagId && tagId.startsWith('subjects:');
      })
      .reduce((semanticTagsMap, semanticTag) => {
        semanticTagsMap[getId(semanticTag)] = semanticTag;
        return semanticTagsMap;
      }, {});

    const bem = BemTags();

    return (
      <div className={bem`periodical-contributor-editor__role`}>
        {!disabled && canLeave && canEditAdminFields && (
          <Iconoclass
            iconName="delete"
            behavior="button"
            tagName="button"
            iconSize={16}
            onClick={this.handleLeave}
            className={bem`delete-button`}
          />
        )}

        <div className={bem`role-row`}>
          <PaperSelect
            label="role"
            name="roleName"
            value={role.roleName}
            disabled={true}
            readOnly={true}
          >
            <option value="editor">Editor</option>
            <option value="producer">Producer</option>
            <option value="reviewer">Reviewer</option>
          </PaperSelect>
        </div>

        {!!(role.roleName !== 'reviewer') && (
          <div className={bem`role-row`}>
            <RoleTitleAutocomplete
              ref={el => {
                this.autocomplete = el;
              }}
              scope={role.roleName}
              periodical={periodical}
              onSubmit={this.handleSubmitSubRoleName}
              onChange={this.handleChangeSubRoleName}
              value={role.name}
              disabled={disabled || !canEditAdminFields}
            />
          </div>
        )}

        {role.roleName === 'editor' && (
          <div className={bem`role-row handle-submission`}>
            Handle incoming submissions
            <PaperSwitch
              id={`${editedUserId}-contact`}
              checked={isContactPoint}
              onClick={this.handleChangeIsContactPoint}
              disabled={disabled || !canEditAdminFields}
            />
          </div>
        )}

        {role.roleName === 'editor' && (
          <div className={bem`role-row`}>
            <SubjectEditor
              entity={role}
              label="Add area of responsibility"
              disabled={disabled}
              semanticTagsMap={semanticTagsMap}
              onAdd={this.handleAddSubject}
              onDelete={this.handleDeleteSubject}
            />
          </div>
        )}

        {children}
      </div>
    );
  }
}
