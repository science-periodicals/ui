import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse } from 'react-collapse';
import noop from 'lodash/noop';
import Iconoclass from '@scipe/iconoclass';
import BemTags from '../utils/bem-tags';
import PaperButton from './paper-button';
import StepperItem from './stepper-item';
import { typesMatch } from '../utils/react-children-utils';

let bem = BemTags();

export default class Stepper extends Component {
  constructor(props) {
    super(props);

    this._touched = false;
    if (props.defaultActiveStep != null || props.activeStep == null) {
      this.state = {
        activeStep:
          props.defaultActiveStep == null ? 0 : props.defaultActiveStep
      };
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      (!this._touched &&
        this.props.defaultActiveStep == null &&
        nextProps.defaultActiveStep != null) ||
      (this.props.defaultActiveStep != null &&
        nextProps.defaultActiveStep != null &&
        this.props.defaultActiveStep !== nextProps.defaultActiveStep)
    ) {
      this.setState({
        activeStep: nextProps.defaultActiveStep
      });
    }
  }

  handleClick(stepNum, childProps) {
    //console.log('clk', stepNum, childProps);
    this._touched = true;
    if (!childProps.disabled) {
      if (
        this.props.defaultActiveStep != null ||
        this.props.activeStep == null
      ) {
        this.setState({ activeStep: stepNum });
      }
      this.props.onChange(stepNum, childProps.title);
      childProps.onClick(stepNum, childProps);
    }
  }

  getActiveStep() {
    if (this.props.defaultActiveStep != null || this.props.activeStep == null) {
      return this.state.activeStep;
    } else if (this.props.activeStep != null) {
      return this.props.activeStep;
    } else {
      return 0;
    }
  }

  renderVertical() {
    const activeStep = this.getActiveStep();
    const children = React.Children.toArray(this.props.children).filter(
      child => child && typesMatch(child, StepperItem)
    );

    return (
      <div className={'stepper-container'}>
        <div className={bem`stepper --vertical`}>
          <div className={bem`bar`} />
          <div className={bem`steps`}>
            {children.map((child, i) => {
              let icon = `${i + 1}`;

              if (child.props.icon) {
                icon = child.props.icon;
              } else {
                if (child.props.editable && child.props.completed) {
                  icon = 'pencil';
                } else if (child.props.completed) {
                  icon = 'check';
                } else if (child.props.waiting) {
                  icon = 'time';
                }
              }
              return (
                <div
                  key={child.key}
                  className={bem`step
                    --${activeStep === i ? 'active' : 'inactive'}
                    --${child.props.complete ? 'complete' : 'incomplete'}
                    --${child.props.disabled ? 'disabled' : 'enabled'}
                    --${child.props.editable ? 'editable' : 'ineditable'}
                  `}
                >
                  <div
                    className={bem`step-header --${
                      activeStep === i ? 'active' : 'inactive'
                    } --${child.props.complete ? 'complete' : 'incomplete'} --${
                      child.props.disabled ? 'disabled' : 'enabled'
                    } --${child.props.editable ? 'editable' : 'ineditable'}`}
                  >
                    <div className={bem`step-header-bg`}>
                      {child.props.button ? (
                        <PaperButton
                          onClick={this.handleClick.bind(this, i, child.props)}
                          disabled={child.props.disabled}
                          capsule={true}
                          raised={true}
                        >
                          {' '}
                          {child.props.title}
                        </PaperButton>
                      ) : (
                        <div className={bem`step-header-contents`}>
                          <Iconoclass
                            iconName={icon}
                            disabled={child.props.disabled}
                            elementType="button"
                            onClick={this.handleClick.bind(
                              this,
                              i,
                              child.props
                            )}
                            round={true}
                          />
                          {child.props.title && (
                            <div
                              className={bem`step-header-title`}
                              onClick={this.handleClick.bind(
                                this,
                                i,
                                child.props
                              )}
                            >
                              {child.props.title}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <Collapse isOpened={activeStep === i}>
                    <div className={bem`step-content-container`}>{child}</div>
                  </Collapse>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  renderHorizontal() {
    const activeStep = this.getActiveStep();
    const children = React.Children.toArray(this.props.children).filter(
      child => child && typesMatch(child, StepperItem)
    );

    const bem = new BemTags('stepper');

    return (
      <div className={'stepper-container'}>
        <div className={bem`--horizontal`}>
          <div className={bem`__step-nav`}>
            <div className={bem`__bar`} />
            {children.map((child, i) => {
              let icon = `${i + 1}`;

              if (child.props.icon) {
                icon = child.props.icon;
              } else {
                if (child.props.editable && child.props.completed) {
                  icon = 'pencil';
                } else if (child.props.completed) {
                  icon = 'check';
                } else if (child.props.waiting) {
                  icon = 'time';
                }
              }

              return (
                <div
                  key={child.key}
                  className={bem`__step-header
                    --${activeStep === i ? 'active' : 'inactive'}
                    --${child.props.complete ? 'complete' : 'incomplete'}
                    --${child.props.disabled ? 'disabled' : 'enabled'}
                    --${child.props.editable ? 'editable' : 'ineditable'}
                      ${child.props.button ? '--button' : ''}
                  `}
                >
                  <div className={bem`__step-header-bg`}>
                    {child.props.button ? (
                      <PaperButton
                        onClick={this.handleClick.bind(this, i, child.props)}
                        disabled={child.props.disabled}
                        capsule={true}
                        raised={true}
                      >
                        {' '}
                        {child.props.title}
                      </PaperButton>
                    ) : (
                      <div className={bem`__step-header-contents`}>
                        <div className={bem`__step-header-contents__icon`}>
                          <Iconoclass
                            iconName={icon}
                            disabled={child.props.disabled}
                            elementType="button"
                            onClick={this.handleClick.bind(
                              this,
                              i,
                              child.props
                            )}
                            round={true}
                            className={bem`__step-header-icon`}
                          />
                          {child.props.statusIconName && (
                            <div
                              className={bem`__step-header-contents__icon__status-container`}
                            >
                              <Iconoclass
                                iconName={child.props.statusIconName}
                                size="14px"
                                round={true}
                                className={bem`__step-header-contents__icon__status`}
                              />
                            </div>
                          )}
                        </div>
                        {child.props.title && (
                          <div
                            className={bem`__step-header-title`}
                            onClick={this.handleClick.bind(
                              this,
                              i,
                              child.props
                            )}
                          >
                            {child.props.title}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {children.map((child, i) => (
            <div
              key={child.key}
              className={bem`step --${
                activeStep === i ? 'active' : 'inactive'
              } --${child.props.complete ? 'complete' : 'incomplete'} --${
                child.props.disabled ? 'disabled' : 'enabled'
              } --${child.props.editable ? 'editable' : 'ineditable'}`}
            >
              {child.props.title && (
                <div
                  className={bem`step-header-mobile-title`}
                  onClick={this.handleClick.bind(this, i, child.props)}
                >
                  {child.props.title}
                </div>
              )}
              <div className={bem`step-content-container`}>{child}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  render() {
    if (this.props.direction === 'vertical') return this.renderVertical();
    else if (this.props.direction === 'horizontal')
      return this.renderHorizontal();
  }
}

Stepper.defaultProps = {
  direction: 'horizontal',
  onChange: noop
};

Stepper.propTypes = {
  children: PropTypes.node,
  onChange: PropTypes.func,
  defaultActiveStep: PropTypes.number, // if componenent is not controlled
  activeStep: PropTypes.number, // if componenent is controlled
  direction: PropTypes.oneOf(['vertical', 'horizontal'])
};
