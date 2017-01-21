/* eslint-disable no-console, no-shadow */
const Koa = require('koa');
const mount = require('koa-mount');
const serveSstatic = require('koa-static');
const body = require('koa-better-body');
const path = require('path');

const httpServer = new Koa();
const port = process.env.PORT || 3000;

const api = require('./api');

httpServer.use(body());
httpServer.use(mount('/', serveSstatic(path.join(__dirname, '../public'))));

httpServer.use(api.routes());
httpServer.use(api.allowedMethods());

httpServer.listen(port, () => console.log(`HTTP server is listening on port ${port}`));
