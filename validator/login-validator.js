import Validator from './validator.js';

class LoginValidator extends Validator {
    constructor(data = {}, rules = {}, messages = {}) {
        /**
         * Define your rules here
         */
        rules = {
            identifier: "string|required", // Can hold either email or phoneNo
            password: "string|required",
            fcmToken: "string", // Optional field
        };

        /**
         * Define custom error messages here
         */
        messages = {
            "identifier.required": "The identifier field is required.",
            "password.required": "Password is required.",
        };

        super(data, rules, messages);
    }

    /**
     * Static function that validates an incoming request as a middleware
     * 
     * @param {express.Request} req 
     * @param {express.Response} res 
     * @param {express.Next} next 
     */
    static middleware(req, res, next) {
        const validator = new LoginValidator(req.body);

        console.log('Validation input:', req.body); // Debug the incoming data
        console.log('Validation errors:', validator.errors()); // Debug validation errors, if any
        console.log('Validated data:', validator.validated); // Debug validated data

        // Check if data is valid
        if (validator.fails()) {
            // Log validation failure
            console.warn('Validation failed:', validator.errors());
            // Return error in case data is invalid
            return res.status(422).json(validator.errors());
        } else {
            // Set validated values on req.body
            req.body = { ...validator.validated };
            // Continue with next middleware
            next();
        }
    }
}

export default LoginValidator;