import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactPortal from './react-portal';
import classNames from 'classnames';
import Iconoclass from '@scipe/iconoclass';
import { default as Tooltip, TooltipContent } from './tooltip';

export default class Helptip extends Component {
  static propTypes = {
    children: PropTypes.any,
    id: PropTypes.string,
    className: PropTypes.string,
    iconSize: PropTypes.string,
    title: PropTypes.string
  };

  static defaultProps = {
    iconSize: '14px',
    title: 'Help Tip'
  };

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.state = { isVisible: undefined };
  }

  handleClick = () => {
    this.setState({ isVisible: this.state.isVisible ? false : true });
  };

  render() {
    const { id, className, title, children, iconSize } = this.props;

    return (
      <div
        className={classNames('helptip', className)}
        id={id}
        style={{ width: iconSize, height: iconSize }}
      >
        <Tooltip
          defaultVisible={this.state.isVisible}
          tipPointerEvents="all"
          className="helptip__tooltip"
          wrap={true}
        >
          <Iconoclass
            onClick={this.handleClick}
            iconName="helpOutline"
            size={iconSize}
            behavior="toggle"
            checked={this.state.isVisible}
          />
          <TooltipContent>
            <div className="helptip__layout">
              <div className="helptip__header">
                {title}
                <Iconoclass
                  iconName="delete"
                  className="helptip__close-icon"
                  size="16px"
                  behavior="button"
                  onClick={this.handleClick}
                />
              </div>
              <div className="helptip__children-container">{children}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }
}
