var bermudaTriangle;

function initializeLayer() {
	
	var x = 33.113712 + (39.954758-33.113712)/2;
	var y = 124.612678 + (131.954758-124.612678)/2;
	if(geoXPOS != null && geoXPOS != "") {
		x = geoXPOS;
		y = geoYPOS;
	}
	
	var mapOptions = {
			disableDefaultUI : false,
			center : new google.maps.LatLng(x, y),
			overviewMapControl : false,
			overviewMapControlOptions : {
				opened : false
			},
			panControl : false,
			zoomControl : true,
			zoomControlOptions : {
				style : google.maps.ZoomControlStyle.LARGE,
				position : google.maps.ControlPosition.TOP_RIGHT
			},
			scaleControl : false,
			mapTypeId : google.maps.MapTypeId.ROADMAP,
			zoom: parseInt(zoomLevel),
			maxZoom : 19,
			minZoom : 3,
			streetViewControl : false,
			streetViewControlOptions: {
		        position: google.maps.ControlPosition.TOP_RIGHT
		    },
		    gestureHandling: 'greedy'
		};
	
  	map = new google.maps.Map(document.getElementById('mapCanvasLayer'),
  			mapOptions);
  	
	geocoder = new google.maps.Geocoder();
	
	//initPlaceIcon();
	
	//마커 생성
	addNewMarkerLayer();
	//ZONE 생성
	var polygonPath = parent.objAreaPolygons;
	drawPolygon(polygonPath);
	
	google.maps.event.addListener(map, 'click', function(event) {
		if (isAreaPolygonPaintActive) {
            addAreaPolygonMarker(event.latLng);
        }
	  });
	
	google.maps.event.addDomListener(document, "mousedown", function (e) {
		
        if (e.which == 3) {
            if (isAreaPolygonPaintActive) {
                isAreaPolygonPaintActive = false;
            }
            google.maps.event.trigger(document, "mouseup", e);
        }
    });
	
	if(bermudaTriangle != undefined) {
		google.maps.event.addListener(bermudaTriangle, 'rightclick', function(event) {
			if (event.vertex == undefined) {
				return;
			} else {
				removeVertex(event.vertex);
			}
		});
	}
	
	if(bermudaTriangle != undefined) {
		google.maps.event.addListener(bermudaTriangle, 'dragstart', function(event) {
		    var array = bermudaTriangle.getPath().getArray();
		    beforeXPOS = array[0].lng();
		    beforeYPOS = array[0].lat();
	    });
	}
	
	if(bermudaTriangle != undefined) {
		google.maps.event.addListener(bermudaTriangle, 'dragend', function(event) {
		    var array = bermudaTriangle.getPath().getArray();
		    var afterXPOS = array[0].lng();
		    var afterYPOS = array[0].lat();
		    var lat = markerLayer.getPosition().lat() + (afterYPOS - beforeYPOS);
		    var lng = markerLayer.getPosition().lng() + (afterXPOS - beforeXPOS);
		    
		    markerLayer.setPosition(new google.maps.LatLng( lat, lng ) );
	    });
	}
	
}

//포인트 삭제
function removeVertex(vertex) {
	var path = bermudaTriangle.getPath();
	path.removeAt(vertex);
}

// 지점관리 존편집 마커 생성
function addNewMarkerLayer() {
	var location = new google.maps.LatLng(geoXPOS, geoYPOS);
	markerLayer = new google.maps.Marker({
		position : location,
		map : map,
		flat : false,
		icon : getContextPath() + "/resources/images/map/now_place.png",
		//title : cmNum,
		zIndex : -1,
		draggable : false,
		//labelContent: "",
		animation: google.maps.Animation.DROP
	});
    //return marker;
}

function drawPolygon(polygonPath) {
	if(polygonPath != undefined && polygonPath !=null) {
		var keys = polygonPath.keys();
		var polygon = polygonPath.get(keys[polygonPath.size()-1]);
	    var array = polygon.getPath().getArray();
		
	    var triangleCoords = [];
	    
	    for(var i=0; i<array.length; i++) {
	    	//var xycoord = array[i].replace(/^\s+/,"").replace(/ /, ",").split(",");
	    	//triangleCoords.push(new google.maps.LatLng(xycoord[1], xycoord[0]));
	    	triangleCoords.push(new google.maps.LatLng(array[i].lat(), array[i].lng()));
	    }
	
		  // Construct the polygon.
	   bermudaTriangle = new google.maps.Polygon({
		    paths: triangleCoords,
		    strokeColor: strokeColor,
		    strokeOpacity: 0.8,
		    strokeWeight: 2,
		    fillColor: fillColor,
		    fillOpacity: 0.2,
		    map: map,
		    //center: marker.getPosition(),
		    draggable : false,
		    editable: false
	    });
	   
	    //bermudaTriangle.setMap(map);
	    map.setZoom(zoomLevel);
	    
	    //bermudaTriangle.bindTo('center', marker, 'position');
	    
	    //폴리곤 오브젝트 재설정
	    objAreaPolygonsLayer = new s1_DistancePaint();
	    for(var i=0; i<array.length; i++) {
	    	objAreaPolygonsLayer.put(i, bermudaTriangle, 0);
	    }
	} else {
		
		var top_lng = pt_marker.getPosition().lng();
        var top_lat = pt_marker.getPosition().lat()-1+1.000555;
        var bottom_lng = pt_marker.getPosition().lng();
        var bottom_lat = pt_marker.getPosition().lat()-0.000555;
        var left_lng = pt_marker.getPosition().lng()-0.000555;
        var left_lat = pt_marker.getPosition().lat();
        var right_lng = pt_marker.getPosition().lng()-1+1.000555;
        var right_lat = pt_marker.getPosition().lat();
        
        var new_Coords = [
            {lat: top_lat, lng: top_lng},
            {lat: right_lat, lng: right_lng},
            {lat: bottom_lat, lng: bottom_lng},
            {lat: left_lat, lng: left_lng}
        ];
        
        bermudaTriangle = new google.maps.Polygon({
            paths: new_Coords,
            strokeColor: '#5B67D9',
            strokeOpacity: 0.8,
            strokeWeight: 3,
            fillColor: '#5B67D9',
            fillOpacity: 0.35
        });
        
        bermudaTriangle.setMap(map);
        
        objAreaPolygonsLayer = new s1_DistancePaint();
        for(var i=0; i < 4; i++) {
        	objAreaPolygonsLayer.put(i, bermudaTriangle, 0);
        }
	}
	
	updPolygon();
}

function updPolygon() {
	if(bermudaTriangle != null) {
		bermudaTriangle.setEditable(true);
		bermudaTriangle.setDraggable(true);
	}
}

function applyPolygonLayer() {
	var keys = objAreaPolygonsLayer.keys();
	var polygon = objAreaPolygonsLayer.get(keys[objAreaPolygonsLayer.size()-1]);
    var array = polygon.getPath().getArray();
    
    parent.applyPolygon(array, markerLayer);
}