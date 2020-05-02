"use strict";

const fs = require("fs");
const io = require("socket.io");

let self = function(a){
	this.dir = a.dir;
	this.config = a.config;
	this.helper = a.helper;
	
	this.server = io(a.server);
	this.sockets = {};
	this.users_info = {};
	this.last_msg = [];
	this.server.on("connection", (socket)=>{this.connection(socket)});
	this.path = "chat";
}

self.prototype.connection = function(socket){
	let ip = socket.request.connection.remoteAddress;
	this.sockets[ip] = socket;
	this.sockets[ip].on("shared_profile", (data)=>{this.shared_profile(data)});
	this.sockets[ip].on("mts", (data)=>{this.mts(data,ip)});
	this.sockets[ip].on("disconnect", ()=>{this.disconnect(ip)});	
	this.sockets[ip].emit("first_load", this.first_load(ip));
}

self.prototype.shared_profile = function(data){
	this.users_info[data.id] = data;
	this.server.sockets.emit("new_user", data);
}

self.prototype.mts = function(data,ip){
	try{
		let post = this.users_info[ip];
		post.message = data;
		post.time = new Date();
		if(this.last_msg.length==10){
			this.last_msg.splice(0,1);
		}
		this.last_msg.push(JSON.parse(JSON.stringify(post)));
		this.server.sockets.emit("mtc", post);
	}catch(e){
		console.log("socket:mts:" + e.toString());
		console.log(e);
	}
}

self.prototype.disconnect = function(ip){
	delete this.users_info[ip];
	this.server.sockets.emit("delete_user", ip);
}

self.prototype.first_load = function(ip){
	return {
		id: ip,
		users: this.users_info,
		last_msg: this.last_msg
	}
}



//@route('/chat')
//@method(['get'])
self.prototype.render_index = function(req,res,next){
	let view = this.path + "/" + "index";
	if(this.helper.exist(view)){
		res.render(view,{config: this.config});
	}else{
		return next();
	}
}



//@route('/chat/:id')
//@method(['get'])
self.prototype.render_other = function(req,res,next){
	let view = this.path + "/" + req.params.id;
	if(this.helper.exist(view)){
		res.render(view,{config: this.config});
	}else{
		return next();
	}
}



module.exports = self;