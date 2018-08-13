"use strict";
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

var saveMongodbData = function(database, collection, data){
	return new Promise((resolve, reject)=>{
	MongoClient.connect(url, function(err, db) {
		  console.log("connect to mongodb success!");
		    if (err) {
		    	reject("database ops error");
		    	db.close();
		    	return;
		    }
		    let dbo = db.db(database);
		    let dbc = dbo.collection(collection);
		    
		    let batch = dbc.initializeOrderedBulkOp();
		    data.forEach(rec=>batch.insert(rec));
		    batch.execute((err,res)=>{
		    	if (err) {
		    		reject("database ops error");
			    }
			    else{
			    	resolve("data ops success");
			    }
		     	db.close(); 
		    });
	  	});//end mongoclient connect
	});
};
module.exports = function(app){
    app.post('/api/usages', function(req, res){

        // Store the supplied usage data
        app.usages.push(req.body);
        var usageId = app.usages.length;
        console.log('Stored usage count: ' + usageId);

        //persist data when the data are more than 1000 rows
        //aggregate database operations to improve efficiency
        //database writing is an i/o op, and it is done async
        if (app.usages.length > 1000){
        	saveMongodbData("propeller","busyapi",app.usages.slice());
        	//delete the array data
        	app.usages.length = 0;
        }
        res.status(201).json({'id':usageId});
    });
}
