/* eslint-disable no-console, no-shadow */
const Koa = require('koa');
const mount = require('koa-mount');
const serveSstatic = require('koa-static');
const path = require('path');

const httpServer = new Koa();
const port = process.env.PORT || 3000;

httpServer.use(mount('/', serveSstatic(path.join(__dirname, '../public'))));

httpServer.listen(port, () => console.log(`HTTP server is listening on port ${port}`));
