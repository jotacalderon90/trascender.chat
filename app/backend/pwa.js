"use strict";

let self = function(a){
	this.dir = a.dir
}



//@route('/manifest.json')
//@method(['get'])
self.prototype.manifest = async function(req,res){
	res.set('Content-Type','text/json');
	res.send({
		"name": "PWA - Trascender Chat",
		"short_name": "CHAT",
		"start_url": "/",
		"display": "standalone",
		"background-color": "#ccc",
		"theme-color": "#5FAAES",
		"icons": [{
			"src": "/media/img/icons/144x144.png",
			"sizes": "144x144",
			"type": "image/png"
		}, {
			"src": "/media/img/logo.png",
			"sizes": "100x100",
			"type": "image/png"
		}]
	});
}



//@route('/loader.js')
//@method(['get'])
self.prototype.loader = async function(req,res){
	res.sendFile(this.dir + "/app/frontend/js/lib/pwa/loader.js");
}



//@route('/sw.js')
//@method(['get'])
self.prototype.sw = async function(req,res){
	res.sendFile(this.dir + "/app/frontend/js/lib/pwa/sw.js");
}



module.exports = self;