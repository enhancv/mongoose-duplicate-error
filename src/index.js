/* eslint object-shorthand: "off" */

const mongoose = require('mongoose');

const PARSE_MONGO_2 = /index: [^.]*\.[^.]*\.\$([^ $]*)  dup key: { : ([^:},]*),? /;
const PARSE_MONGO_3 = /index: ([^ $]*) dup key: { : ([^:},]*),? /;

function MongooseDuplicateError(schema, options) {
    function mongodbErrorHandler(err, doc, next) {
        if (err.name !== 'MongoError' || err.code !== 11000) {
            return next(err);
        }

        const parts = err.message.match(PARSE_MONGO_2) || err.message.match(PARSE_MONGO_3);
        const indexName = (parts && parts[1]) || '';
        const value = (parts && parts[2]) || '';

        let path = indexName.substr(0, indexName.indexOf('_'));
        let message = '{PATH} must be unique';

        if (options.indexes[indexName]) {
            path = options.indexes[indexName].path || options.indexes[indexName][0] || path;
            message = options.indexes[indexName].message
                || options.indexes[indexName][1]
                || message;
        }

        const validationError = new mongoose.Error.ValidationError(doc);

        validationError.errors[path] = new mongoose.Error.ValidatorError({
            type: 'duplicate',
            value: value,
            path: path,
            message: message.replace('{PATH}', path).replace('{VALUE}', value),
            reason: err.message,
        });

        return next(validationError);
    }

    schema.post('save', mongodbErrorHandler);
    schema.post('update', mongodbErrorHandler);
    schema.post('findOneAndUpdate', mongodbErrorHandler);
    schema.post('insertMany', mongodbErrorHandler);
}

MongooseDuplicateError.PARSE_MONGO_2 = PARSE_MONGO_2;
MongooseDuplicateError.PARSE_MONGO_3 = PARSE_MONGO_3;

module.exports = MongooseDuplicateError;
