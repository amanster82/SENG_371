/* eslint-disable camelcase, no-restricted-syntax */
const mysql = require('mysql');

/**
 * Will perform a MySQL connection for the given project and connection info
 * If the connection fails, an error object will be returned. If succesful, the connection
 * object is returned. The sucessful connection must be destroyed after it is no longer needed
 */
async function getConnection(project) {

  return new Promise((resolve, reject) => {

    const connection = mysql.createConnection(project.connection_info);

    connection.connect((err) => {

      if (err) {
        connection.destroy();
        reject(err);
      } else {
        resolve(connection);
      }
    });
  });
}

/**
 * Returns a boolean of whether the passed-in mysql connection
 * info is valid or not
 */
async function verifyConnectionParameters(project) {

  let connection = null;

  try {
    connection = await getConnection(project);
  } catch (err) {
    return false;
  }

  if (connection) {
    connection.destroy();
  }

  return true;
}

/**
 * Utility that will return a promise which will resolve or reject depending
 * on the callback result from a SQL query using the provided connection and
 * query string
 */
async function promisifyQuery(connection, query) {

  return new Promise((resolve, reject) => {

    connection.query(query, (err, results, fields) => {

      if (err) {
        reject(err);
      } else {
        resolve({ results, fields });
      }
    });
  });
}

/**
 * This function will perform database analysis and
 * return an object which follows the documented schema json structure
 * For data structure see: http://jira.seng.uvic.ca:8060/display/NEX/Data+Structures
 */
async function extractSchema(project) {

  let connection = null;

  try {
    connection = await getConnection(project);
  } catch (err) {
    return {
      error: err,
    };
  }

  const tables = [];
  const stats = {
    table_count: 0,
    column_count: 0,
    relationship_count: 0,
  };

  const table_query = await promisifyQuery(connection, 'show tables');

  const table_field_name = table_query.fields[0].name;

  for (const row of table_query.results) {

    const table_name = row[table_field_name];
    const columns = [];
    const relationships = [];

    /** 
     * Given a table name, we request a data structure that represents
     * all of the columns in the table
     */
    const column_query = await promisifyQuery(connection, `show columns from ${table_name}`); // eslint-disable-line no-await-in-loop

    for (const col of column_query.results) {

      const attributes = [];

      if (col.Key === 'PRI') {
        attributes.push('PK');
      }

      columns.push({
        column_id: columns.length,
        column_name: col.Field,
        type: col.Type,
        attributes,
      });

      stats.column_count += 1;
    }

    // Here we query the information_schema table for constraints given the table name
    const relation_query = await promisifyQuery(connection, // eslint-disable-line no-await-in-loop
      `select table_name, column_name, constraint_name, referenced_table_name,
      referenced_column_name from information_schema.key_column_usage where
      referenced_table_schema = '${project.connection_info.database}' 
      and referenced_table_name = '${table_name}'`);

    for (const relation of relation_query.results) {

      relation.type = 'FK';

      relationships.push(relation);

      stats.relationship_count += 1;
    }

    tables.push({
      table_id: tables.length,
      table_name,
      columns,
      relationships,
    });

    stats.table_count += 1;
  }

  // Connection must be destroyed as per the specification of the getConnection() function
  connection.destroy();

  // Concatenate the original project information with the new tables & stats
  return { project, tables, stats };
}

module.exports = {
  verifyConnectionParameters,
  extractSchema,
};
