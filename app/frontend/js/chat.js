app.controller("chatCtrl", function(trascender,$scope){
	
	var self = this;
	
	this.chat = new trascender({
		start: function(){
			this.user = {
				nickname: "anonymous",
				password: "secret"
			}
			this.message = "";
			if(host.indexOf("localhost")>-1){
				this.socket = io({transports: ['websocket']});
			}else{
				let h = host;
				let o = (h.indexOf("https://")>-1)?{secure:true}:{};
				this.socket = io(h,o);
			}
			this.socket.on("mtc", (data)=>{this.receive(data)});
		},
		keypress: function(event){
			if(event.originalEvent.which == 13) {
				this.message = this.message.trim();
				if(this.message!=""){
					this.socket.emit("mts",{
						msg: $.jCryption.encrypt(btoa(JSON.stringify({
							nickname: this.user.nickname,
							message: this.message
						})),this.user.password)
					});
					this.message = "";
				}
			}
		},
		receive: function(data){
			//console.log(data);
			data.msg = $.jCryption.decrypt(data.msg, this.user.password);
			data.msg = atob(data.msg);
			if(data.msg!=""){
				//console.log(data);
				data.msg = JSON.parse(data.msg);
				
				this.n = "";
				this.n += '<li class="list-group-item">';
				this.n += '<p>{{row.msg}}. <small>{{row.time}}</small></p>';
				this.n += '</li>';
				
				let c = document.getElementById("chat");
				
				let li = document.createElement("li");
				li.setAttribute("class","list-group-item");
				
				//CREATED
				let s = document.createElement("small");
				s.innerHTML =  moment(new Date(data.time)).format("H:mm");
				
				//NICKNAME
				let b = document.createElement("b");
				b.innerHTML = data.msg.nickname;
				
				//MESSAGE
				let p = document.createElement("p");
				if(data.msg.message){
					p.innerHTML = data.msg.message;
				}
				
				//IMAGE 
				let i = document.createElement("img");
				if(data.msg.image){
					i.src = "data:image/png;base64," + data.msg.image.base64String;
				}
				
				/*if(data.thumb){
					p.innerHTML = '<img src="data:image/png;base64, ' + data.thumb + '" height="40" title="' + data.nickname + '" alt="' + data.nickname + '"/>';
				}*/
				
				li.appendChild(s);
				li.appendChild(b);
				li.appendChild(p);
				li.appendChild(i);
				c.appendChild(li);
				
				//document.getElementById("blop").play();
				window.scrollTo(0,document.body.scrollHeight);
			}
		},
		setImage: function(image){
			this.socket.emit("mts",{
				msg: $.jCryption.encrypt(btoa(JSON.stringify({
					nickname: this.user.nickname,
					image: image
				})),this.user.password)
			});
			//base64String,format
		}
	});	
	
	this.camera = new trascender({
		take: async function(){
			try {
				let image = await Capacitor.Plugins.Camera.getPhoto({resultType: "Base64"});
				self.chat.setImage(image);
			} catch (e) {
				alert(e);
				console.log(e);
			}
		}
	});
	
	this.geolocation = new trascender({
		take: async function(){
			let {Geolocation} = Capacitor.Plugins;
			try{
				let coordinates = await Geolocation.getCurrentPosition();
				console.log(coordinates);
			}catch(e){
				alert(e);
				console.log(e);
			}
		}
	});
});