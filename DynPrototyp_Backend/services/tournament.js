require('dotenv').config();
const jwt = require('jsonwebtoken');
const helper = require('../helper.js');
const TournamentDao = require('../dao/tournamentDao.js');
const express = require('express');
var serviceRouter = express.Router();
serviceRouter.use(express.json());

helper.log('- Service Tournament');

function authenticateToken(request, response, next) {
	const authHeader = request.headers['authorization'];  //request authorization token from header
	const token = authHeader && authHeader.split(' ')[1];
	if (token == null) return response.sendStatus(401);	//if no token available return "no access, no token sent"
	
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => { // verify requested token with secret
		if (err) return response.sendStatus(403);	//	if token is available but not valid
		request.user = user;	// authorized user
		next(); //moving on from middleware
	});
}

serviceRouter.get('/tournament/gib/:id', authenticateToken, (request, response) => {
    helper.log('Service Tournament: Client requested one record, id=' + request.params.id);
	helper.log(request.user.name);
    const tournamentDao = new TournamentDao(request.app.locals.dbConnection);
    try {
        var result = tournamentDao.loadById(request.params.id);
        helper.log('Service Tournament: Record loaded');
        //response.status(200).json(helper.jsonMsgOK(result));
		//response.json(helper.jsonMsgOK(result));
		response.json(request.user.name);
    } catch (ex) {
        helper.logError('Service Tournament: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});
/*
serviceRouter.get('/tournament/gib/:id', function(request, response) {
    helper.log('Service Tournament: Client requested one record, id=' + request.params.id);

    const tournamentDao = new TournamentDao(request.app.locals.dbConnection);
    try {
        var result = tournamentDao.loadById(request.params.id);
        helper.log('Service Tournament: Record loaded');
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError('Service Tournament: Error loading record by id. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});
*/
serviceRouter.get('/tournament/alle', function(request, response) {
    helper.log('Service Tournament: Client requested all records');

    const tournamentDao = new TournamentDao(request.app.locals.dbConnection);
    try {
        var result = tournamentDao.loadAll();
        helper.log('Service Tournament: Records loaded, count=' + result.length);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError('Service Tournament: Error loading all records. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.get('/tournament/existiert/:id', function(request, response) {
    helper.log('Service Tournament: Client requested check, if record exists, id=' + request.params.id);

    const tournamentDao = new TournamentDao(request.app.locals.dbConnection);
    try {
        var result = tournamentDao.exists(request.params.id);
        helper.log('Service Tournament: Check if record exists by id=' + request.params.id + ', result=' + result);
        response.status(200).json(helper.jsonMsgOK({ 'id': request.params.id, 'existiert': result }));
    } catch (ex) {
        helper.logError('Service Tournament: Error checking if record exists. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

serviceRouter.post('/tournament', function(request, response) {
    helper.log('Service Tournament: Client requested creation of new record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.picture)) 
        errorMsgs.push('picture fehlt');
    if (helper.isUndefined(request.body.title)) 
        errorMsgs.push('title fehlt');
    if (helper.isUndefined(request.body.date)) 
        errorMsgs.push('date fehlt');
    if (helper.isUndefined(request.body.shortdescription)) 
        errorMsgs.push('shortdescription fehlt');
    if (helper.isUndefined(request.body.description)) 
        errorMsgs.push('description fehlt');
    
    if (errorMsgs.length > 0) {
        helper.log('Service Tournament: Creation not possible, data missing');
        response.status(400).json(helper.jsonMsgError('Hinzufügen nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs)));
        return;
    }

    const tournamentDao = new TournamentDao(request.app.locals.dbConnection);
    try {
        var result = tournamentDao.create(request.body.date, request.body.info);
        helper.log('Service Tournament: Record inserted');
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError('Service Tournament: Error creating new record. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.put('/tournament', function(request, response) {
    helper.log('Service Tournament: Client requested update of existing record');

    var errorMsgs=[];
    if (helper.isUndefined(request.body.id)) 
        errorMsgs.push('id fehlt');
    if (helper.isUndefined(request.body.picture)) 
        errorMsgs.push('picture fehlt');
    if (helper.isUndefined(request.body.title)) 
        errorMsgs.push('title fehlt');
    if (helper.isUndefined(request.body.date)) 
        errorMsgs.push('date fehlt');
    if (helper.isUndefined(request.body.shortdescription)) 
        errorMsgs.push('shortdescription fehlt');
    if (helper.isUndefined(request.body.description)) 
        errorMsgs.push('description fehlt');

    if (errorMsgs.length > 0) {
        helper.log('Service Tournament: Update not possible, data missing');
        response.status(400).json(helper.jsonMsgError('Update nicht möglich. Fehlende Daten: ' + helper.concatArray(errorMsgs)));
        return;
    }

    const tournamentDao = new TournamentDao(request.app.locals.dbConnection);
    try {
        var result = tournamentDao.update(request.body.id, request.body.date);
        helper.log('Service Tournament: Record updated, id=' + request.body.id);
        response.status(200).json(helper.jsonMsgOK(result));
    } catch (ex) {
        helper.logError('Service Tournament: Error updating record by id. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }    
});

serviceRouter.delete('/tournament/:id', function(request, response) {
    helper.log('Service Tournament: Client requested deletion of record, id=' + request.params.id);

    const tournamentDao = new TournamentDao(request.app.locals.dbConnection);
    try {
        var obj = tournamentDao.loadById(request.params.id);
        tournamentDao.delete(request.params.id);
        helper.log('Service Tournament: Deletion of record successfull, id=' + request.params.id);
        response.status(200).json(helper.jsonMsgOK({ 'gelöscht': true, 'eintrag': obj }));
    } catch (ex) {
        helper.logError('Service Tournament: Error deleting record. Exception occured: ' + ex.message);
        response.status(400).json(helper.jsonMsgError(ex.message));
    }
});

module.exports = serviceRouter;