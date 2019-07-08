import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Iconoclass from '@scipe/iconoclass';
import noop from 'lodash/noop';
import * as reactChildrenUtils from '../../utils/react-children-utils';
import Menu from '../menu/menu';
import MenuHead from '../menu/menu-head';
import MenuItem, {
  MenuCardItem,
  MenuItemDivider,
  MenuItemLabel
} from '../menu/menu-item';
import BemTags from '../../utils/bem-tags';

export default class ButtonMenu extends React.PureComponent {
  static propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    'data-testid': PropTypes.string,
    id: PropTypes.string,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    type: PropTypes.oneOf(['submit', 'reset', 'button', 'menu']),
    raised: PropTypes.bool,
    capsule: PropTypes.bool
  };

  static defaultProps = {
    onClick: noop,
    raised: false,
    capsule: false
  };

  constructor(props) {
    super(props);

    this.menuRef = React.createRef();
  }

  focus() {
    if (this.menuRef.current) {
      // note: getInstance is a method of the onClickOutside HOC wrapping Menu
      this.menuRef.current.getInstance().focus();
    }
  }

  render() {
    let {
      children,
      disabled,
      className,
      id,
      raised,
      capsule,
      onClick,
      ...menuProps
    } = this.props;
    const bem = BemTags();
    return (
      <div
        className={classNames(
          bem`button-menu${disabled ? ' --disabled' : ''}${
            raised ? ' --raised' : ' --flat'
          }${capsule ? ' --capsule' : ''}`,
          className
        )}
        data-testid={this.props['data-testid']}
        id={id}
        role="menu"
        onClick={!disabled ? onClick : undefined}
      >
        <Menu
          align="right"
          size="16px"
          portal={true}
          disabled={disabled}
          ref={this.menuRef}
          {...menuProps}
        >
          <MenuHead>
            <div className={bem`__head`}>
              {reactChildrenUtils.getAllNotOfType(children, MenuItem)}
              <Iconoclass
                iconName="dropdown"
                size="16px"
                className={bem`__dropdown-icon`}
              />
            </div>
          </MenuHead>
          {reactChildrenUtils.getAllOfType(children, [
            MenuItem,
            MenuCardItem,
            MenuItemDivider,
            MenuItemLabel
          ])}
        </Menu>
      </div>
    );
  }
}
