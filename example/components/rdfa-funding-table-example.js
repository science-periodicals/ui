import React from 'react';
import { RdfaFundingTable } from '../../src';

export default class RdfaFundingTableExample extends React.Component {
  render() {
    const graph = {
      '@id': 'scienceai:graphId',
      '@type': 'Graph',
      mainEntity: 'scienceai:article',
      '@graph': [
        {
          '@id': 'scienceai:article',
          '@type': 'ScholarlyArticle',
          resourceOf: 'scienceai:graphId',
          author: {
            '@id': 'scienceai:authorRole',
            '@type': 'ContributorRole',
            author: {
              '@id': 'http://example.com/psullivan',
              '@type': 'Person',
              name: 'Prof. James P Sullivan, MD',
              givenName: 'James',
              familyName: 'Sullivan',
              additionalName: ['Peter', 'Robert'],
              honorificPrefix: 'Prof',
              honorificSuffix: 'MD',
              sponsor: {
                '@type': 'SponsorRole',
                sponsor: {
                  '@id': 'http://www.fic.nih.gov',
                  '@type': 'GovernmentOrganization',
                  name: 'Fogarty International Center',
                  parentOrganization: {
                    '@id': 'http://www.nih.gov',
                    '@type': 'GovernmentOrganization',
                    name: 'National Institutes of Health',
                    alternateName: 'NIH'
                  }
                },
                startDate: '2015-01-01'
              }
            }
          },
          contributor: {
            '@id': 'http://www.biology.as.nyu.edu',
            '@type': 'CollegeOrUniversity',
            name: 'Department of Biology',
            parentOrganization: {
              '@id': 'http://www.nyu.edu',
              '@type': 'CollegeOrUniversity',
              name: 'New York University',
              alternateName: 'NYU'
            },
            sponsor: {
              '@type': 'SponsorRole',
              sponsor: {
                '@id': 'http://www.gatesfoundation.org',
                '@type': 'NGO',
                name: 'Bill & Melinda Gates Foundation'
              },
              roleOffer: {
                '@type': 'FundingSource',
                name: 'Collaboration for AIDS Vaccine Discovery Grant',
                alternateName: 'CAVD',
                serialNumber: 'OPP38631_01'
              },
              startDate: '2009-11-19'
            }
          },
          sponsor: {
            '@id': 'scienceai:sponsorRoleArticle',
            '@type': 'SponsorRole',
            sponsor: {
              '@id': 'scienceai:cs',
              '@type': 'Organization',
              name: 'Collaborative systems',
              parentOrganization: {
                '@id': 'http://www.nsf.gov/div/index.jsp?div=IIS',
                '@type': 'Organization',
                name: 'Division of Information & Intelligent Systems',
                alternateName: 'IIS',
                parentOrganization: {
                  '@id': 'http://www.nsf.gov',
                  '@type': 'GovernmentOrganization',
                  name: 'National Science Foundation',
                  alternateName: 'NSF'
                }
              }
            },
            roleOffer: {
              '@id': 'http://www.nsf.gov/awardsearch/showAward?AWD_ID=0553202',
              '@type': 'FundingSource',
              name:
                'SGER: First Stages of Exploratory Development of HyperScope',
              serialNumber: 'award number 0553202'
            },
            startDate: '2005-11-01',
            endDate: '2006-12-31'
          }
        }
      ]
    };

    return (
      <div className="example">
        <RdfaFundingTable object={graph} />
      </div>
    );
  }
}
