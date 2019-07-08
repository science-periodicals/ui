import React from 'react';
import { ContactPointPicker } from '../../src/';

export default function ContactPointPickerExample(props) {
  const roles = [
    {
      '@id': 'role:1',
      '@type': 'ContributorRole',
      roleName: 'editor',
      name: 'editorial office',
      description: 'Send me manuscript about X',
      about: [
        {
          '@id': 'http://ns.nature.com/subjects/biological-sciences',
          name: 'Biological sciences'
        },
        {
          '@id': 'http://ns.nature.com/subjects/biochemistry',
          name: 'Biochemistry'
        }
      ],
      editor: {
        '@id': 'user:peter',
        '@type': 'Person',
        name: 'Peter',
        description: 'Profile bio'
      },
      roleContactPoint: {
        '@type': 'ContactPoint',
        email: 'mailto:peter@example.com'
      }
    },

    {
      '@id': 'role:2',
      '@type': 'ContributorRole',
      roleName: 'editor',
      name: 'editorial office',
      description: 'Send me manuscript about Y',
      editor: {
        '@id': 'user:lea',
        '@type': 'Person',
        name: 'Lea',
        description: 'Profile bio'
      },
      roleContactPoint: {
        '@type': 'ContactPoint',
        email: 'mailto:lea@example.com'
      }
    }
  ];

  return (
    <div className="example">
      <ContactPointPicker
        roles={roles}
        onChange={value => console.log(value)}
      />
    </div>
  );
}
