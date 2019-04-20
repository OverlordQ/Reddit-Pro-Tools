






//"use strict";

var database = 'rpt';
var table = 'users';


window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"};
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;


// open database
let request = window.indexedDB.open(database, 4);

request.onerror = function(event) {
	console.log('db connection error');
};

request.addEventListener('error', (event) => {
  console.log('db request error: ' + request.error);
});

request.onblocked = function(event) {
	console.log('db blocked!');
	console.log(event);
};

// create data structure
request.onupgradeneeded = function(event) {
	console.log('db upgrade');
	db = event.target.result;
	
    if (db.objectStoreNames.contains(table)) {
		//console.log('deletedb');
		
		// This may speed up the db delete. Worth checking out.
		// indexedDB.deleteDatabase('rpt')
		db.deleteObjectStore(table);
	}
	
	var os = db.createObjectStore(table, {keyPath: 'name'});
	os.createIndex('about', 			'about', 			{ unique: false });
	os.createIndex('comments', 			'comments', 		{ unique: false });
	os.createIndex('stats', 			'stats', 			{ unique: false });
};


// connected to database
request.onsuccess = function(event) {
	//console.log('db success');
	db = event.target.result;
};





function handleQuota(data) {
	let quota = round(data.quota/1024/1024);
	let usage = round(data.usage/1024/1024);
	
	if (usage > quota * .95) {
		console.log('db usage:', usage, 'MB');
		console.log('db quota:', quota, 'MB');
		console.log('');
		overQuota();
	}
}


function overQuota() {
	//console.log('overQuota');

	
	let os = db.transaction([table], 'readwrite').objectStore(table);
	//let index = os.index('about');
	let req = os.openCursor();
	
	// errors
	req.onerror = function(e) {
		console.log('overQuota db error: ' + table + '!');
	};
	
	req.onsuccess = function (e) {
		if (req.result) {
			let user = req.result.value;
			
			let day = 60 * 60 * 24;
			let maxAge = Date.now() - (day * 10);
			
			if (user.about.updated < maxAge) {
				//console.log(maxAge, user.about.updated, user.name);
				
				let delReq = os.delete(user.name);
				delReq.onerror = function () {
					console.log('db error: failed to delete', user.name);
				}
				delReq.onsuccess = function () {
					//console.log('deleted', user.name);
				}
			}
			
			
			req.result.continue();
		}
	};
}


















