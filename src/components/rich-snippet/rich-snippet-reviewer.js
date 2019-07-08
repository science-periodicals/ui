import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Iconoclass from '@scipe/iconoclass';
import RankingBell from '../ranking-bell';
import BemTags from '../../utils/bem-tags';

export default class RichSnippetReviewer extends PureComponent {
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
      return <Iconoclass size={'16px'} iconName="star" title="Top Reviewer" />;
    }
  }

  render() {
    const bem = BemTags('rich-snippet');
    let { children, className, id } = this.props;
    return (
      <div
        className={
          bem`__person --reviewer` + ' ' + (className ? className : '')
        }
        id={id}
      >
        <a href="#" className={bem`__name --reviewer`}>
          {children}
          {this.renderRankingIcon()}
        </a>
      </div>
    );
  }
}

RichSnippetReviewer.defaultProps = {
  _snippetMode: 'scholar',
  className: null,
  id: null
};

RichSnippetReviewer.propTypes = {
  children: PropTypes.any,
  ranking: PropTypes.number,
  role: PropTypes.object,
  id: PropTypes.string,
  className: PropTypes.string,
  _snippetMode: PropTypes.string
};
