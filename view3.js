
(function(){
	var dataFile = "data/dy.json";
	//var dataFile = "/~/media/multimedia/interactives/2016/YouthEmployment/data/dy.json";

	var setup = function(){

		var self = this;
		this.name("Disconnected","Characteristics of disconnected youth and rates of disconnected youth by sex, race, and nativity");

		this.description('The terms "disconnected youth" or "opportunity youth" refer to young people not working and not in school. Please see the methodology section of the paper for more details about how these figures were derived.');

		var selectWrap = this.slide.append("div").style({"margin-bottom":"15px"}).classed("c-fix",true);
		selectWrap.append("p").classed("text-accent-uc1",true).text("Select a metro area");
		YouthEmployment2016.selectMenu(selectWrap.append("div").node());

		var menuWrap = this.slide.append("div").classed("c-fix",true).style("background-color","#ebebeb")
																	 .style("margin","0px 10px 15px 0px")
																	 .style("padding","10px");

		this.store("gridTitle", menuWrap.append("p").text("...").style({"margin":"0px 3px", "font-weight":"bold"}));
		this.store("gridSubTitle", menuWrap.append("p").text("...").style({"margin":"0px 3px 5px 3px", "font-weight":"normal"}));

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
																 {l:"Nativity", c:"Nativity"}]);
		buttons1.enter().append("div").classed("generic-button",true).append("p");
		buttons1.exit().remove();

		buttons1.select("p").style({"text-align":"center"}).text(function(d,i){return d.l});

		var gridWrap = this.slide.append("div").classed("zee10",true);;
		YouthEmployment2016.ChartFN.legend(gridWrap.append("div").node(), "isdy"); //add a legend
		
		var tableWrap = this.slide.append("div").classed("out-of-flow zee10",true).style("margin-top","10px");
		var tableNote = tableWrap.append("p").text("Time period: 2012-14 (pooled) ")
								.append("span").style({"font-size":"13px", "font-style":"italic", "color":"#666666", "margin":"1em 0px"})
								.html(" • Click on the column headers to sort/rank the metro areas. Margins of error are listed in parentheses next to each value.");
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
		this.store("group", null);
		this.store("tableMenu", tableMenu);

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


		//characteristics of dy

		var charWrap = this.slide.append("div").style("margin","60px 0px 5px 0px");
		var charHeader = charWrap.append("div").style({"padding":"4px", "background-color":"#ebebeb", "margin-right":"10px"});
		var charTextWrap = charHeader.append("div").classed("c-fix",true).style({padding:"4px 10px"}).classed("c-fix",true);
		var charButtonWrap = charHeader.append("div").classed("c-fix",true).style({padding:"4px 10px"}).classed("c-fix",true);
		var charGrid = charWrap.append("div").classed("metro-interactive-grid two-equal", true).style({"margin":"10px 0px 20px 0px"});

		this.store("charcut", "Sex");
		this.store("charGrid", charGrid);
		this.store("charTextWrap", charTextWrap);


		//characteristics menu/buttons
		var charButtons = charButtonWrap.selectAll("div.generic-button").data([{code:"Sex", label:"Are male vs. female?"},
																			 {code:"Race", label:"Are white, black, Latino, or Asian?"},
																			 {code:"Nativity", label:"Are foreign born vs. native born?"},
																			 {code:"Edu", label:"Have a high school diploma?"}]);
		charButtons.enter().append("div").classed("generic-button",true).append("p");
		charButtons.exit().remove();

		charButtons.select("p").text(function(d,i){return d.label});

		this.store("charButtons", charButtons);

		this.store("charsync", function(){
			charButtons.classed("generic-button-selected", function(d,i){
				return d.code == self.store("charcut");
			});
		});
		
		this.slide.append("p").text("Notes: Each margin of error represents the 90% confidence interval around an estimated value. In some cases, margins of error are very small and are not visible in the charts above. Data on some cross-tabulations are not available due to small sample size. This is more common in smaller metropolitan areas and small sub-populations.").style({"margin":"10px 0px 0px 0px"});
		this.slide.append("p").text("Source: Brookings analysis of pooled 2012-2014 American Community Survey microdata.");	
	
	};

	var redraw = function(){
		var self = this;

		var chartFN = YouthEmployment2016.ChartFN;
		var dat = this.data();
		var met = this.getMetro();
		var metName = this.lookup[met][0].CBSA_Title;
		var metNameFull = met=="0" ? metName : metName+" metropolitan area";
		this.store("gridTitle").text("Rates of disconnected youth in the "+ metNameFull +" by sex, race, and nativity");
		this.store("gridSubTitle").text("Who is most at risk? These data demonstrate which demographic groups have high or low rates of disconnection.");

		var grid = this.store("grid");
		var sync = this.store("sync");
		var charGrid = this.store("charGrid");

		var charTextWrap = this.store("charTextWrap");

		var getDataAndDraw = function(){
			var cut = self.store("cut");
			var format = self.store("format");
			var group = self.store("group");

			var allBarDat = chartFN.ETL(cut, met, dat, "isdy"); 

			if(format=="Charts"){

				var allDat = [];
				for(var i=0; i<allBarDat.length; i++){
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

						chartFN.barChart(this, d, 35, "isdy");
	
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
					for(var p in dat.Rates){
						if(dat.Rates.hasOwnProperty(p)){
							var row = chartFN.ETL(cut, p, dat, "isdy");
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
								  {label:"<b>20–24</b>"}]

				var trh = htable.selectAll("div.as-table-row").data([headerData]);
				trh.enter().append("div").classed("as-table-row",true);
				trh.exit().remove();

				var tdh = trh.selectAll("div.as-table-cell").data(function(d,i){return d});
				tdh.enter().append("div").classed("as-table-cell disable-text-select",true).append("p");
				tdh.exit().remove();

				tdh.style("width",function(d,i){return i==0 ? "50%" : "25%"}).style("cursor","pointer");

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

					td.style("width",function(d,i){return i==0 ? "50%" : "25%"})

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
			} //end table code

		}


		var getCharAndDraw = function(){
			//characteristics data, always displayed
			var T = "<b>Characteristics of disconnected youth in the " + (met=="0" ? metName : metName+" metropolitan area</b>" );

			var charText = charTextWrap.selectAll("p.characteristics-description").data([T, "These data describe the demographics of disconnected youth. Within the disconnected youth population, what share:"]);
			charText.enter().append("p").classed("characteristics-description", true);
			charText.exit().remove();

			charText.html(function(d,i){return d}).style({"margin":"0px"});
			var cut = self.store("charcut");

			try{
				var DAT = dat.Char[cut][met];
				var DAT2 = [DAT["16to19"][0], DAT["20to24"][0]]; //double checked this data structure				
			}
			catch(e){
				var DAT2 = [];
			}

			var plots = charGrid.selectAll("div.grid-box").data(DAT2);
			plots.enter().append("div").classed("grid-box",true)
				.style({"padding":"5px 10px 5px 0px"})
				.append("div").classed("inner-grid-div",true)
				.style({"margin":"0px"});
			plots.exit().remove();

			var maps = {
				"Sex": [{code:"S_male", label:"Male", moe:"MOE_Smale"}, {code:"S_female", label:"Female", moe:"MOE_Sfemale"}],
				"Race": [{code:"S_White", label:"White", moe:"MOE_Swhite"}, 
						 {code:"S_Black", label:"Black", moe:"MOE_Sblack"}, 
						 {code:"S_Latino", label:"Latino", moe:"MOE_Slatino"}, 
						 {code:"S_Asian", label:"Asian", moe:"MOE_Sasian"}, 
						 {code:"S_Other", label:"Other", moe:"MOE_Sother"}
						],
				"Nativity": [{code:"S_FB", label:"Foreign born", moe:"MOE_Sfb"}, {code:"S_NB", label:"Native born", moe:"MOE_Snb"}],
				"Edu": [{code:"S_sc", label:"With a high school diploma and some college", moe:"MOE_Ssc"}, 
						{code:"S_hs", label:"With a high school diploma", moe:"MOE_Shs"}, 
						{code:"S_lths", label:"Less than a high school diploma", moe:"MOE_Slths"}
						]	
			}

			//reviewed this plot code on 5/18
			plots.select("div.inner-grid-div").style({background:"#ffffff", "border":"1px solid #aaaaaa", "padding":"5px 10px 10px 10px"})
				.each(function(dat,i,a){
					var thiz = d3.select(this);

					var title = thiz.selectAll("p").data([dat.age_recode]);
					title.enter().append("p");
					title.exit().remove();
					title.text(function(d,i){
						if(d==="16to19"){return "Share of disconnected youth aged 16–19"}
						else if(d==="20to24"){return "Share of disconnected youth aged 20–24"}
						else{return ""}
					})
					.style("margin","0px");

					var mapped = maps[cut].map(function(d,i,a){
						try{
							var b = {};
							b.val = dat[d.code];
							b.moe = dat[d.moe];
							b.group = d.label;
						}
						catch(e){
							var b = null;
						}
						return b;
					});
					var max = 1.45;

					var svg = thiz.selectAll("svg").data([mapped]);
					svg.enter().append("svg");
					svg.exit().remove();
					svg.style({"width":"130%", "height":((48*(mapped.length))+12)+"px"});

					var bars = svg.selectAll("g.bar-group").data(function(d,i){return d});

					var BE = bars.enter().append("g").classed("bar-group",true);
					bars.exit().remove();

						BE.append("rect").style("shape-rendering","crispEdges");
						BE.append("g");

					bars.attr("transform",function(d,i){return "translate(0," + ((48*i)+12) +")"})

					bars.select("rect").attr({x:0, y:15, height:"16px"})
						.attr("fill", function(d,i){
							return d.val==null ? "#f0f0f0" : "#89B233";
						})
						.attr("width", function(d,i){
							return d.val==null ? ((1/max)*100)+"%" : ((d.val/max)*100)+"%";
						})

					var MOE = bars.select("g");

					//background bar for margin of error
					var MOE_BACKS = MOE.selectAll("line.moe_back").data(function(d,i){
						return d.val==null ? [] : [d];
					});
					MOE_BACKS.enter().append("line").classed("moe_back",true);
					MOE_BACKS.exit().remove();
					MOE_BACKS.attr("x1","0%")
					.attr("x2",function(d,i){
						return ((d.val/max)*100)+"%";
					})
					.attr({"y1":35, "y2":35, "stroke-width":"2px",  "stroke-linecap":"round"})
					.attr("stroke",function(d,i){
						return "#89B233";
					})
					.style("shape-rendering","crispEdges");

					//margin of error bars
					var MOE_BARS = MOE.selectAll("line.moe_bar").data(function(d,i){
						return d.val==null || d.moe==null ? [] : [d];
					});
					MOE_BARS.enter().append("line").classed("moe_bar",true);
					MOE_BARS.exit().remove();
					MOE_BARS.attr("x1",function(d,i){
						return (((d.val-d.moe)/max)*100)+"%";
					})
					.attr("x2",function(d,i){
						return (((d.val+d.moe)/max)*100)+"%";
					})
					.attr({"y1":35, "y2":35, stroke:"#E46524", "stroke-width":"2px",  "stroke-linecap":"round"}).style("shape-rendering","crispEdges");;


					//circle endpoints for margin of error bars
					var MOE_CIRC = MOE.selectAll("circle.moe_circle").data(function(d,i){
						return d.val==null || d.moe==null ? [] : [(d.val-d.moe), (d.val+d.moe)];
					});
					MOE_CIRC.enter().append("circle").classed("moe_circle",true);
					MOE_CIRC.exit().remove();
					MOE_CIRC.attr("cx",function(d,i){
						return ((d/max)*100)+"%";
					})
					.attr({"cy":35, stroke:"#E46524", "fill":"#ffffff", "r":"3"});

					var text = bars.selectAll("text").data(function(d,i){
						return [d.group, d.val==null ? null : d.val];
					});
					text.enter().append("text");
					text.exit().remove();

					text.attr("x", function(d,i){
						return i==0 ? 0 : (d==null ? 0 : ((d/max)*100)+"%");
					})
					.attr("y", function(d,i){
						return i==0 ? 10 : 28;
					})
					.style("font-size","13px")
					.attr("dx",function(d,i){return i==0 ? 0 : 5})
					.text(function(d,i){
						return i==0 ? d : (d == null ? "NA" : self.formats.pct1(d));
					})
					.style("fill",function(d,i){
						return d == null ? "#666666" : "#333333";
					});

			});	//end each	
		}

		sync();
		this.store("charsync")();
		getDataAndDraw(); //initialize
		getCharAndDraw();

		var buttons0 = this.store("buttons0");
		buttons0.on("mousedown",function(d,i){
			self.store("format", d.c);
			sync();
			getDataAndDraw();
		});

		var buttons1 = this.store("buttons1");
		buttons1.on("mousedown",function(d,i){
			self.store("cut", d.c);
			self.store("group", null); //reset the group selection
			sync();
			getDataAndDraw();
		});

		var charButtons = this.store("charButtons");
		charButtons.on("mousedown", function(d,i){
			self.store("charcut", d.code);
			getCharAndDraw();
			self.store("charsync")();
		});


	}

	YouthEmployment2016.addView(setup,redraw,dataFile);

})();