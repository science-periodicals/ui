import React from 'react';
import PropTypes from 'prop-types';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import { arrayify, getId, unprefix } from '@scipe/jsonld';
import {
  CONTACT_POINT_EDITORIAL_OFFICE,
  getAgentId,
  getAgent
} from '@scipe/librarian';
import Iconoclass from '@scipe/iconoclass';
import PaperSelect from './paper-select';
import PaperButton from './paper-button';
import PaperSwitch from './paper-switch';
import Divider from './divider';
import ControlPanel from './control-panel';
import Card from './card';
import UserBadge from './user-badge';
import RoleTitleAutocomplete from './autocomplete/role-title-autocomplete';
import UserAutocomplete from './autocomplete/user-autocomplete';
import DateFromNow from './date-from-now';
import SubjectEditor from './subject-editor';
import BemTags from '../utils/bem-tags';
import AutoAbridge from './auto-abridge';

export default class PeriodicalInviteEditor extends React.Component {
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

    inviteAction: PropTypes.object.isRequired,
    isNewInviteAction: PropTypes.bool, // if true then the component is used to create a new invite and onChange is called instead of onAction when action is changed

    isProgressing: PropTypes.bool,

    onChange: PropTypes.func,
    onAction: PropTypes.func,
    onDelete: PropTypes.func,
    onClose: PropTypes.func
  };

  static defaultProps = {
    periodical: {},
    onDelete: noop,
    onClose: noop,
    onAction: noop,
    onChange: noop
  };

  constructor(props) {
    super(props);
    this.state = {
      canInvite: false
    };
  }

  handleUserAutocomplete = (value, userProfile) => {
    const { user, inviteAction, isNewInviteAction } = this.props;
    const canInvite =
      value && userProfile && getId(userProfile) !== getId(user);
    this.setState({
      canInvite
    });

    if (isNewInviteAction && canInvite) {
      const nextAction = Object.assign(
        {},
        inviteAction,
        {
          recipient: Object.assign({}, inviteAction.recipient, {
            recipient: pick(userProfile, ['@id', '@type', 'email'])
          })
        },
        // resolve grantee if it was previously set
        inviteAction.instrument
          ? {
              instrument: arrayify(inviteAction.instrument).map(instrument => {
                if (instrument.permissionType === 'AdminPermission') {
                  return Object.assign({}, instrument, {
                    grantee: pick(userProfile, ['@id', '@type', 'email'])
                  });
                }
                return instrument;
              })
            }
          : undefined
      );

      this.props.onChange(nextAction);
    }
  };

  handleRoleChange = nextRole => {
    const { isNewInviteAction, inviteAction } = this.props;
    if (isNewInviteAction) {
      this.props.onChange(
        Object.assign(
          {},
          // !! if next role is reviewer, we delete instrument as reviewer cannot be journal admins
          nextRole.roleName === 'reviewer'
            ? omit(inviteAction, ['instrument'])
            : inviteAction,
          {
            recipient: nextRole
          }
        )
      );
    }
  };

  handleChangeIsAdmin = (isAdmin, e) => {
    e.preventDefault();
    let { inviteAction, isNewInviteAction } = this.props;

    if (isNewInviteAction) {
      if (isAdmin) {
        const recipient = getAgent(inviteAction.recipient);
        inviteAction = Object.assign({}, inviteAction, {
          instrument: arrayify(inviteAction.instrument)
            .filter(
              instrument => instrument.permissionType !== 'AdminPermission'
            )
            .concat({
              '@type': 'DigitalDocumentPermission',
              grantee: pick(recipient, ['@id', '@type', 'email']),
              permissionType: 'AdminPermission'
            })
        });
      } else {
        inviteAction = Object.assign({}, inviteAction, {
          instrument: arrayify(inviteAction.instrument).filter(
            instrument => instrument.permissionType !== 'AdminPermission'
          )
        });
        if (!inviteAction.instrument.length) {
          delete inviteAction.instrument;
        }
      }
      this.props.onChange(inviteAction);
    }
  };

  // global delete
  handleDelete = e => {
    e.preventDefault();
    const { inviteAction, isNewInviteAction, onDelete, onClose } = this.props;

    if (isNewInviteAction) {
      onClose(inviteAction, e);
    } else {
      onDelete(inviteAction);
    }
  };

  handleSendInvite = e => {
    e.preventDefault();
    const { inviteAction, onAction } = this.props;
    const { canInvite } = this.state;

    if (canInvite) {
      onAction(
        Object.assign({}, inviteAction, {
          actionStatus: 'ActiveActionStatus'
        })
      );
    }
  };

  render() {
    const bem = BemTags();

    const {
      isProgressing,
      isNewInviteAction,
      inviteAction,
      user,
      acl,
      disabled: _disabled
    } = this.props;

    const { canInvite } = this.state;

    const roles = arrayify(inviteAction.recipient);

    const recipientUserId = getAgentId(inviteAction.recipient);
    const username = recipientUserId
      ? unprefix(recipientUserId)
      : unprefix(getAgent(inviteAction.recipient).email);

    const isAdmin = acl.checkPermission(user, 'AdminPermission');

    const disabled = _disabled || isProgressing || !isNewInviteAction;

    const canEditAdminFields = !disabled && isAdmin;

    return (
      <Card className={bem`periodical-invite-editor`}>
        {isNewInviteAction ? (
          <div>
            <header className={bem`header`}>
              <div className={bem`user-info`}>
                <Iconoclass
                  size="3.2rem"
                  iconName="personAdd"
                  round={true}
                  className={bem`user-info-icon`}
                  style={{ marginRight: '1.6rem' }}
                />
                <span>Add Collaborator</span>
              </div>
              <Iconoclass
                iconName="delete"
                behavior="button"
                tagName="button"
                onClick={this.handleDelete}
                className={bem`delete-button`}
              />
            </header>
            <div className={bem`user-autocomplete-container`}>
              <UserAutocomplete
                ref={el => (this.autocomplete = el)}
                name="user"
                label="Add collaborator"
                placeholder="Search or enter email"
                onChange={this.handleUserAutocomplete}
                onSubmit={this.handleUserAutocomplete}
              />
            </div>
          </div>
        ) : (
          <header className={bem`header`}>
            <div className={bem`user-info`}>
              <UserBadge
                userId={recipientUserId}
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
                queued={true}
              />
              <AutoAbridge ellipsis={true}>{username}</AutoAbridge>

              {isAdmin &&
                inviteAction.actionStatus !== 'CompletedActionStatus' && (
                  <Iconoclass
                    iconName="delete"
                    behavior="button"
                    tagName="button"
                    disabled={isProgressing || _disabled}
                    onClick={this.handleDelete}
                    className={bem`delete-button`}
                  />
                )}
            </div>
          </header>
        )}

        {!isNewInviteAction && (
          <div className={bem`invite-sent`}>
            <span>
              Invite sent <DateFromNow>{inviteAction.startTime}</DateFromNow>
            </span>
          </div>
        )}

        {/* Admin control: note that for new invites, only an admin can grant admin rights to the recipient of the invite */}
        {inviteAction.recipient.roleName !== 'reviewer' &&
          (!isNewInviteAction || (isNewInviteAction && isAdmin)) && (
            <div className={bem`admin`}>
              Admin
              <PaperSwitch
                id={`${username}-admin`}
                checked={arrayify(inviteAction.instrument).some(
                  instrument => instrument.permissionType === 'AdminPermission'
                )}
                onClick={this.handleChangeIsAdmin}
                readOnly={!canEditAdminFields}
                disabled={disabled || !canEditAdminFields}
              />
            </div>
          )}

        <Divider />

        <div className={bem`body`}>
          <ul className={bem`list`}>
            {roles.map(role => (
              <li
                key={
                  getId(role) ||
                  getAgentId(role) ||
                  getAgent(role).email ||
                  `${getId(inviteAction)}@invite`
                }
                className={bem`list-item`}
              >
                <Role
                  ref={el => {
                    if (isNewInviteAction) {
                      this.role = el;
                    }
                  }}
                  {...this.props}
                  role={role}
                  disabled={disabled}
                  readOnly={!isNewInviteAction}
                  canEditAdminFields={canEditAdminFields}
                  onChange={this.handleRoleChange}
                />
              </li>
            ))}
          </ul>

          {isNewInviteAction && (
            <ControlPanel>
              <PaperButton
                onClick={this.handleSendInvite}
                disabled={!canInvite}
              >
                Invite
              </PaperButton>
            </ControlPanel>
          )}
        </div>
      </Card>
    );
  }
}

