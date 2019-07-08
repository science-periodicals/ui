import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { getId, arrayify, prefix } from '@scipe/jsonld';
import { schema } from '@scipe/librarian';
import Value from '../value';

export default class RdfaCaption extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    displayLabel: PropTypes.bool,
    displayParts: PropTypes.bool,
    className: PropTypes.string,
    object: PropTypes.shape({
      '@id': PropTypes.string,
      '@type': PropTypes.string,
      alternateName: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      caption: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      hasPart: PropTypes.arrayOf(
        PropTypes.shape({
          '@id': PropTypes.string,
          '@type': PropTypes.string,
          alternateName: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object
          ]),
          caption: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
        })
      )
    })
  };

  static defaultProps = {
    displayParts: true,
    displayLabel: false
  };

  render() {
    const { id, className, object, displayLabel, displayParts } = this.props;

    if (
      !(object.alternateName && object.caption) &&
      !(schema.is(object, 'Image') && displayParts)
    ) {
      // return null if no caption info to avoid extra markup and styles.
      return null;
    }

    return (
      <div
        id={id}
        className={classNames('rdfa-caption', className)}
        resource={getId(object)}
        typeof={prefix(object['@type'])}
      >
        {object.alternateName &&
          object.caption && (
            <div className="rdfa-caption__section">
              {displayLabel &&
                object.alternateName && (
                  <Value
                    className="rdfa-caption__label"
                    tagName="label"
                    property="schema:alternateName"
                  >
                    {object.alternateName}
                  </Value>
                )}

              {!!object.caption && (
                <Value className="rdfa-caption__body" property="schema:caption">
                  {object.caption}
                </Value>
              )}
            </div>
          )}

        {schema.is(object, 'Image') && displayParts
          ? arrayify(object.hasPart).map(part => (
              <div
                key={getId(part) || JSON.stringify(part)}
                property="schema:hasPart"
                resource={getId(part)}
              >
                <RdfaCaption object={part} displayLabel={true} />
              </div>
            ))
          : null}
      </div>
    );
  }
}
