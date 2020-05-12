"use strict";

const fs = require("fs");
const io = require("socket.io");

let self = function(a){
	this.render = a.render;
	this.dir = a.dir;
	this.config = a.config;
	this.server = io(a.server);
	this.sockets = {};
	this.users_info = {};
	this.server.on("connection", (socket)=>{this.connection(socket)});
}



//@route('/')
//@method(['get'])
self.prototype.render_index = function(req,res,next){
	res.render("index");
}



//@route('/index.html')
//@method(['get'])
self.prototype.render_index = function(req,res,next){
	res.render("index");
}

self.prototype.connection = function(socket){
	let ip = socket.request.connection.remoteAddress;
	this.sockets[ip] = socket;
	this.sockets[ip].on("mts", (data)=>{this.mts(data)});
	this.sockets[ip].on("disconnect", ()=>{this.disconnect(ip)});
	console.log(ip + " connected");
}

self.prototype.mts = function(data){
	let d = {};
	try{
		d.nickname = data.nickname;
		d.thumb = data.thumb;
		d.msg = data.msg;
		d.time = new Date();
	}catch(e){
		console.error("socket:mts:" + e.toString());
		console.error(e);
		d.error = e.toString();
	}
	this.server.sockets.emit("mtc", d);
}

self.prototype.disconnect = function(ip){
	console.log(ip + " disconnect");
}



module.exports = self;