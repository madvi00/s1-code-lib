//////////////////////////////////////////////////////////////////////////////////////////
// Map 지도처리 시작
//////////////////////////////////////////////////////////////////////////////////////////
var kakaoMap; //지도 객체
var mapPosition; //지도 좌표
var fastMarkers = [];
var firstCall = true;

var blnMapFirst = true; // 최초 호출 여부
var geomFence = "";
var bermudaTriangle;
var objAreaPolygons = null;
var kakaoMarker = null;
var kakaoFixMarker = null;
var new_polygon;

var infowindow = new daum.maps.InfoWindow({
	//maxWidth : 480,
	map: kakaoMarker,
	removable: true,
	zIndex : 2147483647		//max z-index (최상위 표출)
    //position: new daum.maps.LatLng(33.450701, 126.570667),
    //content: 'I am InfoWindow'
});

function callInitMap() {
	// 맵 초기 세팅
	initializeMap("map_canvas", strMapBasicXPOS, strMapBasicYPOS, "siLatitude", "siLongitude", strMapBasicName);
}

function initializeMap(map_id, x_pos, y_pos, id_xpos, id_ypos, strTitle) {
	globalSiLatitude  = x_pos;
    globalSiLongitude = y_pos;
    
	toggle_set = true;
	fastMarkers = [];
	
	mapPosition = new daum.maps.LatLng(x_pos, y_pos);
	var mapOptions = {
		zoom: 17,
		maxZoom: 19,
  		minZoom: 3,
		center: mapPosition,
		mapTypeId: daum.maps.MapTypeId.ROADMAP,
	    gestureHandling: 'greedy',
	    disableDoubleClickZoom: true
	};
		
	blnMapFirst = false;
	kakaoMap = window.map = new daum.maps.Map(document.getElementById(map_id), mapOptions);
	kakaoMap.addControl(new daum.maps.MapTypeControl(), daum.maps.ControlPosition.TOPRIGHT);
	
	kakaoMarker = new daum.maps.Marker({position:mapPosition, map:kakaoMap, flat:true, icon: strMapMarkerIco, title:strTitle});
	fastMarkers.push(kakaoMarker);
	
	 if(firstCall) {
       	// 첫 지도 호출시 마커 제거
     	setMarkersIconChange(0, 0, true);
     	firstCall = false;
     }
	
	daum.maps.event.addListener(kakaoMap,'click',function(event) {
		mapClickAction(event);
	});
	daum.maps.event.addListener(kakaoMarker,'click',function(event) {
		mapClickAction(event);
	});
	daum.maps.event.addListener(kakaoMap, 'maptypeid_changed', function() {
		var mapType = kakaoMap.getMapTypeId();
	});
}

function mapSetting(lat, lng, name, siFlag, geomFence) {
	
	// 맵 초기화
	initializeMap("map_canvas", lat, lng, "siLatitude", "siLongitude", name);
	
	// 마커 변경
	setMarkersIconChange(0, siFlag ,false);
	
	// 폴리곤 세팅
	setZoneArea(geomFence);
	
	// 위치변경 불가
	toggle_set = false;

	// 팝업 띄우기
    findAddress(lat, lng, kakaoMap, kakaoMarker);
}


//주변 주소 검색
function findAddress(lat, lng, map, kakaoMarker) {
	var geocoder = new daum.maps.services.Geocoder();
	var coord = new daum.maps.LatLng(lat, lng);
	
    geocoder.coord2Address(coord.getLng(), coord.getLat() , function(result, status) {
    	if (status === daum.maps.services.Status.OK) {	// == 과 동일?
    		infowindow.setContent(createHtmlInMap(result[0].address.address_name));
    		infowindow.open(kakaoMap, kakaoMarker);
    		
    		setTimeout(function() {
            	makeClearable();
            }, 200);
    		
    	}	else {
    		address = '';
    		alert(messageFailedAddrConvert);
    	}			
    });
}

