import React from 'react';
import { PaperButtonLink } from '../../src/';

export default function PaperButtonLinkExample(props) {
  return (
    <div className="example">
      <div className="example__row">
        <PaperButtonLink href="#">Flat link</PaperButtonLink>
        <PaperButtonLink href="#" raised>
          Raised link
        </PaperButtonLink>
        <PaperButtonLink href="#" className="reddish">
          With Class
        </PaperButtonLink>
      </div>
      <div className="example__row">
        <PaperButtonLink href="#" capsule={true}>
          Capsule link
        </PaperButtonLink>
        <PaperButtonLink href="#" raised capsule={true}>
          Capsule Raised link
        </PaperButtonLink>
        <PaperButtonLink href="#" className="reddish" capsule={true}>
          With Class
        </PaperButtonLink>
      </div>
    </div>
  );
}
