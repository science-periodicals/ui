import React from 'react';
import { AutoAbridge } from '../../src/';

export default function AutoAbridgeExample(props) {
  return (
    <div className="example">
      <div style={{ width: '100px', outline: '1px dashed grey' }}>
        <AutoAbridge>A verry long text</AutoAbridge>
        <AutoAbridge ellipsis={true}>
          A verry verry long text with ellipsis option
        </AutoAbridge>
      </div>
    </div>
  );
}
