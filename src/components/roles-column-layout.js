import React, { Component } from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import * as reactChildrenUtils from '../utils/react-children-utils';
import BemTags from '../utils/bem-tags';

export const ROLE_NAMES = ['editor', 'author', 'reviewer', 'producer'];

// TODO add a vertical option (no tabs) maybe control by a `direction` prop

export class RolesColumnLayout extends Component {
  static propTypes = {
    children: PropTypes.any,
    layout: PropTypes.oneOf(['singleColumn', 'multiColumn'])
  };

  renderMultiColumn(bem) {
    const { children } = this.props;
    return (
      <div className={bem`__multi-column__`}>
        <div className={bem`__header-row`}>
          {ROLE_NAMES.map(roleName => {
            return (
              <div className={bem`__header-col`} key={roleName}>
                {reactChildrenUtils.cloneAllOfType(
                  children,
                  RolesColumnLayoutHeader,
                  { roleName: roleName }
                )}
              </div>
            );
          })}
        </div>
        <div className={bem`__body-row`}>
          {ROLE_NAMES.map(roleName => {
            return (
              <div className={bem`__body-col`} key={roleName}>
                {reactChildrenUtils.cloneAllOfType(
                  children,
                  RolesColumnLayoutBody,
                  { roleName: roleName }
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  renderSingleColumn(bem) {
    const { children } = this.props;
    return (
      <div className={bem`__single-column__`}>
        {ROLE_NAMES.map(roleName => {
          return (
            <div className={bem`__row`} key={`${roleName}-row`}>
              <div className={bem`__header-col`}>
                {reactChildrenUtils.cloneAllOfType(
                  children,
                  RolesColumnLayoutHeader,
                  { roleName: roleName, key: `${roleName}-row-header` }
                )}
              </div>
              <div className={bem`__body-col`} key={`${roleName}-body-col`}>
                {reactChildrenUtils.cloneAllOfType(
                  children,
                  RolesColumnLayoutBody,
                  { roleName: roleName, key: `${roleName}-body-col-body` }
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    const { layout } = this.props;
    const bem = BemTags();

    return (
      <div
        className={bem`roles-column-layout --${
          layout == 'multiColumn' ? 'multi-column' : 'single-column'
        }`}
      >
        {layout == 'multiColumn'
          ? this.renderMultiColumn(bem)
          : this.renderSingleColumn(bem)}
      </div>
    );
  }
}

export class RolesColumnLayoutHeader extends Component {
  static propTypes = {
    children: PropTypes.func,
    roleName: PropTypes.PropTypes.oneOf(ROLE_NAMES)
  };

  static defaultProps = {
    roleName: 'editor',
    children: noop
  };

  render() {
    const bem = BemTags('roles-column-layout');

    const { children, roleName } = this.props;
    return <div className={bem`__header`}>{children(roleName)}</div>;
  }
}

export class RolesColumnLayoutBody extends Component {
  static propTypes = {
    children: PropTypes.func,
    roleName: PropTypes.PropTypes.oneOf(ROLE_NAMES)
  };

  static defaultProps = {
    children: noop
  };

  render() {
    const bem = BemTags('roles-column-layout');

    const { children, roleName } = this.props;
    return (
      <div key={roleName} className={bem`__body`}>
        {children(roleName)}
      </div>
    );
  }
}
