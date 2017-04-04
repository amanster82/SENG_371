/* eslint-disable no-cond-assign, no-restricted-syntax,
   no-continue, no-param-reassign, no-console */

const glob = require('glob');
const fs = require('fs');

function parseJavaFile(data) {

  const values = {
    relations: [],
  };

  const ExtractString = /"(.+)"/;
  const EntityMatcher = /@Entity[\s]*(@.*\(.*\)[\s]*)+[^{]+{[\w\d\s\W\D\S]+}/mg;

  let tableMatch;
  let tableName = 'unnamed_table';

  // Find entity blocks
  while ((tableMatch = EntityMatcher.exec(data)) !== null) {

    const AnnotationMatcher = /@.+[\s]+[^;]+;/mg;
    let annoMatch;

    // Find annotation and field groups
    while ((annoMatch = AnnotationMatcher.exec(tableMatch[0])) !== null) {

      // Disect the components of the annotations
      const AnnotationDescriber = /(@(.+)\((.+)\))/mg;
      const FieldMatcher = /\)[\s]+(.+);/mg;

      const field = FieldMatcher.exec(annoMatch[0]);
      let referencedTableName = null;

      if (field && field[1]) {

        const referencedClass = field[1].match(/.+ (.+\.)*(.+) (.+)/);

        if (!referencedClass || referencedClass.length < 3) {
          continue;
        }

        referencedTableName = referencedClass[3];
      }

      let annoInner;

      while ((annoInner = AnnotationDescriber.exec(annoMatch[0])) !== null) {

        const type = annoInner[2];
        const inner = annoInner[3];

        if (type === 'Table') {

          tableName = inner.match(ExtractString)[1] || 'unnamed_table';
        } else if (type === 'JoinColumn') {

          const RipAnnotation = /([\w]+)="([\w]+)"/mg;
          const keys = {};

          let key;

          while ((key = RipAnnotation.exec(inner)) !== null) {

            keys[key[1]] = key[2];
          }

          values.relations.push({
            table_name: tableName,
            referenced_table_name: referencedTableName,
            type: 'FK',
            constraint_name: keys.name,
            referenced_column_name: keys.referencedColumnName || keys.name,
            column_name: keys.name,
          });
        }
      }
    }
  }

  values.table_name = tableName;

  return values;
}

function parseCode(directory, schema) {

  return new Promise((resolve) => {
    glob(`${directory}/**/*.java`, (err, files) => {

      files.forEach((file) => {
        try {
          const data = fs.readFileSync(file);

          for (const relation of parseJavaFile(data).relations) {

            for (const table of schema.tables) {

              if (relation.table_name === table.table_name) {

                const columnIdx = table.columns.findIndex(col =>
                  col.column_name === relation.column_name);

                if (columnIdx === -1) {
                  table.columns.push({
                    column_id: table.columns.length,
                    coiumn_name: relation.column_name,
                    type: 'int',
                    attributes: ['FK'],
                  });

                  schema.stats.column_count += 1;
                } else {
                  table.columns[columnIdx].attributes.push('FK');
                }

                const relationIdx = table.relationships.findIndex(rel =>
                  rel.column_name === relation.column_name);

                if (relationIdx === -1) {
                  table.relationships.push({
                    table_name: relation.table_name,
                    column_name: relation.column_name,
                    type: 'FK',
                    constraint_name: relation.constraint_name,
                    referenced_table_name: relation.referenced_table_name,
                    referenced_column_name: relation.referenced_column_name,
                  });

                  console.log('adding');
                  console.log(relation.referenced_table_name);

                  schema.stats.relationship_count += 1;
                }

                console.log(table.relationships);
              }
            }
          }

        } catch (ferr) {
          console.error(ferr);
        }
      });

      resolve();
    });

  });
}

module.exports = {
  parseCode,
};
