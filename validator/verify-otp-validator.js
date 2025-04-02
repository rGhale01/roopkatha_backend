import Validator from './validator.js';

class VerifyOTPValidator extends Validator {

    constructor(data = {}, rules = {}, messages = {}) {
        /**
         * Define your rules here
         */
        rules = {
            email: "email|required",
            otp: "string|required|digit:4",  // Ensure OTP is treated as a string
        };

        super(data, rules, messages);
    }

    /**
     * 
     * Static function that validates an incoming request as a middleware
     * 
     * @param {express.Request} req 
     * @param {express.Response} res 
     * @param {express.Next} next 
     */
    static middleware(req, res, next) {
        const validator = new VerifyOTPValidator(req.body);
        // check if data is valid
        if (validator.fails()) {
            // return error in case data invalid
            return res.status(422).json(validator.errors());
        } else {
            // set validated values a req.body
            req.body = { ...validator.validated };
            // continue with next middleware
            next();
        }
    }

}

export default VerifyOTPValidator;