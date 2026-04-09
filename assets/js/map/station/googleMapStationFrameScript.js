    // ================================================================= 레이어 팝업 ============================================================
    
    var iAreaPolygonIndex = 0;
    var objDistanceMarkers;
    var objAreaPolygons;
    var map;
    var geocoder;
    var isAreaPolygonPaintActive = false;
    var bermudaTriangle;
    var marker;
    var beforeXPOS;
    var beforeYPOS;
    var map; //지도 객체
    var geoXPOS = "";
    var geoYPOS = "";
    var strokeColor = "";
    var fillColor = "";
    var zoomLevel = "";
    var bermudaTriangle2;
    var objAreaPolygons2 = null;
    
    function initialize() {
        var x = 33.113712 + (39.954758-33.113712)/2;
        var y = 124.612678 + (131.954758-124.612678)/2;
        if(parent.globalSiLatitude != null && parent.globalSiLongitude != "") {
            x = parent.globalSiLatitude;
            y = parent.globalSiLongitude;
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
                zoom: parent.googleMap.getZoom(),
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
        addNewMarker();
        //ZONE 생성
        drawPolygon(parent.objAreaPolygons);
        
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
                var lat = parent.googleMarker.getPosition().lat() + (afterYPOS - beforeYPOS);
                var lng = parent.googleMarker.getPosition().lng() + (afterXPOS - beforeXPOS);
                
                parent.googleMarker.setPosition(new google.maps.LatLng( lat, lng ) );
            });
        }
        
    }
    
    function clearAreaPolygon(index) {

        var keys, tempObj;
//         keys = objDistanceMarkers.keys();
//         for (var i = 0; i < objDistanceMarkers.size() ; i++) {
//             tempObj = objDistanceMarkers.get(keys[i]);
//             if (tempObj.index == index) {
//                 tempObj.setMap(null);
//             }
//         }

        keys = objAreaPolygons2.keys();
        for (var i = 0; i < objAreaPolygons2.size() ; i++) {
            tempObj = objAreaPolygons2.get(keys[i]);

            if (tempObj.index == index) {
                tempObj.setMap(null);
            }
        }

        delete keys, tempObj;

    }
 // var globalSiLatitude, globalSiLongitude, globalSiFlag, globalSiTempFlag, globalSiAreaCode, globalSiName, globalSiFile, globalSiAreaCode, globalSiNote;
    
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
           bermudaTriangle2 = new google.maps.Polygon({
                paths: triangleCoords,
                strokeColor: '#5B67D9',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#5B67D9',
                fillOpacity: 0.2,
                map: map,
                //center: marker.getPosition(),
                draggable : false,
                editable: false
            });
           
//             bermudaTriangle.setMap(map);
            map.setZoom(parent.googleMap.getZoom());
            
            //bermudaTriangle.bindTo('center', marker, 'position');
            
            //폴리곤 오브젝트 재설정
            objAreaPolygons2 = new s1_DistancePaint();
            for(var i=0; i<array.length; i++) {
                objAreaPolygons2.put(i, bermudaTriangle2, 0);
            }
        }
    }
    
    function updPolygon() {
        if(bermudaTriangle2 != null) {
            bermudaTriangle2.setEditable(true);
            bermudaTriangle2.setDraggable(true);
        }
    }
    
    function applyPolygonLayer() {
        var keys = objAreaPolygons2.keys();
        var polygon = objAreaPolygons2.get(keys[objAreaPolygons2.size()-1]);
        var array = polygon.getPath().getArray();
        
        parent.applyPolygon(array, marker);
        
        // 팝업 띄우기
        parent.findAddress(parent.globalSiLatitude, parent.globalSiLongitude, parent.googleMap, parent.googleMarker);
     
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
//          setZoneArea(jsonData[0].GEOM_FENCE);
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
             top_lng = parent.fastMarkers[0].getPosition().lng();
             top_lat = parent.fastMarkers[0].getPosition().lat()-1+1.000555;
             bottom_lng = parent.fastMarkers[0].getPosition().lng();
             bottom_lat = parent.fastMarkers[0].getPosition().lat()-0.000555;
             left_lng = parent.fastMarkers[0].getPosition().lng()-0.000555;
             left_lat = parent.fastMarkers[0].getPosition().lat();
             right_lng = parent.fastMarkers[0].getPosition().lng()-1+1.000555;
             right_lat = parent.fastMarkers[0].getPosition().lat();
        	 
         } else {
             top_lng = parent.fastMarkers[0].getPosition().getLng();
             top_lat = parent.fastMarkers[0].getPosition().getLat()-1+1.000555;
             bottom_lng = parent.fastMarkers[0].getPosition().getLng();
             bottom_lat = parent.fastMarkers[0].getPosition().getLat()-0.000555;
             left_lng = parent.fastMarkers[0].getPosition().getLng()-0.000555;
             left_lat = parent.fastMarkers[0].getPosition().getLat();
             right_lng = parent.fastMarkers[0].getPosition().getLng()-1+1.000555;
             right_lat = parent.fastMarkers[0].getPosition().getLat();
        	 
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