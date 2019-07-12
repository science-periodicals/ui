import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ds3Mime from '@scipe/ds3-mime';
import { getId, arrayify, textify } from '@scipe/jsonld';
import { schema } from '@scipe/librarian';
import mime from 'mime-types';
import Menu from './menu/menu';
import MenuItem from './menu/menu-item';
import { getIconNameFromSchema, getDisplaySize } from '../utils/graph';

export default class ResourceDownloadMenu extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    portal: PropTypes.bool,
    title: PropTypes.string,
    iconSize: PropTypes.string,
    align: PropTypes.oneOf(['left', 'right', 'center']),
    resource: PropTypes.object
  };

  static defaultProps = {
    portal: true,
    align: 'right'
  };

  renderEncoding(encoding) {
    const extension = (encoding.fileFormat || '').startsWith(ds3Mime)
      ? 'DS3'
      : (mime.extension(encoding.fileFormat) || '').toUpperCase();

    return (
      <MenuItem
        key={getId(encoding)}
        icon={getIconNameFromSchema(encoding)}
        href={encoding.contentUrl}
        download={
          encoding.name ||
          `${getId(encoding)}.${mime.extension(encoding.fileFormat)}`
        }
      >
        {extension} ({getDisplaySize(encoding)})
      </MenuItem>
    );
  }

  render() {
    const {
      id,
      className,
      resource,
      title,
      portal,
      align,
      iconSize
    } = this.props;

    const menuItems = [];

    const encodings = arrayify(resource.distribution || resource.encoding);
    if (encodings.length) {
      encodings.forEach(encoding => {
        if (
          encoding.contentUrl &&
          encoding.fileFormat &&
          encoding.contentSize
        ) {
          menuItems.push(this.renderEncoding(encoding));
        }
      });
    } else if (schema.is(resource, 'Image')) {
      arrayify(resource.hasPart).forEach((part, i) => {
        const encodings = arrayify(part.distribution || part.encoding).filter(
          encoding =>
            encoding.contentUrl && encoding.fileFormat && encoding.contentSize
        );
        if (encodings.length) {
          menuItems.push(
            <MenuItem key={getId(part) || i} disabled={true} divider={i !== 0}>
              {textify(part.alternateName) || getId(part)}
            </MenuItem>
          );

          encodings.forEach(encoding => {
            menuItems.push(this.renderEncoding(encoding));
          });
        }
      });
    }

    if (!menuItems.length) {
      return null;
    }

    return (
      <Menu
        id={id}
        className={classNames(className, 'resource-download-menu')}
        title={title}
        icon="download"
        iconSize={iconSize}
        portal={portal}
        align={align}
      >
        {menuItems}
      </Menu>
    );
  }
}
