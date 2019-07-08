import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const AppLayoutVirtualRightMargin = () => (
  <div className="app-layout__virtual-right-spacer" />
);

AppLayoutVirtualRightMargin.propTypes = {
  children: PropTypes.any
};

const AppLayoutVirtualRightMarginContent = React.forwardRef((props, ref) => {
  const {
    className,
    id,
    children,
    tagName,
    maxWidth,
    style,
    virtualRight,
    ...otherProps
  } = props;

  const El = tagName;

  let newStyle = {};

  if (style && maxWidth) {
    newStyle = Object.assign(style, { maxWidth: maxWidth });
  } else if (maxWidth) {
    newStyle['maxWidth'] = maxWidth;
  } else if (style) {
    newStyle = style;
  }

  return (
    <El
      ref={ref}
      {...otherProps}
      id={id}
      style={newStyle}
      className={classNames(
        className,
        'app-layout__virtual-right-margin-content',
        {
          'app-layout__virtual-right-margin-content--expanded': virtualRight,
          'app-layout__virtual-right-margin-content--collapsed': !virtualRight
        }
      )}
    >
      {children}
    </El>
  );
});

AppLayoutVirtualRightMarginContent.propTypes = {
  children: PropTypes.any,
  id: PropTypes.any,
  className: PropTypes.string,
  tagName: PropTypes.string,
  maxWidth: PropTypes.string,
  virtualRight: PropTypes.bool
};
AppLayoutVirtualRightMarginContent.defaultProps = {
  tagName: 'div',
  virtualRight: true
};

export { AppLayoutVirtualRightMargin, AppLayoutVirtualRightMarginContent };
