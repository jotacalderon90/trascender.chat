'use strict';
new trascender({
    start: function() {
		this.service_read = this.serviceCreate("GET","/push/publickey");
		this.read();
	},
	read: async function(){
		try{
			this.applicationServerPublicKey = await this.service_read();
			if(this.applicationServerPublicKey!=""){
				if ('serviceWorker' in navigator && 'PushManager' in window) {
					console.log('Service Worker and Push is supported');
					this.swRegistration = await navigator.serviceWorker.register("sw.js");
					let serviceWorker = await navigator.serviceWorker.ready;
					let subscription = await serviceWorker.pushManager.getSubscription();
					if(!subscription){
						console.log('subscribing....');
						const push = await serviceWorker.pushManager.subscribe({ 
							userVisibleOnly: true,
							applicationServerKey: this.applicationServerPublicKey
						})
						console.log('subscribed. ', push);
						await fetch("/push/subscribe", {
							method: "POST",
							headers: {
								'content-type': 'application/json'
							},
							body: JSON.stringify({ sub: push })
						});
					}
					/*
					.then((swReg) => {
						console.log('Service Worker is registered', swReg);
						this.swRegistration = swReg;
						this.initialiseUI();
					})
					.catch((error) => {
						console.error('Service Worker Error', error);
					});*/
				} else {
					console.warn('Push messaging is not supported');
				}
			}
		}catch(e){
			console.error(e);
		}
	},
	pushNotification: function(){
		//this.pushButton = document.querySelector('.js-push-btn');
		this.isSubscribed = false;
		this.swRegistration = null;
		
		if ('serviceWorker' in navigator && 'PushManager' in window) {
			console.log('Service Worker and Push is supported');
			navigator.serviceWorker.register('sw.js')
			.then((swReg) => {
				console.log('Service Worker is registered', swReg);
				this.swRegistration = swReg;
				this.initialiseUI();
			})
			.catch((error) => {
				console.error('Service Worker Error', error);
			});
		} else {
			console.warn('Push messaging is not supported');
			//this.pushButton.textContent = 'Push Not Supported';
		}
	},		
	urlB64ToUint8Array: function(base64String) {
		let padding = '='.repeat((4 - base64String.length % 4) % 4);
		let base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
		let rawData = window.atob(base64);
		let outputArray = new Uint8Array(rawData.length);
		for (let i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);ç
		}
		return outputArray;
	},
	initialiseUI: function() {
		//habilitar accion del boton
		/*this.pushButton.addEventListener('click', () => {
			this.pushButton.disabled = true;
			if (this.isSubscribed) {
				this.unsubscribeUser();
			} else {
				this.subscribeUser();
			}
		});*/
		
		// Set the initial subscription value
		this.swRegistration.pushManager.getSubscription().then((subscription) => {
			this.isSubscribed = !(subscription === null);
			//this.updateSubscriptionOnServer(subscription);
			if (this.isSubscribed) {
				console.log('User IS subscribed.');
			} else {
				console.log('User is NOT subscribed.');
			}
			//this.updateBtn();
		});
	},
	updateBtn: function() {
		if (Notification.permission === 'denied') {
			this.pushButton.textContent = 'Push Messaging Blocked.';
			this.pushButton.disabled = true;
			this.updateSubscriptionOnServer(null);
			return;
		}
		if (this.isSubscribed) {
			this.pushButton.textContent = 'Disable Push Messaging';
		} else {
			this.pushButton.textContent = 'Enable Push Messaging';
		}
		this.pushButton.disabled = false;
	},
	subscribeUser: function() {
		let applicationServerKey = this.urlB64ToUint8Array(this.applicationServerPublicKey);
		this.swRegistration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: applicationServerKey
		})
		.then((subscription) => {
			console.log('User is subscribed:', subscription);
			this.updateSubscriptionOnServer(subscription);
			this.isSubscribed = true;
			this.updateBtn();
		})
		.catch((err) => {
			console.log('Failed to subscribe the user: ', err);
			this.updateBtn();
		});
	},
	updateSubscriptionOnServer: function(subscription) {
		// TODO: Send subscription to application server
		let subscriptionJson = document.querySelector('.js-subscription-json');
		let subscriptionDetails = document.querySelector('.js-subscription-details');
		if (subscription) {
			subscriptionJson.textContent = JSON.stringify(subscription);
			subscriptionDetails.classList.remove('is-invisible');
		} else {
			subscriptionDetails.classList.add('is-invisible');
		}
	},
	unsubscribeUser: function() {
		this.swRegistration.pushManager.getSubscription()
		.then((subscription) => {
			if (subscription) {
				return subscription.unsubscribe();
			}
		})
		.catch((error) => {
			console.log('Error unsubscribing', error);
		})
		.then(() => {
			this.updateSubscriptionOnServer(null);
			console.log('User is unsubscribed.');
			this.isSubscribed = false;
			this.updateBtn();
		});
	}
});