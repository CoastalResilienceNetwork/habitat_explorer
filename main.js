
require({ 
	packages: [{ name: "jquery", location: "http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/", main: "jquery.min" }] 
});
define([
        "dojo/_base/declare",
		"framework/PluginBase",
		"./resources/chosen.jquery",
		"esri/request",
		"esri/layers/ArcGISDynamicMapServiceLayer",
		"esri/layers/ArcGISImageServiceLayer",
		"esri/layers/ImageServiceParameters",
		"esri/layers/RasterFunction",
		"esri/tasks/ImageServiceIdentifyTask",
		"esri/tasks/ImageServiceIdentifyParameters",
		"esri/tasks/IdentifyParameters",
		"esri/tasks/IdentifyTask",
		"esri/tasks/QueryTask",
		"esri/tasks/query",
		"esri/graphicsUtils",
		"esri/geometry/Extent",
		"esri/SpatialReference",
		"esri/layers/MapImage",
		"esri/layers/MapImageLayer",
		"esri/symbols/SimpleLineSymbol",
		"esri/symbols/SimpleFillSymbol",
		"esri/symbols/SimpleMarkerSymbol",
		"esri/graphic",
		"dijit/form/Button",
		"dijit/form/ToggleButton",
		"dijit/form/DropDownButton",
		"dijit/DropDownMenu",
		"dijit/MenuItem",
		"dijit/layout/ContentPane",
		"dijit/layout/TabContainer",
		"dijit/form/HorizontalSlider",
		"dijit/form/CheckBox",
		"dijit/form/RadioButton",
		"dojo/dom",
		"dojo/dom-class",
		"dojo/dom-style",
		"dojo/_base/window",
		"dojo/dom-construct",
		"dojo/dom-attr",
		"dojo/dom-geometry",
		"dojo/request/script",
		"dojo/_base/array",
		"dojo/aspect",
		"dojo/_base/lang",
		"dojo/on",
		"dojo/query",
		"dojo/parser",
		"dojo/NodeList-traverse",
		"dijit/Tooltip",
		"dijit/registry",
		"require",
		"./combine",
		"dojo/text!./explorer.json",
		"xstyle/css!./resources/chosen.css"
       ],
       function (declare,
					PluginBase,
					chosen,
					ESRIRequest,
					ArcGISDynamicMapServiceLayer,
					ArcGISImageServiceLayer,
					ImageServiceParameters,
					RasterFunction,
					ImageServiceIdentifyTask,
					ImageServiceIdentifyParameters,
					IdentifyParameters,
					IdentifyTask,
					QueryTask,
					esriQuery,
					graphicsUtils,
					Extent,
					SpatialReference,
					MapImage,
					MapImageLayer,
					SimpleLineSymbol,
					SimpleFillSymbol,
					SimpleMarkerSymbol,
					Graphic,
					Button,
					ToggleButton,
					DropDownButton,
					DropDownMenu,
					MenuItem,
					ContentPane,
					TabContainer,
					HorizontalSlider,
					CheckBox,
					RadioButton,
					dom,
					domClass,
					domStyle,
					win,
					domConstruct,
					domAttr,
					domGeom,
					script,
					array,
					aspect,
					lang,
					on,
					dojoquery,
					parser,
					domNodeTraverse,
					Tooltip,
					registry,
					localrequire,
					combine,
					//printer,
					
					explorer
					) {
			//start the function definition for the Define statement
			//set some internal parameters for the Define processing (but not for the returned object that is defined below)
			_config = dojo.eval("[" + explorer + "]")[0];
			_infographic = _config.infoGraphic;
			//console.log(_infographic);
			//
			if (_infographic != undefined) {
				if (_infographic.slice(_infographic.length - 4, _infographic.length) == ".jpg" || _infographic.slice(_infographic.length - 4, _infographic.length) == ".png") {
					_infographic = localrequire.toUrl("./" + _infographic);
				} 
			}
			//get from config inital text for the starting state of the habitat drop down list
			if (_config.ddText != undefined) {
				_ddText = _config.ddText;
			} else {
				_ddText = "Choose a Region";
			}
			//
			if (_config.noZoom != undefined) {
				_noZoom = _config.noZoom;
			} else {
				_noZoom = false;
			}
			//
			if (_config.enableCustomPrint != undefined) {
				_hasCustomPrint = _config.enableCustomPrint;
			} else {
				_hasCustomPrint = false;
			}			
			//get from config hover text for the main toolbar button
			if (_config.hoverText != undefined) {
				_hoverText = _config.hoverText;
			} else {
				_hoverText = "";
			}
			//
			if (_config.showInfoOnStart != undefined) {
				_showOnStart = _config.showInfoOnStart;
			} else {
				_showOnStart = true;
			}
			//The return object declaration for the main Define function
			//The rest of this file is used to create the return object whose open bracket is on the line below just after the PluginBase is referenced
			//No 'constructor:' method is defined for mixins. See the 'initialize:' method instead
			//See Wiki for info on initial settings: https://github.com/CoastalResilienceNetwork/GeositeFramework/wiki/Plugin-Settings
			return declare(PluginBase, {
				//Plugin Settings
				toolbarName: _config.name, //toolbarName is used as the title in the Identify Window
				toolbarType: "sidebar",
				fullName: _hoverText,
				showServiceLayersInLegend: true,
				allowIdentifyWhenActive: true,
				_hasactivated: false,
				infoGraphic: _infographic, //"plugins/restoration_explorer/RestorationExplorer_c.jpg",
				//height: _config.pluginHeight,
				size:'custom',
				width: _config.pluginWidth,
				stateTabIndex: null,
				stateSliders: null,
				stateRestore: false,
				hasCustomPrint: _hasCustomPrint, 
				usePrintPreviewMap: true, 
				previewMapSize: [750, 500],
				subs: false,
				updated: false,
				_mapZoomEnd: null,
				/** 
				 * Method: initialize
				 * 		The framework calls this during initial framework load from the file app\js\Plugin.js (approx line 70).
				 * Args:
				 * 		frameworkParameters {Object} - info about the external framework environment, including the app, map, legendContainer, and more
				*/
				initialize: function (frameworkParameters) {
					console.debug('habitat_explorer; main.js; initialize()');
					//domConstruct.create("div", { innerHTML: "hi" }, win.body(), "first");
					//showValueKey = this.toolbarName + " showinfographic";
				    //localStorage.setItem(showValueKey, _showOnStart);
					self = this;
					tool = this;
					declare.safeMixin(this, frameworkParameters);
					domClass.add(this.container, "claro");
					domClass.add(this.container, "cr-dojo-dijits");
					domClass.add(this.container, "plugin-multiExplorer");
					//explorerObject is a representation of the explorer.json file
					this.explorerObject = dojo.eval("[" + explorer + "]")[0];
					this.spinnerURL = localrequire.toUrl("./images/spinner.gif");
					//resetObject is a copy of the explorerObject at the time of initialize. lang.clone creates the copy and breaks the reference to explorerObject.
					this.ResetObject = lang.clone(this.explorerObject);
					if (this.explorerObject.betweenGroups == undefined) {
						this.explorerObject.betweenGroups = "+";
					}
					this.textnode = domConstruct.create("div", { innerHTML: "<p style='padding:8px'>" + this.explorerObject.text + "</p>" });
					dom.byId(this.container).appendChild(this.textnode);
					pslidernode = domConstruct.create("span", { innerHTML: "<span style='padding:5px'> </span>" });
					dom.byId(this.container).appendChild(pslidernode);
					nslidernode = domConstruct.create("span");
					dom.byId(this.container).appendChild(nslidernode);
					 //.removeClass( "sidebar-content" )
					//domStyle.set(, 'height', '300px');
					this.ddNode = domConstruct.create("span");
					dom.byId(this.container).appendChild(this.ddNode);
					this.refreshnode = domConstruct.create("span", {style: "display:none"});
					domClass.add(this.refreshnode, "plugin-report-spinner");
					this.refreshnode = domConstruct.create("span", {style: "display:none"}); //, innerHTML: "<img src=" + this.spinnerURL + ">"
					spinnernode = domConstruct.create("span", {style: "background: url(" + this.spinnerURL + ") no-repeat center center; height: 32px; width: 32px; display: inline-block; position: absolute; left: 45%;" });
					//domClass.add(this.refreshnode, "plugin-report-spinner");
					this.refreshnode.appendChild(spinnernode);
					dom.byId(this.container).appendChild(this.refreshnode);
					a = dojoquery(this.container).parent();
					this.infoarea = new ContentPane({
					  style:"z-index:10000; !important;position:absolute !important;left:310px !important;top:0px !important;width:350px !important;background-color:#FFF !important;padding:10px !important;border-style:solid;border-width:4px;border-color:#444;border-radius:5px;display: none",
					  innerHTML: "<div class='infoareacloser' style='float:right !important'><a href='#'>✖</a></div><div class='infoareacontent' style='padding-top:15px'>no content yet</div>"
					});
					dom.byId(a[0]).appendChild(this.infoarea.domNode)
					ina = dojoquery(this.infoarea.domNode).children(".infoareacloser");
					this.infoAreaCloser = ina[0];
					inac = dojoquery(this.infoarea.domNode).children(".infoareacontent");
					this.infoareacontent = inac[0];
					on(this.infoAreaCloser, "click", lang.hitch(this,function(e){
						domStyle.set(this.infoarea.domNode, 'display', 'none');
					}));
					$(this.printButton).hide();
				},
				/** 
				 * Method: activate
				 * 		The framework calls this when the user clicks on the toolbar button to use this plugin. 
				 * 		(Most likely called from the onSelectionChanged handler of app\js\Plugin.js approx line 205)
				 * Args:
				 * 		arg {boolean} - if above assumption is true, then the arg value is to direct supression of help at startup. Currently not used.
				*/
				activate: function (arg) {		
					console.debug('habitat_explorer; main.js; activate()',arg);
					this.combiner = new combine(); //TODO where/how is this used?
					if (this.currentLayer != undefined)  {
						this.currentLayer.setVisibility(true);
					}
					if (this.ancillaryLayer != undefined) {
						this.ancillaryLayer.setVisibility(true);
					}
					this.usableRegions = this.explorerObject.regions;

					//console.debug('activate(); this.stateRestore = ', this.stateRestore);
					//console.debug('activate(); this._hasactivated = ', this._hasactivated);
					//console.debug('activate(); _noZoom = ', _noZoom);

					if (this.stateRestore == false) {
						if (this._hasactivated == false) {
							//1st call to activate falls into here
							this.rebuildOptions(); 
						}
						if ((this._hasactivated == false) && (this.usableRegions.length == 1)) {
							//1st call to activate does not fall into here (because there is more than one usableRegion)
							//useableRegions[0] is the first in the array of 'regions' found in explorer.json
							this.changeGeography(this.usableRegions[0], !(_noZoom)); 
						};
					} else {
						if (this._hasactivated == false) {
							//TODO in what case does the code fall in here?
							//console.log("GEO")
							//console.log(this.geography)
							this.rebuildOptions();
							this.changeGeography(this.geography, false);
							this.stateRestore = false;
						}
					}
					if (this.subs == true) {
						//1st call to activate does not fall into here
						//something to do wiht sub-regions - 'subs' might never be true.
						//useableRegions[0] is the first in the array of 'regions' found in explorer.json
						this.changeGeography(this.usableRegions[0], !(_noZoom));
					}

					//TODO convert function handler to method.
					this._mapZoomEnd = this.map.on("zoom-end", lang.hitch(this,function(evt){
						//console.debug('map.zoom-end handler: ', this.map.getZoom());
						//console.debug('this.tabpan.selectedChildWidget.titleText = ', this.tabpan.selectedChildWidget.titleText);
					}));

					//after first call to active, this._hasactivated = true;
					this._hasactivated = true;
				},
				/** 
				 * Method: deactivate
				 * 		Called by the framework when the user minimizes this Plugin (by either clicking on the toolbar icon for this plugin when the plugin is already open 
				 * 		or using the minimize ('_') button in the top right corner of the plugin window.
				 * Args:
				 * 		
				*/
				deactivate: function () {
					console.debug('habitat_explorer; main.js; deactivate()');
					//this._ddlFirstSelectionHasOccurred = false;
					//destroy the plugin's zoom-end handling.
					
				},
				/** 
				 * Method: getState
				 * 		Used by the framework's 'Save And Share' feature as an override method for the plugin to pass plugin-specific data to the framework URL creation process.
				 * 		Note: No need to pass current map extents out as the framework appears to be handle that.
				 * Args:
				 * 		
				*/
				getState: function () {
					console.debug('habitat_explorer; main.js; getState()');
					//alert(this.geography.name)
					var stateObj = {};
					stateObj.regionName = this.geography.name;
					stateObj.tabIndex = this.tabpan.selectedChildWidget.index;
					stateObj.sliders = [];
					array.forEach(this.sliders, lang.hitch(this,function(slid, i){
						//idtable = idtable + ('<tr><td>' + slid.title + '</td> <td>' + identifyResults[0].feature.attributes[slid.index]+ '</td> <td>' + slid.value + '</td></tr>');
						stateObj.sliders.push({"title":slid.title, "index": slid.index, "value":slid.value});
					}));
					return stateObj;
				},
				/** 
				 * Method: setState
				 * 		Called by the framework with info from the google link created in the 'save and share' process.
				 * 		Called after initialize(), but before activate().
				 * Args:
				 * 		stateObj {object} - The object of values as they were set in getState(), with the addition of a 'mainToggleChecked' property
				 * 		
				*/
				setState: function (stateObj) {
					console.debug('habitat_explorer; main.js; setState()');
					//console.debug('setState(); state = ', stateObj);
					//console.debug('setState(); typeof(state) = ', typeof(stateObj));
					array.forEach(this.explorerObject.regions, lang.hitch(this,function(region, i){
						if (region.name == stateObj.regionName) {
							this.geography = region;
						}
					}));
					this.stateTabIndex = stateObj.tabIndex;
					this.stateSliders = stateObj.sliders;
					this.stateRestore = true;
				},
				/** 
				 * Method: hibernate
				 * 		Called by the framework when the user closes this plugin by clicking on the close button ('x') in the top right corner of the Plugin window. 
				 * 		Note: deactivate() is called first.
				 * Args:
				 * 		
				*/
				hibernate: function () {
					console.debug('habitat_explorer; main.js; hibernate()');
					if(this._mapZoomEnd != null){this._mapZoomEnd.remove();}
					
					//what is used to do
					if (this.currentLayer != undefined)  {
						this.currentLayer.setVisibility(false);
					}
					if (this.ancillaryLayer != undefined)  {
						this.ancillaryLayer.setVisibility(false);
					}
					// added to reset
					if (this.ancillaryLayer != undefined) {
						this.map.removeLayer(this.ancillaryLayer)
					}
					if (this.introLayer != undefined) {
						this.map.removeLayer(this.introLayer)
					}
					this.sliders = new Array();
					if (this.sliderpane != undefined) {
						this.sliderpane.destroy();
						this.map.removeLayer(this.currentLayer)
					}
					if (this.buttonpane != undefined) {
						this.buttonpane.destroy();
					}
					if (this.buttonpane != undefined) {
						this.tabpan.destroy();
					}
					domStyle.set(this.textnode, "display", "");
					if (this.button != undefined) {
						this.button.set("label",_ddText);
					}
					this._hasactivated = false;
					this.explorerObject = dojo.eval("[" + explorer + "]")[0];
				},
				/** 
				 * Method: resize
				 * 		
				 * Args:
				 * 		w {type} - description
				 * 		h {type} - description 
				*/
				resize: function(w, h) {
					console.debug('habitat_explorer; main.js; resize()');
					cdg = domGeom.position(dojoquery(this.container).parent()[0]);
					domStyle.set(this.container, 'overflow', 'hidden');
					//cdg = domGeom.position(this.container);
					if (cdg.h == 0) {
						this.sph = this.height - 155;
					} else {
						this.sph = cdg.h-170;   //73 
					}
					//this.sliderpane
					//this.sliderpane.resize({"w" : 500, "h" : this.sph})
					//if (this.tabpan != undefined) {
					//	domStyle.set(this.tabpan.domNode, "height", this.sph + "px");
					//}
					this.tabpan.resize({"w" : '100%', "h" : this.sph})
					this.tabpan.layout();
				},
				/** 
				 * Method: rebuildOptions
				 * 		
				 * Args:
				 * 		
				*/
        		rebuildOptions: function() {
					console.debug('habitat_explorer; main.js; rebuildOptions()');
					domConstruct.empty(this.ddNode);
					/*
					menu = new DropDownMenu({ style: "display: none;"});
							domClass.add(menu.domNode, "claro");
							array.forEach(this.usableRegions, lang.hitch(this,function(entry, i){
								menuItem1 = new MenuItem({
									label: entry.name,
									//iconClass:"dijitEditorIcon dijitEditorIconSave",
									onClick: lang.hitch(this,function(e){this.changeGeography(entry, !(_noZoom))})
								});
								menu.addChild(menuItem1);
							}));
							this.button = new DropDownButton({
								label: _ddText,
								style: "margin-bottom:6px !important",
								dropDown: menu
							});
							dom.byId(this.ddNode).appendChild(this.button.domNode);
					*/	
					outerBox = $('<div class="eeheader" />').appendTo($(this.ddNode));
					s = $('<select class="chosenDD chosen-select mainChosen" id=expGeoSelect" data-placeholder="' + _config.ddText + '" />')
					$('<option />', {value: "", text: ""}).appendTo(s);
					selIndex = -1;
					for(var reg in this.usableRegions) {
						region = this.usableRegions[reg];
						$('<option />', {value: region.name, text: region.name}).appendTo(s);
						if (region.selected == true) {
							selIndex = reg;
						}
					}
					if (this.usableRegions.length == 1) {
						selIndex = 0;
						this.usableRegions.selected = true;
					}
					//console.log(this.container);
					s.appendTo(outerBox);	
					ch = $(".chosenDD");
					ch.chosen({disable_search_threshold: 10});
					//.change($.proxy(function(val) {
					//  this.changeGeo(val);
					//}, this));
					//$("#eeGeoSelect_" + this.map.id).css("width", "220px");
					$("#expGeoSelect__chosen").css("width", "220px");	
					//eeGeoSelect_map_0_chosen
					this._ddlFirstSelectionHasOccurred = false;
					ch.on('chosen:hiding_dropdown', lang.hitch(this, function(e,ob) 
					{
						console.debug('rebuildOptions() DDL hiding_dropdown handling.');
						regy = ob.chosen.selected_item[0].innerText;
						//this.ResetObject is a copy of the explorerObject (explorer.json) at the time of plugin initialize.
						reseter = lang.clone(this.ResetObject);
						//find a match between selected DDL option and a region in the config.
						array.forEach(reseter.regions, lang.hitch(this,function(reg, t){
							if ($.trim(reg.name) == $.trim(regy)) {
								//set outreg to the matching region
								outreg = reg;
							}
						}));					
						//this.changeGeography(outreg, true);
						//
						if (!this._ddlFirstSelectionHasOccurred) {
							//call changeGeography with the selected region obj and a boolean for zoom to extents of the region/layer or not
							this.changeGeography(outreg, true);
						}else{
							//call changeGeography with the selected region obj and a boolean for zoom to extents of the region/layer or not
							this.changeGeography(outreg, false);
						}
						this._ddlFirstSelectionHasOccurred = true;
					}));
				},
				/** 
				 * Method: zoomToAppExtent
				 * 		
				 * Args:
				 * 		
				*/
				zoomToAppExtent: function(){
					//!! new internal method for setting extent to framework extent
					//get the app's initial extent and use for the extent
					//console.debug('this.app.regionConfig', this.app.regionConfig.initialExtent);
					var xmin,ymin,xmax,ymax;
					xmin = this.app.regionConfig.initialExtent[0];
					ymin = this.app.regionConfig.initialExtent[1];
					xmax = this.app.regionConfig.initialExtent[2];
					ymax = this.app.regionConfig.initialExtent[3];
					newextent = new Extent(xmin,ymin,xmax,ymax, new SpatialReference({ wkid:4326 }));
					this.map.setExtent(newextent, true);
				},
				/** 
				 * Method: resetAll
				 * 		
				 * Args:
				 * 		
				*/
				resetAll: function() {
					console.debug('habitat_explorer; main.js; resetAll()');
					try {
						selectedIndex = this.tabpan.selectedChildWidget.index;
						its = this.geography.tabs[selectedIndex].items;
					} catch(err) {
						selectedIndex = 0;
						its = this.geography.items
					}
					reseter = lang.clone(this.ResetObject);
					array.forEach(reseter.regions, lang.hitch(this,function(reg, t){
					if (reg.name == this.geography.name) {
						outreg = reg;	
					}
					}));
					this.changeGeography(outreg, false);
					tabs = this.tabpan.getChildren();
					this.tabpan.selectChild(tabs[selectedIndex + 1]);
				},
				/** 
				 * Method: resetTab
				 * 		
				 * Args:
				 * 		
				*/
				resetTab: function() {
					console.debug('habitat_explorer; main.js; resetTab()');
					try {
						selectedIndex = this.tabpan.selectedChildWidget.index;
						its = this.geography.tabs[selectedIndex].items;
					} catch(err) {
						selectedIndex = 0;
						its = this.geography.items
					}
					reseter = lang.clone(this.ResetObject);
					array.forEach(reseter.regions, lang.hitch(this,function(reg, t){
						if (reg.name == this.geography.name) {
							outreg = reg;
						}
					}));					
					this.geography.tabs[selectedIndex] = outreg.tabs[selectedIndex]
					this.changeGeography(this.geography, false);
					tabs = this.tabpan.getChildren();
					this.tabpan.selectChild(tabs[selectedIndex + 1]);
				},
				/** 
				 * Method: resetPanel
				 * 		
				 * Args:
				 * 		
				*/		
				resetPanel: function() {
					console.debug('habitat_explorer; main.js; resetPanel()');
					if (this.ancillaryLayer != undefined) {
						this.map.removeLayer(this.ancillaryLayer)
					}
					if (this.sliderpane != undefined) {
						this.sliderpane.destroy();
						this.map.removeLayer(this.currentLayer)
					}
					if (this.introLayer != undefined) {
						this.map.removeLayer(this.introLayer)
						this.introLayer = undefined;
					}	
					if (this.buttonpane != undefined) {
						this.buttonpane.destroy();
					}
					if (this.tabpan != undefined) {
						this.tabpan.destroy();
					}
				},
				/** 
				 * Method: changeRadio
				 * 		
				 * Args:
				 * 		
				*/
				changeRadio: function() {
					console.debug('habitat_explorer; main.js; changeRadio()');
					//var points = [];
					allRads = dojoquery("[name=RadiotabGroup]");
					AllTabs = dojoquery("[data-pane=ActualTabs]");
					//console.log(AllTabs);
					activeIndex = 0;
					array.forEach(allRads, lang.hitch(this,function(rad, t){
						myWidget = dijit.byId(rad);
						if (myWidget.checked) { activeIndex = t };
					}));
					array.forEach(AllTabs, lang.hitch(this,function(rad, t){
						myWidget = dijit.byId(rad);
						hh = domAttr.get(myWidget, "data-index");
						if (hh == activeIndex) {
							domAttr.set(myWidget, "style", "display:");
							//console.log(hh) ;
						} else {
							domAttr.set(myWidget, "style", "display:none");
						}
					}));
					this.tabpan.selectedChildWidget.index = activeIndex;
					this.updateService();
					//ActualTabs
					//alert(activeIndex);
				},
				/** 
				 * Method: changeGeography
				 * 		
				 * Args:
				 * 		geography {object} - an object from the array of 'regions' as found in explorer.json
				 * 		zoomto {boolean} - ZoomTo the layer Extents? (passes through to updateService())
				*/
				changeGeography: function(geography, zoomto) {
					console.debug('habitat_explorer; main.js; changeGeography()');
					//ga = google analytics, set in index.cshtml view, globally available
					ga('send', 'event', this.toolbarName, 'Change Dropdown: ' + geography.name);
					//geography.dataset only applies to streams. Not a very good check for vector vs raster. Could just have a property isVector in config and set that to true/false.
					if (geography.dataset == undefined) {
						this.isVector = false;
					} else {
						this.isVector = true;
					}
					if (zoomto == undefined) {
						zoomto = true;
					}
					this.geography = geography;
					this.sliders = new Array();
					//this.legendContainer.innerHTML = this.toolbarName;
					//resetPanel - remove layers from the map and destroy UI elements.
					this.resetPanel();
					//this.sliderpane = new ContentPane({
					//  style:"height:287px;border-top-style:groove !important"
					//});
					//TODO is below 'if' statement needed? Does code ever drop in there?
					if (geography.tabs == undefined) {
						geography.tabs = new Array();
						geography.tabs.push({"name":""});
						geography.tabs[0].items = geography.items
					}
					//console.log(geography.tabs);					
					if (geography.tabs.length == 1) {
						this.tabpan = new ContentPane({
							style:"padding: 8px"
							//style: "height: 100%; width: 100%;"
						});
						this.tabpan.layout = function() {console.log('layout')};
						$(this.printButton).show();
					} else {
						//explorer.json has no tabtype property for a region. why is this here?
						if (geography.tabtype == "radio") {
							this.tabpan = new ContentPane({
								style:"padding: 8px"
								//style: "height: 100%; width: 100%;"
							});	
							this.Radios = domConstruct.create("div");
							dom.byId(this.tabpan.domNode).appendChild(this.Radios);
							array.forEach(geography.tabs, lang.hitch(this,function(tab, t){
								RadioNode = domConstruct.create("div");
								this.Radios.appendChild(RadioNode);
									if (t == 0) {sel = true} else {sel = false};
									radioControl = new RadioButton({
											name: "RadiotabGroup",
											value: true,
											index: t,
											order: 0,
											title: tab.name,
											checked: sel,
											onChange: lang.hitch(this,function(){this.changeRadio()}),
											}, RadioNode);
									this.Radios.appendChild(domConstruct.create('span', {innerHTML: tab.name + "<br>"}));
								}));
							this.tabpan.selectedChildWidget = {index: 0}
						} else {
							this.tabpan = new TabContainer({
								//style: "height: 100%; width: 100%;"
							});
						}
						//this.tabpan.layout = function() {console.log('layout')};
					}
					//reset some UI css
					this.resize();
					//this.sliderpane = new ContentPane({
					  //style:"height:" + this.sph + "px;border-top-style:groove !important"
					//});
					dom.byId(this.container).appendChild(this.tabpan.domNode);
					this.buttonpane = new ContentPane({
					  	style:"border-top-style:groove !important; height:80px;overflow: hidden !important;!important;padding:2px !important;", innerHTML: '<table style="width:100%;padding:0; margin:0"><tr><td style="padding:2px; margin:0"></td><td style="padding:2px; margin:0"></td style="padding:2px; margin:0"></tr><tr><td colspan="2" style="padding:2px; margin:0"></td></tr></table>'
					});
					dom.byId(this.container).appendChild(this.buttonpane.domNode);
					parser.parse();
					tds = dojoquery("td", this.buttonpane.domNode);
					ulnode = (dojoquery(tds[0]));
					thing = dojoquery(ulnode)[0];
					ulnode = domConstruct.create("span");
					thing.appendChild(ulnode);
					urnode = (dojoquery(tds[1]));
					thing = dojoquery(urnode)[0];
					urnode = domConstruct.create("span");
					thing.appendChild(urnode);
					llnode = (dojoquery(tds[2]));
					thing = dojoquery(llnode)[0];
					llnode = domConstruct.create("span");
					thing.appendChild(llnode);
					/*
 					exportButton = new Button({
						label: "Export",
						style:  "float:right !important;",
						onClick: function(){
							exportUrl = geography.url + "/exportImage";
							layersRequest = ESRIRequest({
							  url: exportUrl,
							  content: { f: "json" ,pixelType : "F32", format: "tiff", bbox: "-9852928.2643,3522013.8941000025,-9761488.2643,3630213.8941000025", noDataInterpretation: "esriNoDataMatchAny", interpolation: "RSP_BilinearInterpolation"},
							  handleAs: "json",
							  callbackParamName: "callback"
							});
							layersRequest.then(
							  function(response) {
								//console.log("Success: ", response);
								window.open(response.href)
							}, function(error) {
								//console.log("Error: ", error.message);
							});
							}
							//window.open(geography.url + "/exportImage")}
						});
					this.buttonpane.domNode.appendChild(exportButton.domNode); 
					*/
					//!not on the UI...
					SyncButton = new ToggleButton({
						label: "Sync Maps",
						checked: false,
						style:  "float:left !important; display:none;",
						onClick: lang.hitch(this, this.syncMaps)
					});	
					ulnode.appendChild(SyncButton.domNode);
					//methods property is a URL in config
					if (geography.methods != undefined) {
						methodsButton = new Button({
							label: "Methods",
							style:  "float:right !important;",
							onClick: function(){window.open(geography.methods)}
							});
						urnode.appendChild(methodsButton.domNode);
					}
					if (geography.tabs.length > 1) {
						if (geography.tabtype != "radio") {
							// CombineButton = new ToggleButton({
							// 	label: "View Combined Score",
							// 	checked: false,
							// 	style:  "float:right !important;"//,
							// 	//onClick: function(){window.open(geography.methods)}
							// });
							//this.buttonpane.domNode.appendChild(CombineButton.domNode);
							//CombineButton.startup();
							resetButton = new Button({
								label: "Reset Tab",
								style:  "float:left !important;",
								title: "Resets sliders to defaults (all Medium) for just the currently open tab.",
								onClick: lang.hitch(this, this.resetTab)
							});
							ulnode.appendChild(resetButton.domNode);
						}
					}
					//resize again!?
					//this.resize();
					resetAllButton = new Button({
						label: "Reset All",
						style:  "float:left !important;",
						title: "Resets all sliders within the app, across all 4 tabs, to Medium.",
						onClick: lang.hitch(this, this.resetAll)
					});
					ulnode.appendChild(resetAllButton.domNode);
					if (this.explorerObject.mainToggle != undefined) {
						/*	
						if (this.explorerObject.mainToggle.default == undefined) {
						  this.explorerObject.mainToggle.default = 1;
						}
						//brtext = domConstruct.create("span", {style:"float:left !important;", innerHTML: "<br>"});
						//this.buttonpane.domNode.appendChild(brtext);
						mainchecknode = domConstruct.create("input", {style:"float:left !important;", innerHTML: ""});
						llnode.appendChild(mainchecknode);
						this.MainCheck = new CheckBox({
						name: "ExplorerCheck",
						value: 1,
						title: this.explorerObject.mainToggle.text,
						checked: this.explorerObject.mainToggle.default,
						onChange: lang.hitch(this,function(e) {this.currentLayer.setVisibility(e)}),
						}, mainchecknode);
						parser.parse()
						mainchecknodetext = domConstruct.create("span", {style:"float:left !important;", innerHTML: this.explorerObject.mainToggle.text , for: this.MainCheck.id});
						llnode.appendChild(mainchecknodetext);
						*/
						//Transparency Slider
						var trslider = new HorizontalSlider({
							name: "slider",
							value: 0,
							minimum: 0,
							maximum: 1,
							showButtons: false,
							intermediateChanges: true,
							style: "width:130px;margin-top:20px",
							onChange: lang.hitch(this,function(e) {this.currentLayer.setOpacity(1-e)})
						})
						mainchecknodetext = domConstruct.create("span", {style:"float:left !important; margin:10px; height: 40px", innerHTML: this.explorerObject.mainToggle.text });
						llnode.appendChild(mainchecknodetext);
						llnode.appendChild(trslider.domNode);							
						
					}
					domStyle.set(this.textnode, "display", "none");
					// if (this.explorerObject.globalText != undefined) {
					// 	explainText = domConstruct.create("div", {style:"margin-top:0px;margin-bottom:10px", innerHTML: this.explorerObject.globalText});
					// 	//MUST ADD THIS BACK 
					// 	//this.sliderpane.domNode.appendChild(explainText);
					// }
					////this.button.set("label",geography.name);
					
					//if (geography.tabs != undefined) {
					//		localitems = geography.tabs[0].items;
					//} else {
					//		localitems = geography.items;
					//}
					//Instructions Tab
					if (geography.intro != undefined) {
						this.sliderpane = new ContentPane({
							//	style:"padding: 8px",
							//  style:"height:" + this.sph + "px !important",
							style: "display: none",
							title: geography.intro.name,
							index: -1,
							"data-index": -1,
							content: geography.intro.text
						});	
						this.sliderpane.titleText = geography.intro.name;//LM hanging on a new sliderpane property for easy access to the tab title name
						this.tabpan.addChild(this.sliderpane);	
					}
					//alert(geography.intro.layer.url)
					if (this.introLayer != undefined) {
						this.introLayer = new ArcGISDynamicMapServiceLayer(geography.intro.layer.url,{
							useMapImage: true
						});
						this.introLayer.setVisibleLayers(geography.intro.layer.show)
						this.map.addLayer(this.introLayer);
					}
					ancillaryon = new Array();
					//iterate over tabs array from config
					array.forEach(geography.tabs, lang.hitch(this,function(tab, t){
						if (tab.hoverText == undefined) { tab.hoverText = "" }
						this.sliderpane = new ContentPane({
							//	style:"padding: 8px",
							//style:"width:344px !important",
							"data-pane": "ActualTabs",
							//style: "display: none",
							title: '<span title="' + tab.hoverText + '">' + tab.name + '</span>',
							
							"data-index": t,
							index: t
						});	
						this.sliderpane.titleText = tab.name;//LM adding a new sliderpane property for easy access to the tab title name
						this.tabpan.addChild(this.sliderpane);
						//this.tabs.push(this.sliderpane);						
						itemIndex = 0;
						//iterate over tab items
						array.forEach(tab.items, lang.hitch(this,function(entry, i){
							/*
							if (this.explorerObject.mainToggle != undefined) {
								if (this.explorerObject.mainToggle.default == undefined) {
									this.explorerObject.mainToggle.default = 1;
								}
								if (this.explorerObject.mainToggle.index == i) {
									mainchecknode = domConstruct.create("input", {style:"margin-top:0px;margin-bottom:10px;display:inline !important", innerHTML: ""});
									this.sliderpane.domNode.appendChild(mainchecknode);
												this.MainCheck = new CheckBox({
												name: "ExplorerCheck",
												value: 1,
												title: this.explorerObject.mainToggle.text,
												checked: this.explorerObject.mainToggle.default,
												onChange: lang.hitch(this,function(e) {this.currentLayer.setVisibility(e)}),
												}, mainchecknode);
												parser.parse()
									mainchecknodetext = domConstruct.create("span", {style:"margin-top:0px;margin-bottom:10px;display:inline", innerHTML: this.explorerObject.mainToggle.text + "<br>", for: this.MainCheck.id});
									this.sliderpane.domNode.appendChild(mainchecknodetext);
								}
							}
							*/
							if (entry.group == undefined) {
								entry.group = "ungrouped";
							}
							//config does not have any of the 'hr' type currently
							if (entry.type == "hr") {
								hrn = domConstruct.create("hr", {style:""});
								this.sliderpane.domNode.appendChild(hrn);
							}
							//config does not have any of the 'ancillary' type currently
							if (entry.type == "ancillary") {
								nslidernode = domConstruct.create("div");
								this.sliderpane.domNode.appendChild(nslidernode);
								slider = new CheckBox({
									name: entry.group,
									value: entry.default,
									index: entry.index,
									minimum: entry.min,
									maximum: entry.max,
									title: entry.text,
									checked: entry.default,
									onChange: lang.hitch(this,function(e) {
										fx = lang.hitch(this,this.processAncillary);
										fx(e,entry)
									}),
								}, nslidernode);
								parser.parse()
								if (entry.default == 1) {
								ancillaryon.push(entry)
								}
								if (entry.help != undefined) {
									nslidernodeheader = domConstruct.create("div", {
										style: "display:inline", 
										innerHTML: "<span style='color:#000'> <a style='color:black' href='#' title='" + 'Click for more information.' + "'><img src='data:image/png;base64,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'></a>  " + entry.text + "</span><br>"
									});
								} else {
									nslidernodeheader = domConstruct.create("div", {
										style:"display:inline", 
										innerHTML: " " + entry.text + "<br>"
									});
								}
								on(nslidernodeheader, "click", lang.hitch(this,function(e){
									domStyle.set(this.infoarea.domNode, 'display', '');
									this.infoareacontent.innerHTML = entry.help;
								}));
								this.sliderpane.domNode.appendChild(nslidernodeheader);
								nslidernodeheader = domConstruct.create("div", {
									style:"margin:3px", 
									innerHTML: ""
								});
								this.sliderpane.domNode.appendChild(nslidernodeheader);
							}
							//config does not have any of the 'header' type currently
							if (entry.type == "header") {
								nslidernodeheader = domConstruct.create("div", {
									style:"margin-top:0px;margin-bottom:10px", 
									innerHTML: "<b>" + entry.text + ":</b>"
								});
								this.sliderpane.domNode.appendChild(nslidernodeheader);
							}
							//
							if (entry.type == "text") {
								nslidernodeheader = domConstruct.create("div", {
									style:"margin-top:10px;margin-bottom:10px", 
									innerHTML: entry.text
								});
								this.sliderpane.domNode.appendChild(nslidernodeheader);
							}
							//
							if (entry.type == "layer") {
								steps = ((entry.max - entry.min) / entry.step) + 1;
								outslid = "";
								middle = Math.round((steps / 2) - 0.5)
								for (i=0; i<steps; i++)  {
									if ((steps - 1)  == i) {
										outslid = outslid + "<li>High</li>"
									} else if (i == 1) {
										outslid = outslid + "<li>Low</li>"
									} else if (i == middle) {
										outslid = outslid + "<li>Medium</li>"
									} else {
										outslid = outslid + "<li></li>"
									}
								}
								if (this.geography.tabs[t].sliderLabels == undefined) {
									lSliderLabels = this.geography.sliderLabels;	
								} else {
									lSliderLabels = this.geography.tabs[t].sliderLabels;
								}
								if (lSliderLabels != undefined) {
									outslid = "<li>" + lSliderLabels.join("</li><li>") + "</li>"
								}
								if (steps == 2) {
									//slider steps == 2
									nslidernode = domConstruct.create("div");
									this.sliderpane.domNode.appendChild(nslidernode);
									if (entry.group.slice(0,4) == "muex") {
										rorc = RadioButton;
									} else {
										rorc = CheckBox;
									}
									slider = new rorc({
										name: this.sliderpane.id + "_" + entry.group,
										value: entry.default,
										index: entry.index,
										order: i,
										minimum: entry.min,
										maximum: entry.max,
										title: entry.text,
										checked: entry.default,
										onChange: lang.hitch(this,function(){
											this.updateService();
											}),
										}, nslidernode);
										parser.parse()
									if (entry.visible == false)
									{ vtext = "display:none"
									domStyle.set(slider.domNode, 'display', 'none');
									}
									else {vtext = "display:inline"}
									if (entry.help != undefined) {
										nslidernodeheader = domConstruct.create("span", {style: vtext, innerHTML: "<span style='color:#000'> <a style='color:black' href='#' title='" + 'Click for more information.' + "'><img src='data:image/png;base64,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'></a>  " + entry.text + " </span>"});
									} else {
										nslidernodeheader = domConstruct.create("span", {style: vtext, innerHTML: " " + entry.text + "<br>"});
									}
									on(nslidernodeheader, "click", lang.hitch(this,function(e){
										domStyle.set(this.infoarea.domNode, 'display', '');
										this.infoareacontent.innerHTML = entry.help;
									}));
									this.sliderpane.domNode.appendChild(nslidernodeheader);
									nslidernodeheader = domConstruct.create("div", {
										style:"margin:3px", 
										innerHTML: ""
									});
									this.sliderpane.domNode.appendChild(nslidernodeheader);
								} else { 
									//TODO slider steps != 2 (might be more, might be less - is this a rock solid check?)
									if (entry.help != undefined) {
										nslidernodetitle = domConstruct.create("span", {
											innerHTML: "<span style='color:#000'> <a style='color:black' href='#' title='" + 'Click for more information.' + "'><img src='data:image/png;base64,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'></a>  " + entry.text + " </span>"
										});
									} else {
										nslidernodetitle = domConstruct.create("span", {
											innerHTML: entry.text
										});
									}
									
									on(nslidernodetitle, "click", lang.hitch(this,function(e){
										domStyle.set(this.infoarea.domNode, 'display', '');
										this.infoareacontent.innerHTML = entry.help;
									}));
									//nslidernodetitle = domConstruct.create("div", {innerHTML: entry.text});
									this.sliderpane.domNode.appendChild(nslidernodetitle);
									
									if (entry.ancillary != undefined) {
										//ancillaryNode = domConstruct.create("div", {style: "display:inline", innerHTML: "Hello "});
										//this.sliderpane.domNode.appendChild(ancillaryNode);
										ancillaryNode = domConstruct.create("span");
										this.sliderpane.domNode.appendChild(ancillaryNode);
										var checkBox = new CheckBox({
											name: "ExplorerAncillaryCheck",
											value: entry.text,
											checked: false,
											onChange: lang.hitch(this,function(b){
												if (!b) {
													if (this.ancillaryLayer2 != undefined) {
														this.map.removeLayer(this.ancillaryLayer2)
														dojo.destroy(this.ancillaryLayer2);
														//console.log('removean');
													}
												} else {
													this.addAncillary(b,entry.ancillary, entry.text)	
												}
											}),		
										}, ancillaryNode);
										parser.parse();
										//ancillary
									}	
									nslidernode = domConstruct.create("div");
									this.sliderpane.domNode.appendChild(nslidernode);
									labelsnode = domConstruct.create("ol", {"data-dojo-type":"dijit/form/HorizontalRuleLabels", container:"bottomDecoration", style:"height:1.5em;font-size:75%;color:gray;", innerHTML: outslid})
									nslidernode.appendChild(labelsnode);
									//set slider value from config default or overwrite from passed in state obj.
									var sliderValue = entry.default;
									if(this.stateSliders != null){
										//console.debug('using stateSlider value!');
										array.forEach(this.stateSliders, lang.hitch(this,function(stateSliderInfo, i){
											if(entry.index == stateSliderInfo.index){
												sliderValue = stateSliderInfo.value;
											}
										}));
									}
									slider = new HorizontalSlider({
										name: entry.group,
										"data-mexslider": "mexSlider",
										//value: entry.default,
										value: sliderValue,
										minimum: entry.min,
										maximum: entry.max,
										showButtons:false,
										title: entry.text,
										//intermediateChanges: true,
										tabindex: t, //helper prop, the parent tab's position in the group of Tab Panel tabs (as iterated over by the array.forEach() method).
										order: itemIndex, //helper prop to determin the order that the sliders were created in.
										discreteValues: steps,
										index: entry.index,
										onChange: lang.hitch(this,function(){
											//fires before onClick
											//console.debug('slider onChange handling.');
											this.updateService()
										}),
										onClick: lang.hitch(this,function(b){ 
											//console.debug('slider onClick handling.');
											allChecks = dojoquery("[name=ExplorerAncillaryCheck]");
											array.forEach(allChecks, lang.hitch(this,function(checkerBox, j){
												cb = registry.byId(checkerBox.id);
												cb.set("checked", false);
											}));
										}),
										style: "width:500px;margin-top:10px;margin-bottom:20px"
									}, nslidernode); //nslidernode 

									parser.parse()
								}
								this.sliders.push(slider);
							} // end- if (entry.type == "layer")
							itemIndex = itemIndex + 1
						}));// end- array.forEach(tab.items...
					}));// end- array.forEach(geography.tabs...
					//clear the 'state' vars in case they were set/used in initial load from 'save and share' link (see method setState()).
					this.stateTabIndex = null;
					this.stateSliders = null;
					//set up the Recommendations tab
					if (geography.combined != undefined) {
						if (geography.combined.hoverText == undefined) {
							geography.combined.hoverText == "";
						};
						this.sliderpane = new ContentPane({
							style:"padding: 8px",
							//  style:"height:" + this.sph + "px !important",
							style: "display: none",
							title: '<span title="' + geography.combined.hoverText + '">' + geography.combined.name + '</span>',
							index: geography.tabs.length,
							content: geography.combined.text
						});	
						this.sliderpane.titleText = geography.combined.name;//LM hanging on a new sliderpane property for easy access to the tab title name
						this.tabpan.addChild(this.sliderpane);						
					}
					//	if (geography.combined.selected == true) {
					//			this.tabpan.selectChild(this.sliderpane);
					//	}
					//below is the only use of dojo/aspect in this file. Should this be dojo/on?
					aspect.after(this.tabpan, "selectChild", lang.hitch(this,function (e, o) {
						//called after selecting a new tab in the tab control
						console.debug('Tab container selectChild event handling....');
						//again with the resize()... still needed?
						this.resize();
						selindex = o[0].index;
						if (selindex != -1) {
							if (this.introLayer != undefined) {
								  this.map.removeLayer(this.introLayer);
							}
							$(this.printButton).show();
						} else {
							$(this.printButton).hide();
							this.introLayer = new ArcGISDynamicMapServiceLayer(geography.intro.layer.url,{
								useMapImage: true
							});
							this.introLayer.setVisibleLayers(geography.intro.layer.show)
							this.map.addLayer(this.introLayer);
						}
						if (selindex == geography.tabs.length) {
							//'Recommendations' tab
							a = lang.hitch(this,function(){this.doCombined()})
							a();
						} else {
							//all other tabs
							a = lang.hitch(this,function(){this.updateService()})
							a();
						}
						//again with the resize()... still needed?
						this.resize();
					}));
					this.tabpan.startup();

					if (this.isVector == true)  {
						this.currentLayer = new ArcGISDynamicMapServiceLayer(geography.url);
					} else {
						params = new ImageServiceParameters();
						params.interpolation = ImageServiceParameters.INTERPOLATION_NEARESTNEIGHBOR
						//params.noData = 0;
						this.currentLayer = ArcGISImageServiceLayer(geography.url, {
						  imageServiceParameters: params,
						  opacity: 1
						});
						//this.sliderpane.set("tooltip", "Yo")
					}
					dojo.connect(this.currentLayer, "onLoad", lang.hitch(this,function(e){
						//alert(this.currentLayer.bands);
						//array.forEach(this.currentLayer.bands, function(thing) {alert(thing.max)});
						//bc = this.currentLayer.bandCount
						//for (var i=1; i<=bc; i++) {
						//		alert(i);
						//	}
						//alert(zoomto)
						this.updateService(zoomto);
					}));
					dojo.connect(this.currentLayer, "onUpdateStart", lang.hitch(this,function () {
						//console.log("Update started...");
						domAttr.set(this.refreshnode, "style", "display:");
					}));
					dojo.connect(this.currentLayer, "onUpdateEnd", lang.hitch(this,function () {
						//console.log(this.currentLayer.fullExtent)
						//console.log("Update Ended...");
						domAttr.set(this.refreshnode, "style", "display:none");
						this.map.resize();
					}));
					//this.MainCheck.setChecked(true)
					//domStyle.set(this.MainCheck.domNode, "display", "");
					if (geography.ancillaryUrl != undefined) {
						this.ancillaryLayer = new ArcGISDynamicMapServiceLayer(geography.ancillaryUrl,{
							useMapImage: true
						});
						slayers = new Array();
						array.forEach(ancillaryon, lang.hitch(this,function(entry, i){
							slayers.push(entry.index)
						}))
						this.ancillaryLayer.setVisibleLayers(slayers)
						this.map.addLayer(this.ancillaryLayer);
					}
					this.map.addLayer(this.currentLayer);
					if (geography.tabtype == "radio") {
					 	this.changeRadio();
					}
					//
					this.resize();

					//settting the selected tab via 'state' is near the bottom here because the 'selectChild' evetn hanlding needs to have this.currentLayer populated.
					if(this.stateTabIndex != null){
						try{
							var tabsArr = this.tabpan.getChildren();
							this.tabpan.selectChild(tabsArr[this.stateTabIndex + 1]); 
						} catch(e){
							//most likely reason to fall in here would be an out-of-bounds index for the tabsarr index
							console.error('Unable to set current tab.');
						}
					}
					

			   	},
				/** 
				 * Method: syncMaps
				 * 		
				 * Args:
				 * 		
				*/ 
			   	syncMaps: function() {
					console.debug('habitat_explorer; main.js; syncMaps()');
					allslids = dojoquery("[data-mexslider=mexSlider]");
					//console.log(allslids);
					array.forEach(allslids, lang.hitch(this,function(entry, i){
						sl = registry.byId(entry);
						//console.log(sl.getvalue());
					}));	
				},
				/** 
				 * Method: addAncillary
				 * 		
				 * Args:
				 * 		b {type} - description 
				 * 		ancillary {type} - description
				 * 		compText {type} - description
				 * 		
				*/
				addAncillary: function(b,ancillary, compText) {
					console.debug('habitat_explorer; main.js; addAncillary()');
					//if (b) {
					this.ancillaryLayer2 = new ArcGISDynamicMapServiceLayer(ancillary.url,{
						useMapImage: true
					});
					this.ancillaryLayer2.setVisibleLayers(ancillary.show)
					this.map.addLayer(this.ancillaryLayer2);
					allChecks = dojoquery("[name=ExplorerAncillaryCheck]");
					array.forEach(allChecks, lang.hitch(this,function(checkerBox, j){
						if (checkerBox.value != compText) {
							//alert('');
							cb = registry.byId(checkerBox.id);
							cb.set("checked", false);
							//checkerBox.checked = false;
							//dojoquery(checkerBox).set("checked", false);
						}
					}));
					//} else {
					//}
				},
				/** 
				 * Method: processAncillary
				 * 		
				 * Args:
				 * 		e {type} - description 
				 * 		entry {type} - description
				 * 		
				*/
				processAncillary: function(e,entry) {
					console.debug('habitat_explorer; main.js; processAncillary()');
					slayers = this.ancillaryLayer.visibleLayers;
					if (e == false) {
						outslayers = new Array();
						for(i in slayers){
							if(slayers[i] != entry.index){
								outslayers.push(slayers[i]);
							}
						}
						array.forEach(this.geography.items, lang.hitch(this,function(gitem, j){
								if (gitem.type == "ancillary") {
								if (gitem.index == entry.index) {
									gitem.default = 0;
								}
								}
						}));
					} else {
					slayers.push(entry.index)
						outslayers = slayers;
						array.forEach(this.geography.items, lang.hitch(this,function(gitem, j){
							if (gitem.type == "ancillary") {
								if (gitem.index == entry.index) {
									gitem.default = 1;
								}
							}
						}));
					}
					this.ancillaryLayer.setVisibleLayers(outslayers)
				},
				/** 
				 * Method: getFormula
				 * 		
				 * Args:
				 * 		tabIndex {integer} - The index number of a Tab in the Tab Panel
				 * 		
				*/
			   	getFormula: function(tabIndex) {
					console.debug('habitat_explorer; main.js; getFormula()');
					this.BandFormula = new Array();
					this.GroupTotals = new Array();
					this.BandFormulaNames = new Array();
					cgroup = "";
					array.forEach(this.sliders, lang.hitch(this,function(slide, i){
						//slide.tabindex is the index position of the slider's parent tab in the group of tabs that are in the tab panel. Set at the time of slider creation
						//checking the passed in tab index equality with slider.tabindex finds sliders that are in the panel of the passed in tab 
						if (tabIndex == slide.tabindex) {
							if (slide.name != cgroup) {
								if (cgroup != "") {
									this.BandFormula.push(cbf)
									this.BandFormulaNames.push(cbfnames)
									this.GroupTotals.push(hottytot)
								}
								cbf = new Array();
								cbfnames = new Array();
								hottytot = 0;
								cgroup = slide.name;
							}
							if (slide.checked != undefined) {
								if (slide.checked == true) {
									slide.value = 1;
								} else {
									slide.value = 0;
								}
							}
							//console.log("###### RR", slide)
							this.geography.tabs[tabIndex].items[slide.order].default = slide.value;
							//console.log("%%%%",this.geography, slide, slide.value, slide.order)
							if (slide.value > 0) {
								cbf.push("(" + slide.value + " * " + slide.index + ")");
								cbfnames.push("(" + slide.value + " * " + slide.title + ")");
								//hottytot.push(slide.value)
								hottytot = hottytot + slide.value;
							}
							array.forEach(this.geography.tabs[tabIndex].items, lang.hitch(this,function(gitem, j){
								if (gitem.type == "layer") {
									if (gitem.index == slide.index) {
										gitem.default = slide.value;
									}
								}
							}));
						}
					}));
					this.BandFormula.push(cbf);
					this.BandFormulaNames.push(cbfnames);
					this.GroupTotals.push(hottytot);
					outform = new Array();
					outformName = new Array();
					array.forEach(this.BandFormula, lang.hitch(this,function(bgroup, i){
						if (this.explorerObject.averageGroups == true) {
							if (bgroup.length > 0) {
								outform.push("((" + bgroup.join(" + ") + ") / " + this.GroupTotals[i] + ")");
							}
						} else {
							outform.push("(" + bgroup.join(" + ") + ")");
						}
					}));
					//alert(this.BandFormula.join(" + "));
					array.forEach(this.BandFormulaNames, lang.hitch(this,function(bgroup, i){
						if (this.explorerObject.averageGroups == true) {
							if (bgroup.length > 0) {
								outformName.push("((" + bgroup.join(" + ") + ") / " + this.GroupTotals[i] + ")");
							}
						} else {
							outformName.push("(" + bgroup.join(" + ") + ")");
						}
					}));
					if (this.geography.tabs[tabIndex].name != undefined) {
						outforme = this.geography.tabs[tabIndex].name;
					} else {
						outforme = "Data Layer"
					}
					this.geography.BandFormulaText = outforme + " = " + outformName.join(" " + this.explorerObject.betweenGroups + " ");
					cformula = outform.join(" " + this.explorerObject.betweenGroups + " ");
					if (true) {
						if (this.geography.tabs[tabIndex].inputRanges == undefined) {
							linputRanges = this.geography.inputRanges;
						} else {
							linputRanges = this.geography.tabs[tabIndex].inputRanges;
						}
						if (this.geography.tabs[tabIndex].outputValues == undefined) {
							loutputValues = this.geography.outputValues;
						} else {
							loutputValues = this.geography.tabs[tabIndex].outputValues;
						}
						if (cformula == "") {cformula = "(B1 * 0)"; 
						this.BandFormula[0] = "(B1 * 0)"};
						rasterFunction = new RasterFunction();
						//console.log("DDDDDDDDDD###")
						//console.log(this.BandFormula);
						//console.log(this.GroupTotals);
						bf = this.BandFormula[0]
						bffs = new Array();
						for(var i=0; i<bf.length; i++){
							rasterFunction.functionName = "BandArithmetic";
										arguments = {"Raster" : "$$"};
										arguments.Method= 0;
										arguments.BandIndexes = bf[i]  //this.formula;
										rasterFunction.arguments = arguments;
										rasterFunction.variableName = "L" + i;
							rasterFunction.outputPixelType = "U16";
							bffs.push(lang.clone(rasterFunction));
							//console.log(bf[i]);
						}
						//if (bffs.length == 1) {
						rfout = bffs[0];			
						//} else {
						for(var i=0; i<(bffs.length -1); i++){	
							//console.log(bffs[i+1])
							rft = new RasterFunction();
							rft.functionName = "Local";
							rft.functionArguments = {
							"Operation" : 1,
							"Rasters" : [rfout, bffs[i+1]]
							};
							rft.variableName = "T" + i;
							rft.outputPixelType = "U16";
							rfout = lang.clone(rft)
						}
						rf1h3 = new RasterFunction();
						rf1h3.functionName = "Local";
						rf1h3.functionArguments = {
						"Operation" : 23,
						"Rasters" : [rfout, this.GroupTotals[0]]
						};
						rf1h3.variableName = "riskOutput";
						rf1h3.outputPixelType = "u16";	
						this.crasta = rf1h3
					}
					return cformula
				},
				/** 
				 * Method: doCombined
				 * 		Called only once in this file from the tab selectionChanged event (defined within the changeGeography() method) when the 'Recommendations' tab is selected.
				 * 		Looks like it plays a similar role to the updateService() method
				 * Args:
				 * 		
				*/
			   	doCombined: function() {
					console.debug('habitat_explorer; main.js; doCombined()');
					this.currentLayer.setVisibility(true);
					this.legendContainer.innerHTML  = "";
					this.formulas = new Array();
					this.Tformulas = new Array();
					rfuncs = new Array();
					array.forEach(this.geography.tabs, lang.hitch(this, function(tab, t){
						formula = this.getFormula(t);
						this.formulas.push(formula);
						this.Tformulas.push(this.geography.BandFormulaText);
						rfuncs.push(lang.clone(this.crasta));
					}));
					if (this.isVector == true)  {
						rfout = this.combiner.vectorCombineFunction(this.formulas, this.geography, this.Tformulas);
						this.vectorIdentifyQuery = rfout.outquery;
						var dynamicLayerInfo = new esri.layers.DynamicLayerInfo();
						dynamicLayerInfo.id = 1;
						dynamicLayerInfo.name = this.toolbarName + " - " + this.geography.name;
						var dataSource = new esri.layers.QueryDataSource();
						dataSource.workspaceId = this.geography.workspaceId;
						dataSource.geometryType = this.geography.geometryType;
						dataSource.query = rfout.outquery; 
						dataSource.oidFields = ["objectid"];
						this.layerSource = new esri.layers.LayerDataSource();
						this.layerSource.dataSource = dataSource;
						dynamicLayerInfo.source = this.layerSource;
						var dynamicLayerInfos = [];
						dynamicLayerInfos.push(dynamicLayerInfo);
						this.currentLayer.setDynamicLayerInfos(dynamicLayerInfos);

						this.dli = dynamicLayerInfos;
						
						var layerDrawingOptions = [];
						var layerDrawingOption = new esri.layers.LayerDrawingOptions();
						layerDrawingOption.renderer = rfout.renderRule;
						layerDrawingOptions[1] = layerDrawingOption;
						this.currentLayer.setLayerDrawingOptions(layerDrawingOptions);
						this.legendContainer.innerHTML = '<div id="mExplorerLegend' + "_" + this.map.id + '">' + rfout.legendHTML + "</div>";
						this.map.resize();
					} else {
						//Not Vector...
						rfout = this.combiner.combineFunction(this.formulas, this.geography, this.Tformulas, rfuncs);
						this.legendContainer.innerHTML = '<div id="mExplorerLegend' + "_" + this.map.id + '">' + rfout.legendHTML + "</div>"
						this.currentLayer.setRenderingRule(rfout.renderRule);
					}
				},
				/** 
				 * Method: updateService
				 * 		
				 * Args:
				 * 		zoomto {boolean} - Zoom to extents of the layer
				 * 		
				*/
				updateService: function(zoomto) {
					console.debug('habitat_explorer; main.js; updateService()');
					this.legendContainer.innerHTML  = "";
					if (zoomto == undefined) {
						zoomto = false;
					}
					//console.log(this.sliders)
					try {
						selectedIndex = this.tabpan.selectedChildWidget.index;
						orgselectedIndex = this.tabpan.selectedChildWidget.index;
					} catch(err) {	
						selectedIndex = 0;
						orgselectedIndex = 0;
					}
					//if ((selectedIndex > -1)  && (this.updated == true)) {
					regfixname = " - " + this.geography.name;
					try {
						its = this.geography.tabs[selectedIndex].items;
						ctabname = " <br> Score for " + this.geography.tabs[selectedIndex].name;
					} catch(err) {
						selectedIndex = 0;
						its = this.geography.items;
						ctabname = "";
					}
					//this.currentLayer.show();
					this.currentLayer.setVisibility(true);
					this.updated = true;
					//perhaps this needs to be done sometime but it appears to work now.
					//formget = lang.hitch(this,this.getFormula(selectedIndex))
					this.formula = this.getFormula(selectedIndex);
					if (this.geography.tabs[selectedIndex].colorRamp == undefined) {
						lcolorRamp = this.geography.colorRamp;
					} else {
						lcolorRamp = this.geography.tabs[selectedIndex].colorRamp;
					}
					if (this.geography.tabs[selectedIndex].inputRanges == undefined) {
						linputRanges = this.geography.inputRanges;
					} else {
						linputRanges = this.geography.tabs[selectedIndex].inputRanges;
					}
					if (this.geography.tabs[selectedIndex].outputValues == undefined) {
						loutputValues = this.geography.outputValues;
					} else {
						loutputValues = this.geography.tabs[selectedIndex].outputValues;
					}	  					
					if (this.isVector == true)  {
						//STREAMS
						//console.debug('habitat_explorer; main.js; updateService(); isVector = ', this.isVector);
						indFields = [];
						legIndexes = [0,1,2];
						array.forEach(its, lang.hitch(this,function(item, i){
							if (item.type == "layer") {
							indFields.push(item.index);
							}
						}));
						oFields = this.geography.reqFields.join(", ");
						iFields = indFields.join(", ");
						if (this.formula == "") {
							this.formula = "0::integer";
						}
						//console.log("SELECT " + oFields + ", " + iFields + ", " + this.formula + " AS score FROM " + this.geography.dataset);
						var dynamicLayerInfos = [];
						var dynamicLayerInfo = new esri.layers.DynamicLayerInfo();
						dynamicLayerInfo.id = 1;
						dynamicLayerInfo.name = this.toolbarName + " - " + this.geography.name;
						var dataSource = new esri.layers.QueryDataSource();
						dataSource.workspaceId = this.geography.workspaceId;
						dataSource.geometryType = this.geography.geometryType;
						dataSource.query = "SELECT " + oFields + ", " + iFields + ", " + this.formula + " AS score FROM " + this.geography.dataset;
						dataSource.oidFields = ["objectid"]
						minquery = "SELECT " + this.formula + " AS score FROM " + this.geography.dataset
						this.layerSource = new esri.layers.LayerDataSource();
						this.layerSource.dataSource = dataSource;
						dynamicLayerInfo.source = this.layerSource;
						dynamicLayerInfos.push(dynamicLayerInfo);
						this.currentLayer.setDynamicLayerInfos(dynamicLayerInfos);
						var queryTask = new QueryTask(this.currentLayer.url + "/dynamicLayer", { source: this.layerSource });
						var allFields = this.geography.reqFields.concat(indFields);
						allFields.push("score");
						// ***************** Old style classification done on Client **************  FOR SOME REASON THIS IS ACTUALLY FASTER
						//console.log(allFields);
						this.dli = dynamicLayerInfos;
						query = new esriQuery();
						query.returnGeometry = false;
						query.outFields = allFields;
						query.outFields =["score"]
						query.where = this.geography.reqFields[0] + " > -1";
						//query.geometryPrecision = 0;
						//query.maxAllowableOffset = 10000;
						//domAttr.set(this.refreshnode, "style", "display:");
						
						queryTask.execute(query, lang.hitch(this,function(results) {this.showResults(results)}));
						// ***************** CLASSIFICATION DONE ON SERVER **************  FOR SOME REASON THIS IS ACTUALLY SLOWER
						var dataSourcecls = new esri.layers.QueryDataSource();
						dataSourcecls.workspaceId = this.geography.workspaceId;
						dataSourcecls.query = "select 1::integer as objectid, array_to_string(classify('EqualInterval'," + this.geography.colorRamp.length + ",score), ',') as classes from (" + minquery + ") as foo";
						dataSourcecls.oidFields = ["objectid"]
						var layerSource2 = new esri.layers.LayerDataSource();
						layerSource2.dataSource = dataSourcecls;
						//console.log(layerSource2)
						var queryTask = new QueryTask(this.currentLayer.url + "/dynamicLayer", { source: layerSource2 });
						query = new esriQuery();
						query.returnGeometry = false;
						//query.outFields = allFields;
						query.outFields =["classes"]
						query.where = "objectid" + " = 1";
						//domAttr.set(this.refreshnode, "style", "display:");
						//queryTask.execute(query, lang.hitch(this,this.updateRenderer));
						if (zoomto == true) {
							//if this is a vector layer, and zoomto is true...
							if (this.app.regionConfig.hasOwnProperty('initialExtent') && this.app.regionConfig.initialExtent.length == 4){
								this.zoomToAppExtent();
							} else {
								dataSourceex = new esri.layers.QueryDataSource();
								dataSourceex.workspaceId = this.geography.workspaceId;
								dataSourceex.query = "select 1::integer as objectid, ST_AsText(ST_Envelope(ST_Collect(shape))) as extent FROM "+ this.geography.dataset;
								dataSourceex.oidFields = ["objectid"]
								layerSourcex = new esri.layers.LayerDataSource();
								layerSourcex.dataSource = dataSourceex;
								queryTask = new QueryTask(this.currentLayer.url + "/dynamicLayer", { source: layerSourcex });
								query = new esriQuery();
								query.returnGeometry = false;
								//query.outFields = allFields;
								query.outFields =["extent"]
								query.where = "objectid" + " = 1";
								//domAttr.set(this.refreshnode, "style", "display:");
								queryTask.execute(query, lang.hitch(this,this.zoomQextent));
							}
						}
					} else {
						//FORESTS
						//console.debug('habitat_explorer; main.js; updateService(); isVector = ', this.isVector);
						//if not a vector layer...
						legIndexes = [1,2,3];
					    if (zoomto == true) {
							if (this.app.regionConfig.hasOwnProperty('initialExtent') && this.app.regionConfig.initialExtent.length == 4){
								this.zoomToAppExtent();
							} else {
								this.map.setExtent(this.currentLayer.fullExtent, true);
							}	
						}
						rf1h3 = this.crasta 
						rf = new RasterFunction();
						rf.functionName = "Remap";
						rf.functionArguments = {
						"InputRanges" : linputRanges,
						"OutputValues" : loutputValues,
						"Raster" : rf1h3
						};
						rf.variableName = "riskOutput";
						rf.outputPixelType = "U8";
						//console.log('howdy');
						//console.log(rf1h2);
						colorRF = new RasterFunction();
						colorRF.functionName = "Colormap";
						colorRF.variableName = "riskOutput";
						colorRF.functionArguments = {
							"Colormap" : lcolorRamp,
							"Raster" : rf  //use the output of the remap rasterFunction for the Colormap rasterFunction
						};
						this.currentLayer.setRenderingRule(colorRF);
						//legenddiv = domConstruct.create("img", {src:"height:400px", innerHTML: "<b>" + "Legend for Restoration"  + ":</b>"});
						//dom.byId(this.legendContainer).appendChild(this.legenddiv);
					}

					//For both FOREST and STREAMS
					innerSyms = "";
					array.forEach(lcolorRamp, lang.hitch(this,function(cColor, i){
						innerSyms = innerSyms + '<rect x="0" y ="'+ (i * 30) + '" width="30" height="20" style="fill:rgb('+ cColor[legIndexes[0]] + "," + cColor[legIndexes[1]] + "," + cColor[legIndexes[2]] + ');stroke-width:0;stroke:rgb(0,0,0)" />'
					}));
					if ( this.geography.outputLabels == undefined) {
						//console.debug('updateService(); this.geography.outputLabels are undefined');
						this.geography.outputLabels = [{text:"Low", "percent": "0"},{text:"Medium", "percent": "50"},{text:"High", "percent": "100"}];
					//} else {	
					}	 
					// }
					lh = ((lcolorRamp.length) * 30) + 10;
					maxy = ((lcolorRamp.length) * 30) - 30;
					labs = "";
					array.forEach(this.geography.outputLabels, lang.hitch(this,function(lab, i){
						//console.log(lab);
						labs = labs + '<text x="35" y="' +((maxy * (lab.percent / 100))  + 15) + '" fill="black">' + lab.text + '</text>'
					}));
					//console.log(labs)
					this.legendContainer.innerHTML = '<div style="margin-bottom:7px" id="mExplorerLegend' + "_" + this.map.id + '">' + this.toolbarName + regfixname + ctabname + '</div>'
					+ '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="500px" height="' + lh + '">'
					+ innerSyms + labs
					//+ '<text x="35" y="15" fill="black">Low</text>'
					//+ '<text x="35" y="' + ((maxy + 15) / 2) + '" fill="black">Medium</text>'
					//+ '<text x="35" y="' + maxy + '" fill="black">High</text></svg>'
					//noleg = dom.byId("legend-0_msg")
					//domStyle.set(noleg, "display", "none");
					if (orgselectedIndex > -1) {
						//For tabs other than the Instructions tab
						this.currentLayer.setVisibility(true);
						this.legendContainer.innerHTML = '<div style="margin-bottom:7px" id="mExplorerLegend' + "_" + this.map.id + '">' + this.toolbarName + regfixname + ctabname + '</div>'
						+ '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="500px" height="' + lh + '">'
						+ innerSyms + labs
					} else {
						//For the Instructions tab
						this.currentLayer.setVisibility(false);
						this.legendContainer.innerHTML = '';
					}
					tabs = this.tabpan.getChildren();
					//console.debug('************* tabs = ', tabs);
					selectedIndex = this.tabpan.selectedChildWidget.index;
					//Instructions tab is at index -1
					if (selectedIndex == -1) {
						//toggle visibility of tab[0] main content
						domClass.remove(dojoquery(tabs[0].containerNode).parent()[0], "dijitHidden");
						domClass.add(dojoquery(tabs[0].containerNode).parent()[0], "dijitVisible");
						//this.introLayer is undefined at this point on first load.
						if (this.introLayer == undefined) {
							this.introLayer = new ArcGISDynamicMapServiceLayer(this.geography.intro.layer.url,{
								useMapImage: true
							});
							//value of this.geography.intro.layer.show, as currently set in config, is [118]
							this.introLayer.setVisibleLayers(this.geography.intro.layer.show)
							this.map.addLayer(this.introLayer);	
						}
					} else {
						//toggle visibility of tab[0] main content
						domClass.remove(dojoquery(tabs[0].containerNode).parent()[0], "dijitVisible");
						domClass.add(dojoquery(tabs[0].containerNode).parent()[0], "dijitHidden");					
					}
					//this.tabpan.selectChild(tabs[0]);
				},
				/** 
				 * TODO deprecated LM 3/15/18
				 * Method: zoomQextent
				 * 		
				 * Args:
				 * 		results {type} - description 
				 * 		
				*/				   
			   	zoomQextent: function(results) {
					console.debug('habitat_explorer; main.js; zoomQextent()');
					exesraw = results.features[0].attributes['extent'].replace("POLYGON((","").replace("))","")
					allexsraw = exesraw.split(",")
					xmin = parseFloat(allexsraw[0].split(" ")[0])
					ymin = parseFloat(allexsraw[0].split(" ")[1])
					xmax = parseFloat(allexsraw[2].split(" ")[0])
					ymax = parseFloat(allexsraw[2].split(" ")[1])
					//console.log(xmin,ymin,xmax,ymax)
					newextent = new Extent(xmin,ymin,xmax,ymax, new SpatialReference({ wkid:3857 }));
					console.debug('habitat_explorer; main.js; zoomQextent(); EXTENT using this.map.setExtent()');
					this.map.setExtent(newextent, true);
				},
				/** NOT IN USE
				 * Method: updateRenderer
				 * 		
				 * Args:
				 * 		results {type} - description 
				 * 		
				*/
			   	updateRenderer: function(results) {
					console.debug('habitat_explorer; main.js; updateRenderer()');
			   		//console.log(results)
					if (this.geography.defaultSymbol.type ==  "esriSMS") {
						SYM = SimpleMarkerSymbol;
					}
					if (this.geography.defaultSymbol.type ==  "esriSLS") {
						SYM = SimpleLineSymbol;
					}
					if (this.geography.defaultSymbol.type ==  "esriSFS") {
						SYM = SimpleFillSymbol;
					}
					tranyval = 1;
					sbrks = "[" + results.features[0].attributes['classes'] + "]"
					brks = dojo.eval(sbrks)
					//console.log (brks)
					var symbol = new SYM(this.geography.defaultSymbol)
					if (brks[0] == brks[brks.length-1]) {
						var renderer = new esri.renderer.ClassBreaksRenderer(symbol, "score");
						renderer.addBreak({minValue:-Infinity, maxValue:Infinity, symbol: new SYM(this.geography.defaultSymbol),label:"All variables were excluded by user",description:"All variables were excluded by user"});
					} else {
						var renderer = new esri.renderer.ClassBreaksRenderer(symbol, "score");
						array.forEach(this.geography.colorRamp, lang.hitch(this,function(cColor, i){
							lab = ""
							desc = ""
							if ((i+1) == this.geography.colorRamp.length) {
								maxB = Infinity;
								lab = "High";
							} else {
								maxB = brks[i+1];
							}
							if (i == 0) {
								minB = -Infinity;
								lab = "Low";
							} else {
								minB = brks[i];
							}
							nsym = lang.clone(this.geography.defaultSymbol);
							nsym.color = cColor;
							renderer.addBreak({minValue:minB, maxValue: maxB, symbol: new SYM(nsym),label:lab,description:lab});
						}));
					}
					var layerDrawingOptions = [];
					var layerDrawingOption = new esri.layers.LayerDrawingOptions();
					layerDrawingOption.renderer = renderer;
					layerDrawingOptions[1] = layerDrawingOption;
					this.currentLayer.setLayerDrawingOptions(layerDrawingOptions);
				},
				/** 
				 * Method: showResults
				 * 		
				 * Args:
				 * 		results {type} - description
				*/
			   	showResults: function(results) {
					console.debug('habitat_explorer; main.js; showResults()');
					maxscore = -9999999999999999999
					minscore = 9999999999999999999
					//console.log(results);
					array.forEach(results.features, lang.hitch(this,function(feat, i){
						if (feat.attributes['score'] > maxscore) {maxscore = feat.attributes['score']};
						if (feat.attributes['score'] < minscore) {minscore = feat.attributes['score']};
					}));
					//alert(minscore);
					//alert(this.geography.colorRamp.length);
					if (this.geography.defaultSymbol.type ==  "esriSMS") {
						SYM = SimpleMarkerSymbol;
					}
					if (this.geography.defaultSymbol.type ==  "esriSLS") {
						SYM = SimpleLineSymbol;
					}
					if (this.geography.defaultSymbol.type ==  "esriSFS") {
						SYM = SimpleFillSymbol;
					}
					tranyval = 1;
					brk = ((maxscore - minscore) / this.geography.colorRamp.length);
					var symbol = new SYM(this.geography.defaultSymbol)
					if (minscore == maxscore) {
						var renderer = new esri.renderer.ClassBreaksRenderer(symbol, "score");
						renderer.addBreak({minValue:-Infinity, maxValue:Infinity, symbol: new SYM(this.geography.defaultSymbol),label:"All variables were excluded by user",description:"All variables were excluded by user"});
					} else {
						var renderer = new esri.renderer.ClassBreaksRenderer(symbol, "score");
						array.forEach(this.geography.colorRamp, lang.hitch(this,function(cColor, i){
							lab = ""
							desc = ""
							if ((i+1) == this.geography.colorRamp.length) {
								maxB = Infinity;
								lab = "High";
							} else {
								maxB = minscore + (brk * (i+1));
							}
							if (i == 0) {
								minB = -Infinity;
								lab = "Low";
							} else {
								minB = minscore + (brk * i);
							}
							nsym = lang.clone(this.geography.defaultSymbol);
							nsym.color = cColor;
							renderer.addBreak({minValue:minB, maxValue: maxB, symbol: new SYM(nsym),label:lab,description:lab});
						}));
					}
					var layerDrawingOptions = [];
					var layerDrawingOption = new esri.layers.LayerDrawingOptions();
					layerDrawingOption.renderer = renderer;
					layerDrawingOptions[1] = layerDrawingOption;
					this.currentLayer.setLayerDrawingOptions(layerDrawingOptions);
					//alert('finish')
				},
				/** 
				 * Method: identify
				 * 		A passthrough method called by the the framework (see Identify.js line 54; Plugin.js line 280)
				 * Args:
				 * 		point {object} - esri map point object {spatialReference:obejct, type:string, x:number, y:number}. See esri documentation.
				 * 		screenPoint {object} - {x:number, y:number}}
				 * 		processResults {function} - A framework method used to compile identify results from all active plugins. This method should be called with this plugin's HTML formatted identify resutls.
				 * 			If processResults() is called without arguments, or results is an empty string, then the popup window will display "No information is available for this location."
				 * 			processResults Args: 
				 * 				results {string} - html string for the pop up window
				 * 				width {number, optional} - Identify window width
				 * 				height {number, optional} - Identify window height
				*/
			   	identify: function(point, screenPoint, processResults) {
					console.debug('habitat_explorer; main.js; identify()');
					//console.debug('habitat_explorer; main.js; identify(); arg point = ', point);
					//console.debug('habitat_explorer; main.js; identify(); arg screenPoint = ', screenPoint);
					//console.debug('habitat_explorer; main.js; identify(); arg processResults = ', processResults);
					if(this.tabpan.selectedChildWidget.titleText == "Instructions"){
						processResults("Note: Identify will not work while in the Instructions tab. Please move to another tab to use the Identify feature.");
						return;
					}
					if (this.currentLayer && this.currentLayer.url.includes("ImageServer") == true) {
						//FOREST processing
						idTask = new esri.tasks.ImageServiceIdentifyTask(this.geography.url);
						identifyParams = new ImageServiceIdentifyParameters();
						identifyParams.returnGeometry = false;
						identifyParams.geometry = point;
						//identifyParams.renderingRule = this.renderingRule;					
						idTask.execute(identifyParams, lang.hitch(this,function(identifyResults) {
							//console.debug("identifyResults.value = ",identifyResults.value);
							if (identifyResults.value != "NoData") {
								if(this.tabpan.selectedChildWidget.titleText != "Instructions"){
									if(this.tabpan.selectedChildWidget.titleText != "Recommendations"){
										//If on a tab with slider options, process the specific function and slider values from this tab.
										idtable = '<br><table border="1"><tr><th width="50%"><center>Variable</center></th><th width="25%"><center>Value</center></th><th width="25%"><center>Weight</center></th></tr>';
										identifyValues = dojo.eval("[" + identifyResults.value + "]");
										//this.formula example: "(((2 * B1) + (2 * B2) + (2 * B3) + (2 * B4) + (2 * B5)) / 10)"
										replacedFormula = this.formula;
										varFormula = this.formula;
										array.forEach(identifyValues, lang.hitch(this,function(idval, j){
											replacedFormula = replacedFormula.replace("B"+(j+1), idval);
											var ci = "B" + (j+1);
											array.forEach(registry.findWidgets(this.tabpan.selectedChildWidget.domNode), lang.hitch(this,function(slid, i){
												outvaluetext = slid.value;
												if (ci == slid.index && this.formula.includes(ci)) {
													idtable = idtable + ('<tr><td>' + slid.title + '</td><td>' + idval.toFixed(2).replace(".00","") + '</td><td>' + outvaluetext + '</td></tr>')
													varFormula = varFormula.replace("B"+(j+1), slid.title);
												}
											}));
										}));
										idtable = idtable + '</table>';
										processResults("<br> Value at Mouse Click: <b>" + dojo.eval(replacedFormula).toFixed(3).replace(".000", '') + "</b><br>" + idtable + "Formula: <br>" + this.geography.BandFormulaText);	
									} else {
										//user is on the Recommendations tab, loop over all sliders from all tabs.
										idtable = '<br><table border="1"><tr><th width="50%"><center>Variable</center></th><th width="25%"><center>Value</center></th><th width="25%"><center>Weight</center></th></tr>';
										identifyValues = dojo.eval("[" + identifyResults.value + "]");
										//this.formula example: "(((2 * B1) + (2 * B2) + (2 * B3) + (2 * B4) + (2 * B5)) / 10)"
										replacedFormula = this.formula;
										varFormula = this.formula;
										array.forEach(identifyValues, lang.hitch(this,function(idval, j){
											replacedFormula = replacedFormula.replace("B"+(j+1), idval);
											var ci = "B" + (j+1);
											array.forEach(this.sliders, lang.hitch(this,function(slid, i){
												outvaluetext = slid.value;
												if(ci==slid.index){
													idtable = idtable + ('<tr><td>' + slid.title + '</td><td>' + idval.toFixed(2).replace(".00","") + '</td><td>' + outvaluetext + '</td></tr>')
												}
											}));
										}));
										idtable = idtable + '</table>';
										processResults("<br> Value at Mouse Click: <b>" + dojo.eval(replacedFormula).toFixed(3).replace(".000", '') + "</b><br>" + idtable);
									}
								} else {
									//user is on the Instructions tab
									if(this.tabpan.selectedChildWidget.titleText == "Instructions"){
										processResults("Note: Please move to the Recommendations tab.");
										//processResults("<br> Value at Mouse Click: <b>" + dojo.eval(replacedFormula).toFixed(3).replace(".000", '') + "</b><br>" + idtable + "Formula: <br>" + this.geography.BandFormulaText);
									} 
								}
							} else {
								//NoData returned
								processResults("<br> Value at Mouse Click: No Data. <br> Tip: Zoom in for best results.");
							}
							}), lang.hitch(this,function(err){
								//error back
								processResults("<br> Value at Mouse Click: No Data. <br>Server Error.");
							})); 
					} else if (this.currentLayer){
						//STREAMS processing
						if(this.tabpan.selectedChildWidget.titleText != "Instructions"){
							if(this.tabpan.selectedChildWidget.titleText == "Recommendations"){
								//Special processing for Recommendations tab - update the query so that it includes all the individual field names as well as the 'score' function.
								//This is so the individual values may be reported in the Identify window.
								var fieldNames = "";
								array.forEach(this.sliders, lang.hitch(this,function(slid, i){
									fieldNames += slid.index + ",";
								}));
								this.dli[0].source.dataSource.query = this.dli[0].source.dataSource.query.replace("objectid,", "objectid," + fieldNames);
							}
							identifyer = new esri.tasks.IdentifyTask(this.currentLayer.url, { source: this.layerSource });
							identifyParams = new IdentifyParameters();
							identifyParams.dynamicLayerInfos = this.dli;
							identifyParams.tolerance = 6;
							identifyParams.returnGeometry = false;
							//identifyParams.layerIds = [0,1];
							identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
							identifyParams.width  = this.map.width;
							identifyParams.height = this.map.height;
							identifyParams.mapExtent = this.map.extent;
							identifyParams.geometry = point;
							identifyer.execute(identifyParams, lang.hitch(this,function(identifyResults) {
								if(identifyResults && identifyResults.length > 0){
									if (this.tabpan.selectedChildWidget.titleText == "Recommendations"){
										//Need to loop over all sliders from all tabs and gather info.
										idtable = '<br><table border="1"><tr><th width="50%"><center>Variable</center></th><th width="25%"><center>Value</center></th><th width="25%"><center>Weight</center></th></tr>';
										array.forEach(this.sliders, lang.hitch(this,function(slid, i){
											idtable = idtable + ('<tr><td>' + slid.title + '</td> <td>' + identifyResults[0].feature.attributes[slid.index]+ '</td> <td>' + slid.value + '</td></tr>');
										}));
										idtable = idtable + '</table>';
										//note about identifyResults[0] - there may be many features found, but this is using first one in the array wins.
										//processResults("<br> Computed Score at Mouse Click: " + identifyResults[0].feature.attributes.score);
										processResults("<br> Computed Score at Mouse Click: " 
											+ identifyResults[0].feature.attributes.score 
											+ "<br>" 
											+ idtable);
									} else {
										//For Slider-Selection Tabs. Loop over only this tab's sliders.
										idtable = '<br><table border="1"><tr><th width="50%"><center>Variable</center></th><th width="25%"><center>Value</center></th><th width="25%"><center>Weight</center></th></tr>';
										var formulaTxt = this.formula;
										array.forEach(registry.findWidgets(this.tabpan.selectedChildWidget.domNode), lang.hitch(this,function(slid, i){
											idtable = idtable + ('<tr><td>' + slid.title + '</td> <td>'+identifyResults[0].feature.attributes[slid.index]+'</td> <td>' + slid.value + '</td></tr>');
											formulaTxt = formulaTxt.replace(slid.index, slid.title);
										}));
										idtable = idtable + '</table>';
										//note about identifyResults[0] - there may be many features found, but this is using first one in the array wins.
										//processResults("<br> Computed Score at Mouse Click: " + identifyResults[0].feature.attributes.score);
										processResults("<br> Computed Score at Mouse Click: " 
											+ identifyResults[0].feature.attributes.score 
											+ "<br>" 
											+ idtable 
											+ "Formula: <br>" + formulaTxt);
									}
								}else{
									processResults("<br> Computed Score at Mouse Click: No Data. <br>Tip: Try clicking closer to a feature.");
								}
							}), lang.hitch(this,function(err){
								//error back
								processResults("<br> Computed Score at Mouse Click: No Data. <br>Server Error.");
							}));
						} else {
							//Instructions tab is selected
							processResults("Note: Please move to the Recommendations tab.");
						}
					}
			   	},
				/** 
				 * Method: subregionActivated
				 * 		Framework Plugin method for override, called in Pane.js
				 * Args:
				 * 		subregion {type} - description
				 * 		
				*/
				subregionActivated: function(subregion) {
					console.debug('habitat_explorer; main.js; subregionActivated()');
					console.debug('now using subregion ' + subregion.display);
					//Load an an array of 'useable regions' by comparing region names between the passed in subregion.id and one of the 
					//config's region names.
					
					this.usableRegions = new Array();
					array.forEach(this.explorerObject.regions, lang.hitch(this,function(region, i){
					if (region.name == subregion.id) {
						this.usableRegions.push(region);
					}
					}));
					this.subs = true;
					//domConstruct.empty(this.regionChooserContainer);
					//console.log(this.mainData);
					//insert
					this.rebuildOptions();
				},
				/** 
				 * Method: subregionDeactivated
				 * 		Framework Plugin method for override, called in Pane.js
				 * Args:
				 * 		subregion {type} - description
				*/
				subregionDeactivated: function(subregion) {
					console.debug('habitat_explorer; main.js; subregionDeactivated()');
					console.debug('now leaving subregion ' + subregion.display);
					this.subs = false;
					//domConstruct.empty(this.regionChooserContainer);
					this.usableRegions = this.explorerObject.regions;
					this.rebuildOptions();
				},
				/** 
				 * Method: beforePrint
				 * 		
				 * Args:
				 * 		printDeferred {type} - description
				 * 		$printArea {type} - description
				 * 		mapObject {type} - description 
				 * 		
				*/
				beforePrint: function(printDeferred, $printArea, mapObject) {
					console.debug('habitat_explorer; main.js; beforePrint()');
					//var layer = new esri.layers.ArcGISDynamicMapServiceLayer(this.url);
					//layer.setVisibleLayers([0])
					//console.log(this.currentLayer);
					if (this.isVector == true)  {
						TempcurrentLayer = new ArcGISDynamicMapServiceLayer(this.currentLayer.url);
						//TempcurrentLayer.setVisibleLayers([0])
						colorRF = dojo.clone(this.currentLayer.dynamicLayerInfos);
						//console.log(this.currentLayer);
						TempcurrentLayer.setDynamicLayerInfos(colorRF);
						var layerDrawingOptions = [];
						var layerDrawingOption = new esri.layers.LayerDrawingOptions();
						//layerDrawingOption.renderer = renderer;
						ldo = dojo.clone(this.currentLayer.layerDrawingOptions);
						TempcurrentLayer.setLayerDrawingOptions(ldo);
						//layerDrawingOption.renderer = renderer;
						//layerDrawingOptions[1] = layerDrawingOption;
						//this.currentLayer.setLayerDrawingOptions(layerDrawingOptions);
					} else {
						params = new ImageServiceParameters();
						TempcurrentLayer = ArcGISImageServiceLayer(this.currentLayer.url, {
						imageServiceParameters: params,
						opacity: 1
						});
						//console.log(this.currentLayer);
						colorRF = dojo.clone(this.currentLayer.renderingRule);
						TempcurrentLayer.setRenderingRule(colorRF);
						/*
						array.forEach(identifyValues, lang.hitch(this,function(idval, j){
							replacedFormula = replacedFormula.replace("B"+(j+1), idval);
						*/
						/*
						}));
						//alert(dojo.eval(replacedFormula))
						//console.log(identifyResults);
						idtable = idtable + '</table>'
						processResults("<br> Value at Mouse Click: <b>" + dojo.eval(replacedFormula).toFixed(3).replace(".000", '') + "</b><br>" + idtable + "Formula: <br>" + varFormula);
						*/
					} 
					mapObject.addLayer(TempcurrentLayer);
					replacedFormula = this.formula;
					varFormula = this.formula;
					array.forEach(this.sliders, lang.hitch(this,function(slid, i){
						//console.log(slid.title);
						varFormula = varFormula.replace("B"+(i+1) +")", slid.title + ")")
					}));
					//alert(this.BandFormulaText);
					//console.log($printArea);
					$printArea.append("<div id='printtitle'>" + this.geography.printTitle + "</div>");
					array.forEach(this.geography.tabs, lang.hitch(this,function(tab, i){
						//console.log(tab);
						array.forEach(tab.items, lang.hitch(this,function(item, i){
							//console.log(item.text, item.default);
						}));
					}));
					leg = this.legendContainer.innerHTML;
					a = domGeom.position(dojoquery('#mExplorerLegend' + "_" + this.map.id)[0])
					//console.log(a)
					//legs = domGeom.position(leg)
					//console.log(legs);
					//$printArea.append("<div id='tableWrapper'><div id='tableTitle'>Species with Suitable Habitat in Hexagons" + leg + "</div><table id='table' class='printTable'>");
					$printArea.append("<div id='legendprint' >" + leg + "</div>");
					$printArea.append("<div id='formulaprint'>" + "Formula for Map: <br><br>" + this.geography.BandFormulaText + this.geography.printText + "</div>");
					printDeferred.resolve();
				}
           });
       });