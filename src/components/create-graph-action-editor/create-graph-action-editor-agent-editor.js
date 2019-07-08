import React from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import { getId } from '@scipe/jsonld';
import Iconoclass from '@scipe/iconoclass';
import RoleTitleAutocomplete from '../autocomplete/role-title-autocomplete';
import {
  StyleFormGroup,
  StyleJustifiedRow,
  StyleJustifiedRowGroup
} from './create-graph-action-editor-modal';

export default class CreateGraphActionEditorAgentEditor extends React.Component {
  static propTypes = {
    disabled: PropTypes.bool,
    periodical: PropTypes.object,
    onChange: PropTypes.func,
    action: PropTypes.object,
    nodeMap: PropTypes.object
  };

  static defaultProps = {
    nodeMap: {},
    action: {},
    periodical: {},
    onChange: noop
  };

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleSubmit(value, item) {
    value = value && value.trim();
    if (value) {
      const { action, nodeMap, onChange } = this.props;
      const agent = nodeMap[getId(action.agent)];
      if (agent && getId(agent) && agent.roleName) {
        onChange(
          Object.assign({}, nodeMap, {
            [getId(agent)]: Object.assign({}, agent, {
              name: value
            })
          })
        );
        this.autocomplete.reset();
      }
    }
  }

  handleDelete() {
    const { action, nodeMap, onChange } = this.props;
    const agent = nodeMap[getId(action.agent)];
    if (agent && getId(agent) && agent.roleName) {
      onChange(
        Object.assign({}, nodeMap, {
          [getId(agent)]: omit(agent, ['name'])
        })
      );
    }
  }

  render() {
    const { periodical, action, nodeMap, disabled } = this.props;

    const agent = nodeMap[getId(action.agent)];
    const title = agent.roleName && agent.name;

    return (
      <StyleFormGroup>
        <fieldset>
          {title ? (
            <StyleJustifiedRow>
              <StyleJustifiedRowGroup>
                <Iconoclass iconName="supervisor" tagName="span" />
                <span>{title}</span>
              </StyleJustifiedRowGroup>

              <Iconoclass
                iconName="delete"
                disabled={disabled}
                behavior="button"
                onClick={this.handleDelete}
                size="18px"
              />
            </StyleJustifiedRow>
          ) : (
            <RoleTitleAutocomplete
              ref={el => {
                this.autocomplete = el;
              }}
              disabled={disabled}
              periodical={periodical}
              scope={agent.roleName}
              onSubmit={this.handleSubmit}
            />
          )}
        </fieldset>
      </StyleFormGroup>
    );
  }
}
