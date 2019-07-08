import React from 'react';
import { PaperSelect } from '../../src';
import { Value } from '../../src/';

export default class TypographyExample extends React.Component {
  constructor(props) {
    super(props);
    this.style = 'ui';
    this.handleChange = this.handleChange.bind(this);
    this.handleSemanticChange = this.handleSemanticChange.bind(this);
    this.state = {
      style: 'ui',
      semanticStyle: 'sa__serif-body-user-type',
      darkMode: 'normal'
    };
  }

  handleChange(e) {
    this.setState({ style: e.target.value });
  }

  handleSemanticChange(e) {
    console.log('handleSemanticChange', e);
    this.setState({ semanticStyle: e.target.value });
  }

  getCSSVarName(name) {
    if (name) {
      return `--${this.state.style}-type--${name}`;
    } else {
      return `--${this.state.style}-type`;
    }
  }
  getStyle(name) {
    const varPrefix = this.getCSSVarName(name);
    const style = {
      font: `var(${varPrefix})`,
      color: `var(${varPrefix}__color)`,
      letterSpacing: `var(${varPrefix}__letter-spacing)`
    };

    return style;
  }

  render() {
    const varPrefix = `--${this.state.style}-type`;
    return (
      <div
        className="example"
        style={{
          background: this.state.darkMode == 'dark' ? 'black' : 'white'
        }}
      >
        <div className="example__row">
          <div className="sa__type-notice">
            This is a notice using the '.sa__type-notice' class.
          </div>
        </div>
        <div className="example__row">
          The Semantic Class will be wrapped inside of the Standard class to
          check for global overrides
          <div>
            <h4>Dark Mode</h4>
            <PaperSelect
              label="Dark Mode"
              className="example__paper-select"
              onChange={e => this.setState({ darkMode: e.target.value })}
              floatLabel={false}
              value={this.state.darkMode}
            >
              <option value="dark">Dark Mode</option>
              <option value="normal">Normal Mode</option>
              <option value="css-auto">Auto</option>
            </PaperSelect>
          </div>
          <div>
            <h4>Semantic Type Classes</h4>
            <PaperSelect
              label="Type Style"
              className="example__paper-select"
              onChange={this.handleSemanticChange}
              floatLabel={false}
              value={this.state.semanticStyle}
            >
              <option value="sa__sans-body-user-type">
                sa__sans-body-user-type
              </option>
              <option value="sa__sans-body-print-user-type">
                sa__sans-body-print-user-type
              </option>
              <option value="sa__serif-body-user-type">
                sa__serif-body-user-type
              </option>
              <option value="sa__ui-user-type">sa__ui-user-type</option>
            </PaperSelect>
          </div>
          <div>
            <h4>Standard Type Classes</h4>
            <PaperSelect
              label="Type Style"
              className="example__paper-select"
              onChange={this.handleChange}
              floatLabel={false}
              value={this.state.style}
            >
              <option value="ui">UI</option>
              <option value="sans-body">Sans-Serif</option>
              <option value="sans-body-print">Sans-Serif Print</option>
              <option value="serif-body">Serif</option>
              <option value="serif-body-print">Serif Print</option>
            </PaperSelect>
          </div>
        </div>

        <div className="example__row">
          <div
            style={{
              color: 'red',
              fontFamily: 'Comic Sans MS',
              letterSpacing: '.5em'
            }}
          >
            <h1 style={this.getStyle('big--headline')}>
              This is a Big Headline ({this.getCSSVarName('big--headline')})
            </h1>
            <h1 style={this.getStyle('headline')}>
              This is a Headline ({this.getCSSVarName('headline')})
            </h1>
            <p style={this.getStyle('big')}>
              This is big body type ({this.getCSSVarName('big')}
              ). Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Vestibulum interdum vitae nisi at pretium. Vestibulum semper sit
              amet lorem vitae pulvinar. Vivamus sed varius risus, vitae
              tincidunt diam. Sed ac sem id augue suscipit hendrerit. Nulla
              auctor tincidunt volutpat. Nam ut lectus tortor. Duis dignissim
              massa porttitor, sodales orci et, sodales nisi. Maecenas eu magna
              quis quam lacinia tristique. Sed laoreet leo at quam hendrerit
              vestibulum. Vivamus erat turpis, consequat vel mattis at, tempor
              sed diam. Duis ut aliquet sapien. Nunc non sagittis dui, id
              faucibus est. Praesent tempor mi et odio semper, et ullamcorper
              nisl porta.
            </p>
            <h2 style={this.getStyle('subhead-1')}>
              This is a Sub Headline 1 ({this.getCSSVarName('subhead-1')})
            </h2>
            <p style={this.getStyle()}>
              This is regular body type ({this.getCSSVarName()}
              ). Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Vestibulum interdum vitae nisi at pretium. Vestibulum semper sit
              amet lorem vitae pulvinar. Vivamus sed varius risus, vitae
              tincidunt diam. Sed ac sem id augue suscipit hendrerit. Nulla
              auctor tincidunt volutpat. Nam ut lectus tortor. Duis dignissim
              massa porttitor, sodales orci et, sodales nisi. Maecenas eu magna
              quis quam lacinia tristique. Sed laoreet leo at quam hendrerit
              vestibulum. Vivamus erat turpis, consequat vel mattis at, tempor
              sed diam. Duis ut aliquet sapien. Nunc non sagittis dui, id
              faucibus est. Praesent tempor mi et odio semper, et ullamcorper
              nisl porta.
              <ul>
                <li>list item 1</li>
                <li>list item 2</li>
              </ul>
              <ol>
                <li>ol item 1</li>
                <li>ol item 2</li>
              </ol>
              <br />
              <br />
              <div style={{ border: '1px solid whitesmoke', padding: '16px' }}>
                <h3>{`"${this.state.semanticStyle}"`} Nested Semantic Type:</h3>
                <Value className={this.state.semanticStyle}>
                  {{
                    '@type': 'rdf:HTML',
                    '@value':
                      '<h1>H1 Title</h1><p>Lorem ipsum dolor <sup>sup 1</sup> sit amet, <b>bold</b>consectetur adipiscing elit. Vestibulum <em>em</em> interdum vitae nisi at pretium. Vestibulum <i>i</i> semper sit amet lorem vitae pulvinar. Vivamus sed varius risus, vitae tincidunt diam. Sed ac sem id augue suscipit hendrerit. Nulla auctor tincidunt volutpat. Nam ut lectus tortor. Duis dignissim massa porttitor, sodales orci et, sodales nisi. Maecenas eu magna quis quam lacinia tristique. Sed laoreet leo at quam hendrerit vestibulum. Vivamus erat turpis, consequat vel mattis at, tempor sed diam. Duis ut aliquet sapien. Nunc non sagittis dui, id faucibus est. Praesent tempor mi et odio semper, et ullamcorper nisl porta. </P><ul><li>list item 1</li><li>list item 2</li></ul><ol><li>ol item 1</li><li>ol item 2</li></ol><h2>H2 Title</h2><p>Lorem ipsum dolor <sup>sup 1</sup> sit amet, <b>bold</b> consectetur adipiscing elit. Vestibulum <em>em</em> interdum vitae nisi at pretium. Vestibulum <i>i</i> semper sit amet lorem vitae pulvinar. Vivamus sed varius risus, vitae tincidunt diam. Sed ac sem id augue suscipit hendrerit. Nulla auctor tincidunt volutpat. Nam ut lectus tortor. Duis dignissim massa porttitor, sodales orci et, sodales nisi. Maecenas eu magna quis quam lacinia tristique. Sed laoreet leo at quam hendrerit vestibulum. Vivamus erat turpis, consequat vel mattis at, tempor sed diam. Duis ut aliquet sapien. Nunc non sagittis dui, id faucibus est. Praesent tempor mi et odio semper, et ullamcorper nisl porta. </P>'
                  }}
                </Value>
              </div>
            </p>
            <h3 style={this.getStyle('subhead-2')}>
              This is a Sub Headline 2 ({this.getCSSVarName('subhead-2')})
            </h3>
            <p style={this.getStyle('small')}>
              This is small body type ({this.getCSSVarName('small')}
              ). Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Vestibulum interdum vitae nisi at pretium. Vestibulum semper sit
              amet lorem vitae pulvinar. Vivamus sed varius risus, vitae
              tincidunt diam. Sed ac sem id augue suscipit hendrerit. Nulla
              auctor tincidunt volutpat. Nam ut lectus tortor. Duis dignissim
              massa porttitor, sodales orci et, sodales nisi. Maecenas eu magna
              quis quam lacinia tristique. Sed laoreet leo at quam hendrerit
              vestibulum. Vivamus erat turpis, consequat vel mattis at, tempor
              sed diam. Duis ut aliquet sapien. Nunc non sagittis dui, id
              faucibus est. Praesent tempor mi et odio semper, et ullamcorper
              nisl porta.
            </p>
            <h3 style={this.getStyle('subhead-3')}>
              This is a Sub Headline 3 ({this.getCSSVarName('subhead-3')})
            </h3>
            <p style={this.getStyle('caption')}>
              This is caption type ({this.getCSSVarName('caption')}
              ). Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Vestibulum interdum vitae nisi at pretium. Vestibulum semper sit
              amet lorem vitae pulvinar. Vivamus sed varius risus, vitae
              tincidunt diam. Sed ac sem id augue suscipit hendrerit.
            </p>
            <p style={this.getStyle('label')}>
              This is label type ({this.getCSSVarName('label')})
            </p>
            <p style={this.getStyle('light')}>
              This is light type ({this.getCSSVarName('light')}
              ). Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Vestibulum interdum vitae nisi at pretium. Vestibulum semper sit
              amet lorem vitae pulvinar. Vivamus sed varius risus, vitae
              tincidunt diam. Sed ac sem id augue suscipit hendrerit.
            </p>
          </div>
        </div>
        <div className="example__row">
          <h2>Un-nested {this.state.semanticStyle}</h2>
        </div>
        <div className="example__row">
          <Value className={this.state.semanticStyle}>
            {{
              '@type': 'rdf:HTML',
              '@value':
                '<h1>H1 Title</h1><p>Lorem ipsum dolor <sup>sup 1</sup> sit amet, <b>bold</b> consectetur adipiscing elit. Vestibulum <em>em</em> interdum vitae nisi at pretium. Vestibulum <i>i</i> semper sit amet lorem vitae pulvinar. Vivamus sed varius risus, vitae tincidunt diam. Sed ac sem id augue suscipit hendrerit. Nulla auctor tincidunt volutpat. Nam ut lectus tortor. Duis dignissim massa porttitor, sodales orci et, sodales nisi. Maecenas eu magna quis quam lacinia tristique. Sed laoreet leo at quam hendrerit vestibulum. Vivamus erat turpis, consequat vel mattis at, tempor sed diam. Duis ut aliquet sapien. Nunc non sagittis dui, id faucibus est. Praesent tempor mi et odio semper, et ullamcorper nisl porta. </P><ul><li>list item 1</li><li>list item 2</li></ul><ol><li>ol item 1</li><li>ol item 2</ol><h2>H2 Title</h2><p>Lorem ipsum dolor <sup>sup 1</sup> sit amet, <b>bold</b> consectetur adipiscing elit. Vestibulum <em>em</em> interdum vitae nisi at pretium. Vestibulum <i>i</i> semper sit amet lorem vitae pulvinar. Vivamus sed varius risus, vitae tincidunt diam. Sed ac sem id augue suscipit hendrerit. Nulla auctor tincidunt volutpat. Nam ut lectus tortor. Duis dignissim massa porttitor, sodales orci et, sodales nisi. Maecenas eu magna quis quam lacinia tristique. Sed laoreet leo at quam hendrerit vestibulum. Vivamus erat turpis, consequat vel mattis at, tempor sed diam. Duis ut aliquet sapien. Nunc non sagittis dui, id faucibus est. Praesent tempor mi et odio semper, et ullamcorper nisl porta. </P>'
            }}
          </Value>
        </div>
      </div>
    );
  }
}
