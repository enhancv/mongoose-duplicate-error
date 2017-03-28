Mongoose Duplicate Errors
=========================

Custom error messages for the mongodb duplicate error
[![Build Status](https://travis-ci.org/enhancv/mongoose-duplicate-error.svg?branch=master)](https://travis-ci.org/enhancv/mongoose-duplicate-error)
[![Code Climate](https://codeclimate.com/github/enhancv/mongoose-duplicate-error/badges/gpa.svg)](https://codeclimate.com/github/enhancv/mongoose-duplicate-error)
[![Test Coverage](https://codeclimate.com/github/enhancv/mongoose-duplicate-error/badges/coverage.svg)](https://codeclimate.com/github/enhancv/mongoose-duplicate-error/coverage)

Installation
------------

```bash
yarn add mongoose-duplicate-error
```

Usage
-----

Just add it to a model and it will prettify the unique errors by default, by transforming the
`E11000 duplicate key error collection...` error into a  `other must be unique` validation error.

```javascript
const Schema = require('mongoose').Schema;
const mongooseDuplicateError = require('mongoose-duplicate-error');

const CustomerSchema = new Schema({
    username: {
        type: String,
        unique: true,
    },
    email: {
        type: String,
        unique: true,
    },
});

CustomerSchema.plugin(mongooseDuplicateError);
```

It will also work for compound indexes, by generating an error for the first index in the group

```javascript
const Schema = require('mongoose').Schema;
const mongooseDuplicateError = require('mongoose-duplicate-error');

const CustomerSchema = new Schema({
    email: {
        required: true,
        type: String,
    },
    deleted: Boolean,
});

CustomerSchema.index({ email: 1, deleted: 1 }, { unique: true });
CustomerSchema.plugin(mongooseDuplicateError);
```

You can further custumize the error messages for any unique index. By providing a "path" and message template you can specify exactly which field will recieve an error, and with what text.

```javascript
const Schema = require('mongoose').Schema;
const mongooseDuplicateError = require('mongoose-duplicate-error');

const CustomerSchema = new Schema({
    email: {
        required: true,
        type: String,
    },
    deleted: Boolean,
});

CustomerSchema.index({ email: 1, deleted: 1 }, { unique: true });
CustomerSchema.plugin(mongooseDuplicateError, {
    indexes: {
        email_1_deleted_1: { path: 'email', message: 'The {PATH} must be unique ({VALUE})' },
    },
}});
```
