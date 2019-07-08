import React from 'react';
import PropTypes from 'prop-types';
import tinyColor from 'tinycolor2';
import colorHash from 'material-color-hash';
import Iconoclass from '@scipe/iconoclass';
import { unprefix } from '@scipe/jsonld';
import Spinner from './spinner';

export default class UserBadge extends React.Component {
  static propTypes = {
    menu: PropTypes.bool,
    userId: PropTypes.string,
    color: PropTypes.string,
    iconName: PropTypes.string,
    required: PropTypes.bool,
    isRoleNameRequired: PropTypes.bool,
    anonymous: PropTypes.bool,
    userBadgeLabel: PropTypes.string,
    roleName: PropTypes.oneOf([
      'admin',
      'user',
      'author',
      'editor',
      'producer',
      'reviewer',
      'authors',
      'editors',
      'producers',
      'reviewers',
      'subscriber',
      'member',
      'public',
      'assigner',
      'customer',
      'vendor'
    ]),
    size: PropTypes.number,
    progress: PropTypes.number /* a number between 0 and 100) */,
    progressMode: PropTypes.oneOf([
      'up',
      'down',
      'spinUp',
      'spinDown',
      'bounce',
      'none'
    ]),
    heartbeat: PropTypes.bool,
    queued: PropTypes.bool,
    className: PropTypes.string,
    title: PropTypes.string
  };

  static defaultProps = {
    menu: false,
    size: 32,
    progress: 0,
    progressMode: 'none',
    queued: false,
    className: '',
    anonymous: false,
    heartbeat: false
  };

  render() {
    const {
      userId,
      title,
      menu,
      size,
      iconName,
      roleName,
      isRoleNameRequired,
      required,
      progressMode,
      queued,
      anonymous,
      userBadgeLabel,
      className,
      heartbeat
    } = this.props;

    const username =
      userId && userId.startsWith('user:') ? unprefix(userId) : '?';

    const userColor =
      username && username !== '?' && !anonymous
        ? tinyColor(colorHash(username).backgroundColor)
            .desaturate(25)
            .lighten(20)
            .toString()
        : 'lightgrey';

    let backgroundColor, foregroundColor, backgroundSize;
    backgroundSize = '100% 100%';

    if (
      (required && username === '?' && !roleName) ||
      (!roleName && isRoleNameRequired)
    ) {
      backgroundColor = 'whitesmoke';
      foregroundColor = '#FFAB91';
    } else if (username === '?' && !roleName) {
      backgroundColor = 'lightgrey';
      foregroundColor = 'white';
    } else if (roleName) {
      let roleColor;
      if (
        roleName === 'admin' ||
        roleName === 'editor' ||
        roleName === 'editors' ||
        roleName === 'assigner'
      ) {
        roleColor = colorHash('editorial2');
      } else if (roleName === 'producer' || roleName === 'producers') {
        roleColor = colorHash('producer4');
      } else {
        let sroleName;
        if (roleName === 'reviewers' || roleName === 'reviewer') {
          //swapping reviewer and author colors
          sroleName = 'author';
        } else if (roleName === 'authors' || roleName === 'author') {
          //swapping reviewer and author colors
          sroleName = 'reviewer';
        } else {
          sroleName = roleName;
        }
        roleColor = colorHash(sroleName || 'user');
      }

      roleColor = tinyColor(roleColor.backgroundColor).desaturate(25);

      foregroundColor = roleColor.isLight() ? 'black' : 'white';
      backgroundColor = `linear-gradient(-45deg, ${roleColor.toString()} -20%, ${roleColor.toString()} 0%, ${userColor} 70%, ${userColor})`;
    } else {
      foregroundColor = tinyColor(userColor).isLight() ? 'black' : 'white';
      backgroundColor = userColor;
    }

    if (queued) {
      /*
      add diagonal lines to indicate that this person is tentative. Note that the pattern requires to bandlines so that the tiling is seamless.
    */
      const bandColor = 'rgba(255, 255, 255, 0.7)';
      const gapSizePx = 4;
      const bandSizePx = 4;
      const bandSizePercent = (1 / size) * bandSizePx * 100;
      const bandOneStart = 0;
      const bandOneEnd = bandSizePercent;
      const bandTwoStart = 50;
      const bandTwoEnd = 50 + bandSizePercent;
      backgroundColor = `linear-gradient(to right top,
      ${bandColor} ${bandOneStart}%, ${bandColor} ${bandOneEnd}%,
      transparent ${bandOneEnd}%, transparent ${bandTwoStart}%,
      ${bandColor} ${bandTwoStart}%, ${bandColor} ${bandTwoEnd}%,
      transparent ${bandTwoEnd}%, transparent 100%),
      ${backgroundColor}`;
      backgroundSize = `${gapSizePx}px ${gapSizePx}px, ${backgroundSize}`;
    }

    const badgeStyle = {
      position: 'relative',
      width: `${size}px`,
      cursor: 'pointer',
      height: `${size}px`,
      lineHeight: `${size}px`,
      color: foregroundColor,
      background: backgroundColor,
      backgroundSize: backgroundSize,
      fontSize: Math.floor(size * 0.5) + 'px',
      borderRadius: Math.floor(size / 2) + 'px',
      boxSizing: 'content-box'
    };

    // in case of `menu === true` the icon will be provided by the Menu
    const badgeLabel =
      iconName && iconName !== 'none' ? (
        menu ? (
          ''
        ) : (
          <Iconoclass
            elementType="span"
            iconSize={(size * 50) / 100}
            iconName={iconName}
          />
        )
      ) : (isRoleNameRequired && !roleName) ||
      (required && username === '?') ? (
        '!'
      ) : anonymous ? (
        userBadgeLabel || '?'
      ) : (
        userBadgeLabel || username.substr(0, 1).toUpperCase()
      );

    return (
      <div
        className={`user-badge ${
          queued ? 'user-badge--queued' : 'user-badge--active'
        } ${className}`}
      >
        <Spinner
          progressMode={progressMode}
          size={size}
          theme="light"
          heartbeat={heartbeat}
        >
          <div
            className="user-badge__circle"
            style={badgeStyle}
            title={title || username}
          >
            <span className="user-badge_initials">
              <span>{badgeLabel}</span>
            </span>
          </div>
        </Spinner>
      </div>
    );
  }
}
