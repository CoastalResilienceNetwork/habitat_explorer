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
				[1000, 102, 140, 77],
				[1001, 107, 172, 77],
				[1010, 177, 197, 137],
				[1011, 203, 227, 188],
				[1100, 125, 132, 172],
				[1101, 77, 140, 237],
				[1110, 77, 195, 237],
				[1111, 181, 214, 255],
				[0, 182, 138, 77],
				[1, 223, 174, 77],
				[10, 246, 216, 139],
				[11, 252, 239, 198],
				[100, 135, 0, 0],
				[101, 204, 0, 0],
				[110, 237, 137, 137],
				[111, 255, 191, 248]
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
				
		
		combineFunction: function(formulas, geo, Tformulas, rfuncs){
				
						geo.BandFormulaText = Tformulas[0] + "<br><br>" + Tformulas[1] + "<br><br>" + Tformulas[2] + "<br><br>" + Tformulas[3] + "<br><br>" 
						
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

						//rf1l = new RasterFunction();
						//rf1l.functionName = "Local";
						//rf1l.functionArguments = {
						//  "Operation" : 28,
						//  "Rasters" : [rasterFunction1, 67]
						//};
						//rf1l.variableName = "riskOutput";
						//rf1l.outputPixelType = "U16";
						

						//rft = new RasterFunction();
						//rft.functionName = "Local";
						//rft.functionArguments = {
						//  "Operation" : 76,
						//  "Rasters" : [rfc, rf1h, rf1l]
						//};
						//rft.variableName = "riskOutput";
						//rft.outputPixelType = "U16";	

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
						
						
						//rfout = new RasterFunction();
						//rfout.functionName = "Remap";
						//rfout.functionArguments = {
						//  "InputRanges" : [0,250,250,500,500,1300],
						//  "OutputValues" : [1,100,250],
						//  "Raster" : rfa
						//};
						//rfout.variableName = "riskOutput";
						//rfout.outputPixelType = "U8";
						console.log("HAAA")
						console.log(rfa)
						
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

               innerSyms = innerSyms + '<rect x="0" y ="'+ (i * 30) + '" width="30" height="20" style="fill:rgb('+ cColor[1] + "," + cColor[2] + "," + cColor[3] + ');stroke-width:0;stroke:rgb(0,0,0)" />' 
			   texter = texter + ' <text x="35" y ="' + ((i * 30) + 15) + '" fill="black">' + this.labels[i] + '</text>'

             }));
			 

             lh = ((this.colors.length) * 30) + 10
             maxy = ((this.colors.length) * 30) - 15
			 
			 regfixname= " - " + geo.name
			OUTPUTLABEL = '<div style="margin-bottom:7px" >' + "Habitat Explorer" + regfixname + " <br>Recommended Objective - Climate Risk" + '</div>'
             + '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="300px" height="' + lh + '">'
			 + innerSyms
             + texter
						

						
						outputData = {renderRule: colorRF, legendHTML: OUTPUTLABEL}
						
						return outputData;
        },
		
		vectorCombineFunction: function(formulas, geo, Tformulas) {
			
			geo.BandFormulaText = Tformulas[0] + "<br><br>" + Tformulas[1] + "<br><br>" + Tformulas[2] + "<br><br>" + Tformulas[3] + "<br><br> A text desciption of how the layers are combined could appear in this location."
			
			//majorFormula = ("(" + formulas[0] + " * 1000) + (" + formulas[1] + " * 100) + (" + formulas[2] + " * 10) + (" + formulas[3] + " * 1)"   )
			
			//console.log(majorFormula)
			
			
			//console.log("SELECT " + oFields + ", " + rfout + " AS score FROM " + this.geography.dataset);
			//"SELECT " + oFields + ", case when (" + formulas[0] + " > 75) then 1 else 0 end * 1000 AS score FROM " + geo.dataset
			
			
			oFields = geo.reqFields.join(", ");
			
			//case when (" + formulas[0] + " > 75) then 1 else 0 end * 1000
			
			//" + case when (" + formulas[0] + " > 75) then case when (" + formulas[1] + " > 33) then 1 else 0 end else case when (" + formulas[1] + " > 67) then 1 else 0 end end * 100 "
			
			//case when (" + formulas[3] + " > 50) then 1 else 0 end * 1

			outq = "SELECT " + oFields + ", (case when (" + formulas[0] + " > 67) then 1 else 0 end * 1000) + (case when (" + formulas[1] + " > 33) then 1 else 0 end * 100) + (case when (" + formulas[2] + " > 50) then 1 else 0 end * 10) + (case when (" + formulas[3] + " > 50) then 1 else 0 end * 1) AS score FROM " + geo.dataset;

			console.log(outq);


			
			defsym = new SimpleLineSymbol({
											"type": "esriSLS",
											"style": "esriSLSSolid",
											"color": [0,0,0,255],
											"width": 2
											})
		
			outrenderer = new esri.renderer.UniqueValueRenderer(defsym, "score");
			
             array.forEach(this.colors, lang.hitch(this,function(cColor, i){

               outrenderer.addValue({
								value: cColor[0],
								symbol: new SimpleLineSymbol({
											"type": "esriSLS",
											"style": "esriSLSSolid",
											"color": [cColor[1],cColor[2],cColor[3],255],
											"width": 2
											}),
								label: this.labels[i],
								description: this.labels[i]
							  });
  
             }));

             innerSyms = ""
			 texter = ""
			 
             array.forEach(this.colors, lang.hitch(this,function(cColor, i){

               innerSyms = innerSyms + '<rect x="0" y ="'+ (i * 30) + '" width="30" height="20" style="fill:rgb('+ cColor[1] + "," + cColor[2] + "," + cColor[3] + ');stroke-width:0;stroke:rgb(0,0,0)" />' 
			   texter = texter + ' <text x="35" y ="' + ((i * 30) + 15) + '" fill="black">' + this.labels[i] + '</text>'

             }));
			 

             lh = ((this.colors.length) * 30) + 10
             maxy = ((this.colors.length) * 30) - 15
			 
			 regfixname= " - " + geo.name
			OUTPUTLABEL = '<div style="margin-bottom:7px" >' + "Habitat Explorer" + regfixname + " <br>Recommended Objective - Climate Risk" + '</div>'
             + '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="300px" height="' + lh + '">'
			 + innerSyms
             + texter
			 
			outputData = {outquery: outq, renderRule: outrenderer, legendHTML: OUTPUTLABEL}
			 
			return outputData; //[outq, outrenderer];
			
			//return majorFormula;
			
			//SQLOUT = "SELECT objectid, shape, " + majorFormula + " AS score FROM sde.ny_condition_lines"

			//console.log(SQLOUT);

				//console.log("SELECT " + oFields + ", " + iFields + ", " + this.formula + " AS score FROM " + this.geography.dataset);	


				

		
		}
		
		
		
		
    });
});

