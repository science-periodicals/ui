/* eslint no-alert: 0 */

import React from 'react';
import capitalize from 'lodash/capitalize';
import { UserBadge, UserBadgeMenu, MenuItem } from '../../src/';

export default function PaperButtonExample(props) {
  return (
    <div className="example">
      <div className="example__row">
        <span>Users</span>
        <UserBadge userId="user:charles" size={24} />
        <UserBadge userId="user:ada" size={24} />
        <UserBadge userId="user:tiffany" size={24} />
        <UserBadge userId="user:erik" size={24} />
        <UserBadge size={24} />
        <UserBadge size={24} />
      </div>

      {['author', 'editor', 'reviewer', 'producer'].map(roleName => (
        <div key={roleName} className="example__row">
          <span>{roleName}s</span>
          <UserBadgeMenu
            userId="user:charles"
            name="Charles Babadge"
            align="left"
            size={24}
            roleName={roleName}
          >
            <MenuItem onClick={() => console.log('example menu click')}>
              24px Left Menu
            </MenuItem>
          </UserBadgeMenu>

          <UserBadgeMenu
            userId="user:ada"
            name="Ada Lovelace"
            align="right"
            size={24}
            roleName={roleName}
          >
            <MenuItem>24px Portal Right Menu</MenuItem>
          </UserBadgeMenu>

          <UserBadgeMenu
            userId="user:tiffany"
            name="Tiffany"
            align="right"
            size={24}
            roleName={roleName}
          >
            <MenuItem>24px Portal Right Menu</MenuItem>
          </UserBadgeMenu>

          <UserBadgeMenu
            userId="user:erik"
            name="Erik"
            align="right"
            size={24}
            roleName={roleName}
          >
            <MenuItem>24px Portal Right Menu</MenuItem>
          </UserBadgeMenu>

          <UserBadgeMenu
            size={24}
            userId="user:anon"
            name={`anonymous ${roleName} 1`}
            anonymous={true}
            userBadgeLabel={roleName.charAt(0).toUpperCase() + '1'}
            roleName={roleName}
          />

          <UserBadgeMenu
            name={`${capitalize(roleName)}s`}
            align="right"
            size={24}
            roleName={roleName}
            iconName={`role${capitalize(roleName)}Group`}
          >
            <MenuItem>24px Portal Right Menu</MenuItem>
          </UserBadgeMenu>
        </div>
      ))}

      <div className="example__row">
        <UserBadgeMenu username="Alan Turing" align="left">
          <MenuItem onClick={() => console.log('example menu click')}>
            Left Menu Item One
          </MenuItem>
        </UserBadgeMenu>
        <UserBadgeMenu
          iconName="personWarning"
          userId="user:alan"
          name="Alan Turing"
          align="left"
        >
          <MenuItem onClick={() => console.log('example menu click')}>
            Left Menu Item One
          </MenuItem>
        </UserBadgeMenu>
        <UserBadgeMenu
          iconName="personWarning"
          name="Hearbeat"
          align="left"
          heartbeat={true}
        >
          <MenuItem onClick={() => console.log('example menu click')}>
            Left Menu Item One
          </MenuItem>
        </UserBadgeMenu>
        <UserBadgeMenu name="spin up" align="right" progressMode="spinUp">
          <MenuItem> Right Menu</MenuItem>
        </UserBadgeMenu>

        <UserBadgeMenu
          size={24}
          userId="user:peter"
          queued={true}
          roleName="reviewer"
        />

        <UserBadgeMenu username="Charles Babadge" align="left" size={24}>
          <MenuItem onClick={() => console.log('example menu click')}>
            24px Left Menu
          </MenuItem>
        </UserBadgeMenu>
        <UserBadgeMenu
          username="Ada Lovelace"
          align="right"
          portal={true}
          size={24}
          statusIconName="2"
        >
          <MenuItem>24px Portal Right Menu</MenuItem>
        </UserBadgeMenu>
        <UserBadgeMenu
          username="Ada Lovelace"
          align="right"
          portal={true}
          size={24}
          statusIconName="lock"
        >
          <MenuItem>24px Portal Right Menu</MenuItem>
        </UserBadgeMenu>

        <UserBadgeMenu size={24} username="peter" iconName="personWarning" />

        <UserBadgeMenu size={24} roleName="editor" />
      </div>
    </div>
  );
}
