/*
* Library for storing and editing data
*
*/

// Dependancies
var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');

// Container for the module(to be exported)
var lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname,'/../.data/');

// write data to a file
lib.create = function(dir, file, data, callback){
    // Open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx',function(err,fileDescriptor){
        if(!err && fileDescriptor){
            // Convert data to a string
            var stringData = JSON.stringify(data);
            fs.writeFile(fileDescriptor, stringData, function(err){
                if(!err){
                    fs.close(fileDescriptor, function(err){
                        if(!err){
                            callback(false);
                        }else{
                            callback('Error Closing new file');
                        } 
                    });
                }else{
                    callback('Error writing to new file');
                }
            });
        }else{
            callback('Could not create new file, it may already exist');
        }
    });
};

// Read data from a file
lib.read = function(dir, file, callback){
    fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf-8', function(err, data){
        if(!err){
            // Convert data to json
            var parseData = helpers.parseJsonToObject(data);
            callback(false, parseData);
        }else {
            callback(err, data); 
        }
    });
};

// Update data inside a file
lib.update = function(dir, file,data, callback){
    // Open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json','r+',function(err, fileDescriptor){
        if(!err && fileDescriptor){
            // Convert data to a string
            var stringData = JSON.stringify(data);
            
            // Truncate the file
            fs.truncate(fileDescriptor, function(err){
                if(!err){
                    // write file and close it
                    fs.writeFile(fileDescriptor, stringData, function(err){
                        if(!err){
                            fs.close(fileDescriptor, function(err){
                                if(!err){
                                    callback(false);
                                }else{
                                    callback('Error Closing existing file');
                                } 
                            });
                        }else{
                            callback('Error writing existing file');
                        }
                    });
                }else{
                    callback("Error truncating file");
                }
            })

        }else{
            callback('Could not create new file, it may already exist');
        }
    });
};

// Delete a file
lib.delete = function(dir, file, callback){
    // Unlinking the file
    fs.unlink(lib.baseDir+dir+'/'+file+'.json', function(err){
        if(!err){
            callback(false);
        }else{
            callback("Error deleting file");
        }
    });
};

// Export the module
module.exports = lib;