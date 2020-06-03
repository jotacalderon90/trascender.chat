"use strict";

const webpush = require('web-push');

const self = function(a){
	if(a.config.push){
		webpush.setVapidDetails(
			a.config.push.mailto,
			a.config.push.public,
			a.config.push.private
		);
		this.dir = a.dir;
		this.config = a.config;
		this.mongodb = a.mongodb;
	}
}



//@route('/push/publickey')
//@method(['get'])
self.prototype.publickey = async function(req,res){
	try{
		if(this.config.push && this.config.push.public){
			res.send({data: this.config.push.public});
		}else{
			res.send({data: null});
		}
	}catch(e){
		console.error(e);
		res.send({data: null, error: e});
	}
}



//@route('/push/subscribe')
//@method(['post'])
self.prototype.subscribe = async function(req,res){
	try{
		req.body.created = new Date();
		await this.mongodb.insertOne("push",req.body);
		res.send({data: true});
	}catch(e){
		res.send({data: null, error: e});
	}
}



//@route('/push/unsubscribe')
//@method(['post'])
self.prototype.unsubscribe = async function(req,res){
	try{
		let row = await this.mongodb.find("push",{endpoint: req.body.endpoint});
		if(row.length==1){
			await this.mongodb.deleteOne("push",row[0]._id);
		}
		res.send({data: true});
	}catch(e){
		res.send({data: null, error: e});
	}
}



//@route('/push/notificate')
//@method(['get','post'])
//@roles(['admin'])
self.prototype.notificate = async function(req,res){
	try{
		switch(req.method.toLowerCase()){
			case "get":
				res.render("push/form");
			break;
			case "post":			
				let {title,body,uri} = req.body;
				let rows = await this.mongodb.find("push");
				for(let i=0;i<rows.length;i++){
					webpush.sendNotification(rows[i], JSON.stringify({title,body,uri}));
				}
				res.redirect("/push/notificate");
			break;
		}
	}catch(e){
		res.status(500).render("message",{title: "Error en el Servidor", message: e.toString(), error: 500, class: "danger"});
	}
}



module.exports = self;