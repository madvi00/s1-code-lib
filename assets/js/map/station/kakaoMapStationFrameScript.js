var manager;
var bermudaTriangle2;
var objAreaPolygons2 = null;
    
function initialize() {
	var x = 33.113712 + (39.954758-33.113712)/2;
	var y = 124.612678 + (131.954758-124.612678)/2;
	if(parent.globalSiLatitude != null && parent.globalSiLatitude != "") {
		x = parent.globalSiLatitude;
        y = parent.globalSiLongitude;
	}
	
	var mapOptions = {
			disableDefaultUI : false,
			center : new daum.maps.LatLng(x, y),
			//mapTypeId : daum.maps.MapTypeId.ROADMAP,
			level: parent.kakaoMap.zoom,
			maxZoom : 19,
			minZoom : 3,
		};
	
  	map = new daum.maps.Map(document.getElementById('mapCanvasLayer'),mapOptions);
  	
  	//geocoder = new daum.maps.services.Geocoder();
	
	//initPlaceIcon();
	
	// mapType 컨트롤 
	var mapTypeControl = new daum.maps.MapTypeControl();
	// 지도 오른쪽 위에 지도 타입 컨트롤이 표시되도록 지도에 컨트롤을 추가한다.
	map.addControl(mapTypeControl, daum.maps.ControlPosition.TOPRIGHT);
	
	//마커 생성
	addNewMarker();
	//ZONE 생성
	drawPolygon(parent.objAreaPolygons);
	
	
}

function drawPolygon(polygonPath) {
    
    if(polygonPath != undefined && polygonPath !=null) {
        var keys = polygonPath.keys();
        var polygon = polygonPath.get(keys[polygonPath.size()-1]);
        var array = [];
        var triangleCoords = [];
        
        if(googleYn) {
            array = polygon.getPath().getArray();
            
            for(var i=0; i<array.length; i++) {
                //var xycoord = array[i].replace(/^\s+/,"").replace(/ /, ",").split(",");
                //triangleCoords.push(new google.maps.LatLng(xycoord[1], xycoord[0]));
                triangleCoords.push(new google.maps.LatLng(array[i].lat(), array[i].lng()));
            }
        } else {
            array = polygon.getPath();
            
            for(var i=0; i<array.length; i++) {
                //var xycoord = array[i].replace(/^\s+/,"").replace(/ /, ",").split(",");
                //triangleCoords.push(new daum.maps.LatLng(xycoord[1], xycoord[0]));
                triangleCoords.push(new daum.maps.LatLng(array[i].getLat(), array[i].getLng()));
            }
        }
    
        if(googleYn) {
          // Construct the polygon.
           bermudaTriangle2 = new google.maps.Polygon({
                paths: triangleCoords,
                strokeColor: "#5B67D9",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#5B67D9",
                fillOpacity: 0.2,
                map: map,
                //center: marker.getPosition(),
                draggable : false,
                editable: false
            });
           
            map.setZoom(googleMap.getZoom());
            //bermudaTriangle.bindTo('center', marker, 'position');
        } else {
        	bermudaTriangle2 = new daum.maps.Polygon({
                //paths: triangleCoords,
                strokeColor: "#5B67D9",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "#5B67D9",
                fillOpacity: 0.2,
                map: map,
                //center: marker.getPosition(),
                path: triangleCoords,
                draggable : false,
                editable: false
            });
        	
//         	 bermudaTriangle.setMap(map);
//           bermudaTriangle.setPath(triangleCoords);
             map.setLevel(parent.kakaoMap.getLevel());
        }
        
        //폴리곤 오브젝트 재설정
        objAreaPolygons2 = new s1_DistancePaint();
        for(var i=0; i<array.length; i++) {
            objAreaPolygons2.put(i, bermudaTriangle2, 0);
        }
    }
}

function updPolygon() {
	if(manager != null){return;}
	if(bermudaTriangle2 != null) {
		var path = bermudaTriangle2.getPath();
		
		var options = {
			    map: map, // drawing manager로 그리기 요소를 그릴 map 객체 
			    drawingMode: [ // drawing manager로 제공할 그리기 요소 모드
			        daum.maps.drawing.OverlayType.POLYGON
			    ],
			    guideTooltip: ['draw', 'drag', 'edit'], // 사용자에게 제공할 그리기 가이드 툴팁
			    polygonOptions: {
			        draggable: true,
			        removable: false,
			        editable: true,
			        strokeColor: '#39f',
			        fillColor: '#39f',
			        fillOpacity: 0.5,
			        hintStrokeStyle: 'dash',
			        hintStrokeOpacity: 0.5
		
			    }
		
		};
		manager = new daum.maps.drawing.DrawingManager(options);
		manager.addListener('remove', function(e) {
		    manager = null;
		    initPolygon();
		});
		
		manager.put(daum.maps.drawing.OverlayType.POLYGON, path);
		
		bermudaTriangle2.setMap(null);
		bermudaTriangle2 = null;
		//bermudaTriangle.setEditable(true);
		//bermudaTriangle.setDraggable(true);
	}
	
}


