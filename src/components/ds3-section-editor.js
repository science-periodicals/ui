import React from 'react';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import noop from 'lodash/noop';
import omit from 'lodash/omit';
import { createId } from '@scipe/librarian';
import { getId } from '@scipe/jsonld';
import Iconoclass from '@scipe/iconoclass';
import Ds3CustomSection from './ds3-custom-section';
import Divider from './divider';
import PaperActionButton from './paper-action-button';

export default class Ds3SectionEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sections: cloneDeep(props.sections)
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleOrder = this.handleOrder.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.sections, this.state.sections)) {
      this.setState({
        sections: cloneDeep(nextProps.sections)
      });
    }
  }

  handleChange(nextSection) {
    function update(sections, nextSection) {
      return sections.map(section => {
        if (getId(section) === getId(nextSection)) {
          return nextSection;
        } else if (section.hasPart) {
          return Object.assign({}, section, {
            hasPart: update(section.hasPart, nextSection)
          });
        } else {
          return section;
        }
      });
    }

    const nextSections = update(this.state.sections, nextSection);
    this.setState({ sections: nextSections });
    this.props.onChange(nextSections);
  }

  handleAdd(insertSection) {
    let nextSections;
    const newSection = {
      '@id': createId('blank')['@id']
    };

    if (!insertSection) {
      nextSections = this.state.sections.concat(newSection);
    } else {
      const update = (sections, nextSection) => {
        return sections.map(section => {
          if (getId(section) === getId(insertSection)) {
            return Object.assign({}, section, {
              hasPart: (section.hasPart || []).concat(newSection)
            });
          } else if (section.hasPart) {
            return Object.assign({}, section, {
              hasPart: update(section.hasPart, insertSection)
            });
          } else {
            return section;
          }
        });
      };
      nextSections = update(this.state.sections, insertSection);
    }
    this.setState({ sections: nextSections });
    this.props.onChange(nextSections);
  }

  handleDelete(sectionId) {
    function update(sections, nextSection) {
      return sections
        .filter(section => getId(section) !== sectionId)
        .map(section => {
          if (section.hasPart) {
            const nextParts = update(section.hasPart, sectionId);
            if (nextParts.length) {
              return Object.assign({}, section, {
                hasPart: nextParts
              });
            } else {
              return omit(section, ['hasPart']);
            }
          } else {
            return section;
          }
        });
    }
    const nextSections = update(this.state.sections, sectionId);
    this.setState({ sections: nextSections });
    this.props.onChange(nextSections);
  }

  handleOrder(sectionId, hoverSectionId) {
    function update(sections, sectionId, hoverSectionId) {
      if (
        sections.some(section => getId(section) === sectionId) &&
        sections.some(section => getId(section) === hoverSectionId)
      ) {
        const nextSections = sections.slice();
        const index = sections.findIndex(
          section => getId(section) === sectionId
        );
        const hoverIndex = sections.findIndex(
          section => getId(section) === hoverSectionId
        );
        const section = nextSections[index];
        const hoverSection = nextSections[hoverIndex];
        nextSections[index] = hoverSection;
        nextSections[hoverIndex] = section;
        return nextSections;
      } else {
        return sections.map(section => {
          if (section.hasPart) {
            return Object.assign({}, section, {
              hasPart: update(section.hasPart, sectionId, hoverSectionId)
            });
          } else {
            return section;
          }
        });
      }
    }

    const nextSections = update(this.state.sections, sectionId, hoverSectionId);
    this.setState({ sections: nextSections });
    this.props.onChange(nextSections);
  }

  renderSections(sections = [], level = 0) {
    const { sections: allSections } = this.state;
    const { readOnly, disabled } = this.props;

    return (
      <div className="ds3-section-editor__sections">
        <ol className="ds3-section-editor__sections-list">
          {sections.map(section => (
            <li key={getId(section)}>
              <div
                className="ds3-section-editor__sections-list-item"
                data-level={level}
              >
                <Ds3CustomSection
                  sections={allSections}
                  section={section}
                  level={level}
                  readOnly={readOnly}
                  disabled={disabled}
                  onChange={this.handleChange}
                  onDelete={this.handleDelete}
                  onOrder={this.handleOrder}
                >
                  <div>
                    {level === 0 && section.hasPart && <Divider />}
                    {section.hasPart &&
                      this.renderSections(section.hasPart, level + 1)}
                    {level === 0 &&
                      !readOnly && (
                        <div className="ds3-section-editor__add">
                          <Iconoclass
                            iconName="add"
                            disabled={disabled}
                            onClick={this.handleAdd.bind(this, section)}
                            behavior="button"
                          />
                        </div>
                      )}
                  </div>
                </Ds3CustomSection>
              </div>
              {level === 0 ? <Divider /> : null}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  render() {
    const { sections } = this.state;
    const { readOnly, disabled } = this.props;
    return (
      <div className="ds3-section-editor">
        {this.renderSections(sections)}
        {!readOnly && (
          <div className="ds3-section-editor__add">
            <PaperActionButton
              iconName="add"
              large={true}
              disabled={disabled}
              readOnly={readOnly}
              onClick={this.handleAdd.bind(this, null)}
            />
          </div>
        )}
      </div>
    );
  }
}

Ds3SectionEditor.defaultProps = {
  onChange: noop
};

Ds3SectionEditor.propTypes = {
  sections: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  disabled: PropTypes.bool
};
