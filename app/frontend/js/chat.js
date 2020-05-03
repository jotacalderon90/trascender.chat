app.controller("chatCtrl", function(trascender,$scope){
	
	var self = this;
	
	this.chat = new trascender({
		start: function(){
			let url = new URL(location.href);
			let n = url.searchParams.get("n");
			let p = url.searchParams.get("p");
			
			this.user = {
				nickname: (n!=null)?n:"anonymous",
				password: (p!=null)?p:"secret",
				thumb: "/media/img/logo.png"
			}
			
			if(n!=null && p!=null){
				$("header,main,footer,#dvChat1").fadeOut();
				$("#dvChat2").fadeIn();
				this.private = true;
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
						nickname: this.user.nickname,
						thumb: this.user.thumb,
						msg: $.jCryption.encrypt(btoa(this.message),this.user.password)
					});
					this.message = "";
				}
			}
		},
		receive: function(data){
			//console.log(data);
			data.msgb= data.msg;
			data.msg = $.jCryption.decrypt(data.msg, this.user.password);
			data.msg = atob(data.msg);
			if(this.private && data.msg==""){
				
			}else{
				this.pushMSG(data);
				document.getElementById("blop").play();
			}
		},
		pushMSG: function(data){
			this.n = "";
			this.n += '<li class="list-group-item">';
			this.n += '<img src="{{row.thumb}}" title="{{row.nickname}}"/>';
			this.n += '<p>{{row.msg}}. <small>{{row.time}}</small></p>';
			this.n += '</li>';
			
			let c = document.getElementById("chat");
			let c2 = document.getElementById("chat2");
			
			let li = document.createElement("li");
			li.setAttribute("class","list-group-item");
			let img = document.createElement("img");
			img.src = data.thumb;
			img.title = data.nickname;
			let p = document.createElement("p");
			p.innerHTML = ((data.msg!="")?data.msg:data.msgb);
			//let s = document.createElement("small");
			//s.innerHTML =  moment(new Date(data.time)).format("ddd, hA");
			li.appendChild(img);
			li.appendChild(p);
			//li.appendChild(s);
			c.insertBefore(li, c.firstChild);
			c2.appendChild(li);
			$('#chat2').scrollTop($('#chat2')[0].scrollHeight);
		},
		generateURL: function(){
			return host + "?n=" + this.generatePN + "&p=" + $.jCryption.encrypt(btoa(this.generatePN),this.random(5));
		},
		copy: function(){
			if(this.generatePN==undefined || this.generatePN.trim()==""){
				return;
			}
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
	
});