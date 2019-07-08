import React from 'react';
import PropTypes from 'prop-types';
import clipboardCopy from 'clipboard-copy';
import classNames from 'classnames';
import { textify } from '@scipe/jsonld';
import {
  getFacebookShareUrl,
  getTwitterShareUrl,
  getRedditShareUrl,
  getEmailShareUrl,
  getLinkedInShareUrl
} from '@scipe/librarian';
import Menu from './menu/menu';
import MenuItem from './menu/menu-item';

export default class ShareMenu extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    social: PropTypes.bool,
    url: PropTypes.string.isRequired,
    name: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        '@type': PropTypes.oneOf['rdf:HTML'],
        '@value': PropTypes.string
      })
    ]), // title
    description: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        '@type': PropTypes.oneOf['rdf:HTML'],
        '@value': PropTypes.string
      })
    ]), // summary
    text: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        '@type': PropTypes.oneOf['rdf:HTML'],
        '@value': PropTypes.string
      })
    ]),
    children: PropTypes.any // typically a PrintPdfMenuItem from app-suite
  };

  static defaultProps = {
    social: true
  };

  handleCopy = e => {
    const { url } = this.props;
    clipboardCopy(url).catch(err => {
      console.error(`error copying ${url} to clipboard`);
      console.error(err);
    });
  };

  render() {
    const {
      social,
      url,
      text,
      name,
      description,
      id,
      className,
      children,
      ...menuProps
    } = this.props;
    const params = { url };
    if (name != null) {
      params.name = textify(name);
    }
    if (description != null) {
      params.description = textify(description);
    }
    if (text != null) {
      params.text = textify(text);
    }

    return (
      <Menu
        id={id}
        className={classNames('share-menu', className)}
        icon="share"
        {...menuProps}
      >
        <MenuItem icon={{ iconName: 'link' }} onClick={this.handleCopy}>
          <span>Copy Permalink</span>
        </MenuItem>

        {social && (
          <MenuItem
            icon={{ iconName: 'socialTwitter', round: true }}
            href={getTwitterShareUrl(params)}
            target="_blank"
          >
            Twitter
          </MenuItem>
        )}

        {social && (
          <MenuItem
            icon={{ iconName: 'socialFacebook', round: true }}
            href={getFacebookShareUrl(params)}
            target="_blank"
          >
            Facebook
          </MenuItem>
        )}

        {social && (
          <MenuItem
            icon={{ iconName: 'socialLinkedIn', round: true }}
            href={getLinkedInShareUrl(params)}
            target="_blank"
          >
            LinkedIn
          </MenuItem>
        )}

        {social && (
          <MenuItem
            icon={{ iconName: 'socialReddit', round: true }}
            href={getRedditShareUrl(params)}
            target="_blank"
          >
            Reddit
          </MenuItem>
        )}

        {social && (
          <MenuItem
            icon={{ iconName: 'email', round: true }}
            href={getEmailShareUrl(params)}
            target="_blank"
          >
            Email
          </MenuItem>
        )}
        {children}
      </Menu>
    );
  }
}
