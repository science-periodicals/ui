import React from 'react';
import Iconoclass from '@scipe/iconoclass';
import { ButtonMenu, MenuItem } from '../../src/';

export default function ButtonMenuExample(props) {
  return (
    <div className="example">
      <div className="example__row">
        <h3>Button Menu</h3>
      </div>
      <div className="example__row">
        <ButtonMenu>
          <span>Flat Button Menu...</span>
          <MenuItem>Hello World</MenuItem>
          <MenuItem>Hello World 2</MenuItem>
        </ButtonMenu>
        <ButtonMenu disabled={true}>
          <span>Disabled Flat Button Menu...</span>
          <MenuItem>Hello World</MenuItem>
        </ButtonMenu>
      </div>
      <div className="example__row">
        <ButtonMenu raised={true}>
          <span>Raised Menu Button...</span>
          <MenuItem>Hello World</MenuItem>
        </ButtonMenu>
        <ButtonMenu raised={true} disabled={true}>
          <span>Disabled Raised Menu Button...</span>
          <MenuItem>Hello World</MenuItem>
        </ButtonMenu>
      </div>
      <div className="example__row">
        <ButtonMenu raised={true} capsule={true}>
          <span>Raised Capsule...</span>
          <MenuItem>Hello World</MenuItem>
        </ButtonMenu>

        <ButtonMenu raised={true} disabled={true} capsule={true}>
          <span>Disabled Raised Capsule...</span>
          <MenuItem>Hello World</MenuItem>
        </ButtonMenu>
      </div>
      <div className="example__row">
        <ButtonMenu raised={false} capsule={true}>
          <span>Flat Capsule...</span>
          <MenuItem>Hello World</MenuItem>
        </ButtonMenu>

        <ButtonMenu raised={false} disabled={true} capsule={true}>
          <span>Disabled Flat Capsule...</span>
          <MenuItem>Hello World</MenuItem>
        </ButtonMenu>
      </div>
    </div>
  );
}
