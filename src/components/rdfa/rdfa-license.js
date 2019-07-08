import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import spdx from 'spdx-license-list';
import { getId, unprefix } from '@scipe/jsonld';
import Iconoclass from '@scipe/iconoclass';

const spdxURLs = Object.keys(spdx).reduce((spdxURLs, key) => {
  if (spdx[key].url) {
    const urls = spdx[key].url.split(/\n/);
    urls.forEach(url => (spdxURLs[url] = key));
  }
  return spdxURLs;
}, {});

export default function RdfaLicense({
  id,
  className,
  object,
  predicate = 'schema:license',
  showName,
  showIcon,
  isPrinting
}) {
  let uri = getId(object) || object.url;
  let url;
  if (/^spdx:/.test(uri)) {
    url = uri.replace(/^spdx:/, 'https://spdx.org/licenses/');
  }
  const spdxId = spdxURLs[url || uri] || unprefix(uri);

  if (!spdxId || !spdx[spdxId]) {
    return <span>Unknown license</span>;
  }
  let hasIcon = spdx[spdxId].name.indexOf('Creative Commons') !== -1;

  return (
    <a
      id={id}
      className={classNames('rdfa-license', 'value', className)}
      property={predicate}
      href={url}
      target="_blank"
      rel="license noopener"
    >
      {hasIcon && showIcon && (
        <Iconoclass
          iconName="creativeCommons"
          size={isPrinting ? '1.1em' : '1.1em'}
        />
      )}
      {showName && <abbr title={spdx[spdxId].name}>{spdxId}</abbr>}
    </a>
  );
}

RdfaLicense.defaultProps = {
  showName: true,
  showIcon: true,
  isPrinting: false
};

RdfaLicense.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  object: PropTypes.oneOfType([PropTypes.object, PropTypes.string]), // a license
  predicate: PropTypes.string,
  showName: PropTypes.bool,
  showIcon: PropTypes.bool,
  isPrinting: PropTypes.bool
};
