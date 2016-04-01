(function(){
	var dataFile = "data/ur.json";

	var setup = function(){
		this.name("Unemployment","Unemployment rates in detail")
		this.slide.append("div").style({"width":"100%","margin-left":"0%"})
			.append("img").attr("src","wireframes/view1.png").style({"width":"100%", "max-width":"950px"});
	};
	var redraw = function(){
		console.log(this.data());
	}

	YouthEmployment2016.addView(setup,redraw,dataFile);

})();