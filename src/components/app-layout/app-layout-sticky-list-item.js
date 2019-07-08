import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import debounce from 'lodash/debounce';

export default class AppLayoutStickyListItem extends Component {
  static propTypes = {
    children: PropTypes.func,
    containerRef: PropTypes.object,
    onStick: PropTypes.func,
    onUnstick: PropTypes.func,
    headerHeight: PropTypes.number,
    subHeaderHeight: PropTypes.number,
    id: PropTypes.string.isRequired,
    menubarHidden: PropTypes.bool
  };

  static dedaultProps = {
    onStick: () => {},
    onUnstick: () => {}
  };

  constructor(props) {
    super(props);
    this._isMounted = false;
    this.unstickyDivRef = React.createRef();
    this.stickyDivRef = React.createRef();

    this.handleScroll = this.handleScroll.bind(this);

    this.handleResize = debounce(this.handleResize.bind(this), 20);
    this.state = {
      sticking: undefined,
      stickyHeight: undefined,
      measuring: false
    };
    this.nonStickyHeight = 0;
    this.manageStickingState = this.manageStickingState.bind(this);
    this._measureStickyHeight = this._measureStickyHeight.bind(this);
  }

  componentDidMount() {
    this._isMounted = true;
    window.addEventListener('load', this.handleScroll);
    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('resize', this.handleResize);
    this.getStickyHeight();
    this.manageStickingState();
  }

