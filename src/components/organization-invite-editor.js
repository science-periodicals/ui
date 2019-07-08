import React from 'react';
import PropTypes from 'prop-types';
import pick from 'lodash/pick';
import noop from 'lodash/noop';
import { arrayify, getId, unprefix } from '@scipe/jsonld';
import { getAgentId, getAgent } from '@scipe/librarian';
import Iconoclass from '@scipe/iconoclass';
import PaperButton from './paper-button';
import ControlPanel from './control-panel';
import Card from './card';
import UserBadge from './user-badge';
import UserAutocomplete from './autocomplete/user-autocomplete';
import DateFromNow from './date-from-now';
import bemify from '../utils/bemify';
import AutoAbridge from './auto-abridge';

export default class OrganizationInviteEditor extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    organization: PropTypes.object.isRequired,
    user: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        '@id': PropTypes.string.isRequired
      })
    ]).isRequired,

    inviteAction: PropTypes.object.isRequired,
    isNewInviteAction: PropTypes.bool, // if true then the component is used to create a new invite and onChange is called instead of onAction when action is changed

    isProgressing: PropTypes.bool,

    onChange: PropTypes.func,
    onAction: PropTypes.func,
    onDelete: PropTypes.func,
    onClose: PropTypes.func
  };

  static defaultProps = {
    organization: {},
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
    const {
      isProgressing,
      isNewInviteAction,
      inviteAction,
      disabled
    } = this.props;

    const { canInvite } = this.state;

    const recipientUserId = getAgentId(inviteAction.recipient);
    const username = recipientUserId
      ? unprefix(recipientUserId)
      : unprefix(getAgent(inviteAction.recipient).email);

    const bem = bemify('organization-invite-editor');

    return (
      <Card className={bem``}>
        {isNewInviteAction ? (
          <div>
            <header className={bem`__header`}>
              <div className={bem`__user-info`}>
                <Iconoclass
                  size="3.2rem"
                  iconName="personAdd"
                  round={true}
                  className={bem`__user-info-icon`}
                  style={{ marginRight: '1.6rem' }}
                />
                <span>Add Administrator</span>
              </div>
              <Iconoclass
                iconName="delete"
                behavior="button"
                tagName="button"
                onClick={this.handleDelete}
                className={bem`__delete-button`}
              />
            </header>
            <div className={bem`__user-autocomplete-container`}>
              {/* TODO use `organization` for blacklist */}
              <UserAutocomplete
                ref={el => (this.autocomplete = el)}
                name="user"
                label="recipient"
                placeholder="Search or enter email"
                onChange={this.handleUserAutocomplete}
                onSubmit={this.handleUserAutocomplete}
              />
            </div>
          </div>
        ) : (
          <header className={bem`__header`}>
            <div className={bem`__user-info`}>
              <UserBadge
                userId={recipientUserId}
                progressMode={isProgressing ? 'bounce' : 'none'}
                queued={true}
              />
              <AutoAbridge ellipsis={true}>{username}</AutoAbridge>

              {inviteAction.actionStatus !== 'CompletedActionStatus' && (
                <Iconoclass
                  iconName="delete"
                  behavior="button"
                  tagName="button"
                  disabled={isProgressing || disabled}
                  onClick={this.handleDelete}
                />
              )}
            </div>
          </header>
        )}

        {!isNewInviteAction && (
          <div className={bem`__invite-sent`}>
            <span>
              Invite sent <DateFromNow>{inviteAction.startTime}</DateFromNow>
            </span>
          </div>
        )}

        {isNewInviteAction && (
          <div className={bem`__body`}>
            <ControlPanel>
              <PaperButton
                onClick={this.handleSendInvite}
                disabled={!canInvite}
              >
                Invite
              </PaperButton>
            </ControlPanel>
          </div>
        )}
      </Card>
    );
  }
}
