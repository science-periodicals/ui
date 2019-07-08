import React from 'react';
import PropTypes from 'prop-types';
import Measure from 'react-measure';

const MIN_SIZE = 5;

// Credit: got some help from
// https://github.com/wdebeaum/svg-whiteboard/blob/master/whiteboard.html

/**
 * This component will only produce paths that start with an `M` (absolute
 * move-to) command followed by an arbitrary list of `l` commands (relative
 * line-to)
 */
export default class SVGAnnotable extends React.Component {
  constructor() {
    super();
    this.state = {
      selected: null,
      width: 0,
      height: 0,
      currentDraw: null
    };

    this.handleSelect = this.handleSelect.bind(this);
    this.handleDeselect = this.handleDeselect.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.prevent = this.prevent.bind(this);
    this.handleStartDraw = this.handleStartDraw.bind(this);
    this.handleFinishDraw = this.handleFinishDraw.bind(this);
    this.handleDrawMove = this.handleDrawMove.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.svg = null;
    this.previousCoords = null;
    this.deferredMovement = { x: 0, y: 0 };
  }

  handleResize(data) {
    const {
      bounds: { width, height }
    } = data;
    this.setState({ width, height });
  }

  handleSelect(ev, selected) {
    ev.stopPropagation();
    this.setState({ selected });
    if (this.props.onSelectionChange) this.props.onSelectionChange(selected);
  }

  handleDeselect() {
    if (!this.state.selected) return;
    this.setState({ selected: null });
    if (this.props.onSelectionChange) this.props.onSelectionChange();
  }

  handleKeyDown(ev) {
    if (ev.key === 'Delete' || ev.key === 'Backspace') {
      if (!this.state.selected) return;
      if (this.props.onSelectorRemoved)
        this.props.onSelectorRemoved(this.state.selected);
      this.setState({ selected: null });
      ev.preventDefault();
    }
  }

  handleStartDraw(ev) {
    let coords = this.coordinates(ev);
    this.previousCoords = coords;
    this.deferredMovement = { x: 0, y: 0 };
    this.setState({
      currentDraw: {
        M: `${coords.x} ${coords.y}`,
        l: []
      }
    });
    ev.stopPropagation();
  }

  handleDrawMove(ev) {
    if (!this.state.currentDraw) return;
    ev.stopPropagation();
    let coords = this.deltaCoords(ev);
    this.deferredMovement.x += coords.x;
    this.deferredMovement.y += coords.y;
    if (
      Math.abs(this.deferredMovement.x) > MIN_SIZE ||
      Math.abs(this.deferredMovement.y) > MIN_SIZE
    ) {
      let { currentDraw } = this.state;
      currentDraw.l.push(
        `${this.deferredMovement.x} ${this.deferredMovement.y}`
      );
      this.setState({ currentDraw: Object.assign({}, currentDraw) });
      this.deferredMovement = { x: 0, y: 0 };
    }
  }

  handleFinishDraw() {
    if (!this.state.currentDraw) return;
    if (this.deferredMovement.x > 0 || this.deferredMovement.y > 0) {
      let { currentDraw } = this.state;
      currentDraw.l.push(
        `${this.deferredMovement.x} ${this.deferredMovement.y}`
      );
      this.setState({ currentDraw: Object.assign({}, currentDraw) });
      this.deferredMovement = { x: 0, y: 0 };
    }
    let newSelector = {
      svgPath: this.currentDrawToSVG(),
      widthAtCapture: this.state.width,
      heightAtCapture: this.state.height
    };
    if (this.props.onSelectorAdded) this.props.onSelectorAdded(newSelector);
    this.previousCoords = null;
    this.setState({ currentDraw: null, selected: newSelector });
  }

  currentDrawToSVG() {
    let { currentDraw } = this.state;
    if (!currentDraw) return '';
    let d = `M ${currentDraw.M} `;
    if (currentDraw.l.length) d += `l ${currentDraw.l.join(',')}`;
    return d;
  }

