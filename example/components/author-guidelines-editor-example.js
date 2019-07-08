import React from 'react';
import { AuthorGuidelinesEditor } from '../../src/';

export default class AuthorGuidelinesEditorExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      objectSpecification: {
        '@graph': [
          {
            '@type': 'Graph',
            mainEntity: '_:mainEntity'
          },
          {
            '@id': '_:mainEntity',
            '@type': 'ScholarlyArticle',
            hasPart: ['_:introduction', '_:result', '_:acknowledgement']
          },
          {
            '@id': '_:introduction',
            '@type': 'WebPageElement',
            additionalType: '_:introductionType'
          },
          {
            '@id': '_:result',
            '@type': 'WebPageElement',
            additionalType: '_:resultType'
          },
          {
            '@id': '_:acknowledgement',
            '@type': 'WebPageElement',
            additionalType: '_:acknowledgementType'
          },
          {
            '@id': '_:introductionType',
            '@type': 'PublicationElementType',
            sameAs: 'WPIntroduction',
            name: 'Introduction',
            description: 'introduction description'
          },
          {
            '@id': '_:resultType',
            '@type': 'PublicationElementType',
            sameAs: 'WPResults',
            name: 'Results',
            description:
              'The report of the specific findings of an investigation, given without discussion or conclusion being drawn.'
          },
          {
            '@id': '_:acknowledgementType',
            '@type': 'PublicationElementType',
            sameAs: 'WPAcknowledgements',
            name: 'Acknowledgements',
            description: 'Acknowledgements description'
          }
        ]
      }
    };
  }

  handleChange = nextObjectSpecification => {
    console.log(nextObjectSpecification);
    this.setState({ objectSpecification: nextObjectSpecification });
  };

  render() {
    return (
      <div className="example">
        <AuthorGuidelinesEditor
          readOnly={false}
          disabled={false}
          onChange={this.handleChange}
          objectSpecification={this.state.objectSpecification}
        />
      </div>
    );
  }
}
