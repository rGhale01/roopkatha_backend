const Mail = require('./mail.cjs');

module.exports = class OTPMail extends Mail {
    /**
     * Change your options here
     * * this.subject
     * * this.html
     * * this.other
     */
    prepare() {
        const artistName = this.other.artist && this.other.artist.name ? this.other.artist.name : 'Artist';
        const otp = this.other.otp ? this.other.otp : 'undefined';

        console.log('Artist Name:', artistName);  // Debug log for artist name
        console.log('OTP:', otp);  // Debug log for OTP

        this.subject = "Your OTP for roopkatha is " + otp;
        this.html = `
        <p>Hi ${artistName},</p>
        <p>Please use <b>${otp}</b> as your <b>OTP</b>.</p>
        `;
    }
}