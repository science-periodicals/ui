import React from 'react';
import { Version } from '../../src/';

export default function VersionExample(props) {
  return (
    <div className="example">
      <div className="example__row">
        <Version type="prev">1.2.4</Version>
        <Version type="current">1.2.4</Version>
        <Version type="next">1.2.4</Version>
        <div>
          <span>
            This is a version <Version type="next">11.22.1</Version> inline with
            text
          </span>
        </div>
      </div>
      <div className="example__row">
        <span>
          This is a{' '}
          <a href="#">
            version <Version type="next">11.22.1</Version>
          </a>{' '}
          link inline with text
        </span>
      </div>
    </div>
  );
}
