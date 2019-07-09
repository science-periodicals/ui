import React from 'react';
import {
  PaperSelect,
  PaperInput,
  PaperTextarea,
  PaperDateInput,
  TimePicker,
  PaperTimeInput,
  RichTextarea,
  MenuItem,
  LayoutWrapRows,
  LayoutWrapItem,
  ColorPicker,
  BemTags
} from '../../src/';
import { CountryAutocomplete as PaperAutocomplete } from './paper-autocomplete-example';

export default class PaperSuiteExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  render() {
    const bem = BemTags('example');
    return (
      <div className="example" style={{ width: '75vw', border: '1px solid' }}>
        <LayoutWrapRows className={bem`__layout-row __test`}>
          <LayoutWrapItem className={bem`row-item`}>
            <div style={{ minWidth: '300px' }}>
              <PaperDateInput
                label="Due Date"
                className="exampleDateInput"
                date={new Date('2019-04-11T18:16:34.535Z')}
                floatLabel={false}
              />
            </div>
          </LayoutWrapItem>
          <LayoutWrapItem className="example__row-item">
            <div style={{ minWidth: '300px' }}>
              <PaperTimeInput
                onChange={() => console.log('PaperTimeInput onChange')}
                value={new Date('2019-04-11T18:16:34.535Z')}
                label="Time"
                name="exampleName"
                floatLabel={false}
              >
                <MenuItem value="09:00">
                  <span style={{ color: 'grey' }}>09:00 AM </span> Morning
                </MenuItem>
                <MenuItem value="12:00">
                  <span style={{ color: 'grey' }}>12:00 PM </span> Afternoon
                </MenuItem>
                <MenuItem value="18:00">
                  <span style={{ color: 'grey' }}>06:00 PM </span> Evening
                </MenuItem>
              </PaperTimeInput>
            </div>
          </LayoutWrapItem>
        </LayoutWrapRows>

        <LayoutWrapRows>
          <LayoutWrapItem className="example__row-item">
            <PaperDateInput
              label="Due Date"
              className="exampleDateInput"
              date={new Date('2019-04-11T18:16:34.535Z')}
              floatLabel={true}
            />
          </LayoutWrapItem>
          <LayoutWrapItem className="example__row-item">
            <PaperTimeInput
              onChange={() => console.log('PaperTimeInput onChange')}
              value={new Date('2019-04-11T18:16:34.535Z')}
              label="Time"
              name="exampleName"
              floatLabel={true}
            >
              <MenuItem value="09:00">
                <span style={{ color: 'grey' }}>09:00 AM </span> Morning
              </MenuItem>
              <MenuItem value="12:00">
                <span style={{ color: 'grey' }}>12:00 PM </span> Afternoon
              </MenuItem>
              <MenuItem value="18:00">
                <span style={{ color: 'grey' }}>06:00 PM </span> Evening
              </MenuItem>
            </PaperTimeInput>
          </LayoutWrapItem>
        </LayoutWrapRows>

        <LayoutWrapRows>
          <LayoutWrapItem className="example__row-item">
            <PaperDateInput
              label="Due Date"
              className="exampleDateInput"
              date={new Date('2019-04-11T18:16:34.535Z')}
              floatLabel={true}
              readOnly={true}
            />
          </LayoutWrapItem>
          <LayoutWrapItem className="example__row-item">
            <PaperTimeInput
              value={new Date('2019-04-11T18:16:34.535Z')}
              onChange={() => console.log('PaperTimeInput onChange')}
              label="Time"
              name="exampleName"
              floatLabel={true}
              readOnly={true}
            >
              <MenuItem value="09:00">
                <span style={{ color: 'grey' }}>09:00 AM </span> Morning
              </MenuItem>
              <MenuItem value="12:00">
                <span style={{ color: 'grey' }}>12:00 PM </span> Afternoon
              </MenuItem>
              <MenuItem value="18:00">
                <span style={{ color: 'grey' }}>06:00 PM </span> Evening
              </MenuItem>
            </PaperTimeInput>
          </LayoutWrapItem>
        </LayoutWrapRows>

        <LayoutWrapRows>
          <LayoutWrapItem className="example__row-item">
            <PaperDateInput
              label="Due Date"
              className="exampleDateInput"
              date={new Date('2019-04-11T18:16:34.535Z')}
              floatLabel={true}
              disabled={true}
            />
          </LayoutWrapItem>
          <LayoutWrapItem className="example__row-item">
            <PaperTimeInput
              onChange={() => console.log('PaperTimeInput onChange')}
              value={new Date('2019-04-11T18:16:34.535Z')}
              label="Time"
              name="exampleName"
              floatLabel={true}
              disabled={true}
            >
              <MenuItem value="09:00">
                <span style={{ color: 'grey' }}>09:00 AM </span> Morning
              </MenuItem>
              <MenuItem value="12:00">
                <span style={{ color: 'grey' }}>12:00 PM </span> Afternoon
              </MenuItem>
              <MenuItem value="18:00">
                <span style={{ color: 'grey' }}>06:00 PM </span> Evening
              </MenuItem>
            </PaperTimeInput>
          </LayoutWrapItem>
        </LayoutWrapRows>

        <div className="example__row">
          <div className="example__row-item">
            <PaperSelect
              label="PaperSelect"
              className="example__paper-select"
              onChange={e =>
                console.log(
                  'Paper Select: ',
                  e.nativeEvent.target.selectedIndex
                )
              }
            >
              <option value="option1">option A</option>
              <option value="option2">option B</option>
              <option value="option3">option three</option>
            </PaperSelect>
          </div>
          <div className="example__row-item">
            <PaperInput name="normal-text" label="PaperInput" />
          </div>
          <div className="example__row-item">
            <PaperTextarea name="normal-text" label="PaperTextarea" />
          </div>
          <div className="example__row-item">
            <PaperAutocomplete floatLabel={true} />
          </div>
          <div className="example__row-item">
            <ColorPicker id="color1" matchFloatLabel={true} />
          </div>
        </div>
        <div className="example__row">
          <div className="example__row-item">
            <PaperSelect
              label="PaperSelect"
              className="example__paper-select"
              onChange={e =>
                console.log(
                  'Paper Select: ',
                  e.nativeEvent.target.selectedIndex
                )
              }
              floatLabel={false}
            >
              <option value="option1">option A</option>
              <option value="option2">option B</option>
              <option value="option3">option three</option>
            </PaperSelect>
          </div>
          <div className="example__row-item">
            <PaperInput
              name="normal-text"
              label="PaperInput"
              floatLabel={false}
            />
          </div>
          <div className="example__row-item">
            <PaperTextarea
              name="normal-text"
              label="PaperTextarea"
              floatLabel={false}
            />
          </div>
          <div className="example__row-item">
            <PaperAutocomplete floatLabel={false} />
          </div>
          <div className="example__row-item">
            <TimePicker onChange={() => {}} />
          </div>
          <div className="example__row-item">
            <ColorPicker id="color2" swatchSize={30} />
          </div>
        </div>
        <div className="example__row">
          <div className="example__row-item">
            <PaperSelect
              label="PaperSelect Large"
              className="example__paper-select"
              onChange={e =>
                console.log(
                  'Paper Select: ',
                  e.nativeEvent.target.selectedIndex
                )
              }
              large={true}
            >
              <option value="option1">option A</option>
              <option value="option2">option B</option>
              <option value="option3">option three</option>
            </PaperSelect>
          </div>
          <div className="example__row-item">
            <PaperInput
              name="normal-text"
              label="PaperInput large"
              large={true}
            />
          </div>
          <div className="example__row-item">
            <PaperTextarea
              name="normal-text"
              label="PaperTextarea Large"
              large={true}
            />
          </div>
          <div className="example__row-item">
            <ColorPicker id="color3" matchFloatLabel={true} large={true} />
          </div>
        </div>
        <div className="example__row">
          <div className="example__row-item">
            <PaperSelect
              label="PaperSelect Large No Float"
              className="example__paper-select"
              onChange={e =>
                console.log(
                  'Paper Select: ',
                  e.nativeEvent.target.selectedIndex
                )
              }
              large={true}
              floatLabel={false}
            >
              <option value="option1">option A</option>
              <option value="option2">option B</option>
              <option value="option3">option three</option>
            </PaperSelect>
          </div>
          <div className="example__row-item">
            <PaperInput
              name="normal-text"
              label="PaperInput large No Float"
              large={true}
              floatLabel={false}
            />
          </div>
          <div className="example__row-item">
            <PaperTextarea
              name="normal-text"
              label="PaperTextarea Large No Float"
              large={true}
              floatLabel={false}
            />
          </div>
          <div className="example__row-item">
            <ColorPicker id="color4" matchFloatLabel={false} large={true} />
          </div>
        </div>
        <div className="example__row">
          <div className="example__row-item">
            <PaperInput
              name="email"
              label="Paper Input Email Validation"
              type="email"
              placeholder="me@example.com"
              error={
                !this.state.email || !this.state.email.match(/.+@.+\..+/)
                  ? 'Please enter a valid email address'
                  : null
              }
              large={false}
              onChange={this.handleChange}
            />
          </div>
          <div className="example__row-item">
            <PaperTextarea
              name="custom-error"
              label="Paper Textarea Form Validation"
              placeholder="type a few letters"
              error={
                !this.state['custom-error'] ||
                this.state['custom-error'].length < 5
                  ? 'Please enter at least 5 letters'
                  : null
              }
              onChange={this.handleChange}
            />
          </div>
        </div>
        <div className="example__row">
          <div className="example__row-item">
            <PaperInput
              name="email"
              label="Paper Input Email Validation"
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
          </div>
          <div className="example__row-item">
            <PaperTextarea
              name="custom-error"
              label="Paper Textarea Form Validation"
              placeholder="type a few letters"
              error={
                !this.state['custom-error'] ||
                this.state['custom-error'].length < 5
                  ? 'Please enter at least 5 letters'
                  : null
              }
              onChange={this.handleChange}
              large={true}
            />
          </div>
        </div>
        <div style={{ font: 'var(--serif-body-type)', fontSize: '16pt' }}>
          <div className="example__row">
            <h3>
              Normal, ReadOnly, & Disabled Mode Comparison with serif container
              font
            </h3>
          </div>
          {/* Paper Input */}
          <LayoutWrapRows>
            <LayoutWrapItem>
              <PaperInput
                name="normal-text"
                label="PaperInput"
                value="Normal Input"
              />
            </LayoutWrapItem>
            <LayoutWrapItem>
              <PaperInput
                name="normal-text"
                label="PaperInput"
                readOnly={true}
                value="ReadOnly Input"
              />
            </LayoutWrapItem>
            <LayoutWrapItem>
              <PaperInput
                name="normal-text"
                label="PaperInput"
                disabled={true}
                value="Disabled Input"
              />
            </LayoutWrapItem>
          </LayoutWrapRows>
          {/* Large Paper Input */}
          <LayoutWrapRows>
            <LayoutWrapItem>
              <PaperInput
                name="normal-text"
                label="PaperInput"
                defaultValue="Large Normal Input"
                large={true}
              />
            </LayoutWrapItem>
            <LayoutWrapItem>
              <PaperInput
                name="normal-text"
                label="PaperInput"
                readOnly={true}
                value="Large ReadOnly Input"
                large={true}
              />
            </LayoutWrapItem>
            <LayoutWrapItem>
              <PaperInput
                name="normal-text"
                label="PaperInput"
                disabled={true}
                value="Large Disabled Input"
                large={true}
              />
            </LayoutWrapItem>
            <LayoutWrapItem>
              <PaperInput
                name="normal-text"
                label="PaperInput"
                readOnly={true}
                large={true}
              />
            </LayoutWrapItem>
          </LayoutWrapRows>
          <LayoutWrapRows>
            <LayoutWrapItem>
              <RichTextarea
                name="single"
                label="RichTextarea"
                defaultValue="RichTextarea regular Mode"
              />
            </LayoutWrapItem>
            <LayoutWrapItem>
              <RichTextarea
                name="single"
                readOnly={true}
                label="RichTextarea"
                defaultValue="RichTextarea ReadOnly Mode"
              />
            </LayoutWrapItem>
            <LayoutWrapItem>
              <RichTextarea
                name="single"
                disabled={true}
                label="RichTextarea"
                defaultValue="RichTextarea Disabled Mode"
              />
            </LayoutWrapItem>
            <LayoutWrapItem>
              <RichTextarea
                name="single"
                disabled={true}
                label="RichTextarea"
              />
            </LayoutWrapItem>
          </LayoutWrapRows>
          {/* PaperTextarea */}
          <div className="example__row" />
          <LayoutWrapRows>
            <LayoutWrapItem>
              <PaperTextarea
                label="Paper Textarea"
                value="PaperTextarea Normal Mode"
              />
            </LayoutWrapItem>
            <LayoutWrapItem>
              <PaperTextarea
                label="Paper Textarea"
                value="PaperTextarea ReadOnly Mode"
                readOnly={true}
              />
            </LayoutWrapItem>
            <LayoutWrapItem>
              <PaperTextarea
                label="Paper Textarea"
                value="PaperTextarea Disabled Mode"
                disabled={true}
              />
            </LayoutWrapItem>
            <LayoutWrapItem>
              <PaperTextarea label="Paper Textarea" disabled={true} />
            </LayoutWrapItem>
          </LayoutWrapRows>
          <div className="example__row" />
          {/* Paper Select */}
          <LayoutWrapRows>
            <LayoutWrapItem>
              <PaperSelect label="PaperSelect" defaultValue="option1">
                <option value="option1">Normal Paper Select</option>
              </PaperSelect>
            </LayoutWrapItem>
            <LayoutWrapItem>
              <PaperSelect
                label="PaperSelect"
                defaultValue="option1"
                readOnly={true}
              >
                <option value="option1">ReadOnly Paper Select</option>
              </PaperSelect>
            </LayoutWrapItem>
            <LayoutWrapItem>
              <PaperSelect
                label="PaperSelect"
                defaultValue="option1"
                disabled={true}
              >
                <option value="option1">Disabled Paper Select</option>
              </PaperSelect>
            </LayoutWrapItem>
          </LayoutWrapRows>
          <div className="example__row" />
          {/* Paper autoComplete */}
          <LayoutWrapRows>
            <LayoutWrapItem>
              <PaperAutocomplete
                floatLabel={true}
                defaultValue="normal autocomplete"
              />
            </LayoutWrapItem>
            <LayoutWrapItem>
              <PaperAutocomplete
                floatLabel={true}
                defaultValue="readOnly autocomplete"
                inputProps={{ readOnly: true }}
              />
            </LayoutWrapItem>
            <LayoutWrapItem>
              <PaperAutocomplete
                floatLabel={true}
                defaultValue="disabled autocomplete"
                inputProps={{ disabled: true }}
              />
            </LayoutWrapItem>
          </LayoutWrapRows>
        </div>
      </div>
    );
  }
}
