import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import Iconoclass from '@scipe/iconoclass';
import BemTags from '../../utils/bem-tags';
import * as reactChildrenUtils from '../../utils/react-children-utils';
import { withAppLayout } from './app-layout';
import classNames from 'classnames';

class _AppLayoutWidgetPanel extends Component {
  static propTypes = {
    expanded: PropTypes.bool,
    children: PropTypes.node,
    registerWidgetPanel: PropTypes.func /* from contextProvider */
  };

  static defaultProps = {
    expanded: true
  };

  componentDidMount() {
    this.props.registerWidgetPanel();
  }

  render() {
    const bem = BemTags();
    const { children } = this.props;
    return (
      <div className={bem`app-layout-widget-panel`}>
        <div className={bem`__icon-pane`}>
          {reactChildrenUtils.getAllOfType(
            children,
            AppLayoutWidgetPanelWidgetIcon
          )}
        </div>
        <div className={bem`__widget-pane`}>
          {reactChildrenUtils.getAllOfType(
            children,
            AppLayoutWidgetPanelWidget
          )}
        </div>
      </div>
    );
  }
}

export default withAppLayout(_AppLayoutWidgetPanel);

export class AppLayoutWidgetPanelWidgetIcon extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    onClick: PropTypes.func,
    isActive: PropTypes.bool
  };
  static defaultProps = {
    onClick: noop
  };

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    this.props.onClick(e);
  }

  render() {
    const { children } = this.props;
    return (
      <div
        className={classNames(
          'app-layout-widget-panel__widget-icon-container',
          {
            'app-layout-widget-panel__widget-icon-container--active': this.props
              .isActive
          }
        )}
      >
        <div
          className={classNames('app-layout-widget-panel__widget-icon', {
            'app-layout-widget-panel__widget-icon--active': this.props.isActive
          })}
          onClick={this.handleClick}
          onKeyDown={e => {
            if (e.keyCode === 32 || e.key === 'Enter') {
              this.handleClick(e);
              e.preventDefault(); // Let's stop this event.
              e.stopPropagation(); // Really this time.
            }
          }}
          tabIndex={0}
          role="tab"
        >
          {children}
        </div>
      </div>
    );
  }
}

export class AppLayoutWidgetPanelWidget extends PureComponent {
  static propTypes = {
    children: PropTypes.node,
    title: PropTypes.string,
    onClickClose: PropTypes.func
  };

  static defaultProps = {
    onClickClose: noop
  };

  constructor(props) {
    super(props);
    this.handleClickClose = this.handleClickClose.bind(this);
  }

  handleClickClose(e) {
    this.props.onClickClose(e);
  }

  render() {
    const bem = BemTags('app-layout-widget-panel');
    const { children, title } = this.props;
    return (
      <div className={bem`__widget`}>
        <div className={bem`__widget-header`}>
          <h4 className={bem`__widget-title`}>{title}</h4>
          <Iconoclass
            iconName="delete"
            behavior="button"
            tagName="button"
            onClick={this.handleClickClose}
          />
        </div>
        {children}
      </div>
    );
  }
}
