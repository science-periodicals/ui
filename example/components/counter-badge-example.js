import React from 'react';
import { CounterBadge } from '../../src/';
import Iconoclass from '@scipe/iconoclass';

export default function CounterBadgeExample(props) {
  return (
    <div className="example">
      <div className="example__row">
        <CounterBadge count={55}>
          <Iconoclass iconName="person" />
        </CounterBadge>
      </div>
    </div>
  );
}
