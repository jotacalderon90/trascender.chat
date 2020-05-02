console.log(new Date() + " == iniciando aplicacion");

//importar librerias externas
console.log(new Date() + " == importando readline");
const readline 		= require('readline');
console.log(new Date() + " == importando fs");
const fs			= require("fs");
console.log(new Date() + " == importando path");
const path			= require("path");
console.log(new Date() + " == importando express");
const express		= require("express");
console.log(new Date() + " == importando body-parser");
const bodyParser	= require("body-parser");
console.log(new Date() + " == importando cookie-parser");
const cookieParser	= require("cookie-parser");
console.log(new Date() + " == importando express-session");
const session		= require("express-session");
console.log(new Date() + " == importando express-fileupload");
const upload		= require('express-fileupload');
console.log(new Date() + " == importando helmet");
const helmet 		= require("helmet");
console.log(new Date() + " == importando http");
const http			= require("http");
console.log(new Date() + " == importando trascender.router");
const router 		= require("trascender.router");
console.log(new Date() + " == importando trascender.render");
const render 		= require("trascender.render");
			
//kernel/core/motor del sistema trascender
let trascender = async function(){
	try{
		
		//configurar estandar de aplicacion web/nodejs/express/trascender
		if(true){
			
			console.log(new Date() + " == configurando aplicacion");
			
			this.config = JSON.parse(fs.readFileSync("./app.json","utf8"));
			
			this.express = express();
			this.express.use(bodyParser.json({limit: "50mb"})); 
			this.express.use(bodyParser.urlencoded({extended: true}));
			this.express.use(cookieParser());
			this.express.use(session({secret: (new Date()).toISOString(), resave: false, saveUninitialized: false}));
			this.express.use(upload());
			this.express.use(helmet());
			
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
			this.process = process;
			
			this.dir		= __dirname;
			this.config.properties.views = "/app/frontend/html/";
			
			this.server		= http.Server(this.express);
			
			this.render = new render(this, __dirname + "/app/frontend/html/");
			
			let libs = fs.readdirSync("./app/backend/lib","utf8").filter(function(row){
				return fs.statSync(path.join("./app/backend/lib",row)).isFile();
			});
			
			for(let i=0;i<libs.length;i++){
				let l = libs[i].replace(".js","");
				console.log(new Date() + " == instanciando libreria " + l);
				this[l]	= new(require("./app/backend/lib/" + l))(this);
			}
			
		}
		
		//definir funciones internas propias de trascender
		if(true){
			
			this.beforeExecute = function(params){
				return async (req,res,next) => {
					return next();
				}
			}
			
			this.getFile = function(file){
				return function(req,res){
					res.sendFile(file);
				};
			}
			
			this.getRedirect = function(to){
				return function(req,res){
					res.redirect(to);
				};
			}
			
		}
		
		//levantar aplicación solicitada
		if(true){
			
			//publicar archivos
			console.log(new Date() + " == publicando archivos");
			this.express.get("/favicon.ico", this.getFile(this.dir + "/app/frontend/media/img/favicon.ico"));
			this.express.get("/robots.txt", this.getFile(this.dir + "/app/frontend/media/doc/robots.txt"));
			if(this.config.files){
				for(let i=0;i<this.config.files.length;i++){
					this.express.get(this.config.files[i].uri, this.beforeExecute({type: "FILE", roles: this.config.files[i].roles}), this.getFile(this.dir + this.config.files[i].src));
				}
			}
				
			//publicar carpetas
			console.log(new Date() + " == publicando carpetas");
			this.express.use("/",  express.static(this.dir + "/app/frontend"));
			if(this.config.folders){
				for(let i=0;i<this.config.folders.length;i++){
					this.express.use(this.config.folders[i].uri, this.beforeExecute({type: "FOLDER", roles: this.config.folders[i].roles}), express.static(this.dir + this.config.folders[i].src));
				}
			}
				
			//importar router
			new router(this,__dirname + "/app/backend");
			
			//publicar redireccionamientos
			if(this.config.redirect){
				for(let i=0;i<this.config.redirect.length;i++){
					console.log(new Date() + " == publicando redireccionamientos");
					this.express.use(this.config.redirect[i].from, this.beforeExecute({type: "REDIRECT", roles: this.config.redirect[i].roles}), this.getRedirect(this.config.redirect[i].to));
				}
			}
			
			//publicar error 404
			this.express.use(function(req,res,next){
				console.log(new Date() + " == publicando error 404 == " + req.url);
				res.status(404).send({title: "Error 404", message: "URL no encontrada" + req.url, error: 404, class: "danger"});
			});
			
			//iniciar aplicacion
			let port = this.config.properties.port;
			console.log(new Date() + " == abriendo puerto");
			this.server.listen(port, function(){
				console.log("app started in port " + port);
			});
			
		}
	
	}catch(e){
		console.log("ERROR AL LEVANTAR SISTEMA TRASCENDER!");
		console.log(e);
		process.exit();
	}
};
trascender();