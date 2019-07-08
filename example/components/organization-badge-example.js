import React from 'react';
import { OrganizationBadge } from '../../src/';

export default function OrganizationBadgeExample(props) {
  return (
    <div className="example">
      <div className="example__row">
        <OrganizationBadge
          organization={{
            name: 'organization name'
          }}
        />
        <OrganizationBadge
          organization={{
            name: 'N journal name'
          }}
        />
        <OrganizationBadge
          organization={{
            name: 'Qjournal name'
          }}
          size={32}
        />
        <OrganizationBadge
          organization={{
            name: 'T journal name'
          }}
          size={40}
        />
      </div>
    </div>
  );
}
