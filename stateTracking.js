//depends: d3.js
//ALL DRAWING CODE MUST BE SYNCHRONOUS/SINGLE THREADED (NO WEBWORKERS) 

//produce a state/navigation object for MPP interactives
function MetroInteractive(appWrapperElement){
	
	//test that browser supports SVG
	if(!document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")){
		appWrapperElement.innerHTML = '<p style="font-style:italic;text-align:center;margin:30px 0px 30px 0px;">This interactive feature requires a modern browser such as Chrome, Firefox, IE9+, or Safari.</p>';
		return null;
	}

	//state object, S
	var S = {};

	//basic structure: A] app wrapper > a] menu (progress bar, forward, backward) wrapper, b] slide/views wrapper; 
	//				   B] table of contents is a child of S.wrap
	S.wrap = d3.select(appWrapperElement).classed("metro-interactive-wrap toc-visible",true).style({"position":"relative", "overflow":"hidden"});
	S.progress = S.wrap.append("div").classed("metro-interactive-progress c-fix",true).style("padding-right","65px");
	S.viewWrap = S.wrap.append("div").classed("metro-interactive-views",true);

	//run matchMedia queries
	S.viewport = {};
	function matchMedia(){
		try{
			S.viewport.desktop = window.matchMedia("(min-width: 640px)").matches;
			S.viewport.mobile = !S.viewport.desktop;
		}
		catch(e){
			S.viewport.desktop = null;
			S.viewport.mobile = null;
		}		
	}
	matchMedia();

	var viewMenuCtrl = {bilt:false}; //view menu (table of contents) object. built after all views loaded below.

	////////////  APP STATE  //////////////
		S.metro = null; //no defaults
		S.view = null;
		S.TOCShown = true; //is the table of contents slide being shown -- defaults to true -- display controlled by toc-visible class on outer wrapper

		S.currentSlide = null; //the actual dom element being shown
		S.allSlides = null;
	///////////////////////////////////////

	//provide external hooks for changing metros and views across the entire application
	S.setMetro = function(metroCode){qcMetro(metroCode);}
	S.setView = function(viewCode){qcView(viewCode);}

	//metro lookup table to validate metro areas
	S.metroLookup = {"10420":[{"CBSA_Code":"10420","CBSA_Title":"Akron, OH","lon":-81.34969,"lat":41.14818}],"10580":[{"CBSA_Code":"10580","CBSA_Title":"Albany-Schenectady-Troy, NY","lon":-73.9377,"lat":42.78914}],"10740":[{"CBSA_Code":"10740","CBSA_Title":"Albuquerque, NM","lon":-106.47079,"lat":35.12124}],"10900":[{"CBSA_Code":"10900","CBSA_Title":"Allentown-Bethlehem-Easton, PA-NJ","lon":-75.40179,"lat":40.78826}],"12060":[{"CBSA_Code":"12060","CBSA_Title":"Atlanta-Sandy Springs-Roswell, GA","lon":-84.39655,"lat":33.69587}],"12260":[{"CBSA_Code":"12260","CBSA_Title":"Augusta-Richmond County, GA-SC","lon":-81.98039,"lat":33.45706}],"12420":[{"CBSA_Code":"12420","CBSA_Title":"Austin-Round Rock, TX","lon":-97.655,"lat":30.26279}],"12540":[{"CBSA_Code":"12540","CBSA_Title":"Bakersfield, CA","lon":-118.72778,"lat":35.34329}],"12580":[{"CBSA_Code":"12580","CBSA_Title":"Baltimore-Columbia-Towson, MD","lon":-76.67215,"lat":39.38384}],"12940":[{"CBSA_Code":"12940","CBSA_Title":"Baton Rouge, LA","lon":-91.13242,"lat":30.57093}],"13820":[{"CBSA_Code":"13820","CBSA_Title":"Birmingham-Hoover, AL","lon":-86.81439,"lat":33.46395}],"14260":[{"CBSA_Code":"14260","CBSA_Title":"Boise City, ID","lon":-116.14168,"lat":43.0153}],"14460":[{"CBSA_Code":"14460","CBSA_Title":"Boston-Cambridge-Newton, MA-NH","lon":-71.10341,"lat":42.55381}],"14860":[{"CBSA_Code":"14860","CBSA_Title":"Bridgeport-Stamford-Norwalk, CT","lon":-73.38907,"lat":41.26825}],"15380":[{"CBSA_Code":"15380","CBSA_Title":"Buffalo-Cheektowaga-Niagara Falls, NY","lon":-78.73837,"lat":42.91215}],"15980":[{"CBSA_Code":"15980","CBSA_Title":"Cape Coral-Fort Myers, FL","lon":-81.82069,"lat":26.57868}],"16700":[{"CBSA_Code":"16700","CBSA_Title":"Charleston-North Charleston, SC","lon":-80.04409,"lat":33.04161}],"16740":[{"CBSA_Code":"16740","CBSA_Title":"Charlotte-Concord-Gastonia, NC-SC","lon":-80.86895,"lat":35.18707}],"16860":[{"CBSA_Code":"16860","CBSA_Title":"Chattanooga, TN-GA","lon":-85.35889,"lat":35.05048}],"16980":[{"CBSA_Code":"16980","CBSA_Title":"Chicago-Naperville-Elgin, IL-IN-WI","lon":-87.96401,"lat":41.70346}],"17140":[{"CBSA_Code":"17140","CBSA_Title":"Cincinnati, OH-KY-IN","lon":-84.42787,"lat":39.07085}],"17460":[{"CBSA_Code":"17460","CBSA_Title":"Cleveland-Elyria, OH","lon":-81.68392,"lat":41.37554}],"17820":[{"CBSA_Code":"17820","CBSA_Title":"Colorado Springs, CO","lon":-104.65854,"lat":38.84266}],"17900":[{"CBSA_Code":"17900","CBSA_Title":"Columbia, SC","lon":-81.04336,"lat":34.0902}],"18140":[{"CBSA_Code":"18140","CBSA_Title":"Columbus, OH","lon":-82.83849,"lat":39.96695}],"19100":[{"CBSA_Code":"19100","CBSA_Title":"Dallas-Fort Worth-Arlington, TX","lon":-97.02517,"lat":32.81818}],"19380":[{"CBSA_Code":"19380","CBSA_Title":"Dayton, OH","lon":-84.13996,"lat":39.82953}],"19660":[{"CBSA_Code":"19660","CBSA_Title":"Deltona-Daytona Beach-Ormond Beach, FL","lon":-81.2182,"lat":29.16992}],"19740":[{"CBSA_Code":"19740","CBSA_Title":"Denver-Aurora-Lakewood, CO","lon":-104.89423,"lat":39.43424}],"19780":[{"CBSA_Code":"19780","CBSA_Title":"Des Moines-West Des Moines, IA","lon":-93.94314,"lat":41.54787}],"19820":[{"CBSA_Code":"19820","CBSA_Title":"Detroit-Warren-Dearborn, MI","lon":-83.23326,"lat":42.72034}],"21340":[{"CBSA_Code":"21340","CBSA_Title":"El Paso, TX","lon":-105.53863,"lat":31.51179}],"23420":[{"CBSA_Code":"23420","CBSA_Title":"Fresno, CA","lon":-119.64919,"lat":36.75656}],"24340":[{"CBSA_Code":"24340","CBSA_Title":"Grand Rapids-Wyoming, MI","lon":-85.48828,"lat":42.99883}],"24660":[{"CBSA_Code":"24660","CBSA_Title":"Greensboro-High Point, NC","lon":-79.79125,"lat":36.02635}],"24860":[{"CBSA_Code":"24860","CBSA_Title":"Greenville-Anderson-Mauldin, SC","lon":-82.41681,"lat":34.68887}],"25420":[{"CBSA_Code":"25420","CBSA_Title":"Harrisburg-Carlisle, PA","lon":-77.09446,"lat":40.32777}],"25540":[{"CBSA_Code":"25540","CBSA_Title":"Hartford-West Hartford-East Hartford, CT","lon":-72.57895,"lat":41.73265}],"26420":[{"CBSA_Code":"26420","CBSA_Title":"Houston-The Woodlands-Sugar Land, TX","lon":-95.39645,"lat":29.78191}],"26900":[{"CBSA_Code":"26900","CBSA_Title":"Indianapolis-Carmel-Anderson, IN","lon":-86.2069,"lat":39.74684}],"27140":[{"CBSA_Code":"27140","CBSA_Title":"Jackson, MS","lon":-90.22161,"lat":32.31708}],"27260":[{"CBSA_Code":"27260","CBSA_Title":"Jacksonville, FL","lon":-81.79257,"lat":30.23654}],"28140":[{"CBSA_Code":"28140","CBSA_Title":"Kansas City, MO-KS","lon":-94.44642,"lat":38.93678}],"28940":[{"CBSA_Code":"28940","CBSA_Title":"Knoxville, TN","lon":-84.13579,"lat":36.04342}],"29460":[{"CBSA_Code":"29460","CBSA_Title":"Lakeland-Winter Haven, FL","lon":-81.69913,"lat":27.95028}],"29820":[{"CBSA_Code":"29820","CBSA_Title":"Las Vegas-Henderson-Paradise, NV","lon":-115.0156,"lat":36.21495}],"30780":[{"CBSA_Code":"30780","CBSA_Title":"Little Rock-North Little Rock-Conway, AR","lon":-92.39605,"lat":34.75591}],"31080":[{"CBSA_Code":"31080","CBSA_Title":"Los Angeles-Long Beach-Anaheim, CA","lon":-118.13882,"lat":34.24737}],"31140":[{"CBSA_Code":"31140","CBSA_Title":"Louisville/Jefferson County, KY-IN","lon":-85.66996,"lat":38.33707}],"31540":[{"CBSA_Code":"31540","CBSA_Title":"Madison, WI","lon":-89.59095,"lat":43.07942}],"32580":[{"CBSA_Code":"32580","CBSA_Title":"McAllen-Edinburg-Mission, TX","lon":-98.18056,"lat":26.39641}],"32820":[{"CBSA_Code":"32820","CBSA_Title":"Memphis, TN-MS-AR","lon":-89.81524,"lat":35.00759}],"33100":[{"CBSA_Code":"33100","CBSA_Title":"Miami-Fort Lauderdale-West Palm Beach, FL","lon":-80.50589,"lat":26.16073}],"33340":[{"CBSA_Code":"33340","CBSA_Title":"Milwaukee-Waukesha-West Allis, WI","lon":-88.17343,"lat":43.17734}],"33460":[{"CBSA_Code":"33460","CBSA_Title":"Minneapolis-St. Paul-Bloomington, MN-WI","lon":-93.34635,"lat":45.06567}],"34980":[{"CBSA_Code":"34980","CBSA_Title":"Nashville-Davidson--Murfreesboro--Franklin, TN","lon":-86.72491,"lat":36.08809}],"35300":[{"CBSA_Code":"35300","CBSA_Title":"New Haven-Milford, CT","lon":-72.93774,"lat":41.41204}],"35380":[{"CBSA_Code":"35380","CBSA_Title":"New Orleans-Metairie, LA","lon":-89.9602,"lat":29.91839}],"35620":[{"CBSA_Code":"35620","CBSA_Title":"New York-Newark-Jersey City, NY-NJ-PA","lon":-74.08915,"lat":40.9223}],"35840":[{"CBSA_Code":"35840","CBSA_Title":"North Port-Sarasota-Bradenton, FL","lon":-82.32237,"lat":27.34782}],"36260":[{"CBSA_Code":"36260","CBSA_Title":"Ogden-Clearfield, UT","lon":-112.81807,"lat":41.4327}],"36420":[{"CBSA_Code":"36420","CBSA_Title":"Oklahoma City, OK","lon":-97.50489,"lat":35.42866}],"36540":[{"CBSA_Code":"36540","CBSA_Title":"Omaha-Council Bluffs, NE-IA","lon":-95.99977,"lat":41.29036}],"36740":[{"CBSA_Code":"36740","CBSA_Title":"Orlando-Kissimmee-Sanford, FL","lon":-81.36358,"lat":28.43351}],"37100":[{"CBSA_Code":"37100","CBSA_Title":"Oxnard-Thousand Oaks-Ventura, CA","lon":-119.0789,"lat":34.47314}],"37340":[{"CBSA_Code":"37340","CBSA_Title":"Palm Bay-Melbourne-Titusville, FL","lon":-80.73251,"lat":28.29376}],"37980":[{"CBSA_Code":"37980","CBSA_Title":"Philadelphia-Camden-Wilmington, PA-NJ-DE-MD","lon":-75.30322,"lat":39.9046}],"38060":[{"CBSA_Code":"38060","CBSA_Title":"Phoenix-Mesa-Scottsdale, AZ","lon":-112.07073,"lat":33.18583}],"38300":[{"CBSA_Code":"38300","CBSA_Title":"Pittsburgh, PA","lon":-79.83087,"lat":40.43941}],"38900":[{"CBSA_Code":"38900","CBSA_Title":"Portland-Vancouver-Hillsboro, OR-WA","lon":-122.47825,"lat":45.59765}],"39300":[{"CBSA_Code":"39300","CBSA_Title":"Providence-Warwick, RI-MA","lon":-71.3998,"lat":41.72421}],"39340":[{"CBSA_Code":"39340","CBSA_Title":"Provo-Orem, UT","lon":-112.35358,"lat":39.86421}],"39580":[{"CBSA_Code":"39580","CBSA_Title":"Raleigh, NC","lon":-78.4617,"lat":35.75394}],"40060":[{"CBSA_Code":"40060","CBSA_Title":"Richmond, VA","lon":-77.47248,"lat":37.46045}],"40140":[{"CBSA_Code":"40140","CBSA_Title":"Riverside-San Bernardino-Ontario, CA","lon":-116.12824,"lat":34.55222}],"40380":[{"CBSA_Code":"40380","CBSA_Title":"Rochester, NY","lon":-77.50946,"lat":42.96878}],"40900":[{"CBSA_Code":"40900","CBSA_Title":"Sacramento--Roseville--Arden-Arcade, CA","lon":-120.99846,"lat":38.78115}],"41180":[{"CBSA_Code":"41180","CBSA_Title":"St. Louis, MO-IL","lon":-90.34993,"lat":38.73358}],"41620":[{"CBSA_Code":"41620","CBSA_Title":"Salt Lake City, UT","lon":-113.0109,"lat":40.4709}],"41700":[{"CBSA_Code":"41700","CBSA_Title":"San Antonio-New Braunfels, TX","lon":-98.60154,"lat":29.42828}],"41740":[{"CBSA_Code":"41740","CBSA_Title":"San Diego-Carlsbad, CA","lon":-116.73186,"lat":33.03348}],"41860":[{"CBSA_Code":"41860","CBSA_Title":"San Francisco-Oakland-Hayward, CA","lon":-122.01491,"lat":37.70206}],"41940":[{"CBSA_Code":"41940","CBSA_Title":"San Jose-Sunnyvale-Santa Clara, CA","lon":-121.37455,"lat":36.90902}],"42540":[{"CBSA_Code":"42540","CBSA_Title":"Scranton--Wilkes-Barre--Hazleton, PA","lon":-75.89452,"lat":41.32314}],"42660":[{"CBSA_Code":"42660","CBSA_Title":"Seattle-Tacoma-Bellevue, WA","lon":-121.86564,"lat":47.55345}],"44060":[{"CBSA_Code":"44060","CBSA_Title":"Spokane-Spokane Valley, WA","lon":-117.57219,"lat":48.19339}],"44140":[{"CBSA_Code":"44140","CBSA_Title":"Springfield, MA","lon":-72.64483,"lat":42.22917}],"44700":[{"CBSA_Code":"44700","CBSA_Title":"Stockton-Lodi, CA","lon":-121.27231,"lat":37.93234}],"45060":[{"CBSA_Code":"45060","CBSA_Title":"Syracuse, NY","lon":-76.03377,"lat":43.15681}],"45300":[{"CBSA_Code":"45300","CBSA_Title":"Tampa-St. Petersburg-Clearwater, FL","lon":-82.4056,"lat":28.15434}],"45780":[{"CBSA_Code":"45780","CBSA_Title":"Toledo, OH","lon":-83.78038,"lat":41.49856}],"46060":[{"CBSA_Code":"46060","CBSA_Title":"Tucson, AZ","lon":-111.78996,"lat":32.09743}],"46140":[{"CBSA_Code":"46140","CBSA_Title":"Tulsa, OK","lon":-96.16542,"lat":36.24962}],"46520":[{"CBSA_Code":"46520","CBSA_Title":"Urban Honolulu, HI","lon":-157.97572,"lat":21.4604}],"47260":[{"CBSA_Code":"47260","CBSA_Title":"Virginia Beach-Norfolk-Newport News, VA-NC","lon":-76.4147,"lat":36.65574}],"47900":[{"CBSA_Code":"47900","CBSA_Title":"Washington-Arlington-Alexandria, DC-VA-MD-WV","lon":-77.47239,"lat":38.83189}],"48620":[{"CBSA_Code":"48620","CBSA_Title":"Wichita, KS","lon":-97.39811,"lat":37.62504}],"49180":[{"CBSA_Code":"49180","CBSA_Title":"Winston-Salem, NC","lon":-80.3451,"lat":36.07244}],"49340":[{"CBSA_Code":"49340","CBSA_Title":"Worcester, MA-CT","lon":-71.92866,"lat":42.2188}],"49660":[{"CBSA_Code":"49660","CBSA_Title":"Youngstown-Warren-Boardman, OH-PA","lon":-80.56419,"lat":41.24169}]};
	S.metroLookupVS = {}; //VS, or "view specific" metro lookup

	S.addGeo = S.addMetro = function(code, name){
		var c = code+"";
		S.metroLookup[c] = [{"CBSA_Code":c, "CBSA_Title":name, "lon":null, "lat":null}];
	}

	var allSelects = [];
	var syncSelects = function(){
		try{
			for(var i=0; i<allSelects.length; i++){
				allSelects[i].node().value = S.metro;
			}
		}
		catch(e){
			//no-op
		}
	}

	//add a select menu to the container node
	S.selectMenu = function(container){
		var wrap = d3.select(container);
		var sel = wrap.append("select");
		var opt = [];
		for(var c in S.metroLookup){
			if(S.metroLookup.hasOwnProperty(c)){
				opt.push({val:S.metroLookup[c][0].CBSA_Code, label:S.metroLookup[c][0].CBSA_Title});
			}
		}
		var options = sel.selectAll("option").data(opt);
		options.enter().append("option");
		options.exit().remove();

		options.attr("value", function(d,i){return d.val})
			   .text(function(d,i){return d.label});

		sel.on("change", function(d,i){
			S.setMetro(this.value);
			this.blur();
		})

		allSelects.push(sel);
	}

	//function to determine default metro area
	function metroDefault(obj){
		var firstKey = null;
		try{
			if(Object.keys){
				firstKey = Object.keys(obj)[0];
			}
			else{
				for(p in obj){
					if(obj.hasOwnProperty(p)){
						firstKey = p;
						break;
					}
				}
			}
		}
		catch(e){
			firstKey = null;
		}
		finally{
			return firstKey;
		}
		
	}
	

	//NUMBER FORMATTING
	S.formats = {};
	//basic numeric formatting -- add in comma, round to x decimal places
	S.formats.num0 = d3.format(",.0f");
	S.formats.num1 = d3.format(",.1f");
	S.formats.num2 = d3.format(",.2f");
	S.formats.num3 = d3.format(",.3f");
	//numeric change formatting
	S.formats.numch0 = d3.format("+,.0f");
	S.formats.numch1 = d3.format("+,.1f");
	S.formats.numch2 = d3.format("+,.2f");
	S.formats.numch3 = d3.format("+,.3f");
	//percent formatting -- x100 + %
	S.formats.pct0 = d3.format(",.0%");
	S.formats.pct1 = d3.format(",.1%");
	S.formats.pct2 = d3.format(",.2%");
	S.formats.pct3 = d3.format(",.3%");
	//percent change
	S.formats.pctch0 = d3.format("+,.0%");
	S.formats.pctch1 = d3.format("+,.1%");
	S.formats.pctch2 = d3.format("+,.2%");
	S.formats.pctch3 = d3.format("+,.3%");
	//percentage points change
	S.formats.ppch0 = function(v){return S.formats.numch0(v*100) + " p.p."};
	S.formats.ppch1 = function(v){return S.formats.numch1(v*100) + " p.p."};
	S.formats.ppch2 = function(v){return S.formats.numch2(v*100) + " p.p."};
	S.formats.ppch3 = function(v){return S.formats.numch3(v*100) + " p.p."};
	//dollars
	S.formats.doll0 = d3.format("$,.0f");
	S.formats.doll1 = d3.format("$,.1f");
	S.formats.doll2 = d3.format("$,.2f");
	S.formats.doll3 = d3.format("$,.3f");
	//dollar change
	S.formats.dollch0 = d3.format("+$,.0f");
	S.formats.dollch1 = d3.format("+$,.1f");
	S.formats.dollch2 = d3.format("+$,.2f");
	S.formats.dollch3 = d3.format("+$,.3f");

	//ranks
	S.formats.rankth = function(r){
		if(r === undefined || r === null){return "N/A"}
		try{
			//keep int versions
			var num = r;
			var mod = r%100; //for ranks beyond 100

			//coerce to string
			var s = r + "";
			var f = +(s.substring(s.length-1)); //take last char and coerce to an integer

			//typical suffixes
			var e = ["th","st","nd","rd","th","th","th","th","th","th"];

			var rth = (mod>10 && mod<20) ? r + "th" : (r + e[f]); //handles exceptions for X11th, X12th, X13th, X14th
		}
		catch(e){
			var rth = "N/A";
		}
		finally{
			return rth;
		}
	}

	//bring an element to top of window via scrolltop
	function scrollToThis(thiz){
		try{
			var snapThreshold = S.viewport.mobile ? 1 : 200;
			var etop = thiz.getBoundingClientRect().top;
			if(etop > 50 && etop < snapThreshold){throw "Already in view"}
			var current = window.scrollY;
			var next = current + etop + 1;
			var I = d3.interpolateNumber(current, next);
			var tween = function(){
				return function(t){
					window.scroll(0, I(t));
				}
			}

			//scroll to top in next tick -- allows any necessary loading/drawing to take place first
			setTimeout(function(){
				try{
					if(Math.abs(next-current) <= 25){
						window.scroll(0,next);
					}
					else{
						d3.transition().duration(500).tween("scrollToThis",tween);
					}
				}
				catch(e){
					//no-op
				}
				//window.scroll(0,next);
			},0)		
		}
		catch(e)
		{
			//no-op, unsupported browsers don't get this feature
		}
	}


	//view listeners need to:
	// draw a view for a selected metro
	// view listeners will 1) change views and draw selected metro version. if the view is already shown, it just draws the selected metro version of the view.
	var viewRegister = {};
	var viewList = [];

	//setupView will be run one time -- its code must be synchronous -- it has access to the slide wrap and slide header area through the this object.
	//redrawView will be run each time changeView is called -- its code must be synchronous -- it has access to the viewOps object as the this object
	//metroLookup can be used later to restrict the geography for a given view--use case not needed now and will be handled in the view callback
	//the first registered view becomes the default
	var numViews = 0;
	S.addView = function(setupView, redrawView, data_uri, metroLookup){
		var viewNum = numViews;
		var viewIndex = "V"+viewNum;
		var nameShort = viewIndex; //can be set by user later - for use in menu
		var nameLong = null; //for use in each slide title

		//create a "view slide" in the DOM
		var outer_slide = S.viewWrap.append("div").classed("metro-interactive-view-wrap",true);
		var slide = outer_slide.append("div").classed("metro-interactive-view c-fix out-of-view",true).datum(viewNum);
		var slideHeader = slide.append("div").classed("metro-interactive-view-header",true);
		var slideContent = slide.append("div").classed("metro-interactive-view-content",true);

		S.allSlides = S.viewWrap.selectAll(".metro-interactive-view"); //update selection of slides

		var dataURI = !!data_uri ? data_uri : null;

		//hold parameters for the current view redrawView will be drawn with this object as the this
		var viewOps = {};
		viewOps.formats = S.formats;
		//viewOps.changeEvent = S.changeEvent;
		viewOps.firstDraw = true; //useful for determining if particular information should be shown on first view
		viewOps.getMetro = function(){return S.metro;}
		viewOps.setMetro = function(code){S.setMetro(code);}
		viewOps.refreshHeight = refresh_view_wrap_height;
		viewOps.dataState = 0; // 0: empty, 1: loading, 2: ready, -1: error
		viewOps.dataStore = {data: {raw:null, processed:null}, storage: {}}; //placeholder for the view data
		viewOps.container = viewOps.slide = slideContent;
		viewOps.header = slideHeader;
		viewOps.lookup = S.metroLookup;
		//allow user to set "short" and "long" names [1-2 words, full title]
		viewOps.name = function(short, long){
			if(arguments.length===1){
				nameShort = short;
			}
			else if(arguments.length > 1){
				nameShort = short;
				nameLong = long;

				var title = slideHeader.selectAll("p").data([long]);
				title.enter().append("p");
				title.exit().remove();
				title.text(function(d,i){return d});
			}
			return {short:nameShort, long:nameLong};
		}
		viewOps.description = function(text){
			var atext = [].concat(text);
			var p = slideHeader.selectAll("p.metro-interactive-view-description").data(atext);
			p.enter().append("p").classed("metro-interactive-view-description",true);
			p.exit().remove();
			p.html(function(d,i){return d});
		}

		viewOps.data = function(name, data){
			if(arguments.length===0){
				return viewOps.dataStore.data.raw;
			}
			else if(arguments.length===1){
				return viewOps.dataStore.data[name];
			}
			else{
				viewOps.dataStore.data[name] = data;
				return data;
			}
		}
		viewOps.viewData = viewOps.data; //for backwards compatibility

		//get or set arbitrary name-value pairs in dataStore.storage. -- enable global scoping (to do)
		viewOps.store = function(name, value, global){
			if(arguments.length===1){
				return viewOps.dataStore.storage[name];
			}
			else if(arguments.length===2){
				viewOps.dataStore.storage[name] = value;
				return value;
			}
		}
		viewOps.storage = viewOps.store; //maintain for backwards compatibility

		viewOps.changeEvent = {view:false, metro:false, resize:false} //keep track of what is triggering redraws
		viewOps.changeEventReset = function(){
			viewOps.changeEvent.view=false;
			viewOps.changeEvent.metro=false;
			viewOps.changeEvent.resize=false;
		}

		//run setup
		if(!!setupView){setupView.call(viewOps);} //must be synchronous

		function viewLoading(){slide.classed("view-is-loading",true)}
		function viewLoaded(){slide.classed("view-is-loading",false)}

		//handle the swapping of slides -- bring this slide into view
		function show_this_slide(){
			var index_to_show = viewNum;
			var current = !!S.currentSlide ? S.currentSlide.datum() : 0;

			//don't allow slides in between the current view and next view to transition (apply out-of-view class)
			S.allSlides.classed("out-of-view", function(d,i){
				try{
					var inBetween = false; //we don't want these to animate
					if(d > current && d < index_to_show){
						var inBetween = true;
					}
					else if(d < current && d > index_to_show){
						var inBetween = true;
					}
				}
				catch(e){
					var inBetween = false;
				}
				finally{
					return inBetween;
				}
			});
			S.allSlides.classed("out-right", function(d,i){
				return d > index_to_show;
			});
			S.allSlides.classed("out-left", function(d,i){
				return d < index_to_show;
			});

			S.currentSlide = slide.classed("out-right out-left out-of-view",false); //S.view is already set in changeView;

			//set the current slide's parent to relative positioning, putting it back in document flow and thus setting viewWrap height automatically -- all others positioned absolutely
			S.allSlides.each(function(d,i){
				this.parentNode.style.position = (d===index_to_show ? "relative" : "absolute");
			});
			
			if(!S.TOCShown){scrollToThis(S.wrap.node());} //align wrapper to the top of viewport if the TOC is not shown (necessary test to handle initial load case)
		}

		//set the view wrap height based on this slide's height -- fallback method in case the relative positioning above fails
		function refresh_view_wrap_height(H){
			if(arguments.length===1){
				S.viewWrap.style("height",H+"px");
			}
			else{
				try{
					var rect = slide.node().getBoundingClientRect();
					var h = Math.round(rect.bottom - rect.top)+20; //20px margin
					if(h<200){throw "BadHeight"}
				}
				catch(e){
					var h = 2000; //arbitrary, tall height
				}	
				finally{
					S.viewWrap.style("height",h+"px");
				}
			}		
		}

		//TWO FUNCTIONS FOR SHOWING DATA: 1) IF DATA ALREADY LOADED: JUST DRAW IT, 2) DATA NOT LOADED: LOAD DATA AND JUST DRAW IT
		//switch to the selected view and redraw
		//Levels: [TOP] changeView() calls [validate() and viewOps.show()]
		//				viewOps.show() calls draw_view() and show_this_slide() OR get_data() and show_this_slide() OR just show_this_slide()
		//				draw_view()--run as a callback by get_data()--actually calls the redrawView() callback
		//ALL VIEW CHANGES RUN THROUGH changeView() -- it also handles all validation through validate() -- need to add more to make potential errors more visible to user

		function draw_view(){
			viewLoading();

			//redraw this view -- viewOps available as this (e.g. this.data, this.getMetro, etc...)
			try{
				redrawView.call(viewOps); //must be a synchronous fn
			}
			catch(e){
				slide.classed("bad-view",true);
			}
			
			viewOps.changeEventReset(); //reset the change event			

			viewLoaded();

			//every time the view is (re)drawn, resize the wrapper height
			//refresh_view_wrap_height(); //no longer necessary due to switch to relative positioning
			
			viewOps.firstDraw = false; //it's been drawn
		}

		//get data and show view
		function get_data(){
			viewOps.dataState = 1; //now loading
			viewLoading();
			if(!dataURI){
				draw_view(); //if no URI set, just draw the view
				viewOps.dataState = 3; //no data
			}
			else{
				//get the data and draw_view
				d3.json(dataURI, function(err, dat){
					if(err){
						viewLoaded();
						slide.classed("bad-view", true);
						viewOps.dataState = -1;
					}
					else{
						viewOps.dataStore.data.raw = dat;
						viewOps.dataState = 2; //data loaded!
						draw_view(); //draw the view
					}
				});
			}
		}

		//the function exposed that will show this view
		viewOps.show = function(){
			if(viewOps.dataState===2 || viewOps.dataState===3){
				//data is loaded (2) or there is no data to load asynchronously (3)...
				draw_view();  //draw
				show_this_slide();  //and show the view
			}
			else if(viewOps.dataState===0){
				//data is not loaded...
				get_data();  //get and draw the view
				show_this_slide();  //and show the view 
			}
			else if(viewOps.dataState===1){
				//data is loading... the view will be drawn in the callback... the latest metro should be retrieved in redrawView
				show_this_slide()  //make sure this is the view that is being shown
			}
		}

		//register the methods -- view0 is considered the default //viewList is used to create a nav menu
		viewRegister[viewIndex] = viewOps;
		viewList.push(viewIndex);

		numViews++;

		append_loading_icon(slide);

		return viewOps;
	}


	//validate view and metro selections
	function validate(viewCode, metroCode){
		var mh = (metroCode!==null && metroCode!==false && typeof metroCode !== "undefined") ? metroCode : false;
		var vh = (viewCode!==null && viewCode!==false && typeof viewCode !== "undefined") ? viewCode : false;
		
		var result = {view:false, metro:false}

		//validate -- metro codes are validated on a per-app basis not per-view basis
		if(vh && vh in viewRegister){
			result.view = true;
		}
		if(mh && mh in S.metroLookup){
			result.metro = true;
		}

		return result; //results of validation test
	}

	//args
	//{1 & 2} metroCode and viewCode: metro/view code to change to. if not a valid code, no-op. 
	//{3} setHash: optional, if truthy, this method will also set the page hash value to metroCode (assuming valid metro code)
	function changeView(viewCode, metroCode, setHash){
		
		//if called with no args, this is a resize event -- draw with existing geo/view selection
		if(arguments.length===0){
			var viewCode = S.view;
			var metroCode = S.metro;
			var setHash = false;
			var isResizeEvent = true;
		}
		else{
			var isResizeEvent = false;
		}

		var V = validate(viewCode, metroCode);

		//if valid codes...
		if(V.view && V.metro){
			//update state
			var newhash = viewCode + "G" + metroCode;
			if(!!setHash){set_hash(newhash)}

			//NOTE FROM PREVIOUS CODE ARCHITECTURE WHERE changeEvent was tracked globally
			//Do not reset changeEvents here--only reset after changes have been actually drawn (in draw_view). While data is loading asynchronously, 
			//a resize event could wipe out change view data if you reset here, making code in the redraw callback potentially unreliable. The approach 
			//below is somewhat conservative, as it "layers" changes. That is, once a change has been recorded, it will not be reset until the view 
			//is (re)drawn. This means if a user switches from geo A to B and then back to A, the view will still be drawn with the changeEvent.metro flag 
			//turned on. This might be more expensive in terms of redraws but it is more predictable, and as a practical matter, this only should come 
			//into play during the asynchronous phase of this code (data loading). Even then it is not likely to be an issue because S.view an S.metro 
			//are initialized to null and so for the first draw, these changeEvent flags will always be set. Note that the resize flag is only set to 
			//true when changeView is called from qcRedraw.

			//EDIT (2/17): Note that the resize flag is only set to true when changeView is called with no arguments.

			var VO = viewRegister[viewCode];

			if(S.view != viewCode){
				VO.changeEvent.view = true;
			}
			if(S.metro != metroCode){
				VO.changeEvent.metro = true;
			}
			if(isResizeEvent){
				VO.changeEvent.resize = true;
			}

			//state must be updated before show is called because it relies on the current state -- if the user changes metro while the redraw method is called asynchronously, you want that callback to use the new metro. It might redraw twice, but it will do so with the right data.
			S.view = viewCode;
			S.metro = metroCode;

			syncSelects(); //make sure all select menus reflect new metro selection

			if(viewMenuCtrl.bilt){
				//if drawing a view, hide the view menu (TOC) -- necessary to enable back/forward, otherwise the TOC could become persistently "stuck"
				//the !VO.firstDraw condition handles the initial load of the app when the TOC is shown, but the first, default view is still drawn underneath. 
				//If the non-default view is drawn on initial load, the cap method will take care of hiding the TOC
				//Other methods of selecting a view from the viewMenu will also handle hiding the toc
				if(!VO.firstDraw){viewMenuCtrl.hide();} 
				viewMenuCtrl.syncButtons();
			}

			//show this view -- eventually calls the low level function draw_view associated with each view -- it will reset state
			VO.show();
		} 
		else{
			//bad hashes, go back to menu
			if(viewMenuCtrl.bilt){
				viewMenuCtrl.show();
			}
		}
	}

	//"qc" or "quick change" wrappers for changeView, when you just want to change metro or view and force a hash change
	function qcMetro(metroCode){changeView(S.view, metroCode, true);}
	function qcView(viewCode){changeView(viewCode, S.metro, true);}
	
	//set about information text
	S.aboutData = {title:[], description:[], footnotes:[]};
	S.about = function(prop, value){
		if(arguments.length==1){
			var rval = S.aboutData[prop];
		}
		else if(arguments.length > 1){
			var aval = [].concat(value);
			S.aboutData[prop] = aval;
			var rval = aval;
		}
		else{
			var rval = [];
		}
		return rval;
	}

	//build_view_nav can only be called once everything has been registered -- i.e. in S.cap
	viewMenuCtrl.build = function(){
		var self = this;
		S.TOCShown = true;

		//divs to hold the menu view, menu view header, and menu view content
		var slide = S.wrap.append("div").classed("metro-interactive-view-menu",true).style("overflow-y","auto");

		var header = slide.append("div").style({"padding":"24px 15px 8px 0px","border-bottom":"1px solid #0D73D6"}).classed("c-fix",true);
			header.selectAll("div").data([{c:"#0D73D6",h:9},{c:"#0D73D6",h:16},{c:"#0D73D6",h:12}]).enter().append("div")
				  .style({"float":"left","width":"7px","margin-right":"3px"})
				  .style("height",function(d,i){return d.h+"px"})
				  .style("margin-top",function(d,i){return (12-d.h)+"px"})
				  .style("background-color",function(d,i){return d.c});

			header.append("p").html("INTERACTIVE FEATURE")
				  .style({"font-size":"13px", "color":"#0D73D6", "margin":"0px 0px 0px 5px", "line-height":"13px", "height":"13px", "float":"left"})

		var toctitle = slide.append("div").style("margin","22px 0px 0px 0px").selectAll("p").data(S.about("title"))
							.enter().append("p").classed("metro-interactive-header-text",true)
							.style({"color":"#0D73D6"}).html(function(d,i){return d});		

		var content = slide.append("div").classed("c-fix",true);

		var descriptionText = S.about("description");
		
		//add the intro paragraph -- basically get the first paragraph before the toc-box
		if(descriptionText.length > 0){
			content.append("p").html(descriptionText[0]).classed("metro-interactive-description",true);		
		}

		//build the table of contents structure
		var tocw = content.append("div").classed("metro-interactive-toc-box",true);
		tocw.append("div").style({"padding":"0px","background-color":"rgba(13,115,214,0.25)"}).classed("c-fix",true)
			.append("p").text("SECTIONS").style({"font-size":"13px", "float":"left","padding":"4px 18px","background-color":"#0D73D6","margin":"0px", "color":"#ffffff"});
		var tocTable = tocw.append("div").style("padding","8px 15px 8px 10px").append("div").classed("as-table",true);

		//fill in all description text -- the DOM structure has been set accordingly: intro, toc, remaining paragraphs
		var contentP = content.selectAll("p.metro-interactive-description").data(descriptionText);
		contentP.enter().append("p").classed("metro-interactive-description",true).html(function(d,i){return d});
		contentP.exit().remove();

		//forward/back buttons
		var back = S.progress.append("div").style({"float":"left", "width":"15%", "height":"100%", "position":"relative", "cursor":"pointer"});
		var backSVG = back.append("svg").style({"width":"50px","height":"100%","position":"absolute","left":"0px","top":"0px", "pointer-events":"none"});
		var middle = S.progress.append("div").style({"float":"left", "width":"70%", "height":"100%", "position":"relative"}).append("svg").style({"width":"100%","height":"100%","position":"absolute","left":"0px","top":"0px"});
		
		var forward = S.progress.append("div").style({"float":"right", "width":"15%", "height":"100%", "position":"relative", "cursor":"pointer"});
		var forwardSVG = forward.append("svg").style({"width":"50px","height":"100%","position":"absolute","right":"0px","top":"0px", "pointer-events":"none"});
		
		var infoButton = S.progress.append("div").classed("metro-interactive-info-button",true).append("div");

		backSVG.append("path").attr("d","M25,0 l-13,10 l13,10").attr("stroke-linecap","round");
		forwardSVG.append("path").attr("d","M35,0 l13,10 l-13,10").attr("stroke-linecap","round");

		
		//set up the slide indicator dots
		var r = 3; //default radius
		//build array with positions of dots
		var spacing = function(){
			var num_dots = viewList.length;
			var min_percent = 3; //in percent of svg width
			var pref_percent = 9;
			var real_percent = pref_percent;
			while(real_percent >= min_percent){
				if(real_percent*num_dots < 100){break}
				real_percent--;
			}
			r = real_percent > 7 ? 3 : (real_percent > 4 ? 2.5 : 2); 
			var block_width = real_percent*(num_dots-1);
			var start = (100-block_width)/2;
			var dotPos = [];
			for(var i=0; i<num_dots; i++){
				dotPos.push(start+(i*real_percent));
			}
			return dotPos;
		}
		var buttonX = spacing(); 
		var buttons = middle.selectAll("circle").data(viewList).enter().append("circle")
							.attr({"cy":"50%","r":r})
							.attr("cx",function(d,i){return buttonX[i] + "%"});
		
		this.syncButtons = function(){
			buttons.style("fill",function(d,i){
				return d===S.view ? "#0D73D6" : "#aaaaaa";
			});

			forward.classed("menu-button-inactive", function(d,i){
				return S.view === viewList[viewList.length-1];
			});

			back.classed("menu-button-inactive", function(d,i){
				return S.view === viewList[0];
			});			
		}

		this.show = function(snapToTop){

			S.TOCShown = true;
			S.wrap.classed("toc-visible",true);
			slide.node().scrollTop = 0;

			set_hash("TableOfContents"); //set an invalid hash value -- calls to changeView with this hash will result in menu being shown -- useful for browser back
		
			if(snapToTop){
				scrollToThis(S.wrap.node());
			}
		}

		infoButton.on("mousedown",function(d,i){
			self.show(true);
		});
		infoButton.on("touchstart",function(d,i){
			d3.event.preventDefault();
			self.show(true);
		});

		this.hide = function(snapToTop){
			S.TOCShown = false;
			S.wrap.classed("toc-visible",false);
			if(snapToTop){
				scrollToThis(S.wrap.node());
			}
		}

		var ftimer;
		var btimer;
		var next = function(inc){
			//determine current view
			try{
				var idx = viewList.indexOf(S.view);
			}
			catch(e){
				var idx = S.view;
				idx = +idx.replace("V","");
			}

			var n = idx+inc;
			if(n === -1){
				self.show(true);
			}
			else if(S.TOCShown){
				changeView(S.view, S.metro, true); //redraw current view & geo, set hash -- this will hide the TOC
			}
			else if(n >= 0 && n < viewList.length){
				self.hide();
				if(inc > 0){
					clearTimeout(ftimer);
					forward.classed("menu-button-active",true);
					ftimer = setTimeout(function(){forward.classed("menu-button-active",false)},200);
				}
				else if(inc < 0){
					clearTimeout(btimer);
					back.classed("menu-button-active",true);
					btimer = setTimeout(function(){back.classed("menu-button-active",false)},200);					
				}
				qcView(viewList[n]);
			}
			 
		}
		back.on("mousedown",function(d,i){next(-1)});
		forward.on("mousedown",function(d,i){next(1)});
		
		forward.on("touchstart",function(d,i){
			d3.event.preventDefault();
			next(1);
		});		
		back.on("touchstart",function(d,i){
			d3.event.preventDefault();
			next(-1);
		});

		window.addEventListener("keydown",function(ev){
			try{
				if(ev.keyCode === 39){var inc = 1;}
				else if(ev.keyCode === 37){var inc = -1;}
				else{var inc = 0;}
			}
			catch(e){
				var inc = 0;
			}
			finally{
				if(inc === 1 || inc === -1){
					next(inc);
				}
			}
		});

		//links to populate the TOC page
		var links = tocTable.selectAll("div.metro-interactive-content-link").data(viewList);
		links.enter().append("div").classed("metro-interactive-content-link as-table-row",true);

		var linkCells = links.selectAll("p").data(function(d,i){
			return [(i+1)+".", d];
		})
		linkCells.enter().append("p").text(function(d,i){
			if(i===0){
				return d;
			}
			else{
				var view = viewRegister[d];
				var names = view.name();
				return (names.long ? names.long : names.short) + " » ";				
			}
		}).classed("as-table-cell",true)
		.style({"vertical-align":"top","padding":"10px 3px"})
		.style("text-align",function(d,i){return i===0 ? "right" : "left"})
		.style("width",function(d,i){return i===0 ? "20px" : "auto"})
		;

		links.on("mousedown", function(d,i){
			qcView(d);
			self.hide();
			//changeView, called by qcView, calls syncButtons
		});

		this.bilt = true;
		return this;
	}

	//"cap off" the app: load the default view/metro, otherwise no setup is performed -- it must set S.metro and S.view
	S.cap = function(){
		//try and determine the proper metro/view selections from the location hash
		var hash = get_hash();
		var view = hash.view;
		var metro = hash.metro;

		var MD = !!S.metro ? S.metro : metroDefault(S.metroLookup);
		var VD = !!S.view ? S.view : "V0";

		//validate the location hash values
		var valid = validate(view, metro);

		//run through the default options -- if they don't pass the validator, nothing happens
		if(valid.metro && valid.view){
			changeView(view, metro); //don't set hash -- these parameters were drawn from the hash
		}
		else if(!valid.metro && !valid.view){
			changeView(VD, MD, true);
		}
		else if(!valid.metro){
			changeView(view, MD, true);
		}
		else if(!valid.view){
			changeView(VD, metro, true);
		}

		viewMenuCtrl.build().syncButtons(); //build the menu and menu page and sync

		if(S.view != VD){
			viewMenuCtrl.hide(true); //default is for TOC to be shown, if the default view is not selected, hide toc and snap to top
		}
		else{
			viewMenuCtrl.show(); //even though the default is to show TOC, use fn for layout side effects
			if(S.currentSlide){
				S.currentSlide.classed("out-right",true);
			}
		}

	}

	//hash changes
	function set_hash(hash){
		if(window.history.pushState) {
		    window.history.pushState(null, null, ("#"+hash));
		}
		else {
		    window.location.hash = hash;
		}
	}
	function get_hash(){
		try{
			var a = window.location.hash.replace("#","").split("G");
			var h = {view:a[0], metro:a[1]}
		}
		catch(e){
			var h = {view:"", metro:""}; //use empty string rather than null so changeView is (always) triggered (even when view and metro are null; see below)
		}
		finally{
			return h;
		}
	};
	function hash_listener(ev){
		var h = get_hash(); 

		if(h.metro !== S.metro || h.view !== S.view){
			changeView(h.view, h.metro); //validation is performed in changeView
		}
	}

	window.addEventListener("hashchange",hash_listener,false);
	
	//on resize, redraw the current view on a delay
	var resize_timer;
	window.addEventListener("resize",function(){
		matchMedia(); //update viewport property
		clearTimeout(resize_timer);
		//only set resize timer if TOC isn't shown
		if(!S.TOCShown){
			resize_timer = setTimeout(changeView, 200);
		}
	});


	function append_loading_icon(wrapper_selection){
		var svg = wrapper_selection.append("div").style({width:"65px", height:"65px", position:"absolute", top:"40%", left:"50%"})
									.classed("metro-interactive-loading-icon",true)
									.append("svg").style({"width":"100%","height":"100%","margin-left":"-32px"})
									.append("g").attr("transform","translate(5,5)");
		
		var widths = [14,14,14];
		var xs = [0,20,40];
		var ys = [15,5,10];
		var heights = [15,25,20];
		var cols = ["#3e83c1","#65a4e5","#8ac6ff"];

		var bar1 = svg.selectAll("rect").data(heights).enter().append("rect").attr({width:14})
						.attr("x",function(d,i){return i*20})
						.attr("height",function(d,i){return d+"px"})
						.attr("y",function(d,i){return 25-d})
						.attr("fill",function(d,i){return cols[i]});

		svg.append("text").style({"font-family":"arial","font-size":"13px"}).attr({x:"27",y:"43","text-anchor":"middle"}).text("LOADING");

	}

	return S; //make the state available
};