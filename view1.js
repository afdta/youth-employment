//to do -- undefined in accessors
//View 1 is the archetype for other views
	//Disconnected youth changes:
	// ETL needs to indicate it's dy
	// There are no ETL line charts
	//   rm the code that calls line chart function
	//   only push one obs onto allDat
	// Need to add in overview data
	// Menu shouldn't include educational attainment edit button1 data: {l:"Nativity", c:"Nativity"}
	// When creating table data (tableDat), 2 changes
	//   for(var p in dat.Rates)
	//   if(dat.Rates.hasOwnProperty(p))
	//   add a truthy last argument to the 2 ETL calls and to the barchart call
	// remove 25-54 from header data and 
	// change td widths accordingly to 50/25
	// make sure legend doesn't include 25-54 y/o
	// maxval for bar charts should be 35 (also change this in overview)

	// add this characteristics chart wrap before the "grid": this.store("characteristics", gridWrap.append("div").classed("c-fix",true ) );
	// add legend after adding characteristics
	// add titles separating two sections

(function(){
	var dataFile = "data/er.json";

	var setup = function(){

		var self = this;
		this.name("Employment","Employment rates by sex, race, and highest level of educational attainment");

		//this.description("Area to add some overview text. E.g. what is the unemployment rate? What is the employment rate? What does it mean? What does disconnected youth mean? Etc. ...");

		var selectWrap = this.slide.append("div").style({"margin-bottom":"15px"}).classed("c-fix",true);
		selectWrap.append("p").classed("text-accent-uc1",true).text("Select a metro area");
		YouthEmployment2016.selectMenu(selectWrap.append("div").node());

		var menuWrap = this.slide.append("div").classed("c-fix",true).style("background-color","#ebebeb")
																	 .style("margin","0px 10px 15px 0px")
																	 .style("padding","10px");

		this.store("gridTitle", menuWrap.append("p").text("...").style({"margin":"0px 3px", "font-weight":"bold"}));

			var menu0 = menuWrap.append("div").style({float:"left", "margin":"5px 30px 5px 0px", "padding":"3px", "border-top":"0px dotted #aaaaaa"}).classed("c-fix",true);
			var menu1 = menuWrap.append("div").style({float:"left", "margin":"5px 30px 5px 0px", "padding":"3px", "border-top":"0px dotted #aaaaaa"}).classed("c-fix",true);
			var tableMenu = menuWrap.append("div").style({float:"left", "margin":"5px 0px 5px 0px", "padding":"3px", "border-top":"0px dotted #aaaaaa"}).classed("c-fix",true);
				tableMenu.append("p").text("Select a group").classed("text-accent-uc1",true);

		menu0.append("p").text("View data in").classed("text-accent-uc1",true);
		var buttons0 = menu0.selectAll("div.generic-button").data([{"l":"Charts", c:"Charts"}, {"l":"Tables", "c":"Tables"}]);
		buttons0.enter().append("div").classed("generic-button",true).append("p");
		buttons0.exit().remove();

		buttons0.select("p").style("text-align","center").text(function(d,i){return d.l});

		menu1.append("p").text("Group data by").classed("text-accent-uc1",true);
		var buttons1 = menu1.selectAll("div.generic-button").data([{l:"Sex", c:"Sex"}, 
																 {l:"Race", c:"Race"}, 
																 {l:"Educational attainment", c:"Education"}]);
		buttons1.enter().append("div").classed("generic-button",true).append("p");
		buttons1.exit().remove();

		buttons1.select("p").style({"text-align":"center"}).text(function(d,i){return d.l});

		var gridWrap = this.slide.append("div");

		YouthEmployment2016.ChartFN.legend(gridWrap.append("div").node()); //add a legend
		
		var tableWrap = this.slide.append("div").classed("out-of-flow",true).style("margin-top","10px");
		var tableNote = tableWrap.append("p").style({"font-size":"13px", "font-style":"italic", "color":"#666666", "margin":"1em 0px"}).text("Click on the column headers to sort and rank the metro areas in the table. Margins of error are listed in parentheses next to each value.");
		var tableWrapHeader = tableWrap.append("div").classed("as-table",true);
		var tableWrapScroll = tableWrap.append("div").style({"max-height":"500px", "overflow-y":"auto", "border":"1px solid #aaaaaa", "border-width":"1px 0px"});

		this.store("buttons0", buttons0);
		this.store("buttons1", buttons1);
		this.store("grid", gridWrap.append("div").classed("metro-interactive-grid two-equal", true) );
		this.store("gridWrap", gridWrap);
		this.store("tableWrap", tableWrap);
		this.store("htable", tableWrapHeader);
		this.store("table", tableWrapScroll.append("div").classed("as-table",true));
		this.store("tableSortIndex", 0); //geo
		this.store("tableSortDirection", -1); //ascending
		
		this.store("cut","Sex");
		this.store("format", "Charts");
		this.store("group", null); //for the table
		this.store("tableMenu", tableMenu); //hold  group selection buttons

		//sync button state and show/hide table or chart containers -- doesn't change state variables
		this.store("sync", function(){
			menuWrap.style("visibility","visible");
			var format = self.store("format");

			//which menu sections to show/hide?
			tableMenu.classed("out-of-flow", format==="Charts"); //no need for the tableMenu when Charts selected

			gridWrap.classed("out-of-flow", format==="Tables");
			tableWrap.classed("out-of-flow", format==="Charts");

			buttons0.classed("generic-button-selected",function(d,i){
				return d.c == self.store("format");
			});

			buttons1.classed("generic-button-selected",function(d,i){
				return d.c == self.store("cut");
			});

			//buttons in the tableMenu--group--are synced in the getDataAndDraw() function
		});

		gridWrap.append("p").text("Notes: Each margin of error represents the 90% confidence interval around an estimated value. Data on some cross-tabulations are not available due to small sample size. This is more common in smaller metropolitan areas and small sub-populations.").style({"margin":"10px 0px 0px 0px"});

	};

	var redraw = function(){
		var self = this;

		var chartFN = YouthEmployment2016.ChartFN;
		
		var dat = this.data();
		var met = this.getMetro();
		var metName = this.lookup[met][0].CBSA_Title;
		var metNameFull = met=="0" ? metName : metName+" metropolitan area";
		this.store("gridTitle").text("Employment rates in the " + metNameFull + " by sex, race, and highest level of educational attainment");

		var grid = this.store("grid");
		var sync = this.store("sync");

		var getDataAndDraw = function(){
			var cut = self.store("cut");
			var format = self.store("format");
			var group = self.store("group");

			var allBarDat = chartFN.ETL(cut, met, dat); 
			var MinMax = [d3.min(allBarDat, function(d){return d.range[0]}), 
						  d3.max(allBarDat, function(d){return d.range[1]})];

			if(format=="Charts"){

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
						chartFN.lineChart(this, d, MinMax);
					}
				});
			}
			else if(format=="Tables"){
				var tableMenu = self.store("tableMenu");
				var buttons = tableMenu.selectAll("div.generic-button").data(allBarDat);
				buttons.enter().append("div").classed("generic-button",true).append("p");
				buttons.exit().remove();

				buttons.select("p").text(function(d,i){return d.group.l});

				var group = self.store("group");
				if(group===null){
					group = allBarDat[0].group.c;
					self.store("group",group);
				}

				buttons.classed("generic-button-selected", function(d,i){
					return d.group.c === group;
				})

				buttons.on("mousedown",function(d,i){
					self.store("group", d.group.c);
					getDataAndDraw();
				})

				var tableDat = [];
				(function(){
					for(var p in dat){
						if(dat.hasOwnProperty(p)){
							var row = chartFN.ETL(cut, p, dat);
							for(var i=0; i<row.length; i++){
								if(row[i].group.c===group){
									tableDat.push({geo:self.lookup[p][0], d:row[i]});
									break;
								}
							}
						}
					}	
				})();

				var pos = {"16to19":1, "20to24":2, "25to54":3};
				var tableDat2 = tableDat.map(function(d,i,a){
					var row = [{val:d.geo.CBSA_Code, label:d.geo.CBSA_Title}];
					var L = d.d.latest;
					for(var j=0; j<L.length; j++){
						var p = pos[L[j].code];
						row[p] = {val:L[j].SH, label: L[j].SH===null ? '<span style="color:#888888;font-size:0.8em;">N/A</span>' : ((L[j].SH+"%")+( ' <span style="color:#888888;font-size:0.8em;">(+/- '+L[j].SH_M+"%)"))};
					}
					return row;
				});

				var table = self.store("table");
				var htable = self.store("htable");

				//TABLE HEADER
				var headerData = [{label:"<b>Metropolitan area</b>"}, 
								  {label:"<b>16–19</b>"}, 
								  {label:"<b>20–24</b>"}, 
								  {label:"<b>25–54</b>"}]

				var trh = htable.selectAll("div.as-table-row").data([headerData]);
				trh.enter().append("div").classed("as-table-row",true);
				trh.exit().remove();

				var tdh = trh.selectAll("div.as-table-cell").data(function(d,i){return d});
				tdh.enter().append("div").classed("as-table-cell disable-text-select",true).append("p");
				tdh.exit().remove();

				tdh.style("width",function(d,i){return i==0 ? "36%" : "18%"}).style("cursor","pointer");

				tdh.select("p").html(function(d,i){return d.label});
				//END TABLE HEADER

				//DRAW TABLE BODY
				var drawTable = function(){
					//sort info
					var si = self.store("tableSortIndex");
					var sd = self.store("tableSortDirection");
					tableDat2.sort(function(a,b){
						var aval = a[si].val;
						var bval = b[si].val;
						var bvalTB = b[0].val; //tie break is alpha
						var avalTB = a[0].val;
						if(avalTB=="0"){return 1}
						else if(bvalTB=="0"){return -1}
						else if(aval===null && bval===null){return 0}
						else if(aval===bval){return avalTB - bvalTB}
						else if(aval===null){return 1}
						else if(bval===null){return -1}
						else{
							return (bval-aval)*sd;
						}
					});

					//add in rankings -- U.S. is always 101 (see sort above)
					for(var s=0; s<tableDat2.length; s++){
						if(s===0){
							tableDat2[s][0].rank = 1;
						}
						else if(tableDat2[s][si].val==tableDat2[s-1][si].val){
							tableDat2[s][0].rank = tableDat2[s-1][0].rank
						}
						else{
							tableDat2[s][0].rank = s+1;
						}
					}

					var tr = table.selectAll("div.as-table-row").data(tableDat2);
					tr.enter().append("div").classed("as-table-row",true);
					tr.exit().remove();

					var td = tr.selectAll("div.as-table-cell").data(function(d,i){return d});
					td.enter().append("div").classed("as-table-cell border-bottom",true).append("p");
					td.exit().remove();

					tr.classed("row-is-highlighted",function(d,i){
						return d[0].val == met;
					});
					tr.classed("row-is-bolded", function(d,i){
						return d[0].val == "0";
					});

					td.style("width",function(d,i){return i==0 ? "36%" : "18%"})

					td.select("p").html(function(d,i){
						if(i===0){
							var txt = (d.val != "0") ? '<span style="font-size:0.8em; color:#888888">'+d.rank+'. </span>' + d.label : d.label; //don't print U.S. "rank"
						}
						else{
							var txt = d.label;
						}
						return txt;
					});

					//match widths
					setTimeout(function(){
						try{
							var trbox = tr.node().getBoundingClientRect();
							var trwidth = trbox.right - trbox.left;
							htable.style("width",trwidth+"px");	
						}
						catch(e){

						}
					},0);

					chartFN.scrollToTop(met, tr);
				}

				var syncSort = function(){
					tdh.classed("sort-asc",function(d,i){
						return i===self.store("tableSortIndex") && self.store("tableSortDirection")==-1;
					});
					tdh.classed("sort-desc",function(d,i){
						return i===self.store("tableSortIndex") && self.store("tableSortDirection")==1;
					});
					drawTable()				
				}
				syncSort();

				tdh.on("mousedown",function(d,i){
					var si = self.store("tableSortIndex");
					var sd = self.store("tableSortDirection");
					if(i===si){
						self.store("tableSortDirection", sd*-1);
					}
					else{
						self.store("tableSortDirection", -1);
						self.store("tableSortIndex", i);
					}
					syncSort();
				});
			}
		}

		sync(); //sync accompanies getDataAndDraw everywhere except when a new group is selected, in which case it isn't needed because those buttons are synced in getdataAndDraw and format doesn't change
		getDataAndDraw(); //initialize

		var buttons0 = this.store("buttons0");
		buttons0.on("mousedown",function(d,i){
			self.store("format", d.c);
			sync();
			getDataAndDraw();
		})

		var buttons1 = this.store("buttons1");
		buttons1.on("mousedown",function(d,i){
			self.store("cut", d.c);
			self.store("group", null); //reset the group selection
			sync();
			getDataAndDraw();
		})

	}

	YouthEmployment2016.addView(setup,redraw,dataFile);

})();