(function(){
	var dataFile = "data/dy.json";

	var setup = function(){
		this.name("Disconnected","Disconnected youth in detail")

	};
	var redraw = function(){
		console.log(this.data());
	}

	YouthEmployment2016.addView(setup,redraw,dataFile);

})();