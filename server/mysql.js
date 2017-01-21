const mysql = require('mysql');

/**
 * Returns a boolean of whether the passed-in mysql connection
 * info is valid or not
 */
async function verifyConnectionParameters(parameters) {

  return new Promise((resolve) => {

    const connection = mysql.createConnection(parameters);

    connection.connect((err) => {

      resolve(!err);

      connection.destroy();
    });
  });
}

module.exports = {
  verifyConnectionParameters,
};
