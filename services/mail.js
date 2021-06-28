const express = require('express');
const helper = require('../helper.js');
const MailDao = require('../dao/mailDao.js');
const bcrypt = require('bcrypt');
const crypto = require("crypto");
var serviceRouter = express.Router();

helper.log('- Service User');

function stringToHash(string) {
	var hash = 0;
	if (string.length == 0) return hash;
	for (i = 0; i < string.length; i++) {
		char = string.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash;
	}
	return hash;
}

serviceRouter.post('/contact/', function(request, response, next) {
    helper.log('Service User: Client requested sending of mail');
	
	var errorMsgs=[];
    if (helper.isUndefined(request.body.name)) 
        errorMsgs.push('name missing');
	if (helper.isUndefined(request.body.email)) 
        errorMsgs.push('name missing');
	if (helper.isUndefined(request.body.message)) 
        errorMsgs.push('message missing');
	
	if (errorMsgs.length > 0) {
        helper.log('Service User: check not possible, data missing');
        response.status(400).json(helper.jsonMsgError('Check not possible. Missing data: ' + helper.concatArray(errorMsgs)));
        return;
    }

	const mailDao = new MailDao(request.app.locals.dbConnection);
    try {
		if (request.body.subject=='General') {
			var result = mailDao.sendGeneralEmail(request.body.name,request.body.email,request.body.message);
			response.status(200).json(helper.jsonMsgOK());
		}
		else {
			var result = mailDao.sendLostItemsEmail(request.body.name,request.body.email,request.body.message);
			response.status(200).json(helper.jsonMsgOK());
		}
    } catch (ex) {
        next(ex);
    }
});

serviceRouter.post('/forgotPassword/', async(request, response, next) => {
    helper.log('Service User: Client requested sending reset password');
	
	var errorMsgs=[];
    if (helper.isUndefined(request.body.email)) 
        errorMsgs.push('email missing');
	
	if (errorMsgs.length > 0) {
        helper.log('Service User: check not possible, data missing');
        response.status(400).json(helper.jsonMsgError('Check not possible. Missing data: ' + helper.concatArray(errorMsgs)));
        return;
    }
	
	const mailDao = new MailDao(request.app.locals.dbConnection);
    try {
		var newPW = await crypto.randomBytes(10).toString('hex');
		var newHashedPW = await stringToHash(newPW).toString();
		var hashedPassword = await bcrypt.hash(newHashedPW, 10);
		var result = mailDao.forgotPassword(request.body.email, hashedPassword, newPW);
		response.status(200).json(helper.jsonMsgOK());
    } catch (ex) {
        next(ex);
    }
});

module.exports = serviceRouter;
