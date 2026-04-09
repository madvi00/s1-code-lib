function bound(value, opt_min, opt_max) {
    if (opt_min != null) value = Math.max(value, opt_min);
    if (opt_max != null) value = Math.min(value, opt_max);
    return value;
}

function degreesToRadians(deg) {
    return deg * (Math.PI / 180);
}

function radiansToDegrees(rad) {
    return rad / (Math.PI / 180);
}

function MercatorProjection() {
    var MERCATOR_RANGE = 256;
    this.pixelOrigin_ = new google.maps.Point(
        MERCATOR_RANGE / 2, MERCATOR_RANGE / 2);
    this.pixelsPerLonDegree_ = MERCATOR_RANGE / 360;
    this.pixelsPerLonRadian_ = MERCATOR_RANGE / (2 * Math.PI);
};

MercatorProjection.prototype.fromLatLngToPoint = function(latLng, opt_point) {
    var me = this;

    var point = opt_point || new google.maps.Point(0, 0);

    var origin = me.pixelOrigin_;
    point.x = origin.x + latLng.lng() * me.pixelsPerLonDegree_;
    // NOTE(appleton): Truncating to 0.9999 effectively limits latitude to
    // 89.189. This is about a third of a tile past the edge of the world tile.
    var siny = bound(Math.sin(degreesToRadians(latLng.lat())), -0.9999, 0.9999);
    point.y = origin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) * -me.pixelsPerLonRadian_;
    return point;
};

MercatorProjection.prototype.fromDivPixelToLatLng = function(pixel, zoom) {
    var me = this;

    var origin = me.pixelOrigin_;
    var scale = Math.pow(2, zoom);
    var lng = (pixel.x / scale - origin.x) / me.pixelsPerLonDegree_;
    var latRadians = (pixel.y / scale - origin.y) / -me.pixelsPerLonRadian_;
    var lat = radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) - Math.PI / 2);
    return new google.maps.LatLng(lat, lng);
};

MercatorProjection.prototype.fromDivPixelToSphericalMercator = function(pixel, zoom) {
    var me = this;
    var coord = me.fromDivPixelToLatLng(pixel, zoom);

    var r= 6378137.0;
    var x = r* degreesToRadians(coord.lng());
    var latRad = degreesToRadians(coord.lat());
    var y = (r/2) * Math.log((1+Math.sin(latRad))/ (1-Math.sin(latRad)));

    return new google.maps.Point(x,y);
};

function loadWMS(map, baseURL, customParams){
    var tileHeight = 256;
    var tileWidth = 256;
    var opacityLevel = 0.70;
    var isPng = true;
    var minZoomLevel = 2;
    var maxZoomLevel = 17;

    // var baseURL = "";
    var wmsParams = [
    "REQUEST=GetMap",
    "SERVICE=WMS",
    "VERSION=1.1.1",
    "BGCOLOR=0xFFFFFF",
    "TRANSPARENT=TRUE",
	"SRS=EPSG:4326",
    "WIDTH="+ tileWidth,
    "HEIGHT="+ tileHeight
    ];

    // add additional parameters
    var wmsParams = wmsParams.concat(customParams);

    
    var overlayOptions =
    {
        getTileUrl: function(coord, zoom)
        {
        	/*
        	var cache_step = 4;
        	
        	var s = Math.pow(2, zoom);   
			var twidth = 256;         
			var theight = 256; 
			var gBl = map.getProjection().fromPointToLatLng(         
				new google.maps.Point(coord.x * twidth / s, (coord.y + 1) * theight / s)); // bottom
																							// left
																							// / SW
			var gTr = map.getProjection().fromPointToLatLng(         
				new google.maps.Point((coord.x + 1) * twidth / s, coord.y * theight / s)); // top
																							// right
																							// / NE

           	var bbox = gBl.lng().toFixed(cache_step) + "," + gBl.lat().toFixed(cache_step) + "," + gTr.lng().toFixed(cache_step) + "," + gTr.lat().toFixed(cache_step);	
			   
			var urlResult = baseURL + wmsParams.join("&") + "&bbox=" + bbox;

            return urlResult;
        	 */
        	
        	//return "http://openapi.its.go.kr/api/wmtsTile?key=1405053672750&zoom="+zoom+"&row="+coord.y+"&col="+coord.x;
        	
        	var tileUrl = baseURL.replace(/\{zoomLevel\}/g, zoom).replace(/\{TileRow\}/g, coord.y).replace(/\{TileCol\}/g, coord.x);
        	return tileUrl;
        },

        tileSize: new google.maps.Size(tileHeight, tileWidth),

        minZoom: minZoomLevel,
        maxZoom: maxZoomLevel,
        overviewMapControl: true,
		overviewMapControlOptions: {
			opened: true        
		},

        opacity: opacityLevel,

        isPng: isPng
    };

    var overlayWMS = new google.maps.ImageMapType(overlayOptions);

    nTrafficLayerID = map.overlayMapTypes.length;
    map.overlayMapTypes.insertAt(nTrafficLayerID, overlayWMS);

}

