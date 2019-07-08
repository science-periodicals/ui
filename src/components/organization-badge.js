import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { textify, unprefix, getId } from '@scipe/jsonld';
import tinyColor from 'tinycolor2';
import colorHash from 'material-color-hash';

const OrganizationBadge = ({ size = 24, organization = {}, className }) => {
  const name =
    unprefix(getId(organization)) ||
    textify(organization.name) ||
    'organization';

  let safeName = name.replace(/\W/g, '-');
  let hashColor = colorHash(name);
  let i = 0;
  while (hashColor.materiaColorName == 'Grey') {
    hashColor = colorHash(`name${i}`);
    i++;
  }

  let badgeColor = tinyColor(hashColor.backgroundColor)
    .desaturate(40)
    .lighten(15);
  let complimentColor = badgeColor.triad()[2];

  const attrs = {
    className: classNames('organization-badge', className),
    style: {
      width: size,
      height: size,
      lineHeight: '24px',
      fontSize: '12px'
    }
  };

  const children = (
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
      <rect
        x="0"
        y="0"
        width="24"
        height="24"
        fill={`url(#${safeName}_badgeGradient)`}
      />
      <text
        x="50%"
        y="50%"
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {name.substr(0, 1).toUpperCase()}
      </text>
    </svg>
  );

  return <span {...attrs}>{children}</span>;
};

OrganizationBadge.propTypes = {
  organization: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  size: PropTypes.number,
  className: PropTypes.string
};

export default OrganizationBadge;
