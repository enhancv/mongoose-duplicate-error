const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongooseDuplicateError = require('../../src');

const CustomerSchema = new Schema({
    ipAddress: String,
    username: {
        type: String,
        unique: true,
    },
    email: {
        required: true,
        type: String,
    },
    phone: String,
    other: {
        type: Number,
        unique: true,
    },
    deleted: Boolean,
});

CustomerSchema.index({ email: 1, deleted: 1 }, { unique: true });

CustomerSchema.plugin(mongooseDuplicateError, { indexes: {
    username_1: { path: 'username', message: '{PATH} is not correct value {VALUE}' },
    email_1_deleted_1: { path: 'email', message: 'Duplicate email' },
}});

const Customer = mongoose.model('Customer', CustomerSchema);

module.exports = Customer;
