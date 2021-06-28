require('dotenv').config();
const helper = require('../helper.js');
const UserDao = require('../dao/userDao.js');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var serviceRouter = express.Router();
serviceRouter.use(express.json());

function authenticateToken(request, response, next) {
	const authHeader = request.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if (token == null) return response.sendStatus(401);
	
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) {
			return response.sendStatus(403);}
		request.user = user;
		next();
	});
}

helper.log('- Service User');

serviceRouter.get('/user/', function(request, response) {
    helper.log('Service User: Client requested one record, id=' + request.params.id);

    const userDao = new UserDao(request.app.locals.dbConnection);
    try {
        var result = userDao.loadById(request.params.id);
        helper.log('Service User: Record loaded');
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError('Service User: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get('/user/gib/:id', function(request, response) {
    helper.log('Service User: Client requested one record, id=' + request.params.id);

    const userDao = new UserDao(request.app.locals.dbConnection);
    try {
        var result = userDao.loadById(request.params.id);
        helper.log('Service User: Record loaded');
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError('Service User: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get('/user/alle', function(request, response) {
    helper.log('Service User: Client requested all records');

    const userDao = new UserDao(request.app.locals.dbConnection);
    try {
        var result = userDao.loadAll();
        helper.log('Service User: Records loaded, count=' + result.length);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError('Service User: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get('/user/existiert/:id', function(request, response) {
    helper.log('Service User: Client requested check, if record exists, id=' + request.params.id);

    const userDao = new UserDao(request.app.locals.dbConnection);
    try {
        var result = userDao.exists(request.params.id);
        helper.log('Service User: Check if record exists by id=' + request.params.id + ', result=' + result);
        response.status(200).json(helper.jsonMsgOK({ 'id': request.params.id, 'existiert': result }));
    } catch (ex) {
        helper.logError('Service User: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.post('/user/getUser/', authenticateToken, (request, response) => {
    helper.log('Service Tournament: Client requested Userdata');

    const userDao = new UserDao(request.app.locals.dbConnection);
    try {
        var result = userDao.getUser(request.user.email);
        helper.log('Service Tournament: User Data successfull');
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError('Service Tournament: Error getting user. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.post('/user/unique', function(request, response) {
    helper.log('Service User: Client requested check, if email is unique, email=' + request.body.email);
	var errorMsgs=[];
    if (helper.isUndefined(request.body.email)) 
        errorMsgs.push('email fehlt');

    if (errorMsgs.length > 0) {
        helper.log('Service User: check not possible, data missing');
        response.status(400).json(helper.jsonMsgError('Check not possible. Missing data: ' + helper.concatArray(errorMsgs)));
        return;
    }

    const userDao = new UserDao(request.app.locals.dbConnection);
    try {
        var result = userDao.isunique(request.body.email);
        helper.log('Service User: Check if record exists by email=' + request.body.email + ', result=' + result);
        response.status(200).json(helper.jsonMsgOK({ 'email': request.body.email, 'unique': result }));
    } catch (ex) {
        helper.logError('Service User: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

/*serviceRouter.post('/user/validatePass', async(request, response) => {
    helper.log('Service User: Client requested check, if password valid for email' + request.body.email + request.body.password);
	var errorMsgs=[];
    if (helper.isUndefined(request.body.email)) 
        errorMsgs.push('email fehlt');
	if (helper.isUndefined(request.body.password)) 
        errorMsgs.push('password fehlt');

    if (errorMsgs.length > 0) {
        helper.log('Service User: check not possible, data missing');
        response.status(400).json(helper.jsonMsgError('Check not possible. Missing data: ' + helper.concatArray(errorMsgs)));
        return;
    }

    const userDao = new UserDao(request.app.locals.dbConnection);
    try {
		var hashedpw = userDao.loadPwByEmail(request.body.email);
		var correctCompare = false;
		var compare = await bcrypt.compare(request.body.password, hashedpw.Password);
		helper.log(compare);
		if (compare){
			var result = userDao.hasaccessencrypted(request.body.email, correctCompare);
			helper.log('Service User: Check if password is valid for email=' + request.body.email + ', result=' + result);
			response.status(200).json(helper.jsonMsgOK({ 'email': request.body.email, 'password': request.body.password, 'unique': result }));
		}
    } catch (ex) {
        helper.logError('Service User: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});*/

// CHECK IF USER HAS ACCESS WITH ENCRPYTED PASSWORDS

serviceRouter.post('/user/check', async(request, response) => {
    helper.log('Service User: Client requested check, if user has access');
	
    var errorMsgs=[];
    if (helper.isUndefined(request.body.email)) 
        errorMsgs.push('email fehlt');
    if (helper.isUndefined(request.body.password)) 
        errorMsgs.push('password fehlt');

    if (errorMsgs.length > 0) {
        helper.log('Service User: check not possible, data missing');
        response.status(400).json(helper.jsonMsgError('Check not possible. Missing data: ' + helper.concatArray(errorMsgs)));
        return;
    }
	
    const userDao = new UserDao(request.app.locals.dbConnection);
    try {
		var hashedpw = userDao.loadPwByEmail(request.body.email);
		var correctCompare = false;
		var compare = await bcrypt.compare(request.body.password, hashedpw.Password);
		helper.log(compare);
		if (compare){
			correctCompare = true;
			var result = userDao.hasaccessencrypted(request.body.email, request.body.password, correctCompare);
			helper.log('Service User: Check if user has access, result=' + result);	
			const email = request.body.email;
			const user = { email: email };
			const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
			response.status(200).json({ accessToken: accessToken });
		}
		else {
			throw new Error('User has no access');
		}
		
    } catch (ex) {
        helper.logError('Service User: Error checking if user has access. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.post('/user/tokenToUsername', authenticateToken, (request, response) => {
    helper.log('Service User: Client requested token to username');
	response.status(200).json({
			username: request.user.email});
});


// CHECK IF USER HAS ACCESS WITH UNENCRPYTED PASSWORDS
/*
serviceRouter.post('/user/check', function(request, response) {
    helper.log('Service User: Client requested check, if user has access');
	
    var errorMsgs=[];
    if (helper.isUndefined(request.body.email)) 
        errorMsgs.push('email fehlt');
    if (helper.isUndefined(request.body.password)) 
        errorMsgs.push('password fehlt');

    if (errorMsgs.length > 0) {
        helper.log('Service User: check not possible, data missing');
        response.status(400).json(helper.jsonMsgError('Check not possible. Missing data: ' + helper.concatArray(errorMsgs)));
        return;
    }
	
    const userDao = new UserDao(request.app.locals.dbConnection);
    try {
		var hashedpw = userDao.loadPwByEmail(request.body.email);
		var result = userDao.hasaccess(request.body.email, request.body.password, hashedpw.Password);
		helper.log('Service User: Check if user has access, result=' + result);	
		response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError('Service User: Error checking if user has access. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});
*/

serviceRouter.post('/user', async(request, response) => {
    helper.log('Service User: Client requested creation of new record');

    var errorMsgs=[];
	if (helper.isUndefined(request.body.name)) 
        errorMsgs.push('name fehlt');
	if (helper.isUndefined(request.body.nickname)) 
        errorMsgs.push('nickname fehlt');
    if (helper.isUndefined(request.body.email)) 
        errorMsgs.push('email fehlt');
	if (helper.isUndefined(request.body.password)) 
        errorMsgs.push('password fehlt');
    
    if (errorMsgs.length > 0) {
        helper.log('Service User: Creation not possible, data missing');
        response.status(400).json(helper.jsonMsgError('Hinzufügen nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs)));
        return;
    }

    const userDao = new UserDao(request.app.locals.dbConnection);
    try {
		const hashedPassword = await bcrypt.hash(request.body.password, 10);
		helper.log(hashedPassword);
        var result = userDao.create(request.body.name, request.body.nickname, request.body.email, hashedPassword);
        helper.log('Service User: Record inserted');
		const email = request.body.email;
		const user = { email: email };
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
		response.json({ accessToken: accessToken });
    } catch (ex) {
        helper.logError('Service User: Error creating new record. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.put('/user', function(request, response) {
    helper.log('Service User: Client requested update of existing record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push('id fehlt');
    if (helper.isUndefined(request.body.email)) 
        errorMsgs.push('email fehlt');
	if (helper.isUndefined(request.body.password)) 
        errorMsgs.push('password fehlt');
	if (helper.isUndefined(request.body.personid)) 
        errorMsgs.push('personid fehlt');

    if (errorMsgs.length > 0) {
        helper.log('Service User: Update not possible, data missing');
        response.status(400).json(helper.jsonMsgError('Update nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs)));
        return;
    }

    const userDao = new UserDao(request.app.locals.dbConnection);
    try {
        var result = userDao.update(request.body.id, request.body.email, request.body.password, request.body.personid);
        helper.log('Service User: Record updated, id=' + request.body.id);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError('Service User: Error updating record by id. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.put('/user/updateProfile', authenticateToken, async (request, response) => {
    helper.log('Service User: Client requested update of existing profile');
	
	var errorMsgs=[];
    if (helper.isUndefined(request.body.name)) 
        errorMsgs.push('name fehlt');
    if (helper.isUndefined(request.body.nickname)) 
        errorMsgs.push('nickname fehlt');
	if (helper.isUndefined(request.body.email)) 
        errorMsgs.push('email fehlt');
	if (helper.isUndefined(request.body.password)) 
        errorMsgs.push('password fehlt');

    if (errorMsgs.length > 0) {
        helper.log('Service User: Update not possible, data missing');
        response.status(400).json(helper.jsonMsgError('Update nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs)));
        return;
    }
	
	const userDao = new UserDao(request.app.locals.dbConnection);
	var hashedpw = userDao.loadPwByEmail(request.user.email);
	var compare = await bcrypt.compare(request.body.password, hashedpw.Password);
	helper.log(compare);
	
    try {
		if(compare){
			var result = userDao.updateProfile(request.body.name, request.body.nickname, request.body.email, request.user.email);
			helper.log('Service User: Record updated, email=' + request.user.email);
			const user = { email: request.body.email };
			const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
			response.status(200).json({
				result: helper.jsonMsgOK(result),
				accessToken: accessToken});
		}
		else{
			helper.logError('Service User: Error updating record by id. Exception occured: incorrect password');
			response.status(400).json(helper.jsonMsgError("incorrect password"));
		}
    } catch (ex) {
        helper.logError('Service User: Error updating record by id. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.put('/user/updatePassword', authenticateToken, async (request, response) => {
    helper.log('Service User: Client requested update of existing password');
	
	var errorMsgs=[];
    if (helper.isUndefined(request.body.newPassword)) 
        errorMsgs.push('neues Passwort fehlt');
    if (helper.isUndefined(request.body.confirmNewPassword)) 
        errorMsgs.push('neues Passwort Bestätigung fehlt');
	if (helper.isUndefined(request.body.oldPassword)) 
        errorMsgs.push('altes Passwort fehlt');

    if (errorMsgs.length > 0) {
        helper.log('Service User: Update not possible, data missing');
        response.status(400).json(helper.jsonMsgError('Update nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs)));
        return;
    }
	
	const userDao = new UserDao(request.app.locals.dbConnection);
	var hashedpw = userDao.loadPwByEmail(request.user.email);
	var compare = await bcrypt.compare(request.body.oldPassword, hashedpw.Password);
	helper.log(compare);
	
    try {
		if(request.body.newPassword===request.body.confirmNewPassword){
			if(compare){
				const newHashedPassword = await bcrypt.hash(request.body.newPassword, 10);
				var result = userDao.updatePassword(newHashedPassword, request.user.email);
				helper.log('Service User: Password updated, email=' + request.user.email);
				response.status(200).json(helper.jsonMsgOK(result));
			}
		}
    } catch (ex) {
        helper.logError('Service User: Error updating record by id. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});


serviceRouter.delete('/user/:id', function(request, response) {
    helper.log('Service User: Client requested deletion of record, id=' + request.params.id);

    const userDao = new UserDao(request.app.locals.dbConnection);
    try {
        var obj = userDao.loadById(request.params.id);
        userDao.delete(request.params.id);
        helper.log('Service User: Deletion of record successfull, id=' + request.params.id);
        response.status(200).json(helper.jsonMsgOK({ 'gelöscht': true, 'eintrag': obj }));
    } catch (ex) {
        helper.logError('Service User: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

module.exports = serviceRouter;