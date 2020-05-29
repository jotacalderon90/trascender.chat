"use strict";

const http	= require("http");
const https	= require("https");
const querystring = require('querystring');

var self = function(a){
	this.config = (a && a.config)?a.config:null;
}


self.prototype.options = function(method,path,data){
	return {
		hostname: this.config.host,
		path: path,
		method: method.toUpperCase(),
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': Buffer.byteLength(data)
		}
	}
}


self.prototype.request = function(method,path,data){

	data = querystring.stringify(data);

	let options = this.options(method,path,data);

	path = this.config.host + path;

	let src = (path.indexOf("https://")==0)?https:http;
	
	return new Promise(function(resolve,reject){
		let b = "";
		let r = src.request(options, function(res){
			res.setEncoding('utf8');
			res.on("data", function(chunk){
				b+=chunk;
			});
			res.on('end', function () {
				resolve(b);
			});
			res.on('error', function (e) {
				return reject(error);
			});
		});
		r.on("error", function(e){
			return reject(e);
		});
		r.write(data);
		r.end();
	});
}

self.prototype.noWait = async function(method,path,data){
	try{
		let r = await this.request(method,path,data);
		console.info("microservice:noWait:success");
		console.info(r);
	}catch(e){
		console.error("microservice:noWait:error");
		console.error(e);
	}
}

module.exports = self;