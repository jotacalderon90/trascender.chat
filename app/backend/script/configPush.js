//https://eldevsin.site/notificaciones-web-push-con-nodejs/
"use strict";

const readline = require('readline');
const fs = require("fs");
const webpush = require("web-push");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const ask = function(question){
	return new Promise((resolve,reject)=>{
		rl.question(question, (response) => {
			resolve(response);
		});
	});
}

const self = function(){
	this.configPath = "../../../app.json";
	this.start();
}

self.prototype.start = async function(){
	const config = JSON.parse(fs.readFileSync(this.configPath,"utf-8"));
	let r;
	if(config.push){
		r = await ask("Se ha detectado una configuración push\npresione una tecla para reemplazarla");
	}
	let email = await ask("Ingrese un email: ");
	let vapidKeys = webpush.generateVAPIDKeys();
	config.push = {
		mailto: 'mailto:' + email,
		public: vapidKeys.publicKey,
		private: vapidKeys.privateKey
	}
	fs.writeFileSync(this.configPath,JSON.stringify(config,undefined,"\t"));
	process.exit(0);
}

new self();