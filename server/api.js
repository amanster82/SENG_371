/* eslint-disable no-param-reassign */
const koaRouter = require('koa-router');

const router = koaRouter();
const fs = require('fs');

const mysql = require('./mysql');
const parser = require('./parseCode');

/**
 * Returns a boolean with whether the given project object contains
 * all the fields necessary to facilitate a MySQL connection
 */
function dirExists(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (err) {
    return false;
  }
}

function verifyProjectFields(project) {

  if (!project ||
    !project.connection_info ||
    !project.connection_info.host ||
    !project.connection_info.user ||
    !project.connection_info.password ||
    !project.connection_info.database) {
    return false;
  }
  if (project.source_directory) {
    if (!dirExists(project.source_directory)) {
      return false;
    }
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

    ctx.body = { error: 'Project connection parameters are missing or invalid', success: false };
    return;
  }

  const schema = await mysql.extractSchema(project);

  await parser.parseCode(project.source_directory, schema);

  ctx.body = schema;
});

/**
 * This POST request takes in MySQL connection parameters, connects
 * to the MySQL server, and will validate that the parameters are correct
 */
router.post('/mysql/testconnection', async (ctx) => {

  const project = ctx.request.fields;

  if (!verifyProjectFields(project)) {

    ctx.body = { error: 'Project connection parameters are missing or invalid', success: false };
    return;
  }

  const valid = await mysql.verifyConnectionParameters(project);

  if (valid) {
    ctx.body = { status: 'Connected', success: true };
  } else {
    ctx.body = { error: 'Failed to connect', success: false };
  }
});

module.exports = router;
