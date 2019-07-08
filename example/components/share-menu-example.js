import React from 'react';
import { ShareMenu } from '../../src/';

export default function ShareMenuExample() {
  let testIcon = (
    <div style={{ width: '20px', height: '20px', backgroundColor: 'grey' }} />
  );
  let longText = 'This is looooong!!!!'.repeat(20);
  return (
    <div className="example">
      <div className="example__row">
        <ShareMenu url="http://berjon.com/" text="A Wonderful Site" />
      </div>
      <div className="example__row">
        <ShareMenu
          align="right"
          icon={testIcon}
          url="http://berjon.com/"
          text={longText}
          portal={true}
        />
      </div>
    </div>
  );
}
