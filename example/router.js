import { hot } from 'react-hot-loader/root';
import React, { Component } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Iconoclass from '@scipe/iconoclass';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom';
import {
  Header,
  Footer,
  ResponsiveHeaderItem,
  ResponsiveHeaderMenu,
  MenuItem,
  AppLayout,
  AppLayoutHeader,
  AppLayoutSubHeader,
  AppLayoutBanner,
  AppLayoutLeft,
  AppLayoutMiddle,
  AppLayoutMiddleFooter,
  AppLayoutWidgetPanel,
  AppLayoutRight,
  AppLayoutFooter,
  AppLayoutWidgetPanelWidget,
  AppLayoutWidgetPanelWidgetIcon,
  CounterBadge,
  StartMenu
} from '../src';
import * as examples from './';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isReady: false,
      leftExpanded: false,
      rightExpanded: false
    };
  }

  componentDidMount() {
    window.addEventListener('load', this.handleLoad);
  }

  componentWillUnmount() {
    window.removeEventListener('load', this.handleLoad);
  }

  handleLoad = e => {
    this.setState({ isReady: true });
  };

  handleCloseRight() {
    this.setState({ rightExpanded: !this.state.rightExpanded });
  }

  handleHamburgerClick() {
    this.setState({ leftExpanded: !this.state.leftExpanded });
  }

  handleWidgetClick(e) {
    console.log('clk! rightExpanded:', !this.state.rightExpanded);
    this.setState({ rightExpanded: !this.state.rightExpanded });
  }

  render() {
    const { isReady } = this.state;

    const crumbs =
      this.props.location.pathname === '/'
        ? []
        : [
            {
              href: '#',
              children: 'bread crumb'
            },
            {
              to: this.props.location.pathname,
              children: this.props.location.pathname.replace('/', '')
            }
          ];

    return (
      <AppLayout
        leftExpanded={this.state.leftExpanded}
        rightExpanded={this.state.rightExpanded}
      >
        {/* <AppLayoutBanner absolutePosition={true}>
            <div
            style={{
            height: '200px',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
            }}
            >
            Banner
            </div>
            </AppLayoutBanner> */}
        <AppLayoutHeader>
          <Header
            userBadge={{ userId: 'user:tiffany', roleName: 'author' }}
            homeLink={{ to: { pathname: '/' } }}
            logoLink={{ to: { pathname: '/' } }}
            showHome={true}
            showHamburger={true}
            onClickHamburger={() => this.handleHamburgerClick()}
            crumbs={crumbs}
            startMenu={<StartMenu alert={true} />}
          >
            <ResponsiveHeaderItem>
              <span>Child test</span>
            </ResponsiveHeaderItem>
            <ResponsiveHeaderItem>
              <a href="http://example.com">link test</a>
            </ResponsiveHeaderItem>
            <ResponsiveHeaderMenu
              title="Components"
              align="right"
              icon="dropdown"
              maxHeight="600px"
            >
              {Object.keys(examples)
                .sort()
                .map(key => (
                  <MenuItem key={key} to={`/${key.replace('Example', '')}`}>
                    {key.replace('Example', '')}
                  </MenuItem>
                ))}
            </ResponsiveHeaderMenu>
          </Header>
        </AppLayoutHeader>
        <AppLayoutSubHeader>
          <div
            style={{
              padding: '8px 16px',
              background: 'grey',
              color: 'white'
            }}
          >
            SubHeader with a longer text that might change height on resize -
            need to check if there are any infinite loops caused by resizing the
            subHeader
          </div>
        </AppLayoutSubHeader>
        <AppLayoutLeft backgroundOnDesktop={false}>
          <ComponentList />
        </AppLayoutLeft>
        <AppLayoutMiddle widthMode="maximize">
          <Switch>
            <Route path="/" exact={true} component={ComponentList} />
            {Object.keys(examples).map(key => (
              <Route
                key={key}
                path={`/${key.replace('Example', '')}`}
                render={props => {
                  const UiComponent = examples[key];
                  return (
                    <div
                      data-test-ready={isReady.toString()}
                      data-testid="backstop-ui-component"
                    >
                      <UiComponent {...props} />
                    </div>
                  );
                }}
              />
            ))}
          </Switch>
          <AppLayoutMiddleFooter>
            <div
              style={{
                width: '100%',
                textAlign: 'right',
                padding: '24px',
                pointerEvents: 'none'
              }}
            >
              <Iconoclass
                style={{ pointerEvents: 'auto' }}
                behavior="button"
                round={true}
                onClick={() => console.log("i'm in the AppLayoutMiddleFoooter")}
              />
            </div>
          </AppLayoutMiddleFooter>
        </AppLayoutMiddle>

        <AppLayoutRight backgroundOnDesktop={false}>
          {/* <div>Right Panel Child</div> */}
          <AppLayoutWidgetPanel backgroundOnDesktop={false}>
            <AppLayoutWidgetPanelWidgetIcon
              onClick={e => this.handleWidgetClick(e)}
              isActive={true}
            >
              <Iconoclass iconName="alert" />
            </AppLayoutWidgetPanelWidgetIcon>
            <AppLayoutWidgetPanelWidgetIcon
              onClick={e => this.handleWidgetClick(e)}
              isActive={false}
            >
              <CounterBadge count={3}>
                <Iconoclass iconName="person" />
              </CounterBadge>
            </AppLayoutWidgetPanelWidgetIcon>
            <AppLayoutWidgetPanelWidget
              onClickClose={this.handleCloseRight.bind(this)}
              title="My Widget"
            >
              Widget
            </AppLayoutWidgetPanelWidget>
          </AppLayoutWidgetPanel>
        </AppLayoutRight>
        <AppLayoutFooter>
          <Footer
            padding="small"
            sticky={true}
            shortBody={true}
            hideCopyright={true}
          />
        </AppLayoutFooter>
      </AppLayout>
    );
  }
}

class ComponentList extends Component {
  render() {
    return (
      <div className="example-list">
        <ul>
          {Object.keys(examples)
            .sort()
            .map(key => (
              <li key={key} className="example-list__item">
                <Link to={key.replace('Example', '')}>
                  {key.replace('Example', '')}
                </Link>
              </li>
            ))}
        </ul>
      </div>
    );
  }
}

const DDApp = DragDropContext(HTML5Backend)(App);

class Router extends Component {
  render() {
    return (
      <BrowserRouter>
        <Route path="/" component={DDApp} />
      </BrowserRouter>
    );
  }
}

export default hot(Router);
