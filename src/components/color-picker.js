import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import uuid from 'uuid';
import noop from 'lodash/noop';
import { createHash } from 'web-verse';
import tinyColor from 'tinycolor2';
import colorHash from 'material-color-hash';
import { CustomPicker } from 'react-color';
import {
  Alpha,
  EditableInput,
  Checkboard
} from 'react-color/lib/components/common';
import BlockSwatches from 'react-color/lib/components/block/BlockSwatches';
import BemTags from '../utils/bem-tags';
import OnClickOutWrapper from './on-clickout-wrapper';
import ReactPortal from './react-portal';

const DEFAULT_COLOR = '#eee';

export default class ColorPicker extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    color: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    large: PropTypes.bool,
    label: PropTypes.string,
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    allowCustom: PropTypes.bool,
    swatchSize: PropTypes.number,
    matchFloatLabel:
      PropTypes.bool /* make alignment match paper-inputs with floatLabel=true */,
    onChange: PropTypes.func,
    id: PropTypes.string,
    complimentColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    paletteHashSeed: PropTypes.string,
    palette: PropTypes.array,
    showInput: PropTypes.bool,
    showAlpha: PropTypes.bool
  };

  static defaultProps = {
    label: 'Color',
    className: '',
    swatchSize: 30,
    onChange: noop,
    allowCustom: true
  };

  static getDerivedStateFromProps(props, state) {
    const upd = {
      lastColor: props.color,
      lastComplimentColor: props.complimentColor,
      lastPaletteHashSeed: props.paletteHashSeed
    };

    let update;
    if (props.color !== state.lastColor) {
      upd.color = props.color || DEFAULT_COLOR;
      update = true;
    }
    if (
      props.complimentColor !== state.lastComplimentColor ||
      props.paletteHashSeed !== state.lastPaletteHashSeed
    ) {
      upd.palette = getPalette(props);
      update = true;
    }

    if (update) {
      return upd;
    }

    return null;
  }

  constructor(props) {
    super(props);

    let color;
    if (props.color) {
      color = props.color;
    } else if (props.complimentColor) {
      color = tinyColor(props.complimentColor)
        .complement()
        .toHexString();
    } else {
      color = DEFAULT_COLOR;
    }

    this.state = {
      open: false,
      color,
      lastColor: props.color,
      lastComplimentColor: props.complimentColor,
      lastPaletteHashSeed: props.paletteHashSeed,
      palette: getPalette(props)
    };
  }

  handleClick = e => {
    this.setState({ open: !this.state.open });
  };

  handleClickOutside = () => {
    //console.log('clickout');
    if (this.state.open === true) this.setState({ open: false });
  };

  handleChangeComplete = (color, event) => {
    this.setState({ color: color.rgb });
    this.props.onChange(tinyColor(color.rgb).toString(), event);
  };

  getPalette(props) {
    props = props || this.props;
    let palette = props.palette || [];
    if (props.complimentColor) {
      palette = palette.concat(getRelatedColors(props.complimentColor));
    }
    if (props.paletteHashSeed) {
      const hashColor = getHashColor(props.paletteHashSeed);
      palette = palette.concat(getRelatedColors(hashColor));
    }
    return Array.from(new Set(palette));
  }

  getHashColor(string) {
    string = (string || '').replace(/\s/g, '');
    let hashColor = colorHash(string);
    //console.log('hash ', hashColor, name, i);
    let i = 0;

    while (
      (hashColor.materialColorName == 'Grey' ||
        hashColor.materiaColorName == 'Grey') && // Note: the typo (lack of `l` is intentional as the module is currently bugged)
      i < 100
    ) {
      hashColor = colorHash(createHash(string));
      i++;
    }

    // let seedColor = tinyColor(hashColor.backgroundColor)
    //   .desaturate(20)
    //   .lighten(10)
    //   .toHexString();

    let seedColor = tinyColor(hashColor.backgroundColor);
    seedColor = this.constrainColor(seedColor);
    return seedColor.toHexString();
  }

  constrainColor(tinyColor) {
    if (tinyColor.toHsl().l < 0.4) tinyColor.lighten(20);
    if (tinyColor.toHsl().l > 0.6) tinyColor.darken(20);
    if (tinyColor.toHsl().s < 0.3) tinyColor.saturate(20);
    if (tinyColor.toHsl().s > 0.7) tinyColor.desaturate(20);
    return tinyColor;
  }

  varyColor(tinyColor) {
    if (tinyColor.toHsl().l < 0.5) tinyColor.lighten(20);
    if (tinyColor.toHsl().l >= 0.5) tinyColor.darken(20);
    if (tinyColor.toHsl().s < 0.5) tinyColor.saturate(20);
    if (tinyColor.toHsl().s >= 0.5) tinyColor.desaturate(20);

    return tinyColor;
  }

  getRelatedColors(baseColor) {
    // console.log('getRelatedColors: ', baseColor);
    let complimentColors = [tinyColor(baseColor).toHexString()];

    complimentColors = complimentColors.concat(
      tinyColor(baseColor)
        .tetrad()
        .map(t => t.toHexString())
    );
    complimentColors = complimentColors.concat(
      tinyColor(baseColor)
        .tetrad()
        .map(t => this.varyColor(t).toHexString())
    );
    complimentColors = complimentColors.concat(
      tinyColor(baseColor)
        .complement()
        .toHexString()
    );

    complimentColors = complimentColors.concat(
      tinyColor(baseColor)
        .splitcomplement()
        .map(t => this.varyColor(t).toHexString())
    );
    complimentColors = complimentColors.concat(
      tinyColor(baseColor)
        .splitcomplement()
        .map(t => t.toHexString())
    );
    complimentColors = complimentColors.concat(
      tinyColor(baseColor)
        .splitcomplement()
        .map(t => this.varyColor(t).toHexString())
    );
    complimentColors = complimentColors.concat(
      tinyColor(baseColor)
        .analogous()
        .map(t => t.toHexString())
    );
    complimentColors = complimentColors.concat(
      tinyColor(baseColor)
        .analogous()
        .map(t => this.varyColor(t).toHexString())
    );
    //console.log('colors: ', complimentColors);
    // remove duplicates
    //complimentColors = [...new Set(complimentColors)];

    return complimentColors;
  }

  render() {
    const bem = BemTags();
    let {
      className,
      label,
      allowCustom,
      readOnly,
      disabled,
      swatchSize,
      matchFloatLabel,
      large,
      id = uuid.v4()
    } = this.props;

    // let popUpPos = swatchSize / 2 - 85 + 'px';

    return (
      <OnClickOutWrapper handleClickOutside={this.handleClickOutside}>
        <div
          className={classNames(
            bem`color-picker
            ${readOnly ? '--read-only' : ''}
            ${disabled ? '--disabled' : ''}
            ${matchFloatLabel ? '--float-label' : ''}
            ${large ? '--large' : ''}
            ${this.state.open ? '--open' : '--closed'}
            ${this.props.allowCustom ? '' : '--no-custom'}`,
            className
          )}
        >
          <div
            className={bem`controls`}
            style={{ paddingRight: swatchSize + 'px' }}
          >
            <label className={bem`__label`} htmlFor={id}>
              {label}
            </label>

            <button
              id={id}
              className={bem`__swatch`}
              disabled={disabled || readOnly}
              style={{
                backgroundColor: tinyColor(this.state.color).toRgbString(),
                width: swatchSize,
                height: swatchSize
              }}
              onClick={this.handleClick}
            />
          </div>
          {this.state.open && (
            <ReactPortal portalClass={bem`__portal`}>
              <div
                className={
                  bem`__picker-pop-up
                  ${allowCustom ? '' : '--no-custom'}` +
                  ' ignore-react-onclickoutside'
                }
                style={{
                  right: swatchSize / 2 - 84 + 'px',
                  top: '10px'
                }}
              >
                <ColorPickerPalette
                  colors={this.state.palette}
                  color={this.state.color}
                  onChangeComplete={this.handleChangeComplete}
                  showAlpha={this.props.showAlpha}
                  showInput={this.props.showInput}
                />
              </div>
            </ReactPortal>
          )}
        </div>
      </OnClickOutWrapper>
    );
  }
}

