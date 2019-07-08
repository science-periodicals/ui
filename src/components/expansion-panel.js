import React, { Component } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { Collapse } from 'react-collapse';
import { presets } from 'react-motion';
import Iconoclass from '@scipe/iconoclass';
import BemTags from '../utils/bem-tags';
import classNames from 'classnames';
import ExpansionPanelPreview from './expansion-panel-preview';
import { typesMatch } from '../utils/react-children-utils';

export default class ExpansionPanel extends Component {
  static propTypes = {
    id: PropTypes.string,
    children: PropTypes.any,
    hasNestedCollapse: PropTypes.bool,
    expanded: PropTypes.bool,
    defaultExpanded: PropTypes.bool, // non controled version
    onChange: PropTypes.func,
    maxHeight: PropTypes.number,
    className: PropTypes.string,
    'data-testid': PropTypes.string
  };

  static defaultProps = {
    expanded: true,
    onChange: noop
  };

  constructor(props) {
    super(props);
    this.state = {
      expanded:
        'defaultExpanded' in props ? props.defaultExpanded : props.expanded
    };
    this.toggleExpand = this.toggleExpand.bind(this);
  }

  toggleExpand(e) {
    e.preventDefault();
    const expanded = !this.state.expanded;
    this.setState({ expanded });
    this.props.onChange(expanded);
  }

  componentWillReceiveProps(nextProps) {
    if (
      !('defaultExpanded' in nextProps) &&
      nextProps.expanded !== this.state.expanded
    ) {
      this.setState({ expanded: nextProps.expanded });
    }
  }

  close() {
    this.setState({ expanded: false });
    this.props.onChange(false);
  }

  render() {
    const {
      maxHeight,
      className,
      id,
      children,
      hasNestedCollapse
    } = this.props;
    const { expanded } = this.state;
    const bem = BemTags();
    return (
      <div
        id={id}
        className={classNames(
          className,
          bem`expansion-panel --${expanded ? 'expanded' : 'collapsed'}`
        )}
        data-testid={this.props['data-testid']}
      >
        <div className={bem`preview-row`}>
          <div className={bem`preview-container`}>
            {React.Children.map(children, child => {
              if (child && typesMatch(child, ExpansionPanelPreview)) {
                return child;
              }
            })}
          </div>
          <div className={bem`controls`}>
            <Iconoclass
              className={bem`controls --more`}
              iconName="expandMore"
              elementType="button"
              onClick={this.toggleExpand}
            />
          </div>
        </div>
        {maxHeight == null ? (
          <Collapse
            isOpened={expanded}
            springConfig={presets.stiff}
            hasNestedCollapse={hasNestedCollapse}
          >
            <div className={bem`contents`}>{children}</div>
          </Collapse>
        ) : (
          <div
            className={bem`max-height-contents  ${
              expanded ? '--expanded' : '--collapsed'
            }`}
            style={{ maxHeight: expanded ? maxHeight : 0 }}
          >
            {children}
          </div>
        )}
      </div>
    );
  }
}
