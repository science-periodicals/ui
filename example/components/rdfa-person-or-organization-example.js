import React from 'react';
import { RdfaPersonOrOrganization } from '../../src';

export default class RdfaCiteExample extends React.Component {
  render() {
    return (
      <div className="example">
        <ul>
          <li>
            <RdfaPersonOrOrganization
              object={{
                '@id': 'http://example.com/psullivan',
                '@type': 'Person',
                name: 'Prof. James P Sullivan, MD',
                givenName: 'James',
                familyName: 'Sullivan',
                additionalName: ['Peter', 'Robert'],
                honorificPrefix: 'Prof',
                honorificSuffix: 'MD'
              }}
            />
          </li>

          <li>
            <RdfaPersonOrOrganization
              object={{
                '@id': 'http://www.biology.as.nyu.edu',
                '@type': 'CollegeOrUniversity',
                name: 'Department of Biology',
                parentOrganization: {
                  '@id': 'http://www.nyu.edu',
                  '@type': 'CollegeOrUniversity',
                  name: 'New York University',
                  alternateName: 'NYU',
                  location: {
                    '@id': 'scienceai:a1be0496-870e-4fa4-832e-77bdcc49060b',
                    '@type': 'PostalAddress',
                    addressCountry: 'USA',
                    addressLocality: 'New York',
                    addressRegion: 'NY'
                  }
                }
              }}
            />
          </li>
        </ul>
      </div>
    );
  }
}
