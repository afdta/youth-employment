(function(){
	var dataFile = "data/overall.json";

	//CHARTING FUNCTIONS
	//TO DO: HOW TO SCALE BARS? SEE MAXSHARE in barChart() // ALSO LINE CHARTS YOU MISS VARIATION WHEN SCALING THE SAME
	//NOTE: SHARES NOT EXPRESSED AS DECIMAL FRACTIONS
	//MISSINGS: It's possible to have null data alltogether for a cohort and it's possible to have missing years of data for a cohort
	//IS MOE EVER MISSING WHEN SH IS PRESENT?
	//ENSURE ORDERING OF LINE CHART ELEMENTS IS OK -- WILL NEED GROUPS

		var YE2016 = {};

		//ETL FUNCTIONS
		
		//CORE ETL TO EXTRACT EMP/UNEMP DATA
		//THE CUT ARGUMENT IMPLIES DIFFERENT FILE TYPES (CUT=="NATIVITY" ONLY APPLIES TO DISCONNECTED YOUTH, 
		//													  "OVERALL" TO ONLY OVERALL FILE TYPES)
		YE2016.ETL = function(cut, metro, data, dy){
			try{
				var isdy = !!dy || cut=="dy" ? true : false;
				var sexes = [{c:"F", l:"Female"}, {c:"M", l:"Male"}];
				var races = [{c:"W", l:"White"}, {c:"B", l:"Black"}, {c:"L", l:"Latino"}, {c:"A", l:"Asian"}, {c:"O", l:"Other"}];
				var edus = [{c:"InSch", l:"In school"},
							{c:"LTHS", l:"Less than high school"}, 
							{c:"HS", l:"High school"}, 
							{c:"SC", l:"Some college"},
							{c:"AA", l:"Associate's degree"}, 
							{c:"BAPlus", l:"Bachelor's and above"}];
				var fbs = [{c:"FB", l:"Foreign born"}, {c:"NB", l:"Native born"}];
				var overs = [{c:"er", l:"Employment rate"}, {c:"ur", l:"Unemployment rate"}, {c:"dy", l:"Disconnected youth"}];

				var anae = isdy ? "an" : "ae";

				if(cut=="Sex"){
					var metdat = !isdy ? data[metro] : data.Rates[metro];
					var c1 = sexes.map(function(d,i){
						try{ var row0 = {age:"16to19", dat:metdat["16to19"][d.c].ar[anae]} }
						catch(e){ var row0 = {age:"16to19", dat:null} }

						try{ var row1 = {age:"20to24", dat:metdat["20to24"][d.c].ar[anae]} }
						catch(e){ var row1 = {age:"20to24", dat:null } }

						var cohorts = [row0, row1];

						//if(!isdy){
							try{ var row2 = {age:"25to54", dat:metdat["25to54"][d.c].ar[anae]} }
							catch(e){ var row2 = {age:"25to54", dat:null} }
							cohorts.push(row2);
						//}

						return {group:d, cohorts:cohorts, latest:latest(cohorts, isdy), range:ranges(cohorts).vals };
					});
				}
				else if(cut=="Race"){
					var metdat = !isdy ? data[metro] : data.Rates[metro];
					var c1 = races.map(function(d,i){
						try{ var row0 = {age:"16to19", dat:metdat["16to19"].bs[d.c][anae]} }
						catch(e){ var row0 = {age:"16to19", dat:null} }

						try{ var row1 = {age:"20to24", dat:metdat["20to24"].bs[d.c][anae]} }
						catch(e){ var row1 = {age:"20to24", dat:null} }

						var cohorts = [row0, row1];

						//if(!isdy){
							try{ var row2 = {age:"25to54", dat:metdat["25to54"].bs[d.c][anae]} }
							catch(e){ var row2 = {age:"25to54", dat:null} } 
							cohorts.push(row2);						
						//}

						return {group:d, cohorts:cohorts, latest:latest(cohorts, isdy), range:ranges(cohorts).vals };
					});

				}
				else if(cut=="Education"){
					var metdat = !isdy ? data[metro] : data.Rates[metro];
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

						var cohorts = [row0, row1];

						//if(!isdy){
							try{ 
								var row2 = {age:"25to54", dat:metdat["25to54"].bs.ar[d.c]} 
								if(typeof row2.dat === "undefined"){throw "Bad data"} 
							}
							catch(e){ var row2 = {age:"25to54", dat:null} }
							cohorts.push(row2);
						//}

						return {group:d, cohorts:cohorts, latest:latest(cohorts, isdy), range:ranges(cohorts).vals };
					});
				}
				else if(cut==="Nativity"){
					var metdat = !isdy ? data[metro] : data.Rates[metro];
					//Nativity is only available for disconnected youth, so don't bother with ages 25 to 54
					var c1 = fbs.map(function(d,i){
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

						var cohorts = [row0, row1, {age:"25to54", dat:null}];

						return {group:d, cohorts:cohorts, latest:latest(cohorts, isdy), range:ranges(cohorts).vals };
					});				
				}
				else if(cut==="Overall"){
					var c1 = overs.map(function(d,i){
						var metdat = data[d.c][metro];
						if(d.c=="dy"){var isdy=true}

						try{ 
							var row0 = {age:"16to19", dat:metdat["16to19"]};
							if(typeof row0.dat === "undefined"){throw "Bad data"} 
						}
						catch(e){ var row0 = {age:"16to19", dat:null} }

						try{ 
							var row1 = {age:"20to24", dat:metdat["20to24"]} 
							if(typeof row1.dat === "undefined"){throw "Bad data"} 
						}
						catch(e){ var row1 = {age:"20to24", dat:null} }

						var cohorts = [row0, row1];

						//if(!isdy){
							try{ 
								var row2 = {age:"25to54", dat:metdat["25to54"]} 
								if(typeof row2.dat === "undefined"){throw "Bad data"} 
							}
							catch(e){ var row2 = {age:"25to54", dat:null} }
							cohorts.push(row2);
						//}

						return {group:d, cohorts:cohorts, latest:latest(cohorts, isdy), range:ranges(cohorts).vals };

					});
					
				}
				else{
					var c1 = null;
				}
			}
			catch(e){
				console.log(e)
				var c1 = null;
			}
			return c1;
		}

		//GET THE LATEST YEAR OF DATA FROM EACH OF THE COHORTS (AGE GROUPS)
		function latest(cohorts, dy){

			var isdy = !!dy ? true : false;

			var LATEST = cohorts.map(function(d,i,a){
				var L = null;
				try{
					if(!isdy){
						for(var j=0; j<d.dat.length; j++){
							if(d.dat[j].Y == 14){
								L = d.dat[j];
							}
						}
					}
					else if(d.dat.length > 0){
						L = d.dat[0];
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
					RET.Y = !isdy ? L.Y : 14;
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

		//GET THE RANGE
		function ranges(cohorts){
			var max = null;
			var min = null;
			var maxYr = null;
			var minYr = null;
			for(var i=0; i<cohorts.length; i++){
				try{
					//there will be nulls
					for(var j=0; j<cohorts[i].dat.length; j++){
						var v = cohorts[i].dat[j].SH;
						var pm = cohorts[i].dat[j].SH_M;
						if((v+pm) > max || max===null){
							max = v+pm;
							maxYr = cohorts[i].dat[j].Y;
						}
						if((v-pm) < min || min===null){
							min = v-pm;
							minYr = cohorts[i].dat[j].Y;
						}
					}
				}
				catch(e){
					//no-op
				}
			}
			return {vals: [min, max], yrs: [minYr, maxYr]};
		}


		//END ETL

		YE2016.colors = {
			"16to19":{col:"#0d73df", label:"16–19"},
			"20to24":{col:"#4a97e7", label:"20–24"},
			"25to54":{col:"#b3d3f5", label:"25–54"}
		}

		//data for barChart should look like: [{code:16to19, SH:xx.x, SH_M: yy.y}, {code, SH, SH_M}, {}]
		YE2016.barChart = function(container, data, maxval){
			var chartHeight = 130;
			var topPad = 8;

			var MAXSHARE = !!maxval ? maxval : 100;

			var wrap = d3.select(container).selectAll("div.bar-chart-wrap").data([data]);
			wrap.enter().append("div").classed("bar-chart-wrap", true).append("svg");
			wrap.exit().remove();

			try{
				var title = wrap.selectAll("p").data([data.group.l]);
				title.enter().insert("p", "svg");
				title.exit().remove();
				title.html(function(d,i){return d + ", 2014"}).style("margin","0px");

				var svg = wrap.select("svg").style({"width":"100%", "height":chartHeight+"px"}); //bind data to svg

				var bars = svg.selectAll("g.bar-group").data(function(d,i){return d.latest});

				var BE = bars.enter().append("g").classed("bar-group",true);
				bars.exit().remove();

					BE.append("rect").style("shape-rendering","crispEdges"); //append a rect and text to the enter slection
					BE.append("g");
					BE.append("text");

				bars.attr("transform",function(d,i){return "translate(0," + ((43*(i)+topPad)) +")"})

				bars.select("rect").attr({x:0, y:0, height:"25px"})
					.attr("fill", function(d,i){
						return d.SH===null ? "#f0f0f0" : YE2016.colors[d.code].col;
					})
					.attr("width", function(d,i){
						return d.SH===null ? "1000%" : ((d.SH/MAXSHARE)*100)+"%";
					})

				var MOE = bars.select("g");

				//background bar for margin of error
				var MOE_BACKS = MOE.selectAll("line.moe_back").data(function(d,i){
					return d.SH===null ? [] : [d];
				});
				MOE_BACKS.enter().append("line").classed("moe_back",true);
				MOE_BACKS.exit().remove();
				MOE_BACKS.attr("x1","0%")
				.attr("x2",function(d,i){
					return ((d.SH/MAXSHARE)*100)+"%";
				})
				.attr({"y1":29, "y2":29, "stroke-width":"2px",  "stroke-linecap":"round"})
				.attr("stroke",function(d,i){
					return YE2016.colors[d.code].col;
				})
				.style("shape-rendering","crispEdges");

				//margin of error bars
				var MOE_BARS = MOE.selectAll("line.moe_bar").data(function(d,i){
					return d.SH===null ? [] : [d];
				});
				MOE_BARS.enter().append("line").classed("moe_bar",true);
				MOE_BARS.exit().remove();
				MOE_BARS.attr("x1",function(d,i){
					return (((d.SH-d.SH_M)/MAXSHARE)*100)+"%";
				})
				.attr("x2",function(d,i){
					return (((d.SH+d.SH_M)/MAXSHARE)*100)+"%";
				})
				.attr({"y1":29, "y2":29, stroke:"#E46524", "stroke-width":"2px",  "stroke-linecap":"round"}).style("shape-rendering","crispEdges");;


				//circle endpoints for margin of error bars
				var MOE_CIRC = MOE.selectAll("circle.moe_circle").data(function(d,i){
					return d.SH===null ? [] : [(d.SH-d.SH_M), (d.SH+d.SH_M)];
				});
				MOE_CIRC.enter().append("circle").classed("moe_circle",true);
				MOE_CIRC.exit().remove();
				MOE_CIRC.attr("cx",function(d,i){
					return ((d/MAXSHARE)*100)+"%";
				})
				.attr({"cy":29, stroke:"#E46524", "fill":"#ffffff", "r":"3"}); //.style("shape-rendering","crispEdges");

				/*var MOE_TICKS = MOE.selectAll("line.moe_tick").data(function(d,i){
					return [(d.SH-d.SH_M), (d.SH+d.SH_M)];
				});
				MOE_TICKS.enter().append("line").classed("moe_tick",true);
				MOE_TICKS.exit().remove();
				MOE_TICKS.attr("x1",function(d,i){
					//var off = i==0 ? -1.5 : 1.5
					var off=0;
					return (((d/MAXSHARE)*100)+off)+"%";
				})
				.attr("x2",function(d,i){
					return ((d/MAXSHARE)*100)+"%";
				})
				.attr({"y1":-2, "y2":2, stroke:"#E46524", "stroke-width":"2px",  "shape-rendering":"crispEdges"});*/

				bars.select("text").attr("x", function(d,i){
					return d.SH===null ? "0%" : ((d.SH/MAXSHARE)*100)+"%"
				}).attr({"y":18, "dy":0, "dx":3})
				.style({"font-size":"13px"})
				.text(function(d,i){return d.SH===null ? "NA" : d.SH+"%"})
				.style("fill",function(d,i){
					return d.SH===null ? "#666666" : "#333333";
				});
			}
			catch(e){
				console.log(e);
				wrap.remove();
			}


		}

		YE2016.lineChart = function(container, data, range){
			var chartHeight = 130;
			var bottomPad = 20;
			var leftPad = 35;
			var rightPad = 15;
			var topPad = 10;
			var wrap = d3.select(container).selectAll("div.bar-chart-wrap").data([data]);
				var SE = wrap.enter().append("div").classed("bar-chart-wrap", true).append("svg");
				SE.append("g").classed("x-axis-group",true).attr("transform","translate(0,"+(chartHeight-bottomPad)+")");
				SE.append("g").classed("y-axis-group",true).attr("transform","translate("+leftPad+",0)");

			wrap.exit().remove();

			var RANGE = !!range ? range : data.range;

			try{
				var title = wrap.selectAll("p").data([data.group.l]);
				title.enter().insert("p", "svg");
				title.exit().remove();
				title.html(function(d,i){return d + ", 2008–2014"}).style("margin","0px");

				//svg container -- bind data to svg from wrap
				var svg = wrap.select("svg").style({"width":"100%", "height": chartHeight+"px"});
				
				//axis <g>roups
				var yAxisG = svg.select("g.y-axis-group");
				var xAxisG = svg.select("g.x-axis-group");

				//get chart width;
				var svgBox = svg.node().getBoundingClientRect();
				var chartWidth = Math.round(svgBox.right - svgBox.left);

				//scales and axis generators
				var scaleX = d3.scale.linear().domain([8,14]).range([leftPad, chartWidth-rightPad]);
				var axisX = d3.svg.axis().scale(scaleX).orient("bottom")
									 .tickValues([8, 9, 10, 11, 12, 13, 14]).tickFormat(function(v){return 2000+v})
									 .tickSize(6,6);

				var scaleY = d3.scale.linear().domain(RANGE).range([chartHeight-bottomPad, topPad]);
				var fmt = function(v){return v+"%"}
				var axisY = d3.svg.axis().scale(scaleY).orient("left").tickValues(scaleY.ticks(4)).tickFormat(fmt).tickSize(5,5);
				
				//build the axes -- apply to axis <g>roups
				xAxisG.call(axisX);
				yAxisG.call(axisY);

				xAxisG.selectAll("path").attr("fill","none").attr("stroke","#dddddd").style("shape-rendering","crispEdges");
				yAxisG.selectAll("path").attr("fill","none").attr("stroke","#dddddd").style("shape-rendering","crispEdges");
				xAxisG.selectAll("line").attr("fill","none").attr("stroke","#dddddd").style("shape-rendering","crispEdges");
				yAxisG.selectAll("line").attr("fill","none").attr("stroke","#dddddd").style("shape-rendering","crispEdges");
				xAxisG.selectAll("text").attr("fill","#666666").style("font-size","11px");
				yAxisG.selectAll("text").attr("fill","#666666").style("font-size","11px");

				//line generator
				var val = function(obs){return obs.SH}
				var year = function(obs){return obs.Y}

				var y = function(obs){return scaleY(val(obs))}
				var x = function(obs){return scaleX(year(obs))}
				var line = d3.svg.line().x(x).y(y).defined(function(d,i){return d.SH!==null}); //line not defined for null values

				var lines = svg.selectAll("path.metro-trend-line").data(function(d,i){return d.cohorts});
				lines.enter().append("path").classed("metro-trend-line",true);
				lines.exit().remove();

				lines.attr("stroke",function(d,i){
					return YE2016.colors[d.age].col;
				}).attr({"fill":"none", "stroke-width":"2px"})
				.attr("d",function(d,i){
					return d.dat === null ? "M0,0" : line(d.dat); //if data missing alltogether...
				});

				var dotG = svg.selectAll("g.metro-circle-marker-groups").data(function(d,i){return d.cohorts});
				dotG.enter().append("g").classed("metro-circle-marker-groups",true);
				dotG.exit().remove();

				var dots = dotG.selectAll("circle.metro-circle-marker")
				.data(function(d,i){
					var final = [];
					if(d.dat !== null){
						for(var j=0; j<d.dat.length; j++){
							if(d.dat[j].SH !== null){
								final.push({SH:d.dat[j].SH, Y:d.dat[j].Y, age:d.age});
							}
						}
					}
					return final;
				});
				dots.enter().append("circle").classed("metro-circle-marker",true);
				dots.exit().remove();
				dots.attr("fill",function(d,i){
					return YE2016.colors[d.age].col;
				})
				.attr("cx",function(d,i){
					return scaleX(d.Y);
				})
				.attr("cy",function(d,i){
					return scaleY(d.SH);
				})
				.attr("r",3);




			}
			catch(e){
				console.log(e);
				wrap.remove();
			}


		}


		//DYCHAR
		YE2016.dyChar = function(container, data, range){
			var chartHeight = 130;
			
			var wrap = d3.select(container).selectAll("div.bar-chart-wrap").data([data]);
			var SE = wrap.enter().append("div").classed("bar-chart-wrap", true).append("svg");
			wrap.exit().remove();

			try{
				var title = wrap.selectAll("p").data([data.group.l]);
				title.enter().insert("p", "svg");
				title.exit().remove();
				title.html(function(d,i){return d}).style("margin","0px");

				//svg container -- bind data to svg from wrap
				var svg = wrap.select("svg").style({"width":"100%", "height": chartHeight+"px"});
			}
			catch(e){
				console.log(e);
				wrap.remove();
			}


		}
		//END DY CHAR
	//

	YouthEmployment2016.ChartFN = YE2016; //store in the global scope for subsequent views to use

	var setup = function(){
		this.name("Overall","Overall labor market outcomes");
		this.description("Area to add some overview text. E.g. what is the unemployment rate? What is the employment rate? What does it mean? What does disconnected youth mean? Etc. ...");
		//this.store("svg",this.slide.append("svg").style("width","100%").style("height","500px"));
		this.store("grid", this.slide.append("div").classed("metro-interactive-grid two-equal", true) );
	};

	var redraw = function(){
		var self = this;

		var chartFN = YouthEmployment2016.ChartFN;
		//var svg = this.store("svg");
		//svg.selectAll("path").data([path]).enter().append("path").attr("d",function(d,i){return d}).style("fill","red").style("stroke","red");
		var dat = this.data();
		var met = this.getMetro();

		var grid = this.store("grid");

		var getDataAndDraw = function(){

			var allBarDat = chartFN.ETL("Overall", met, dat); 

			var maxmax = d3.max(allBarDat, function(d,i){return d.range[1]});
			var minmin = d3.min(allBarDat, function(d,i){return d.range[0]});
			var rangerange = [minmin, maxmax];

			var allDat = [];
			for(var i=0; i<allBarDat.length; i++){
				allDat.push(allBarDat[i]);
				if(i<allBarDat.length-1)allDat.push(allBarDat[i]);
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

		//console.log(this.changeEvent);
	}

	YouthEmployment2016.addView(setup,redraw,dataFile);

})();