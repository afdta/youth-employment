(function(){
	var dataFile = "data/dy.json";

	var setup = function(){
		this.name("Employment","Employment rates in detail")
		this.slide.append("div").style({"width":"100%","margin-left":"0%"})
			.append("img").attr("src","wireframes/view2.png").style({"width":"100%", "max-width":"950px"});
	};
	var redraw = function(){
		//console.log(this.data());
	}

	YouthEmployment2016.addView(setup,redraw,dataFile);

})();