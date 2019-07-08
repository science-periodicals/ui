import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import noop from 'lodash/noop';
import Iconoclass from '@scipe/iconoclass';
import Hyperlink from './hyperlink';
import UserBadgeMenu from './user-badge-menu';
import Breadcrumb from './breadcrumb';
import resetSubdomain from '../utils/reset-subdomain';
import StartMenu from './start-menu/start-menu';
import Menu from './menu/menu';
import MenuItem, { MenuItemLabel } from './menu/menu-item';
import ResponsiveHeaderMenu from './responsive-header-menu';
import ResponsiveHeaderItem from './responsive-header-item';
import Logo from './logo';
import { typesMatch } from '../utils/react-children-utils';

function mobilizeChildren(children) {
  let menuResult = [];
  React.Children.forEach(children, (child, i) => {
    if (typesMatch(child, ResponsiveHeaderItem) && child.props.children) {
      let items = mobilizeHeaderItem(child, i);
      // console.log('items', items);
      menuResult.push(items);
    } else if (
      typesMatch(child, ResponsiveHeaderMenu) &&
      child.props.children
    ) {
      let menus = mobilizeHeaderMenu(child, i);
      // console.log('menus', menus);
      menuResult = menuResult.concat(menus);
    }
  });
  // console.log('mobilizeChildren', menuResult);
  return menuResult;
}

function mobilizeHeaderItem(el, i) {
  let { children } = el.props;
  let child = React.Children.only(children);

  return <MenuItem key={`mobileHeaderItem_${i}`}>{child}</MenuItem>;
}

function mobilizeHeaderMenu(el, pos) {
  let menuItems = [];

  React.Children.forEach(el.props.children, (menuEl, j) => {
    // console.log('menuEL ', menuEl);
    if (typesMatch(menuEl, MenuItem)) {
      let myProps = {
        key: `mobileMenuItem_${j}_${pos}`,
        divider: j === 0
      };
      menuItems.push(React.cloneElement(menuEl, myProps));
    }
  });
  return menuItems;
}

function headerMenusToMenus(children) {
  return React.Children.map(children, (child, i) => {
    if (typesMatch(child, ResponsiveHeaderMenu) && child.props.children) {
      let otherProps = Object.assign({}, child.props, { children: undefined });
      let menuItems = React.Children.map(child.props.children, (subChild, j) =>
        React.cloneElement(subChild, { key: `menuItem_${i}_${j}` })
      );
      return (
        <div className="header__responsive-menu">
          <Menu {...otherProps} portal={true}>
            {menuItems}
          </Menu>
        </div>
      );
    } else {
      return child;
    }
  });
}

