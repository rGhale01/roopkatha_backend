const ResponseHelper = require('../../helpers/response_helper');
const OTPMail = require('../../mails/otp-mail');
const User = require("../../models/user");


module.exports = class ForgotPasswordController {
    static async request(req, res) {
        const { email } = req.body;

        let user = await User.findOne({ email });

        // check if user registered
        if (!user) {
            return ResponseHelper.validationResponse(res, {
                email: [
                    "Not registered!"
                ]
            });
        }

        // generate otp
        user.otp = Math.floor(Math.random() * 9000) + 1000;
        await user.save();

        // send otp
        if (user.email) {
            (new OTPMail({
                to: user.email
            }, {
                otp: user.otp,
                user
            })).send()
        }

        // return response
        return res.json({ message: "Verification OTP sent!" });
    }
};