import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Iconoclass from '@scipe/iconoclass';
import RankingBell from '../ranking-bell';
import BemTags from '../../utils/bem-tags';

export default class RichSnippetAuthor extends PureComponent {
  renderRankingIcon() {
    if (!this.props.ranking) return;
    if (this.props._snippetMode === 'scholar') {
      return (
        <RankingBell
          size={13}
          percentile={this.props.ranking}
          id={this.props.id && this.props.id + '_ranking-bell'}
        />
      );
    } else if (this.props.ranking > 50) {
      return <Iconoclass size={'1.8rem'} iconName="star" title="Top Author" />;
    }
  }

  render() {
    const bem = BemTags('rich-snippet');
    let { children, className, id } = this.props;
    return (
      <div
        className={bem`__person --author` + ' ' + (className ? className : '')}
        id={id}
      >
        <a href="#" className={bem`__name --author`}>
          {children}
          {this.renderRankingIcon()}
        </a>
      </div>
    );
  }
}

RichSnippetAuthor.defaultProps = {
  _snippetMode: 'scholar',
  className: null,
  id: null
};

RichSnippetAuthor.propTypes = {
  children: PropTypes.any,
  ranking: PropTypes.number,
  role: PropTypes.object,
  id: PropTypes.string,
  className: PropTypes.string,
  _snippetMode: PropTypes.string
};
