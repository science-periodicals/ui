import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import BemTags from '../../utils/bem-tags';
import { BarChart, Bar, XAxis } from 'recharts';

export default class RichSnippetCitationGraph extends PureComponent {
  render() {
    const bem = BemTags('rich-snippet');
    let { children, className, id } = this.props;
    return (
      <div
        className={bem`__citations-graph` + className && className}
        id={id && id}
      >
        {children}
        <BarChart
          width={72}
          height={28}
          barCategoryGap={2}
          margin={{ top: 0, right: 0, left: 0, bottom: 4 }}
          data={this.props.data}
        >
          <Bar dataKey="citations" fill="darkgrey" />
          <XAxis
            dataKey="name"
            height={10}
            tickLine={false}
            interval={'preserveStartEnd'}
            padding={{ top: 0 }}
          />
        </BarChart>
      </div>
    );
  }
}

RichSnippetCitationGraph.propTypes = {
  children: PropTypes.any,
  citedBy: PropTypes.number,
  impactFactor: PropTypes.number,
  data: PropTypes.array,
  className: PropTypes.string,
  id: PropTypes.string
};
