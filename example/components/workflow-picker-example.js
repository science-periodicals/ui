import React, { Component } from 'react';
import { WorkflowPicker } from '../../src/';

export default class WorkflowPickerExample extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: workflows[0]['@id']
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value) {
    console.log(value);
    this.setState({ value });
  }

  render() {
    const { value } = this.state;
    return (
      <div className="example">
        <WorkflowPicker
          value={value}
          workflows={workflows}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

var workflows = [
  {
    '@id': 'workflow:workflowId1',
    '@type': 'CreateGraphAction',
    name: 'Article workflow',
    description: 'A workflow involving many reviewers for article',
    result: {
      '@type': 'Graph',
      hasDigitalDocumentPermission: [
        {
          '@type': 'DigitalDocumentPermission',
          permissionType: 'ViewIdentityPermission',
          grantee: [
            { '@type': 'Audience', audienceType: 'editor' },
            { '@type': 'Audience', audienceType: 'producer' }
          ],
          permissionScope: [
            { '@type': 'Audience', audienceType: 'author' },
            { '@type': 'Audience', audienceType: 'reviewer' },
            { '@type': 'Audience', audienceType: 'editor' },
            { '@type': 'Audience', audienceType: 'producer' }
          ]
        },
        {
          '@type': 'DigitalDocumentPermission',
          permissionType: 'ViewIdentityPermission',
          grantee: [
            { '@type': 'Audience', audienceType: 'author' },
            { '@type': 'Audience', audienceType: 'reviewer' }
          ],
          permissionScope: [
            { '@type': 'Audience', audienceType: 'author' },
            { '@type': 'Audience', audienceType: 'editor' },
            { '@type': 'Audience', audienceType: 'producer' }
          ]
        }
      ],
      potentialAction: {
        '@type': 'ConsumeAction',
        expectsAcceptanceOf: {
          '@type': 'Offer',
          priceSpecification: {
            '@type': 'PriceSpecification',
            price: 59,
            priceCurrency: 'USD'
          },
          potentialAction: {
            '@type': 'BuyAction'
          }
        }
      }
    }
  },
  {
    '@id': 'workflow:workflowId2',
    '@type': 'CreateGraphAction',
    name: 'Data workflow',
    description: 'A workflow involving many types of reviewers for dataset',
    result: {
      '@type': 'Graph'
    }
  }
];
