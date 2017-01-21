/* eslint-disable no-param-reassign */
const koaRouter = require('koa-router');

const router = koaRouter();

const mysql = require('./mysql');

/**
 * Returns a boolean with whether the given project object contains
 * all the fields necessary to facilitate a MySQL connection
 */
function verifyProjectFields(project) {

  if (!project ||
    !project.connection_info ||
    !project.connection_info.host ||
    !project.connection_info.user ||
    !project.connection_info.password ||
    !project.connection_info.database) {
    return false;
  }

  return true;
}

/**
 * This POST request takes in MySQL connection parameters, connects
 * to the MySQL server, and will validate that the parameters are correct
 */
router.post('/mysql/extract', async (ctx) => {

  const project = ctx.request.fields;

  if (!verifyProjectFields(project)) {

    ctx.body = 'Required parameters are missing';
    return;
  }

  ctx.body = await mysql.extractSchema(project);
});

/**
 * This POST request takes in MySQL connection parameters, connects
 * to the MySQL server, and will validate that the parameters are correct
 */
router.post('/mysql/testconnection', async (ctx) => {

  const project = ctx.request.fields;

  if (!verifyProjectFields(project)) {

    ctx.body = 'Required parameters are missing';
    return;
  }

  const valid = await mysql.verifyConnectionParameters(project);

  if (valid) {
    ctx.body = 'Connected';
  } else {
    ctx.body = 'Failed to connect';
  }
});

module.exports = router;
