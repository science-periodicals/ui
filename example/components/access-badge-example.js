import React from 'react';
import { AccessBadge } from '../../src/';
import workflow from '../../test/fixtures/workflow';

export default function AccessBadgeExample(props) {
  return (
    <div className="example">
      <AccessBadge workflowSpecification={workflow} />
    </div>
  );
}
