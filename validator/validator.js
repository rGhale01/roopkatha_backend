"use strict";

import Mongoose from "mongoose";
import ValidatorJS from "validatorjs";

// Register a rule for MongoDB ObjectId validation
ValidatorJS.register('mongoid', function (value) {
    return Mongoose.Types.ObjectId.isValid(value);
}, 'The :attribute is not a valid id');

// Register a rule for digit length validation
ValidatorJS.register(
    'digit',
    function (value, requirement) {
        if (typeof value !== 'string' && typeof value !== 'number') {
            return false;
        }
        const digit = parseInt(requirement, 10);
        if (isNaN(digit)) {
            return false;
        }
        return value.toString().trim().length === digit;
    },
    'The :attribute is not :digit digits.',
    function (_template, rule, _getAttributeName) {
        const parameters = rule.getParameters();
        return {
            digit: parameters[0] || 'undefined'
        };
    }
);

// Register a custom rule for "before:now" validation
ValidatorJS.register(
    'before:now',
    function (value) {
        const now = new Date();
        const date = new Date(value);
        return date < now;
    },
    'The :attribute must be a date before today.'
);

/**
 * Create Base Validator, Do not touch
 */
class Validator {
    /**
     * Constructor
     * @param {*} req 
     */
    constructor(data = {}, rules = {}, messages = {}) {
        try {
            /**
             * Rules
             */
            this.rules = rules;

            /**
             * Error Messages
             */
            this.messages = messages;

            /**
             * Validated fields' object
             */
            this.validated = {};

            /**
             * Object to be validated
             */
            this.data = data;

            /**
             * Validator
             */
            this.validator = new ValidatorJS(this.data, this.rules, this.messages);

            /**
             * Validate all the fields
             */
            this.getValidated();
        } catch (error) {
            console.error('Validation initialization error:', error);
            throw new Error('Invalid validation setup');
        }
    }

    static make(data = {}, rules = {}, messages = {}) {
        return new Validator(data, rules, messages);
    }

    /**
     * Check if the validator fails
     */
    fails() {
        return this.validator.fails();
    }

    /**
     * Check if the validator passes
     */
    passes() {
        return this.validator.passes();
    }

    errors() {
        return this.validator.errors;
    }

    /**
     * Get only the validated content
     */
    getValidated(getNull = false) {
        for (const rule in this.rules) {
            if (this.data[rule] === undefined) {
                if (getNull) {
                    this.validated[rule] = null;
                }
            } else {
                this.validated[rule] = this.data[rule];
            }
        }
        return this.validated; // Return the validated data
    }
}

export default Validator;