define([
    "dojo/_base/declare",
	"esri/layers/RasterFunction",
	"esri/symbols/SimpleLineSymbol",
	"dojo/_base/array",
	"dojo/_base/lang",
    "dojo/dom"
], function(
	declare, 
	RasterFunction,
	SimpleLineSymbol,
	array,
	lang,
	dom
	){
    return declare(null, {
        
		colors : [
				[1000, 36, 91, 0],
				[1001, 43, 137, 0],
				[1010, 144, 173, 86],
				[1011, 180, 214, 157],

				[1100, 69, 81, 137],
				[1101, 0, 91, 230],
				[1110, 0, 168, 230],
				[1111, 151, 198, 255],

				[0, 166, 96, 0],
				[1, 209, 139, 0],
				[10, 211, 174, 79],
				[11, 255, 224, 127],

				[100, 154, 0, 43],
				[101, 205, 0, 0],
				[110, 238, 137, 137],
				[111, 255, 191, 249]
					],
					
		labels : [
					"Maintain - Lower risk",
					"Maintain – Moderate risk", 
					"Maintain – High risk",
					"Maintain - Highest risk",
					"Reduce Threats – Lower risk",
					"Reduce Threats – Moderate risk",
					"Reduce Threats – High risk", 
					"Reduce Threats – Highest risk",
					"Restore – Lower risk",
					"Restore – Moderate risk",
					"Restore – High risk",
					"Restore – Highest risk",
					"Reduce Threat & Restore – Lower risk",
					"Reduce Threat & Restore – Moderate risk",
					"Reduce Threat & Restore – High risk",
					"Reduce Threat & Restore – Highest risk"
				],
		/** 
		 * Method: combineFunction
		 * 		For Raster data
		 * Args:
		 * 		formulas {type} - desciption
		 * 		geo {type} - desciption
		 * 		Tformulas {type} - desciption
		 * 		rfuncs {type} - desciption
		*/
		combineFunction: function(formulas, geo, Tformulas, rfuncs){
			console.debug('combine.js; combineFunction()');
			//console.debug('combine.js; combineFunction(); formulas = ', formulas);
			//console.debug('combine.js; combineFunction(); Tformulas = ', Tformulas);

			geo.BandFormulaText = Tformulas[0] + "<br><br>" + Tformulas[1] + "<br><br>" + Tformulas[2] + "<br><br>" + Tformulas[3] + "<br><br>";
			
			rasterFunction0 = rfuncs[0];
			
			rf0 = new RasterFunction();
			rf0.functionName = "Local";
			rf0.functionArguments = {
				"Operation" : 29,
				"Rasters" : [rasterFunction0, 67]
			};
			rf0.variableName = "riskOutput";
			rf0.outputPixelType = "U16";									

			rfc = new RasterFunction();
			rfc.functionName = "Local";
			rfc.functionArguments = {
				"Operation" : 3,
				"Rasters" : [rf0, 1000]
			};
			rfc.variableName = "riskOutput";
			rfc.outputPixelType = "U16";							


			rasterFunction1 = rfuncs[1];

			rf1h = new RasterFunction();
			rf1h.functionName = "Local";
			rf1h.functionArguments = {
				"Operation" : 29,
				"Rasters" : [rasterFunction1, 33]
			};
			rf1h.variableName = "riskOutput";
			rf1h.outputPixelType = "U16";

			rfta = new RasterFunction();
			rfta.functionName = "Local";
			rfta.functionArguments = {
				"Operation" : 3,
				"Rasters" : [rf1h, 100]
			};
			rfta.variableName = "riskOutput";
			rfta.outputPixelType = "U16";		

			rft = rfta
			
			rasterFunction2 = rfuncs[2];

			rf2 = new RasterFunction();
			rf2.functionName = "Local";
			rf2.functionArguments = {
				"Operation" : 29,
				"Rasters" : [rasterFunction2, 50]
			};
			rf2.variableName = "riskOutput";
			rf2.outputPixelType = "U16";	
			
			rfs = new RasterFunction();
			rfs.functionName = "Local";
			rfs.functionArguments = {
				"Operation" : 3,
				"Rasters" : [rf2, 10]
			};
			rfs.variableName = "riskOutput";
			rfs.outputPixelType = "U16";						
			
			rasterFunction3 = rfuncs[3];

			rfe = new RasterFunction();
			rfe.functionName = "Local";
			rfe.functionArguments = {
				"Operation" : 29,
				"Rasters" : [rasterFunction3, 50]
			};
			rfe.variableName = "riskOutput";
			rfe.outputPixelType = "U16";	
			
			
			rfa1 = new RasterFunction();
			rfa1.functionName = "Local";
			rfa1.functionArguments = {
				"Operation" : 1,
				"Rasters" : [rfc, rft]
			};
			rfa1.variableName = "riskOutput";
			rfa1.outputPixelType = "U16";	
			
			
			rfa2 = new RasterFunction();
			rfa2.functionName = "Local";
			rfa2.functionArguments = {
				"Operation" : 1,
				"Rasters" : [rfs, rfe]
			};
			rfa2.variableName = "riskOutput";
			rfa2.outputPixelType = "U16";
			
			rfa = new RasterFunction();
			rfa.functionName = "Local";
			rfa.functionArguments = {
				"Operation" : 1,
				"Rasters" : [rfa1, rfa2]
			};
			rfa.variableName = "riskOutput";
			rfa.outputPixelType = "U16";
			
			colorRF = new RasterFunction();
			colorRF.functionName = "Colormap";
			colorRF.variableName = "riskOutput";
			colorRF.functionArguments = {
				"Colormap" : this.colors,
				"Raster" : rfa  //use the output of the remap rasterFunction for the Colormap rasterFunction
			};
						
			innerSyms = ""
			texter = ""
			
			array.forEach(this.colors, lang.hitch(this,function(cColor, i){
				innerSyms = innerSyms + '<rect x="0" y ="'+ (i * 30) + '" width="30" height="20" style="fill:rgb('+ cColor[1] + "," + cColor[2] + "," + cColor[3] + ');stroke-width:1;stroke:rgb(0,0,0)" />';
				texter = texter + ' <text x="35" y ="' + ((i * 30) + 15) + '" fill="black">' + this.labels[i] + '</text>';
			}));
			
			lh = ((this.colors.length) * 30) + 10
			maxy = ((this.colors.length) * 30) - 15
			
			regfixname= " - " + geo.name
			OUTPUTLABEL = '<div style="margin-bottom:7px" >' + "Habitat Explorer" + regfixname + " <br>Recommended Objective - Climate Risk" + '</div>'
				+ '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="300px" height="' + lh + '">'
				+ innerSyms
				+ texter;
			outputData = {renderRule: colorRF, legendHTML: OUTPUTLABEL};
			return outputData;
        },
		/** 
		 * Method: vectorCombineFunction
		 * 		For "vector" data (in this context the vector data is from a db connection map service, not a traditional vector layer map service.)
		 * Args:
		 * 		formulas {type} - desciption
		 * 		geo {type} - desciption
		 * 		Tformulas {type} - desciption
		*/
		vectorCombineFunction: function(formulas, geo, Tformulas) {
			geo.BandFormulaText = Tformulas[0] + "<br><br>" + Tformulas[1] + "<br><br>" + Tformulas[2] + "<br><br>" + Tformulas[3] + "<br><br> A text desciption of how the layers are combined could appear in this location.";
			oFields = geo.reqFields.join(", ");
			//formulas[0] = Condition; formulas[1] = Threat; formulas[2] = Sensitivity; formulas[3] = Exposure;
			//outq = "SELECT " + oFields + ", (case when (" + formulas[0] + " > 67) then 1 else 0 end * 1000) + (case when (" + formulas[1] + " > 33) then 1 else 0 end * 100) + (case when (" + formulas[2] + " > 50) then 1 else 0 end * 10) + (case when (" + formulas[3] + " > 50) then 1 else 0 end * 1) AS score FROM " + geo.dataset;
			outq = "SELECT " + oFields + ", (case when (" + formulas[0] + " >= 67) then 1 else 0 end * 1000) + (case when (" + formulas[1] + " >= 33) then 1 else 0 end * 100) + (case when (" + formulas[2] + " >= 50) then 1 else 0 end * 10) + (case when (" + formulas[3] + " >= 50) then 1 else 0 end * 1) AS score FROM " + geo.dataset;
			defsym = new SimpleLineSymbol({
				"type": "esriSLS",
				"style": "esriSLSSolid",
				"color": [0,0,0,255],
				"width": 2
			});
			outrenderer = new esri.renderer.UniqueValueRenderer(defsym, "score");
			array.forEach(this.colors, lang.hitch(this,function(cColor, i){
				outrenderer.addValue({
					value: cColor[0],
					symbol: new SimpleLineSymbol({
						"type": "esriSLS",
						"style": "esriSLSSolid",
						"color": [cColor[1], cColor[2], cColor[3], 255],
						"width": 2
					}),
					label: this.labels[i],
					description: this.labels[i]
				});
			}));
			innerSyms = "";
			texter = "";
			array.forEach(this.colors, lang.hitch(this,function(cColor, i){
				innerSyms = innerSyms + '<rect x="0" y ="'+ (i * 30) + '" width="30" height="20" style="fill:rgb('+ cColor[1] + "," + cColor[2] + "," + cColor[3] + ');stroke-width:1;stroke:rgb(0,0,0)" />' 
				texter = texter + ' <text x="35" y ="' + ((i * 30) + 15) + '" fill="black">' + this.labels[i] + '</text>'
			}));
			lh = ((this.colors.length) * 30) + 10;
			maxy = ((this.colors.length) * 30) - 15;
			regfixname = " - " + geo.name;
			OUTPUTLABEL = '<div style="margin-bottom:7px" >' + "Habitat Explorer" + regfixname + " <br>Recommended Objective - Climate Risk" + '</div>'
				+ '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="300px" height="' + lh + '">'
				+ innerSyms
				+ texter;
			outputData = {outquery: outq, renderRule: outrenderer, legendHTML: OUTPUTLABEL};
			console.debug('outputData.outquery: ', outputData.outquery);
			return outputData;
		}
    });
});