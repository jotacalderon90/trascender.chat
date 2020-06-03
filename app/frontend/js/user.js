app.modules.user = new trascender({
    start: function() {
		this.service_read = this.serviceCreate("GET","api/user");
        this.isLogged = false;
	},
	onload: async function(){
		try{
			await this.read();
			this.isLogged = (this.doc!=null)?true:false;
		}catch(e){
			console.log(e);
		}
	},
	isAdmin: function(){
		return (this.doc && this.doc.roles && this.doc.roles.indexOf("admin")>-1)?true:false;
	}
});