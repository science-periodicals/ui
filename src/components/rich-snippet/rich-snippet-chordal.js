import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import BemTags from '../../utils/bem-tags';
import Chordal from '../chordal';

export default class RichSnippetChordal extends PureComponent {
  render() {
    const bem = BemTags('rich-snippet');
    return (
      <div
        className={
          bem`__chordal` +
          ' ' +
          (this.props.className ? this.props.className : '')
        }
        id={this.props.id}
      >
        <Chordal
          data={this.props.data}
          size={this.props.size}
          dotSize={3}
          noAnimation={true}
        />
      </div>
    );
  }
}

RichSnippetChordal.defaultProps = {
  id: null,
  className: null,
  size: 72
};

RichSnippetChordal.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      links: PropTypes.arrayOf(PropTypes.string).isRequired
    })
  ),
  id: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.number
};
