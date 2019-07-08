import React, { Component } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { getId } from '@scipe/jsonld';
import ExpansionPanel from './expansion-panel';
import ExpansionPanelPreview from './expansion-panel-preview';
import ExpansionPanelGroup from './expansion-panel-group';
import PaperRadioButton from './paper-radio-button';
import Value from './value';
import AccessBadge from './access-badge';
import PeerReviewBadge from './peer-review-badge';

export default class WorkflowPicker extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    value: PropTypes.string,
    workflows: PropTypes.arrayOf(PropTypes.object),
    onChange: PropTypes.func
  };

  static defaultProps = {
    workflows: [],
    onChange: noop
  };

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value) {
    if (value !== this.props.value) {
      this.props.onChange(value);
    }
  }

  render() {
    const { workflows, disabled, value } = this.props;

    return (
      <div className="workflow-picker">
        <ExpansionPanelGroup>
          {workflows.map(workflow => {
            return (
              <ExpansionPanel key={getId(workflow)}>
                <ExpansionPanelPreview className="workflow-picker__workflow-preview">
                  <PaperRadioButton
                    id={`radio-${getId(workflow)}`}
                    value={getId(workflow)}
                    disabled={disabled}
                    checked={getId(workflow) === value}
                    onChange={this.handleChange}
                  />

                  <Value
                    tagName="span"
                    className="workflow-picker__workflow-preview__name"
                  >
                    {workflow.name || `Untitled workflow (${getId(workflow)})`}
                  </Value>

                  <div className="workflow-picker__workflow-preview__badges">
                    <AccessBadge
                      className="workflow-picker__workflow-preview__badges__badge"
                      workflowSpecification={workflow}
                    />
                    <PeerReviewBadge
                      className="workflow-picker__workflow-preview__badges__badge"
                      workflowSpecification={workflow}
                    />
                  </div>
                </ExpansionPanelPreview>
                <Value tagName="div" className="workflow-picker__workflow-body">
                  {workflow.description || 'No description available'}
                </Value>
              </ExpansionPanel>
            );
          })}
        </ExpansionPanelGroup>
      </div>
    );
  }
}
