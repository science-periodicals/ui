import React from 'react';
import { RdfaFundingSource } from '../../src';

export default class RdfaFundingSourceExample extends React.Component {
  render() {
    return (
      <div className="example">
        <RdfaFundingSource
          object={{
            '@id': 'http://www.nsf.gov/awardsearch/showAward?AWD_ID=0553202',
            '@type': 'FundingSource',
            name: 'SGER: First Stages of Exploratory Development of HyperScope',
            alternateName: 'Short Name',
            serialNumber: 'award number 0553202'
          }}
        />
      </div>
    );
  }
}
