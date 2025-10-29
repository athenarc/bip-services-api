module.exports.executeSQLQuery = function(sql, params) {
    console.log(sql, params);
    return new Promise(function (resolve, reject) {
        connection.query(sql, params, (err, result) => {
            if (err) {
                return reject(err)
            } else {
                return resolve(result);
            }
        });
    })
}
