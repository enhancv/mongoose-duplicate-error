'use strict';

const assert = require('assert');
const database = require('./database');
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const plugin = require('../src');

describe('mongoose-duplicate-error', database([Customer], function () {

    it(`Should parse error`, function () {
        const errorMongo2 = 'E11000 duplicate key error index: mongoose-duplicate-error.customers.$username_1  dup key: { : "test" }';
        assert.equal(errorMongo2.match(plugin.PARSE_MONGO_2)[1], 'username_1');
        assert.equal(errorMongo2.match(plugin.PARSE_MONGO_2)[2], '"test"');

        const errorMongo3 = 'E11000 duplicate key error collection: mongoose-duplicate-error.customers index: username_1 dup key: { : "test" }';
        assert.equal(errorMongo3.match(plugin.PARSE_MONGO_3)[1], 'username_1');
        assert.equal(errorMongo3.match(plugin.PARSE_MONGO_3)[2], '"test"');
    });


    it('Should generate a validation error on simple unique constraint', function () {
        const customer1 = new Customer({ email: 'test1@example.com', username: 'test', other: 1 });
        const customer2 = new Customer({ email: 'test2@example.com', username: 'test', other: 2 });

        return customer1.save()
            .then(() => customer2.save())
            .catch(error => {
                assert(error instanceof mongoose.Error.ValidationError, error.toString());
                assert(error.errors.username instanceof mongoose.Error.ValidatorError, error.toString());
                assert.equal(error.message, 'Customer validation failed');
                assert.equal(error.errors.username.message, 'username is not correct value "test"');
                assert.equal(error.errors.username.kind, 'duplicate');
                assert.equal(error.errors.username.path, 'username');
                assert.equal(error.errors.username.value, '"test"');
            })
    });

    it('Should generate a validation error on compound unique constraint', function () {
        const customer1 = new Customer({ email: 'test1@example.com', deleted: true, username: 'one', other: 1 });
        const customer2 = new Customer({ email: 'test1@example.com', deleted: false, username: 'two', other: 2 });
        const customer3 = new Customer({ email: 'test1@example.com', deleted: true, username: 'three', other: 3 });

        return customer1.save()
            .then(() => customer2.save())
            .then(() => customer3.save())
            .catch(error => {
                assert(error instanceof mongoose.Error.ValidationError);
                assert(error.errors.email instanceof mongoose.Error.ValidatorError);
                assert.equal(error.message, 'Customer validation failed');
                assert.equal(error.errors.email.message, 'Duplicate email');
                assert.equal(error.errors.email.kind, 'duplicate');
                assert.equal(error.errors.email.path, 'email');
                assert.equal(error.errors.email.value, '"test1@example.com"');
            })
    });

    it('Should generate a generic error', function () {
        const customer1 = new Customer({ email: 'test1@example.com', deleted: true, username: 'one', other: 1 });
        const customer2 = new Customer({ email: 'test2@example.com', deleted: false, username: 'two', other: 1 });

        return customer1.save()
            .then(() => customer2.save())
            .catch(error => {
                assert(error instanceof mongoose.Error.ValidationError);
                assert(error.errors.other instanceof mongoose.Error.ValidatorError);
                assert.equal(error.message, 'Customer validation failed');
                assert.equal(error.errors.other.message, 'other must be unique');
                assert.equal(error.errors.other.kind, 'duplicate');
                assert.equal(error.errors.other.path, 'other');
                assert.equal(error.errors.other.value, 1);
            })
    });
}));
