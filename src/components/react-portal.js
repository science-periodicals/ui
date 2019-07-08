import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

class ReactPortalLayer extends Component {
  /* based on code from http://jamesknelson.com/rendering-react-components-to-the-document-body/ */

  constructor(props) {
    super(props);
    this.state = {
      top: -100000,
      left: -1000000 /* render offscreen at first to hide position glitch */,
      placeholderWidth: 0,
      placeholderHeight: 0,
      portalWidth: 0,
      portalHeight: 0,
      safeLeftOffset: 0,
      safeWidthOffset: 0
    };
    this.handleResize = this.handleResize.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handlePositioning = this.handlePositioning.bind(this);
    this._handlePositioning = this._handlePositioning.bind(this);

    // this.setRef = this.setRef.bind(this);
    // this.placeholderRef = null;

    this.popup = document.createElement('div');
  }

  componentDidMount() {
    this._isMouted = true;
    let { position, parentID, safePosition } = this.props;
    //let style = this.popup.style;

    //console.log('componentDidMount', position);

    this.popup.className = `react-portal__portal ${
      this.props.portalClass ? this.props.portalClass : ''
    }`;

    if (position === 'relative') {
      /* to have pop up relative to parent component we need to
         move on resize and scroll */
      this.popup.style.position = 'fixed';
      this.popup.style.zIndex = 10000;
      //style.transition = 'top 25ms, left 25ms';
      window.addEventListener('scroll', this.handleScroll, true);
    } else if (position === 'fixedRelative') {
      /* more performant relative positioning for fixed parents - eg header */
      this.popup.style.position = 'fixed';
      this.popup.style.zIndex = 1000;
      this.popup.style.transition = 'top 25ms, left 25ms';
    } else if (position === 'absolute' || position === 'absoluteRelative') {
      /* positions popup relative to parent ID */
      this.popup.style.position = 'absolute';
      this.popup.style.top = 0;
      this.popup.style.left = 0;
    } else if (position === 'fixed') {
      /* positions popup relative to window frame */
      this.popup.style.position = 'fixed';
      this.popup.style.top = 0;
      this.popup.style.left = 0;
    }

    if (
      safePosition ||
      position === 'fixedRelative' ||
      position === 'relative'
    ) {
      window.addEventListener('resize', this.handleResize);
    }

    // if parentID is set attach portal that element, otherwise attach to body
    let parentEl;
    if (parentID) {
      parentEl = document.getElementById(parentID);
    } else {
      parentEl = document.body;
    }

    if (parentEl) {
      parentEl.appendChild(this.popup);
    } else {
      console.warn('React Portal cannot find element: ', parentID);
    }

    this.handlePositioning();
    //this._renderLayer();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.placeholderRef !== nextProps.placeholderRef)
      this.handlePositioning();
  }

  componentDidUpdate(prevProps, prevState) {
    //console.log('componentDidUpdate', this.popup);
    let { position, widthSource, placeholderRef } = this.props;

    if (position !== 'fixed' && position !== 'absolute') {
      this.popup.style.left = `${this.state.left}px`;
      this.popup.style.top = `${this.state.top}px`;
    }
    // console.log('render w: ', widthSource);

    if (widthSource === 'placeholder' && this.state.placeholderWidth > 0) {
      // console.log('transfer: ', this.state.placeholderWidth);
      this.popup.style.width = `${this.state.placeholderWidth}px`;
    } else if (widthSource === 'portal' && this.state.portalWidth > 0) {
      placeholderRef.style.width = `${this.state.portalWidth}px`;
    } else if (widthSource === 'smallest') {
      if (this.state.placeholderWidth < this.state.portalWidth) {
        // console.log('smallest (placeholder to portal): ', this.state.placeholderWidth);
        this.popup.style.width = `${this.state.placeholderWidth}px`;
      } else {
        placeholderRef.style.width = `${this.state.portalWidth}px`;
      }
    } else if (widthSource === 'biggest') {
      if (this.state.placeholderWidth > this.state.portalWidth) {
        // console.log('biggest (placeholder to portal): ', this.state.placeholderWidth);
        this.popup.style.width = `${this.state.placeholderWidth}px`;
        placeholderRef.style.width = undefined;
      } else if (this.state.portalWidth > 0) {
        // console.log('biggest (portal to palceholder): ', this.state.portalWidth, this.state.placeholderWidth);
        placeholderRef.style.width = `${this.state.portalWidth}px`;
        this.popup.style.width = undefined;
      }
    }
  }

  componentWillUnmount() {
    this._isMouted = false;
    let { parentID } = this.props;
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('scroll', this.handleScroll, true);

    let parentEl;
    if (parentID) {
      parentEl = document.getElementById(parentID);
    } else {
      parentEl = document.body;
    }
    if (parentEl) {
      parentEl.removeChild(this.popup);
    }
    this.mounted = 'unmounted';
  }

  render() {
    // if (!this.popup) return null;

    let { children } = this.props;

    return ReactDOM.createPortal(children, this.popup);
  }

  // setRef(ref) {
  //   this.placeholderRef = ref;
  //   if (this.props.position !== 'fixed' && this.props.position !== 'absolute') {
  //     this.handlePositioning();
  //   }
  // }

  handleScroll() {
    this.handlePositioning();
  }

  handleResize() {
    this.handlePositioning();
  }

  handlePositioning() {
    if (this.rafID) cancelAnimationFrame(this.rafId);
    this.rafId = window.requestAnimationFrame(this._handlePositioning);
  }

