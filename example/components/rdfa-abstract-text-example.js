import React from 'react';
import { RdfaAbstractText } from '../../src';

export default class RdfaAbstractTextExample extends React.Component {
  render() {
    const abstract = {
      text: {
        '@type': 'rdf:HTML',
        '@value': `<p><h2>MY Title Is Here?</h2>We analyzed a database of mammal-virus associations to ask whether
    zoonotic disease surveillance targeting diseased animals is the best
    strategy to identify potentially zoonotic pathogens.
    <img width="940px" height="200px" border="2px">
    <ul>
      <li>This is a list item</li>
      <li>It happens all the time</li>
    </ul>
    Though a mixed
    healthy and diseased surveillance <img width="240px" height="100px" border="2px">strategy is generally best,
    surveillance of apparently healthy bats and rodents would likely
    maximize discovery potential for most zoonotic viruses.
    <ol>
      <li>This is a list item</li>
      <li>It happens all the time</li>
    </ol>

    </p>`
      }
    };

    return (
      <div className="example">
        something here?
        <RdfaAbstractText object={abstract} />
      </div>
    );
  }
}
