import React from 'react';
import { Helptip } from '../../src/';
import Iconoclass from '@scipe/iconoclass';

export default function HelptipExample(props) {
  return (
    <div className="example">
      <div className="example__row">
        <span>
          Something Complex Needs some explanation Here
          <Helptip>
            This is the child content. With some helpful information.
          </Helptip>
        </span>
      </div>
    </div>
  );
}
