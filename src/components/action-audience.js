import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import capitalize from 'lodash/capitalize';
import pluralize from 'pluralize';
import groupBy from 'lodash/groupBy';
import noop from 'lodash/noop';
import {
  getAgentId,
  isActionAssigned,
  filterActiveRoles
} from '@scipe/librarian';
import { unrole, arrayify, getId } from '@scipe/jsonld';
import UserBadgeMenu from './user-badge-menu';
import Menu from './menu/menu';
import MenuItem from './menu/menu-item';
import { getDisplayName, getUserBadgeLabel } from '../utils/graph';

export default class ActionAudience extends React.Component {
  static propTypes = {
    'data-testid': PropTypes.string,
    action: PropTypes.object,
    audienceProp: PropTypes.oneOf(['participant', 'recipient']).isRequired,
    user: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        '@id': PropTypes.string.isRequired
      })
    ]).isRequired,
    blindingData: PropTypes.object.isRequired,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    authorizeActions: PropTypes.arrayOf(PropTypes.object), // to display future audiences (as queued) only used in readOnly mode
    // For non readOnly mode: source of audiences that the user can add to the `action`
    // Note: for now the editable mode is only used for Comments
    potentialAudiences: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.shape({
          audienceType: PropTypes.string.isRequired
        }),
        // In case of action where agent is the sole audience the potential audience need to include a role
        PropTypes.shape({
          '@id': PropTypes.string.isRequired,
          roleName: PropTypes.string.isRequired,
          participant: PropTypes.string.isRequired
        })
      ])
    ), // Note: this can include a role (e.g review action where agent is sole audience => can only respond to a role, not an audience)
    potentialAuthorizeActions: PropTypes.arrayOf(PropTypes.object),
    onAction: PropTypes.func,
    onAuthorizeActions: PropTypes.func
  };

  static defaultProps = {
    action: {},
    onAction: noop,
    onAuthorizeActions: noop,
    authorizeActions: []
  };

  handleAddAudience(audience, e) {
    const { action, audienceProp, onAction } = this.props;
    e.preventDefault();

    onAction(
      Object.assign({}, action, {
        [audienceProp]: arrayify(action[audienceProp]).concat(audience)
      }),
      audience
    );
  }

  handleDeleteAudience(audience, e) {
    const { action, audienceProp, onAction } = this.props;
    const unroledAudience = unrole(audience, audienceProp);
    const nextAction = Object.assign({}, action, {
      [audienceProp]: arrayify(action[audienceProp]).filter(role => {
        const unroled = unrole(role, audienceProp);
        return (
          // `audience` is a role
          (getId(audience) &&
            (!unroledAudience || !unroledAudience.audienceType) &&
            getId(audience) !== getId(role)) ||
          // `audience` is an audience
          (unroledAudience &&
            unroledAudience.audienceType &&
            (!unroled ||
              !unroled.audienceType ||
              unroled.audienceType !== unroledAudience.audienceType))
        );
      })
    });

    if (!nextAction[audienceProp].length) {
      delete nextAction[audienceProp];
    }
    onAction(nextAction, audience);
  }

  handleAddAuthorizeAction(audienceType, trigger, e) {
    const { authorizeActions, onAuthorizeActions } = this.props;
    e.preventDefault();

    if (
      arrayify(authorizeActions).find(action => action.completeOn === trigger)
    ) {
      onAuthorizeActions(
        arrayify(authorizeActions).map(action => {
          if (action.completeOn === trigger) {
            return Object.assign({}, action, {
              recipient: arrayify(action.recipient).concat({
                '@type': 'Audience',
                audienceType
              })
            });
          }

          return action;
        })
      );
    } else {
      onAuthorizeActions(
        arrayify(authorizeActions).concat({
          '@type': 'AuthorizeAction',
          actionStatus: 'PotentialActionStatus',
          completeOn: trigger,
          recipient: {
            '@type': 'Audience',
            audienceType
          }
        })
      );
    }
  }

  handleDeleteAuthorizeAction(audienceType, trigger, e) {
    const { authorizeActions, onAuthorizeActions } = this.props;
    e.preventDefault();

    onAuthorizeActions(
      arrayify(authorizeActions)
        .map(action => {
          if (action.completeOn === trigger) {
            return Object.assign({}, action, {
              recipient: arrayify(action.recipient).filter(
                recipient => recipient.audienceType !== audienceType
              )
            });
          }

          return action;
        })
        .filter(action => arrayify(action.recipient).length)
    );
  }

  renderAudience(audienceType, roles) {
    const { blindingData, readOnly, disabled, audienceProp } = this.props;

    let displayName, anonymous, userBadgeLabel, userId;
    // if only 1 role and it's not an audience we may be able to display the userbadge
    if (
      roles.length === 1 &&
      !roles[0].audienceType &&
      roles[0].roleName !== 'audience'
    ) {
      userId = getAgentId(roles[0]);
      userBadgeLabel = getUserBadgeLabel(blindingData, roles[0]);
      displayName = getDisplayName(blindingData, roles[0], {
        addRoleNameSuffix: true
      });
      anonymous = blindingData.isBlinded(roles[0]);
    }

    let iconName;
    if (!userBadgeLabel) {
      switch (audienceType) {
        case 'editor':
          iconName = 'roleEditorGroup';
          break;

        case 'author':
          iconName = 'roleAuthorGroup';
          break;

        case 'reviewer':
          iconName = 'roleReviewerGroup';
          break;

        case 'producer':
          iconName = 'roleProducerGroup';
          break;

        case 'public':
          iconName = 'rolePublicGroup';
          break;
      }
    }

    return (
      <UserBadgeMenu
        size={24}
        displayName={false}
        displayRoleName={false}
        name={displayName}
        userBadgeLabel={userBadgeLabel}
        anonymous={anonymous}
        userId={userId}
        roleName={
          audienceType === 'public' ? audienceType : pluralize(audienceType)
        }
        iconName={iconName}
        statusIconName={roles.length > 1 ? roles.length.toString() : undefined}
      >
        {roles.map(role => {
          // `role` is either a role from a Graph, an audienceRole or an audience

          let displayName;
          const unroled = unrole(role, audienceProp);

          if (
            role.roleName &&
            (role.roleName === 'editor' ||
              role.roleName === 'reviewer' ||
              role.roleName === 'producer' ||
              role.roleName === 'author')
          ) {
            displayName = getDisplayName(blindingData, role, {
              addRoleNameSuffix: true
            });
          } else if (unroled.audienceType) {
            if (unroled.name) {
              displayName = pluralize(unroled.name);
            } else {
              displayName =
                unroled.audienceType === 'public'
                  ? unroled.audienceType
                  : pluralize(unroled.audienceType);
            }
          } else {
            displayName = audienceType;
          }

          return (
            <MenuItem
              key={
                getId(role) ||
                role.roleName ||
                role.audienceType ||
                unroled.audienceType ||
                getId(unroled)
              }
              disabled={disabled}
              onClick={
                readOnly
                  ? undefined
                  : this.handleDeleteAudience.bind(this, role)
              }
              icon={
                readOnly ? undefined : { iconName: 'trash', color: 'black' }
              }
            >
              {capitalize(displayName || '')}
            </MenuItem>
          );
        })}
      </UserBadgeMenu>
    );
  }

  renderQueuedAudiences() {
    const { action, audienceProp, authorizeActions, readOnly } = this.props;

    const activeAudienceTypes = new Set(
      arrayify(action[audienceProp])
        .map(audience => unrole(audience, audienceProp))
        .filter(audience => audience.audienceType)
        .map(audience => audience.audienceType)
    );

    const iconMap = {
      editor: 'roleEditorGroup',
      author: 'roleAuthorGroup',
      producer: 'roleProducerGroup',
      reviewer: 'roleReviewerGroup',
      public: 'rolePublicGroup'
    };

    const data = [];
    ['author', 'editor', 'reviewer', 'producer', 'public'].forEach(
      audienceType => {
        // we need to find the first trigger
        // order is:
        // 1. on action staged (`OnObjectStagedActionStatus`, `OnObjectObjectStagedActionStatus`)
        // 2. on action completed (`OnObjectCompletedActionStatus`, `OnObjectObjectCompletedActionStatus`)
        // 3. on stage completed (`OnWorkflowStageEnd`, `OnObjectObjectWorkflowStageEnd`)
        if (
          authorizeActions.some(action => {
            return (
              arrayify(action.recipient).some(recipient => {
                const audience = unrole(recipient, 'recipient');
                return (
                  audience &&
                  audience.audienceType === audienceType &&
                  !activeAudienceTypes.has(audience.audienceType)
                );
              }) &&
              action.actionStatus === 'PotentialActionStatus' &&
              (action.completeOn === 'OnObjectStagedActionStatus' ||
                action.completeOn === 'OnObjectObjectStagedActionStatus')
            );
          })
        ) {
          data.push({
            audienceType,
            key: `${audienceType}-on-action-staged`,
            iconName: iconMap[audienceType],
            description: 'on action staged',
            trigger: 'OnObjectObjectStagedActionStatus'
          });
        } else if (
          authorizeActions.some(action => {
            return (
              arrayify(action.recipient).some(recipient => {
                const audience = unrole(recipient, 'recipient');
                return (
                  audience &&
                  audience.audienceType === audienceType &&
                  !activeAudienceTypes.has(audience.audienceType)
                );
              }) &&
              action.actionStatus === 'PotentialActionStatus' &&
              (action.completeOn === 'OnObjectCompletedActionStatus' ||
                action.completeOn === 'OnObjectObjectCompletedActionStatus')
            );
          })
        ) {
          data.push({
            audienceType,
            key: `${audienceType}-on-action-completed`,
            iconName: iconMap[audienceType],
            description: 'on action completed',
            trigger: 'OnObjectObjectCompletedActionStatus'
          });
        } else if (
          authorizeActions.some(action => {
            return (
              arrayify(action.recipient).some(recipient => {
                const audience = unrole(recipient, 'recipient');
                return (
                  audience &&
                  audience.audienceType === audienceType &&
                  !activeAudienceTypes.has(audience.audienceType)
                );
              }) &&
              action.actionStatus === 'PotentialActionStatus' &&
              (action.completeOn === 'OnWorkflowStageEnd' ||
                action.completeOn === 'OnObjectObjectWorkflowStageEnd')
            );
          })
        ) {
          data.push({
            audienceType,
            key: `${audienceType}-on-stage-completed`,
            iconName: iconMap[audienceType],
            description: 'on stage completed',
            trigger: 'OnObjectObjectWorkflowStageEnd'
          });
        }
      }
    );

    if (!data.length) {
      return null;
    }

    return (
      <Fragment>
        {data.map(({ audienceType, key, description, iconName, trigger }) => (
          <li key={key}>
            <UserBadgeMenu
              size={24}
              displayName={false}
              displayRoleName={false}
              queued={true}
              roleName={
                audienceType === 'public'
                  ? audienceType
                  : pluralize(audienceType)
              }
              iconName={iconName}
            >
              <MenuItem
                onClick={this.handleDeleteAuthorizeAction.bind(
                  this,
                  audienceType,
                  trigger
                )}
                icon={
                  readOnly ? undefined : { iconName: 'trash', color: 'black' }
                }
              >
                {`${capitalize(
                  audienceType === 'public'
                    ? audienceType
                    : pluralize(audienceType)
                )} (${description})`}
              </MenuItem>
            </UserBadgeMenu>
          </li>
        ))}
      </Fragment>
    );
  }

  renderPotentialAudiencePicker() {
    const {
      blindingData,
      action,
      authorizeActions,
      potentialAudiences,
      potentialAuthorizeActions
    } = this.props;

    const currentAudience = filterActiveRoles(action.participant).concat(
      arrayify(action.participant).filter(
        participant => participant.audienceType
      )
    );
    const activeAudienceOptions = arrayify(potentialAudiences).filter(
      audience => {
        if (audience.audienceType) {
          return !currentAudience.some(role => {
            const unroled = unrole(role, 'participant');
            return unroled && unroled.audienceType === audience.audienceType;
          });
        } else {
          return !currentAudience.some(role => getId(role) === getId(audience));
        }
      }
    );

    const authorizeActionOptions = [];
    arrayify(potentialAuthorizeActions).forEach(action => {
      arrayify(action.recipient).forEach(recipient => {
        if (
          !arrayify(authorizeActions).some(
            _action =>
              _action.completeOn === action.completeOn &&
              arrayify(_action.recipient).some(
                _recipient => _recipient.audienceType === recipient.audienceType
              )
          )
        ) {
          authorizeActionOptions.push(Object.assign({}, action, { recipient }));
        }
      });
    });

    const labels = {
      OnObjectObjectStagedActionStatus: 'on action staged',
      OnObjectObjectCompletedActionStatus: 'on action completed',
      OnObjectObjectWorkflowStageEnd: 'on stage completed'
    };

    if (!activeAudienceOptions.length && !authorizeActionOptions.length) {
      return null;
    }

    return (
      <Menu
        className="action-audience__add"
        align="right"
        icon="add"
        portal={true}
      >
        {activeAudienceOptions.map(audience => (
          <MenuItem
            key={getId(audience) || audience.audienceType}
            onClick={this.handleAddAudience.bind(this, audience)}
          >
            {audience.audienceType
              ? capitalize(pluralize(audience.audienceType))
              : getDisplayName(blindingData, audience, {
                  addRoleNameSuffix: true
                })}
          </MenuItem>
        ))}
        {authorizeActionOptions.map(action => (
          <MenuItem
            key={`${action.completeOn}-${action.recipient.audienceType}`}
            onClick={this.handleAddAuthorizeAction.bind(
              this,
              action.recipient.audienceType,
              action.completeOn
            )}
          >
            {`${capitalize(pluralize(action.recipient.audienceType))} (${
              labels[action.completeOn]
            })`}
          </MenuItem>
        ))}
      </Menu>
    );
  }

  render() {
    const { action, audienceProp, disabled, readOnly } = this.props;

    const byAudienceType = groupBy(
      arrayify(action[audienceProp]).filter(role => {
        // if the action is assigned we exclude the agent (when agent is a role)
        if (isActionAssigned(action)) {
          return getAgentId(role) !== getAgentId(action.agent);
        }

        return true;
      }),
      role => {
        const unroled = unrole(role, audienceProp);
        return unroled.audienceType || role.roleName;
      }
    );

    // cleanup audience type values:
    // we remove roles and user if an audience type contains an audience
    // this is to avoid having both authors and "anton (author)" as the audience encompasses all the roles or users
    Object.keys(byAudienceType).forEach(audienceType => {
      const values = byAudienceType[audienceType];
      const audienceRole = values.find(value => {
        const unroled = unrole(value, audienceProp);
        return unroled && unroled.audienceType;
      });
      if (audienceRole) {
        byAudienceType[audienceType] = [audienceRole];
      }
    });

    // ensure order
    const audienceTypes = [
      'editor',
      'author',
      'reviewer',
      'producer',
      'public'
    ].filter(audienceType => audienceType in byAudienceType);

    return (
      <div className="action-audience" data-testid={this.props['data-testid']}>
        <ul className="action-audience__badge-list">
          {audienceTypes.map(audienceType => (
            <li key={audienceType}>
              {this.renderAudience(audienceType, byAudienceType[audienceType])}
            </li>
          ))}
          {this.renderQueuedAudiences()}
        </ul>

        {!readOnly && !disabled && this.renderPotentialAudiencePicker()}
      </div>
    );
  }
}
