import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import AutosizeInput from 'react-input-autosize';
import Slug from 'slug';
import BemTags from '../utils/bem-tags';

const bem = BemTags();

export default class PaperSubdomain extends Component {
  constructor(props) {
    super(props);

    this.state = {
      slug: Slug((this.props.value || '').replace(/\s/g, '-'), {
        symbols: false,
        lower: true
      }),
      focused: false,
      anim: false
    };
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  resetValue(value) {
    const slug = Slug((value || '').replace(/\s/g, '-'), {
      symbols: false,
      lower: true
    });
    this.setState({ slug });
    return slug;
  }

  handleFocus() {
    this.setState({ focused: true });
  }

  handleBlur() {
    this.setState({ focused: false });
  }

  focus() {
    this.input.focus();
  }

  blur() {
    this.input.blur();
  }

  select() {
    this.input.select();
  }

  getValue() {
    return this.state.slug;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.props.value) {
      this.resetValue(nextProps.value);
    }
  }

  componentDidMount() {
    const $container = ReactDOM.findDOMNode(this.inputContainer);
    const $input = $container.getElementsByClassName(
      'paper-subdomain__name-input'
    )[0];
    $input.onfocus = this.handleFocus;
    $input.onblur = this.handleBlur;
    this.input = $input;
  }

  handleChange(e) {
    // slug trims off trailing spaces so replace with dash
    const slug = Slug((e.target.value || '').replace(/\s/g, '-'), {
      symbols: false,
      lower: true
    });
    const anim =
      !this.state.slug || Math.abs(slug.length - this.state.slug.length) > 1;
    this.setState({ slug, anim });
    if (this.props.onChange) {
      this.props.onChange(e);
    }
  }

  render() {
    const { anim, slug, focused } = this.state;
    const { large, className, ...inputProps } = this.props;

    return (
      <div
        className={classNames(
          className,
          bem`paper-subdomain --${focused ? 'focused' : 'blured'} --${
            large ? 'large' : 'small'
          } ${this.props.disabled ? '--disabled' : ''} ${
            this.props.readOnly ? '--read-only' : ''
          }`
        )}
      >
        <div className={bem`form`}>
          <span className={bem`__scheme`}>{`https://`}</span>
          <AutosizeInput
            {...inputProps}
            className={bem`name-input-container`}
            inputClassName={classNames(bem`name-input`, {
              'paper-subdomain__name-input--no-anim': !anim
            })}
            value={slug}
            onChange={this.handleChange}
            ref={self => (this.inputContainer = self)}
          />
          .sci.pe
        </div>
      </div>
    );
  }
}
PaperSubdomain.defaultProps = {
  placeholder: 'subdomain',
  value: '',
  large: false
};

PaperSubdomain.propTypes = {
  className: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  large: PropTypes.bool,
  onChange: PropTypes.func
};
