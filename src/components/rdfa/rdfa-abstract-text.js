import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Div } from '../elements';

export default class RdfaAbstractText extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    object: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    escHtml: PropTypes.bool,
    setHref: PropTypes.func
  };

  render() {
    const { id, className, object, ...others } = this.props;

    return (
      <Div
        id={id}
        className={classNames('rdfa-abstract-text', className)}
        property="schema:text"
        {...others}
      >
        {object.text}
      </Div>
    );
  }
}
