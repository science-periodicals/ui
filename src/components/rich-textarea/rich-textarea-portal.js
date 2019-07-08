import React from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

export default class RichTextareaPortal extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    mode: PropTypes.oneOf(['default', 'leftAligned']),
    coordinates: PropTypes.shape({
      top: PropTypes.number.isRequired,
      left: PropTypes.number.isRequired,
      textareaLeft: PropTypes.number.isRequired,
      textareaWidth: PropTypes.number.isRequired
    }).isRequired
  };

  static defaultProps = {
    mode: 'default'
  };

  constructor(props) {
    super(props);

    const {
      coordinates: { top, left, textareaLeft, textareaWidth },
      mode
    } = props;

    this.el = document.createElement('div');
    this.el.style.position = 'absolute';
    this.el.style.top = `${top}px`;
    this.el.style.zIndex = 10;

    switch (mode) {
      case 'leftAligned':
        this.el.style.maxWidth = `300px`;
        this.el.style.left = `${left}px`;
        break;

      default:
        // full width of the textarea
        this.el.style.width = `${textareaWidth}px`;
        this.el.style.left = `${textareaLeft}px`;
        break;
    }
  }

  componentDidMount() {
    document.body.appendChild(this.el);
  }

  componentWillUnmount() {
    document.body.removeChild(this.el);
  }

  render() {
    const { children } = this.props;
    return createPortal(children, this.el);
  }
}
