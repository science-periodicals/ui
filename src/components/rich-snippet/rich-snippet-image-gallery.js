import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import BemTags from '../../utils/bem-tags';
import * as reactChildrenUtils from '../../utils/react-children-utils';
import RichSnippetChordal from './rich-snippet-chordal';
import RichSnippetImpactImage from './rich-snippet-impact-image';

export default class RichSnippetImageGallery extends PureComponent {
  render() {
    const bem = BemTags('rich-snippet');
    let { children, className, id, _snippetMode } = this.props;
    return (
      <div
        className={bem`__image-gallery` + ' ' + (className ? className : '')}
        id={id}
      >
        {children && (
          <div className={bem`__image-gallery-layout`}>
            {_snippetMode == 'scholar' &&
              reactChildrenUtils.getAllOfType(children, RichSnippetChordal)}
            {_snippetMode == 'impact' &&
              reactChildrenUtils.hasChildrenOfType(
                children,
                RichSnippetImpactImage
              ) && (
                <div className={bem`__image-gallery-impact-image`}>
                  {reactChildrenUtils.getAllOfType(
                    children,
                    RichSnippetImpactImage
                  )}
                </div>
              )}
            <div className={bem`__image-gallery-collection`}>
              {reactChildrenUtils.mapOfType(children, <img />, (child, i) => {
                return (
                  <div
                    className={bem`__image-gallery-image`}
                    key={'gallery-img_' + i}
                  >
                    {child}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
}

RichSnippetImageGallery.defaultProps = {
  _snippetMode: 'scholar',
  className: null,
  id: null
};

RichSnippetImageGallery.propTypes = {
  children: PropTypes.any,
  id: PropTypes.string,
  className: PropTypes.string,
  _snippetMode: PropTypes.string
};
