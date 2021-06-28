const helper = require('../helper.js');
const sgMail = require('@sendgrid/mail')
//const generateTemporaryUserPassword = require('./generateTemporaryUserPassword')
//sgMail.setApiKey(sendgridAPIKey)

class MailDao {

    constructor(dbConnection) {
        this._conn = dbConnection;
    }

    getConnection() {
        return this._conn;
    }
	/*
	sendGeneralEmail(name, email, message){
		const msg = {
			to: 'animexx.contact@gmail.com',
			from: 'animexx.contact@gmail.com',
			subject: 'Anfrage: Allgemein',
			text: `Absender E-Mail: ${email}\n${message}`
		};
		sgMail
		  .send(msg)
		  .then(() => {}, error => {
			console.error(error);

			if (error.response) {
			  console.error(error.response.body)
			}
		  });
	}

	sendLostItemsEmail(name, email, message){
		const msg = {
			to: 'animexx.contact@gmail.com',
			from: 'animexx.contact@gmail.com',
			subject: 'Anfrage: Allgemein',
			text: `${message}\n Absender E-Mail: ${email}`
		};
		sgMail
		  .send(msg)
		  .then(() => {}, error => {
			console.error(error);

			if (error.response) {
			  console.error(error.response.body)
			}
		  });
	}

	forgotPassword(email, password, newPW){
		var sql = 'SELECT Email AS cnt FROM User WHERE Email=?';
        var statement = this._conn.prepare(sql);
        var result = statement.get(email);
		
		if (result) {
			var sql = 'UPDATE User SET Password=? WHERE Email=?';
			var statement = this._conn.prepare(sql);
			var result = statement.run(password, email);
			const msg = {
				to: email,
				from: 'animexx.contact@gmail.com',
				subject: 'Passwort vergessen',
				text: 'Ihr neues Passwort lautet: ' + newPW
			};
			sgMail
			  .send(msg)
			  .then(() => {}, error => {
				console.error(error);

				if (error.response) {
				  console.error(error.response.body)
				}
			  });
		}
		
		return result;
	}
	*/
}

module.exports = MailDao;