var bTrafficRegend = false;
var nTrafficLayerID = -1;
var nTrafficControlID = 0;

// Add a Home control that returns the user to London
function TrafficControl(controlDiv, map, url) {
	controlDiv.style.padding = '5px';
	var controlUI = document.createElement('div');
	// controlUI.style.backgroundColor = 'yellow';
	controlUI.style.backgroundColor = '#FFFFFF';
	controlUI.style.border='1px solid';
	controlUI.style.cursor = 'pointer';
	controlUI.style.textAlign = 'center';
	controlUI.style.verticalAlign = 'middle';
	controlUI.title = '교통지도(국토해양부 제공)';
	controlDiv.appendChild(controlUI);

	var controlText = document.createElement('div');
	controlText.style.fontFamily='Gullim,Arial,sans-serif';
	controlText.style.fontSize='14px';
	controlText.style.paddingTop = '2px';
	controlText.style.paddingBottom = '0px';
	controlText.style.paddingLeft = '10px';
	controlText.style.paddingRight = '10px';
	controlText.innerHTML = '<b>교통지도<b>'
	controlUI.appendChild(controlText);
	
	var trafficURI = url + "?";
	
	// Setup click-event listener: simply set the map to London
	google.maps.event.addDomListener(controlUI, 'click', function() {
		// map.setCenter(london)
		// alert("Test");
		
		if( bTrafficRegend == false ){
	    	var trafficControl = document.createElement('IMG');
	    	trafficControl.src = getContextPath() + "/resources/images/realtime/traffic_regend.png";
	    	trafficControl.index = 1;
	    	// map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(trafficControl);
	    	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].insertAt(nTrafficControlID, trafficControl);
	    	bTrafficRegend = true;

		    var customParams = [
		                        "FORMAT=image/gif",
		                        "LAYERS=STD_LINK",
		                        "TILED=false",
		                        "ISBASELAYER=false",
		                        "EXCEPTIONS=application/vnd.ogc.se_inimage"
		                    ];
  
		    // Add query string params to custom params
		    var pairs = location.search.substring(1).split('&');
		    for (var i = 0; i < pairs.length; i++) {
		    	customParams.push(pairs[i]);
		    }
		    
		    loadWMS(map, trafficURI, customParams);
		    
		    controlUI.style.backgroundColor = '#00acff';
		    
		} else {
			map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].removeAt(nTrafficControlID);
			map.overlayMapTypes.removeAt(nTrafficLayerID);
			
			nTrafficLayerID = -1;
			
			controlUI.style.backgroundColor = '#FFFFFF';
			controlUI.style.border='1px solid';
			bTrafficRegend = false;
		}
		
	});
}

function createTrafficButton(map){
	
	var codeGubun = '5';
	var strUrl = getContextPath() + "/APIControlAction.do?method=getITSAPIInfo&API_GUBUN=" + codeGubun;
	
	$.getJSON(strUrl,{},function(jsonData) {
		if(jsonData != null && jsonData.length > 0)
		{
			var baseURI = jsonData[0].API_BASEURL;
			
		    var trafficControlDiv = document.createElement('div');
		    var myControl = new TrafficControl(trafficControlDiv, map, baseURI);
		    
		    map.controls[google.maps.ControlPosition.TOP_RIGHT].insertAt(nTrafficControlID, trafficControlDiv);

		}
	});

}

function innerCreateTrafficView(map, infoURL){
	bTrafficRegend = true;

	//var trafficURI = infoURL + "?";
	
    var customParams = [
                        "FORMAT=image/gif",
                        "LAYERS=STD_LINK",
                        "TILED=false",
                        "ISBASELAYER=false",
                        "EXCEPTIONS=application/vnd.ogc.se_inimage"
                    ];

    // Add query string params to custom params
    var pairs = location.search.substring(1).split('&');
    for (var i = 0; i < pairs.length; i++) {
    	customParams.push(pairs[i]);
    }
    
    //loadWMS(map, trafficURI, customParams);
    loadWMS(map, infoURL, customParams);
    
    var trafficControl = document.createElement('IMG');
	trafficControl.src = getContextPath() + "/resources/images/realtime/traffic_regend.png";
	trafficControl.index = 1;
	// map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(trafficControl);
	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].insertAt(nTrafficControlID, trafficControl);
	
}

function innerDeleteTrafficView(map){
	if( nTrafficLayerID > -1 ){
		map.overlayMapTypes.removeAt(nTrafficLayerID);
		bTrafficRegend = false;
		nTrafficLayerID = -1;
	}
	
	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].removeAt(nTrafficControlID);
}

function toggleTrafficView(map, strUrl){
	
	if( bTrafficRegend == false ){ 
		innerCreateTrafficView(map, strUrl);
	} else {
		innerDeleteTrafficView(map);
	}
}
