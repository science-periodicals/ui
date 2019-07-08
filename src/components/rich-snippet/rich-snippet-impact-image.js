import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import BemTags from '../../utils/bem-tags';

export default class RichSnippetImpactImage extends PureComponent {
  render() {
    const bem = BemTags('rich-snippet');
    let { children, ...props } = this.props;
    return (
      <div className={bem`__impact-image__`} {...props}>
        {children}
      </div>
    );
  }
}

RichSnippetImpactImage.propTypes = {
  children: PropTypes.any
};
