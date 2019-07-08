import React from 'react';
import { JournalBadge } from '../../src/';

export default class JournalBadgeExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      journalName: 'A Journal Name'
    };
  }

  handleInputRef(inputRef) {
    this.inputRef = inputRef;
  }

  handleInputChange(e) {
    let name = this.inputRef.value;
    console.log('change: ', name);
    this.setState({ journalName: name });
  }
  render() {
    return (
      <div className="example">
        <div className="example__row">
          <input
            type="text"
            onChange={e => this.handleInputChange(e)}
            ref={me => this.handleInputRef(me)}
            value={this.state.journalName}
          />
          <JournalBadge
            journal={{
              name: this.state.journalName
            }}
          />
        </div>
        <div className="example__row">
          <JournalBadge
            journal={{
              url: 'https://tryit.science.ai',
              alternateName: 'aade',
              name: 'journal name'
            }}
          />
          <JournalBadge
            link={false}
            journal={{
              url: 'https://something.science.ai',
              alternateName: 'n ade',
              name: 'N journal name'
            }}
          />
          <JournalBadge
            link={false}
            journal={{
              url: 'https://forever.science.ai',
              alternateName: 'q ade',
              name: 'Qjournal name'
            }}
            size={32}
          />
          <JournalBadge
            link={false}
            journal={{
              url: 'https://biology.science.ai',
              alternateName: 't ade',
              name: 'T journal name'
            }}
            size={40}
          />
        </div>
      </div>
    );
  }
}
