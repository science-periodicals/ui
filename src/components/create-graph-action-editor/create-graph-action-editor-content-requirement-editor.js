import React, { Component } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { getId } from '@scipe/jsonld';
import PaperCheckbox from '../paper-checkbox';
import { StyleFormGroup } from './create-graph-action-editor-modal';

export default class CreateGraphActionEditorContentRequirementEditor extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    stageId: PropTypes.string.isRequired,
    productionStageId: PropTypes.string.isRequired,
    action: PropTypes.object,
    nodeMap: PropTypes.object,
    onChange: PropTypes.func
  };

  static defaultProps = {
    action: {},
    nodeMap: {},
    onChange: noop
  };

  handleChange = e => {
    const { action, nodeMap, onChange } = this.props;

    const nextAction = Object.assign({}, action, {
      [e.target.name]: e.target.checked
        ? 'ProductionReleaseRequirement'
        : 'SubmissionReleaseRequirement'
    });

    onChange(
      Object.assign({}, nodeMap, {
        [getId(nextAction)]: nextAction
      })
    );
  };

  render() {
    const { action, disabled, stageId, productionStageId } = this.props;
    const isProductionStage = stageId === productionStageId;

    return (
      <StyleFormGroup>
        <fieldset>
          <PaperCheckbox
            disabled={disabled || isProductionStage}
            name="releaseRequirement"
            checked={
              action.releaseRequirement === 'ProductionReleaseRequirement'
            }
            onChange={this.handleChange}
          >
            Requires production quality content
          </PaperCheckbox>
        </fieldset>
      </StyleFormGroup>
    );
  }
}
