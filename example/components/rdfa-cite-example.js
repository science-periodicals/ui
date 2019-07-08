import React from 'react';
import { RdfaCite } from '../../src';

export default class RdfaCiteExample extends React.Component {
  render() {
    return (
      <div className="example">
        <ul>
          <li>
            <RdfaCite
              object={{
                '@id': 'scienceai:table',
                '@type': 'Table',
                alternateName: 'table 1',
                caption: 'Caption text',
                resourceOf: 'scienceai:graphId@graph'
              }}
              graphId="scienceai:graphId@graph"
            />
          </li>
          <li>
            <RdfaCite
              object={{
                '@id': 'scienceai:article',
                '@type': 'ScholarlyArtice',
                datePublished: new Date().toISOString(),
                author: {
                  '@type': 'Person',
                  name: 'Dr. Tiffany Bogich',
                  givenName: 'Tiffany',
                  familyName: 'Bogich'
                }
              }}
            />
          </li>

          <li>
            <RdfaCite
              object={{
                '@id': 'scienceai:article',
                '@type': 'ScholarlyArtice',
                name: 'On the effect of X on Y'
              }}
            />
          </li>

          <li>
            <RdfaCite
              object={{
                '@id': 'scienceai:article',
                '@type': 'ScholarlyArtice'
              }}
            />
          </li>
        </ul>
      </div>
    );
  }
}
