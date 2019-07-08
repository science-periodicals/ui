import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { textify } from '@scipe/jsonld';
import Iconoclass from '@scipe/iconoclass';
import AutoAbridge from '../auto-abridge';

export default class RichTextareaMenu extends React.Component {
  static propTypes = {
    selectedItemIndex: PropTypes.number,
    hasParent: PropTypes.bool,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string,
        description: PropTypes.string,
        children: PropTypes.array,
        disabled: PropTypes.bool // if `disabled` is true we can't select that item
      })
    ).isRequired
  };

  render() {
    const { options, selectedItemIndex, hasParent } = this.props;

    // TODO? handle `disabled` items (disabled items can't be selected and only act as labels)

    return (
      <ol className="rich-textarea-menu sa__clear-list-styles">
        {options.map((option, i) => (
          <li
            key={option.text}
            className={classNames('rich-textarea-menu__item', {
              'rich-textarea-menu__item--active': selectedItemIndex === i
            })}
          >
            {!!hasParent && <Iconoclass iconName="arrowOpenLeft" />}
            <AutoAbridge ellipsis={true}>
              <b>{option.text}</b>{' '}
              {option.description ? ` - ${textify(option.description)}` : ''}
            </AutoAbridge>
            {!!option.children && (
              <Iconoclass
                className="rich-textarea-menu__item__right-arrow"
                iconName="arrowOpenRight"
              />
            )}
          </li>
        ))}
      </ol>
    );
  }
}
