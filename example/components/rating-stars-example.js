import React from 'react';
import { RatingStars } from '../../src/';

export default function RatingStarsExample() {
  return (
    <div className="example">
      <ul>
        <li>
          <RatingStars
            rating={{
              '@type': 'Rating',
              bestRating: 5,
              ratingValue: 4,
              worstRating: 1
            }}
            onChange={val => console.log('onChange rating: ', val)}
          />
        </li>
        <li>
          <RatingStars
            rating={{
              '@type': 'Rating',
              bestRating: 5,
              ratingValue: 2,
              worstRating: 1
            }}
            readOnly={true}
          />
        </li>
      </ul>
    </div>
  );
}
