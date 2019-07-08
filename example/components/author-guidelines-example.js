import React from 'react';
import { createId } from '@scipe/librarian';
import { AuthorGuidelines } from '../../src/';

export default function AuthorGuidelinesExample(props) {
  return (
    <div className="example">
      <AuthorGuidelines
        publicationType={{
          '@id': createId('blank')['@id'],
          '@type': 'PublicationType',
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
        }}
      />
    </div>
  );
}
