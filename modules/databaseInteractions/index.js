module.exports.executeSQLQuery = function(sql, params) {
    return new Promise(function (resolve, reject) {
        const query = connection.query(sql, params, (err, result) => {
            if (err) {
                return reject(err)
            } else {
                return resolve(result);
            }
        });
    })
}
