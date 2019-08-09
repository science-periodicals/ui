import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import noop from 'lodash/noop';
import flatten from 'lodash/flatten';
import { arrayify } from '@scipe/jsonld';
import resetSubdomain from '../utils/reset-subdomain';

export default class Banner extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    tagName: PropTypes.string,
    type: PropTypes.oneOf(['large', 'medium', 'small']),
    theme: PropTypes.oneOf(['light', 'dark', 'alt']),
    children: PropTypes.any,
    cssVariables: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.arrayOf(PropTypes.object)
    ]),
    imageCredit: PropTypes.string,
    defaultIsLoaded: PropTypes.bool,
    onLoad: PropTypes.func
  };

  static defaultProps = {
    defaultIsLoaded: false,
    onLoad: noop,
    theme: 'light',
    tagName: 'header',
    imageCredit: ''
  };

  static getDerivedStateFromProps(props, state) {
    const nextBackgroundUrl = getBackgroundEncodingUrl(
      props.cssVariables,
      props.type,
      props.theme
    );
    if (nextBackgroundUrl !== state.lastBackgroundUrl) {
      return {
        isLoaded: props.defaultIsLoaded,
        lastBackgroundUrl: nextBackgroundUrl
      };
    }

    return null;
  }

  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      lastBackgroundUrl: getBackgroundEncodingUrl(
        props.cssVariables,
        props.type,
        props.theme
      )
    };
  }

  handleLoad = e => {
    console.log('loaded');
    const { onLoad, cssVariables, type, theme } = this.props;
    const { lastBackgroundUrl } = this.state;
    this.setState({ isLoaded: true });
    // only call onLoad if the backgroundURL is still relevant
    const backgroundUrl = getBackgroundEncodingUrl(cssVariables, type, theme);
    if (backgroundUrl === lastBackgroundUrl) {
      onLoad();
    }
  };

  render() {
    const {
      tagName: El,
      type,
      cssVariables,
      className,
      children,
      theme,
      imageCredit
    } = this.props;

    const { isLoaded } = this.state;

    const textColor = arrayify(cssVariables).find(
      style => style.name === `--${type}-banner-text-color`
    );

    const textShadowColor = arrayify(cssVariables).find(
      style => style.name === `--${type}-banner-text-shadow-color`
    );

    const backgroundUrl = getBackgroundEncodingUrl(cssVariables, type, theme);
    const style = {};
    if (backgroundUrl && isLoaded) {
      style.backgroundImage = `url(${backgroundUrl})`;
    }

    if (textColor && textColor.value) {
      style.color = textColor.value;
    }

    if (textShadowColor && textShadowColor.value) {
      style.textShadow = `0 0 4px ${textShadowColor.value}`;
      style.backgroundColor = textShadowColor.value;
    }

    // Note: we used an img to load the background URL to have access to the `load` event.
    // Once the image is loaded, we stop rendering it and render the backgroundUrl instead.
    return (
      <El
        className={classNames(
          'banner',
          className,
          `banner--${type}`,
          backgroundUrl ? undefined : `banner--${theme}`
        )}
        data-test-loaded={isLoaded.toString()}
        title={imageCredit}
        style={style}
      >
        {!isLoaded && !!backgroundUrl && (
          <img src={backgroundUrl} onLoad={this.handleLoad} />
        )}

        {children}
      </El>
    );
  }
}

function getBackgroundEncodingUrl(cssVariables, type, theme) {
  let styleName = `--${type}-banner-background-image`;
  if (theme && theme !== 'light') {
    styleName += `-${theme}`;
  }

  const bannerStyle = arrayify(cssVariables).find(style => {
    return (
      style.name === styleName &&
      style.encoding &&
      arrayify(style.encoding).some(encoding => {
        return (
          (/image\/png|image\/jpeg/.test(encoding.fileFormat) &&
            encoding.contentUrl) ||
          arrayify(encoding.thumbnail).some(thumbnail => {
            return (
              /image\/png|image\/jpeg/.test(thumbnail.fileFormat) &&
              thumbnail.contentUrl
            );
          })
        );
      })
    );
  });

  // encoding with widest web friendly background
  const background = arrayify(bannerStyle && bannerStyle.encoding)
    .filter(encoding => {
      return (
        /image\/png|image\/jpeg/.test(encoding.fileFormat) &&
        encoding.contentUrl
      );
    })
    .concat(
      flatten(
        arrayify(bannerStyle && bannerStyle.encoding).map(encoding => {
          return arrayify(encoding.thumbnail).filter(thumbnail => {
            return (
              /image\/png|image\/jpeg/.test(thumbnail.fileFormat) &&
              thumbnail.contentUrl
            );
          });
        })
      )
    )
    .sort((a, b) => b.width - a.width)[0];

  return background && resetSubdomain(background.contentUrl);
}

export const StyleIssueTitle = ({ children, tagName }) => {
  const El = tagName || 'h2';
  return <El className="banner__issue-title">{children}</El>;
};

StyleIssueTitle.propTypes = {
  children: PropTypes.any,
  tagName: PropTypes.string
};

export const StyleArticleTitle = ({ children, tagName }) => {
  const El = tagName || 'h2';
  return <El className="banner__article-title">{children}</El>;
};

StyleArticleTitle.propTypes = {
  children: PropTypes.any,
  tagName: PropTypes.string
};

export const StyleJournalTitle = ({ children, tagName }) => {
  const El = tagName || 'h2';
  return <El className="banner__journal-title">{children}</El>;
};

StyleJournalTitle.propTypes = {
  children: PropTypes.any,
  tagName: PropTypes.string
};

export const StyleJournalDescription = ({ children, tagName }) => {
  const El = tagName || 'h2';
  return <El className="banner__journal-desciption">{children}</El>;
};

StyleJournalDescription.propTypes = {
  children: PropTypes.any,
  tagName: PropTypes.string
};
