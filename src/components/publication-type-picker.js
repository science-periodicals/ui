import React, { Component } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { getId } from '@scipe/jsonld';
import ExpansionPanel from './expansion-panel';
import ExpansionPanelPreview from './expansion-panel-preview';
import ExpansionPanelGroup from './expansion-panel-group';
import PaperRadioButton from './paper-radio-button';
import { Span, Div } from './elements';
import PaperButtonLink from './paper-button-link';
import ControlPanel from './control-panel';

export default class PublicationTypePicker extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    periodical: PropTypes.object,
    value: PropTypes.string, // the selected publicationType @id
    publicationTypes: PropTypes.arrayOf(PropTypes.object),
    onChange: PropTypes.func
  };

  static defaultProps = {
    workflows: [],
    onChange: noop
  };

  handleChange = value => {
    if (value !== this.props.value) {
      this.props.onChange(value);
    }
  };

  render() {
    const { periodical, publicationTypes, disabled, value } = this.props;

    return (
      <div className="publication-type-picker">
        <ExpansionPanelGroup>
          {publicationTypes.map(publicationType => {
            return (
              <ExpansionPanel key={getId(publicationType)}>
                <ExpansionPanelPreview className="publication-type-picker_-preview">
                  <PaperRadioButton
                    id={`radio-${getId(publicationType)}`}
                    value={getId(publicationType)}
                    disabled={disabled}
                    checked={getId(publicationType) === value}
                    onChange={this.handleChange}
                  />

                  <Span className="publication-type-picker__preview__name">
                    {publicationType.name ||
                      `Untitled publication type (${getId(publicationType)})`}
                  </Span>
                </ExpansionPanelPreview>

                <div className="publication-type-picker__body">
                  <Div>
                    {publicationType.description || 'No description available'}
                  </Div>

                  {!!getId(publicationType.guidelines) && (
                    <ControlPanel>
                      <PaperButtonLink
                        reset={true}
                        target="_blank"
                        page="authorGuidelines"
                        periodical={periodical}
                        authorGuidelines={publicationType.guidelines}
                      >
                        View guidelines
                      </PaperButtonLink>
                    </ControlPanel>
                  )}
                </div>
              </ExpansionPanel>
            );
          })}
        </ExpansionPanelGroup>
      </div>
    );
  }
}
