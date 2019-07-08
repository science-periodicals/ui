import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import noop from 'lodash/noop';
import ReactPortal from './react-portal';
import BemTags from '../utils/bem-tags';

const bem = BemTags();

export default class Modal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scrollTop: 0
    };
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.findTop = this.findTop.bind(this);
    this.handleContentFocus = this.handleBgFocus.bind(this);
    this.handleBgFocus = this.handleBgFocus.bind(this);
    this.modalContainerRef = React.createRef();
    this.modalContentRef = React.createRef();
  }

  componentDidMount() {
    const $el = this.props.parentID
      ? document.getElementById(this.props.parentID)
      : document.body;
    if ($el) {
      // https://stackoverflow.com/questions/28633221/document-body-scrolltop-firefox-returns-0-only-js
      const scrollTop = this.findTop($el);
      $el.classList.add('sa-modal-no-scroll');
      this.setState({ scrollTop });
    }

    window.addEventListener('resize', this.handleResize);
    // focus modal on mount to set tab context
    if (this.modalContentRef && this.modalContentRef.current) {
      // focusing the element will normally cause the window to scroll to that element
      // preventScroll option blocks that
      this.modalContentRef.current.focus({
        preventScroll: true
      });
    }
  }

  componentWillUnmount() {
    const $el = this.props.parentID
      ? document.getElementById(this.props.parentID)
      : document.body;
    if ($el) {
      $el.classList.remove('sa-modal-no-scroll');
    }
    window.removeEventListener('resize', this.handleResize);
  }

  findTop($el) {
    return this.props.parentID
      ? $el.scrollTop
      : window.pageYOffset ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0;
  }

  handleResize() {
    const $el = this.props.parentID
      ? document.getElementById(this.props.parentID)
      : document.body;

    if (this.findTop($el) !== this.state.scrollTop) {
      this.setState({ scrollTop: $el.scrollTop });
    }
  }

  handleBgFocus() {
    // focus modal on blur of background - this prevents tabing out of modal
    // however, don't capture the tab if this is not a root level modal
    if (
      !this.props.parentID &&
      this.modalContentRef &&
      this.modalContentRef.current
    ) {
      this.modalContentRef.current.focus();
    }
  }
  handleClickOutside() {
    this.props.onClickOutside();
  }

  render() {
    const { scrollTop } = this.state;

    return (
      <ReactPortal
        position="absolute"
        portalClass="modal-portal"
        parentID={this.props.parentID}
      >
        <div className={bem`modal`} style={{ top: scrollTop }}>
          {/* Note: the DOM order of content and backaground matters for catpuring the tabs */}
          <div
            tabIndex="0"
            className={bem`__content`}
            aria-modal="true"
            role="dialog"
            ref={this.modalContentRef}
            style={{ zIndex: '10' }}
          >
            {this.props.children}
          </div>
          <div
            className={classNames(bem`__background`, {
              'modal__background--no-animation': this.props.disableAnimation
            })}
            onClick={this.handleClickOutside}
            tabIndex="0"
            onFocus={this.handleBgFocus}
            style={{ zIndex: '1' }}
          />
        </div>
      </ReactPortal>
    );
  }
}

Modal.defaultProps = {
  onClickOutside: noop
};

Modal.propTypes = {
  disableAnimation: PropTypes.bool,
  parentID: PropTypes.string,
  onClickOutside: PropTypes.func,
  children: PropTypes.node
};
