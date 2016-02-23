(function(){
	var dataFile = "data/ur.json";

	var setup = function(){
		this.name("Unemployment","Youth and young adult unemployment rates")

	};
	var redraw = function(){
		console.log(this.data());
	}

	YouthEmployment2016.addView(setup,redraw,dataFile);

})();