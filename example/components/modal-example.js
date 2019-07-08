import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Card, Modal, PaperButton } from '../../src/';

export default class ModalExample extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalAVisible: false,
      modalBVisible: false
    };
  }

  handleClickOutside() {
    console.log('modal example click outside');
    this.setState({ modalAVisible: false });
  }

  render() {
    return (
      <div className="example">
        <div className="example__row">
          <PaperButton
            onClick={() =>
              this.setState({ modalAVisible: !this.state.modalAVisible })
            }
          >
            Clickout Modal!
          </PaperButton>
        </div>
        <div className="example__row">
          <div
            id="modal-example-context"
            style={{
              position: 'relative',
              width: '250px',
              height: '250px',
              border: '1px solid grey',
              overflowY: 'auto'
            }}
          >
            <div
              style={{
                height: '1000px'
              }}
            >
              scroll down <br />
              scroll down <br />
              scroll down <br />
              <PaperButton
                onClick={() =>
                  this.setState({ modalBVisible: !this.state.modalBVisible })
                }
              >
                Contextual Modal!
              </PaperButton>
              <p>scrollable content here</p>
            </div>
          </div>
        </div>

        {this.state.modalAVisible && (
          <Modal onClickOutside={() => this.handleClickOutside()}>
            <Card>
              <div
                style={{
                  width: '25vh',
                  height: '25vh',
                  backgroundColor: 'white',
                  padding: '24px'
                }}
              >
                Hello World!
                <PaperButton
                  onClick={() =>
                    this.setState({ modalAVisible: !this.state.modalAVisible })
                  }
                >
                  Close Me
                </PaperButton>
                <p>Or Click Outside to close</p>
                <Link to="/">
                  Link back to home (test that context is forwarded)
                </Link>
              </div>
            </Card>
          </Modal>
        )}

        {this.state.modalBVisible && (
          <Modal
            parentID="modal-example-context"
            onClickOutside={() => this.handleClickOutside()}
          >
            <Card>
              <div style={{ backgroundColor: 'white', padding: '24px' }}>
                Hello World!
                <PaperButton
                  onClick={() =>
                    this.setState({ modalBVisible: !this.state.modalBVisible })
                  }
                >
                  Close Me
                </PaperButton>
              </div>
            </Card>
          </Modal>
        )}
      </div>
    );
  }
}
