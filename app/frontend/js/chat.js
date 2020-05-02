app.controller("chatCtrl", function(trascender,trascender_user,$scope){
	
	var self = this;
	
	this.user = trascender_user;
	
	this.chat = new trascender({
		start: async function(){
			await self.user.checkUser();
			
			if(self.user.doc==null && ["empty","expired"].indexOf(self.user.readLog.xhttp.json.error)>-1){
				return;
			}
			
			this.showChat = localStorage.getItem("showChat");
			
			if(document.getElementsByTagName("title")[0].innerHTML.trim()=="Chat"){
				this.toggle(0);
				$("#dvchat").fadeOut();
			}
			
			this.message = "";
			this.coll = [];
			this.coll2 = [];
			this.users = {};
			this.list = $("#chat");
			
			if(host.indexOf("localhost")>-1){
				this.socket = io({transports: ['websocket']});
			}else{
				let h = host;
				let o = (h.indexOf("https://")>-1)?{secure:true}:{};
				this.socket = io(h,o);
			}
			
			this.socket.on("first_load", (data)=>{this.first_load(data)});
			this.socket.on("new_user", (data)=>{this.new_user(data)});
			this.socket.on("delete_user", (data)=>{this.delete_user(data)});
			this.socket.on("mtc", (data)=>{this.receive(data)});
			
		},
		toggle: function(i){
			this.showChat = i;
			localStorage.setItem("showChat", this.showChat);
		},
		keypress: function(event){
			if(event.originalEvent.which == 13) {
				this.append();
			}
		},
		first_load: function(data){
			this.id = data.id;
			this.users = data.users;
			this.socket.emit("shared_profile", {
				id: this.id,
				nickname: self.user.doc.nickname,
				thumb: self.user.doc.thumb
			});
			if(data.last_msg){
				for(let i=0;i<data.last_msg.length;i++){
					this.receive(data.last_msg[i]);
				}
			}
			$scope.$digest(function(){});
		},
		receive: function(data){						
			data.message = $.jCryption.decrypt(data.message, "secret");
			data.message = atob(data.message);
			this.coll.push(data);
			this.coll2 = this.coll.reverse();
			$scope.$digest(function(){});
			this.list.animate({ scrollTop: this.list.prop("scrollHeight")}, 200);
			//document.getElementById("blop").play();
		},
		new_user: function(data){
			this.users[data.id] = data;
			$scope.$digest(function(){});
		},
		delete_user: function(data){
			delete this.users[data];
			$scope.$digest(function(){});
		},
		append: function(){
			this.message = this.message.trim();
			if(this.message!=""){
				this.socket.emit("mts",$.jCryption.encrypt(btoa(this.message),"secret"));
				this.message = "";
				this.toggle(1);
			}
		}
	});	
	
});