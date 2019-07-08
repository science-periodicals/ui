import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import BemTags from '../../utils/bem-tags';

export default class RichSnippetAbstract extends PureComponent {
  render() {
    const bem = BemTags('rich-snippet');
    let { children, ...props } = this.props;
    return (
      <div className={bem`__impact-abstract__`} {...props}>
        {children}
      </div>
    );
  }
}

RichSnippetAbstract.propTypes = {
  children: PropTypes.any
};
