import Validator from './validator.js';

class RegisterValidator extends Validator {
    constructor(data = {}, rules = {}, messages = {}) {
        /**
         * Define your rules here
         */
        rules = {
            name: "string|required", // Name is required and must be a string
            email: "email|required", // Email is required and must be a valid email
            password: "string|required|min:8", // Password is required and must be at least 8 characters
            confirmPassword: "string|required|same:password", // Confirm password is required and must match password
            phoneNo: "string|required|regex:/^\\d{10}$/", // Phone number is required and must be exactly 10 digits
            DOB: {
                required: true,
                validate: {
                    validator: (value) => {
                        const date = new Date(value);
                        return !isNaN(date) && date < new Date(); // Ensure valid date and is in the past
                    },
                    message: "Date of Birth must be a valid date before today.",
                },
            }, // Custom validation for DOB
            gender: "string|required|in:Male,Female", // Gender is required and must be either Male or Female
        };

        /**
         * Define custom error messages here
         */
        messages = {
            "name.required": "Name is required.",
            "email.required": "Email is required.",
            "email.email": "Please provide a valid email address.",
            "password.required": "Password is required.",
            "password.min": "Password must be at least 8 characters long.",
            "confirmPassword.required": "Confirm password is required.",
            "confirmPassword.same": "Confirm password must match the password.",
            "phoneNo.required": "Phone number is required.",
            "phoneNo.regex": "Phone number must be exactly 10 digits.",
            "DOB.required": "Date of Birth is required.",
            "DOB.before": "Date of Birth must be a valid date before today.",
            "gender.required": "Gender is required.",
            "gender.in": "Gender must be either Male or Female.",
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
        const validator = new RegisterValidator(req.body);

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

export default RegisterValidator;