export const SliderPointer = () => {
  return <div className="color-picker-palette__pointer" />;
};

export const ColorPickerPalette = CustomPicker(
  class _ColorPickerPalette extends React.Component {
    static propTypes = {
      colors: PropTypes.array,
      onChange: PropTypes.func /* used by CustomPicker */,
      color: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      rgb: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      hex: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      showAlpha: PropTypes.bool,
      showInput: PropTypes.bool
    };

    static defaultProps = {
      onColorChange: noop,
      showAlpha: true,
      showInput: true
    };

    handleColorChange = (hexCode, e) => {
      const color = tinyColor(hexCode);
      if (color.isValid()) {
        this.props.onChange(color.toRgb());
      }
    };

    handleAlphaChange = (value, e) => {
      this.props.onChange(tinyColor(value).toRgb());
    };

    render() {
      const bem = BemTags();
      let { rgb, hex, colors } = this.props;

      const isLight =
        tinyColor(rgb).isLight() || tinyColor(rgb).getAlpha() < 0.5;

      return (
        <div className={bem`color-picker-palette`}>
          <div
            className={bem`__triangle`}
            style={{ borderBottomColor: tinyColor(rgb).toRgbString() }}
          />

          <div className={bem`__head`}>
            <Checkboard />
            <div
              className={bem`__head-chip`}
              style={{ backgroundColor: tinyColor(rgb).toRgbString() }}
            />
            <div
              className={bem`__label`}
              style={{ color: isLight ? 'black' : 'white' }}
            >
              {hex}
            </div>
          </div>

          <div className={bem`__body`}>
            {this.props.showAlpha && (
              <div className={bem`alpha-slider`}>
                <Alpha
                  {...this.props}
                  pointer={SliderPointer}
                  onChange={this.handleAlphaChange}
                  rgb={rgb}
                />
              </div>
            )}
            <BlockSwatches colors={colors} onClick={this.handleColorChange} />
            {this.props.showInput && (
              <EditableInput
                placeholder="Hex Code"
                value={this.props.hex}
                onChange={this.handleColorChange}
              />
            )}
          </div>
        </div>
      );
    }
  }
);

