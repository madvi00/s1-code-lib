	var manager;
	var bermudaTriangle;
	var objAreaPolygonsLayer;
	function initializeLayer() {
	    
	    var x = 33.113712 + (39.954758-33.113712)/2;
	    var y = 124.612678 + (131.954758-124.612678)/2;
	    if(geoXPOS != null && geoXPOS != "") {
	        x = geoXPOS;
	        y = geoYPOS;
	    }
	    
	    var mapOptions = {
	            disableDefaultUI : false,
	            center : new daum.maps.LatLng(x, y),
	            //mapTypeId : daum.maps.MapTypeId.ROADMAP,
	            level: zoomLevel,
	            maxZoom : 19,
	            minZoom : 3,
	        };
	    
	    map = new daum.maps.Map(document.getElementById('mapCanvasLayer'),
	            mapOptions);
	    
	    //geocoder = new daum.maps.services.Geocoder();
	    
	    //initPlaceIcon();
	    
	    // mapType 컨트롤 
	    var mapTypeControl = new daum.maps.MapTypeControl();
	    // 지도 오른쪽 위에 지도 타입 컨트롤이 표시되도록 지도에 컨트롤을 추가한다.
	    map.addControl(mapTypeControl, daum.maps.ControlPosition.TOPRIGHT);
	    
	    //마커 생성
	    addNewMarker();
	    //ZONE 생성
	    var polygonPath = parent.objAreaPolygons;
	    drawPolygon(polygonPath);
	    
	    /*daum.maps.event.addListener(map, 'click', function(event) {
	        if (isAreaPolygonPaintActive) {
	            addAreaPolygonMarker(event.latLng);
	        }
	      });
	    
	    daum.maps.event.addDomListener(document, "mousedown", function (e) {
	        
	        if (e.which == 3) {
	            if (isAreaPolygonPaintActive) {
	                isAreaPolygonPaintActive = false;
	            }
	            daum.maps.event.trigger(document, "mouseup", e);
	        }
	    });
	    
	    if(bermudaTriangle != undefined) {
	        daum.maps.event.addListener(bermudaTriangle, 'rightclick', function(event) {
	            if (event.vertex == undefined) {
	                return;
	            } else {
	                removeVertex(event.vertex);
	            }
	        });
	    }
	    
	    if(bermudaTriangle != undefined) {
	        daum.maps.event.addListener(bermudaTriangle, 'dragstart', function(event) {
	            var array = bermudaTriangle.getPath().getArray();
	            beforeXPOS = array[0].getLng();
	            beforeYPOS = array[0].getLat();
	        });
	    }
	    
	    if(bermudaTriangle != undefined) {
	        daum.maps.event.addListener(bermudaTriangle, 'dragend', function(event) {
	            var array = bermudaTriangle.getPath().getArray();
	            var afterXPOS = array[0].getLng();
	            var afterYPOS = array[0].getLat();
	            var lat = marker.getPosition().getLat() + (afterYPOS - beforeYPOS);
	            var lng = marker.getPosition().getLng() + (afterXPOS - beforeXPOS);
	            
	            marker.setPosition(new daum.maps.LatLng( lat, lng ) );
	        });
	    }*/
	    
	}

	function addNewMarker() {

	    //refreshTargetInfo();
	    
	    var location = new daum.maps.LatLng(geoXPOS, geoYPOS);
	//  var marker_pick_pt = context_u+"/images/"+langset+"/realtime/now_place.png";
	    marker = new daum.maps.Marker({
	        position : location,
	        map : map,
	        flat : false,
	        //icon : marker_pick_pt,
	        //title : cmNum,
	        zIndex : -1,
	        draggable : false,
	        //labelContent: "",
	        //animation: daum.maps.Animation.DROP
	    });
	    setMarkerImage(marker, getContextPath() + "/resources/images/map/now_place.png");
	    //return marker;
	}
	/* 다음 마커 이미지 전용 */
	function setMarkerImage(marker, src) {
	    //처음에는 기본마커가 나오기 때문에 아예 마커를 표시하지 않는다.
	    marker.setImage(new daum.maps.MarkerImage( '', new daum.maps.Size(0, 0)));

	    var img = new Image();
	    img.src = src;
	    
	    img.onload = function() {
	        var markerImage = new daum.maps.MarkerImage(
	            src,
	            new daum.maps.Size(img.width, img.height), new daum.maps.Point(img.width/2, img.height));
	            
	        marker.setImage(markerImage);
	        delete markerImage;
	    };
	    delete img;
	}

	function drawPolygon(polygonPath) {
	    if(polygonPath != undefined && polygonPath !=null) {
	        var keys = polygonPath.keys();
	        var polygon = polygonPath.get(keys[polygonPath.size()-1]);
	        var array = polygon.getPath();
	        
	        var triangleCoords = [];
	        
	        for(var i=0; i<array.length; i++) {
	            //var xycoord = array[i].replace(/^\s+/,"").replace(/ /, ",").split(",");
	            //triangleCoords.push(new daum.maps.LatLng(xycoord[1], xycoord[0]));
	            triangleCoords.push(new daum.maps.LatLng(array[i].getLat(), array[i].getLng()));
	        }
	    
	        bermudaTriangle = new daum.maps.Polygon({
	            //paths: triangleCoords,
	            strokeColor: strokeColor,
	            strokeOpacity: 0.8,
	            strokeWeight: 2,
	            fillColor: fillColor,
	            fillOpacity: 0.2,
	            map: map,
	            //center: marker.getPosition(),
	            path: triangleCoords,
	            draggable : false,
	            editable: false
	        });
	        
	        /*
	          // Construct the polygon.
	       bermudaTriangle = new daum.maps.Polygon({
	            //paths: triangleCoords,
	            strokeColor: strokeColor,
	            strokeOpacity: 0.8,
	            strokeWeight: 2,
	            fillColor: fillColor,
	            fillOpacity: 0.2,
	            map: map,
	            //center: marker.getPosition(),
	            draggable : false,
	            editable: false
	        });*/
	        bermudaTriangle.setMap(map);
	        bermudaTriangle.setPath(triangleCoords);
	        map.setLevel(zoomLevel);
	        
	        //bermudaTriangle.bindTo('center', marker, 'position');
	        
	        //폴리곤 오브젝트 재설정
	        objAreaPolygonsLayer = new s1_DistancePaint();
	        for(var i=0; i<array.length; i++) {
	        	objAreaPolygonsLayer.put(i, bermudaTriangle, 0);
	        }
	        
	        if(bermudaTriangle != undefined) {
	    		daum.maps.event.addListener(bermudaTriangle, 'rightclick', function(event) {
	    			if (event.vertex == undefined) {
	    				return;
	    			} else {
	    				removeVertex(event.vertex);
	    			}
	    		});
	    	}
	    }
	}

	//포인트 삭제
	function removeVertex(vertex) {
		var path = bermudaTriangle.getPath();
		path.removeAt(vertex);
	}
	
	function updPolygon() {
	    if(manager != null){return;}
	    if(bermudaTriangle != null) {
	        var path = bermudaTriangle.getPath();
	        
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
	            parent.editZone();
	        });
	        
	        manager.put(daum.maps.drawing.OverlayType.POLYGON, path);
	        
	        bermudaTriangle.setMap(null);
	        bermudaTriangle = null;
	        //bermudaTriangle.setEditable(true);
	        //bermudaTriangle.setDraggable(true);
	    }
	}

	function applyPolygonLayer() {
	    
	    /* var keys = objAreaPolygons.keys();
	    var polygon = objAreaPolygons.get(keys[objAreaPolygons.size()-1]);
	    var array = polygon.getPath(); */
	    if(manager == null){
	        var keys = parent.objAreaPolygons.keys();
	        var polygon = parent.objAreaPolygons.get(keys[objAreaPolygons.size()-1]);
	        var array = polygon.getPath();
	        applyPolygon(array, marker);
	    }else{
	    
	        var array = manager.getData();
	        var array2 = [];
	        for(var i = 0 ; i < array.polygon[0].points.length ; i++){
	            array2.push(new daum.maps.LatLng(array.polygon[0].points[i].y, array.polygon[0].points[i].x));
	        }
	        array = array2;
	    }
	    parent.applyPolygon(array, marker);
	    
	}