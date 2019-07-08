import React from 'react';
import { createId } from '@scipe/librarian';
import { Ds3SectionEditor } from '../../src/';

export default class Ds3SectionEditorExample extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sections: [
        {
          '@id': createId('blank')['@id'],
          name: 'Structured Abstract',
          description: 'structured abstract description',
          hasPart: [
            {
              '@id': createId('blank')['@id'],
              name: 'Introduction',
              description: 'structured abstract introduction description'
            },
            {
              '@id': createId('blank')['@id'],
              name: 'Results',
              description: 'structured abstract results description'
            }
          ]
        },
        {
          '@id': createId('blank')['@id'],
          name: 'Introduction',
          description: 'introduction description'
        },
        {
          '@id': createId('blank')['@id'],
          name: 'Result',
          description: 'Result description'
        },
        {
          '@id': createId('blank')['@id'],
          name: 'Acknowledgements',
          description: 'Acknowledgements description',
          isBasedOn: 'ds3:Acknowledgements'
        }
      ]
    };
  }

  handleChange = sections => {
    console.log(sections);
    this.setState({ sections });
  };

  render() {
    const { sections } = this.state;
    return (
      <div className="example">
        <Ds3SectionEditor
          readOnly={false}
          disabled={false}
          onChange={this.handleChange}
          sections={sections}
        />
      </div>
    );
  }
}
