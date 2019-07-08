import React from 'react';
import { PaperSubdomain } from '../../src/';

export default class PaperInputExample extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      'controlled-component': ''
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  render() {
    return (
      <div className="example">
        Note: having multiple instances of this component with different font
        properties loaded seems to cause problems with react-input-autosize.
        <div className="example__row">
          <PaperSubdomain placeholder="large-subdomain" large={true} />
        </div>
        <div className="example__row">
          <PaperSubdomain disabled placeholder="large-subdomain" large={true} />
        </div>
        <div className="example__row">
          <PaperSubdomain readOnly placeholder="large-subdomain" large={true} />
        </div>
      </div>
    );
  }
}
