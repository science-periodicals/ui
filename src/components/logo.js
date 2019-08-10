import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { arrayify } from '@scipe/jsonld';
import { ASSET_LOGO, ASSET_LOGO_DARK, ASSET_LOGO_ALT } from '@scipe/librarian';
import resetSubdomain from '../utils/reset-subdomain';

export default class Logo extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    logo: PropTypes.oneOfType([
      // sci.pe menu bar logos
      PropTypes.oneOf([
        'sci.',
        'sci.pe',
        'sci.pe-preview',
        'science-periodicals',
        'science-periodicals-full-rainbow',
        'science-periodicals-half-rainbow'
      ]),
      // resource or list of resource each containing an encoding
      PropTypes.object,
      PropTypes.arrayOf(PropTypes.object)
    ]),
    theme: PropTypes.oneOf(['light', 'dark', 'alt']).isRequired,
    alt: PropTypes.string,
    onLoad: PropTypes.func
  };

  static defaultProps = {
    theme: 'light',
    alt: 'logo',
    logo: 'sci.pe-preview'
  };

  render() {
    const { logo, className, onLoad, theme, alt } = this.props;

    let encoding;
    if (logo === 'sci.pe') {
      encoding = {
        '@type': 'ImageObject',
        fileFormat: 'image/svg+xml',
        contentUrl: `/images/sci.pe-logo-menubar-h48px${
          theme === 'light' ? '' : `-${theme}`
        }.svg`
      };
    } else if (logo === 'sci.') {
      encoding = {
        '@type': 'ImageObject',
        fileFormat: 'image/svg+xml',
        contentUrl: '/images/sci-logo-menubar-h48px.svg'
      };
    } else if (logo === 'science-periodicals') {
      encoding = {
        '@type': 'ImageObject',
        fileFormat: 'image/svg+xml',
        contentUrl: '/images/science-periodicals-logo.svg'
      };
    } else if (logo === 'science-periodicals-full-rainbow') {
      encoding = {
        '@type': 'ImageObject',
        fileFormat: 'image/svg+xml',
        contentUrl: '/images/science-periodicals-full-rainbow-logo.svg'
      };
    } else if (logo === 'science-periodicals-half-rainbow') {
      encoding = {
        '@type': 'ImageObject',
        fileFormat: 'image/svg+xml',
        contentUrl: '/images/science-periodicals-half-rainbow-logo.svg'
      };
    } else if (logo === 'sci.pe-preview') {
      encoding = {
        '@type': 'ImageObject',
        fileFormat: 'image/svg+xml',
        contentUrl: `/images/sci.pe-logo-preview-menubar-h48px${
          theme === 'light' ? '' : `-${theme}`
        }.svg`
      };
    } else {
      const resources = arrayify(logo);
      const resourceName =
        theme === 'light'
          ? ASSET_LOGO
          : theme === 'dark'
          ? ASSET_LOGO_DARK
          : ASSET_LOGO_ALT;

      const resource = resources.find(
        resource => resource.name === resourceName
      );

      if (resource) {
        encoding =
          arrayify(resource.encoding).find(encoding => {
            return arrayify(encoding.thumbnail).some(
              thumbnail =>
                /image\/png|image\/jpeg|image\/svg\+xml/.test(
                  thumbnail.fileFormat
                ) && thumbnail.contentUrl
            );
          }) ||
          arrayify(resource.encoding).find(
            encoding =>
              /image\/png|image\/jpeg|image\/svg\+xml/.test(
                encoding.fileFormat
              ) && encoding.contentUrl
          );
      }

      if (!encoding) {
        encoding = {
          '@type': 'ImageObject',
          fileFormat: 'image/svg+xml',
          contentUrl: `/images/sci.pe-logo-preview-menubar-h48px${
            theme === 'light' ? '' : `-${theme}`
          }.svg`
        };
      }
    }

    const thumbnail =
      arrayify(encoding.thumbnail)
        .filter(thumbnail => {
          return (
            /image\/png|image\/jpeg|image\/svg\+xml/.test(
              thumbnail.fileFormat
            ) && thumbnail.contentUrl
          );
        })
        .sort((a, b) => b.height - a.height)[0] || encoding;

    return (
      <img
        className={classNames('logo', className)}
        src={resetSubdomain(thumbnail.contentUrl)}
        alt={alt}
        onLoad={onLoad}
      />
    );
  }
}
