import React from 'react';
import PropTypes from 'prop-types';
import { prefix } from '@scipe/jsonld';

export default class SchemaLink extends React.Component {
  static propTypes = {
    term: PropTypes.string, // if term is omitted children is used
    children: PropTypes.string
  };

  render() {
    let { children = '', term } = this.props;
    term = term || children.trim();
    const prefixed = prefix(term);

    const root = prefixed.startsWith('sa:')
      ? 'http://ns.sci.pe#'
      : 'http://schema.org/';

    return (
      <a href={`${root}${children}`} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
}
