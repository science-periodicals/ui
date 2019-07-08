import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Spinner = ({
  size,
  label,
  progressMode,
  progress,
  showPercentage,
  children,
  className,
  heartbeat,
  theme,
  ...otherProps
}) => {
  const spinnerStyle = {
    width: size,
    height: size,
    lineHeight: size + 'px',
    backgroundColor: 'transparent',
    fontSize: Math.floor(size * 0.3) + 'px',
    borderRadius: Math.floor(size / 2) + 'px'
  };

  const progessStyle = {
    width: size,
    height: size,
    borderRadius: Math.floor(size / 2) + 'px'
  };

  let borderColor = theme === 'light' ? 'white' : 'black';

  let leftCircleStyle;
  let rightCircleStyle;
  if (progressMode === 'up' || progressMode === 'down') {
    let dir = progressMode === 'up' ? 1 : -1,
      leftProgressRotate =
        progress < 50 ? dir * 360 * (progress / 100) + 45 : dir * 180 + 45,
      rightProgressRotate =
        progress < 50 ? dir * 180 + 45 : dir * 360 * (progress / 100) + 45;
    leftCircleStyle = {
      MsTransform: `rotate(${leftProgressRotate}deg)`,
      WebkitTransform: `rotate(${leftProgressRotate}deg)`,
      transform: `rotate(${leftProgressRotate}deg)`,
      width: size,
      height: size,
      borderRight: `2px solid ${borderColor}`,
      borderTop: `2px solid ${borderColor}`
    };
    rightCircleStyle = {
      MsTransform: `rotate(${rightProgressRotate}deg)`,
      WebkitTransform: `rotate(${rightProgressRotate}deg)`,
      transform: `rotate(${rightProgressRotate}deg)`,
      width: size,
      height: size,
      borderRight: `2px solid ${borderColor}`,
      borderTop: `2px solid ${borderColor}`
    };
  } else if (
    progressMode === 'spinUp' ||
    progressMode === 'spinDown' ||
    progressMode === 'bounce' ||
    progressMode === 'pulse'
  ) {
    leftCircleStyle = {
      borderRight: `2px solid ${borderColor}`,
      width: size,
      height: size
    };
    rightCircleStyle = {
      borderRight: `2px solid ${borderColor}`,
      width: size,
      height: size
    };
  } else {
    leftCircleStyle = {
      display: 'none'
    };
    rightCircleStyle = {
      display: 'none'
    };
  }

  return (
    <div
      className={`spinner ${className} ${
        theme === 'dark' ? 'spinner--dark' : 'spinner--light'
      }`}
      {...otherProps}
    >
      <div
        className="spinner__graphic"
        data-test-progress={(!!(
          heartbeat || progressMode !== 'none'
        )).toString()}
      >
        <div className="spinner__progress" style={progessStyle}>
          <div className="spinner__progress__left-mask">
            <div
              className={classNames('spinner__progress__left-circle', {
                'spinner__progress__left-circle--spin-up':
                  progressMode === 'spinUp',
                'spinner__progress__left-circle--spin-down':
                  progressMode === 'spinDown',
                'spinner__progress__left-circle--bounce':
                  progressMode === 'bounce',
                'spinner__progress__left-circle--pulse':
                  progressMode === 'pulse'
              })}
              style={leftCircleStyle}
            />
          </div>
          <div className="spinner__progress__right-mask">
            <div
              className={classNames('spinner__progress__right-circle', {
                'spinner__progress__right-circle--spin-up':
                  progressMode === 'spinUp',
                'spinner__progress__right-circle--spin-down':
                  progressMode === 'spinDown',
                'spinner__progress__right-circle--bounce':
                  progressMode === 'bounce',
                'spinner__progress__right-circle--pulse':
                  progressMode === 'pulse'
              })}
              style={rightCircleStyle}
            />
          </div>
        </div>
        <div className="spinner__circle" style={spinnerStyle}>
          {progress !== null && showPercentage && (
            <span className="spinner__percentage">{progress + '%'}</span>
          )}
          {!showPercentage && (
            <div
              className={`spinner__icon spinner__icon--${
                heartbeat ? 'heartbeat' : 'no-heartbeat'
              }`}
            >
              {children}
            </div>
          )}
        </div>
      </div>
      {label && <div className="spinner__label">{label}</div>}
    </div>
  );
};
Spinner.defaultProps = {
  size: 32,
  progress: 0,
  progressMode: 'none',
  showPercentage: false,
  className: '',
  heartbeat: false,
  theme: 'dark'
};
Spinner.propTypes = {
  size: PropTypes.number,
  label: PropTypes.string,
  showPercentage: PropTypes.bool,
  progress: PropTypes.number /* a number between 0 and 100) */,
  heartbeat: PropTypes.bool,
  progressMode: PropTypes.oneOf([
    'up',
    'down',
    'spinUp',
    'spinDown',
    'bounce',
    'pulse',
    'none'
  ]),
  children: PropTypes.node,
  className: PropTypes.string,
  theme: PropTypes.oneOf(['light', 'dark'])
};
export default Spinner;
