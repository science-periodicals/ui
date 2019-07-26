import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Menu from '../menu/menu';
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
    {reset ? (
      <MenuItem href={resetSubdomain('/explore/journals')}>
        Explore Journals
      </MenuItem>
    ) : (
      <MenuItem to="/explore/journals">Explore Journals</MenuItem>
    )}

    {reset ? (
      <MenuItem href={resetSubdomain('/explore/articles')}>
        Explore Articles
      </MenuItem>
    ) : (
      <MenuItem to="/explore/articles">Explore Articles</MenuItem>
    )}

    {reset ? (
      <MenuItem href={resetSubdomain('/explore/rfas')}>Explore RFAs</MenuItem>
    ) : (
      <MenuItem to="/explore/rfas">Explore RFAs</MenuItem>
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
