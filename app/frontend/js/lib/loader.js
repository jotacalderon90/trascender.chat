if ('serviceWorker' in navigator) {
	try{
		navigator.serviceWorker.register('js/lib/sw.js?id=index');
		console.log('SW registered');
	}catch(e){
		console.log(e);
	}
}