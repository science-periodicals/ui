import React from 'react';
import Iconoclass from '@scipe/iconoclass';
import { Spinner } from '../../src/';

export default class HeadersExample extends React.Component {
  constructor(props) {
    super(props);
    this.doProgress = this.doProgress.bind(this);
    this.state = {
      loadPercent: 5
    };
    this.timer = null;
  }

  componentDidMount() {
    // Commented out to make backstopJS testing easier
    // this.timer = window.setInterval(this.doProgress, 500);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  doProgress() {
    this.setState({
      loadPercent: this.state.loadPercent < 100 ? this.state.loadPercent + 5 : 0
    });
  }

  render() {
    return (
      <div className="example">
        <p>
          Possible values for progressMode are 'up', 'down', 'spinUp',
          'spinDown', 'bounce' or 'none'
        </p>
        <div className="example__row">
          <Spinner
            size={40}
            progressMode="spinUp"
            progress={this.state.loadPercent}
            showPercentage={true}
            label="spinUp"
          />
          <Spinner
            size={40}
            progressMode="spinDown"
            progress={this.state.loadPercent}
            showPercentage={true}
            label="spinDown"
          />
          <Spinner
            size={40}
            progressMode="bounce"
            progress={this.state.loadPercent}
            showPercentage={true}
            label="bounce"
          />
        </div>
        <div className="example__row">
          <Spinner
            size={40}
            progressMode="spinUp"
            progress={this.state.loadPercent}
            showPercentage={false}
            label="Loading..."
          >
            <Iconoclass iconName="search" iconSize={24} />
          </Spinner>
          <Spinner
            size={40}
            progressMode="spinUp"
            progress={this.state.loadPercent}
            showPercentage={false}
            heartbeat={true}
            label="With Hearbeat"
          >
            <Iconoclass iconName="search" iconSize={24} />
          </Spinner>
          <Spinner
            size={40}
            progressMode="spinUp"
            progress={this.state.loadPercent}
            showPercentage={false}
            label="Without Hearbeat"
          >
            <Iconoclass
              iconName="search"
              iconSize={40}
              round={true}
              color="orange"
            />
          </Spinner>
        </div>
        <div className="example__row">
          <Spinner
            size={32}
            progressMode="up"
            progress={this.state.loadPercent}
            showPercentage={false}
          />
          <Spinner
            size={32}
            progressMode="up"
            progress={this.state.loadPercent}
            showPercentage={false}
            heartbeat={true}
          />
        </div>
      </div>
    );
  }
}
