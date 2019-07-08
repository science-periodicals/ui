import React from 'react';
import {
  HeaderSearch,
  HeaderSearchRight,
  HeaderSearchLeft,
  UserBadgeMenu,
  TagMenu,
  MenuItem,
  BemTags,
  StartMenu
} from '../../src/';

const bem = BemTags('header-search');

export default class HeaderSearchExample extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: false
    };
  }
  render() {
    return (
      <div
        style={{
          position: 'relative',
          minHeight: '500px',
          width: '100%',
          left: '0',
          height: '5.6rem',
          top: '5.6rem'
        }}
      >
        <HeaderSearch
          onChangeSearch={e => {
            console.log(e.target.name, e.target.value);
            this.setState({ loading: !this.state.loading });
          }}
          loading={this.state.loading}
          fixed={false}
          searchValue={'test search'}
          onSearchMenuClick={() => console.log('click')}
        >
          <TagMenu value="Projects">
            <MenuItem icon={{ iconName: 'fileText' }} value="Projects">
              Projects
            </MenuItem>
            <MenuItem icon={{ iconName: 'journal' }} value="Journals">
              Journals
            </MenuItem>
          </TagMenu>
          <HeaderSearchLeft>
            <div
              className={bem`example-left`}
              style={{
                whiteSpace: 'nowrap',
                height: '56px',
                padding: '4px 0',
                boxSizing: 'border-box'
              }}
            >
              {/* <img
                src="/images/scienceai_logo_v1.2.0_logo_min.svg"
                alt="science.ai logo"
                className="header__scienceai-logo"
                height="24px"
              /> */}
              <img
                src="/images/sci-logo-menubar-h48px.svg"
                alt="science.ai logo"
                className="header__scienceai-logo"
                style={{ maxHeight: '100%' }}
              />
            </div>
          </HeaderSearchLeft>
          <HeaderSearchRight>
            <div
              className={bem`example-right`}
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                width: '100%'
              }}
            >
              <StartMenu />
              <UserBadgeMenu statusIconName="lock" />
            </div>
          </HeaderSearchRight>
        </HeaderSearch>
      </div>
    );
  }
}
