import React from 'react';
import { getParts } from 'schema.org/utils';
import { Chordal, schemaToChordal, PaperButton } from '../../src/';

let data = [
    {
      id: 'a',
      label: 'Buffy',
      color: '#ff6146',
      links: ['b', 'c']
    },
    {
      id: 'b',
      label: 'Faith',
      color: '#3f6560',
      links: ['e']
    },
    {
      id: 'c',
      label: 'Willow',
      color: '#e3d800',
      links: ['d']
    },
    {
      id: 'd',
      label: 'Xander',
      color: '#d5a427',
      links: ['e']
    },
    {
      id: 'e',
      label: 'Spike',
      color: '#33ace0',
      links: ['c']
    }
  ],
  bibSample = require('../../test/fixtures/bib-sample.json'),
  characters = [
    'Angel',
    'Dru',
    'Fred',
    'Illaria',
    'Dawn',
    'Anya',
    'Harmony',
    'Glory',
    'Giles',
    'Andrew',
    'Tara',
    'Kennedy'
  ],
  char = 65,
  nextID = 102, // 'f'
  label = () => {
    if (characters.length) return characters.shift();
    return String.fromCharCode(char++);
  },
  colours = [
    '#3f2860',
    '#3f6560',
    '#e3d800',
    '#d5a427',
    '#33ace0',
    '#40b34f',
    '#ff6146',
    '#c0123f',
    '#3851cd'
  ];

export default class ChordalExample extends React.Component {
  constructor() {
    super();
    this.state = {
      size: 300,
      distance: 0.9,
      dotSize: 4,
      dotHighlightSize: 5,
      opacity: 0.3,
      highlightOpacity: 0.5,
      highlight: null,
      lastClick: '-',
      data
    };
    let stateChanger = field => ev => {
      let obj = {};
      obj[field] = ev.target.value;
      this.setState(obj);
    };
    this.handleSizeChange = stateChanger('size');
    this.handleDistanceChange = stateChanger('distance');
    this.handleDotSizeChange = stateChanger('dotSize');
    this.handleDotHighlightSizeChange = stateChanger('dotHighlightSize');
    this.handleOpacityChange = stateChanger('opacity');
    this.handleHightlightOpacityChange = stateChanger('highlightOpacity');
    this.handleHighlightChange = stateChanger('highlight');
    this.handleNoAnimationChange = ev =>
      this.setState({ noAnimation: ev.target.checked });
    this.handleHightlight = id => this.setState({ highlight: id });
    this.handleClick = id => this.setState({ lastClick: id || '-' });
    this.handleReorder = () =>
      this.setState({ data: shuffle(this.state.data || []) });
    this.handleRotate = () => {
      this.state.data.push(this.state.data.shift());
      this.setState({ data: this.state.data });
    };
    this.handleRemove = () => {
      if (this.state.data.length < 2) return;
      let idx = Math.floor(Math.random() * this.state.data.length),
        removed = this.state.data.splice(idx, 1)[0];
      if (removed.label.length > 1) characters.push(removed.label);
      this.state.data.forEach(item => {
        let index = (item.links || []).indexOf(removed.id);
        if (~index) item.links.splice(index, 1);
      });
      this.setState({ data: this.state.data });
    };
    this.handleAdd = () => {
      addItem();
      this.setState({ data: this.state.data });
    };
    this.handleBibSample = () => {
      this.setState({
        data: schemaToChordal([bibSample].concat(getParts(bibSample)))
      });
    };
    this.handleThousand = () => {
      for (let i = 0; i < 100; i++) {
        addItem(0.01);
      }
      this.setState({ data: this.state.data });
    };
    let addItem = (prob = 0.1) => {
      let newItem = {
        id: String.fromCharCode(nextID++),
        label: label(),
        color: colours[Math.floor(Math.random() * colours.length)],
        links: []
      };
      // 1/10th chance of linking to others, same of being linked to
      this.state.data.forEach(item => {
        if (Math.random() < prob) newItem.links.push(item.id);
        else if (Math.random() < prob) item.links.push(newItem.id);
      });
      this.state.data.push(newItem);
    };
  }