// -- helpers --
function getPalette({ palette = [], complimentColor, paletteHashSeed } = {}) {
  if (complimentColor) {
    palette = palette.concat(getRelatedColors(complimentColor));
  }
  if (paletteHashSeed) {
    const hashColor = getHashColor(paletteHashSeed);
    palette = palette.concat(getRelatedColors(hashColor));
  }
  return Array.from(new Set(palette));
}

function getHashColor(string) {
  string = (string || '').replace(/\s/g, '');
  let hashColor = colorHash(string);
  //console.log('hash ', hashColor, name, i);
  let i = 0;

  while (
    (hashColor.materialColorName == 'Grey' ||
      hashColor.materiaColorName == 'Grey') && // Note: the typo (lack of `l` is intentional as the module is currently bugged)
    i < 100
  ) {
    hashColor = colorHash(createHash(string));
    i++;
  }

  // let seedColor = tinyColor(hashColor.backgroundColor)
  //   .desaturate(20)
  //   .lighten(10)
  //   .toHexString();

  let seedColor = tinyColor(hashColor.backgroundColor);
  seedColor = constrainColor(seedColor);
  return seedColor.toHexString();
}

function constrainColor(tinyColor) {
  if (tinyColor.toHsl().l < 0.4) tinyColor.lighten(20);
  if (tinyColor.toHsl().l > 0.6) tinyColor.darken(20);
  if (tinyColor.toHsl().s < 0.3) tinyColor.saturate(20);
  if (tinyColor.toHsl().s > 0.7) tinyColor.desaturate(20);
  return tinyColor;
}

function varyColor(tinyColor) {
  if (tinyColor.toHsl().l < 0.5) tinyColor.lighten(20);
  if (tinyColor.toHsl().l >= 0.5) tinyColor.darken(20);
  if (tinyColor.toHsl().s < 0.5) tinyColor.saturate(20);
  if (tinyColor.toHsl().s >= 0.5) tinyColor.desaturate(20);

  return tinyColor;
}

function getRelatedColors(baseColor) {
  // console.log('getRelatedColors: ', baseColor);
  let complimentColors = [tinyColor(baseColor).toHexString()];

  complimentColors = complimentColors.concat(
    tinyColor(baseColor)
      .tetrad()
      .map(t => t.toHexString())
  );
  complimentColors = complimentColors.concat(
    tinyColor(baseColor)
      .tetrad()
      .map(t => varyColor(t).toHexString())
  );
  complimentColors = complimentColors.concat(
    tinyColor(baseColor)
      .complement()
      .toHexString()
  );

  complimentColors = complimentColors.concat(
    tinyColor(baseColor)
      .splitcomplement()
      .map(t => varyColor(t).toHexString())
  );
  complimentColors = complimentColors.concat(
    tinyColor(baseColor)
      .splitcomplement()
      .map(t => t.toHexString())
  );
  complimentColors = complimentColors.concat(
    tinyColor(baseColor)
      .splitcomplement()
      .map(t => varyColor(t).toHexString())
  );
  complimentColors = complimentColors.concat(
    tinyColor(baseColor)
      .analogous()
      .map(t => t.toHexString())
  );
  complimentColors = complimentColors.concat(
    tinyColor(baseColor)
      .analogous()
      .map(t => varyColor(t).toHexString())
  );
  //console.log('colors: ', complimentColors);
  // remove duplicates
  //complimentColors = [...new Set(complimentColors)];

  return complimentColors;
}
