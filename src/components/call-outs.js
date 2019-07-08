import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import noop from 'lodash/noop';
import ReactPortal from './react-portal';
import BemTags from '../utils/bem-tags';

export class CallOut extends PureComponent {
  render() {
    const bem = BemTags('call-outs');

    return (
      <div
        className={bem`__call-out ${
          this.props._entered ? '--entered' : '--unentered'
        }`}
        onMouseEnter={this.props._onEnter}
        onFocus={this.props._onEnter}
        onMouseLeave={this.props._onLeave}
        onBlur={this.props._onLeave}
      >
        {this.props.children}
      </div>
    );
  }
}

CallOut.propTypes = {
  targetID: PropTypes.string.isRequired,
  children: PropTypes.any,
  label: PropTypes.string,
  defaultLabelVisible: PropTypes.bool,
  _entered: PropTypes.bool,
  _onEnter: PropTypes.func,
  _onLeave: PropTypes.func
};

CallOut.defaultProps = {
  _onEnter: noop,
  _onLeave: noop,
  defaultLabelVisible: false
};

export default class CallOuts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enteredCallOutList: [],
      enteredLabelList: []
    };
  }

  handleCallOutEnter(id, e) {
    this.setCallOutAsEntered(id);
  }

  handleCallOutLeave(id, e) {
    this.unsetCallOutAsEntered(id);
  }

  handleLabelEnter(id, e) {
    this.setLabelAsEntered(id);
  }

  handleLabelLeave(id, e) {
    this.unsetLabelAsEntered(id);
  }

  setCallOutAsEntered(id) {
    let enteredArr = this.state.enteredCallOutList;
    if (enteredArr.indexOf(id) == -1) {
      enteredArr.push(id);
      this.setState({ enteredCallOutList: enteredArr });
    }
  }

  unsetCallOutAsEntered(id) {
    let enteredArr = this.state.enteredCallOutList;
    if (enteredArr.indexOf(id) !== -1) {
      enteredArr.splice(enteredArr.indexOf(id), 1);
      this.setState({ enteredCallOutList: enteredArr });
    }
  }

  setLabelAsEntered(id) {
    let enteredArr = this.state.enteredLabelList;
    if (enteredArr.indexOf(id) == -1) {
      enteredArr.push(id);
      this.setState({ enteredLabelList: enteredArr });
    }
  }

  unsetLabelAsEntered(id) {
    let enteredArr = this.state.enteredLabelList;
    if (enteredArr.indexOf(id) !== -1) {
      enteredArr.splice(enteredArr.indexOf(id), 1);
      this.setState({ enteredLabelList: enteredArr });
    }
  }

  render() {
    const bem = BemTags();
    return (
      <div className={bem`call-outs`}>
        <ol className={bem`__list`}>
          {React.Children.map(this.props.children, (child, i) => {
            let newCallOutProps = {
              _onEnter: this.handleCallOutEnter.bind(this, i),
              _onLeave: this.handleCallOutLeave.bind(this, i),
              _entered:
                this.state.enteredLabelList.indexOf(i) === -1 ? false : true
            };
            return (
              <li className={bem`__item`} key={i}>
                <ReactPortal
                  position="absolute"
                  parentID={child.props.targetID}
                  portalClass={bem`__call-out-label-portal`}
                >
                  <div
                    className={bem`__call-out-label ${
                      this.state.enteredCallOutList.indexOf(i) === -1
                        ? '--unentered'
                        : '--entered'
                    } ${
                      child.props.defaultLabelVisible
                        ? '--defaultVisible'
                        : '--defaultHidden'
                    }
                       --${child.props.targetID}`}
                    onMouseEnter={this.handleLabelEnter.bind(this, i)}
                    onFocus={this.handleLabelEnter.bind(this, i)}
                    onMouseLeave={this.handleLabelLeave.bind(this, i)}
                    onBlur={this.handleLabelLeave.bind(this, i)}
                  >
                    {child.props.label || i + 1}
                  </div>
                </ReactPortal>
                {React.cloneElement(child, newCallOutProps)}
              </li>
            );
          })}
        </ol>
      </div>
    );
  }
}

CallOuts.propTypes = {
  children: PropTypes.any
};
