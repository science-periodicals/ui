import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Iconoclass from '@scipe/iconoclass';
import Menu from '../menu/menu';
import MenuHead from '../menu/menu-head';
import MenuItem from '../menu/menu-item';
import resetSubdomain from '../../utils/reset-subdomain';

const StartMenu = ({ align, portal, className, alert, reset }) => (
  <Menu
    align={align}
    portal={portal}
    className={classNames(
      'start-menu',
      { 'start-menu--alert': alert },
      className
    )}
    iconName={alert ? 'logoSciAlt' : 'logoSci'}
    isconSize={32}
  >
    {/* <MenuHead>
      <Iconoclass
        iconName={alert ? 'logoSciAlt' : 'logoSci'}
        size="32px"
        className="start-menu__head-icon"
        round={false}
      />
    </MenuHead> */}
    {reset ? (
      <MenuItem href={resetSubdomain('/explore')}>Explore</MenuItem>
    ) : (
      <MenuItem to="/explore">Explore</MenuItem>
    )}
    <MenuItem href={resetSubdomain('/get-started')}>Get started</MenuItem>
  </Menu>
);

StartMenu.defaultProps = {
  align: 'right',
  appLinks: {},
  alert: true,
  portal: true
};

StartMenu.propTypes = {
  align: PropTypes.oneOf(['left', 'right']),
  portal: PropTypes.bool,
  alert: PropTypes.bool,
  className: PropTypes.string,
  reset: PropTypes.bool // call reset subdomain on links
};

export default StartMenu;
