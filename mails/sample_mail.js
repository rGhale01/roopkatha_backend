const Mail = require('./mail.cjs');

module.exports = class SampleMail extends Mail {

    /**
     * Change your options here
     * * this.subject
     * * this.html
     * * this.other
     */
    prepare() {
        //
    }
}