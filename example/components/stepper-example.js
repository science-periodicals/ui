import React from 'react';
import { Stepper, StepperItem } from '../../src/';

export default class StepperExample extends React.Component {
  render() {
    return (
      <div className="example" style={{ maxWidth: '800px' }}>
        <div className="example__row">
          <Stepper
            onChange={(number, title) =>
              console.log('stepper changed: ', number, title)
            }
          >
            <StepperItem title="step 1">
              <div>Somestuff here</div>
            </StepperItem>
            <StepperItem title="step 2" waiting={true}>
              Step 2
            </StepperItem>
            <StepperItem title="step 3" editable={false} completed={true}>
              Step 3
            </StepperItem>
            <StepperItem
              editable={true}
              completed={true}
              statusIconName="warning"
            >
              Editable & Complete Step
            </StepperItem>
            <StepperItem
              button={true}
              title="step 4"
              editable={true}
              onClick={() => console.log('Click!')}
            >
              Complete Step
            </StepperItem>
          </Stepper>
        </div>
        <div className="example__row" style={{ width: '600px' }}>
          <Stepper
            direction="vertical"
            onChange={(number, title) =>
              console.log('stepper changed: ', number, title)
            }
          >
            <StepperItem title="step 1">
              <div>Somestuff here</div>
            </StepperItem>
            <StepperItem waiting={true}>
              Step 2 <br />
              second line <br />
              third line
            </StepperItem>
            <StepperItem title="step 3" completed={true}>
              Editable & Complete Step
            </StepperItem>
            <StepperItem
              title="step 4"
              editable={true}
              button={true}
              onClick={() => console.log('click!')}
              statusIconName="person"
            >
              Complete Step
            </StepperItem>
          </Stepper>
        </div>
      </div>
    );
  }
}
