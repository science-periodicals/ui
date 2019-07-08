import React from 'react';
import { PaperInput } from '../../src/';

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
        <PaperInput name="normal-text" label="Normal Text" />
        <PaperInput
          name="normal-text"
          label="Normal Text With Existing Value"
          value="Ceci est un test"
        />
        <PaperInput name="normal-text" label="Large is False" large={false} />
        <PaperInput
          name="required-normal-text"
          label="Required Input with Normal Text With Existing Value"
          required={true}
        />
        <PaperInput name="large-text" label="Large Text" large={true} />
        <PaperInput
          name="no-float"
          label="No Float Label"
          large={true}
          floatLabel={false}
        />
        <PaperInput
          name="with-placeholder"
          label="With Placeholder"
          large={true}
          placeholder="Hello World"
        />
        <PaperInput
          name="disabled"
          label="Disabled"
          disabled={true}
          large={true}
        />
        <PaperInput
          name="readonly"
          label="Read Only"
          readOnly={true}
          large={true}
        />
        <PaperInput
          name="email"
          label="Email Validation"
          type="email"
          placeholder="me@example.com"
          error={
            !this.state.email || !this.state.email.match(/.+@.+\..+/)
              ? 'Please enter a valid email address'
              : null
          }
          large={true}
          onChange={this.handleChange}
        />
        <PaperInput
          name="custom-error"
          label="Custom Form Validation"
          placeholder="type a few letters"
          large={true}
          error={
            !this.state['custom-error'] || this.state['custom-error'].length < 5
              ? 'Please enter at least 5 letters'
              : null
          }
          onChange={this.handleChange}
        />
        <PaperInput
          name="display-error"
          label="Always Display Error"
          placeholder="type a few letters"
          large={true}
          error={
            !this.state['display-error'] ||
            this.state['display-error'].length < 5
              ? 'Please enter at least 5 letters'
              : null
          }
          mustDisplayError={true}
          onChange={this.handleChange}
        />
        <PaperInput
          name="default-value"
          label="Default Value"
          large={true}
          defaultValue="a default value"
          placeholder="a placeholder"
        />
        <PaperInput
          name="controlled-component"
          label="Controlled Component"
          large={true}
          placeholder="a placeholder"
          value={this.state['controlled-component']}
          onChange={this.handleChange}
        />
        <PaperInput
          name="controlled-component"
          label="Read Only Label"
          large={true}
          placeholder="Read Only"
          value="Read Only Value"
          readOnly={true}
        />
      </div>
    );
  }
}
