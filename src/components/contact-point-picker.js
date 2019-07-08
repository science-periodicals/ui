import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { getAgent } from '@scipe/librarian';
import { getId, arrayify } from '@scipe/jsonld';
import ExpansionPanel from './expansion-panel';
import ExpansionPanelPreview from './expansion-panel-preview';
import ExpansionPanelGroup from './expansion-panel-group';
import PaperRadioButton from './paper-radio-button';
import Value from './value';
import getAgentName from '../utils/get-agent-name';
import SubjectEditor from './subject-editor';

export default class ContactPointPicker extends React.Component {
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
    const { roles, value, disabled } = this.props;

    return (
      <ExpansionPanelGroup>
        {roles.map(role => {
          const agent = getAgent(role);
          const semanticTagsMap = arrayify(role.about)
            .filter(tag => {
              const tagId = getId(tag);
              return tagId && tagId.startsWith('subjects:');
            })
            .reduce((semanticTagsMap, semanticTag) => {
              semanticTagsMap[getId(semanticTag)] = semanticTag;
              return semanticTagsMap;
            }, {});

          return (
            <ExpansionPanel key={getId(role)}>
              <ExpansionPanelPreview className="contact-point-picker__preview">
                <PaperRadioButton
                  id={`radio-${getId(role)}`}
                  value={getId(role)}
                  disabled={disabled}
                  checked={getId(role) === value}
                  onChange={this.handleChange}
                />

                <Value
                  tagName="span"
                  className="contact-point-picker__preview__name"
                >
                  {getAgentName(agent)}
                </Value>
              </ExpansionPanelPreview>

              <div className="contact-point-picker__body">
                {!!Object.keys(semanticTagsMap).length && (
                  <div>
                    <h4 className="contact-point-picker__body__sub-title">
                      Area of responsibility:
                    </h4>
                    <div className="contact-point-picker__body__tags">
                      <SubjectEditor
                        entity={role}
                        semanticTagsMap={semanticTagsMap}
                        disabled={true}
                        readOnly={true}
                      />
                    </div>
                  </div>
                )}

                <Value tagName="div">
                  {role.description ||
                    (agent && agent.description) ||
                    'No description available'}
                </Value>
              </div>
            </ExpansionPanel>
          );
        })}
      </ExpansionPanelGroup>
    );
  }
}

ContactPointPicker.defaultProps = {
  roles: [],
  onChange: noop
};

ContactPointPicker.propTypes = {
  disabled: PropTypes.bool,
  roles: PropTypes.array,
  value: PropTypes.string,
  onChange: PropTypes.func
};
