(function(){
	var dataFile = "data/dy.json";

	var setup = function(){
		this.name("Map","Variations in labor market outcomes by metropolitan area")

	};
	var redraw = function(){
		//console.log(this.data());
	}

	YouthEmployment2016.addView(setup,redraw,dataFile);

})();