/*
* Request handlers
*
*/

// Dependancies
var _data = require('./data');
var helpers = require('./helpers');

// Define the handlers
var handlers = {};

// Users handlers
handlers.users = function(data, callback){
    var acceptableMethods = ['post', 'get', 'put', 'delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._users[data.method](data, callback);
    }else{
        callback(405);
    }
};

// Container for the users submethods
handlers._users = {};

// Users - post
// Request data: firstname, lastname, phone, password, tosAgreement
// Optional data : none
handlers._users.post = function(data, callback){
    // Check that all required fields are filled out
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false; 
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 9 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 7 ? data.payload.password.trim() : false;
    var tosAgrement = typeof(data.payload.tosAgrement) == 'boolean' && data.payload.tosAgrement == true ? true : false;

    if(firstName && lastName && password && phone && tosAgrement){
        // Make sure that the user doesnt already exist
        _data.read('users', phone, function(err, data){
            if(err){
                // Hash the password
                var hashedPassword = helpers.hash(password);

                // Create the user object
                if(hashedPassword){
                    var user = {
                        'firstName': firstName,
                        'lastName' : lastName,
                        'phone' : phone,
                        'hashPassword' : hashedPassword,
                        'tosAgrement' : true
                    };
    
                    // Store the user
                    _data.create('users', phone, user, function(err){
                        if(!err){
                            callback(200);
                        }else{
                            console.log(err);
                            callback(500,{"Error" : "Could not create new user"});
                        }
                    });
                }else{
                    callback(500, {'Error': 'Could not hash user\'s password'});
                }
            }else{
                // User already exist
                callback(400, {'Error' : 'A user with that phone number already exist'});
            }
        });
    }else{
        callback(404, {'Error' : 'Missing required field'});
    }
};

// Users - get
// required data: phone
// OPtional data : none
// @TODO Only let an authenicated user get access their object. Don't let them access anyone.
handlers._users.get = function(data, callback){
    // Check that the phone number is valid
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 9 ? data.queryStringObject.phone.trim() : false;
    if(phone){
        // Look up the user
        _data.read('users', phone, function(err, data){
            if(!err && data){
                //  Remove the hash password from the user object before returning it to the request
                delete(data.hashPassword);
                callback(200, data);
            }else{
                callback(404);
            }
        })

    }else{
        callback(400, {'Error' : 'Missing required field'});
    }
};

// Users - put
// required data: phone
// Optional data: firstname, lastname, password(at least must be specified)
// @TODO only let authenticated user update their own object. Don't let them update anyone else
handlers._users.put = function(data, callback){
    // Chekc for the field
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 9 ? data.payload.phone.trim() : false;

    // Check for the optional fields
    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false; 
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 7 ? data.payload.password.trim() : false;

    // Error if the phone is invalid
    if(phone){
        // Error if nothing is sent to update
        if(firstName || lastName || password){
            // Look up the user
            _data.read('users', phone, function(err, userData){
                if(!err && userData){
                    // Update the fields necessary
                    if(firstName){
                        userData.firstName = firstName;
                    }
                    if(lastName){
                        userData.lastName = lastName;
                    }
                    if(password){
                        userData.hashPassword = helpers.hash(password);
                    }
                    // Store the new update
                    _data.update('users', phone, userData, function(err){
                        if(!err){
                            callback(200);
                        }else{
                            console.log(err);
                            callback(500, {'Error' : 'Could not update the user'});
                        }
                    });
                }else {
                    callback(400, {'Error' : 'The specified user does not exist'});
                }
            });
        }else{
            callback(400, {'Error' : 'Missing fields to update'});
        }
    }else{
        callback(400, {'Error' : 'Missing required field'});
    }

};

// Users - delete
// Required field : phone
// @TODO Only let an authentificated user delete their object. Don't let them delete them delete anyone
// @TODO cleanup (delete) any other data file associated
handlers._users.delete = function(data, callback){
    // Check that the phone number is valid
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 9 ? data.queryStringObject.phone.trim() : false;
    if(phone){
        // Look up the user
        _data.read('users', phone, function(err, data){
            if(!err && data){
                _data.delete('users', phone, function(err){
                    if(!err){
                        callback(200);
                    }else{
                        callback(400, {'Error' : 'Could not delete the specified user'});
                    }
                });
            }else{
                callback(400, {'Error' : 'Could not fint the specified user'});
            }
        })

    }else{
        callback(400, {'Error' : 'Missing required field'});
    }
};

// Sample handler
handlers.ping = function(data, callback){
    callback(200);
};

// Not found handler
handlers.notFound = function(data, callback){
    callback(404);
};  

// Export the module
module.exports = handlers;