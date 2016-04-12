//to do -- undefined in accessors

(function(){
	var dataFile = "data/er.json";

	var setup = function(){
		var self = this;
		this.name("Employment rates","Employment rates in detail");

		this.description("Area to add some overview text. E.g. what is the employment rate? What is the employment rate? What does it mean? What does disconnected youth mean? Etc. ...");

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

		//for bar charts, just pull latest year
		var latest = function(cohorts){

			var LATEST = cohorts.map(function(d,i,a){
				var L = null;
				try{
					for(var j=0; j<d.dat.length; j++){
						if(d.dat[j].Y == 14){
							L = d.dat[j];
						}
					}
				}
				catch(e){
					var L = null;
				}

				try{
					if(!L || L.SH===null){throw "Bad Dat"}
					var RET = {}; //copy data
					RET.SH = L.SH;
					RET.SH_M = L.SH_M;
					RET.Y = L.Y;
					RET.code = d.age;
				}
				catch(e){
					//bars still show up if data is null
					var RET = {SH:null, SH_M:null, y:2014, code:d.age};
				}

				return RET;
			});

			return LATEST;
		}

		//get latest value here... handle missings
		var accessor = function(){

			var dat = self.data();
			var metdat = dat[self.getMetro()];

			var cut = self.store("cut");
			var sexes = [{c:"F", l:"Female"}, {c:"M", l:"Male"}];
			var races = [{c:"W", l:"White"}, {c:"B", l:"Black"}, {c:"L", l:"Latino"}, {c:"A", l:"Asian"}, {c:"O", l:"Other"}];
			var edus = [{c:"InSch", l:"In school"},
						{c:"LTHS", l:"Less than high school"}, 
						{c:"HS", l:"High school"}, 
						{c:"SC", l:"Some college"},
						{c:"AA", l:"Associate's degree"}, 
						{c:"BAPlus", l:"Bachelor's and above"}]

			if(cut=="Sex"){
				var dat = [];
				var c1 = sexes.map(function(d,i){
					try{ var row0 = {age:"16to19", dat:metdat["16to19"][d.c].ar.ae} }
					catch(e){ var row0 = {age:"16to19", dat:null} }

					try{ var row1 = {age:"20to24", dat:metdat["20to24"][d.c].ar.ae} }
					catch(e){ var row1 = {age:"20to24", dat:null } }

					try{ var row2 = {age:"25to54", dat:metdat["25to54"][d.c].ar.ae} }
					catch(e){ var row2 = {age:"25to54", dat:null} }

					var cohorts = [row0, row1, row2];

					return {group:d, cohorts:cohorts, latest:latest(cohorts) };
				});
			}
			else if(cut=="Race"){
				var c1 = races.map(function(d,i){
					try{ var row0 = {age:"16to19", dat:metdat["16to19"].bs[d.c].ae} }
					catch(e){ var row0 = {age:"16to19", dat:null} }

					try{ var row1 = {age:"20to24", dat:metdat["20to24"].bs[d.c].ae} }
					catch(e){ var row1 = {age:"20to24", dat:null} }

					try{ var row2 = {age:"25to54", dat:metdat["25to54"].bs[d.c].ae} }
					catch(e){ var row2 = {age:"25to54", dat:null} }

					var cohorts = [row0, row1, row2];

					return {group:d, cohorts:cohorts, latest:latest(cohorts) };
				});

			}
			else if(cut=="Education"){
				var c1 = edus.map(function(d,i){
					try{ 
						var row0 = {age:"16to19", dat:metdat["16to19"].bs.ar[d.c]};
						if(typeof row0.dat === "undefined"){throw "Bad data"} 
					}
					catch(e){ var row0 = {age:"16to19", dat:null} }

					try{ 
						var row1 = {age:"20to24", dat:metdat["20to24"].bs.ar[d.c]} 
						if(typeof row1.dat === "undefined"){throw "Bad data"} 
					}
					catch(e){ var row1 = {age:"20to24", dat:null} }

					try{ 
						var row2 = {age:"25to54", dat:metdat["25to54"].bs.ar[d.c]} 
						if(typeof row2.dat === "undefined"){throw "Bad data"} 
					}
					catch(e){ var row2 = {age:"25to54", dat:null} }

					var cohorts = [row0, row1, row2];

					return {group:d, cohorts:cohorts, latest:latest(cohorts)};
				});
			}
			else{
				var c1 = null;
			}
		return c1;
		}

		this.store("accessor", accessor);

	};

	var redraw = function(){
		var self = this;

		var chartFN = YouthEmployment2016.ChartFN;
		//var svg = this.store("svg");
		//svg.selectAll("path").data([path]).enter().append("path").attr("d",function(d,i){return d}).style("fill","red").style("stroke","red");
		var dat = this.data();
		var met = this.getMetro();

		var grid = this.store("grid");
		var acc = this.store("accessor");

		var sync = this.store("sync");

		var getDataAndDraw = function(){
			var allBarDat = acc(); 
			var allLineDat = acc();

			var allDat = [];
			for(var i=0; i<allBarDat.length; i++){
				allDat.push(allBarDat[i]);
				allDat.push(allLineDat[i]);
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
					chartFN.barChart(this, d, 100);
				}
				else{
					chartFN.lineChart(this, d, "Title");
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