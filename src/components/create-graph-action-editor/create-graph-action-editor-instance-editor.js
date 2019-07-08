import React, { Component } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { getId } from '@scipe/jsonld';
import PaperInput from '../paper-input';
import { LayoutWrapRows, LayoutWrapItem } from '../layout-wrap-rows';
import { StyleFormGroup } from './create-graph-action-editor-modal';

const MAX = 10;

export default class CreateGraphActionEditorInstanceEditor extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
    action: PropTypes.object,
    nodeMap: PropTypes.object
  };

  static defaultProps = {
    nodeMap: {},
    action: {},
    onChange: noop
  };

  handleChange = e => {
    const { nodeMap, onChange, action } = this.props;

    const value = Math.min(parseInt(e.target.value, 10), MAX);

    const overwrite = {
      [e.target.name]: value
    };

    // make sure to bump maxInstances if minInstances is set to a greater value
    if (
      e.target.name === 'minInstances' &&
      value > (action.maxInstances || 1)
    ) {
      overwrite.maxInstances = value;
    }

    onChange(
      Object.assign({}, nodeMap, {
        [getId(action)]: Object.assign({}, action, overwrite)
      })
    );
  };

  render() {
    const { disabled, action } = this.props;

    return (
      <StyleFormGroup>
        <fieldset>
          <LayoutWrapRows>
            <LayoutWrapItem>
              <PaperInput
                label={`Minimum number required`}
                name="minInstances"
                type="number"
                min={1}
                max={MAX}
                step={1}
                disabled={disabled}
                value={(action.minInstances || 1).toString()}
                onChange={this.handleChange}
              />
            </LayoutWrapItem>
            <LayoutWrapItem>
              <PaperInput
                label={`Maximum number required`}
                name="maxInstances"
                type="number"
                min={action.minInstances || 1}
                max={MAX}
                step={1}
                disabled={disabled}
                value={(action.maxInstances || 1).toString()}
                onChange={this.handleChange}
              />
            </LayoutWrapItem>
          </LayoutWrapRows>
        </fieldset>
      </StyleFormGroup>
    );
  }
}
