import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import noop from 'lodash/noop';
import BemTags from '../../utils/bem-tags';
import PaperButton from '../paper-button';

export default class Tabs extends Component {
  static propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.node,
    onChange: PropTypes.func,
    defaultActiveTab: PropTypes.number, // if componenent is not controlled
    activeTab: PropTypes.number // if componenent is controlled
  };

  static defaultProps = {
    onChange: noop
  };

  constructor(props) {
    super(props);

    if (props.defaultActiveTab != null || props.activeTab == null) {
      this.state = {
        activeTab: props.defaultActiveTab == null ? 0 : props.defaultActiveTab
      };
    }
  }

  handleClick(tabNum, childProps) {
    if (childProps.disabled !== true) {
      if (this.props.defaultActiveTab != null || this.props.activeTab == null) {
        this.setState({ activeTab: tabNum });
      }
      this.props.onChange(tabNum, childProps.title);
      childProps.onClick(tabNum, childProps);
    }
  }

  getActiveTab() {
    if (this.props.defaultActiveTab != null || this.props.activeTab == null) {
      return this.state.activeTab;
    } else if (this.props.activeTab != null) {
      return this.props.activeTab;
    } else {
      return 0;
    }
  }

  render() {
    const { id, className } = this.props;

    const bem = BemTags();

    const activeTab = this.getActiveTab();

    return (
      <div id={id} className={classNames(bem`tabs`, className)}>
        <div className={bem`__nav`}>
          {React.Children.map(this.props.children, (child, i) => {
            return (
              <div
                className={bem`tab-header
                    --${activeTab === i ? 'active' : 'inactive'}
                    --${child.props.disabled ? 'disabled' : 'enabled'}`}
              >
                <div className={bem`tab-header-contents`}>
                  <PaperButton
                    className={bem`tab-header-title`}
                    onClick={this.handleClick.bind(this, i, child.props)}
                    disabled={child.props.disabled}
                  >
                    {child.props.title}
                  </PaperButton>
                </div>
              </div>
            );
          })}
        </div>
        <div className={bem`__tabs-body`}>
          {React.Children.map(this.props.children, (child, i) => {
            const isActive = activeTab === i;
            if (!isActive) {
              return null;
            }

            return (
              <div
                className={bem`__tab --${isActive ? 'active' : 'inactive'} --${
                  child.props.disabled ? 'disabled' : 'enabled'
                }`}
              >
                <div className={bem`__tab-content-container`}>{child}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
