import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { getValue } from '@scipe/jsonld';
import classNames from 'classnames';

export default function RdfaDate({
  id,
  className,
  predicate,
  object,
  appendPrefix,
  format
}) {
  if (!object) return null;
  const value = getValue(object);
  if (!value) return;
  const type = object['@type'];

  // reformat value using moment.js
  let inputFormat, outputFormat, outputPrefix;
  switch (type) {
    case 'xsd:gYear':
      inputFormat = 'Y';
      outputFormat = 'Y'; // 2020
      outputPrefix = 'in';
      break;
    case 'xsd:gYearMonth':
      inputFormat = 'Y-M';
      outputFormat =
        format === 'Y' ? format : appendPrefix ? 'MMMM of Y' : 'MMMM Y'; //April of 2020 (if prefix )or April 2020
      outputPrefix = 'in';
      break;
    case 'xsd:gMonthDay':
      inputFormat = 'M-D';
      outputFormat = 'MMMM Do'; //April 21st
      outputPrefix = 'on';
      break;
    case 'xsd:gMonth':
      inputFormat = 'M';
      outputFormat = 'MMMM'; // April
      outputPrefix = 'in';
      break;
    case 'xsd:gDay':
      inputFormat = 'D';
      outputFormat = 'dddd'; // Monday
      outputPrefix = 'on';
      break;
    case 'xsd:date':
      inputFormat = 'Y-M-D';
      outputFormat = format || 'MMMM D, Y'; // April 21, 2020
      outputPrefix = 'on';
      break;
    case 'xsd:string':
      // e.g: {"@type": "xsd:string", "@value": "in press"}
      inputFormat = null;
      outputFormat = null;
      outputPrefix = '';
      break;
    default:
      outputFormat = format || 'MMMM D, Y'; // April 21, 2020
      outputPrefix = 'on';
      break;
  }

  let displayDate;
  if (inputFormat === null) {
    displayDate = getValue(object);
  } else {
    const d = moment(value, inputFormat);
    if (!d.isValid) {
      return null;
    }
    displayDate = d.format(outputFormat);
  }

  return (
    <span id={id} className={classNames('rdfa-date', className)}>
      {appendPrefix && <span>{` ${outputPrefix} `}</span>}
      <time
        property={predicate}
        content={getValue(object)}
        datatype={object['@type']}
        dateTime={getValue(object)}
      >
        {displayDate}
      </time>
    </span>
  );
}
RdfaDate.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  appendPrefix: PropTypes.bool, // appends 'in' or 'on'
  object: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      '@type': PropTypes.string,
      '@value': PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })
  ]), // can be a typed value
  predicate: PropTypes.string,
  format: PropTypes.oneOf(['Y'])
};
