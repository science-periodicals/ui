import path from 'path';
import http from 'http';
import {
  createExpressLoggerMiddleware,
  createExpressErrorLoggerMiddleware
} from '@scipe/express-logger';
import express from 'express';
import resources from '@scipe/resources';
import ontologist from '@scipe/ontologist';
import { api, assets, createProxy } from '@scipe/api';

import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackConfig from '../webpack.config';

const compiler = webpack(webpackConfig);

const host = process.env.HOST || '127.0.0.1';
const port = 3030;
const config = {
  acl: false,
  log: {
    name: 'ui',
    level: 'trace'
  },
  fsBlobStoreRoot:
    process.env.FS_BLOB_STORE_ROOT || path.resolve(__dirname, '../blobs')
};

const proxy = createProxy(config);
const app = express();

app.use(
  webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath
  })
);
app.use(webpackHotMiddleware(compiler));
app.use(`/${process.env.DB_NAME || 'scienceai'}__${config.dbVersion}__`, proxy);
app.use(resources());
app.use(express.static(__dirname));
app.use(assets());

app.use(createExpressLoggerMiddleware(config));

app.use(ontologist(config));
app.use(api(config));
app.get('*', (req, res) => {
  res.type('html').send(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>science.ai UI</title>
    <script src="/ui-bundle.main.js"></script>
  </head>
  <body>
    <main id="app">
    </main>
  </body>
</html>`);
});

app.use(createExpressErrorLoggerMiddleware(config));

let server = http.createServer(app);
server.listen(port, () => {
  console.warn('Server running on port ' + port + ' (' + host + ')');
});
