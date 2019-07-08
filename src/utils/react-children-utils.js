import React from 'react';

//let reactChildrenUtils = Object.create(React.Children);

export function mapOfType(children, types, callback) {
  let childrenOfType = [];
  let i = 0;
  React.Children.forEach(children, child => {
    //let name = React.Children.getComponentDisplayName(child);
    if (typesMatch(child, types)) {
      childrenOfType.push(callback(child, i));
      i++;
    }
  });
  return childrenOfType;
}

export function forEachOfType(children, types, callback) {
  React.Children.forEach(children, child => {
    //let name = React.Children.getComponentDisplayName(child);
    if (typesMatch(child, types)) {
      callback(child);
    }
  });
}

export function hasChildrenOfType(children, types) {
  React.Children.forEach(children, child => {
    //let name = React.Children.getComponentDisplayName(child);
    if (typesMatch(child, types)) {
      return true;
    }
  });
  return false;
}

/* Note: this will not find children inside of a react-redux context */
export function hasDeepChildrenOfType(
  children,
  types,
  maxDepth = 10,
  _depth = 0
) {
  let result = false;
  React.Children.forEach(children, child => {
    if (!result && _depth <= maxDepth) {
      if (typesMatch(child, types)) {
        result = true;
      } else if (child && child.props && child.props.children) {
        result = hasDeepChildrenOfType(
          child.props.children,
          types,
          maxDepth,
          _depth + 1
        );
      }
    }
  });
  return result;
}

export function oneOfType(child, types) {
  if (typesMatch(child, types)) return child;
}

export function firstOfType(children, types) {
  let childrenOfType = [];
  React.Children.forEach(children, child => {
    //let name = React.Children.getComponentDisplayName(child);
    if (typesMatch(child, types)) {
      childrenOfType.push(child);
    }
  });
  if (childrenOfType.length === 0) return null;
  return childrenOfType[0];
}

export function getAllOfType(children, types) {
  let childrenOfType = [];
  React.Children.forEach(children, child => {
    //let name = React.Children.getComponentDisplayName(child);
    if (typesMatch(child, types)) {
      childrenOfType.push(child);
    }
  });
  if (childrenOfType.length === 0) return null;
  return childrenOfType;
}

export function getAllNotOfType(children, types) {
  let childrenOfType = [];
  React.Children.forEach(children, child => {
    //let name = React.Children.getComponentDisplayName(child);
    if (!typesMatch(child, types)) {
      childrenOfType.push(child);
    }
  });
  if (childrenOfType.length === 0) return null;
  return childrenOfType;
}

export function cloneAllOfType(children, types, props, cloneChildren) {
  let childrenOfType = [];
  let i = 0;
  React.Children.forEach(children, child => {
    let name = getComponentDisplayName(child);

    if (typesMatch(child, types)) {
      if (props && props.key) {
        props.key = props.key + '_' + i;
      }

      if (cloneChildren) {
        childrenOfType.push(React.cloneElement(child, props, cloneChildren));
      } else {
        childrenOfType.push(React.cloneElement(child, props));
      }
      i++;
    }
  });
  if (childrenOfType.length === 0) return null;
  // if there is only one child in array, react will throw key error if child does not have a key.
  if (childrenOfType.length === 1) return childrenOfType[0];

  return childrenOfType;
}

export function typesMatch(needle, haystack) {
  if (Array.isArray(haystack)) {
    return haystack.some(component => {
      if (isA(needle, component)) return true;
      return false;
    });
  }
  return isA(needle, haystack);
}

/**
 * Note: we don't rely on display name as the primary method as uglify will
 * strip it in prod. We do however use it as a fallback to circumvent issue with
 * react-hot-loader in dev mode.
 */
export function isA(
  child,
  Component // NOTE: in case of DOM element can be an instance like: <div />
) {
  if (!(child && Component)) return false;
  if (
    child.type &&
    (child.type === Component ||
      (typeof Component === 'function' && child.type instanceof Component) ||
      // in case Component is an instance (like for <div />
      (Component.type &&
        typeof Component.type === 'function' &&
        child.type instanceof Component.type) ||
      (Component.constructor &&
        typeof Component.constructor === 'function' &&
        child.type === Component.constructor))
  ) {
    return true;
  }
  // fallback for react hot loader (see https://github.com/gaearon/react-hot-loader#checking-element-types)
  const childDisplayName = getComponentDisplayName(child);
  const componentDisplayName = getComponentDisplayName(Component);

  if (
    typeof childDisplayName === 'string' &&
    typeof componentDisplayName === 'string' &&
    childDisplayName === componentDisplayName
  ) {
    return true;
  }

  return false;
}

export function getComponentDisplayName(Component) {
  if (!Component) {
    return undefined;
  }
  return (
    Component.displayName ||
    Component.name ||
    (Component.type && Component.type.displayName) ||
    Component.type /* for non-component elements */
  );
}
