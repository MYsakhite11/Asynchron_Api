/*
*Primary file for the API
*
*/

//Dependances
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./lib/config');
var fs = require('fs');
var _data = require('./lib/data');
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');


// TESTING
// @TODO delete this
// _data.create('test', 'newFile2', {'anta': 'seck'}, function(err){
//     console.log('this was the error', err);
// });
// _data.read('test', 'newFile', function(err, data){
//         console.log('this was the error', err, 'and the data is ',data);
//     });
// _data.update('test', 'newFile', {'faty': 'gueye'}, function(err){
//         console.log('this was the error', err);
//     });
// _data.delete('test', 'newFile2', function(err){
//         console.log('this was the error', err);
//     });

//Instantiate the http server
var httpServer = http.createServer(function(req, res){
    unifiedServer(req, res);
});

//start the server, and use config.js to listen in the port
httpServer.listen(config.httpPort, function(){
    console.log("The server is listening on port "+config.httpPort+" in "+config.envName+" node");
});

//Instantiate the HTTPS server
var httpsServerOptions = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert' : fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions,function(req, res){
    unifiedServer(req, res);
});

// Start the  HTTPS server
httpsServer.listen(config.httpsPort, function(){
    console.log("The server is listening on port "+config.httpsPort+" in "+config.envName+" node");
});

// All the server logic for both http and https server
var unifiedServer = function(req, res){

    // Get the url and parse it
    var parsedUrl = url.parse(req.url, true);

    // Get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    // Get the query string as an object
    var queryStringObject = parsedUrl.query;

    //Get the HTTP method
    var method = req.method.toLowerCase();

    // Geet the headers as an object
    var headers = req.headers;

    // Get the payload, if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(data){
        buffer += decoder.write(data);
    });
    req.on('end', function(){
        buffer += decoder.end();

        // Choose the handler this request should go to. If on is not found use the notFOund handler
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
        
        // Construct thnot nj,kFoundenotFound data object to send to the handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : helpers.parseJsonToObject(buffer)
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload){
            // Use the status code called back by the handler, or default to 200
            statuscode = typeof(statusCode) == 'number' ? statusCode : 200;
            // Use the payload called back by the handler, or default to an empty object
            payload =  typeof(payload) == 'object' ? payload :{};

            // Convert the payload to a string
            var payloadString = JSON.stringify(payload);

            // Send the response
            res.setHeader('Content-type', 'application/json');// send the response in json
            res.writeHead(statusCode);
            res.end(payloadString);


            // Log the request path
            // console.log('Request received on path: '+trimmeedPath+' with method: '+method+' and with this query string parameters ',queryStringObject);
            // Log the request headers
            console.log('Returning this response: ', statusCode, payloadString);
        }); 
    });
};

// Define a request  router
var router = {
    'ping' : handlers.ping,
    'users' : handlers.users
};