function pressEnter(e) {
	if(kakaoFixMarker != null){
		kakaoFixMarker.setMap(null);
		kakaoFixMarker = null;
	}
	
	var geo_addr = document.getElementById("addressInput");
	if(!$("#addressInput").val()){
		alert(messageAddressInput); // 검색할 주소를 입력하세요 (시/구/동) 
		geo_addr.focus();
	}else{
		//var geocoder = new daum.maps.Geocoder();
		var geocoder = new daum.maps.services.Geocoder();
		var address = geo_addr.value;

		//addr2coord
		geocoder.addressSearch( address, function(results, status) {
			
			if (status == daum.maps.services.Status.OK) {
				
				//var coords = new daum.maps.LatLng(results.addr[0].lat, results.addr[0].lng);		
				var coords = new daum.maps.LatLng(results[0].y, results[0].x);
				map.setCenter(coords);
				
				if (kakaoFixMarker == undefined){
					kakaoFixMarker = new daum.maps.Marker({
						position: coords,
						map: kakaoMap,
						//icon: "/portalm/publish_portal/images/kr/common/ico_point_blue.png", 
						//animation: daum.maps.Animation.DROP,
					});
				}else{
					kakaoFixMarker.setPosition(coords);
				}
				kakaoMap.setCenter(coords);
			} else {
				if(status == "ZERO_RESULT"){
					alert(messageNoAddressResult);// 검색된 결과가 없습니다. 
				}else{
    			  	alert("Daum Geo Code Return : " + status);
				}
			}
		});		
	} 
}


//지점 편집 화면에서 설정된 폴리곤 설정
function applyPolygon(pathArray, marker) {
    
    if(new_polygon != null){
        new_polygon.setMap(null);
        new_polygon = null;
    } 
    
    if(bermudaTriangle != null) {
        bermudaTriangle.setMap(null);
    }
    
    var x_coord;
    var y_coord;
    var geo_pos;
    
    if(googleYn) {
        x_coord = googleMarker.getPosition().lng();
        y_coord = googleMarker.getPosition().lat();
        geo_pos = new google.maps.LatLng(y_coord, x_coord);
        fastMarkers[0].setPosition(geo_pos);
    	
    } else {
    	x_coord = marker.getPosition().getLng();
        y_coord = marker.getPosition().getLat();
        geo_pos = new daum.maps.LatLng(y_coord, x_coord);
        fastMarkers[0].setPosition(geo_pos);
    }
    
    $("#saveForm input[name='siLatitude']").val(y_coord)
    $("#saveForm input[name='siLongitude']").val(x_coord)
    
    var triangleCoords = [];
    
    if(googleYn) {
        for(var i=0; i<pathArray.length; i++) {
            triangleCoords.push(new google.maps.LatLng(pathArray[i].lat(), pathArray[i].lng()));
        }
        
     // Construct the polygon.
        bermudaTriangle = new google.maps.Polygon({
            paths: triangleCoords,
            strokeColor: '#5B67D9',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#5B67D9',
            fillOpacity: 0.2,
            draggable : false,
            editable: false
        });
     
        bermudaTriangle.setMap(googleMap);
    } else {
    	for(var i=0; i<pathArray.length; i++) {
            triangleCoords.push(new daum.maps.LatLng(pathArray[i].getLat(), pathArray[i].getLng()));
        }
    	
    	// Construct the polygon.
        bermudaTriangle = new daum.maps.Polygon({
            paths: triangleCoords,
            strokeColor: '#5B67D9',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#5B67D9',
            fillOpacity: 0.2,
            draggable : false,
            editable: false
        });
    	
        bermudaTriangle.setMap(kakaoMap);
        bermudaTriangle.setPath(triangleCoords);
    }
    
    //폴리곤 오브젝트 재설정
    objAreaPolygons = new s1_DistancePaint();
    for(var i=0; i<pathArray.length; i++) {
        objAreaPolygons.put(i, bermudaTriangle, 0);
    }
    
    closeModal("popModel2");
}