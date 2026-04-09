//////////////////////////////////////////////////////////////////////////////////////////
// Map 지도처리 시작
//////////////////////////////////////////////////////////////////////////////////////////
var googleMap; // 지도 객체
var googleMarker; // 지도 객체
var mapPosition; // 지도 좌표
var fastMarkers = [];
var firstCall = true;

var geomFence = "";
var bermudaTriangle;
var objAreaPolygons = null;
var googlemarker = null;
var new_polygon;

var infowindow = new google.maps.InfoWindow({});
var resetLngTmp, resetLatTmp, resetPolygonTmp, geomFenceTmp, newGeomFenceTmp;

function callInitMap() {
	// 맵 초기 세팅
	initializeMap("map_canvas", strMapBasicXPOS, strMapBasicYPOS, "siLatitude",
			"siLongitude", strMapBasicName);
}

function mapClickAction(event) {
	// insert 상태에서 맵 선택시 selectedrow시 할당된 value값 초기화
	if (!$("#saveForm input[name='siIdx']")) {
		resetGlobalVal();
	}

	if (toggle_set) { // 이동 모드 일 경우만 선택한 좌표를 Hidden 값으로 전달
		setMarkersIconChange(0, globalSiFlag, false);
		fastMarkers[0].setPosition(event.latLng);

		globalSiLatitude = event.latLng.lat();
		;
		globalSiLongitude = event.latLng.lng();
		// 팝업 띄우기
		findAddress(event.latLng.lat(), event.latLng.lng(), googleMap,
				googleMarker);

	}
	googleMap.setCenter(event.latLng);

	// 초기 폴리곤 세팅
	if (objAreaPolygons == null) {
		if (new_polygon != null) {
			new_polygon.setMap(null);
			new_polygon = null;
		}
		var top_lng = event.latLng.lng();
		var top_lat = event.latLng.lat() - 1 + 1.000555;
		var bottom_lng = event.latLng.lng();
		var bottom_lat = event.latLng.lat() - 0.000555;
		var left_lng = event.latLng.lng() - 0.000555;
		var left_lat = event.latLng.lat();
		var right_lng = event.latLng.lng() - 1 + 1.000555;
		var right_lat = event.latLng.lat();

		var new_Coords = [ {
			lat : top_lat,
			lng : top_lng
		}, {
			lat : right_lat,
			lng : right_lng
		}, {
			lat : bottom_lat,
			lng : bottom_lng
		}, {
			lat : left_lat,
			lng : left_lng
		} ];

		newGeomFenceTmp = "POLYGON ((" + top_lng + " " + top_lat + ", "
				+ right_lng + " " + right_lat + ", " + bottom_lng + " "
				+ bottom_lat + ", " + left_lng + " " + left_lat + "))";

		new_polygon = new google.maps.Polygon({
			paths : new_Coords,
			strokeColor : '#5B67D9',
			strokeOpacity : 0.8,
			strokeWeight : 3,
			fillColor : '#5B67D9',
			fillOpacity : 0.35
		});

		new_polygon.setMap(googleMap);
	}
}

