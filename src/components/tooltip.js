import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import ReactPortal from './react-portal';
import classNames from 'classnames';
import * as reactChildrenUtils from '../utils/react-children-utils';

export default class Tooltip extends Component {
  static propTypes = {
    displayText: PropTypes.string,
    tagName: PropTypes.oneOf(['div', 'span']),
    wrap: PropTypes.bool,
    children: PropTypes.any,
    /* note: id should be required to allow better aria accessability with the
    aria-labelledby attr. however it is not required now to avoid breaking changes */
    id: PropTypes.string,
    className: PropTypes.string,
    defaultVisible: PropTypes.bool,
    tipPointerEvents: PropTypes.string
  };

  static defaultProps = {
    tagName: 'span',
    wrap: false,
    defaultVisible: undefined,
    tipPointerEvents: 'none'
  };

  constructor(props) {
    super(props);

    this.state = {
      isHovered: false,
      isVisible: false,
      defaultVisible: this.props.defaultVisible
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultVisible !== this.props.defaultVisible)
      this.manageIsVisible(this.state.isHovered, nextProps.defaultVisible);
  }

  handleMouseOver = e => {
    this.manageIsVisible(true);
  };

  handleMouseOut = () => {
    this.manageIsVisible(false);
  };

  // This is used to clear a tooltip when there is a reference to Tooltip (this.ref.mouseOut())
  mouseOut() {
    this.manageIsVisible(false);
  }

  manageIsVisible = (
    isHovered = this.state.isHovered,
    defaultVisible = this.props.defaultVisible
  ) => {
    let isVisible = false;
    if (isHovered === true || defaultVisible === true) {
      isVisible = true;
    }

    if (
      this.state.isVisible !== isVisible ||
      this.state.isHovered !== isHovered
    )
      this.setState({
        isVisible: isVisible,
        isHovered: isHovered
      });
  };

  render() {
    const {
      wrap,
      displayText,
      children,
      id,
      className,
      tipPointerEvents
    } = this.props;

    let tooltipContent = reactChildrenUtils.getAllOfType(
      children,
      TooltipContent
    );

    let target = reactChildrenUtils.getAllNotOfType(children, TooltipContent);

    return (
      <this.props.tagName
        className={classNames('tooltip', className)}
        id={id}
        style={{ display: 'inline' }}
        onMouseEnter={this.handleMouseOver}
        onMouseLeave={this.handleMouseOut}
        aria-labelledby={id ? `${id}__tooltip}` : null}
      >
        {target}
        {this.state.isVisible && (
          <ReactPortal
            safePosition={true}
            portalClass={classNames('tooltip__portal', {
              [`${className}__portal`]: className
            })}
          >
            <div
              style={{ pointerEvents: tipPointerEvents }}
              role="tooltip"
              id={id ? `${id}__tooltip}` : null}
              className={classNames(
                'tooltip__tip',
                { [`${className}__tip`]: className },
                {
                  'tooltip__tip--wrap': wrap
                }
              )}
            >
              {[displayText, tooltipContent]}
            </div>
          </ReactPortal>
        )}
      </this.props.tagName>
    );
  }
}

export class TooltipContent extends PureComponent {
  static propTypes = {
    children: PropTypes.any
  };
  render() {
    let { children } = this.props;
    return <div>{children}</div>;
  }
}
