import React from 'react';
import { PaperTextarea } from '../../src/';

export default class PaperTextareaExample extends React.Component {
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
        <PaperTextarea name="normal-text" label="Normal Text" />
        <PaperTextarea name="large-text" label="large Text" large={true} />
        <PaperTextarea
          name="large-text-eror"
          label="large Text with error"
          large={true}
          error="This is your error!"
        />
        <PaperTextarea
          name="no-float"
          label="No Float Label"
          floatLabel={false}
        />
        <PaperTextarea
          name="no-float"
          label="Large No Float Label"
          floatLabel={false}
          large={true}
        />
        <PaperTextarea
          name="with-placeholder"
          label="With Placeholder"
          placeholder="Hello World"
          onResize={(height, prevHeight) => {
            console.log(height, prevHeight);
          }}
        />
        <PaperTextarea name="disabled" label="Disabled" disabled={true} />
        <PaperTextarea name="readonly" label="Read Only" readOnly={true} />

        <PaperTextarea
          name="custom-error"
          label="Custom Form Validation"
          placeholder="type a few letters"
          error={
            !this.state['custom-error'] || this.state['custom-error'].length < 5
              ? 'Please enter at least 5 letters'
              : null
          }
          onChange={this.handleChange}
        />
        <PaperTextarea
          name="display-error"
          label="Always Display Error"
          placeholder="type a few letters"
          error={
            !this.state['display-error'] ||
            this.state['display-error'].length < 5
              ? 'Please enter at least 5 letters'
              : null
          }
          mustDisplayError={true}
          onChange={this.handleChange}
        />
        <PaperTextarea
          name="default-value"
          label="Default Value"
          defaultValue="A first lineA default value specialy chosen so that it is long long long long long long long long long long so that it spans accross multiple line of the paper textarea react component"
          placeholder="a placeholder"
        />
        <PaperTextarea
          name="controlled-component"
          label="Controlled Component"
          placeholder="a placeholder"
          value={this.state['controlled-component']}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}
