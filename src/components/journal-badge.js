import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import tinyColor from 'tinycolor2';
import colorHash from 'material-color-hash';
import url from 'url';
import { arrayify, textify } from '@scipe/jsonld';
import Hyperlink from './hyperlink';
import stringHash from '../utils/string-hash';

// TODO optimize

const JournalBadge = ({ size = 24, journal, name, link, className }) => {
  const journalBadgeColor = arrayify(journal && journal.style).find(
    style => style.value && style.name === '--journal-badge-color'
  );
  const journalBadgeColor2 = arrayify(journal && journal.style).find(
    style => style.value && style.name === '--journal-badge-color2'
  );
  // TODO @halmos if journalBadgeColor is defined it's an object with a value property containing the color string.

  if (!name) {
    if (journal) {
      if (typeof journal === 'string') {
        name = journal;
      } else if (journal.name || journal.alternateName) {
        name = textify(journal.name || journal.alternateName);
      } else if (journal.url) {
        name = url.parse(journal.url).hostname;
      } else {
        name = 'journal';
      }
      name = name
        .toLowerCase()
        .replace(
          /(\bproceedings\b|\bjournal\b|\bof\b|\bthe\b|\bfor\b|\band\b|\bis\b|\ba\b|\ban\b|\bto\b)/gi,
          ''
        );
      name = name.trim() || 'journal';
    } else {
      name = 'journal';
    }
  }

  let badgeColor;
  let safeName = name.replace(/\W/g, '-');

  if (journalBadgeColor && journalBadgeColor.value) {
    badgeColor = tinyColor(journalBadgeColor.value);
  } else {
    // no badge color set some come up with one on the fly.
    let hashName = name;
    let hashColor = colorHash(hashName);
    //console.log('hash ', hashColor, name, i);
    let i = 0;

    while (
      (hashColor.materialColorName == 'Grey' ||
        hashColor.materiaColorName == 'Grey') && // Note: the typo (lack of `l` is intentional as the module is currently bugged)
      i < 25
    ) {
      hashName = djb2a(hashName);
      hashColor = colorHash(hashName);
      i++;
      //console.log('hash ', hashColor, hashName, i);
    }

    badgeColor = tinyColor(hashColor.backgroundColor)
      .desaturate(40)
      .lighten(15);
  }

  let complimentColor;

  if (journalBadgeColor2 && journalBadgeColor2.value) {
    complimentColor = tinyColor(journalBadgeColor2.value).toHexString();
  } else {
    complimentColor = badgeColor.triad()[2];
  }

  const attrs = {
    className: classNames('journal-badge', className, {
      'journal-badge--link': link && journal && journal.url
    }),
    style: {
      width: size,
      height: size,
      lineHeight: 0
    }
  };

  if (link) {
    attrs.href = journal && journal.url;
  }

  const children = (
    <Fragment>
      <svg width={size} height={size} viewBox="0 0 24 24">
        <defs>
          <linearGradient
            id={`${safeName}_badgeGradient`}
            gradientTransform="rotate(45)"
          >
            <stop offset="0%" stopColor={badgeColor} />
            <stop offset="100%" stopColor={complimentColor} />
          </linearGradient>
        </defs>
        <polygon
          points="1,6 12,0 23,6 23,18 12,24 1,18"
          fill={`url(#${safeName}_badgeGradient)`}
        />
        {/*NOTE: MS Edge does not have good support for SVG text layout so we'll use html text instead. See: https://github.com/scienceai/app-suite/issues/529 */}
      </svg>
      <span className="journal-badge__text" style={{ fontSize: size / 2 }}>
        {name
          .replace(/-/g, '')
          .substr(0, 1)
          .toUpperCase()}
      </span>
    </Fragment>
  );

  return link ? (
    <Hyperlink
      page="journal"
      periodical={journal}
      title={textify(journal.name)}
      {...attrs}
    >
      {children}
    </Hyperlink>
  ) : (
    <span {...attrs}>{children}</span>
  );
};

JournalBadge.defaultProps = {
  link: true
};

JournalBadge.propTypes = {
  journal: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  name: PropTypes.string, // !! old API for backward compat only do not use for new code
  size: PropTypes.number,
  link: PropTypes.bool,
  className: PropTypes.string
};

export default JournalBadge;

/**
 * Hash function djb2a
 * This is intended to be a simple, fast hashing function using minimal code.
 * It does *not* have good cryptographic properties.
 * @param {string} str
 * @return {string} 32-bit unsigned hash of the string
 */
function djb2a(str) {
  const length = str.length;
  let hash = 5381;
  for (let i = 0; i < length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  // Convert from 32-bit signed to unsigned.
  return String(hash >>> 0);
}
