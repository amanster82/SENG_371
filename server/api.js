const koaRouter = require('koa-router');

const router = koaRouter();

const mysql = require('./mysql');

/**
 * This POST request takes in MySQL connection parameters, connects
 * to the MySQL server, and will validate that the parameters are correct
 */
router.post('/mysql/testconnection', async (ctx) => {

  if (!ctx.request.fields ||
    !ctx.request.fields.host ||
    !ctx.request.fields.user ||
    !ctx.request.fields.password) {

    ctx.body = 'Required parameters are missing'; // eslint-disable-line no-param-reassign
    return;
  }

  const valid = await mysql.verifyConnectionParameters(ctx.request.fields);

  if (valid) {
    ctx.body = 'Connected'; // eslint-disable-line no-param-reassign
  } else {
    ctx.body = 'Failed to connect'; // eslint-disable-line no-param-reassign
  }
});

module.exports = router;
