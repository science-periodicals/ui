import React from 'react';
import { Divider } from '../../src/';

export default function DividerExample(props) {
  return (
    <div className="example">
      <p>A paragraph</p>
      <Divider />
      <p>Separated by a divider</p>
    </div>
  );
}
