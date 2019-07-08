import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import BemTags from '../utils/bem-tags';

export default class Card extends Component {
  static propTypes = {
    'data-testid': PropTypes.string,
    tagName: PropTypes.string,
    active: PropTypes.bool,
    bevel: PropTypes.bool,
    children: PropTypes.node,
    className: PropTypes.string,
    noticeColor: PropTypes.string,
    pinned: PropTypes.bool
  };

  static defaultProps = {
    tagName: 'div',
    bevel: false,
    active: true,
    noticeColor: 'transparent',
    pinned: false
  };

  render() {
    const {
      tagName: Tag,
      children,
      bevel,
      active,
      className,
      noticeColor,
      pinned
    } = this.props;

    const bem = BemTags();

    return (
      <Tag
        data-testid={this.props['data-testid']}
        className={classNames(
          className,
          bem`card
            --${active ? 'active' : 'inactive'}
            --${bevel ? 'bevel' : 'no-bevel'}
            ${pinned ? '--pinned' : ''}
          `
        )}
      >
        {bevel && (
          <div className={bem`__beveled-shadow-container`}>
            <div className={bem`__beveled-shadow`} />
          </div>
        )}
        <div className={bem`border --${bevel ? 'bevel' : 'no-bevel'}`} />
        <div className={bem`background`} />
        <div
          className={bem`notice-color`}
          style={{ borderLeft: `2px solid ${noticeColor}` }}
        />
        <div className={bem`content`}>{children}</div>
      </Tag>
    );
  }
}
