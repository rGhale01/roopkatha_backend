// const User = require("../models/user");
// const crypto = require("crypto");
// const bcrypt = require("bcrypt");

// class MainHelper {
//     static async sendInvite(email, role = "student") {
//         const password = crypto.randomBytes(4).toString('hex');

//         if (await User.exists({ email })) {
//             return false;
//         }

//         const user = await User.create({
//             name: "New User",
//             email,
//             role,
//             isVerified: true,
//             password: await bcrypt.hash(password, parseInt(process.env.APP_KEY))
//         });

//         // Send email with password (Email sending functionality should be implemented separately)

//         return user;
//     }
// }

// module.exports = MainHelper;