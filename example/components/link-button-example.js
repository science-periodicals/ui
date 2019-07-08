import React from 'react';
import { LinkButton } from '../../src/';

export default function LinkButtonExample(props) {
  return (
    <div className="example">
      <div className="example__row">
        <LinkButton
          onClick={() => console.log('LinkButton click!')}
          onBlur={() => console.log('LinkButton blur!')}
        >
          Link Button
        </LinkButton>
      </div>
      <div className="example__row">
        <span style={{ fontSize: '18px' }}>
          This is an inline <LinkButton>link</LinkButton> button.
        </span>
        <LinkButton>
          <span>Span Child</span>
        </LinkButton>
        <LinkButton className="reddish">With Class</LinkButton>
      </div>
    </div>
  );
}
