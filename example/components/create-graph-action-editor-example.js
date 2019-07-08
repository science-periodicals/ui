import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getNodeMap, arrayify, getId } from '@scipe/jsonld';
import {
  TYPESETTING_SERVICE_TYPE,
  DOI_REGISTRATION_SERVICE_TYPE
} from '@scipe/librarian';
import {
  CreateGraphActionEditor,
  PaperButton,
  ControlPanel,
  withScreenDim,
  CSS_LARGE_DESKTOP
} from '../../src/';
import periodical from '../../test/fixtures/periodical.json';

/* eslint-disable no-console */

class _CreateGraphActionEditorExample extends Component {
  static propTypes = {
    screenWidth: PropTypes.string,
    screenHeight: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      createGraphAction: {
        '@type': 'CreateGraphAction',
        result: {
          '@graph': [
            {
              '@id': '_:root',
              '@type': 'Graph',
              potentialAction: '_:submissionStage'
            },
            {
              '@id': '_:submissionStage',
              '@type': 'StartWorkflowStageAction',
              name: 'Submission stage',
              result: '_:createReleaseAction'
            },
            {
              '@id': '_:createReleaseAction',
              '@type': 'CreateReleaseAction',
              expectedDuration: 'P4D',
              result: '_:release',
              agent: '_:createReleaseActionAgent',
              participant: '_:createReleaseActionParticipant'
            },
            {
              '@id': '_:createReleaseActionAgent',
              '@type': 'ContributorRole',
              roleName: 'author'
            },
            {
              '@id': '_:createReleaseActionParticipant',
              '@type': 'Audience',
              audienceType: 'author'
            },
            {
              '@id': '_:release',
              '@type': 'Graph',
              potentialAction: '_:assessAction'
            },
            {
              '@id': '_:assessAction',
              '@type': 'AssessAction',
              agent: '_:assessActionAgent',
              participant: '_:assessActionParticipant',
              expectedDuration: 'P3D',
              potentialResult: ['_:rejectAction', '_:productionStage']
            },
            {
              '@id': '_:assessActionAgent',
              '@type': 'ContributorRole',
              roleName: 'editor'
            },
            {
              '@id': '_:assessActionParticipant',
              '@type': 'Audience',
              audienceType: 'editor'
            },
            {
              '@id': '_:rejectAction',
              '@type': 'RejectAction'
            },
            {
              '@id': '_:productionStage',
              '@type': 'StartWorkflowStageAction',
              name: 'Production stage',
              result: '_:publishAction'
            },
            {
              '@id': '_:publishAction',
              '@type': 'PublishAction',
              expectedDuration: 'P3D',
              agent: '_:publishActionAgent',
              participant: '_:publishActionParticipant'
            },
            {
              '@id': '_:publishActionAgent',
              '@type': 'ContributorRole',
              roleName: 'editor'
            },
            {
              '@id': '_:publishActionParticipant',
              '@type': 'Audience',
              audienceType: 'editor'
            }
          ]
        }
      }
    };
  }

  handleChange = nextCreateGraphAction => {
    console.log('on change', nextCreateGraphAction);

    // Validation
    const nodes = nextCreateGraphAction.result['@graph'];
    const nodeMap = getNodeMap(nodes);
    const invalidAuthorizeAction = nodes.find(
      node =>
        node['@type'] === 'AuthorizeAction' && !arrayify(node.recipient).length
    );
    if (invalidAuthorizeAction) {
      console.error('Invalid AuthorizeAction no recipient');
      const object = nodes.find(node =>
        arrayify(node.potentialAction).find(
          id => getId(id) === getId(invalidAuthorizeAction)
        )
      );
      console.error({ invalidAuthorizeAction, object });
    }

    this.setState({
      createGraphAction: nextCreateGraphAction
    });
  };

  handleSubmit = e => {
    const { createGraphAction } = this.state;
    console.log('submit', createGraphAction);
  };

  render() {
    const { createGraphAction } = this.state;
    const { screenWidth } = this.props;

    return (
      <div className="example">
        <CreateGraphActionEditor
          readOnly={false}
          layout={
            screenWidth < CSS_LARGE_DESKTOP ? 'singleColumn' : 'multiColumn'
          }
          potentialServices={[
            {
              '@id': '_:typesettingId',
              '@type': 'Service',
              name: 'typesetting service',
              serviceType: TYPESETTING_SERVICE_TYPE,
              audience: { '@type': 'Audience', audienceType: 'user' },
              offers: {
                '@id': 'offer:typesetting',
                '@type': 'Offer',
                priceSpecification: {
                  '@type': 'UnitPriceSpecification',
                  price: 50,
                  priceCurrency: 'USD',
                  unitText: 'submission'
                }
              }
            },
            {
              '@id': '_:doiRegistrationId',
              '@type': 'Service',
              name: 'DOI registration service',
              serviceType: DOI_REGISTRATION_SERVICE_TYPE,
              audience: { '@type': 'Audience', audienceType: 'user' },
              offers: {
                '@id': 'offer:doi-registration',
                '@type': 'Offer',
                priceSpecification: {
                  '@type': 'CompoundPriceSpecification',
                  priceComponent: [
                    {
                      name: 'main entity',
                      '@type': 'UnitPriceSpecification',
                      price: 1,
                      priceCurrency: 'USD',
                      billingIncrement: 1,
                      unitText: 'main entity',
                      valueAddedTaxIncluded: false,
                      platformFeesIncluded: false
                    },
                    {
                      name: 'parts',
                      '@type': 'UnitPriceSpecification',
                      price: 0.1,
                      priceCurrency: 'USD',
                      billingIncrement: 1,
                      unitText:
                        'Creative Work listed as part of the main entity',
                      valueAddedTaxIncluded: false,
                      platformFeesIncluded: false
                    }
                  ]
                }
              }
            }
          ]}
          periodical={periodical}
          createGraphAction={createGraphAction}
          onChange={this.handleChange}
        />

        <ControlPanel>
          <PaperButton onClick={this.handleSubmit}>Submit</PaperButton>
        </ControlPanel>
      </div>
    );
  }
}

const CreateGraphActionEditorExampleWithDims = withScreenDim(
  _CreateGraphActionEditorExample
);

export default function CreateGraphActionEditorExample(props) {
  return <CreateGraphActionEditorExampleWithDims />;
}
