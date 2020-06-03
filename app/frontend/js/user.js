app.modules.user = new trascender({
    start: async function() {
        this.isLogged = false;
		this.service_read = this.serviceCreate("GET","api/user");
		await this.read();
		this.isLogged = (this.doc!=null)?true:false;
	},
	isAdmin: function(){
		return (this.doc && this.doc.roles && this.doc.roles.indexOf("admin")>-1)?true:false;
	}
});