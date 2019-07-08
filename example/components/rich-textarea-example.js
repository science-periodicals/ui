import React from 'react';
import { getValue } from '@scipe/jsonld';
import { RichTextarea, Divider } from '../../src/';

const defaultValue = {
  '@type': 'rdf:HTML',
  '@value':
    '<h1>Title</h1><p>paragraph with <em>emphasize</em>, <a href="http://example.com">link</a> and <strong>strong</strong></p><ul><li>item1</li><li>item2</li></ul>'
};

const defaultTextValue = 'Lorem ipsum';

export default class RichTextAreaExample extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      valueBlank: '',
      value: defaultValue,
      valueInitializedWithText: defaultTextValue
    };
  }

  handleSubmit = (e, html, markdown) => {
    this.setState({ [e.target.name]: e.target.value });
    console.log({ name: e.target.name, html: getValue(html), markdown });
  };

  handleResize = (height, prevHeight) => {
    console.log(height, prevHeight);
  };

  render() {
    const { valueBlank, value, valueInitializedWithText } = this.state;

    return (
      <div className="example">
        <RichTextarea
          name="valueBlank"
          defaultValue={valueBlank}
          readOnly={false}
          options={[
            {
              text: '1.0.0.0',
              description:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
            },
            {
              text: '2.0.0.0',
              description: 'Vestibulum non gravida est.',
              children: [
                {
                  text: '2.1.0.0',
                  description: 'Sed lacinia rutrum consequat.'
                },
                {
                  text: '2.2.0.0',
                  description: 'In hac habitasse platea dictumst.',
                  children: [
                    {
                      text: '2.2.1.0',
                      description:
                        'Phasellus imperdiet, elit vel vulputate ornare, dui quam hendrerit turpis, in hendrerit nibh leo nec dolor.',
                      children: [
                        {
                          text: '2.2.1.1',
                          description:
                            'Proin non luctus est, in finibus tortor.'
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]}
          suggestionMapper={text => `[#${text}](v1.0.0#${text})`}
          onSubmit={this.handleSubmit}
          onResize={this.handleResize}
          label="Editable (blank) with # trigger"
        />

        <Divider marginTop={60} marginBottom={60} type="major" />

        <RichTextarea
          name="valueInitializedWithText"
          defaultValue={valueInitializedWithText}
          readOnly={false}
          onSubmit={this.handleSubmit}
          onResize={this.handleResize}
          label="Editable (initialized with text)"
        />

        <Divider marginTop={60} marginBottom={60} type="major" />

        <RichTextarea
          name="value"
          defaultValue={value}
          readOnly={false}
          onSubmit={this.handleSubmit}
          onResize={this.handleResize}
          label="Editable"
        />

        <Divider marginTop={60} marginBottom={60} type="major" />

        <RichTextarea
          name="textReadOnlyBlank"
          defaultValue={''}
          readOnly={true}
          label="read only (blank)"
        />

        <Divider marginTop={60} marginBottom={60} type="major" />

        <RichTextarea
          name="textReadOnly"
          defaultValue={defaultValue}
          readOnly={true}
          label="read only (with content)"
        />

        <Divider marginTop={60} marginBottom={60} type="major" />

        <RichTextarea
          name="textReadOnly"
          locationLinksType="shell"
          defaultValue={{
            '@type': 'rdf:HTML',
            '@value':
              '<p>paragraph with <a href="#v1.1:1.3">shell link icon</a></p>'
          }}
          readOnly={true}
          label="shell location link"
        />

        <Divider marginTop={60} marginBottom={60} type="major" />

        <RichTextarea
          name="textReadOnly"
          locationLinksType="scroll"
          defaultValue={{
            '@type': 'rdf:HTML',
            '@value':
              '<p>paragraph with <a href="#v1.1:1.3">scroll link icon</a></p>'
          }}
          readOnly={true}
          label="scroll location link"
        />
      </div>
    );
  }
}
