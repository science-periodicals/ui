import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { getId, arrayify } from '@scipe/jsonld';
import Iconoclass from '@scipe/iconoclass';
import PaperSelect from '../paper-select';
import RoleTitleAutocomplete from '../autocomplete/role-title-autocomplete';
import {
  StyleFormGroup,
  StyleJustifiedRow,
  StyleJustifiedRowGroup
} from './create-graph-action-editor-modal';
import {
  addEndorseAction,
  syncAuthorizeActions
} from '../../utils/create-graph-action-utils';

/**
 *
 * Note: we add potential authorize action triggered
 * `OnObjectStagedActionStatus` to ensure that the endorser role will have access
 * to the endorsed action
 *
 */
export default class CreateGraphActionEditorEndorserEditor extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    periodical: PropTypes.object,
    onChange: PropTypes.func,
    action: PropTypes.object,
    stageId: PropTypes.string.isRequired,
    nodeMap: PropTypes.object
  };

  static defaultProps = {
    nodeMap: {},
    action: {},
    periodical: {},
    onChange: noop
  };

  handleChangeRoleName(prevAudienceType, e) {
    const { action, nodeMap, onChange } = this.props;
    const audienceType = e.target.value;
    if (audienceType !== 'tmp:null') {
      const nextNodeMap = addEndorseAction(action, audienceType, nodeMap);

      onChange(syncAuthorizeActions(nextNodeMap));
    } else {
      // Remove EndorseAction
      const nextAction = Object.assign({}, action, {
        potentialAction: arrayify(action.potentialAction).filter(actionId => {
          const action = nodeMap[actionId];
          return !action || action['@type'] !== 'EndorseAction';
        })
      });

      delete nextAction.endorseOn;
      delete nextAction.completeOn;

      if (!nextAction.potentialAction.length) {
        delete nextAction.potentialAction;
      }

      const nextNodeMap = Object.assign({}, nodeMap, {
        [getId(nextAction)]: nextAction
      });

      onChange(syncAuthorizeActions(nextNodeMap));
    }
  }

  handleDelete = () => {
    const { action, nodeMap, onChange } = this.props;

    const nextAction = Object.assign({}, action, {
      potentialAction: arrayify(action.potentialAction).filter(actionId => {
        const action = nodeMap[actionId];
        return !action || action['@type'] !== 'EndorseAction';
      })
    });

    delete nextAction.endorseOn;
    delete nextAction.completeOn;

    if (!nextAction.potentialAction.length) {
      delete nextAction.potentialAction;
    }

    const nextNodeMap = Object.assign({}, nodeMap, {
      [getId(nextAction)]: nextAction
    });

    onChange(syncAuthorizeActions(nextNodeMap));
  };

  handleChangeSubRoleName = (value, item) => {
    value = value && value.trim();
    if (value) {
      const { action, nodeMap, onChange } = this.props;

      const endorseActionId = arrayify(action.potentialAction).find(
        actionId => {
          const action = nodeMap[actionId];
          return action && action['@type'] === 'EndorseAction';
        }
      );
      const endorseAction = nodeMap[getId(endorseActionId)];

      if (endorseAction) {
        const agent = nodeMap[getId(endorseAction.agent)];
        if (getId(agent) && agent.roleName) {
          const nextNodeMap = Object.assign({}, nodeMap, {
            [getId(agent)]: Object.assign({}, agent, {
              name: value
            })
          });

          onChange(syncAuthorizeActions(nextNodeMap));
        }
      }
    }
  };

  render() {
    const { periodical, action, nodeMap, disabled } = this.props;

    let roleName, title;
    const endorseActionId = arrayify(action.potentialAction).find(actionId => {
      const action = nodeMap[actionId];
      return action && action['@type'] === 'EndorseAction';
    });
    const endorseAction = nodeMap[getId(endorseActionId)];

    if (endorseAction) {
      const agent = nodeMap[getId(endorseAction.agent)];
      if (agent) {
        roleName = agent.roleName;
        title = agent.roleName && agent.name;
      }
    }

    return (
      <StyleFormGroup>
        <fieldset>
          <StyleJustifiedRow>
            <StyleJustifiedRowGroup>
              <PaperSelect
                name="roleName"
                label="role"
                disabled={disabled}
                value={roleName || 'tmp:null'}
                onChange={this.handleChangeRoleName.bind(
                  this,
                  roleName || 'tmp:null'
                )}
              >
                <option value="tmp:null">Not required</option>
                <option value="editor">editor</option>
                <option value="producer">producer</option>
                <option value="author">author</option>
                <option value="reviewer">reviewer</option>
              </PaperSelect>

              {!!roleName &&
                roleName !== 'author' &&
                roleName !== 'reviewer' && (
                  <RoleTitleAutocomplete
                    value={title || ''}
                    disabled={disabled}
                    periodical={periodical}
                    scope={roleName}
                    onSubmit={this.handleChangeSubRoleName}
                  />
                )}
            </StyleJustifiedRowGroup>
            {!!roleName && (
              <Iconoclass
                iconName="delete"
                size="18px"
                behavior="button"
                disabled={disabled}
                onClick={this.handleDelete}
              />
            )}
          </StyleJustifiedRow>
        </fieldset>
      </StyleFormGroup>
    );
  }
}
