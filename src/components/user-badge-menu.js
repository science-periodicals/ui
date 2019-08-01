import React from 'react';
import PropTypes from 'prop-types';
import Iconoclass from '@scipe/iconoclass';
import { arrayify, unprefix } from '@scipe/jsonld';
import UserBadge from './user-badge';
import Menu from './menu/menu';
import MenuItem from './menu/menu-item';
import classNames from 'classnames';
import resetSubdomain from '../utils/reset-subdomain';
import BemTags from '../utils/bem-tags';

export default class UserBadgeMenu extends React.Component {
  static propTypes = {
    'data-testid': PropTypes.string,
    userId: PropTypes.string, // undefined for anonymous users
    name: PropTypes.string, // the display name (if omitted will be generated from `userId`, `roleName` and `subRoleName(s)`

    userBadgeLabel: PropTypes.string,
    iconName: PropTypes.string,
    statusIconName: PropTypes.string,
    roleName: PropTypes.oneOf([
      'admin',
      'user',
      'author',
      'editor',
      'producer',
      'reviewer',
      'authors',
      'administrator',
      'editors',
      'producers',
      'reviewers',
      'subscriber',
      'member',
      'assigner',
      'public',
      'customer',
      'vendor'
    ]),
    subRoleName: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
    subRoleNames: PropTypes.oneOfType([PropTypes.array, PropTypes.string]), // alias for subRoleName
    required: PropTypes.bool,
    isRoleNameRequired: PropTypes.bool,
    progress: PropTypes.number /* a number between 0 and 100) */,
    anonymous: PropTypes.bool,
    progressMode: PropTypes.oneOf([
      'up',
      'down',
      'spinUp',
      'spinDown',
      'bounce',
      'none'
    ]),
    heartbeat: PropTypes.bool,
    color: PropTypes.string,
    portal: PropTypes.bool,
    children: PropTypes.node,
    align: PropTypes.oneOf(['left', 'right']),
    size: PropTypes.number,
    disabled: PropTypes.bool,
    displayName: PropTypes.bool, // should we display the name
    displayRoleName: PropTypes.bool, // should we display the roleName
    queued: PropTypes.bool,
    className: PropTypes.string,
    forceResetSubdomain: PropTypes.bool
  };

  static defaultProps = {
    portal: true,
    align: 'right',
    disabled: false,
    size: 32,
    displayName: true,
    displayRoleName: true,
    queued: false,
    iconName: 'none',
    anonymous: false,
    heartbeat: false
  };

  render() {
    let {
      color,
      userId,
      name,
      displayName,
      disabled,
      subRoleNames,
      subRoleName,
      size,
      children,
      align,
      portal,
      roleName,
      displayRoleName,
      iconName,
      statusIconName,
      className,
      queued,
      forceResetSubdomain
    } = this.props;

    if (!color && !userId) {
      color = 'lightgrey';
    }

    const _roleName =
      roleName === 'editor' ||
      roleName === 'producer' ||
      roleName === 'author' ||
      roleName === 'reviewer' ||
      roleName === 'editors' ||
      roleName === 'producers' ||
      roleName === 'authors' ||
      roleName === 'reviewers'
        ? roleName
        : undefined;

    subRoleNames = arrayify(subRoleName || subRoleNames);

    let menuClass = '';
    if (className) {
      let menuBem = BemTags(`${className.trim()}`);
      menuClass = menuBem`__menu`;
    }

    let title;
    if ((userId || name) && displayName) {
      if (name) {
        title = name;
      } else if (userId) {
        title = unprefix(userId);

        if (displayRoleName && (!!_roleName || subRoleNames.length)) {
          if (subRoleNames.length) {
            title += ` (${subRoleNames.join(', ')})`;
          } else {
            title += ` (${_roleName})`;
          }
        }
      }
    }

    const linkProps = {};
    if (userId && userId.startsWith('user:')) {
      if (forceResetSubdomain) {
        linkProps.href = resetSubdomain(`/about/${unprefix(userId)}`);
      } else {
        linkProps.to = { pathname: `/about/${unprefix(userId)}` };
      }
    }

    const hasMenu = !!(children || title);

    const bem = BemTags();

    return (
      <div
        data-testid={this.props['data-testid']}
        className={classNames(
          bem`user-badge-menu --${disabled ? 'disabled' : 'enabled'}`,
          className
        )}
        style={size && { width: size, height: size }}
      >
        <div className={bem`__head`}>
          <UserBadge
            {...this.props}
            menu={hasMenu}
            userId={userId}
            color={color}
            iconName={iconName}
            queued={queued}
          />
        </div>
        {hasMenu && (
          <Menu
            iconName={iconName}
            iconSize={size * 0.66}
            align={align}
            portal={portal}
            className={menuClass}
          >
            {!!title && (
              <MenuItem
                {...linkProps}
                disabled={!userId || !userId.startsWith('user:')}
                iconName={
                  userId && userId.startsWith('user:')
                    ? 'personOutline'
                    : userId && userId.startsWith('anon:')
                    ? 'anonymous'
                    : undefined
                }
              >
                {title}
              </MenuItem>
            )}

            {!!children && !!title && <MenuItem divider={true} />}
            {children}
          </Menu>
        )}
        {!!statusIconName && (
          <Iconoclass
            iconName={statusIconName}
            size={'14px'}
            className="user-badge-menu__status-icon"
            round={true}
          />
        )}
      </div>
    );
  }
}
