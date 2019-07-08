import React from 'react';
import { Logo } from '../../src/';

export default function LogoExample(props) {
  return (
    <div className="example">
      <div>
        <Logo />
      </div>
      <div>
        <Logo logo="sci.pe" />
      </div>
      <div>
        <Logo logo="sci.pe" theme="alt" />
      </div>
      <div style={{ backgroundColor: 'grey' }}>
        <Logo logo="sci.pe" theme="dark" />
      </div>
    </div>
  );
}
