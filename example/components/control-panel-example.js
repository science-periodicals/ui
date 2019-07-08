import React from 'react';
import { Card, ControlPanel, PaperButton } from '../../src/';

export default function ControlPanelExample(props) {
  return (
    <div className="example">
      <ControlPanel error={new Error('error message')}>
        <PaperButton>Control 1</PaperButton>
        <PaperButton>Control 2</PaperButton>
      </ControlPanel>
    </div>
  );
}
