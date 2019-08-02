/* eslint no-alert: 0 */

import React from 'react';
import { Menu, MenuItem, MenuCardItem, UserContactSheet } from '../../src/';
import role from '../../test/fixtures/role';

export default function MenuExample(props) {
  return (
    <div
      className="example reverse-z-index"
      style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
    >
      <div className="example__row" style={{ background: 'grey' }}>
        <Menu title="Left Menu" align="right" className="testClass">
          <MenuItem onClick={() => console.log('example menu click')}>
            Left Menu Item One
          </MenuItem>
          <MenuItem>Two</MenuItem>
        </Menu>
        <Menu align="left">
          <MenuItem>Right Menu Item One</MenuItem>
          <MenuItem icon={{ iconName: 'add' }}>Right Menu Item Two</MenuItem>
        </Menu>
      </div>
      <div className="example__row">
        <Menu title="Card Menu" align="left" icon="personRound" iconSize={16}>
          <MenuCardItem>
            <UserContactSheet role={role} />
          </MenuCardItem>
        </Menu>
        <Menu align="right" icon="personRound" iconSize={32} title="Big Icon">
          <MenuCardItem>
            <UserContactSheet role={role} />
          </MenuCardItem>
        </Menu>
      </div>
      <div className="example__row">
        <div
          id="portal-parent"
          style={{ border: '1px solid whitesmoke', position: 'relative' }}
        >
          <Menu
            title="Right Align Portal"
            align="right"
            portal={true}
            portalProps={{
              parentID: 'portal-parent',
              position: 'absoluteRelative'
            }}
          >
            <MenuItem onClick={() => console.log('example menu click')}>
              Left Menu Item One with long line
            </MenuItem>
          </Menu>
        </div>
        <Menu
          title="Left Align Portal"
          align="left"
          portal={true}
          className="text-class"
        >
          <MenuItem>Right Menu Item One long</MenuItem>
          <MenuItem>Right Menu Item Two </MenuItem>
          <MenuItem>Three </MenuItem>
        </Menu>
      </div>
      <div className="example__row">
        <div
          id="portal-parent"
          style={{ border: '1px solid whitesmoke', position: 'relative' }}
        >
          <Menu
            title="Test OnClick MenuItem"
            align="right"
            portal={true}
            portalProps={{
              parentID: 'portal-parent',
              position: 'absoluteRelative'
            }}
          >
            <MenuItem onClick={() => console.log('example menu click')}>
              onClick MenuItem
            </MenuItem>
          </Menu>
        </div>
        <Menu
          title="Test Link MenuItem"
          align="left"
          portal={true}
          className="text-class"
        >
          <MenuItem href="#test">Test href</MenuItem>
          <MenuItem>Right Menu Item Two </MenuItem>
          <MenuItem>Three </MenuItem>
        </Menu>
      </div>
      <div style={{ paddingTop: '500px' }}>
        <a id="test">Test Acnhor </a>
      </div>
    </div>
  );
}
