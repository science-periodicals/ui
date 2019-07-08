/* eslint no-alert: 0 */

import React from 'react';
import Iconoclass from '@scipe/iconoclass';
import { PaperButton } from '../../src/';

export default function PaperButtonExample(props) {
  return (
    <div className="example">
      <div className="example__row">
        <PaperButton onClick={() => alert('basic')}>Flat Button</PaperButton>
        <PaperButton onClick={() => alert('classy')} className="reddish">
          <span>Add</span>
        </PaperButton>
        <PaperButton onClick={() => alert('never see this')} disabled>
          Disabled Button
        </PaperButton>
      </div>
      <div className="example__row">
        <PaperButton onClick={() => alert('never see this')} raised>
          <Iconoclass iconName="star" />Raised Button
        </PaperButton>
        <PaperButton onClick={() => alert('never see this')} raised>
          <span>Raised Button</span>
        </PaperButton>
        <PaperButton onClick={() => alert('never see this')} raised disabled>
          Disabled Raised Button
        </PaperButton>
      </div>
      <div className="example__row">
        <PaperButton onClick={() => alert('never see this')} capsule>
          <Iconoclass iconName="star" />Capsule Button
        </PaperButton>
        <PaperButton onClick={() => alert('never see this')} capsule raised>
          <Iconoclass iconName="eye" size={'20px'} />
          <span style={{ paddingLeft: '8px' }}>Raised Capsule Button</span>
        </PaperButton>
        <PaperButton onClick={() => alert('never see this')} capsule disabled>
          Disabled Capsule Button
        </PaperButton>
      </div>
    </div>
  );
}
