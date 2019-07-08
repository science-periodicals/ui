import React from 'react';
import PropTypes from 'prop-types';
import Value from './value';

export default class ErrorCard extends React.Component {
  static propTypes = {
    error: PropTypes.shape({
      description: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          '@type': PropTypes.oneOf(['rdf:HTML']),
          '@value': PropTypes.string
        })
      ]),
      statusCode: PropTypes.number
    })
  };

  render() {
    const { error } = this.props;

    return (
      <div className="error-card">
        <div className="card error-card__card">
          <h1>Error {error.statusCode}</h1>
          <Value className="error-card__message">{error.description}</Value>
        </div>
      </div>
    );
  }
}
