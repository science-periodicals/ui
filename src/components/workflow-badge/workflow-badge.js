import React, { useState } from 'react';
import PropTypes from 'prop-types';
import WorkflowBadgeRoleIcon from './workflow-badge-role-icon';
import WorkflowBadgeMatrix from './workflow-badge-matrix';
import ViewIdentityPermissionMatrix from '../view-identity-permission-matrix';
/*
We chose to use a block level render of each line segment because creating
acurate stroke offsets with parallel bazzier radius is quite complex in practice.
See: http://tavmjong.free.fr/blog/?p=1257 for explanation. Instead we took a
lego-brick approach where each segment type can be composed on a grid */

function WorkflowBadge({
  badgeWidth = 120,
  badgeHeight = 120,
  startTime,
  endTime,
  counts,
  paths,
  viewIdentityPermissionMatrix,
  activePathColor = 'black',
  activePathHighlightColor = '#ff7560',
  inactivePathColor = '#808080',
  inactivePathHighlightColor = '#f7b2a8',
  isPublicDuringColor = '#ed1c2422',
  isPublicAfterColor = '#00a99d33',
  isPublicDuringAndAfterColor = '#cccc3144',
  foregroundColor = 'black',
  backgroundColor = 'whitesmoke',
  cellColor = '#efefef'
}) {
  const leftColWidthPercentOfHeight = 0.2;
  const leftColWidthPx = leftColWidthPercentOfHeight * badgeHeight;

  // min footer height is 20px;
  const footerHeightPerc = badgeHeight * 0.15 < 20 ? 20 / badgeHeight : 0.15;
  const footerHeightPx = badgeHeight * footerHeightPerc;

  const matrixHeightPerc = 1 - footerHeightPerc;
  const matrixWidthPx = badgeWidth - leftColWidthPx;
  const matrixhHeightPx = badgeHeight * matrixHeightPerc;

  /* the timeline font size determines the minimum width of the matrix */
  const dateFontSizePx = Math.min(13, Math.max(8, footerHeightPx * 0.5));
  const minDateWidthPx = dateFontSizePx * 10 * 0.5;

  const minTimeLineWidthPx = minDateWidthPx * 2 + 24;

  const roles = ['Authors', 'Editors', 'Reviewers', 'Producers'];

  const [hoveringRole, setHoveringRole] = useState('');

  const hoveredForegroundColor = activePathHighlightColor;

  return (
    <div className="workflow-badge">
      <div
        className="workflow-badge__background"
        style={{
          width: `${badgeWidth}px`,
          height: `${badgeHeight}px`,
          backgroundColor: backgroundColor
        }}
      >
        <div
          className="workflow-badge__left-column"
          style={{ top: 0, left: 0, height: '100%', width: badgeHeight * 0.2 }}
        >
          <div
            className="workflow-badge__left-column__role-icons"
            style={{ height: `${100 - footerHeightPerc * 100}%` }}
          >
            {roles.map((role, i) => {
              return (
                <svg
                  key={`role-icon_${i}`}
                  viewBox="0 0 20 20"
                  width={`100%`}
                  height={`20%`}
                >
                  <WorkflowBadgeRoleIcon
                    roleName={role}
                    foregroundColor={
                      hoveringRole === role
                        ? hoveredForegroundColor
                        : foregroundColor
                    }
                    backgroundColor={backgroundColor}
                    count={counts[role.toLowerCase()]}
                    onMouseEnter={() => setHoveringRole(role)}
                    onMouseLeave={() => setHoveringRole('none_')}
                  />
                </svg>
              );
            })}
          </div>
          <div
            className="workflow-badge__footer__matrix-container"
            style={{
              width: `${(1 - matrixHeightPerc) * 100 - 2}%`
            }}
          >
            <ViewIdentityPermissionMatrix
              matrix={viewIdentityPermissionMatrix}
              visibleColor={activePathColor}
              visibleHighlightColor={activePathHighlightColor}
              invisibleColor={inactivePathColor}
              invisibleHighlightColor={activePathHighlightColor}
              highlightRole={hoveringRole.toLowerCase().slice(0, -1)}
              height={footerHeightPx - 6}
            />
          </div>
        </div>
        <div
          className="workflow-badge__scroll-area"
          style={{
            top: 0,
            left: badgeHeight * 0.2,
            right: 0,
            bottom: 0,
            overflowX: 'auto'
          }}
        >
          <div className="workflow-badge__scroll-contents">
            <WorkflowBadgeMatrix
              width={matrixWidthPx}
              height={matrixhHeightPx}
              minTimeLineWidth={minTimeLineWidthPx}
              activePathColor={activePathColor}
              activePathHighlightColor={activePathHighlightColor}
              inactivePathColor={inactivePathColor}
              inactivePathHighlightColor={inactivePathHighlightColor}
              isPublicDuringColor={isPublicDuringColor}
              isPublicAfterColor={isPublicAfterColor}
              isPublicDuringAndAfterColor={isPublicDuringAndAfterColor}
              paths={paths}
              cellColor={cellColor}
              highlightRole={hoveringRole}
            />

            {/* Timeline footer */}

            <div
              className="workflow-badge__footer"
              style={{
                height: `${footerHeightPerc * 100}%`
              }}
            >
              <div
                className="workflow-badge__date-range"
                style={{
                  color: foregroundColor,
                  fontSize: dateFontSizePx
                }}
              >
                <span className="workflow-badge__date-range__start">
                  {startTime.toISOString().split('T')[0]}
                </span>
                <hr
                  className="workflow-badge__date-range__line"
                  style={{ borderTop: `1px solid ${foregroundColor}` }}
                />
                <span className="workflow-badge__date-range__end">
                  {endTime.toISOString().split('T')[0]}
                </span>
              </div>
            </div>
          </div>
          {/*<svg
              className="workflow-badge__footer"
              x="0"
              y={`${(matrixHeightPerc + matrixYOffsetPerc) * 100}%`}
              width={badgeWidth}
              >
              <g
              className="workflow-badge__footer__matrix-container"
              transform={`translate(${0.025 * badgeWidth} ${0.015 *
              badgeHeight})`}
              >
              <ViewIdentityPermissionMatrix
              matrix={viewIdentityPermissionMatrix}
              visibleColor={activePathColor}
              visibleHighlightColor={activePathHighlightColor}
              invisibleColor={inactivePathColor}
              invisibleHighlightColor={inactivePathHighlightColor}
              highlightRole={hoveringRole.toLowerCase().replace(/s$/, '')}
              height={
              (1 - matrixHeightPerc - matrixYOffsetPerc) * badgeHeight -
              0.04 * badgeHeight
              }
              />
              </g>

              <g
              className="workflow-badge__date-range"
              transform={`translate(${0.185 * badgeWidth} ${0.1 *
              badgeHeight})`}
              width={matrixWidthPx}
              fill={foregroundColor}
              style={{
              color: foregroundColor,
              fontSize: Math.min(
              16,
              Math.max(
              10,
              (1 - matrixHeightPerc - matrixYOffsetPerc) * badgeHeight - 8
              )
              )
              }}
              >
              <text className="workflow-badge__date-range__start">
              {startTime.toLocaleDateString('en-US', {
              day: undefined,
              month: '2-digit',
              year: 'numeric'
              })}
              </text>
              <text
              textAnchor="middle"
              x={matrixWidthPx / 2 - matrixWidthPx * 0.02}
              >
              -
              </text>
              <text
              className="workflow-badge__date-range__end"
              textAnchor="end"
              x={matrixWidthPx - matrixWidthPx * 0.02}
              >
              {endTime.toLocaleDateString('en-US', {
              day: undefined,
              month: '2-digit',
              year: 'numeric'
              })}
              </text>
              </g>
              </svg>*/}
        </div>
      </div>
    </div>
  );
}

