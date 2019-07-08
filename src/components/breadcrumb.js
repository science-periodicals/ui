import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Iconoclass from '@scipe/iconoclass';
import Hyperlink from './hyperlink';

export default class Breadcrumb extends PureComponent {
  static propTypes = {
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
    showHome: PropTypes.bool,
    homeLink: PropTypes.object,
    children: PropTypes.any
  };

  static defaultProps = {
    crumbs: [],
    showHome: true,
    homeLink: {
      href: '/'
    }
  };

  render() {
    const { crumbs, showHome, homeLink, children } = this.props;
    return (
      <nav className="header__breadcrumb">
        {showHome && (
          <Hyperlink {...homeLink} className="header__breadcrumb-home">
            <Iconoclass
              elementType="span"
              iconName="home"
              iconSize={16}
              behavior="button"
            />
          </Hyperlink>
        )}
        {crumbs.map((crumb, i, crumbArr) => (
          <div
            className="breadcrumb__crumb"
            key={
              crumb.key ||
              crumb.href ||
              (crumb.to && crumb.to.pathname) ||
              crumb.to
            }
          >
            {(showHome || i !== 0) && (
              <Iconoclass
                customClassName="breadcrumb__arrow"
                iconName="arrowOpenRight"
                role="presentation"
                iconSize={24}
              />
            )}
            <div className="breadcrumb__text">
              <Hyperlink {...crumb} />
            </div>
          </div>
        ))}
        {children}
      </nav>
    );
  }
}