/*


define([
					"dojo/_base/declare",
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
					"esri/SpatialReference" 
], function(
					declare,
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
					SpatialReference
){
    return declare(null, {
        combine: function(){
            alert("HI");
        }
    });
});




/*
define([
        "dojo/_base/declare",
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
		"esri/SpatialReference"
       ],
       function (declare,
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
					SpatialReference
					) {

			   
			   combine: function () {
					alert("thing");
			
			   }
				   
		});
		
		

/*
combine = function(formulas) {
	alert("Hello");
	
						rasterFunction1 = new RasterFunction();
						rasterFunction1.functionName = "BandArithmetic";
						arguments = {"Raster" : "$$"};
						arguments.Method= 0;
						arguments.BandIndexes = formulas[0];
						rasterFunction1.arguments = arguments;
						rasterFunction1.variableName = "riskOutput";
						rasterFunction1.outputPixelType = "U8";

						rf1 = new RasterFunction();
						rf1.functionName = "Local";
						rf1.functionArguments = {
						  "Operation" : 28,
						  "Rasters" : [rasterFunction1, 75]
						};
						rf1.variableName = "riskOutput";
						rf1.outputPixelType = "U16";					

						rfp = new RasterFunction();
						rfp.functionName = "Local";
						rfp.functionArguments = {
						  "Operation" : 3,
						  "Rasters" : [rf1, 2]
						};
						rfp.variableName = "riskOutput";
						rfp.outputPixelType = "U16";							
						
						rasterFunction2 = new RasterFunction();
						rasterFunction2.functionName = "BandArithmetic";
						arguments = {"Raster" : "$$"};
						arguments.Method= 0;
						arguments.BandIndexes = formulas[2];
						rasterFunction2.arguments = arguments;
						rasterFunction2.variableName = "riskOutput";
						rasterFunction2.outputPixelType = "U8";

						rf2 = new RasterFunction();
						rf2.functionName = "Local";
						rf2.functionArguments = {
						  "Operation" : 28,
						  "Rasters" : [rasterFunction2, 50]
						};
						rf2.variableName = "riskOutput";
						rf2.outputPixelType = "U16";	
						
						rfa = new RasterFunction();
						rfa.functionName = "Local";
						rfa.functionArguments = {
						  "Operation" : 1,
						  "Rasters" : [rfp, rf2]
						};
						rfa.variableName = "riskOutput";
						rfa.outputPixelType = "F32";	
						
						
						rfout = new RasterFunction();
						rfout.functionName = "Remap";
						rfout.functionArguments = {
						  "InputRanges" : [0,0.5,0.5,1.5,1.5,2.5],
						  "OutputValues" : [1,100,250],
						  "Raster" : rfa
						};
						rfout.variableName = "riskOutput";
						rfout.outputPixelType = "U8";
						
						
		return rfout;
	
}
*/