import React from 'react';
import PropTypes from 'prop-types';

const TextLogo = ({ cap }) => {
  // note: we use a alt `.` period to get better letter spacing in serif fonts.

  return (
    <abbr className={`text-logo`} title="Science Periodicals">
      <span
        className={`text-logo__first-letter  ${
          cap ? 'text-logo__first-letter--cap' : ''
        }`}
      >
        s
      </span>
      ci<span className="text-logo__kern-small">{`․`}</span>pe
    </abbr>
  );
};

TextLogo.propTypes = {
  cap: PropTypes.bool
};

export default TextLogo;
