/* eslint object-shorthand: "off" */

const mongoose = require('mongoose');
const getOr = require('lodash/fp/getOr');

const PARSE_MONGO_2 = /index: [^.]*\.[^.]*\.\$([^ $]*) {2}dup key: { : ([^:},]*),? /;
const PARSE_MONGO_3 = /index: ([^ $]*) dup key: { : ([^:},]*),? /;

function MongooseDuplicateError(schema, options) {
    function mongodbErrorHandler(err, doc, next) {
        if (err.name !== 'MongoError' || err.code !== 11000) {
            return next(err);
        }

        const parts = err.message.match(PARSE_MONGO_2) || err.message.match(PARSE_MONGO_3);
        const indexName = getOr('', '[1]', parts);
        const value = getOr('', '[2]', parts);

        const path = getOr(
            indexName.substr(0, indexName.indexOf('_')),
            `indexes[${indexName}].path`,
            options
        );

        const message = getOr(
            '{PATH} must be unique',
            `indexes[${indexName}].message`,
            options
        );

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
