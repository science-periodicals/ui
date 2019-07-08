import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import BemTags from '../../utils/bem-tags';

export default class RichSnippetImpactAbstract extends PureComponent {
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

RichSnippetImpactAbstract.propTypes = {
  children: PropTypes.any
};