class Role extends React.Component {
  static propTypes = {
    periodical: PropTypes.object,
    roleName: PropTypes.string,
    role: PropTypes.object.isRequired,
    isNewInviteAction: PropTypes.bool,
    inviteAction: PropTypes.object.isRequired,
    user: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        '@id': PropTypes.string.isRequired
      })
    ]).isRequired,
    canEditAdminFields: PropTypes.bool,
    onChange: PropTypes.func, // only used for new invite, and called with onChange(nextRole)
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    children: PropTypes.node
  };

  static defaultProps = {
    onChange: noop
  };

  reset() {
    this.autocomplete.reset();
  }

  handleChangeRoleName = e => {
    // only used in case of new invite actions
    const { role, onChange } = this.props;
    const roleName = e.target.value;

    onChange(
      Object.assign(
        {},
        roleName === 'producer' || roleName === 'reviewer'
          ? omit(role, ['roleContactPoint', 'about'])
          : role,
        { roleName }
      )
    );
  };

  handleChangeSubRoleName = value => {
    const { role } = this.props;
    this.props.onChange(Object.assign({}, role, { name: value }));
  };

  handleSubmitSubRoleName = value => {
    const { role, onChange } = this.props;
    this.autocomplete.resetValue(value);
    this.autocomplete.blur();

    onChange(
      Object.assign({}, role, {
        name: value
      })
    );
  };

  handleChangeIsContactPoint = (isContactPoint, e) => {
    e.preventDefault();
    const { onChange, inviteAction } = this.props;

    onChange(
      isContactPoint
        ? Object.assign({}, inviteAction.recipient, {
            roleContactPoint: {
              '@type': 'ContactPoint',
              contactType: CONTACT_POINT_EDITORIAL_OFFICE
            }
          })
        : omit(inviteAction.recipient, ['roleContactPoint'])
    );
  };

  handleAddSubject = subject => {
    const { inviteAction, onChange } = this.props;

    if (getId(subject)) {
      const { recipient } = inviteAction;
      onChange(
        Object.assign({}, recipient, {
          about: arrayify(recipient && recipient.about)
            .filter(about => getId(about) !== getId(subject))
            .concat(pick(subject, ['@id', '@type', 'name']))
        })
      );
    }
  };

  handleDeleteSubject = subjectIds => {
    const { inviteAction, onChange } = this.props;

    subjectIds = arrayify(subjectIds)
      .map(subjectId => getId(subjectId))
      .filter(subjectId => subjectId);

    if (subjectIds.length) {
      const { recipient } = inviteAction;
      if (recipient) {
        const nextSubjects = arrayify(recipient.about).filter(
          about => !subjectIds.some(_about => getId(_about) === getId(about))
        );

        onChange(
          nextSubjects.length
            ? Object.assign({}, recipient, {
                about: nextSubjects
              })
            : omit(recipient, ['about'])
        );
      }
    }
  };

  render() {
    const {
      role,
      periodical,
      disabled,
      readOnly,
      canEditAdminFields,
      inviteAction,
      isNewInviteAction,
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
        <div className={bem`role-row`}>
          <PaperSelect
            label="role"
            name="roleName"
            value={role.roleName}
            disabled={disabled}
            readOnly={readOnly}
            onChange={this.handleChangeRoleName}
          >
            <option value="editor">Editor</option>
            <option value="producer">Producer</option>
            <option value="reviewer">Reviewer</option>
          </PaperSelect>
        </div>

        {!!(isNewInviteAction && role.roleName !== 'reviewer') && (
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
              readOnly={readOnly}
            />
          </div>
        )}

        {role.roleName === 'editor' && !!(isNewInviteAction || isContactPoint) && (
          <div className={bem`role-row handle-submission`}>
            Handle incoming submissions
            <PaperSwitch
              id={`${getId(role) || getId(inviteAction)}-contact`}
              checked={isContactPoint}
              onClick={this.handleChangeIsContactPoint}
              disabled={disabled || !canEditAdminFields}
              readOnly={readOnly}
            />
          </div>
        )}

        {role.roleName === 'editor' && !!isNewInviteAction && (
          <div className={bem`role-row`}>
            <SubjectEditor
              entity={role}
              label="Add area of responsibility"
              disabled={disabled}
              readOnly={readOnly}
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
