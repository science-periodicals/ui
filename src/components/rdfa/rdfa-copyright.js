import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { getId, arrayify } from '@scipe/jsonld';
import RdfaPersonOrOrganization from './rdfa-person-or-organization';

export default function RdfaCopyright({ id, className, object }) {
  const holders = arrayify(object.copyrightHolder).filter(
    holder => holder.name || holder.familyName || holder.givenName
  );
  const hasHolders = !!holders.length;
  const hasYear = object.copyrightYear != null;
  if (!hasHolders && !hasYear) return null;

  return (
    <span id={id} className={classNames('rdfa-copyright', className)}>
      ©{' '}
      {hasYear && (
        <span property="schema:copyrightYear">{object.copyrightYear}</span>
      )}
      {hasYear && hasHolders ? <span> </span> : null}
      {holders.map((holder, i) => (
        <span key={getId(holder) || JSON.stringify(holder)}>
          <RdfaPersonOrOrganization
            object={holder}
            predicate="schema:copyrightHolder"
          />
          {i !== holders.length - 1 && <span>; </span>}
        </span>
      ))}
    </span>
  );
}

RdfaCopyright.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  object: PropTypes.object // a resource
};
