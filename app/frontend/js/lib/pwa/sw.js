'use strict';
self.addEventListener('push', function(event) {
	console.log(event.data.json());
	const message = event.data.json();
	const options = {
		body: message.body,
		data: message.uri,
		icon: 'media/img/push/icon.png',
		badge: 'media/img/push/badge.png',
		actions: [{
			action: 'Detail',
			title: 'Detalles'
		}]
	};
	event.waitUntil(self.registration.showNotification(message.title, options));
});

self.addEventListener('notificationclick', function(event) {
	console.log('Notification click Received.', event.notification.data);
	event.notification.close();
	event.waitUntil(clients.openWindow(event.notification.data));
});
