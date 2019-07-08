import React from 'react';
import { TextLogo } from '../../src';

export default function TextLogoExample(props) {
  return (
    <div className="example">
      <div className="example__row">
        <span>
          Text logo in text <TextLogo />{' '}
        </span>
        <span style={{ font: '16px/24px serif' }}>
          Text logo in span with serif text <TextLogo />. the logo font should
          be enherited.
        </span>
        <span style={{ font: '16px/24px sans-serif', color: 'grey' }}>
          Text logo <TextLogo /> in middle of grey sans-serif span
        </span>
      </div>
      <div className="example__row" style={{ fontSize: '20px' }}>
        <span>
          Text logo in text <TextLogo />{' '}
        </span>
        <span style={{ font: '20px/24px serif' }}>
          Text logo in span with serif text <TextLogo />. the logo font should
          be enherited.
        </span>
        <span style={{ font: '16px/24px sans-serif', color: 'grey' }}>
          Text logo <TextLogo /> in middle of grey sans-serif span
        </span>
        <span style={{ font: '16px/24px sans-serif', color: 'grey' }}>
          <TextLogo cap={true} /> At the start with cap={true} prop
        </span>
      </div>
    </div>
  );
}
