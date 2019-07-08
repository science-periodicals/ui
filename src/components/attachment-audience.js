import React from 'react';
import PropTypes from 'prop-types';
import pick from 'lodash/pick';
import capitalize from 'lodash/capitalize';
import noop from 'lodash/noop';
import pluralize from 'pluralize';
import { getAgent } from '@scipe/librarian';
import { arrayify } from '@scipe/jsonld';
import Menu from './menu/menu';
import MenuItem from './menu/menu-item';
import UserBadgeMenu from './user-badge-menu';

export default class AttachmentAudience extends React.Component {
  handleDelete(audienceType) {
    let { attachment, potentialAttachment } = this.props;
    if (typeof attachment === 'string') {
      attachment = { '@id': attachment };
    }
    attachment =
      attachment || pick(potentialAttachment, ['@id', '@type', 'participant']);

    const nextAttachment = Object.assign({}, attachment, {
      participant: arrayify(attachment.participant).filter(participant => {
        const agent = getAgent(participant);
        return !agent || agent.audienceType !== audienceType;
      })
    });
    if (!nextAttachment.participant.length) {
      delete nextAttachment.participant;
    }

    this.props.onAction(nextAttachment);
  }

  handleAdd(audienceType) {
    let { attachment, potentialAttachment } = this.props;
    if (typeof attachment === 'string') {
      attachment = { '@id': attachment };
    }
    attachment =
      attachment || pick(potentialAttachment, ['@id', '@type', 'participant']);
    const nextAttachment = Object.assign({}, attachment, {
      participant: arrayify(attachment.participant).concat({
        '@type': 'Audience',
        audienceType
      })
    });

    this.props.onAction(nextAttachment);
  }

  render() {
    const {
      iconSize,
      readOnly,
      disabled,
      workflowMap,
      potentialAttachment,
      attachment = {}
    } = this.props;
    const now = new Date().toISOString();

    const originalAudienceTypes = new Set(
      arrayify(potentialAttachment.participant)
        .map(participant => {
          if (!participant.endDate || participant.endDate > now) {
            const agent = getAgent(participant);
            return agent && agent.audienceType;
          }
        })
        .filter(Boolean)
    );

    const audienceTypes = new Set(
      arrayify(attachment.participant)
        .map(participant => {
          if (!participant.endDate || participant.endDate > now) {
            const agent = getAgent(participant);
            return agent && agent.audienceType;
          }
        })
        .filter(Boolean)
    );

    const potentialAudienceTypes = Array.from(
      new Set(
        Object.values(workflowMap)
          .map(action => action.agent && action.agent.roleName)
          .filter(
            audienceType =>
              audienceType &&
              !originalAudienceTypes.has(audienceType) &&
              !audienceTypes.has(audienceType)
          )
      )
    );

    const undeletableAudienceTypes = Array.from(originalAudienceTypes);
    const deletableAudienceTypes = Array.from(audienceTypes).filter(
      audienceType => !originalAudienceTypes.has(audienceType)
    );

    return (
      <div className="attachment-audience">
        {undeletableAudienceTypes.map(audienceType => (
          <UserBadgeMenu
            size={iconSize}
            key={audienceType}
            roleName={pluralize(audienceType)}
            name={capitalize(pluralize(audienceType))}
            iconName={`role${capitalize(audienceType)}Group`}
          />
        ))}
        {deletableAudienceTypes.map(audienceType => (
          <UserBadgeMenu
            size={iconSize}
            key={audienceType}
            roleName={pluralize(audienceType)}
            name={capitalize(pluralize(audienceType))}
            iconName={`role${capitalize(audienceType)}Group`}
          >
            {!readOnly && (
              <MenuItem
                disabled={disabled}
                icon={{ iconName: 'trash', color: 'black' }}
                onClick={this.handleDelete.bind(this, audienceType)}
              >
                Remove
              </MenuItem>
            )}
          </UserBadgeMenu>
        ))}
        {!!potentialAudienceTypes.length && !readOnly && !disabled && (
          <Menu
            icon="add"
            portal={true}
            className="attachment-audience__add-button"
          >
            {potentialAudienceTypes.map(audienceType => (
              <MenuItem
                key={audienceType}
                onClick={this.handleAdd.bind(this, audienceType)}
              >
                {pluralize(audienceType)}
              </MenuItem>
            ))}
          </Menu>
        )}
      </div>
    );
  }
}

AttachmentAudience.defaultProps = {
  iconSize: 24,
  potentialAttachment: {},
  workflowMap: {},
  onAction: noop
};

AttachmentAudience.propTypes = {
  iconSize: PropTypes.number,
  readOnly: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  potentialAttachment: PropTypes.object,
  attachment: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  workflowMap: PropTypes.object,
  onAction: PropTypes.func
};