  _handlePositioning() {
    if (!this._isMouted) return;
    let callbackFlag = false;
    let { placeholderRef } = this.props;
    if (placeholderRef) {
      let placeholderRect = placeholderRef.getBoundingClientRect();
      let rect = {};
      if (this.props.parentID && this.props.position === 'absoluteRelative') {
        let contextRect = document
          .getElementById(this.props.parentID)
          .getBoundingClientRect();
        rect.top = placeholderRect.top - contextRect.top;
        rect.left = placeholderRect.left - contextRect.left;
        rect.width = placeholderRect.width;
        rect.height = placeholderRect.height;
      } else {
        rect.top = placeholderRect.top;
        rect.left = placeholderRect.left;
        rect.width = placeholderRect.width;
        rect.height = placeholderRect.height;
      }

      if (this.popup) {
        let portalRect;

        // if (
        //   this.props.position === 'absolute' ||
        //   this.props.position === 'absoluteRelative'
        // ) {
        //   portalRect = this.popup.getBoundingClientRect();
        // } else {
        //   // fixed position elements don't return any width or height so use first child instead
        //
        //   portalRect = this.popup.firstChild.getBoundingClientRect();
        // }

        if (this.popup.children.length === 1) {
          portalRect = this.popup.firstChild.getBoundingClientRect();
        } else {
          // TODO: check on why this is maybe bad?
          //console.warn('React Portal requires a single child.');
          portalRect = this.popup.getBoundingClientRect();
        }

        if (this.props.safePosition) {
          //console.log('safePosition', this.popup, portalRect);
          let newSafeLeftOffset = 0;

          // check if right side is offscreen
          if (
            Math.round(portalRect.right > window.innerWidth) &&
            portalRect.left > -1000
          ) {
            // Calculating absolute offset results in feedback loop during window resize.
            // better to creep up to edge of screen.
            //newSafeLeftOffset = Math.round(this.state.safeLeftOffset - 1);
            newSafeLeftOffset = Math.round(
              window.innerWidth - portalRect.right
            );
            //console.log('right offscreen: ', newSafeLeftOffset);
          }

          // check if left side is offscreen
          if (Math.round(portalRect.left) < 0 && portalRect.left > -1000) {
            newSafeLeftOffset = Math.round(portalRect.left * -1);
            //console.log('left offscreen: ', newSafeLeftOffset, portalRect.left);
          }

          // check if width is wider than screen
          if (
            newSafeLeftOffset + portalRect.right > window.innerWidth &&
            portalRect.left > -1000
          ) {
            let safeWidthOffset = window.innerWidth - portalRect.right;
            if (safeWidthOffset !== this.state.safeWidthOffset) {
              this.setState({ safeWidthOffset: safeWidthOffset });
              callbackFlag = true;
              //console.log('safeWidthOffset: ', safeWidthOffset);
            }
          }

          if (
            newSafeLeftOffset !== 0 &&
            newSafeLeftOffset !== this.state.safeLeftOffset
          ) {
            this.setState({ safeLeftOffset: newSafeLeftOffset });
            callbackFlag = true;
            //console.log('newSafeLeftOffset: ', newSafeLeftOffset);
          }
        }

        let portalRectWidth =
          portalRect.right -
          portalRect.left +
          this.state.safeLeftOffset +
          this.state.safeWidthOffset;

        //console.log('portal width:', portalRect);
        if (portalRectWidth !== this.state.portalWidth) {
          // fixed elements return no width or height so try to calc from left and right.
          this.setState({
            portalWidth: portalRectWidth
          });
        }
      }

      rect.left = rect.left + this.state.safeLeftOffset;

      if (rect.left !== this.state.left) this.setState({ left: rect.left });
      if (rect.top !== this.state.top) this.setState({ top: rect.top });
      if (rect.width !== this.state.placeholderWidth) {
        this.setState({ placeholderWidth: rect.width });
      }

      if (
        this.props.safePosition &&
        this.props.onSafePosition &&
        callbackFlag
      ) {
        this.props.onSafePosition(
          this.state.safeLeftOffset,
          this.state.safeWidthOffset
        );
      }
    }
  }
}

export default class ReactPortal extends Component {
  constructor(props) {
    super(props);
    this.setRef = this.setRef.bind(this);
    this.state = {
      placeHolderRef: undefined
    };
  }

  setRef(ref) {
    this.setState({ placeholderRef: ref });
  }

  render() {
    return (
      <span className="react-portal__placeholder" ref={this.setRef}>
        <ReactPortalLayer
          {...this.props}
          placeholderRef={this.state.placeholderRef}
        >
          {this.props.children}
        </ReactPortalLayer>
      </span>
    );
  }
}

const sharedDefaultProps = {
  position: 'relative',
  widthSource: 'none',
  safePosition: false
};

const { oneOf, node, string, bool, func, object } = PropTypes;
const sharedPropTypes = {
  position: oneOf([
    'relative',
    'absolute',
    'fixed',
    'fixedRelative',
    'absoluteRelative'
  ]),
  children: node,
  portalClass: string,
  widthSource: oneOf(['none', 'biggest', 'smallest', 'portal', 'placeholder']),
  parentID: string,
  safePosition: bool,
  onSafePosition: func
};

ReactPortal.defaultProps = sharedDefaultProps;
ReactPortalLayer.defaultProps = sharedDefaultProps;

ReactPortal.propTypes = sharedPropTypes;
ReactPortalLayer.propTypes = Object.assign(
  {
    placeholderRef: object
  },
  sharedPropTypes
);
