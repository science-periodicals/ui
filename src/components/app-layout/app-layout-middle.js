import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BemTags from '../../utils/bem-tags';
import { CSS_XLARGE_DESKTOP } from '../../constants';
import { withAppLayout } from './app-layout';

class _AppLayoutMiddle extends Component {
  /*
    In maximize mode, setting MaxContentWidth will allow content to expand until it reaches full width and
    then will increase margin until content is centered.

    Maximimze mode gives middle content flex grow ratio of 3:1 relative to margins and margins have a max width set by --app-sidebar-width--max

    Center Mode gives middle content flex grow ration of 1:1 relative to margins and the margins are allowed to grow without max width.
  */
  static propTypes = {
    children: PropTypes.node,
    widthMode: PropTypes.oneOf(['center', 'maximize', 'auto']),
    minContentWidth: PropTypes.string,
    maxContentWidth: PropTypes.string,

    virtualRight: PropTypes.bool,
    headerHeight: PropTypes.number,
    subHeaderHeight: PropTypes.number,
    screenWidth: PropTypes.string
  };

  static defaultProps = {
    widthMode: 'auto'
  };

  render() {
    const {
      virtualRight,
      widthMode,
      screenWidth,
      subHeaderHeight
    } = this.props;
    const bem = BemTags('app-layout');

    let style = {};
    if (this.props.maxContentWidth) {
      style.maxWidth = this.props.maxContentWidth;
    }
    if (this.props.minContentWidth) {
      style.minWidth = this.props.minContentWidth;
    }
    style.paddingTop = `${subHeaderHeight}px`;

    const widthClass =
      widthMode == 'auto'
        ? screenWidth < CSS_XLARGE_DESKTOP
          ? 'maximize'
          : 'center'
        : widthMode;

    return (
      <div className={bem`__middle --${widthClass}`}>
        <div className={bem`__middle-left-spacer`} />
        <div className={bem`__middle-content`} style={style}>
          {this.props.children}
        </div>
        {!virtualRight && <div className={bem`__middle-right-spacer`} />}
      </div>
    );
  }
}

export default withAppLayout(_AppLayoutMiddle);

export const AppLayoutMiddleFooter = ({ children, tagName }) => {
  const bem = BemTags('app-layout');
  const El = tagName || 'div';
  return (
    <El className={bem`__middle-footer`}>
      <div className={bem`__middle-left-spacer`} />
      {children}
      <div className={bem`__middle-right-spacer`} />
    </El>
  );
};

AppLayoutMiddleFooter.propTypes = {
  children: PropTypes.any,
  tagName: PropTypes.string
};

export const AppLayoutMiddleLeftSpacer = ({ tagName }) => {
  const bem = BemTags('app-layout');
  const El = tagName || 'div';
  return <El className={bem`__middle-left-spacer`} />;
};

AppLayoutMiddleLeftSpacer.propTypes = {
  tagName: PropTypes.string
};

export const AppLayoutMiddleRightSpacer = ({ tagName }) => {
  const bem = BemTags('app-layout');
  const El = tagName || 'div';
  return <El className={bem`__middle-right-spacer`} />;
};

AppLayoutMiddleRightSpacer.propTypes = {
  tagName: PropTypes.string
};
