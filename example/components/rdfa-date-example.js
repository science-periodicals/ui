import React from 'react';
import { RdfaDate } from '../../src';

export default class RdfaDateExample extends React.Component {
  render() {
    return (
      <div className="example">
        <ul>
          <li>
            <RdfaDate object="2019-05-01T06:38:49.385Z" />
          </li>
          <li>
            <RdfaDate object={{ '@type': 'xsd:gDay', '@value': 1 }} />
          </li>
          <li>
            <RdfaDate
              object={{ '@type': 'xsd:string', '@value': 'in press' }}
            />
          </li>
        </ul>
      </div>
    );
  }
}
