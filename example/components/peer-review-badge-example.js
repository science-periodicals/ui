import React from 'react';
import { PeerReviewBadge } from '../../src/';

export default function PeerReviewBadgeExample(props) {
  return (
    <div className="example">
      <PeerReviewBadge
        workflowSpecification={{
          '@type': 'WorkflowSpecification',
          potentialAction: {
            '@type': 'CreateGraphAction',
            result: {
              '@graph': [
                {
                  '@id': '_:graph',
                  '@type': 'Graph'
                }
              ]
            }
          }
        }}
      />
    </div>
  );
}
