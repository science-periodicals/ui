import React from 'react';
import PropTypes from 'prop-types';
import BemTags from '../utils/bem-tags';
import ExpansionPanel from './expansion-panel';
import ExpansionPanelPreview from './expansion-panel-preview';

export default class DomToc extends React.Component {
  static propTypes = {
    $content: PropTypes.any,
    topLevel: PropTypes.number,
    expansionOnLevels: PropTypes.array,
    defaultExpanded: PropTypes.bool
  };

  static defaultProps = {
    topLevel: 2,
    expansionOnLevels: [],
    defaultExpanded: true
  };

  getNav(bem, $root, level, defaultExpanded = false) {
    if (!$root) return null;
    const $headings = $root.querySelectorAll(`section > h${level}`);
    if (!$headings || $headings.length === 0) return null;

    let list = (
      <ul className={bem`__index @__clear-list-styles `}>
        {Array.prototype.map.call($headings, ($heading, i) => {
          let $children = $heading.parentElement.querySelectorAll(
            `section > h${level + 1}`
          );
          if (
            this.props.expansionOnLevels.includes(level) &&
            $children &&
            $children.length > 0
          ) {
            return (
              <ExpansionPanel
                key={
                  $heading.id ||
                  $heading.parentElement.id ||
                  $heading.textContent
                }
                className={bem`__expansion-panel`}
                defaultExpanded={defaultExpanded}
              >
                <ExpansionPanelPreview className={bem`__expansion-preview`}>
                  <a
                    href={`#${$heading.parentElement.id}`}
                    dangerouslySetInnerHTML={{ __html: $heading.innerHTML }}
                    className={bem`__link`}
                  />
                </ExpansionPanelPreview>
                {this.getNav(bem, $heading.parentElement, level + 1)}
              </ExpansionPanel>
            );
          }
          return (
            <li
              key={
                $heading.id || $heading.parentElement.id || $heading.textContent
              }
              className={bem`__list-item`}
            >
              <a
                href={`#${$heading.parentElement.id}`}
                dangerouslySetInnerHTML={{ __html: $heading.innerHTML }}
                className={bem`__link`}
              />
              {this.getNav(bem, $heading.parentElement, level + 1)}
            </li>
          );
        })}
      </ul>
    );

    return list;
  }

  render() {
    const { $content, topLevel, defaultExpanded } = this.props;

    const bem = BemTags('@sa');

    return (
      <nav className={bem`dom-toc`}>
        {this.getNav(bem, $content, topLevel, defaultExpanded)}
      </nav>
    );
  }
}