// 로딩될 때 처음 실행됨
function initializeMap(map_id, x_pos, y_pos, id_xpos, id_ypos, strTitle) {
	// infoWindow setting을 위한 위도 경도 세팅
	globalSiLatitude = x_pos;
	globalSiLongitude = y_pos;

	toggle_set = true;
	fastMarkers = [];

	mapPosition = new google.maps.LatLng(x_pos, y_pos);

	var mapOptions = {
		zoom : 17,
		maxZoom : 19,
		minZoom : 3,
		center : mapPosition,
		mapTypeId : google.maps.MapTypeId.ROADMAP,
		gestureHandling : 'greedy'
	};

	googleMap = window.map = new google.maps.Map(document
			.getElementById(map_id), mapOptions);
	googleMarker = new google.maps.Marker({
		position : mapPosition,
		map : googleMap,
		flat : true,
		icon : strMapMarkerIco,
		title : strTitle
	});
	fastMarkers.push(googleMarker);

	if (firstCall) {
		// 첫 지도 호출시 마커 제거
		setMarkersIconChange(0, 0, true);
		firstCall = false;
	}

	// click event
	google.maps.event.addListener(googleMap, 'click', function(event) {
		mapClickAction(event);
	});

	google.maps.event.addListener(googleMarker, 'click', function(event) {
		mapClickAction(event);
	});

	google.maps.event
			.addListener(
					googleMap,
					'maptypeid_changed',
					function() {
						var mapType = map.getMapTypeId();

//						if (mapType == 'roadmap') {
//							map.setOptions({
//								'minZoom' : 3
//							});
//							map.setOptions({
//								'maxZoom' : 19
//							});
//						}
//
//						if (mapType == 'hybrid') {
//							map.setOptions({
//								'minZoom' : 4
//							});
//							map.setOptions({
//								'maxZoom' : 19
//							});
//						}
					});
}

var toggle_set = false; // 초기 상태

function setZoneArea2(geom_fence) {
	var dataRows = [ {
		geom : geom_fence
	} ];
	var features = new Array();

	dataRows.forEach(function(row) {
		// alert(row.geom.substring(row.geom.indexOf("("), row.geom.length));
		// var coords = row.geom.replace("(", "[").replace(")",
		// "]").substring(row.geom.indexOf("("), row.geom.length);
		var coords = row.geom.substring(row.geom.indexOf("("), row.geom.length)
				.replace(/\(/gi, "").replace(/\)/gi, "");
		// alert(coords);
		features.push(coords);
	});

	var triangleCoords = [];

	var array = features[0].split(",");
	for (var i = 0; i < array.length; i++) {
		var xycoord = array[i].replace(/^\s+/, "").replace(/ /, ",").split(",");
		triangleCoords.push(new google.maps.LatLng(xycoord[1], xycoord[0]));
	}

	// Construct the polygon.
	bermudaTriangle2 = new google.maps.Polygon({
		paths : triangleCoords,
		strokeColor : '#5B67D9',
		strokeOpacity : 0.8,
		strokeWeight : 2,
		fillColor : '#5B67D9',
		fillOpacity : 0.2,
		draggable : false,
		editable : false
	});

	bermudaTriangle2.setMap(map);
	map.setZoom(16);

	// 폴리곤 오브젝트 재설정
	objAreaPolygons2 = new s1_DistancePaint();
	for (var i = 0; i < array.length; i++) {
		objAreaPolygons2.put(i, bermudaTriangle2, 0);
	}
}

// 지점 편집 화면에서 설정된 폴리곤 설정
function applyPolygon(pathArray, googleMarker) {

	if (new_polygon != null) {
		new_polygon.setMap(null);
		new_polygon = null;
	}

	if (bermudaTriangle != null) {
		bermudaTriangle.setMap(null);
	}

	var x_coord = googleMarker.getPosition().lng();
	var y_coord = googleMarker.getPosition().lat();
	var geo_pos = new google.maps.LatLng(y_coord, x_coord);
	fastMarkers[0].setPosition(geo_pos);

	$("#saveForm input[name='siLatitude']").val(y_coord)
	$("#saveForm input[name='siLongitude']").val(x_coord)

	var triangleCoords = [];

	for (var i = 0; i < pathArray.length; i++) {
		triangleCoords.push(new google.maps.LatLng(pathArray[i].lat(),
				pathArray[i].lng()));
	}

	// Construct the polygon.
	bermudaTriangle = new google.maps.Polygon({
		paths : triangleCoords,
		strokeColor : '#5B67D9',
		strokeOpacity : 0.8,
		strokeWeight : 2,
		fillColor : '#5B67D9',
		fillOpacity : 0.2,
		draggable : false,
		editable : false
	});

	bermudaTriangle.setMap(googleMap);

	// 폴리곤 오브젝트 재설정
	objAreaPolygons = new s1_DistancePaint();
	for (var i = 0; i < pathArray.length; i++) {
		objAreaPolygons.put(i, bermudaTriangle, 0);
	}

	closeModal("popModel2");
	return false;
}

