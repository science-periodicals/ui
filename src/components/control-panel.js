import React from 'react';
import PropTypes from 'prop-types';
import Iconoclass from '@scipe/iconoclass';
import BemTags from '../utils/bem-tags';
import classNames from 'classnames';

const bem = BemTags();

const ControlPanel = ({ className, children, error, hideControlOnError }) => (
  <div className={classNames(className, bem`control-panel`)}>
    {error && (
      <div className={bem`error`}>
        <div className={bem`error-icon`}>
          <Iconoclass iconName="warning" round={true} iconSize={24} />
        </div>
        <div className={bem`error-text`}>
          {`${error.message || 'something went wrong'}`}
        </div>
      </div>
    )}
    {(!error || (error && !hideControlOnError)) && (
      <div className="control-panel__controls">{children}</div>
    )}
  </div>
);

ControlPanel.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  error: PropTypes.instanceOf(Error),
  hideControlOnError: PropTypes.bool
};

export default ControlPanel;
