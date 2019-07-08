import React from 'react';
import { RatingDots } from '../../src/';

export default function RatingDotsExample() {
  const resource = {
    '@id': '_:id',
    '@type': 'Dataset'
  };
  return (
    <div className="example">
      <RatingDots resource={resource} />
    </div>
  );
}
