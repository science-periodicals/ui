import React from 'react';
import PropTypes from 'prop-types';
import Menu from './menu/menu';
import MenuItem from './menu/menu-item';

const AppMenu = ({ children, appLinks, align, portal }) => (
  <Menu align={align} portal={portal}>
    {['Publisher', 'Reader', 'Dispatcher', 'Sifter']
      .filter(app => appLinks[app.toLowerCase()])
      .map(app => (
        <MenuItem
          key={app}
          icon={{ color: '#9e9e9e', iconName: app.toLowerCase() }}
          to={appLinks[app.toLowerCase()]}
        >
          {app}
        </MenuItem>
      ))}
    {children}
  </Menu>
);
AppMenu.defaultProps = {
  align: 'left',
  noPosition: false,
  appLinks: {}
};
const { object, bool, node, oneOf } = PropTypes;
AppMenu.propTypes = {
  appLinks: object,
  align: oneOf(['left', 'right']),
  children: node,
  portal: bool
};
export default AppMenu;
