import React from 'react';
import PropTypes from 'prop-types';
import BemTags from '../utils/bem-tags';
import classNames from 'classnames';

export default function ExpansionPanelPreview(props) {
  const { children, className, height, ...otherProps } = props;
  const bem = BemTags('expansion-panel');
  let style = {};
  if (height) style.height = height;

  return (
    <div
      style={style}
      className={classNames(className, bem`__preview`)}
      {...otherProps}
    >
      {children}
    </div>
  );
}

ExpansionPanelPreview.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string,
  height: PropTypes.string
};
