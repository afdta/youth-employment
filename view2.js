//to do -- undefined in accessors

(function(){
	var dataFile = "data/ur.json";

	var setup = function(){
		var self = this;
		this.name("Unemployment","Unemployment rates in detail");

		this.description("Area to add some overview text. E.g. what is the unemployment rate? What is the employment rate? What does it mean? What does disconnected youth mean? Etc. ...");

		var menu = this.slide.append("div").classed("c-fix",true);
		menu.append("p").text("View the data by:").style("margin","0px");
		var buttons = menu.selectAll("div.generic-button").data([{l:"Sex", c:"Sex"}, 
																 {l:"Race", c:"Race"}, 
																 {l:"Educational attainment", c:"Education"}]);
		buttons.enter().append("div").classed("generic-button",true).style({"padding":"10px 20px"}).append("p");
		buttons.exit().remove();

		buttons.select("p").style({"text-align":"center"}).text(function(d,i){return d.l});

		this.store("buttons", buttons);
		this.store("grid", this.slide.append("div").classed("metro-interactive-grid two-equal", true) );
		this.store("cut","Sex");

		this.store("sync", function(){
			buttons.classed("generic-button-selected",function(d,i){
				return d.c == self.store("cut");
			})
		});

		this.store("sync")();

	};

	var redraw = function(){
		var self = this;

		var chartFN = YouthEmployment2016.ChartFN;
		//var svg = this.store("svg");
		//svg.selectAll("path").data([path]).enter().append("path").attr("d",function(d,i){return d}).style("fill","red").style("stroke","red");
		var dat = this.data();
		var met = this.getMetro();

		var grid = this.store("grid");

		var sync = this.store("sync");

		var getDataAndDraw = function(){
			var cut = self.store("cut");

			var allBarDat = chartFN.ETL(cut, met, dat); 

			var maxmax = d3.max(allBarDat, function(d,i){return d.range[1]});
			var minmin = d3.min(allBarDat, function(d,i){return d.range[0]});
			var rangerange = [minmin, maxmax];

			var allDat = [];
			for(var i=0; i<allBarDat.length; i++){
				allDat.push(allBarDat[i]);
				allDat.push(allBarDat[i]);
			}

			var plots = grid.selectAll("div.grid-box").data(allDat);
			plots.enter().append("div").classed("grid-box",true)
				.style({"padding":"5px 10px 5px 0px"})
				.append("div").classed("inner-grid-div",true)
				.style({"margin":"0px"});
			plots.exit().remove();

			plots.select("div.inner-grid-div").style({background:"#ffffff", "border":"1px solid #aaaaaa", "padding":"5px 10px 10px 10px"})
				.each(function(d,i,a){
				if(i%2===0){
					chartFN.barChart(this, d);
				}
				else{
					chartFN.lineChart(this, d);
				}
			});
		}

		getDataAndDraw(); //initialize

		var buttons = this.store("buttons");
		buttons.on("mousedown",function(d,i){
			self.store("cut", d.c);
			getDataAndDraw();
			sync();
		})

		//console.log(this.changeEvent);
	}

	YouthEmployment2016.addView(setup,redraw,dataFile);

})();