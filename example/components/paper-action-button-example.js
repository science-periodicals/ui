import React from 'react';
import { PaperActionButton, PaperActionButtonOption } from '../../src/';

export default class PaperActionButtonExample extends React.Component {
  constructor(props) {
    super(props);
    this.handleOnClick = this.handleOnClick.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.state = {
      checked: false,
      option: 'A'
    };
  }

  handleOnClick() {
    console.log('handleOnClick');
    this.setState({
      checked: !this.state.checked
    });
  }

  handleOnChange(value) {
    console.log(`handleOnChange: value=${value}`);
    this.setState({
      option: value
    });
  }

  render() {
    return (
      <div className="example">
        <div className="example__row" />

        <div className="example__row">
          <PaperActionButton
            iconName="add"
            onClick={() => console.log('click!')}
          />
          <PaperActionButton
            iconName="add"
            onClick={() => console.log('click!')}
          >
            <PaperActionButtonOption
              iconName="person"
              label="paper action button option 1"
            />
            <PaperActionButtonOption
              iconName="personAdd"
              label="paper action button option 2"
            />
            <PaperActionButtonOption
              iconName="personAdd"
              label="paper action button option 3"
            />
          </PaperActionButton>
          <PaperActionButton
            iconName="add"
            onClick={() => console.log('click!')}
            large={false}
          >
            <PaperActionButtonOption
              iconName="person"
              label="paper action button option 1"
            />
            <PaperActionButtonOption
              iconName="personAdd"
              label="paper action button option 2"
            />
            <PaperActionButtonOption
              iconName="personAdd"
              label="paper action button option 3"
              onClick={() => console.log('click option 3')}
            />
          </PaperActionButton>
        </div>

        <div className="example__row">
          <PaperActionButton
            iconName="add"
            disabled
            onClick={() => console.log('click!')}
          />
          <PaperActionButton
            iconName="add"
            disabled
            onClick={() => console.log('click!')}
          >
            <PaperActionButtonOption
              iconName="person"
              disabled
              label="paper action button option 1"
            />
            <PaperActionButtonOption
              iconName="personAdd"
              disabled
              label="paper action button option 2"
            />
            <PaperActionButtonOption
              iconName="personAdd"
              disabled
              label="paper action button option 3"
            />
          </PaperActionButton>
          <PaperActionButton
            iconName="add"
            disabled
            onClick={() => console.log('click!')}
            large={false}
          >
            <PaperActionButtonOption
              iconName="person"
              label="paper action button option 1"
            />
            <PaperActionButtonOption
              iconName="personAdd"
              label="paper action button option 2"
            />
            <PaperActionButtonOption
              iconName="personAdd"
              label="paper action button option 3"
              onClick={() => console.log('click option 3')}
            />
          </PaperActionButton>
        </div>

        <div className="example__row">
          <PaperActionButton
            iconName="add"
            readOnly
            onClick={() => console.log('click!')}
          />
          <PaperActionButton
            iconName="add"
            readOnly
            onClick={() => console.log('click!')}
          >
            <PaperActionButtonOption
              iconName="person"
              readOnly
              label="paper action button option 1"
            />
            <PaperActionButtonOption
              iconName="personAdd"
              readOnly
              label="paper action button option 2"
            />
            <PaperActionButtonOption
              iconName="personAdd"
              readOnly
              label="paper action button option 3"
            />
          </PaperActionButton>
          <PaperActionButton
            iconName="add"
            readOnly
            onClick={() => console.log('click!')}
            large={false}
          >
            <PaperActionButtonOption
              iconName="person"
              label="paper action button option 1"
            />
            <PaperActionButtonOption
              iconName="personAdd"
              label="paper action button option 2"
            />
            <PaperActionButtonOption
              iconName="personAdd"
              label="paper action button option 3"
              onClick={() => console.log('click option 3')}
            />
          </PaperActionButton>
        </div>
      </div>
    );
  }
}

/*let options = [
  {
    name: 'Start a Journal',
    iconName: 'journal',
    color: 'white',
    onClick: (e) => {
      this.handleButtonClick(e);
      this.props.onClickCreateJournal(e);
    },
  },
  {
    name: 'Start a submission',
    iconName: 'pencil',
    color: 'white',
    onClick: (e) => {
      this.handleButtonClick(e);
      this.props.onClickCreateGraph(e);
    },
  },
];*/
