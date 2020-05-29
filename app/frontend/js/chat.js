app.modules.chat = new trascender({
	start: function(){
		this.user = {
			nickname: "anonymous",
			password: "secret"
		}
		this.message = "";
		if (host.indexOf("localhost") > -1) {
			this.socket = io({
				transports: ['websocket']
			});
		} else {
			let h = host;
			let o = (h.indexOf("https://") > -1) ? {
				secure: true
			} : {};
			this.socket = io(h, o);
		}
		this.socket.on("mtc", (data) => {
			this.receive(data)
		});
	},
	onload: async function(){
		await this.wait(1000);
		if(this.parent.user && this.parent.user.doc!=null){
			this.user.nickname = this.parent.user.doc.nickname;
		}
	},
    keypress: function(event) {
        if (event.originalEvent.which == 13) {
            this.message = this.message.trim();
            if (this.message != "") {
                this.socket.emit("mts", {
                    msg: $.jCryption.encrypt(btoa(JSON.stringify({
                        nickname: this.user.nickname,
                        message: this.message
                    })), this.user.password)
                });
                this.message = "";
            }
        }
    },
    receive: function(data) {
        data.msg = $.jCryption.decrypt(data.msg, this.user.password);
        data.msg = atob(data.msg);
        if (data.msg != "") {
            data.msg = JSON.parse(data.msg);

            this.n = "";
            this.n += '<li class="list-group-item">';
            this.n += '<p>{{row.msg}}. <small>{{row.time}}</small></p>';
            this.n += '</li>';

            let c = document.getElementById("chat");

            let li = document.createElement("li");
            li.setAttribute("class", "list-group-item");

            //CREATED
            let s = document.createElement("small");
            s.innerHTML = moment(new Date(data.time)).format("H:mm");

            //NICKNAME
            let b = document.createElement("b");
            b.innerHTML = data.msg.nickname;

            //MESSAGE
            let p = document.createElement("p");
            if (data.msg.message) {
                p.innerHTML = data.msg.message;
            }

            //IMAGE 
            let i = document.createElement("img");
            if (data.msg.image) {
                i.src = "data:image/png;base64," + data.msg.image.base64String;
            }

            li.appendChild(s);
            li.appendChild(b);
            li.appendChild(p);
            li.appendChild(i);
            c.appendChild(li);

            window.scrollTo(0, document.body.scrollHeight);
        }
    },
    setImage: function(image) {
        this.socket.emit("mts", {
            msg: $.jCryption.encrypt(btoa(JSON.stringify({
                nickname: this.user.nickname,
                image: image
            })), this.user.password)
        });
    },
    camera: async function() {
        try {
            let data = await Capacitor.Plugins.Camera.getPhoto({
                resultType: "Base64"
            });
            this.setImage(data);
        } catch (e) {
            alert(e);
            console.log(e);
        }
    },
    geolocation: async function() {
        try {
            let data = await Capacitor.Plugins.Geolocation.getCurrentPosition();
            console.log(data);
        } catch (e) {
            alert(e);
            console.log(e);
        }
    }
});