function applyPolygonLayer() {
    if(manager == null){
    	var keys = objAreaPolygons.keys();
		var polygon = objAreaPolygons.get(keys[objAreaPolygons.size()-1]);
	    var array = polygon.getPath();
	    parent.applyPolygon(array, marker);
   
    } else {
	    var array = manager.getData();
	    var array2 = [];
	    for(var i = 0 ; i < array.polygon[0].points.length ; i++){
	    	array2.push(new daum.maps.LatLng(array.polygon[0].points[i].y, array.polygon[0].points[i].x));
	    }
		array = array2;
    }
    parent.applyPolygon(array, marker);
    
    // 팝업 띄우기
    parent.findAddress(parent.globalSiLatitude, parent.globalSiLongitude, parent.kakaoMap, parent.kakaoMarker);
}

function addNewMarker() {
    var location = null;
    
    if(googleYn) {
    	location = new google.maps.LatLng(parent.globalSiLatitude, parent.globalSiLongitude);
    } else {
    	location = new daum.maps.LatLng(parent.globalSiLatitude, parent.globalSiLongitude);
    }

    var marker_pick_pt = getContextPath() + "/resources/images/map/now_place.png";
    
    if(googleYn) {
        marker = new google.maps.Marker({
            position : location,
            map : map,
            flat : false,
            icon : marker_pick_pt,
            //title : cmNum,
            zIndex : 101,
            draggable : false,
            //labelContent: "",
            animation: google.maps.Animation.DROP
        });
    } else {
    	marker = new daum.maps.Marker({
            position : location,
            map : map,
            flat : false,
            //icon : marker_pick_pt,
            //title : cmNum,
            zIndex : 101,
            draggable : false,
            //labelContent: "",
            //animation: daum.maps.Animation.DROP
        });
    }
    
    
    //return marker;
}


function initPolygon() {
//  clearPolygon();
//  var strUrl = "${pageContext.request.contextPath}/ZoneEditAction.do?method=dataresultList";
//  strUrl += "&ZONE_DIV="+"zone_div";
//  strUrl += "&OP_CODE=S";
//  strUrl += "&SEL_SI_IDX=" + "si_idx";
//  strUrl += "&OFF_KEY=" + "off_key%>";
//  strUrl += "&KEY_GEO_ID=" + "key_geo_id%>";
//  strUrl += "&XPOS=" + geoXPOS;
//  strUrl += "&YPOS=" + geoYPOS;
 
//  var date = new Date().getTime();
//  strUrl += "&militime="+date;
//  $.getJSON(strUrl,{},function(jsonData) {
//      setZoneArea(jsonData[0].GEOM_FENCE);
//  });
     
     var top_lng;
     var top_lat;
     var bottom_lng;
     var bottom_lat;
     var left_lng;
     var left_lat;
     var right_lng;
     var right_lat;
     
     if(googleYn) {
         top_lng = fastMarkers[0].getPosition().lng();
         top_lat = fastMarkers[0].getPosition().lat()-1+1.000555;
         bottom_lng = fastMarkers[0].getPosition().lng();
         bottom_lat = fastMarkers[0].getPosition().lat()-0.000555;
         left_lng = fastMarkers[0].getPosition().lng()-0.000555;
         left_lat = fastMarkers[0].getPosition().lat();
         right_lng = fastMarkers[0].getPosition().lng()-1+1.000555;
         right_lat = fastMarkers[0].getPosition().lat();
    	 
     } else {
         top_lng = fastMarkers[0].getPosition().getLng();
         top_lat = fastMarkers[0].getPosition().getLat()-1+1.000555;
         bottom_lng = fastMarkers[0].getPosition().getLng();
         bottom_lat = fastMarkers[0].getPosition().getLat()-0.000555;
         left_lng = fastMarkers[0].getPosition().getLng()-0.000555;
         left_lat = fastMarkers[0].getPosition().getLat();
         right_lng = fastMarkers[0].getPosition().getLng()-1+1.000555;
         right_lat = fastMarkers[0].getPosition().getLat();
    	 
     }
     
     var new_Coords = [
         {lat: top_lat, lng: top_lng},
         {lat: right_lat, lng: right_lng},
         {lat: bottom_lat, lng: bottom_lng},
         {lat: left_lat, lng: left_lng}
     ];
     
     if(googleYn) {
         bermudaTriangle2 = new google.maps.Polygon({
             paths: new_Coords,
             strokeColor: '#5B67D9',
             strokeOpacity: 0.8,
             strokeWeight: 3,
             fillColor: '#5B67D9',
             fillOpacity: 0.35
         });
     } else {
    	 bermudaTriangle2 = new daum.maps.Polygon({
             paths: new_Coords,
             strokeColor: '#5B67D9',
             strokeOpacity: 0.8,
             strokeWeight: 3,
             fillColor: '#5B67D9',
             fillOpacity: 0.35,
             draggable : false,
             editable: false
    	 });
     }
     
     bermudaTriangle2.setMap(map);
     
     objAreaPolygons2 = new s1_DistancePaint();
     for(var i=0; i < 4; i++) {
         objAreaPolygons2.put(i, bermudaTriangle2, 0);
     }
}