  render() {
    let s = this.state;
    return (
      <div className="example">
        <style>
          {`
          .chordal__instance {
            border: 1px solid #eee;
            display: inline-block;
          }
          
          div.line {
            min-width: 500px;
            border-bottom: 1px solid lightgrey;
            padding: 10px;
            text-align: left;
          }
          div.line:last-of-type {
            border-bottom: none;
          }
          div.line > label {
            display: inline-block;
            font-weight: bold;
            min-width: 200px;
          }
          p {
            text-align: center;
          }
        `}
        </style>
        <div className="chordal__instance">
          <Chordal
            {...s}
            onHighlight={this.handleHightlight}
            onClick={this.handleClick}
          />
        </div>
        <div className="line">
          <label htmlFor="noAnimation">disable animation</label>
          <input
            type="checkbox"
            value={s.noAnimation}
            onChange={this.handleNoAnimationChange}
            id="noAnimation"
          />
        </div>
        <div className="line">
          <label htmlFor="size">size</label>
          <input
            type="number"
            value={s.size}
            onChange={this.handleSizeChange}
            id="size"
          />
        </div>
        <div className="line">
          <label htmlFor="distance">distance</label>
          <input
            type="number"
            value={s.distance}
            onChange={this.handleDistanceChange}
            min="0.1"
            max="1.0"
            step="0.1"
            id="distance"
          />
        </div>
        <div className="line">
          <label htmlFor="dotSize">dot size</label>
          <input
            type="number"
            value={s.dotSize}
            onChange={this.handleDotSizeChange}
            min="1"
            id="dotSize"
          />
        </div>
        <div className="line">
          <label htmlFor="dotHighlightSize">dot highlight size</label>
          <input
            type="number"
            value={Math.max(s.dotHighlightSize, s.dotSize)}
            onChange={this.handleDotHighlightSizeChange}
            min={s.dotSize}
            id="dotHighlightSize"
          />
        </div>
        <div className="line">
          <label htmlFor="opacity">opacity</label>
          <input
            type="number"
            value={s.opacity}
            onChange={this.handleOpacityChange}
            min="0.1"
            max="1"
            step="0.1"
            id="line"
          />
        </div>
        <div className="line">
          <label htmlFor="highlightOpacity">highlight opacity</label>
          <input
            type="number"
            value={s.highlightOpacity}
            onChange={this.handleHightlightOpacityChange}
            min="0.1"
            max="1"
            step="0.1"
            id="highlightOpacity"
          />
        </div>
        <div className="line">
          <label htmlFor="currentHighlight">current highlight</label>
          <select
            value={s.highlight || ''}
            onChange={this.handleHighlightChange}
            id="currentHighlight"
          >
            <option>-</option>
            {this.state.data.map(it =>
              <option value={it.id} key={it.id}>
                {it.label}
              </option>
            )}
          </select>
        </div>
        <div className="line">
          <label htmlFor="currentClick">current click (id)</label>
          <span>
            {s.lastClick}
          </span>
        </div>
        <div className="line" style={{ textAlign: 'center' }}>
          <PaperButton onClick={this.handleReorder}>reorder</PaperButton>
          <PaperButton onClick={this.handleRotate}>rotate</PaperButton>
          <PaperButton onClick={this.handleRemove}>remove</PaperButton>
          <PaperButton onClick={this.handleAdd}>add</PaperButton>
          <PaperButton onClick={this.handleBibSample}>bib-sample</PaperButton>
          <PaperButton onClick={this.handleThousand}>hundred</PaperButton>
        </div>
      </div>
    );
  }
}

function shuffle(arr) {
  let cur = arr.length;
  while (cur !== 0) {
    let rnd = Math.floor(Math.random() * cur);
    cur--;
    let tmp = arr[cur];
    arr[cur] = arr[rnd];
    arr[rnd] = tmp;
  }
  return arr;
}
