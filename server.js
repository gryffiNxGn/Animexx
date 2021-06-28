/////////////////
///workaround /// bugfix for linux systems
Object.fromEntries = l => l.reduce((a, [k,v]) => ({...a, [k]: v}), {})
/////////////////

const helper = require('./helper.js');
const fileHelper = require('./fileHelper.js');
helper.log('Starting server...');

try {
    // connect database
    helper.log('Connect database...');
    const Database = require('better-sqlite3');
    const dbOptions = { verbose: console.log };
    const dbFile = './db/animexx.db';
    const dbConnection = new Database(dbFile, dbOptions);

    // create server
    const HTTP_PORT = 8000;
    const express = require('express');
    const fileUpload = require('express-fileupload');
    const cors = require('cors');
    const bodyParser = require('body-parser');
    const morgan = require('morgan');
    const _ = require('lodash');

    helper.log('Creating and configuring Web Server...');
    const app = express();
    
    // provide service router with database connection / store the database connection in global server environment
    app.locals.dbConnection = dbConnection;

    helper.log('Binding middleware...');
    app.use(fileUpload({
        createParentPath: true,
        limits: {
            fileSize: 2 * 1024 * 1024 * 1024        // limit to 2MB
        }
    }));
    app.use(cors());
    app.use(bodyParser.urlencoded({ extended: true}));
    app.use(bodyParser.json());
    app.use(function(request, response, next) {
        response.setHeader('Access-Control-Allow-Origin', '*'); 
        response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });
    app.use(morgan('dev'));

    // binding endpoints
    const TOPLEVELPATH = '/api';
    helper.log('Binding enpoints, top level Path at ' + TOPLEVELPATH);
    
	var serviceRouter = require('./services/eventdate.js');
    app.use(TOPLEVELPATH, serviceRouter);
	
	serviceRouter = require('./services/user.js');
    app.use(TOPLEVELPATH, serviceRouter);

	serviceRouter = require('./services/staff.js');
    app.use(TOPLEVELPATH, serviceRouter);
	
	serviceRouter = require('./services/person.js');
    app.use(TOPLEVELPATH, serviceRouter);
	
	serviceRouter = require('./services/tournament.js');
    app.use(TOPLEVELPATH, serviceRouter);
	
	serviceRouter = require('./services/mail.js');
    app.use(TOPLEVELPATH, serviceRouter);
	
	
    // send default error message if no matching endpoint found
    app.use(function (request, response) {
        helper.log('Error occured, 404, resource not found');
        response.status(404).json(helper.jsonMsgError('Resource not found'));
    });
	
	module.exports.app = app;

    // starting the Web Server
    helper.log('\nBinding Port and starting Webserver...');
    const server = app.listen(HTTP_PORT, () => {
        helper.log('Listening at localhost, port ' + HTTP_PORT);
        helper.log('\n\n-----------------------------------------');
        helper.log('exit / stop Server by pressing 2 x CTRL-C');
        helper.log('-----------------------------------------\n\n');
    });
	
	module.exports.server = server;

} catch (ex) {
    helper.logError(ex);
}
