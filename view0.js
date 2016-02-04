(function(){
	var dataFile = null;


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
		this.name("view0","Initial view of youth employment")
		this.store("svg",this.slide.append("svg").style("width","100%").style("height","500px"));

	};
	var redraw = function(){
		var svg = this.store("svg");
		svg.selectAll("path").data([path]).enter().append("path").attr("d",function(d,i){return d}).style("fill","red").style("stroke","red");
	}

	YouthEmployment2016.addView(setup,redraw,dataFile);

})();


(function(){
	var dataFile = null;

	var setup = function(){
		this.name("view1","Second view of youth employment")

	};
	var redraw = function(){
		console.log(this.data());
	}

	YouthEmployment2016.addView(setup,redraw,dataFile);

})();