(function(){
	var dataFile = "data/er.json";


				//temp
				var scaleY = d3.scale.linear().domain([0,10]).range([200, 0]);
				var scaleX = d3.scale.linear().domain([0,10]).range([0, 600]);
				var y0 = function(obs){return scaleY(obs[1])}
				var y1 = function(obs){return scaleY(obs[1])+10}
				var x = function(obs){return scaleX(obs[0])}
				var line = d3.svg.area().x(x).y0(y0).y1(y1);
				var path = line([[0,0],[1,2]]);
				console.log(path);

	var setup = function(){
		this.name("Overall","Overall state of the youth and young adult labor market");
		this.description("Area to add some overview text. E.g. what is the unemployment rate? What is the employment rate? What does it mean? What does disconnected youth mean? Etc. ...");
		//this.store("svg",this.slide.append("svg").style("width","100%").style("height","500px"));
		this.slide.append("div").style({"width":"100%","margin-left":"0%"})
			.append("img").attr("src","wireframes/view0.png").style({"width":"100%", "max-width":"950px"});

	};
	var redraw = function(){
		//var svg = this.store("svg");
		//svg.selectAll("path").data([path]).enter().append("path").attr("d",function(d,i){return d}).style("fill","red").style("stroke","red");
		//console.log(this.data());
		//console.log(this.changeEvent);
	}

	YouthEmployment2016.addView(setup,redraw,dataFile);

})();