export default class Header extends Component {
  static propTypes = {
    product: PropTypes.oneOf(['dispatcher', 'publisher', 'sifter', 'reader']),
    onClickHamburger: PropTypes.func,
    showHamburger: PropTypes.bool,
    userBadgeMenu: PropTypes.any,
    userBadge: PropTypes.shape({
      // pass userBadgeMenu as props if you need more control
      userId: PropTypes.string,
      roleName: PropTypes.string,
      progress: PropTypes.number,
      progressMode: PropTypes.oneOf([
        'up',
        'down',
        'spinUp',
        'spinDown',
        'bounce',
        'none'
      ]),
      statusIconName: PropTypes.string
    }),
    showHome: PropTypes.bool,
    homeLink: PropTypes.object,
    // props to pass to <Logo />
    logo: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.arrayOf(PropTypes.object)
    ]),
    logoLink: PropTypes.object,
    loginLink: PropTypes.object,
    registerLink: PropTypes.object,
    fixed: PropTypes.bool,
    // props to pass to <Breadcrumb />
    crumbs: PropTypes.oneOfType([
      PropTypes.arrayOf(
        PropTypes.shape({
          to: PropTypes.any,
          page: PropTypes.string,
          children: PropTypes.any,
          query: PropTypes.object
          // any other prop needed by Hyperlink (graph, periodical ...)
        })
      ),
      PropTypes.arrayOf(
        PropTypes.shape({
          href: PropTypes.string,
          page: PropTypes.string,
          children: PropTypes.any,
          query: PropTypes.object
          // any other prop needed by Hyperlink (graph, periodical ...)
        })
      )
    ]),
    className: PropTypes.string,
    sideBarIcon: PropTypes.bool,
    children: PropTypes.node,
    status: PropTypes.string,
    statusMessage: PropTypes.string,
    startMenu: PropTypes.node
  };

  static defaultProps = {
    showHome: true,
    fixed: true,
    homeLink: {
      href: '/'
    },
    logoLink: {
      href: resetSubdomain('/')
    },
    loginLink: {
      href: resetSubdomain('/login')
    },
    registerLink: {
      href: resetSubdomain('/register')
    },
    showHamburger: false,
    onClickHamburger: noop,
    statusMessage: ''
  };

  render() {
    let {
      logo,
      logoLink,
      loginLink,
      registerLink,
      userBadgeMenu,
      userBadge,
      product,
      crumbs,
      showHome,
      homeLink,
      fixed,
      sideBarIcon,
      className,
      children,
      status,
      statusMessage,
      startMenu
    } = this.props;

    let mobileChildren = mobilizeChildren(children);
    let transformedChildren = headerMenusToMenus(children);

    let statusIconName;

    switch (status) {
      case 'warning':
      case 'error':
        statusIconName = 'warningTriangle';
        break;
    }

    // pass userBadgeMenu as props if you need more control
    if (!userBadgeMenu && userBadge && userBadge.userId) {
      userBadgeMenu = (
        <UserBadgeMenu {...userBadge} portal={true} size={32}>
          <MenuItem href={resetSubdomain(userBadge.dashboardLink || '/')}>
            Dashboard
          </MenuItem>
          <MenuItem
            href={resetSubdomain(userBadge.profileLink || '/settings/profile')}
          >
            Profile
          </MenuItem>
          <MenuItem
            href={resetSubdomain('/logout')}
            onClick={userBadge.onClickLogout}
          >
            Logout
          </MenuItem>
        </UserBadgeMenu>
      );
    }

    return (
      <div
        className={classNames('header', className, {
          'header--unfixed': !fixed,
          'header--side-bar-icon': sideBarIcon,
          ['header--' + status]: status
        })}
      >
        <div className="header__left">
          {this.props.showHamburger && (
            <div className={'header__hamburger'}>
              <Iconoclass
                iconName="menu"
                behavior="button"
                tagName="button"
                onClick={this.props.onClickHamburger}
              />
            </div>
          )}
          <div
            className={`header__branding-box ${
              crumbs || product
                ? 'header__branding-box--should-hide'
                : 'header__branding-box--should-not-hide'
            }`}
          >
            <Hyperlink {...logoLink}>
              <Logo className="header__logo" logo={logo} />
            </Hyperlink>
          </div>
          {product && (
            <div className="header__branding-box">
              <div className="branding-box__product-logo">
                <img
                  src={resetSubdomain(
                    `/images/product-logos_1.6.0_${product}_red_h_min.svg`
                  )}
                  alt={`${product} logo`}
                />
              </div>
            </div>
          )}
          {(crumbs || showHome) && (
            <Breadcrumb crumbs={crumbs} showHome={showHome} homeLink={homeLink}>
              {status && statusMessage && (
                <Menu
                  icon={statusIconName}
                  portal={true}
                  align="right"
                  iconSize={18}
                  className="header__status-icon"
                >
                  <MenuItemLabel>{statusMessage}</MenuItemLabel>
                </Menu>
              )}
            </Breadcrumb>
          )}
        </div>
        <div className="header__right">
          {transformedChildren}

          {userBadgeMenu ? (
            <div className="header__right-menus">
              {startMenu ? startMenu : null}
              <div className="header__account header__account--badge">
                {userBadgeMenu}
              </div>
              {!!(mobileChildren && mobileChildren.length) && (
                <div className="header__mobile-menu">
                  <Menu align="right" portal={true} maxHeight="600px">
                    {mobileChildren}
                  </Menu>
                </div>
              )}
            </div>
          ) : (
            <div className="header__account header__account--no-badge">
              {startMenu ? startMenu : null}
              <div className="header__mobile-menu">
                <Menu align="right" portal={true} maxHeight="600px">
                  <MenuItem {...loginLink}>Log in</MenuItem>
                  <MenuItem {...registerLink}>Register</MenuItem>
                  {mobileChildren}
                </Menu>
              </div>
              <ul className="login-sign-up">
                <li>
                  <Hyperlink {...loginLink}>Login</Hyperlink>
                </li>
                <li>
                  <Hyperlink {...registerLink}>Register</Hyperlink>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }
}
