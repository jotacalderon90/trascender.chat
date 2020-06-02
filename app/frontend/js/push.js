app.modules.push = new trascender({
    start: function() {
		this.read = this.serviceCreate("GET","/push/publickey");
		this.subscribeServer = this.serviceCreate("POST","/push/subscribe");
		this.unsubscribeServer = this.serviceCreate("POST","/push/unsubscribe");
		this.code = document.querySelector('.js-subscription-json');
	},
	onload: async function(){
		try{
			if (!('serviceWorker' in navigator && 'PushManager' in window)) {
				throw("Service Worker o Push no soportado");
			}
			this.swRegistration = await navigator.serviceWorker.register("sw.js");
			this.serviceWorker = await navigator.serviceWorker.ready;
			this.subscription = await this.serviceWorker.pushManager.getSubscription();
			if(this.subscription!=null){
				console.log(this.subscription);
				this.code.innerHTML = JSON.stringify(this.subscription,null,"\r");
				throw("Usuario ya registrado");
			}
			this.applicationServerPublicKey = await this.read();
			if(this.applicationServerPublicKey==null){
				throw("No existe llave p?blica para notificaciones push");
			}
			this.mainToggle();
		}catch(e){
			console.log(e);
		}
	},
	mainToggle: function(){
		$("#dvPush").fadeToggle();
	},
	subscribe: async function(){
		try{
			this.subscription = await this.swRegistration.pushManager.subscribe({userVisibleOnly: true,applicationServerKey: this.applicationServerPublicKey});
			console.log(this.subscription);
			this.code.innerHTML = JSON.stringify(this.subscription,null,"\r");
			await this.subscribeServer({},this.formatBody(this.subscription));
			this.scope.$apply();
			await this.wait(2000);
			$("#dvPush").fadeToggle();
		}catch(e){
			console.log(e);
		}
	},
	unsubscribe: async function(){
		try{
			await this.unsubscribeServer({},this.formatBody(this.subscription));
			this.subscription.unsubscribe();
			console.log(this.subscription);
			this.subscription = null;
			this.code.innerHTML = "";
			await this.wait(2000);
			$("#dvPush").fadeToggle();
		}catch(e){
			console.log(e);
		}
	}
});