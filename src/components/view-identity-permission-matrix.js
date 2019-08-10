import React from 'react';
import PropTypes from 'prop-types';

const ViewIdentityPermissionMatrix = ({
  matrix,
  height = 8,
  visibleColor,
  invisibleColor
}) => {
  return (
    <div
      className="view-identity-permission-matrix"
      style={{
        height: `${height}px`,
        width: `${height + (height / 4) * 2}px`
      }}
    >
      {Object.keys(matrix).map(roleA => {
        return (
          <div
            className={`view-identity-permission-matrix__row view-identity-permission-matrix__cell--${roleA}`}
            key={roleA}
            style={{ display: 'flex' }}
          >
            {Object.keys(matrix[roleA]).map(roleB => {
              return (
                <div
                  key={`${roleA}x${roleB}`}
                  className={`view-identity-permission-matrix__cell view-identity-permission-matrix__cell${
                    matrix[roleA][roleB] ? '--visible' : '--invisible'
                  } view-identity-permission-matrix__cell--${roleB}`}
                  style={{
                    backgroundColor: matrix[roleA][roleB]
                      ? visibleColor
                      : invisibleColor,
                    width: `${height / 4}px`,
                    height: `${height / 4}px`,
                    marginLeft: `${roleB === 'public' ? '2px' : '0'}`
                  }}
                  title={`${roleA} can ${
                    matrix[roleA][roleB] ? '' : 'not '
                  }view identity of ${roleB}`}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

ViewIdentityPermissionMatrix.propTypes = {
  height: PropTypes.number,
  visibleColor: PropTypes.string,
  invisibleColor: PropTypes.string,
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
