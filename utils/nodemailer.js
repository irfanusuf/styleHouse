const nodemailer = require('nodemailer');


let transporter = nodemailer.createTransport({
    host: 'smtpout.secureserver.net', // GoDaddy SMTP server
    port: 465, // Port for SSL
    secure: true, // Use SSL
    auth: {
      user: 'services@stylehouse.world', 
      pass: 'Ester327811@' 
    }
  });



module.exports = {transporter}



