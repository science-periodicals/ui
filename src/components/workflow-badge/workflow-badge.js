import React from 'react';
import PropTypes from 'prop-types';
import WorkFlowBadgeRoleIcon from './workflow-badge-role-icon';
import WorkflowBadgeMatrix from './workflow-badge-matrix';
/* 
We chose to use a block level render of each line segment because creating 
acurate stroke offsets with parallel bazzier radius is quite complex in practice. 
See: http://tavmjong.free.fr/blog/?p=1257 for explanation. Instead we took a 
lego-brick approach where each segment type can be composed on a grid */

const WorkflowBadge = ({
  badgeSize = 100,
  startTime,
  endTime,
  counts,
  paths
}) => {
  const activePathColor = 'white';
  const inactivePathColor = 'lightgrey';
  const backgroundColor = 'grey';
  const cellColor = '#949494';
  const svgViewBox = `0 0 ${badgeSize} ${badgeSize}`;
  const matrixSize = badgeSize * 0.75;

  return (
    <div className="workflow-badge">
      <div
        className="workflow-badge__background"
        style={{
          width: badgeSize,
          height: badgeSize,
          backgroundColor: backgroundColor
        }}
      >
        <svg viewBox={svgViewBox} xmlns="http://www.w3.org/2000/svg">
          <rect
            width={badgeSize - matrixSize}
            height={badgeSize}
            fill={backgroundColor}
            x="0"
            y="0"
          ></rect>
          <WorkFlowBadgeRoleIcon
            fillColor="white"
            strokeColor={backgroundColor}
          />
          <g transform="translate(24, 8)">
            {/* {renderActionMatrix(matrixSize, 0)} */}
            <WorkflowBadgeMatrix
              size={matrixSize}
              activePathColor={activePathColor}
              inactivePathColor={inactivePathColor}
              paths={paths}
              cellColor={cellColor}
            />
          </g>
        </svg>
      </div>
    </div>
  );
};

WorkflowBadge.propTypes = {
  size: PropTypes.number,
  startTime: PropTypes.instanceOf(Date),
  endTime: PropTypes.instanceOf(Date),
  counts: PropTypes.shape({
    authors: PropTypes.number.isRequired,
    editors: PropTypes.number.isRequired,
    reviewers: PropTypes.number.isRequired,
    producers: PropTypes.number.isRequired
  }),
  paths: PropTypes.array,
  // paths: PropTypes.shape({
  //   authors: PropTypes.arrayOf(
  //     PropTypes.shape({
  //       id: PropTypes.string.isRequired, // the @id of the underlying action (usefull to draw separator lines as 1 action can span through several time steps)
  //       x: PropTypes.number.isRequired, // logical time (0,1,2,3,4,5,6...)
  //       y: PropTypes.oneOf([0, 1, 2, 3]).isRequired, // A, E, R, P
  //       z: PropTypes.oneOf([0, 1, 2, 3]).isRequired // A, E, R, P to color code the time-varying audience
  //     })
  //   ),
  //   editors: PropTypes.arrayOf(
  //     PropTypes.shape({
  //       id: PropTypes.string.isRequired, // the @id of the underlying action (usefull to draw separator lines as 1 action can span through several time steps)
  //       x: PropTypes.number.isRequired, // logical time (0,1,2,3,4,5,6...)
  //       y: PropTypes.oneOf([0, 1, 2, 3]).isRequired, // A, E, R, P
  //       z: PropTypes.oneOf([0, 1, 2, 3]).isRequired // A, E, R, P to color code the time-varying audience
  //     })
  //   ),
  //   reviewers: PropTypes.arrayOf(
  //     PropTypes.shape({
  //       id: PropTypes.string.isRequired, // the @id of the underlying action (usefull to draw separator lines as 1 action can span through several time steps)
  //       x: PropTypes.number.isRequired, // logical time (0,1,2,3,4,5,6...)
  //       y: PropTypes.oneOf([0, 1, 2, 3]).isRequired, // A, E, R, P
  //       z: PropTypes.oneOf([0, 1, 2, 3]).isRequired // A, E, R, P to color code the time-varying audience
  //     })
  //   ),
  //   producers: PropTypes.arrayOf(
  //     PropTypes.shape({
  //       id: PropTypes.string.isRequired, // the @id of the underlying action (usefull to draw separator lines as 1 action can span through several time steps)
  //       x: PropTypes.number.isRequired, // logical time (0,1,2,3,4,5,6...)
  //       y: PropTypes.oneOf([0, 1, 2, 3]).isRequired, // A, E, R, P
  //       z: PropTypes.oneOf([0, 1, 2, 3]).isRequired // A, E, R, P to color code the time-varying audience
  //     })
  //   )
  // }),
  identityMatrix: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)), // who can view identity of whom
  postPublicationVisibleIdentities: PropTypes.arrayOf(PropTypes.bool)
};

export default WorkflowBadge;
