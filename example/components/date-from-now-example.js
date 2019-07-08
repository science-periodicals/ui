import React from 'react';
import { DateFromNow } from '../../src/';

export default function DateFromNowExample(props) {
  return (
    <div className="example">
      <DateFromNow now="2019-04-11T18:16:34.535Z">
        2019-04-11T18:16:30.535Z
      </DateFromNow>
    </div>
  );
}
