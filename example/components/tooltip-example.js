import React from 'react';
import { Tooltip, TooltipContent } from '../../src/';
import Iconoclass from '@scipe/iconoclass';

export default function TooltipExample(props) {
  return (
    <div className="example">
      <div className="example__row">
        <Tooltip displayText="Primary Resource">
          <Iconoclass iconName="home" round={true} behavior="button" />
        </Tooltip>
        <Tooltip
          id="test-id"
          wrap={true}
          displayText="Primary Resource with wrap set to true and a longer text for demonstration."
        >
          <Iconoclass iconName="home" round={true} behavior="button" />
        </Tooltip>
        <Tooltip
          wrap={true}
          displayText="Primary Resource with wrap set to true and a longer text for demonstration."
        >
          <Iconoclass iconName="home" round={true} behavior="button" />
          <TooltipContent>
            <br />
            <Iconoclass iconName="info" size="18px" />
            This is a test of{' '}
            <span style={{ fontWeight: 'bold' }}>TooltipContent</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
