import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import BemTags from '../utils/bem-tags';

export class LayoutWrapRows extends PureComponent {
  render() {
    let bem = BemTags();
    let calc = 100 / React.Children.count(this.props.children);
    //console.log('calc: ', calc);
    let flexBasis = calc + '%';
    // let flexedChildren = React.Children.map(this.props.children, child => {
    //   if (child.type === LayoutWrapItem) {
    //     React.cloneElement(child, { flexBasis });
    //   }
    // });
    return (
      <div
        className={
          bem`layout-wrap-rows` +
          ` ${this.props.className ? this.props.className.trim() : ''}`
        }
        style={{
          left: `${-(this.props.gutterWidth / 2)}px`,
          width: `calc(100% + ${this.props.gutterWidth}px)`
        }}
      >
        {/*this.props.children*/}
        {React.Children.map(this.props.children, child => {
          if (!child) return null;
          //console.log('type: ', child.type);
          let childFlexBasis = child.props.flexBasis
            ? child.props.flexBasis
            : flexBasis;
          let props = {
            flexBasis: childFlexBasis,
            gutterWidth: this.props.gutterWidth
          };
          return React.cloneElement(child, props);
        })}
      </div>
    );
  }
}

LayoutWrapRows.defaultProps = {
  gutterWidth: 24
};
LayoutWrapRows.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  gutterWidth: PropTypes.number
};

export class LayoutWrapItem extends PureComponent {
  render() {
    //console.log('layoutWrapItem className: ', this.props.className);
    const bem = BemTags();
    return (
      <div
        className={
          bem`layout-wrap-item` +
          ` ${this.props.className ? this.props.className.trim() : ''}`
        }
        style={{
          minWidth: this.props.flexBasis,
          paddingLeft: `${this.props.gutterWidth / 2}px`,
          paddingRight: `${this.props.gutterWidth / 2}px`
        }}
      >
        {this.props.children}
      </div>
    );
  }
}

LayoutWrapItem.defaultProps = {};

LayoutWrapItem.propTypes = {
  children: PropTypes.node,
  flexBasis: PropTypes.string,
  className: PropTypes.string,
  gutterWidth: PropTypes.number
};
