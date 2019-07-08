import React from 'react';
import { UserContactSheet } from '../../src/';
import role from '../../test/fixtures/role';

export default function UserContactSheetExample(props) {
  return (
    <div className="example">
      <UserContactSheet role={role} />
    </div>
  );
}
