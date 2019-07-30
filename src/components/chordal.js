import React from 'react';
import PropTypes from 'prop-types';
import { Motion, spring } from 'react-motion';
import Value from './value';
import ReactPortal from './react-portal';

export default class Chordal extends React.Component {
  static propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired,
        links: PropTypes.arrayOf(PropTypes.string).isRequired
      })
    ),
    dotHighlightSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    dotSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    distance: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    opacity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    highlightOpacity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    tooltipClass: PropTypes.string,
    highlight: PropTypes.string,
    onHighlight: PropTypes.func,
    noAnimation: PropTypes.bool,
    onClick: PropTypes.func
  };

  static defaultProps = {
    size: 200,
    dotHighlightSize: 5,
    dotSize: 4,
    opacity: 0.33,
    highlightOpacity: 1,
    distance: 0.9,
    tooltipClass: 'chordal__tooltip'
  };

  constructor(props, context) {
    super(props, context);
    this.previousPositions = {};
    this.state = {
      highlight: props.highlight || null
    };
    this.handleHover = this.handleHover.bind(this);
    this.handleOut = this.handleOut.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.random = 'random'; // for server side rendering we need a deterministic first value
  }

  handleHover(ev) {
    let id = ev.target.getAttribute('data-id');
    if (id) this.setState({ highlight: id });
  }

  handleOut() {
    this.setState({ highlight: null });
  }

  handleClick(ev) {
    if (!this.props.onClick) return;
    let id = ev.target.getAttribute('data-id');
    if (id) this.props.onClick(id);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.highlight !== this.props.highlight) {
      this.setState({ highlight: nextProps.highlight });
    }
  }

  componentWillUpdate(nextProps, nextState) {
    this.random = Math.random();
    if (
      this.props.onHighlight &&
      nextState.highlight !== this.state.highlight
    ) {
      this.props.onHighlight(nextState.highlight);
    }
  }

  getPositions(data) {
    let positions = {},
      { size, dotHighlightSize, distance } = this.props,
      defaultPosition = { x: size / 2, y: size / 2 },
      nodeCount = data.length;
    data.forEach((item, idx) => {
      let angle = 360 / nodeCount,
        radius = size / 2 - dotHighlightSize,
        currentAngle = angle * idx - 90,
        currentAngleRadians = currentAngle * (Math.PI / 180),
        x = size / 2 + radius * Math.cos(currentAngleRadians) * distance,
        y = size / 2 + radius * Math.sin(currentAngleRadians) * distance;
      positions[item.id] = {
        current:
          (this.previousPositions[item.id] &&
            this.previousPositions[item.id].next) ||
          defaultPosition,
        next: { x, y }, // XXX maybe use spring() directly here?
        color: item.color
      };
    });
    this.previousPositions = positions;
    return positions;
  }

  render() {
    let {
        size,
        data,
        dotSize,
        dotHighlightSize,
        opacity,
        tooltipClass,
        highlightOpacity,
        noAnimation = false
      } = this.props,
      { highlight } = this.state,
      tooltip;
    if (!data || !data.length)
      return (
        <div>
          <svg width={`${size}px`} height={`${size}px`} />
        </div>
      );
    let positions = this.getPositions(data),
      highlightPos =
        highlight && positions[highlight] && positions[highlight].next;
    if (highlight) {
      let item = data.filter(it => it.id === highlight)[0];
      if (item) tooltip = item.label;
    }
    return (
      <div className="chordal">
        <div style={{ position: 'relative' }}>
          {tooltip && (
            <ReactPortal widthSource="none">
              <Value
                className={'chordal__tooltip ' + tooltipClass}
                style={{
                  visibility: tooltip ? 'visible' : 'hidden',
                  position: 'absolute',
                  height: 'auto',
                  width: 'max-content',
                  maxWidth: '250px',
                  verticalAlign: 'middle',
                  pointerEvents: 'none',
                  zIndex: 1,
                  top: highlightPos ? `${highlightPos.y - 12}px` : 0,
                  left: highlightPos ? `${highlightPos.x + 6}px ` : 0
                }}
              >
                {tooltip}
              </Value>
            </ReactPortal>
          )}
        </div>

        <svg width={`${size}px`} height={`${size}px`}>
          {data.map(item => (
            <Motion
              defaultStyle={positions[item.id].current}
              style={{
                x: noAnimation
                  ? positions[item.id].next.x
                  : spring(positions[item.id].next.x),
                y: noAnimation
                  ? positions[item.id].next.y
                  : spring(positions[item.id].next.y)
              }}
              key={item.id}
            >
              {val => (
                <g>
                  {(item.links || [])
                    .map(link => {
                      if (!positions[link]) return false;
                      return (
                        <Motion
                          defaultStyle={positions[link].current}
                          style={{
                            x: noAnimation
                              ? positions[link].next.x
                              : spring(positions[link].next.x),
                            y: noAnimation
                              ? positions[link].next.y
                              : spring(positions[link].next.y)
                          }}
                          key={link}
                        >
                          {to => (
                            <g>
                              <linearGradient
                                id={`chordal-${item.id}-${link}-${this.random}`}
                                gradientUnits="userSpaceOnUse"
                                x1={val.x}
                                y1={val.y}
                                x2={to.x}
                                y2={to.y}
                              >
                                <stop offset="0%" stopColor={item.color} />
                                <stop
                                  offset="100%"
                                  stopColor={positions[link].color}
                                />
                              </linearGradient>
                              <line
                                stroke={`url(#chordal-${item.id}-${link}-${this.random})`}
                                x1={val.x}
                                y1={val.y}
                                x2={to.x}
                                y2={to.y}
                                strokeWidth={dotSize * 2}
                                strokeOpacity={opacity}
                                strokeLinecap="round"
                                pointerEvents="none"
                              />
                            </g>
                          )}
                        </Motion>
                      );
                    })
                    .filter(x => x)}
                  <circle
                    cx={val.x}
                    cy={val.y}
                    r={highlight === item.id ? dotHighlightSize : dotSize}
                    fillOpacity={
                      highlight === item.id ? highlightOpacity : opacity
                    }
                    fill={item.color}
                    data-id={item.id}
                    onClick={this.handleClick}
                    onMouseOver={this.handleHover}
                    onMouseOut={this.handleOut}
                  >
                    <desc>{val.label}</desc>
                  </circle>
                </g>
              )}
            </Motion>
          ))}
        </svg>
      </div>
    );
  }
}
