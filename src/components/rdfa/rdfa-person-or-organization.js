import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { schema, getAgent } from '@scipe/librarian';
import RdfaPerson from './rdfa-person';
import RdfaOrganization from './rdfa-organization';

export default function RdfaPersonOrOrganization(props) {
  let { object, className } = props;
  object = getAgent(object); //!! we need to test the type on the agent not the role..

  const mergedClassNames = classNames(className, 'rdfa-person-or-organization');

  if (schema.is(object, 'Person')) {
    return <RdfaPerson {...props} className={mergedClassNames} />;
  } else if (schema.is(object, 'Organization')) {
    return <RdfaOrganization {...props} className={mergedClassNames} />;
  }

  return null;
}

RdfaPersonOrOrganization.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  object: PropTypes.object,
  predicate: PropTypes.string,
  preferFamilyName: PropTypes.bool,
  blindedName: PropTypes.string,
  link: PropTypes.bool // used to avoid nested <a> if used within an <a> already
};
