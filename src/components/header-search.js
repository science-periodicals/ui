import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Iconoclass from '@scipe/iconoclass';
import noop from 'lodash/noop';
import PaperInput from './paper-input';
import Spinner from './spinner';
import BemTags from '../utils/bem-tags';
import OnClickOutWrapper from './on-clickout-wrapper';
import HeaderSearchLeft from './header-search-left';
import HeaderSearchRight from './header-search-right';
import { getAllOfType, typesMatch } from '../utils/react-children-utils';

const ENTER_KEY_CODE = 13;

export default class HeaderSearch extends Component {
  static defaultProps = {
    onChangeSearch: noop,
    onSubmitSearch: noop,
    searchValue: '',
    fixed: true,
    loading: false
  };

  static propTypes = {
    fixed: PropTypes.bool,
    onChangeSearch: PropTypes.func,
    onSubmitSearch: PropTypes.func,
    searchValue: PropTypes.string,
    onSearchMenuClick: PropTypes.func,
    children: PropTypes.node,
    loading: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = {
      searchFocused: false
    };
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.handleSearchIconClick = this.handleSearchIconClick.bind(this);
  }

  handleSearchIconClick(e) {
    e.preventDefault();
    this.setState({ searchFocused: true }, () => {
      if (this.paperinput) {
        this.paperinput.focus();
      }
    });
  }

  handleChange = e => {
    this.props.onChangeSearch(e);
  };

  handleClickOutside() {
    this.setState({ searchFocused: false });
  }

  handleKeyDown = e => {
    if (e.key === 'Escape') {
      this.paperinput.blur();
    } else if (e.keyCode === ENTER_KEY_CODE) {
      this.props.onSubmitSearch(e);
    }
  };

  handleBlur = e => {
    this.props.onSubmitSearch(e);
  };

  handleFocus = e => {
    this.setState({ searchFocused: true });
  };

  handleClickDelete = e => {
    this.props.onSubmitSearch({
      target: {
        name: 'q',
        value: ''
      }
    });
  };

  render() {
    const bem = BemTags();
    const {
      fixed,
      loading,
      onSearchMenuClick,
      searchValue,
      children
    } = this.props;
    const { searchFocused } = this.state;

    return (
      <div
        className={bem`header-search ${fixed ? '--fixed' : '--unfixed'} ${
          searchFocused ? '--focused' : '--unfocused'
        }`}
      >
        <div
          className={bem`__left --${
            searchFocused ? 'search-focused' : 'search-unfocused'
          }`}
        >
          {onSearchMenuClick && (
            <Iconoclass
              customClassName={bem`__search-menu-icon`}
              iconName="menu"
              tagName="button"
              behavior="button"
              onClick={onSearchMenuClick}
            />
          )}
          {children ? (
            React.Children.map(children, child => {
              if (child && typesMatch(child, HeaderSearchLeft)) {
                return child;
              }
            })
          ) : (
            <div className={bem`left-children`} />
          )}
        </div>
        <div
          className={bem`__middle --${searchFocused ? 'focused' : 'unfocused'}`}
        >
          <OnClickOutWrapper
            className={bem`__search-area --${
              searchFocused ? 'focused' : 'unfocused'
            }`}
            handleClickOutside={this.handleClickOutside}
          >
            {/* Note: we need to attach a click handler to the Spinner has it has a z-index higher than Iconoclass, if we don't do that the spinner is not visible in the UserBadge... */}
            <Spinner
              size={28}
              onClick={this.handleSearchIconClick}
              progressMode={loading ? `spinUp` : 'none'}
              className={bem`__spinner`}
            >
              <Iconoclass
                customClassName={bem`__icon`}
                iconName="search"
                iconSize={18}
                elementType="button"
                onClick={this.handleSearchIconClick}
              />
            </Spinner>
            <div className={bem`__paper-input-container`}>
              <PaperInput
                label="Search"
                name="q"
                value={searchValue}
                onChange={this.handleChange}
                onKeyDown={this.handleKeyDown}
                onBlur={this.handleBlur}
                onFocus={this.handleFocus}
                floatLabel={false}
                large={true}
                ref={el => (this.paperinput = el)}
              />
            </div>
            <div className={bem`__tags`}>
              {getAllOfType(children, HeaderSearchFieldChild)}
            </div>
            <div className={bem`__delete-container`}>
              <Iconoclass
                iconName={searchValue ? 'delete' : 'none'}
                disabled={!searchValue}
                tagName="button"
                size="12px"
                onClick={this.handleClickDelete}
              />
            </div>
          </OnClickOutWrapper>
        </div>
        <div
          className={bem`__right --${
            searchFocused ? 'search-focused' : 'search-unfocused'
          }`}
        >
          {children ? (
            React.Children.map(children, child => {
              if (child && typesMatch(child, HeaderSearchRight)) {
                return child;
              }
            })
          ) : (
            <div className={bem`__right-children`} />
          )}
        </div>
      </div>
    );
  }
}

export const HeaderSearchFieldChild = ({ children, className }) => {
  return (
    <div className={classNames('header-search-field-child', className)}>
      {children}
    </div>
  );
};

HeaderSearchFieldChild.propTypes = {
  children: PropTypes.any,
  className: PropTypes.string
};
