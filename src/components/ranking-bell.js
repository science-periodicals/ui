import React from 'react';
import PropTypes from 'prop-types';
import ordinal from 'ordinal';

const RankingBell = ({ size, color, percentile, className, id }) => {
  let percWidth = 18 * (percentile / 100);
  return (
    <span
      className={`ranking-bell ${className ? className : ''}`}
      title={`${ordinal(Math.round(percentile))} Percentile`}
      id={id}
    >
      <svg
        className="ranking-bell__svg"
        width={`${size * 1.33}px`}
        height={`${size}px`}
        viewBox="0 0 18 18"
      >
        <defs>
          <path
            id="path-1"
            d="M8.97708423,11 L0,11 C0,11 9.94549213e-08,10.3228137 1.00387419e-07,10.3228136 C1.01319916e-07,10.3228134 2.40850516,9.43987003 3.56333425,8 C5.36791757,5.75 6.27020924,0.5 8.97708423,0.5 C11.6839592,0.5 12.5862509,5.75 14.3908342,8 C15.5456633,9.43987003 18,10.3228137 18,10.3228137 L18,11 L8.97708423,11 Z"
          />
        </defs>
        <g
          id="Page-1"
          stroke="none"
          strokeWidth="1"
          fill="none"
          fillRule="evenodd"
        >
          <g id="Group" transform="translate(0.000000, 7.000000)">
            <g id="Rectangle-1">
              <mask id="mask-2" fill="white">
                <use xlinkHref="#path-1" />
              </mask>
              <use
                id="Mask"
                fillOpacity="0.35"
                fill={color}
                xlinkHref="#path-1"
              />
              <rect
                fill={color}
                mask="url(#mask-2)"
                x="0"
                y="-7"
                width={percWidth}
                height="18"
              />
            </g>
          </g>
        </g>
      </svg>
    </span>
  );
};

RankingBell.defaultProps = {
  size: 16,
  color: 'currentColor',
  percentile: 0
};
RankingBell.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
  percentile: PropTypes.number,
  id: PropTypes.string,
  className: PropTypes.string
};
export default RankingBell;
