import React from 'react';
import { ErrorCard } from '../../src/';

export default function ErrorCardExample(props) {
  return (
    <div>
      <ErrorCard
        error={{
          description: {
            '@type': 'rdf:HTML',
            '@value': '<strong>not</strong> found'
          },
          statusCode: 400
        }}
      />
    </div>
  );
}