function clearPolygon() {
	clearAreaPolygon(0);
	isAreaPolygonPaintActive = true;
	objAreaPolygons = new s1_DistancePaint();
	objDistanceMarkers = new s1_DistancePaint();
}

// 초기화 버튼 클릭시 호출
function resetPolygon() {
	clearAreaPolygon(0);
	if (!$("#saveForm input[name='siIdx']").val()) {
		setZoneArea2(newGeomFenceTmp);
	} else {
		setZoneArea2(geomFenceTmp);
	}
	updPolygon();
}

// ////////////////////////////////////////////////////////////////////////////////////////
// Map 지도처리 끝
// ////////////////////////////////////////////////////////////////////////////////////////

function pressEnter(e) {

	if (googlemarker != null) {
		googlemarker.setMap(null);
		googlemarker = null;
	}

	var geo_addr = document.getElementById("addressInput");
	// if(comIsEmpty(geo_addr.value)){
	if (!$("#addressInput").val()) {
		alert(messageAddressInput); // 검색할 주소를 입력하세요 (시/구/동)
		geo_addr.focus();
	} else {
		var geocoder = new google.maps.Geocoder();
		var address = geo_addr.value;

		geocoder.geocode({
			'address' : address
		}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				// document.getElementById("addr_desc").value =
				// results[0].formatted_address;
				googleMap.setCenter(results[0].geometry.location);

				if (googlemarker == undefined) {
					googlemarker = new google.maps.Marker({
						position : results[0].geometry.location,
						map : googleMap,
						// icon:
						// "/portalm/publish_portal/images/kr/common/ico_point_blue.png",
						animation : google.maps.Animation.DROP,
					});
				} else {
					googlemarker.setPosition(results[0].geometry.location);
				}
				googleMap.setCenter(results[0].geometry.location);
			} else {
				if (status == "ZERO_RESULTS") {
					alert(messageNoAddressResult);// 검색된 결과가 없습니다.
				} else {
					alert("Google Geo Code Return : " + status);
				}
			}
		});
	}
}

// 주변 주소 검색
function findAddress(lat, lng, map, googleMarker) {

	var geocoder = new google.maps.Geocoder();
	var emer_location = new google.maps.LatLng(lat, lng);

	geocoder.geocode({
		'location' : emer_location
	},

	function(results, status) {
		var isZeroResult = false;
		if (status == google.maps.GeocoderStatus.ZERO_RESULTS)
			isZeroResult = true;
		if (status == google.maps.GeocoderStatus.OK || isZeroResult == true) {

			infowindow.setContent(createHtmlInMap(results[0].formatted_address));
			infowindow.open(map, googleMarker);

			setTimeout(function() {
				makeClearable();
			}, 200);
		} else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
			setTimeout(function() {
				showInfo(googleMarker);
			}, 200);
		}
	});
}

function mapSetting(lat, lng, name, siFlag, geomFence) {

	// 맵 초기화
	initializeMap("map_canvas", lat, lng, "siLatitude", "siLongitude", name);

	// 마커 변경
	setMarkersIconChange(0, siFlag, false);

	// 폴리곤 세팅
	setZoneArea(geomFence);

	// 위치변경 불가
	toggle_set = false;

	// 팝업 띄우기
	findAddress(lat, lng, googleMap, googleMarker);
}

function cancelPlace() {
	// 위치변경 취소
	globalSiLatitude = resetLatTmp;
	globalSiLongitude = resetLngTmp;

	changePlace();

	var O_Place = new google.maps.LatLng(globalSiLatitude, globalSiLongitude);
	fastMarkers[0].setPosition(O_Place);
	googleMap.setCenter(O_Place);
}

