import Validator from './validator.js';

class KYCValidator extends Validator {
    constructor(data = {}, rules = {}, messages = {}) {
        rules = {
            citizenship: "required",
            pan: "required",
        };
        super(data, rules, messages);
    }

    static middleware(req, res, next) {
        const validator = new KYCValidator(req.files);
        if (validator.fails()) {
            return res.status(422).json(validator.errors());
        } else {
            req.body = { ...validator.validated };
            next();
        }
    }
}

export default KYCValidator;