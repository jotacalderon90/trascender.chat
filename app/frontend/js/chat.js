app.controller("chatCtrl", function(trascender,$scope){
	
	var self = this;
	
	this.chat = new trascender({
		start: function(){
			let url = new URL(location.href);
			let p = url.searchParams.get("p");
			
			this.user = {
				nickname: "anonymous",
				password: (p!=null)?p:"secret"
			}
			
			if(p!=null){
				$("header,main,footer").fadeOut();
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
						msg: $.jCryption.encrypt(btoa(this.user.nickname + ": " + this.message),this.user.password)
					});
					this.message = "";
				}
			}
		},
		receive: function(data){
			console.log(data);
			data.msg = $.jCryption.decrypt(data.msg, this.user.password);
			data.msg = atob(data.msg);
			if(data.msg!=""){
				this.n = "";
				this.n += '<li class="list-group-item">';
				this.n += '<p>{{row.msg}}. <small>{{row.time}}</small></p>';
				this.n += '</li>';
				
				let c = document.getElementById("chat");
				
				let li = document.createElement("li");
				li.setAttribute("class","list-group-item");
				let p = document.createElement("p");
				p.innerHTML = data.msg;
				let s = document.createElement("small");
				s.innerHTML =  moment(new Date(data.time)).format("H:mm");
				li.appendChild(p);
				li.appendChild(s);
				c.appendChild(li);
				document.getElementById("blop").play();
				
				$('#chat').scrollTop($('#chat')[0].scrollHeight);
			}
		},
		generateURL: function(){
			return host + "?p=" + $.jCryption.encrypt(btoa(this.user.password),this.random(5));
		},
		copy: function(){
			let el = document.createElement('textarea');
			el.value = this.generateURL();
			el.setAttribute('readonly', '');
			el.style.position = 'absolute';
			el.style.left = '-9999px';
			document.body.appendChild(el);
			el.select();
			document.execCommand('copy');
			document.body.removeChild(el);
			alert("URL generada y copiada al cortapapeles");
		},
		random: function(length){
			let possibleChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
			let text = "";
			for (let i = 0; i < length; i++){
				text += possibleChar.charAt(Math.floor(Math.random() * possibleChar.length));
			}
			return text;
		}
	});	
	
	this.camera = new trascender({
		take: async function(){
			const { Camera } = Capacitor.Plugins;
			try {
				const photo = await Camera.getPhoto({resultType: "uri"});
				console.log(photo.webPath);
				$("#image").attr("src",photo.webPath);
			} catch (e) {
				alert(e);
				console.warn('User cancelled', e);
			}
		}
	})
});