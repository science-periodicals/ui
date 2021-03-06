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
      height={height}
      width={`${height + (height / 4) * 2}`}
    >
      {['author', 'editor', 'reviewer', 'producer'].map((roleA, row) => {
        return (
          <g
            className={`view-identity-permission-matrix__row view-identity-permission-matrix__cell--${roleA}`}
            key={roleA}
          >
            {['author', 'editor', 'reviewer', 'producer'].map((roleB, col) => {
              return (
                <rect
                  width={`${height / 4 - 0.5}px`}
                  height={`${height / 4 - 0.5}px`}
                  x={`${col * (height / 4)}px`}
                  y={`${row * (height / 4)}px`}
                  fill={
                    roleA === highlightRole
                      ? matrix[roleA][roleB]
                        ? visibleHighlightColor
                        : invisibleHighlightColor
                      : matrix[roleA][roleB]
                      ? visibleColor
                      : invisibleColor
                  }
                  opacity={matrix[roleA][roleB] ? 1 : 0.3}
                  key={`${roleA}x${roleB}`}
                  className={`view-identity-permission-matrix__cell view-identity-permission-matrix__cell${
                    matrix[roleA][roleB] ? '--visible' : '--invisible'
                  } view-identity-permission-matrix__cell--${roleB}`}
                >
                  <title>{`${roleA}s can ${
                    matrix[roleA][roleB] ? '' : 'not '
                  }view identity of ${roleB}s`}</title>
                </rect>
              );
            })}

            {/* public case */}
            <rect
              width={`${height / 4 - 0.5}px`}
              height={`${height / 4 - 0.5}px`}
              x={`${4 * (height / 4) + 2}px`}
              y={`${row * (height / 4)}px`}
              fill={
                roleA === highlightRole
                  ? matrix.public[roleA]
                    ? visibleHighlightColor
                    : invisibleHighlightColor
                  : matrix.public[roleA]
                  ? visibleColor
                  : invisibleColor
              }
              stroke="none"
              key={`publicx${roleA}`}
              className={`view-identity-permission-matrix__cell view-identity-permission-matrix__cell${
                matrix.public[roleA] ? '--visible' : '--invisible'
              } view-identity-permission-matrix__cell--public`}
            >
              <title>{`public can ${
                matrix.public[roleA] ? '' : 'not '
              }view identity of ${roleA}s`}</title>
            </rect>
          </g>
        );
      })}
    </svg>
  );
};

// style={{
//   backgroundColor:
//     roleA === highlightRole
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
  highlightRole: PropTypes.oneOf([
    'editor',
    'author',
    'reviewer',
    'producer',
    'none',
    ''
  ]),
  matrix: PropTypes.shape({
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
export default ViewIdentityPermissionMatrix;