WorkflowBadge.propTypes = {
  badgeWidth: PropTypes.number,
  badgeHeight: PropTypes.number,
  startTime: PropTypes.instanceOf(Date),
  endTime: PropTypes.instanceOf(Date),
  activePathColor: PropTypes.string,
  activePathHighlightColor: PropTypes.string,
  inactivePathColor: PropTypes.string,
  inactivePathHighlightColor: PropTypes.string,
  isPublicDuringColor: PropTypes.string,
  isPublicAfterColor: PropTypes.string,
  isPublicDuringAndAfterColor: PropTypes.string,
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
      z: PropTypes.arrayOf(PropTypes.bool).isRequired, // A, E, R, P to color code the time-varying audience
      isPublicDuring: PropTypes.bool.isRequired, // an action can be viewed publicly _during_ the editorial workflow
      isPublicAfter: PropTypes.bool.isRequired // an action can be viewed publicly _after_ the editorial workflow has been completed
    })
  ),
  viewIdentityPermissionMatrix: PropTypes.shape({
    author: PropTypes.shape({
      author: PropTypes.bool,
      editor: PropTypes.bool,
      reviewer: PropTypes.bool,
      producer: PropTypes.bool
    }).isRequired,
    editor: PropTypes.shape({
      author: PropTypes.bool,
      editor: PropTypes.bool,
      reviewer: PropTypes.bool,
      producer: PropTypes.bool
    }).isRequired,
    reviewer: PropTypes.shape({
      author: PropTypes.bool,
      editor: PropTypes.bool,
      reviewer: PropTypes.bool,
      producer: PropTypes.bool
    }).isRequired,
    producer: PropTypes.shape({
      author: PropTypes.bool,
      editor: PropTypes.bool,
      reviewer: PropTypes.bool,
      producer: PropTypes.bool
    }).isRequired,
    public: PropTypes.shape({
      author: PropTypes.bool,
      editor: PropTypes.bool,
      reviewer: PropTypes.bool,
      producer: PropTypes.bool
    }).isRequired
  })
};

export default WorkflowBadge;