  componentWillUnmount() {
    const { onUnstick, id } = this.props;
    this._isMounted = false;
    window.removeEventListener('load', this.handleScroll);
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);
    this.handleResize.cancel();
    clearTimeout(this.timeout);
    /* remove sticky banner from app-layout monitoring */
    onUnstick(0, id);
  }

  componentDidUpdate(prevProps) {
    const {
      headerHeight,
      subHeaderHeight,
      id,
      onStick,
      onUnstick
    } = this.props;
    const { sticking, stickyHeight } = this.state;

    if (prevProps.headerHeight !== headerHeight || prevProps.id !== id) {
      if (sticking) {
        // if something changed that caused dom elements to resize
        // call onStick handler with new height.
        const totalHeight =
          headerHeight == 0
            ? stickyHeight + subHeaderHeight
            : stickyHeight + headerHeight + subHeaderHeight;
        onStick(totalHeight, id);
      } else if (sticking === undefined) {
        // sticking state is set in manageStickingState.
        // the initial componentDidMount call to manageStickingState may not
        // initialize "sticking" if the dom elements have not loaded.
        // If not, we try again here.
        this.getStickyHeight();
      } else {
        // call onUnstick handler incase state change cause sticking state to
        // change.
        onUnstick(this.nonStickyHeight, id);
      }
    }
  }

  /**
   * Sticky height can change when the css changes => we watch it with
   * recursive call of _measureStickyHeight.
   */
  getStickyHeight() {
    const { measuring } = this.state;

    if (!measuring) {
      this.setState({ measuring: true }, () => {
        //console.log('start Measuring');
        clearTimeout(this.timeout);
        this.timeout = setTimeout(this._measureStickyHeight, 100);
      });
    }
  }

  /**
   * Measure the height of a stuck list item. It watches for changes and keeps
   * watching until measurement stop changing. Once done, it calls
   * manageStickingState() to see if sticking state needs to be updated.
   */
  _measureStickyHeight() {
    if (!this._isMounted || !this.state.measuring) {
      return;
    }

    const oldStickyHeight = this.state.stickHeight;
    let newStickyHeight = oldStickyHeight;
    const { containerRef } = this.props;

    if (containerRef.current != null && this.stickyDivRef.current != null) {
      const divBoundingRect = this.stickyDivRef.current.getBoundingClientRect();
      if (divBoundingRect && divBoundingRect.height) {
        newStickyHeight = divBoundingRect.height;
      }
      if (newStickyHeight !== this.state.stickyHeight) {
        this.setState({ stickyHeight: newStickyHeight }, () => {
          // call this function again on a timeout in case we measured during a css transition.
          // when two subsquent measurements match we know the height has stabelized.
          clearTimeout(this.timeout);
          this.timeout = setTimeout(this._measureStickyHeight, 100);
          // console.log('measuring...', newStickyHeight);
        });
      } else {
        if (this.state.measuring) {
          // the size measurement has stabelized - now we need to check if
          // new height caused changes that requires sticking state to update.
          this.setState({ measuring: false }, () => {
            // console.log('measuring done', this.state.stickyHeight);
            this.manageStickingState();
          });
        }
      }
    } else {
      // no refs yet, try again
      clearTimeout(this.timeout);
      this.timeout = setTimeout(this._measureStickyHeight, 100);
    }
  }

  handleResize() {
    this.getStickyHeight();
  }

  /**
   * watch scroll position to see if banner should be stuck or unstuck.
   */
  handleScroll() {
    this.manageStickingState();
  }

  /**
   * Check the position of the stickable element and see if it should be in
   * sticking state.
   */
  manageStickingState() {
    const {
      containerRef,
      onUnstick,
      menubarHidden,
      id,
      headerHeight,
      subHeaderHeight
    } = this.props;
    const { sticking, stickyHeight } = this.state;

    if (
      containerRef.current !== null &&
      this.unstickyDivRef.currrent !== null
    ) {
      const containerBoundingRect = containerRef.current.getBoundingClientRect();
      const divBoundingRect = this.unstickyDivRef.current.getBoundingClientRect();

      const topOffset = menubarHidden ? 0 : 55;

      // set the hysteresis value- this relaxes the trigger to help avoid 1px
      // bounces.
      const hyst = 10;

      if (sticking) {
        // in sticking state, see if we should not be.

        // console.log('is sticking', this.props.id, divBoundingRect.top);
        if (
          containerBoundingRect.top > topOffset + hyst ||
          containerBoundingRect.bottom < topOffset - hyst
        ) {
          // banner has moved out of stickable zone so unstick it.
          //console.log('going to unstick', this.props.id, divBoundingRect.top);
          this.setState({ sticking: false }, () => {
            onUnstick(this.nonStickyHeight, this.props.id);
          });
        }
      } else {
        // not in a sticking state. see if we should be.

        // we capture the height of stickable element before it's set to
        // sticking state.
        this.nonStickyHeight = divBoundingRect.height;
        if (
          containerBoundingRect.top <= topOffset + hyst &&
          containerBoundingRect.bottom > topOffset - hyst
        ) {
          //console.log('going to stick', divBoundingRect.top);
          if (stickyHeight) {
            this.setState({ sticking: true }, () => {
              const totalHeight =
                headerHeight == 0
                  ? stickyHeight + subHeaderHeight
                  : stickyHeight + headerHeight + subHeaderHeight;
              this.props.onStick(totalHeight, id);
            });
          }
        }
      }
    }
  }

  render() {
    const { children, headerHeight, subHeaderHeight } = this.props;
    const { sticking, measuring } = this.state;
    let style = {};
    if (sticking) {
      style.marginTop = `${headerHeight + subHeaderHeight}px`;
      // if (headerHeight !== 0) {
      //   style.marginTop = `${headerHeight}px`;
      // }
    }
    // console.log('rendering', this.state.stickyHeight);
    return (
      <Fragment>
        {!!(sticking || measuring) && (
          <div
            ref={this.stickyDivRef}
            className={classNames('app-layout__sticky-list-item', {
              'app-layout__sticky-list-item--measuring': this.state.measuring,
              'app-layout__sticky-list-item--sticking': true
            })}
            style={style}
          >
            {children && children(sticking || measuring, 'sticky')}
          </div>
        )}
        <div
          ref={this.unstickyDivRef}
          className={classNames('app-layout__unsticky-list-item', {
            'app-layout__unsticky-list-item--sticking':
              this.state.sticking && !this.state.measuring
          })}
        >
          {children && children(sticking, 'unsticky')}
        </div>
      </Fragment>
    );
  }
}
