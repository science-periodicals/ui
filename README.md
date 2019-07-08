# `@scipe/ui`

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

[sci.pe](https://sci.pe) UI components.

Note: this module is auto published to npm on CircleCI. Only run `npm version
patch|minor|major` and let CI do the rest.

## Style guide

Use `prettier --single-quote` (or `npm run format`) and:
- `const` over `let` or `var` whenever possible

## Semantic of `readOnly` and `disabled`

- `disabled`: all controls (delete icon, input etc.) visible _but_ disabled
- `readOnly`: do not render any controls

## Imports

### Components

```js
import { <Component> } from '@scipe/ui';
```

and see PropTypes.

### CSS

```css
/* First import resources */
@import '@scipe/resources';
@import '@scipe/ui';
```

### Utils

`@scipe/ui` ships with a serires of utility functions to work with graphs:

- `getResourceInfo(graph[, nodeMap])`
- `getParentResource(resourceId, resourceIds[, nodeMap])`
- `getPotentialDependencies(resourceId, resourceIds, resourceMap)`
- `getRequirements(resourceId[, nodeMap])`
- `getDependents(resourceId, resourceIds, nodeMap)`
- `getResourceTree(resourceId, nodeMap)`
- `getResourceParts(node)`
- `forEachResource(resourceTree, callback, ctx)`
- `findResource(resourceId, resourceTree)`
- `getIconNameFromSchema(object[, fallbackIconName])`
- ...

## Development

Examples are available in the `example/` directory.

**Be sure that redis is running and that your env variable points to a Cloudant instance.**

```sh
npm install
npm run init # Note: if you have your DB already setup, use npm run reset (will delete _users) or npm run seed instead (might conflict if you have users)
npm start
```

### Visual regression tests

#### on CI

Be sure `CIRCLE_TOKEN` is set in your `.profile`.

Visual regression tests are run on CircleCI on each commit (to any branch).
To download the result of the test run:

```sh
npm run backstop:download # -- <build_num> can be specified (default to `latest`)
npm run backstop:open # this will open a browser
```

After reviewing the tests,

```sh
npm run backstop:approve # use `-- --filter <filename>` to only approve specific images
```
can be run to selectively approve the new screenshots (next references)


To prevent the testing from being performed on commit, add `[ci skip]` to the end of the commit message.

#### locally

To run the test locally:

```sh
npm start
```

Then:

```sh
npm run backstop:test
```

Note:

```sh
npm run backstop:kill
```

kills chrome zombies


#### data-test attributes


- `data-testid="id"`: use to target a specific component during testing

- `data-test-ready="true"`: use to signal that the screen is ready for
  screenshot (typically used at the top level).

- `data-test-now="true"`: use to signal that an element renders data sensitive
  to the value of the current time (break tests). This includes dates and times.

- `data-test-progress="true"`: use to signal that an element contains progress
  animation (break tests). This includes spinners.


## Patterns

### Reporting errors

#### inline within form controls

<PaperInput error={err} />

#### End of a "form"

<ControlPanel error={err} />

#### global (snack bar)

TODO


## License

`@scipe/ui` is dual-licensed under commercial and open source licenses
([AGPLv3](https://www.gnu.org/licenses/agpl-3.0.en.html)) based on the intended
use case. Contact us to learn which license applies to your use case.
