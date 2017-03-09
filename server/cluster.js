/* eslint-disable indent, no-plusplus, camelcase */

function getTableIndex(list, table) {
    return list.findIndex(tbl => table.table_id === tbl.table_id);
}

function removeTable(list, table) {
    return list.splice(getTableIndex(list, table), 1);
}

// Only columns with primary keys are checked
function pk(R) {

    return R.columns.filter(col => col.attributes.indexOf('PK') !== -1);
}

// Return a list of column names from a list of column objects
function getNames(columns) {
    return columns.map(r => r.column_name);
}

function getNamesOfPKs(R) {
    return getNames(pk(R));
}

function orderAscPk(rels) {

    return rels.sort((a, b) => {

        if (a.columns.length > b.columns.length) {
            return 1;
        } else if (a.columns.length < b.columns.length) {
            return -1;
        }

        return 0;
    });
}

function steponetwo(entities) {

    // Pull only the entities that have at least 1 primary key
    const rels = entities.filter(rel => rel.columns.some(col => col.attributes.indexOf('PK') !== -1));

    const cluster = [];
    let disjoint = false;

    const ordered_rels = orderAscPk(rels);
    const remaining_rels = Array.from(ordered_rels);
    cluster.push([Object.assign({}, ordered_rels[0], { type: 'AE' })]);

    removeTable(remaining_rels, ordered_rels[0]);

    let nes = 1;

    for (let i = 1; i < ordered_rels.length; i++) {
        const R = ordered_rels[i];

        // Put together a list of each primary key in an abstract entity and remove duplicates
        const cPKNames = Array.from(
            new Set(cluster[nes - 1].map(getNamesOfPKs).reduce((prev, cur) => prev.concat(cur), [])) // eslint-disable-line comma-dangle, max-len
        );

        const rPKNames = getNames(pk(R));

        let equal = cPKNames.length === rPKNames.length;

        rPKNames.forEach((name) => {

            if (cPKNames.indexOf(name) === -1) {
                equal = false;
            }
        });

        if (equal === true) {

            cluster[nes - 1].push(R);
            removeTable(remaining_rels, R);

        } else {
            disjoint = true;

            for (let j = 0; j < nes; j++) {

                const setOne = new Set(getNames(pk(R)));
                const setTwo = new Set(...cluster[j].map(getNamesOfPKs));

                let intersection = new Set([...setOne].filter(x => setTwo.has(x)));

                intersection = Array.from(intersection);

                if (intersection.length > 0) {
                    disjoint = false;
                    break;
                }
            }

            if (disjoint === true) {
                nes = nes + 1; // eslint-disable-line operator-assignment
                cluster.push([Object.assign({}, R, { type: 'AE' })]);
                removeTable(remaining_rels, R);
            }
        }
    }

    return [remaining_rels, cluster];
}

function stepthree(remaining_rels, AE) {

    // This list will be mutated during the iteration and will be the part of the final return
    const relations = Array.from(remaining_rels);

    for (let k = 0; k < remaining_rels.length; k++) {

        let i = 0;
        let clustered = false;
        while (i < AE.length && !clustered) {

            const setOne = new Set(getNames(pk(remaining_rels[k])));
            const setTwo = new Set(...AE[i].map(getNamesOfPKs));

            let intersection = new Set([...setOne].filter(x => setTwo.has(x)));

            intersection = Array.from(intersection);

            if (intersection.length > 0) {
                let testBool = false;

                for (let j = 0; j < AE.length; j++) {

                    if (j === i) {
                        continue; // eslint-disable-line no-continue
                    }

                    const setTest = new Set(...AE[j].map(getNamesOfPKs));
                    let intersectionTest = new Set([...setOne].filter(x => setTest.has(x)));
                    intersectionTest = Array.from(intersectionTest);

                    if (intersectionTest.length > 0) {

                        testBool = true;
                        break;
                    }
                }

                if (testBool === false) {
                    AE[i].push(remaining_rels[k]);
                    clustered = true;
                    removeTable(relations, remaining_rels[k]);
                }
            }

            i += 1;
        }
    }

    return [relations, AE];
}

function stepfour(remaining_rels, AE) {

    const argument = Array(AE.length);

    for (let k = 0; k < AE.length; k++) {
        argument[k] = Array(AE.length);
    }

    for (let i = 0; i < AE.length; i++) {
        for (let j = 0; j < AE.length; j++) {

            const setOne = new Set(...AE[i].map(getNamesOfPKs));
            const setTwo = new Set(...AE[j].map(getNamesOfPKs));

            let intersection = new Set([...setOne].filter(x => setTwo.has(x)));

            intersection = Array.from(intersection);

            if (intersection.length > 0) {
                argument[i][j] = true;
            } else {
                argument[i][j] = false;
            }
        }
    }

    const intersects = [];
    let nas = AE.length;
    let first_relationship = true;

    for (let l = 0; l < remaining_rels.length; l++) {
        for (let m = 0; m < AE.length; m++) {

            const setOne = new Set(getNames(pk(remaining_rels[l])));
            const setTwo = new Set(...AE[m].map(getNamesOfPKs));

            let intersection = new Set([...setOne].filter(x => setTwo.has(x)));

            intersection = Array.from(intersection);

            if (intersection > 0) {
                intersects[m] = true;
            } else {
                intersects[m] = false;
            }
        }

        if (first_relationship) {
            for (let n = 0; n < AE.length; n++) {
                argument[1][n] = intersects[n];
            }

            AE.push([Object.assign({}, remaining_rels[l], { type: 'AR' })]);
            first_relationship = false;
        } else {
            let j = 0;
            let found = false;

            while (j < nas && !found) {

                for (let i = 0; i < AE.length; i++) {
                    if (intersects[i] === argument[j][i]) {

                        AE[nas].push(remaining_rels[l]);

                        found = true;
                        break;
                    }
                }

                j += 1;
            }

            if (!found) {
                nas += 1;

                for (let i = 0; i < AE.length; i++) {
                    argument[nas - AE.length][i] = intersects[i];
                }

                AE[nas - 1].push(remaining_rels[l]);
            }
        }
    }

    return [nas, AE];
}

function clusterEntities(entities) {

    let output = steponetwo(entities);

    output = stepthree(output[0], output[1]);
    output = stepfour(output[0], output[1]);

    return output;
}

module.exports = clusterEntities;