  getScale(sel) {
    let scaleX = 1,
      scaleY = 1;
    if (sel && sel.widthAtCapture && sel.heightAtCapture) {
      scaleX = this.state.width / sel.widthAtCapture;
      scaleY = this.state.height / sel.heightAtCapture;
    }
    return `scale(${scaleX}, ${scaleY})`;
  }

  deltaCoords(ev) {
    let coords = this.coordinates(ev),
      point = this.svg.createSVGPoint();
    point.x = coords.x;
    point.y = coords.y;
    if (this.previousCoords) {
      point.x -= this.previousCoords.x;
      point.y -= this.previousCoords.y;
    }
    this.previousCoords = coords;
    return point;
  }

  prevent(ev) {
    ev.stopPropagation();
  }

  coordinates(ev) {
    let point = this.svg.createSVGPoint();
    point.x = ev.pageX;
    point.y = ev.pageY;
    return point.matrixTransform(this.svg.getScreenCTM().inverse());
  }

  render() {
    let {
        selectors = [],
        color,
        selectedColor,
        strokeWidth,
        children,
        readonly
      } = this.props,
      { selected, width, height, currentDraw } = this.state;
    return (
      <div className="svg-annotable" style={{ position: 'relative' }}>
        <div className="svg-annotable__content">
          <Measure onResize={this.handleResize} bounds>
            {({ measureRef }) =>
              React.cloneElement(children, { ref: measureRef })
            }
          </Measure>
        </div>
        <div
          className="svg-annotable__annotation"
          style={{ marginTop: -height, position: 'relative' }}
        >
          <svg
            onClick={this.handleDeselect}
            onMouseDown={!readonly && this.handleStartDraw}
            onMouseMove={!readonly && this.handleDrawMove}
            onMouseUp={!readonly && this.handleFinishDraw}
            onKeyDown={!readonly && this.handleKeyDown}
            width={`${width}px`}
            height={`${height}px`}
            viewBox={`0 0 ${width} ${height}`}
            style={{ cursor: readonly ? 'auto' : 'crosshair', outline: 'none' }}
            ref={n => (this.svg = n)}
            vectorEffect="non-scaling-stroke"
            tabIndex="-1"
          >
            <rect x="0" y="0" width="100%" height="100%" opacity="0" />
            {selectors.map(sel => (
              <path
                key={sel.svgPath}
                d={sel.svgPath}
                stroke={sel === selected ? selectedColor : color}
                strokeWidth={strokeWidth}
                pointerEvents="stroke"
                cursor="pointer"
                fill="none"
                transform={this.getScale(sel)}
                onClick={ev => this.handleSelect(ev, sel)}
                onMouseDown={this.prevent}
              />
            ))}
            {!!currentDraw && (
              <path
                d={this.currentDrawToSVG()}
                stroke={selectedColor}
                strokeWidth={strokeWidth}
                pointerEvents="stroke"
                fill="none"
              />
            )}
          </svg>
        </div>
      </div>
    );
  }
}

SVGAnnotable.propTypes = {
  selectors: PropTypes.arrayOf(
    PropTypes.shape({
      svgPath: PropTypes.string, // a string that is an SVG path `d`
      widthAtCapture: PropTypes.number, // Optional but recommended. This records the width of the content of the `SVGAnnotable` component when the annotation was recorded. If present it will be used to transform the annotation when the current width is different from the original one
      heightAtCapture: PropTypes.number // Optional but recommended. This records the height of the content of the `SVGAnnotable` component when the annotation was recorded. If present it will be used to transform the annotation when the current height is different from the original one
    })
  ),
  children: PropTypes.node,
  color: PropTypes.string,
  selectedColor: PropTypes.string,
  strokeWidth: PropTypes.number,
  onSelectionChange: PropTypes.func,
  onSelectorAdded: PropTypes.func,
  onSelectorRemoved: PropTypes.func,
  readonly: PropTypes.bool
};
SVGAnnotable.defaultProps = {
  color: '#42a5f5',
  selectedColor: '#fc635d',
  strokeWidth: 8,
  readonly: false
};
