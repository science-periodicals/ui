import React from 'react';
import PropTypes from 'prop-types';

const ViewIdentityPermissionMatrix = ({
  matrix,
  height = 8,
  visibleColor,
  invisibleColor,
  visibleHighlightColor,
  invisibleHighlightColor,
  highlightRole
}) => {
  return (
    <svg
      className="view-identity-permission-matrix"
      //viewBox={`0 0 ${height} ${height + (height / 4) * 2}`}
      height={height}
      width={`${height + (height / 4) * 2}`}
    >
      {Object.keys(matrix).map((roleA, row) => {
        return (
          <g
            className={`view-identity-permission-matrix__row view-identity-permission-matrix__cell--${roleA}`}
            key={roleA}
          >
            {Object.keys(matrix[roleA]).map((roleB, col) => {
              return (
                <rect
                  width={`${height / 4}px`}
                  height={`${height / 4}px`}
                  x={`${col * (height / 4) + (roleB === 'public' ? 2 : 0)}px`}
                  y={`${row * (height / 4)}px`}
                  fill={
                    roleA === highlightRole.toLowerCase()
                      ? matrix[roleA][roleB]
                        ? visibleHighlightColor
                        : invisibleHighlightColor
                      : matrix[roleA][roleB]
                      ? visibleColor
                      : invisibleColor
                  }
                  stroke="none"
                  key={`${roleA}x${roleB}`}
                  className={`view-identity-permission-matrix__cell view-identity-permission-matrix__cell${
                    matrix[roleA][roleB] ? '--visible' : '--invisible'
                  } view-identity-permission-matrix__cell--${roleB}`}
                  title={`${roleA} can ${
                    matrix[roleA][roleB] ? '' : 'not '
                  }view identity of ${roleB}`}
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
};

// style={{
//   backgroundColor:
//     roleA === highlightRole.toLowerCase()
//       ? matrix[roleA][roleB]
//         ? visibleHighlightColor
//         : invisibleHighlightColor
//       : matrix[roleA][roleB]
//       ? visibleColor
//       : invisibleColor,
//   width: `${height / 4}px`,
//   height: `${height / 4}px`,
//   marginLeft: `${roleB === 'public' ? '2px' : '0'}`
// }}

ViewIdentityPermissionMatrix.propTypes = {
  height: PropTypes.number,
  visibleColor: PropTypes.string,
  invisibleColor: PropTypes.string,
  visibleHighlightColor: PropTypes.string,
  invisibleHighlightColor: PropTypes.string,
  highlightRole: PropTypes.string,
  matrix: PropTypes.shape({
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
export default ViewIdentityPermissionMatrix;
