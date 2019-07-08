import React from 'react';
import Value from './value';

// Header / Footer would conflict with the UI components (top and bottom layout) :(

export class H1 extends React.Component {
  render() {
    return <Value {...this.props} tagName="h1" />;
  }
}

export class H2 extends React.Component {
  render() {
    return <Value {...this.props} tagName="h2" />;
  }
}

export class H3 extends React.Component {
  render() {
    return <Value {...this.props} tagName="h3" />;
  }
}

export class H4 extends React.Component {
  render() {
    return <Value {...this.props} tagName="h4" />;
  }
}

export class H5 extends React.Component {
  render() {
    return <Value {...this.props} tagName="h5" />;
  }
}

export class H6 extends React.Component {
  render() {
    return <Value {...this.props} tagName="h6" />;
  }
}

export class Span extends React.Component {
  render() {
    return <Value {...this.props} tagName="span" />;
  }
}

export class Sup extends React.Component {
  render() {
    return <Value {...this.props} tagName="sup" />;
  }
}

export class A extends React.Component {
  render() {
    return <Value {...this.props} tagName="a" />;
  }
}

export class Strong extends React.Component {
  render() {
    return <Value {...this.props} tagName="strong" />;
  }
}

export class Cite extends React.Component {
  render() {
    return <Value {...this.props} tagName="cite" />;
  }
}

export class Div extends React.Component {
  render() {
    return <Value {...this.props} tagName="div" />;
  }
}

export class Section extends React.Component {
  render() {
    return <Value {...this.props} tagName="section" />;
  }
}

export class Article extends React.Component {
  render() {
    return <Value {...this.props} tagName="article" />;
  }
}

export class Label extends React.Component {
  render() {
    return <Value {...this.props} tagName="label" />;
  }
}

export class Li extends React.Component {
  render() {
    return <Value {...this.props} tagName="li" />;
  }
}

export class Dt extends React.Component {
  render() {
    return <Value {...this.props} tagName="dt" />;
  }
}

export class Dd extends React.Component {
  render() {
    return <Value {...this.props} tagName="dd" />;
  }
}
