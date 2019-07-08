import React from 'react';
import {
  Card,
  ExpansionPanel,
  ExpansionPanelPreview,
  ExpansionPanelGroup
} from '../../src/';

export default function ExpansionPanelExample(props) {
  return (
    <div className="example">
      <div className="example__row">
        <Card>
          <div style={{ width: '420px' }}>
            <h3 style={{ padding: '16px' }}>
              Expansion Panel Example (React motion)
            </h3>
            <ExpansionPanel expanded={false}>
              <ExpansionPanelPreview>
                <span
                  style={{
                    boxSizing: 'borderBox',
                    paddingRight: '32px',
                    width: '25%'
                  }}
                >
                  Panel A Title
                </span>
                <span style={{ paddingRight: '32px' }}>Three Items</span>
              </ExpansionPanelPreview>
              <div style={{ padding: '16px' }}>
                My Collapsing Conent <br />
                Something Else <br />
                Make More space <br />
                <ExpansionPanel expanded={false}>
                  <ExpansionPanelPreview>
                    <span
                      style={{
                        boxSizing: 'borderBox',
                        paddingRight: '32px',
                        width: '25%'
                      }}
                    >
                      Panel A Title
                    </span>
                    <span style={{ paddingRight: '32px' }}>Three Items</span>
                  </ExpansionPanelPreview>
                  <div style={{ padding: '16px' }}>
                    My Collapsing Conent <br />
                    Something Else <br />
                    Make More space <br />
                  </div>
                </ExpansionPanel>
              </div>
            </ExpansionPanel>
          </div>
        </Card>
      </div>

      <div className="example__row">
        <Card>
          <div style={{ width: '420px' }}>
            <h3 style={{ padding: '16px' }}>
              Expansion Panel Example (CSS max-height)
            </h3>
            <ExpansionPanel maxHeight={96}>
              <ExpansionPanelPreview>
                <span
                  style={{
                    boxSizing: 'borderBox',
                    padding: '0 24px',
                    width: '25%'
                  }}
                >
                  Panel A Title
                </span>
                <span style={{ padding: '0 16px' }}>Three Items</span>
              </ExpansionPanelPreview>
              <div style={{ padding: '16px' }}>
                My Collapsing Conent <br />
                Something Else <br />
                Make More space <br />
              </div>
            </ExpansionPanel>
          </div>
        </Card>
      </div>

      <div className="example__row">
        <Card>
          <div style={{ width: '420px' }}>
            <h3 style={{ padding: '16px' }}>Nested Expansion Panel Example</h3>
            <ExpansionPanel expanded={false}>
              <ExpansionPanelPreview>Panel Title</ExpansionPanelPreview>
              <div>
                <p>Content</p>
                <ExpansionPanel expanded={false}>
                  <ExpansionPanelPreview>
                    Nested Panel Title
                  </ExpansionPanelPreview>
                  <p>Nested Panel Content</p>
                </ExpansionPanel>
              </div>
            </ExpansionPanel>
          </div>
        </Card>
      </div>

      <div className="example__row">
        <Card>
          <div style={{ width: '420px' }}>
            <h3 style={{ padding: '16px' }}>Expansion Panel Group Example</h3>
            <ExpansionPanelGroup
              className="example-group"
              onChange={(isExpanded, i) =>
                console.log('onChange: ', isExpanded, i)
              }
            >
              <ExpansionPanel className="example-panel">
                <ExpansionPanelPreview className="example-panel-preview">
                  <span
                    style={{
                      boxSizing: 'borderBox',
                      padding: '0 16px',
                      width: '25%'
                    }}
                  >
                    My Title
                  </span>
                  <span style={{ padding: '0 16px' }}>
                    Contains Four Items and a longer string of text for checking
                    overflow
                  </span>
                </ExpansionPanelPreview>
                <div style={{ padding: '16px' }}>
                  Expansion Panel 1 <br />
                  My Collapsing Conent <br />
                  Something Else <br />
                  Make More space <br />
                </div>
              </ExpansionPanel>
              <ExpansionPanel>
                <ExpansionPanelPreview>
                  <span
                    style={{
                      boxSizing: 'borderBox',
                      padding: '0 16px',
                      width: '25%'
                    }}
                  >
                    Another Title
                  </span>
                  <span style={{ padding: '0 16px' }}>contents summary</span>
                </ExpansionPanelPreview>
                <div style={{ padding: '16px' }}>
                  Expansion Panel 2 <br />
                  My Collapsing Conent <br />
                  Something Else <br />
                  Make More space <br />
                </div>
              </ExpansionPanel>
            </ExpansionPanelGroup>
          </div>
        </Card>
      </div>
    </div>
  );
}
