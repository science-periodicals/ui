import React from 'react';
import { RdfaCitation } from '../../src';

export default class RdfaCitationExample extends React.Component {
  render() {
    return (
      <div className="example">
        <ul className="example__list" style={{ listStyle: 'none' }}>
          <li className="example__list-item">
            <RdfaCitation
              predicate="schema:citation"
              object={{
                '@id': 'http://doi.org/doi',
                '@type': 'ScholarlyArticle',
                doi: '10.1000/182',
                isbn: '1234567890123',
                name: 'On the effect of X on Y',
                author: {
                  '@type': 'Person',
                  givenName: 'Peter',
                  familyName: 'Smith',
                  additionalName: 'Jon',
                  name: 'Peter J Smith'
                },
                isPartOf: {
                  '@type': 'PublicationIssue',
                  issueNumber: 4,
                  isPartOf: {
                    '@type': 'PublicationVolume',
                    volumeNumber: 7,
                    isPartOf: {
                      '@type': 'Periodical',
                      name: 'Journal of Metaphysics',
                      issn: '3334333'
                    }
                  }
                },
                publisher: {
                  '@type': 'Organization',
                  name: 'Polyp publishing'
                },
                pageStart: '615',
                pageEnd: '620',
                datePublished: {
                  '@type': 'xsd:gYearMonth',
                  '@value': '2015-12'
                },
                potentialAction: {
                  '@type': 'ViewAction',
                  actionStatus: 'CompletedActionStatus',
                  endTime: new Date('2019-04-11T18:16:34.535Z').toISOString()
                }
              }}
              displayDoi={true}
              displayIsbn={true}
            />
          </li>

          <li className="example__list-item">
            <RdfaCitation
              predicate="schema:citation"
              object={{
                '@type': 'Book',
                isbn: '0893470627',
                name: 'Literary Machines',
                author: {
                  '@type': 'Person',
                  name: 'Ted Nelson'
                },
                publisher: {
                  '@type': 'Organization',
                  name: 'Eastgate'
                },
                datePublished: {
                  '@type': 'xsd:gYear',
                  '@value': 1993
                }
              }}
            />
          </li>

          <li className="example__list-item">
            <RdfaCitation
              predicate="schema:citation"
              object={{
                '@id': 'http://example.com/notes',
                '@type': 'Webpage',
                name: 'Notes on memory machines',
                author: {
                  '@type': 'Person',
                  givenName: 'Jon',
                  familyName: 'Markup'
                },
                datePublished: {
                  '@type': 'xsd:date',
                  '@value': '2015-06-11'
                },
                potentialAction: {
                  '@type': 'ViewAction',
                  actionStatus: 'CompletedActionStatus',
                  endTime: {
                    '@type': 'xsd:date',
                    '@value': '2020-03-10'
                  }
                }
              }}
            />
          </li>

          <li className="example__list-item">
            <RdfaCitation
              predicate="schema:citation"
              object={{
                '@id': 'http://www.ncbi.nlm.nih.gov/nuccore/EU768872',
                '@type': 'Dataset',
                name: 'EU768872',
                datePublished: new Date(
                  '2019-04-11T18:16:34.535Z'
                ).toISOString(),
                description:
                  'Ideonella dechloratans cytochrome C class 1 precursor and molybdopterin-guanine dinucleotide biosynthesis genes, complete cds',
                includedInDataCatalog: {
                  '@id': 'http://www.ncbi.nlm.nih.gov/genbank',
                  name: 'GenBank',
                  '@type': 'DataCatalog'
                }
              }}
            />
          </li>

          {/* test a common mistake in DS3 where the authors are duplicated */}
          <li className="example__list-item">
            <RdfaCitation
              predicate="schema:citation"
              object={{
                '@id': 'http://doi.org/doi',
                '@type': 'ScholarlyArticle',
                name:
                  'Duplicated authors (user mistake but react should not complain about duplicate keys)',
                author: [
                  {
                    '@id': '_:sameId',
                    '@type': 'Person',
                    name: 'Peter J Smith'
                  },
                  {
                    '@id': '_:sameId',
                    '@type': 'Person',
                    name: 'Peter J Smith'
                  },
                  {
                    '@id': '_:sameId',
                    '@type': 'Person',
                    name: 'Peter J Smith'
                  }
                ]
              }}
            />
          </li>

          {/* DigitalDocument part of a WebPage itself part of a WebSite */}
          <li className="example__list-item">
            <RdfaCitation
              predicate="schema:citation"
              object={{
                '@id': 'node:nodeId',
                '@type': 'DigitalDocument',
                name: 'Digital document title',
                author: {
                  '@type': 'Person',
                  name: 'Peter J Smith'
                },
                isPartOf: {
                  '@type': 'WebPage',
                  name: 'web page name',
                  isPartOf: {
                    '@type': 'WebSite',
                    name: 'web site name'
                  }
                },
                potentialAction: {
                  '@type': 'ViewAction',
                  actionStatus: 'CompletedActionStatus',
                  endTime: {
                    '@type': 'xsd:date',
                    '@value': '2020-03-10'
                  }
                }
              }}
            />
          </li>

          {/* WebPage itself part of a WebSite */}
          <li className="example__list-item">
            <RdfaCitation
              predicate="schema:citation"
              object={{
                '@id': 'node:nodeId',
                '@type': 'WebPage',
                name: 'web page  title',
                author: {
                  '@type': 'Person',
                  name: 'Peter J Smith'
                },
                isPartOf: {
                  '@type': 'WebSite',
                  name: 'web site name'
                },
                potentialAction: {
                  '@type': 'ViewAction',
                  actionStatus: 'CompletedActionStatus',
                  endTime: {
                    '@type': 'xsd:date',
                    '@value': '2020-03-10'
                  }
                }
              }}
            />
          </li>

          {/* WebPage */}
          <li className="example__list-item">
            <RdfaCitation
              predicate="schema:citation"
              object={{
                '@id': 'node:nodeId',
                '@type': 'WebPage',
                name: 'web page  title',
                author: {
                  '@type': 'Person',
                  name: 'Peter J Smith'
                },
                potentialAction: {
                  '@type': 'ViewAction',
                  actionStatus: 'CompletedActionStatus',
                  endTime: {
                    '@type': 'xsd:date',
                    '@value': '2020-03-10'
                  }
                }
              }}
            />
          </li>
        </ul>
      </div>
    );
  }
}
