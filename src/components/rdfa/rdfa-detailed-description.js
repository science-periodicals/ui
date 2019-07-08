import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { getId, prefix } from '@scipe/jsonld';
import Value from '../value';

export default class RdfaDetailedDescription extends React.Component {
  render() {
    const { id, className, object, predicate } = this.props;
    return (
      <div
        id={id}
        role="doc-abstract"
        className={classNames(className, 'rdfa-detailed-description')}
        property={predicate}
        resource={getId(object)}
        typeof={prefix(object['@type'])}
      >
        <Value tagName="h2" property="schema:name">
          {object.name}
        </Value>
        <Value property="schema:text">{object.text}</Value>
      </div>
    );
  }
}

RdfaDetailedDescription.defaultProps = {
  predicate: 'schema:detailedDescription'
};

RdfaDetailedDescription.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  object: PropTypes.object, // a sa:Abstract
  predicate: PropTypes.string
};
