import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Iconoclass from '@scipe/iconoclass';
import ldstars from '../utils/ld-stars';

// see http://5stardata.info/en/
const fiveStarLinkedData = [
  { name: 'ol', description: 'Open Licence' },
  { name: 're', description: 'Machine Readable' },
  { name: 'of', description: 'Open Format' },
  { name: 'uri', description: 'Web identifiers' },
  { name: 'ld', description: 'Linked Data' }
];

export default class RatingDots extends Component {
  static propTypes = {
    resource: PropTypes.object.isRequired
  };

  render() {
    const { resource } = this.props;

    const rating = ldstars(resource);

    return (
      <div className="rating-dots">
        {fiveStarLinkedData.map(star => (
          <div
            key={star.name}
            title={star.description}
            className={
              'rating-dots__placeholder ' + (rating[star.name] ? 'on' : 'off')
            }
          >
            <div className="rating-dots__star">
              <div className="rating-dots__star__svg">
                <Iconoclass iconSize={16} iconName="star" />
              </div>
            </div>
            <div className="rating-dots__dot">
              <div className="dot__ld-name">{star.name}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}
