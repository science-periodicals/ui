import React from 'react';
import PropTypes from 'prop-types';
import WorkFlowBadgeRoleIcon from './workflow-badge-role-icon';
import WorkflowBadgeMatrix from './workflow-badge-matrix';
import ViewIdentityPermissionMatrix from '../view-identity-permission-matrix';
/* 
We chose to use a block level render of each line segment because creating 
acurate stroke offsets with parallel bazzier radius is quite complex in practice. 
See: http://tavmjong.free.fr/blog/?p=1257 for explanation. Instead we took a 
lego-brick approach where each segment type can be composed on a grid */

const WorkflowBadge = ({
  badgeSize = 120,
  startTime,
  endTime,
  counts,
  paths,
  viewIdentityPermissionMatrix,
  activePathColor = 'black',
  inactivePathColor = 'darkgrey',
  foregroundColor = 'black',
  backgroundColor = 'whitesmoke',
  cellColor = '#efefef'
}) => {
  const svgViewBox = `0 0 ${badgeSize} ${badgeSize}`;
  const matrixSizePerc = 0.8;
  const matrixSize = badgeSize * matrixSizePerc;
  const matrixYOffsetPerc = 0.06;
  const roles = ['Authors', 'Editors', 'Reviewers', 'Producers'];
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

          {roles.map((role, i) => {
            return (
              <svg
                key={`role-icon_${i}`}
                x="2%"
                y={`${i * ((matrixSizePerc / 4) * 100) +
                  matrixYOffsetPerc * 100 +
                  1}%`}
                viewBox="0 0 20 20"
                width={`${(matrixSizePerc / 4) * 100 - 4}%`}
                height={`${(matrixSizePerc / 4) * 100 - 4}%`}
              >
                <WorkFlowBadgeRoleIcon
                  roleName={role}
                  foregroundColor={foregroundColor}
                  backgroundColor={backgroundColor}
                  count={counts[role.toLowerCase()]}
                />
              </svg>
            );
          })}

          <svg
            x={`${(1 - matrixSizePerc) * 100 - 2}%`}
            y={`${matrixYOffsetPerc * 100}%`}
          >
            {/* {renderActionMatrix(matrixSize, 0)} */}
            <WorkflowBadgeMatrix
              size={matrixSize}
              activePathColor={activePathColor}
              inactivePathColor={inactivePathColor}
              paths={paths}
              cellColor={cellColor}
            />
          </svg>
        </svg>
        <div
          className="workflow-badge__footer"
          style={{
            height: `${(1 - matrixSizePerc - matrixYOffsetPerc) * 100}%`
          }}
        >
          <div
            className="workflow-badge__footer__matrix-container"
            style={{
              width: `${(1 - matrixSizePerc) * 100 - 2}%`
            }}
          >
            {' '}
            <ViewIdentityPermissionMatrix
              matrix={viewIdentityPermissionMatrix}
              visibleColor={activePathColor}
              invisibleColor={inactivePathColor}
              height={(1 - matrixSizePerc - matrixYOffsetPerc) * badgeSize - 8}
            />
          </div>

          <div
            className="workflow-badge__date-range"
            style={{
              color: foregroundColor,
              fontSize: Math.min(
                16,
                Math.max(
                  10,
                  (1 - matrixSizePerc - matrixYOffsetPerc) * badgeSize - 8
                )
              )
            }}
          >
            <span className="workflow-badge__date-range__start">
              {startTime.toLocaleDateString('en-US', {
                day: undefined,
                month: '2-digit',
                year: 'numeric'
              })}
            </span>{' '}
            –{' '}
            <span className="workflow-badge__date-range__end">
              {endTime.toLocaleDateString('en-US', {
                day: undefined,
                month: '2-digit',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

WorkflowBadge.propTypes = {
  badgeSize: PropTypes.number,
  startTime: PropTypes.instanceOf(Date),
  endTime: PropTypes.instanceOf(Date),
  activePathColor: PropTypes.string,
  inactivePathColor: PropTypes.string,
  foregroundColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  cellColor: PropTypes.string,
  counts: PropTypes.shape({
    authors: PropTypes.number.isRequired,
    editors: PropTypes.number.isRequired,
    reviewers: PropTypes.number.isRequired,
    producers: PropTypes.number.isRequired
  }),
  paths: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired, // the @id of the underlying action (usefull to draw separator lines as 1 action can span through several time steps)
      x: PropTypes.number.isRequired, // logical time (0,1,2,3,4,5,6...)
      y: PropTypes.oneOf([0, 1, 2, 3]).isRequired, // A, E, R, P
      z: PropTypes.arrayOf(PropTypes.bool).isRequired // A, E, R, P to color code the time-varying audience
    })
  ),
  viewIdentityPermissionMatrix: PropTypes.shape({
    authors: PropTypes.shape({
      authors: PropTypes.bool,
      editors: PropTypes.bool,
      reviewers: PropTypes.bool,
      producers: PropTypes.bool,
      public: PropTypes.bool
    }),
    editors: PropTypes.shape({
      authors: PropTypes.bool,
      editors: PropTypes.bool,
      reviewers: PropTypes.bool,
      producers: PropTypes.bool,
      public: PropTypes.bool
    }),
    reviewers: PropTypes.shape({
      authors: PropTypes.bool,
      editors: PropTypes.bool,
      reviewers: PropTypes.bool,
      producers: PropTypes.bool,
      public: PropTypes.bool
    }),
    producers: PropTypes.shape({
      authors: PropTypes.bool,
      editors: PropTypes.bool,
      reviewers: PropTypes.bool,
      producers: PropTypes.bool,
      public: PropTypes.bool
    })
  })
};

export default WorkflowBadge;
