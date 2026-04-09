
var map = null;
var mc; // markercluster

var infowindow = new daum.maps.InfoWindow({
	map:map,
//	removable:true,
	zIndex:2147483647
});

var routeInfowindow = new daum.maps.InfoWindow({
	map:map,
//	removable:true,
	zIndex:2147483647
});

var cnt_carmoving = 0; // 운행중 차량 수
var cnt_carstop = 0; // 운행정지 차량 수

var distanceTotal = 0; // 총 운행거리

var targetCarList = new Array();
var fastMarkers = [];
var fastOverlays = [];
var fastMarkers_prev = [];
var PolylineArray = [];		// 전체 폴리라인 저장소

var EventsMarkers = [];		// 사고/공사 마커
var CCTVMarkers = [];		// CCTV 마커

var mapCenterPosition = new daum.maps.LatLng(37.570335, 126.978243);	// 맵 센터

var g_NearestPreviewTimer = -1;

var routeGeocoder = new daum.maps.services.Geocoder();
//var oddoverlays = [];
//var polyLinesArray = [];
var routeOverlays = [];

var interval_arrow = 12;

var lineSymbol_color = [];
lineSymbol_color[0] ="#000000";
lineSymbol_color[1] ="#FFFFFF";
lineSymbol_color[2] ="#FF0000";
lineSymbol_color[3] ="#00FF00";
lineSymbol_color[4] ="#0000FF";
lineSymbol_color[5] ="#FFFF00";
lineSymbol_color[6] ="#00FFFF";
lineSymbol_color[7] ="#FF00FF";
lineSymbol_color[8] ="#C0C0C0";
lineSymbol_color[9] ="#808080";
lineSymbol_color[10] ="#800000";
lineSymbol_color[11] ="#808000";
lineSymbol_color[12] ="#008000";
lineSymbol_color[13] ="#800080";
lineSymbol_color[14] ="#008080";
lineSymbol_color[15] ="#000080";
var rnd_value = 1;

var g1_chk_date_start = "";
var g1_chk_date_end = "";
var g1_chk_time_start = "";
var g1_chk_time_end = "";
var g1_val = "";

var g_clusterInfoTimer = -1;
var g_clusterObj = null;

var mapPathControl = new uvisMap();

Array.prototype.hasMarker=function(marker){
    for (i=0;i<this.length;i++){
       if (this[i].tidId==marker.tidId) return i;
    }
    return -1;
}

Array.prototype.hasTid=function(carList){
    for (i=0;i<this.length;i++){
       if (this[i].tidId==carList.tidId) return 1;
    }
    return -1;
}

Array.prototype.grpCount=function(grpId){
	var iGrpCount = 0;
    for (i=0;i<this.length;i++){
//    	if (this[i].grpName==grp){
    	if (this[i].grpId==grpId){
      	   iGrpCount++;
    	}
    }
    return iGrpCount;
}

Array.prototype.pGrpCount=function(grpId){
	var iGrpCount = 0;
    for (i=0;i<this.length;i++){
//    	if (this[i].grpName==grp){
    	if (this[i].pGrpId==grpId){
      	   iGrpCount++;
    	}
    }
    return iGrpCount;
}

//정보창 닫기
function closeInfoWindow() {
	infowindow.close();
	infowindow.setContent("");
	
	routeInfowindow.close();
	routeInfowindow.setContent("");
}

function distance(carPos1, carPos2) {
	var P1_latitude = carPos1.getLat();
	var P1_longitude = carPos1.getLng();
	var P2_latitude = carPos2.getLat();
	var P2_longitude = carPos2.getLng();

	if ((P1_latitude == P2_latitude) && (P1_longitude == P2_longitude)) {
		return 0;
	}

	var e10 = P1_latitude * Math.PI / 180;
	var e11 = P1_longitude * Math.PI / 180;
	var e12 = P2_latitude * Math.PI / 180;
	var e13 = P2_longitude * Math.PI / 180;

	/* 타원체 GRS80 */
	var c16 = 6356752.314140910;
	var c15 = 6378137.000000000;
	var c17 = 0.0033528107;

	var f15 = c17 + c17 * c17;
	var f16 = f15 / 2;
	var f17 = c17 * c17 / 2;
	var f18 = c17 * c17 / 8;
	var f19 = c17 * c17 / 16;

	var c18 = e13 - e11;
	var c20 = (1 - c17) * Math.tan(e10);
	var c21 = Math.atan(c20);
	var c22 = Math.sin(c21);
	var c23 = Math.cos(c21);
	var c24 = (1 - c17) * Math.tan(e12);
	var c25 = Math.atan(c24);
	var c26 = Math.sin(c25);
	var c27 = Math.cos(c25);

	var c29 = c18;
	var c31 = (c27 * Math.sin(c29) * c27 * Math.sin(c29))
			+ (c23 * c26 - c22 * c27 * Math.cos(c29))
			* (c23 * c26 - c22 * c27 * Math.cos(c29));
	var c33 = (c22 * c26) + (c23 * c27 * Math.cos(c29));
	var c35 = Math.sqrt(c31) / c33;
	var c36 = Math.atan(c35);
	var c38 = 0;
	if (c31 == 0) {
		c38 = 0;
	} else {
		c38 = c23 * c27 * Math.sin(c29) / Math.sqrt(c31);
	}

	var c40 = 0;
	if ((Math.cos(Math.asin(c38)) * Math.cos(Math.asin(c38))) == 0) {
		c40 = 0;
	} else {
		c40 = c33 - 2 * c22 * c26
				/ (Math.cos(Math.asin(c38)) * Math.cos(Math.asin(c38)));
	}

	var c41 = Math.cos(Math.asin(c38)) * Math.cos(Math.asin(c38))
			* (c15 * c15 - c16 * c16) / (c16 * c16);
	var c43 = 1 + c41 / 16384 * (4096 + c41 * (-768 + c41 * (320 - 175 * c41)));
	var c45 = c41 / 1024 * (256 + c41 * (-128 + c41 * (74 - 47 * c41)));
	var c47 = c45
			* Math.sqrt(c31)
			* (c40 + c45
					/ 4
					* (c33 * (-1 + 2 * c40 * c40) - c45 / 6 * c40
							* (-3 + 4 * c31) * (-3 + 4 * c40 * c40)));
	var c50 = c17
			/ 16
			* Math.cos(Math.asin(c38))
			* Math.cos(Math.asin(c38))
			* (4 + c17
					* (4 - 3 * Math.cos(Math.asin(c38))
							* Math.cos(Math.asin(c38))));
	var c52 = c18
			+ (1 - c50)
			* c17
			* c38
			* (Math.acos(c33) + c50 * Math.sin(Math.acos(c33))
					* (c40 + c50 * c33 * (-1 + 2 * c40 * c40)));

	var c54 = c16 * c43 * (Math.atan(c35) - c47);

	// return distance in meter
	return c54;
}

function getBearing(carPos1, carPos2){
	var P1_latitude = carPos1.getLat();
	var P1_longitude = carPos1.getLng();
	var P2_latitude = carPos2.getLat();
	var P2_longitude = carPos2.getLng();
	
	// 현재 위치 : 위도나 경도는 지구 중심을 기반으로 하는 각도이기 때문에 라디안 각도로 변환한다.
	var Cur_Lat_radian = P1_latitude * (3.141592 / 180);
	var Cur_Lon_radian = P1_longitude * (3.141592 / 180);
	
	// 목표 위치 : 위도나 경도는 지구 중심을 기반으로 하는 각도이기 때문에 라디안 각도로 변환한다.
	var Dest_Lat_radian = P2_latitude * (3.141592 / 180);
	var Dest_Lon_radian = P2_longitude * (3.141592 / 180);
	
	// radian distance
	var radian_distance = 0;
	radian_distance = Math.acos(Math.sin(Cur_Lat_radian)
			* Math.sin(Dest_Lat_radian) + Math.cos(Cur_Lat_radian)
			* Math.cos(Dest_Lat_radian)
			* Math.cos(Cur_Lon_radian - Dest_Lon_radian));
	
	// 목적지 이동 방향을 구한다.(현재 좌표에서 다음 좌표로 이동하기 위해서는 방향을 설정해야 한다. 라디안값이다.
	var radian_bearing = Math.acos((Math.sin(Dest_Lat_radian) - Math
			.sin(Cur_Lat_radian)
			* Math.cos(radian_distance))
			/ (Math.cos(Cur_Lat_radian) * Math.sin(radian_distance))); // acos의 인수로 주어지는 x는 360분법의 각도가 아닌 radian(호도)값이다.
	
	var true_bearing = 0;
	if (Math.sin(Dest_Lon_radian - Cur_Lon_radian) < 0) {
		true_bearing = radian_bearing * (180 / 3.141592);
		true_bearing = 360 - true_bearing;
	} else {
		true_bearing = radian_bearing * (180 / 3.141592);
	}
	
	return true_bearing;
}

/**
 * 차량 이미지 가져오기
 * 
 * @param biOpFlag
 * @param biTurnOnoff
 * @param bearing
 * @param carNumColor
 * @param carType
 * @param selYn
 * @returns {String}
 */
function setMarkerImage(biOpFlag, biTurnOnoff, bearing, carNumColor, carType, selYn){
	var Rmarker_carRotation = "";
	var imgOnOff = "on";
	
	if(selYn == "N"){
		if(biTurnOnoff == "OFF"){
			imgOnOff = "off";
			Rmarker_carRotation = imgOnOff + "_side";
		} else{
			imgOnOff = "on";
			
			var angle = 0;
			if (bearing != null){
				angle = bearing;
			}
			
			if (angle > 330) {
				Rmarker_carRotation = imgOnOff + "0";
			} else if (angle > 280) {
				Rmarker_carRotation = imgOnOff + "315";
			} else if (angle > 230) {
				Rmarker_carRotation = imgOnOff + "270";
			} else if (angle > 200) {
				Rmarker_carRotation = imgOnOff + "225";
			} else if (angle > 160) {
				Rmarker_carRotation = imgOnOff + "180";
			} else if (angle > 110) {
				Rmarker_carRotation = imgOnOff + "135";
			} else if (angle > 60) {
				Rmarker_carRotation = imgOnOff + "90";
			} else if (angle > 30) {
				Rmarker_carRotation = imgOnOff + "45";
			} else if (angle > 0) {
				Rmarker_carRotation = imgOnOff + "0";
			} else {
				Rmarker_carRotation = imgOnOff + "_side";
			}
		}
	} else{
		if(biTurnOnoff == "OFF"){
			imgOnOff = "off";
		}
		Rmarker_carRotation = imgOnOff + "_side_sel";
	}
	
	Rmarker_carRotation += "_"+carType;
	
	return getContextPath() + "/resources/images/realtime/new_ico/" + Rmarker_carRotation + ".png";
}

/**
 * 지점 마커 이미지
 * 
 * @param geoClass
 * @param strOn
 * @param commonYn
 * @returns {String}
 */
function setPlaceMarkerImage(geoClass, strOn, commonYn){
	var tempClass = geoClass;
	if( strOn == "on" ){
		tempClass = Number(geoClass) + 10;
	}
	
	return getContextPath()+"/resources/images/"+getLangset()+"/realtime/new_ico/" + mapPlaceIcon.get( tempClass ) + ".png";
}

function initialize(){
//	var x = 33.113712 + (39.954758-33.113712)/2;
//	var y = 124.612678 + (131.954758-124.612678)/2;

	var latlng = new daum.maps.LatLng( 33.1137120675166 + (39.954758672386 - 33.1137120675166) /2
			, 124.612678624038 + ( 131.954758672386 - 124.612678624038)/2 );

	var mapOptions = {
		center : latlng,
		level: 12
	};
		
	map = window.map = new daum.maps.Map(document.getElementById('id_map_full'), mapOptions);

	// 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
	//var mapTypeControl = new daum.maps.MapTypeControl();

	// 지도에 컨트롤을 추가해야 지도위에 표시됩니다
	// daum.maps.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOPRIGHT는 오른쪽 위를 의미합니다
	//map.addControl(mapTypeControl, daum.maps.ControlPosition.TOPLEFT);
	
	// 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
	var zoomControl = new daum.maps.ZoomControl();
	map.addControl(zoomControl, daum.maps.ControlPosition.RIGHT);
	
	// 데이터 가져오기
	getDataLoad((carlistValue != 'W' ? '1' : '2'), "all", "", "", "Y", "N");
	
	// 맵 클릭시 창닫기
	daum.maps.event.addListener(map,'click',function(mouseEvent){
		closeInfoWindow();
		return;
	});
	
	daum.maps.event.addListener(map, 'zoom_changed', function() {
		closeInfoWindow();
		if(IsZoomForCenter){
			map.setCenter(mapCenterPosition);
		}
	});
	
	daum.maps.event.addListener(map, 'dragend', function() {
		// 맵 포지션 변경
		if(IsZoomForCenter){
			mapCenterPosition = map.getCenter();
		}
	});
	
	// 맵 툴 적용
    var objDistance = new runMapTools(map, "divResult", 200, 10);
	
	// Focus 생성
     if(IsZoomForCenter){
     	setCenterFocus();
     }
     
    startTimer();
}

//지도타입 컨트롤의 지도 또는 스카이뷰 버튼을 클릭하면 호출되어 지도타입을 바꾸는 함수입니다
function setMapType(maptype) { 
  var roadmapControl = document.getElementById('btnRoadmap');
  var skyviewControl = document.getElementById('btnSkyview'); 
  if (maptype === 'roadmap') {
      map.setMapTypeId(kakao.maps.MapTypeId.ROADMAP);    
      roadmapControl.className = 'btn btn-white on maptype-control-map';
      skyviewControl.className = 'btn btn-white maptype-control-satellite';
  } else {
      map.setMapTypeId(kakao.maps.MapTypeId.HYBRID);    
      skyviewControl.className = 'btn btn-white on maptype-control-satellite';
      roadmapControl.className = 'btn btn-white maptype-control-map';
  }
}

/**
 * 시,구,동 선택 시 지도이동
 */
function locationMove(gubun, gpsCode){
	//gubun - 1:시, 2:구, 3:동
	var address = '';
	
	if(gubun == "0"){
		address = gpsCode;
	} else{
		$("[name='selectLocation']").show();
		$("[name='inputLocation']").hide();
		$("#inputAddr").val("");
		
		if(gubun == "1"){
			$("#guName").html(guName);
			$("#dongName").html(dongName);
			siCode = gpsCode;
			guCode = '';
			dongCode = '';
			getCarLocationSiGuDongList("2", gpsCode);
		} else if(gubun == "2"){
			$("#dongName").html(dongName);
			guCode = gpsCode;
			dongCode = '';
			getCarLocationSiGuDongList("3", gpsCode);
		} else if(gubun == "3"){
			dongCode = gpsCode;
		}
		
		if(siCode == ""){
			alert(msgGeoClass);
		} else{
			address = $("#si_"+siCode).text();
			$("#siName").html($("#si_"+siCode).text());
			
			if(guCode != ""){
				address += $("#gu_"+guCode).text();
				$("#guName").html($("#gu_"+guCode).text());
			}
			
			if(dongCode != ""){
				address += $("#dong_"+dongCode).text();
				$("#dongName").html($("#dong_"+dongCode).text());
			}
		}
	}
	
	var geocoder = new daum.maps.services.Geocoder();
	geocoder.addressSearch(address, function(results, status){
		if(status == daum.maps.services.Status.OK){
			var coords = new daum.maps.LatLng(results[0].y, results[0].x);
			map.setCenter(coords);
			map.setLevel(4);
		} else{
			alert(geoCodeReturn + "(" + status + ")");
		}
	});
}


//Marker Polyline 그리기 S.
function addPolyline(marker)
{
	// 이전 마커의 인덱스 찾기
	var iPrevFastMarkerIndex = fastMarkers_prev.hasMarker(marker);
	
	//#393  #FF0000
	var points = [];
	var lineSymbol = null;
	
	var linecolor = "#20CF24";

	points.push(fastMarkers_prev[iPrevFastMarkerIndex].carPos, marker.carPos);

	//속도별 polyline 컬러 
	if(marker.gpsSpeed < 30) linecolor = "#20CF24";
	if(marker.gpsSpeed >= 30 && marker.gpsSpeed < 60) linecolor = "#FFC500";
	if(marker.gpsSpeed >= 60 && marker.gpsSpeed < 100) linecolor = "#FF7200";
	if(marker.gpsSpeed > 100) linecolor = "#F70F0F";
	
	
	var polyLine = new daum.maps.Polyline({
		path : points,
		strokeColor : linecolor,
		strokeOpacity : 1.0,
		strokeWeight : 3
	});

	// new polyline 그리기
	polyLine.setMap(this.map);

	// 전페 폴리 관리 배열에 등록 (<-- polyline 소멸시 활용됨)
	PolylineArray.push(polyLine);

	delete points, polyLine, linecolor, lineSymbol, iPrevFastMarkerIndex;	
}

function CheckLatLng(lat, lng) {
	if (30 > lat || 45 < lat) {
		return false;
	}
	if (100 > lng || 160 < lng) {
		return false;
	}               
	return true;
}

//차량 마커 생성
function makeMarkersGRP(carList){
	$("#Canvas").html('');
	
	//차량명 설정 <1:차량번호, 2:차량명, 3:차량번호(운전자), 4:차량명(운전자)>
	var selCarname = $("#selCarname").val();;
	if(!selCarname) selCarname = "1";
	
	//글꼴
	var fontFamily = $("#fontFamily").val();
	var fontWeight = $("#fontWeight").val();
	
	//글자 크기 비율
	var fontSizeRate = $("#fontSize").val();
	if(!fontSizeRate) fontSizeRate = 100;
	
	//글자 크기
	var fontSize = 16;
	if(Number(fontSizeRate) >= 0) {
		fontSize = Number(fontSizeRate) / 100 * fontSize;
	}
	
	//아이콘 크기 비율
	var iconSize = $("#iconSize").val();
	if(!iconSize) iconSize = 100;
	
	var duplicateMarkerCheck = new Array();
	for(var i=0; i<carList.length; i++){
		
		if(duplicateMarkerCheck.hasTid(carList[i]) < 0){
			
			if( !CheckLatLng(carList[i].biXPosition, carList[i].biYPosition) ) {
				continue;
			}
			
			duplicateMarkerCheck.push(carList[i]);
			
			var tmpCarPos = new daum.maps.LatLng(carList[i].biXPosition, carList[i].biYPosition);
			var tmpCmNumber = carList[i].cmNumber
			var tmpBiOpFlag = carList[i].biOpFlag;
			var tmpBiTurnOnoff = carList[i].biTurnOnoff;
			var tmpCarNumColor = carList[i].cmColor;
			var tmpCarType = carList[i].carType;
			
			//차량명 표시
			var carTitle = "";
			if(carList[i].cmCarname && (selCarname == "2" || selCarname == "4")) {
				carTitle = carList[i].cmCarname;
			}
			//차량번호 표시
			else if(carList[i].cmNumber) {
				carTitle = carList[i].cmNumber;
			}
			//차량미등록
			else {
				carTitle = noCar + '(' + carList[i].tidId + ')';
			}
			
			var marker = new daum.maps.Marker({
				map : map,
				position : tmpCarPos,
				title : carTitle,
				zIndex : 200 + i
			});
			
			marker.tmpCarNumName = carTitle;
			marker.fontFamily = fontFamily;
			marker.fontWeight = fontWeight;
			marker.fontSize = fontSize;
			marker.iconSize = iconSize;
			
			//delete tmpCarPos, tmpCmNumber, tmpBiOpFlag, tmpBiTurnOnoff;
			
			marker.index = i;
			
	 		marker.pGrpId = carList[i].pGrpId;
			marker.pGrpName = carList[i].pGrpName;
	 		marker.grpId = carList[i].grpId;
			marker.grpName = carList[i].grpName;
//			marker.grouplistName = carList[i].grouplistName;
//			marker.grouplistName = groupNameList.get(carList[i].tidId);
			marker.carPos = new daum.maps.LatLng(carList[i].biXPosition, carList[i].biYPosition);
			marker.tidId = carList[i].tidId;
			marker.offKey = carList[i].offKey;
			marker.offName = carList[i].offName;
			marker.cmKey = carList[i].cmKey;
			marker.cmNumber = carList[i].cmNumber;
			marker.carName = carList[i].cmCarname;
			marker.biOpFlag = carList[i].biOpFlag;
			marker.biTurnOnoff = carList[i].biTurnOnoff;
			marker.wrCode = carList[i].wrCode;
			marker.etGrade = carList[i].etGrade;
			
			marker.driName = carList[i].driName;
			marker.driCel = carList[i].driCel;
			marker.volt = carList[i].biVolt;
			marker.gpsState = carList[i].biGpsState;
			marker.tempA = carList[i].tempDegreeA;
			marker.tempAMin = carList[i].tempMinA;
			marker.tempAMax = carList[i].tempMaxA;
			marker.tempB = carList[i].tempDegreeB;
			marker.tempBMin = carList[i].tempMinB;
			marker.tempBMax = carList[i].tempMaxB;
			
			marker.gpsSpeed = carList[i].biGpsSpeed;
			marker.biGpsSpeed = carList[i].biGpsSpeed;
			marker.avgSpeed = carList[i].avgSpeed;
			marker.driveMin = carList[i].driveMin;
			marker.dayDist = carList[i].dayDistnce;
			marker.dayDistnce = carList[i].dayDistnce;
			marker.totDist = carList[i].totalDistnce;
			marker.totalDistnce = carList[i].totalDistnce;
			marker.rentDt = carList[i].rentDt;
			marker.returnDt = carList[i].returnDt;
			
			marker.contNo = carList[i].contNo;
			
			marker.carType = carList[i].carType;
			marker.cmColor = carList[i].cmColor;
			
			marker.biDate = carList[i].biDate;
			marker.biTime = carList[i].biTime;
			marker.deviceType = carList[i].deviceType;
			
			marker.returnTimeHh = carList[i].returnTimeHh;
			marker.returnTimeMi = carList[i].returnTimeMi;
			
			marker.isUseSmartappkey = carList[i].isUseSmartappkey;
			
			marker.elec1Level = carList[i].elec1Level;
			marker.elec1Volt = carList[i].elec1Volt;
			marker.elec1Current = carList[i].elec1Current;
			
			var markerStyle = null;
			
			if(fastMarkers_prev.length > 0){
				var iPrevFastMarkerIndex = fastMarkers_prev.hasMarker(marker);
				if(iPrevFastMarkerIndex > -1 && distance(fastMarkers_prev[iPrevFastMarkerIndex].carPos, marker.carPos) > 0){//이전 좌표가 있고 거리가 차이나는 경우
					//마커 이미지 적용
					markerStyle = setMarkerImage(tmpBiOpFlag, tmpBiTurnOnoff, getBearing(fastMarkers_prev[iPrevFastMarkerIndex].carPos, marker.carPos), marker.cmColor, marker.carType, "N");
					setMarkerImageDaum(marker, markerStyle);
					
					// 이전 좌표 대비 방위각 셋팅
					marker.bearing = getBearing(fastMarkers_prev[iPrevFastMarkerIndex].carPos, marker.carPos);
					
					// Marker Polyline 그리기 S.
					if (IsRouteMonitoring) {
						addPolyline(marker);
					}
					// Marker Polyline 그리기 E.
					
					// 마커 뮤빙 에니메이션 (map_gmap_Marker_Animation.js)
					if(IsMarkerAnimation && marker.biTurnOnoff == "ON" ){
						marker.setPosition(fastMarkers_prev[iPrevFastMarkerIndex].carPos);
						runMarker(marker, marker.carPos, fastMarkers_prev[iPrevFastMarkerIndex].carPos, marker.tidId,  30);
					}
				}
				else {
					// 현재 좌표가 없거나 이전 좌표와 같은 위치인경우
					if(iPrevFastMarkerIndex > -1 && fastMarkers_prev[iPrevFastMarkerIndex].bearing > 0){ 
						markerStyle = setMarkerImage(tmpBiOpFlag, tmpBiTurnOnoff, fastMarkers_prev[iPrevFastMarkerIndex].bearing, marker.cmColor, marker.carType, "N");
						
						// 이전 좌표와 거리가 같은 경우 방위각 유지위해 설정
						marker.bearing = fastMarkers_prev[iPrevFastMarkerIndex].bearing;
					}
					else {
						markerStyle = setMarkerImage(tmpBiOpFlag, tmpBiTurnOnoff, 0, tmpCarNumColor, tmpCarType, "N");
					}
					
					//마커 이미지 적용
					setMarkerImageDaum(marker, markerStyle);
				}
				delete iPrevFastMarkerIndex;
			}
			else {
				//마커 이미지 적용
				markerStyle = setMarkerImage(tmpBiOpFlag, tmpBiTurnOnoff, 0, tmpCarNumColor, tmpCarType, "N");
				setMarkerImageDaum(marker, markerStyle);				
			}
			
			fastMarkers.push(marker);
			//fastOverlays.push(customOverlay);
			
			daum.maps.event.addListener(marker, 'mouseover', (function(marker){
				return function(){
					//차량정보창이 열려있지 않은 경우
					if( !infowindow.getContent() ) {
						//인접차량 검사
						var markers = checkNearestCar(marker);
						if(markers && markers.length >= 2) {
							var mapProjection = map.getProjection();
							var anchor = mapProjection.pointFromCoords(marker.getPosition());
							var pos = mapProjection.coordsFromPoint(new daum.maps.Point(anchor.x, (anchor.y-30))) ;
							
							//클러스터 정보창
							showClusterInfowindow(markers, pos);
						}
					}
				}
			})(marker));
			
			daum.maps.event.addListener(marker, 'mouseout', (function(marker){
				return function(){
					
				}
			})(marker));
			
			daum.maps.event.addListener(marker, 'click', (function(marker){
				return function(){
					//carDetailView(marker.tidId);
					//showInfoRCDetail(marker.tidId);
					//calendarRefresh();
					
                    // 바로가기 처리
                    resetMapMenus();
                    clearRoute(); onInitialNearestCar();
                    if(marker.pGrpId != "00000000000000" && marker.grpId != "00000000000000"){
                        showSelectVehicleGRP(marker.tidId);
                    }
                    
					//차량 상세정보창
					showInfo(marker);
					//onclick_showInfo(marker);
					
					// 맵 포지션 변경
					if(IsZoomForCenter){
						mapCenterPosition = marker.carPos;
						map.setCenter(mapCenterPosition);
					}
				}
			})(marker));
			
		}
	}
	duplicateMarkerCheck = [];
	delete duplicateMarkerCheck;
}

/*
function onclick_showInfo(tidId){
	var marker = null;
	
	for ( var i = 0; i < fastMarkers.length; i++) {
		if( fastMarkers[i].tidId == tidId ){
			marker = fastMarkers[i];
			break;
		}
	}
	
	if(marker && marker.tidId == tidId){
		//carDetailView(marker.tidId);
		//showInfoRCDetail(marker.tidId);
		//calendarRefresh();
		showInfo(marker);
		
		// 맵 포지션 변경
		if(IsZoomForCenter){
			mapCenterPosition = marker.carPos;
			map.setCenter(mapCenterPosition);
		}
	}
}
*/

/**
 * 지우기
 */
function clearOverlays(){
	for(var i=0; i<fastMarkers.length; i++){
		if(fastMarkers_prev.length > 0){
			var iPrevFastMarkers = fastMarkers_prev.hasMarker(fastMarkers[i]);
			if(iPrevFastMarkers > -1){
				fastMarkers_prev[iPrevFastMarkers] = fastMarkers[i];
			} else{
				fastMarkers_prev.push(fastMarkers[i]); // 이전 좌표를 저장 ( 이전좌표가 없을 경우 )
			}
			delete iPrevFastMarkers;
		} else{
			fastMarkers_prev.push(fastMarkers[i]); // 이전 좌표없을경우( 이전좌표가 없을 경우 )
		}
		fastMarkers[i].setMap(null);
	}
	fastMarkers = [];
	delete fastMarkers;
	
	for(var i=0; i<fastOverlays.length; i++){
		fastOverlays[i].setMap(null);
	}
	fastOverlays = [];
	delete fastOverlays;
	
	if(mc != null){
		mc.clearMarkers();
	}
}

//인접차량 검사
function checkNearestCar(marker) {
	if(!marker) return null;
	
	//인접차량 목록
	var markers = [];
	markers.push( marker );
	
	//마커 위치
	var src_lat = marker.getPosition().getLat();
	var src_lon = marker.getPosition().getLng();
	
	//마커 목록
	var nCnt = fastMarkers.length;
	for(var i = 0; nCnt > i; i++) {
		if( fastMarkers[i].tidId != marker.tidId ) {
			//다른 마커 위치
			var tgt_lat = fastMarkers[i].getPosition().getLat();
			var tgt_lon = fastMarkers[i].getPosition().getLng();
			
			//거리 50m 이내
			var dist = getDistance( src_lat, src_lon, tgt_lat, tgt_lon );
			if( Number(dist) <= 50 ) {
				markers.push( fastMarkers[i] );
			}
		}
	}
	
	return markers;
}

//클러스터링
function makeClusters(){
	var clusterOptions = {
		gridSize: 40,
		zoomOnClick: true,
		maxZoom: 8,
		clusterClass: 'no-drag'
	};
	
	mc = new MarkerClusterer(map, fastMarkers, fastOverlays, clusterOptions);
	mc.setMap(map);
	delete clusterOptions;
	
	//클릭
	$(mc).on('clusterclick', function(event, cluster) {
		
	});
	
	//더블클릭
	$(mc).on('clusterdblclick', function(event, cluster) {
		// Get markers
		var markers = cluster.getMarkers();
		
		map.setCenter(cluster.getCenter());
		
		// Marker Bounds 처리
		setMapBounds(markers);
		
		delete bounds, markers;
	}); 
	
	//마우스 오버
	$(mc).on('mouseover', function(event, cluster) {
		if(g_clusterInfoTimer > -1){
			clearTimeout(g_clusterInfoTimer);
			g_clusterInfoTimer = -1;
		}
		
		g_clusterObj = cluster;
		
		var mapProjection = map.getProjection();
		var anchor = mapProjection.pointFromCoords(g_clusterObj.getCenter());
		var pos = mapProjection.coordsFromPoint(new daum.maps.Point(anchor.x, (anchor.y-13))) ;
		
		// Get markers
		var markers = g_clusterObj.getMarkers();
		
		//클러스터 정보창
		showClusterInfowindow(markers, pos);
		
		delete markers;
		
	});
	
}

//클러스터 정보창
function showClusterInfowindow(markers, pos) {
	//기존 창 닫기
	closeInfoWindow();
	
	if(markers && markers.length >= 1) {
		//차량명 설정 <1:차량번호, 2:차량명, 3:차량번호(운전자), 4:차량명(운전자)>
		var selCarname = $("#selCarname").val();
		if(!selCarname) selCarname = "1";
		var showCarname = (selCarname == "2" || selCarname == "4");	//차량명으로 표시 여부
		
		//정렬
		markers.sort(function(af, bf) {
			var bfName = showCarname && bf.carName ? bf.carName : bf.cmNumber;	//해당 차량명
			var afName = showCarname && af.carName ? af.carName : af.cmNumber;	//비교 차량명
			
			//차량미등록시 단말기번호로 정렬
			if( !bfName && !afName ) {
				return bf.tidId > af.tidId ? -1 : 1;
			}
			//차량미등록시 뒤로
			else if( !bfName ) {
				return -1;
			}
			//차량미등록시 뒤로
			else if( !afName ) {
				return 1;
			}
			
			//비교 정렬
			return bfName > afName ? -1 : 1;
		});
		
		var clusterHtml = "";
		//clusterHtml += '<div class="pop-inner-map pop-map-group-list" style="z-index:0; width:300px; -ms-user-select:none; -moz-user-select:-moz-none; -webkit-user-select: none; -khtml-user-select: none; user-select:none;">';
		clusterHtml += '<div class="pop-inner-map pop-map-group-list" style="z-index:0; width:300px;">';
		clusterHtml += '	<div class="modal-header">';
		clusterHtml += '		<button class="close" data-dismiss="modal" type="button" aria-label="Close" onclick="closeInfoWindow();" style="top:-10px; right:-5px;"></button>';
		clusterHtml += '	</div>';
		clusterHtml += '	<div class="member-list">';
		clusterHtml += '		<ul>';
		
		// Get all the clusterHtml
		for(var i=0; i<markers.length; i++) {
			clusterHtml += '			<li style="text-overflow: ellipsis; -o-text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">';
			
			if(markers[i].biTurnOnoff == "OFF"){
				clusterHtml += '<span class="flag">OFF</span>';
			} else{
				clusterHtml += '<span class="flag on">ON</span>';
			}
			
			clusterHtml += '<a href="javascript:void(0);" onfocus="this.blur()" onclick="showSelectVehicleCluster(\''+markers[i].tidId+'\',\''+markers[i].cmKey+'\')"';
			if(markers[i].cmKey == undefined || markers[i].cmKey == "") {
				clusterHtml += '<span title="' + noCar + '(' + markers[i].tidId + ')">'+'(' + markers[i].tidId + ')</span>';
			}
			else if(showCarname && markers[i].carName) {
				clusterHtml += '<span title="' + markers[i].carName + '">' + markers[i].carName + '</span>';
			}
			else {
				clusterHtml += '<span title="' + markers[i].cmNumber + '">' + markers[i].cmNumber + '</span>';
			}
			clusterHtml += '</a>'
			clusterHtml += '			</li>';
		}

		clusterHtml += '		</ul>';
		clusterHtml += '	</div>';
		clusterHtml += '</div>';
		
		infowindow.setContent(clusterHtml);
		infowindow.setPosition(pos);
		infowindow.open(map);
	}
	else {
		var clusterHtml = "<div></div>";
		infowindow.setContent(clusterHtml);
	}
}

function setMapBounds(markers){
	
	var bounds = new daum.maps.LatLngBounds();
	
	// fastMarkers 차량
	for ( var i = 0; i < markers.length; i++) {
		bounds.extend(markers[i].carPos);
	}
	
	map.setBounds(bounds);
	
	map.setBounds(bounds);
	
	if(IsZoomForCenter){
		mapCenterPosition = map.getCenter();
	}
	
	delete bounds;
}

/**
 * 클러스터 인포창에서 클릭 이벤트
 * 
 * @param tidId
 * @param cmKey
 */
function showSelectVehicleCluster(tidId, cmKey){
	closeInfoWindow();
	
    var org_cmKey = (null == cmKey || undefined == cmKey || "null" ==  cmKey) ? "" : cmKey;
    
	for(var i=0; i<fastMarkers.length; i++){

        var chk_cmKey = (null == fastMarkers[i].cmKey || undefined == fastMarkers[i].cmKey || "null" ==  fastMarkers[i].cmKey) ? "" : fastMarkers[i].cmKey;

        //해당 차량
		//if(tidId == fastMarkers[i].tidId && cmKey == fastMarkers[i].cmKey){
        if(tidId == fastMarkers[i].tidId && org_cmKey == chk_cmKey){
			
            // 바로가기 처리
            resetMapMenus();
            clearRoute(); onInitialNearestCar();
            if(fastMarkers[i].pGrpId != "00000000000000" && fastMarkers[i].grpId != "00000000000000"){
                showSelectVehicleGRP(tidId);
            }
            
            //지도 확대
			//map.setCenter(fastMarkers[i].carPos);
			//if(map.getLevel() > 7) map.setLevel(7);
			
			//차량상세정보 창
			showInfo(fastMarkers[i]);
			
            if(IsZoomForCenter){
                mapCenterPosition = fastMarkers[i].carPos;
            }
	         
			break;
		}
	}
}

//마커 강조
function focusMarker(marker) {
	var tidId = marker.tidId;
	var cmKey = marker.cmKey;
	
	for(var i=0; i<fastMarkers.length; i++){
		//해당 차량
		if(tidId == fastMarkers[i].tidId && cmKey == fastMarkers[i].cmKey){
			//아이콘 강조
			setMarkerImageDaum(fastMarkers[i], setMarkerImage(fastMarkers[i].biOpFlag, fastMarkers[i].biTurnOnoff, 0, fastMarkers[i].cmColor, fastMarkers[i].carType, "Y"));
			
			//아이콘 순서 맨위로
			fastMarkers[i].setZIndex(1000000 + 1);
		}
		else {
			//아이콘 순서 아래로
			fastMarkers[i].setZIndex(50);
			
			//아이콘 강조 해제
			if (fastMarkers_prev.length > 0 &&  fastMarkers_prev.length < i ){
				setMarkerImageDaum(fastMarkers[i], setMarkerImage(fastMarkers[i].biOpFlag, getBearing(fastMarkers_prev[i].carPos, fastMarkers[i].carPos), fastMarkers[i].cmColor, fastMarkers[i].carType, "N"));
			} else{
				setMarkerImageDaum(fastMarkers[i], setMarkerImage(fastMarkers[i].biOpFlag, fastMarkers[i].biTurnOnoff, 0, fastMarkers[i].cmColor, fastMarkers[i].carType, "N"));
			}
		}
	}
}

/* 다음 마커 이미지 전용 */
function setMarkerImageDaum(marker, src) {
	//처음에는 기본마커가 나오기 때문에 아예 마커를 표시하지 않는다.
	
	//marker.setImage(new daum.maps.MarkerImage('', new daum.maps.Size(0, 0)));
	//console.log('setMarkerImageDaum : ' + marker.tidId)
	
	if(!marker.fontFamily){
		marker.fontFamily = "sans-serif";
	}
	if(!marker.fontWeight){
		marker.fontWeight = "normal";
	}
	if(!marker.fontSize){
		marker.fontSize = 16;
	}
	if(!marker.iconSize){
		marker.iconSize = 100;
	}

	var img = new Image();
	img.src = src;
	
	img.onload = function() {
		var icon_width = img.width * 0.01 * marker.iconSize;
		var icon_height = img.height * 0.01 * marker.iconSize;
		
		if(marker.tmpCarNumName == undefined){
	        var markerImage = new daum.maps.MarkerImage(src, new daum.maps.Size(icon_width, icon_height), new daum.maps.Point(icon_width / 2, icon_height / 2));
	        marker.setImage(markerImage);
	        delete markerImage;
	        //console.log('setMarkerImageDaum onLoad: ' + marker.tidId)
		}
		else{
			//텍스트박스 가로크기
			var htmls = "";
			htmls = "<span id='text_"+marker.tidId+"' style='font-family:"+marker.fontFamily+",sans-serif; font-weight:"+marker.fontWeight+"; font-size:"+marker.fontSize+"px; line-height:"+marker.fontSize+"px;' class='markerLabelKKCar'>"+marker.tmpCarNumName+"</span>";
			$("#Canvas").html(htmls);
			var textWidth = document.getElementById("text_"+marker.tidId).offsetWidth;
			//console.log("textWidth : " + textWidth);
			
			//이미지 가로크기
			var imgWidth =  icon_width >= textWidth ?icon_width: textWidth;
			//console.log("imgWidth : " + imgWidth);
			
			//아이콘 + 텍스트 캔버스
			//htmls = '<canvas id="canvas_'+marker.tidId+'"  width="'+(imgWidth+6)+'" height="'+(img.height*0.01*marker.iconSize+20+2)+'"></canvas>';
			htmls = '<canvas id="canvas_'+marker.tidId+'"  width="'+(imgWidth+6)+'" height="'+ (icon_height + marker.fontSize + 3) +'"></canvas>';
			$("#Canvas").html(htmls);
			
			var canvas = document.getElementById('canvas_'+marker.tidId);
		    var context = canvas.getContext('2d');
	    
			context.drawImage(img, (imgWidth+6)/2-(icon_width/2), 0, icon_width, icon_height);
			
			context.fillStyle="black";
			context.globalAlpha = 0.35;
			context.shadowColor = "black";
			context.shadowOffsetX = 1;
			context.shadowOffsetY = 1;
			context.shadowBlur = 3;
			context.fillRect(0, icon_height, textWidth + 5, icon_height + marker.fontSize + 20);
			
			context.fillStyle="white";
			context.globalAlpha = 1;
			context.shadowColor = "";
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;
			context.shadowBlur = 0;
			//context.font='bold 16px sans-serif';
			//context.font='normal '+fontSize+'px "돋움",Dotum,"굴림",Gulim,Arial,AppleGothic,sans-serif';
			context.font = marker.fontWeight + " " + marker.fontSize + "px " + marker.fontFamily + ",sans-serif";
			context.fillText(marker.tmpCarNumName, 5, icon_height + marker.fontSize);
			
			var c_img = new Image();
			c_img.src = canvas.toDataURL();
			c_img.onload = function(){
				var coords = ""+String(c_img.width/2) + ",2," +
								String(c_img.width/2+img.width/2-14) + ",3," +
								String(c_img.width/2+img.width/2-6) + ",7," +
								String(c_img.width/2+img.width/2-3) + ",14," +
								String(c_img.width/2+img.width/2) + ",20," +
								String(c_img.width/2+img.width/2-3) + ",26," +
								String(c_img.width/2+img.width/2-6) + ",31," +
								String(c_img.width/2+img.width/2-14) + ",36," +
								String(c_img.width/2) + ","+String(c_img.height-20)+"," +
								String(c_img.width) + ","+String(c_img.height-20)+"," +
								String(c_img.width) + ","+String(c_img.height)+"," +
								"0,"+String(c_img.height)+"," +
								"0,"+String(c_img.height-20)+"," +
								String(c_img.width/2) + ","+String(c_img.height-20)+"," +
								String(c_img.width/2-img.width/2+14) + ",36," +
								String(c_img.width/2-img.width/2+6)+ ",31," +
								String(c_img.width/2-img.width/2+3)+ ",26," +
								String(c_img.width/2-img.width/2)+ ",20," +
								String(c_img.width/2-img.width/2+3)+ ",14," +
								String(c_img.width/2-img.width/2+6)+ ",7," +
								String(c_img.width/2-img.width/2+14) + ",3";
								
				var markerImage = new daum.maps.MarkerImage(canvas.toDataURL(), new daum.maps.Size(c_img.width, c_img.height),
						{
							offset : new daum.maps.Point(c_img.width/2, img.height/2),
							shape: "poly",
							coords: coords				
						});
					
				marker.setImage(markerImage);
				delete markerImage, coords;
			}
			
			delete c_img, canvas, context,htmls;
		}
		/*context.clearRect(0, 0, canvas.width, canvas.height);
		context.beginPath();*/
		
		$("#Canvas").html('');
	};
//console.log('setMarkerImageDaum END: ' + marker.tidId)
	delete img;
}

/**
 * 차량 상세 위치보기
 * @param tidId
 */
function showSelectVehicleGRP(tidId){
	var marker = null;
	
	for ( var i = 0; i < fastMarkers.length; i++) {
		if( fastMarkers[i].tidId == tidId ){
			marker = fastMarkers[i];
			break;
		}
	}
	
	if(marker && marker.tidId == tidId){
		mapCenterPosition = marker.carPos;
		map.setCenter(marker.carPos);
		if(map.getLevel() > 7) map.setLevel(7);
		map.setCenter(marker.carPos);
		
		
	    setTimeout(function() {
              //마커 강조
	        focusMarker(marker);
	    }, 1);
	    //차량 상세정보창
        //showInfo(marker);
	    
	}
}

/**
 * 차량상세정보 infowindow
 * 
 * @param marker
 */



function showInfoWindow(carinfo, marker, sensorSpeedYn){
	var biTurnOnoff = carinfo.biTurnOnoff;
	var cmNumber = carinfo.cmNumber;
	var cmCarname = carinfo.carName;
	var tidId = carinfo.tidId;
	var gpsState = carinfo.biGpsState;
	var address = carinfo.address;
	var volt = carinfo.biVolt;
	
	var tempA = carinfo.tempDegreeA;
	var tempAMin = carinfo.tempMinA;
	var tempAMax = carinfo.tempMaxA;
	var tempB = carinfo.tempDegreeB;
	var tempBMin = carinfo.tempMinB;
	var tempBMax = carinfo.tempMaxB;
	var pGrpId = carinfo.pGrpId;
	var pGrpName = carinfo.pGrpName;
	var grpid = carinfo.grpId;
	var grpName = carinfo.grpName;
	var grouplistName = carinfo.grouplistName;
	var gpsSpeed = carinfo.biGpsSpeed;
	var sensorSpeed = carinfo.biSensorSpeed;
	
	var driName = carinfo.driName;
	var avgSpeed = carinfo.avgSpeed;
	var driCel = carinfo.driCel;
	var driveMin = carinfo.driveMin;
	var contNo = carinfo.contNo;
	var dayDist = carinfo.dayDistnce;
	var rentDt = carinfo.rentDt;
	var returnDt = carinfo.returnDt;
    var posSt = carinfo.posSt;
    var posEd = carinfo.posEd;	
	var totDist = carinfo.totalDistnce;
	var lastTurnOn = carinfo.lastTurnOn;
	var lastTurnOff = carinfo.lastTurnOff;
	var mainSwitchOn = carinfo.mainSwitchOn;
	var mainSwitchOff = carinfo.mainSwitchOff;
	var deviceType = carinfo.deviceType;
	var isUseSmartappkey = carinfo.isUseSmartappkey;
	
	var elec1Level = carinfo.elec1Level;
	var elec1Volt = carinfo.elec1Volt;
	var elec1Current = carinfo.elec1Current;
	
	
	var rentPeriod = "";
	if(rentDt != "" || returnDt != ""){
		rentPeriod = rentDt + " ~ " + returnDt;
	}
	
	var rentStEd ="";
	if(posSt != "" || posEd != ""){
		rentStEd = posSt + " / " + posEd;
	}	
	
	if(cmNumber == undefined || cmNumber == ""){
		cmCarname = noCar + "[" + tidId + "]";
	} else if(cmCarname == undefined || cmCarname == ""){
		cmCarname = cmNumber;
	}
	
	if(driName == undefined || driName == ""){
		driName = noDriver;
	}
	
	if(driCel == undefined || driCel == ""){
		driCel = noPhone;
	}
	
	if(totDist == undefined || totDist == ""){
		totDist = "0";
	}
	if(totDist != "0"){
		totDist = $.setCommaNumber(totDist);
	}
	
	var geocoder = new daum.maps.services.Geocoder();
	var coord = new daum.maps.LatLng(carinfo.biXPosition, carinfo.biYPosition);
	
	var htmls = "";
	
	//htmls += '<div class="pop-inner-map pop-map-car-detail" style="-ms-user-select: none; -moz-user-select: -moz-none; -webkit-user-select: none; -khtml-user-select: none; user-select:none;">';
	htmls += '<div class="pop-inner-map pop-map-car-detail">';
	htmls += '	<div class="modal-header">';
	htmls += '		<div class="car-info">';
	htmls += '			<div class="car-name">';
	if(biTurnOnoff == "OFF"){
		htmls += '				<span class="flag">OFF</span>';
	} else{
		htmls += '				<span class="flag on">ON</span>';
	}
	if(cmCarname != ""){
		htmls += '				<span>' + cmCarname + '</span>';
	}
	htmls += '			</div>';
	
	htmls += '			<div class="gps-address">';
	htmls += '				<div class="icon-gps">';
	htmls += '				<i class="gps-bar-1';
	if(Number(gpsState) > 2){
		htmls += ' on';
	}
	htmls += '"></i>';
	htmls += '				<i class="gps-bar-2';
	if(Number(gpsState) > 5){
		htmls += ' on';
	}
	htmls += '"></i>';
	htmls += '				<i class="gps-bar-3';
	if(Number(gpsState) > 7){
		htmls += ' on';
	}
	htmls += '"></i>';
	htmls += '				</div>';
	
	htmls += '				<span id="txtAddr"></span>';
	htmls += '				<dl>';
	 /*electric_yn*/ 
	if(electricYn == "Y"){
		htmls += '					<dt>' + infoElec2Volt + '</dt>';
	}else{
		htmls += '					<dt>' + infoBattery + '</dt>';	
	}
	htmls += '					<dd>' + ((volt=='-')?('-'):(volt + 'v'))+ '</dd>';
	htmls += '				</dl>';
	if(temperatureFlag == "Y"){
		htmls += '				<dl>';
		htmls += '					<dt>' + infoTempArea + '</dt>';
		htmls += '					<dd>' + tempA + '℃, ' + tempB + '℃</dd>';
		htmls += '				</dl>';
	}
	htmls += '			</div>';
	htmls += '		</div>';
	htmls += '		<button class="close" data-dismiss="modal" type="button" aria-label="Close" onclick="closeInfoWindow();" style="top:-10px; right:-5px;"></button>';
	htmls += '	</div>';
	htmls += '	<div class="data-form-table">';
	htmls += '		<div class="data-form-table-body v-middle">';
	htmls += '			<table>';
	htmls += '				<colgroup>';
	htmls += '					<col style="width:85px;">';
	htmls += '					<col style="width:auto;">';
	htmls += '					<col style="width:85px;">';
	htmls += '					<col style="width:auto;">';
	htmls += '				</colgroup>';
	htmls += '				<tbody>';
	htmls += '					<tr>';
	htmls += '						<th><span>' + infoGrpName + '</span></th>';
	htmls += '						<td><span>' + grouplistName + '</span></td>';
	//htmls += '						<th><span>' + infoGpsSpeed + '</span></th>';
	//htmls += '						<td><span>' + gpsSpeed + '㎞/h</span></td>';
	
	if(sensorSpeed !== "" && $.isNumeric(sensorSpeed) && sensorSpeedYn == "Y"){
		htmls += '						<th><span>'+ infoGpsSpeed +'<br/>(' + txtMessage48 + ')</span></th>'; /* 현재속도 <br /> (제한속도)*/
		htmls += '						<td><span style="padding-right:10px">' + gpsSpeed + '㎞/h</span><br/><span>(' + sensorSpeed + '㎞/h)</span></td>';
	}else{
		htmls += '						<th><span>' + infoGpsSpeed + '</span></th>';
		htmls += '						<td><span>' + gpsSpeed + '㎞/h</span></td>';
	}
	
	htmls += '					</tr>';
	htmls += '					<tr>';
	htmls += '						<th><span>' + infoDriName + '</span></th>';
	htmls += '						<td><span>' + driName + '</span></td>';
	htmls += '						<th><span>' + infoAvgSpeed + '</span></th>';
	htmls += '						<td><span>' + avgSpeed + '㎞/h</span></td>';
	htmls += '					</tr>';
	htmls += '					<tr>';
	htmls += '						<th><span>' + infoDriCel + '</span></th>';
	htmls += '						<td><span><a class="font-blue" href="javascript:void(0);">' + driCel + '</a></span></td>';
	htmls += '						<th><span>' + infoDriveMin + '</span></th>';
	htmls += '						<td><span>' + driveMin + '분</span></td>';
	htmls += '					</tr>';
	htmls += '					<tr>';
	htmls += '						<th><span>' + infoContNo + '</span></th>';
	htmls += '						<td><span>' + contNo + '</span></td>';
	htmls += '						<th><span>' + infoDayDist + '</span></th>';
	htmls += '						<td><span>' + dayDist + '㎞</span></td>';
	htmls += '					</tr>';
	
	if(rfFlag == "Y"){
		htmls += '					<tr>';
		htmls += '						<th><span>' + infoTidId + '</span></th>';
		htmls += '						<td><span>' + tidId + '</span></td>';
		htmls += '						<th><span>' + infoTotDist + '</span></th>';
		htmls += '						<td><span>' + totDist + '㎞</span></td>';
		htmls += '					</tr>';
		htmls += '					<tr>';
		htmls += '						<th><span>' + infoPeriod + '</span></th>';
		htmls += '						<td><span>' + rentPeriod + '</span></td>';
		htmls += '						<th><span>' + infoSubscribed + '</span></th>';
		htmls += '						<td><span>' + rentStEd + '</span></td>';
		htmls += '					</tr>';

	} else{
		 /*electric_yn*/
		if(electricYn == "Y"){
			
			htmls += '					<tr>';
			htmls += '						<th><span>' + infoTidId + '</span></th>';
			htmls += '						<td><span>' + tidId + '</span></td>';
			htmls += '						<th><span>' + infoTotDist + '</span></th>';
			htmls += '						<td><span>' + totDist + '㎞</span></td>';
			htmls += '					</tr>';
			htmls += '					<tr>';
			htmls += '						<th><span>' + infoElec1Level + '</span></th>';
			htmls += '						<td colspan="3"><span>' + ((elec1Level=='')?('-'):(elec1Level + '%'))+'</span></td>';
			htmls += '					</tr>';
			htmls += '					<tr>';
			htmls += '						<th><span>' + infoElec1Volt + '</span></th>';
			htmls += '						<td><span>' + ((elec1Volt=='')?('-'):(elec1Volt + 'V'))+'</span></td>';
			htmls += '						<th><span>' + infoElec1Current + '</span></th>';
			htmls += '						<td><span>' + ((elec1Current=='')?('-'):(elec1Current + 'A'))+'</span></td>';
			htmls += '					</tr>';
			
			
		}else{
			htmls += '					<tr>';
			htmls += '						<th><span>' + infoTidId + '</span></th>';
			htmls += '						<td><span>' + tidId + '</span></td>';
			htmls += '						<th><span>' + infoTotDist + '</span></th>';
			htmls += '						<td><span>' + totDist + '㎞</span></td>';
			htmls += '					</tr>';
		}
	}
	
	/*
	htmls += '					<tr>';
	if(rfFlag == "Y"){
		htmls += '						<th><span>' + infoPeriod + '</span></th>';
		htmls += '						<td><span>' + rentPeriod + '</span></td>';
		htmls += '						<th><span>' + infoTotDist + '</span></th>';
		htmls += '						<td><span>' + totDist + '㎞</span></td>';
	} else{

		if(electricYn == "Y"){
			htmls += '						<th><span>' + infoTotDist + '</span></th>';
			htmls += '						<td><span>' + totDist + '㎞</span></td>';
			htmls += '						<th><span>' + infoElec1Level + '</span></th>';
			htmls += '						<td><span>' + ((elec1Level=='')?('-'):(elec1Level + '%'))+'</span></td>';
			htmls += '					</tr>';
			htmls += '					<tr>';
			htmls += '						<th><span>' + infoElec1Volt + '</span></th>';
			htmls += '						<td><span>' + ((elec1Volt=='')?('-'):(elec1Volt + 'V'))+'</span></td>';
			htmls += '						<th><span>' + infoElec1Current + '</span></th>';
			htmls += '						<td><span>' + ((elec1Current=='')?('-'):(elec1Current + 'A'))+'</span></td>';
			
		}else{
			htmls += '						<th><span>' + infoTotDist + '</span></th>';
			htmls += '						<td colspan="3"><span>' + totDist + '㎞</span></td>';
		}
	}
	htmls += '					</tr>';
	*/
	
	htmls += '					<tr>';
	htmls += '						<th><span>' + infoLastOn + '</span></th>';
	htmls += '						<td><span>' + lastTurnOn + '</span></td>';
	htmls += '						<th><span>' + infoLastOff + '</span></th>';
	htmls += '						<td><span>' + lastTurnOff + '</span></td>';
	htmls += '					</tr>';
	if(temperatureFlag == "Y"){
		htmls += '					<tr>';
		htmls += '						<th><span>' + infoTempA + '</span></th>';
		htmls += '						<td><span>' + tempA + '℃<em class="font-gray">기준 ' + tempAMin + '℃ ~ ' + tempAMax + '℃</em></span></td>';
		htmls += '						<th><span>' + infoTempB + '</span></th>';
		htmls += '						<td><span>' + tempB + '℃<em class="font-gray">기준 ' + tempBMin + '℃ ~ ' + tempBMax + '℃</em></span></td>';
		htmls += '					</tr>';
	}
	if(mainSwitchYn == "Y"){
		htmls += '					<tr>';
		htmls += '						<th><span>' + infoSwitchOn + '</span></th>';
		htmls += '						<td><span>' + mainSwitchOn + '</span></td>';
		htmls += '						<th><span>' + infoSwitchOff + '</span></th>';
		htmls += '						<td><span>' + mainSwitchOff + '</span></td>';
		htmls += '					</tr>';
	}
	htmls += '				</tbody>';
	htmls += '			</table>';
	htmls += '		</div>';
	htmls += '	</div>';
	htmls += '	<div class="pop-footer flex-end">';

	if(deviceType == "SMARTKEY"){
		if(isUseSmartappkey == "Y"){
			htmls += '		<span class="font-blue" style="position:absolute;left:0;top:50%;margin-top:-12px;height:24px;line-height:24px;">' + infoSmartkeyY + '</span>';
		} else if(isUseSmartappkey == "N"){
			htmls += '		<span class="font-red" style="position:absolute;left:0;top:50%;margin-top:-12px;height:24px;line-height:24px;">' + infoSmartkeyN + '</span>';
		}
	}
	
    htmls += '      <button type="button" class="btn btn-white" onclick="clickGpsReset(\''+tidId+'\');">' + infoGpsReset + '</button>';
	htmls += '		<button type="button" class="btn btn-white" onclick="closeInfoWindow();clickDrivePath(\''+tidId+'\');">' + infoDrvPath + '</button>';
	if(notifyFlag == 'Y'){
		htmls += '		<button type="button" class="btn btn-white" onclick="closeInfoWindow();clickControl(\''+tidId+'\');">' + infoRemote + '</button>';
	}
	htmls += '		<button type="button" class="btn btn-white" onclick="closeInfoWindow();clickNearest(\''+tidId+'\');">' + infoNearest + '</button>';
	
	htmls += '	</div>';
	htmls += '</div>';
	
	infowindow.setContent(htmls);
	infowindow.open(map, marker);
	
	delete htmls;
	
	geocoder.coord2Address( coord.getLng(),coord.getLat() , function(result, status) {
		if(status === daum.maps.services.Status.OK){
			address = result[0].address.address_name;
			if( marker.carPos.getLat() ===  coord.getLat() && marker.carPos.getLng() === coord.getLng() ){
				$("#txtAddr").text(address);
			}
		} else{
			address = "";
		}
	});
	
	/*$("#carInfoForm #carTidId").val(tidId);
	$("#carInfoForm #carInfo").val(JSON.stringify(carinfo));*/
	
	delete biTurnOnoff, cmNumber, cmCarname, tidId, gpsState, address, volt, tempA, tempAMin, tempAMax, tempB, tempBMin, tempBMax, grpName, gpsSpeed, driName, grouplistName;
	delete avgSpeed, driCel, driveMin, contNo, dayDist, rentDt, returnDt, totDist, lastTurnOn, lastTurnOff;
	
}

/**
 * 미니맵 호출
 * 
 * @param tidId
 */
function onMinimapPreview(tidId){

//	if( g_NearestPreviewTimer > -1 ){
//		clearTimeout(g_NearestPreviewTimer);
//		g_NearestPreviewTimer = -1;
//	}
//	
//	g_NearestPreviewTimer = setTimeout(function(){
//		$('.left-area .pop-minimap').hide();
//	}, 4000);
	
	for ( var i = 0; i < fastMarkers.length; i++) {
		if( fastMarkers[i].tidId == tidId ){
			marker = fastMarkers[i];
			break;
		}
	}
	
	if( marker == null || marker.tidId != tidId ){
		return;
	} else{
//		var xCoord = Number(marker.position.lat()).toFixed(6);
//		var yCoord = Number(marker.position.lng()).toFixed(6);
//		
//		var retUrl = googleStaticMap(marker, xCoord, yCoord);
		drawMinimap(marker);
	}
	
}

/**
 * 미니맵 그리기
 * 
 * @param marker
 * @param retUrl
 */
function drawMinimap(marker){
	var tempCarNumName = "";
	if(marker.cmKey == undefined || marker.cmKey == ""){
		tempCarNumName = noCar + "[" + marker.tidId + "]";
	} else if(marker.carName == undefined || marker.carName == ""){
		tempCarNumName = marker.cmNumber;
	} else{
		tempCarNumName = marker.carName;
	}
	
	$("#miniMapArea").html("");
    $('.left-area .pop-minimap').show();
	var staticMapContainer  = document.getElementById('miniMapArea'); // 이미지 지도를 표시할 div  
    var staticMapOption = {
        center: marker.carPos, // 이미지 지도의 중심좌표
        level: 4 // 이미지 지도의 확대 레벨
    };
	var staticMap = new daum.maps.StaticMap(staticMapContainer, staticMapOption);
	
//	var img = $("#miniMapArea").find("img");
//	img.width = '300px';
//	img.height = '200px';
//	$("#miniMapArea").css({'width':'300px', 'height':'200px'});
//	$("#miniMapArea").html(img);
	
	var iconHtml = '';
	iconHtml += '<img href="javascript:void(0);" src="' + setMarkerImage(marker.biOpFlag, marker.biTurnOnoff, 0, marker.cmColor, marker.carType, "N") + '" style="display:block;"/>';
	iconHtml += '<span style="transform:translateX(-25%); font-size:12px; font-weight:500; line-height:24px; display:inline-block; padding:0 5px; color:#ffffff; border-radius:2px; background-color:rgba(0, 0, 0, 0.6); box-shadow:0 1px 2px 0 rgba(0, 0, 0, 0.5);">' + tempCarNumName + '</span>';
	$("#miniIconArea").html(iconHtml);
	
	$('.left-area .pop-minimap').show();
}

/**
 * 운행경로 검색 데이터 임시저장
 * @param reqDate
 * @param startTm
 * @param endTm
 * @param kind
 * @param timeLine
 */
function setDrivingPath(startDt, endDt, startTm, endTm, kind/*, timeLine*/){
	g1_chk_date_start = startDt;
	g1_chk_date_end = endDt;
	g1_chk_time_start = startTm;
	g1_chk_time_end = endTm;
	g1_val = kind;
}

/**
 * 운행경로 그리기
 * 
 * @param operationList
 */
function drawTimeRoute(operationList){
	//기존 경로 제거
	clearRoute(true);
	
	//화살표 간격
	applySetArrowInterval();
	
	var carPos = []; 
	var carPosIdx = [];
	
	var bounds = new daum.maps.LatLngBounds();
	
	//속도색상 표시 여부
	var option_speed_color = $("#checkSpeedColor").is(":checked");
	if($.browser.msie){
		option_speed_color = false;
	}
	
	//차량 좌표 목록 생성
	for(var i = 0; i < operationList.length; i++) {
		var worCode = operationList[i].worCode;
		
		var temperature = worCode.substr(6, 1);
		var temperature_abnormal = worCode.substr(7, 1);

		if( temperature != "1" && temperature_abnormal != "1" ){
			carPos.push( new daum.maps.LatLng(operationList[i].biXPosition, operationList[i].biYPosition) );
			carPosIdx.push( i );
		}
	}
	
	//속도색상 표시
	if(option_speed_color) {
		//범례 표시
		$("#bum_ex").show();
	}
	//속도색상 미표시
	else {
		//경로 라인 그리기
		var polyLine = new BDCCArrowedPolylineInterval(carPos, "#FF0000", 3, 0.8, null, 60, 6, "#FF0000", 5, 0.9);
		polyLine.setMap(map);
		routeOverlays.push(polyLine);
	}
	
	//start 마커 표시
	var startMarkerPos = new daum.maps.LatLng(operationList[0].biXPosition, operationList[0].biYPosition);
	var startMarkerIcon = getContextPath() + "/resources/images/"+getLangset()+"/realtime/start_01.png"; //출발
	var startMarker = new daum.maps.Marker({position:startMarkerPos, map:map, flat:true, zIndex:214750});
	setMarkerImageDaum(startMarker, startMarkerIcon);
	routeOverlays.push(startMarker);
	
	//end 마커 표시
	var endMarkerPos = new daum.maps.LatLng(operationList[operationList.length-1].biXPosition, operationList[operationList.length-1].biYPosition);
	var endMarkerIcon = getContextPath() + "/resources/images/"+getLangset()+"/realtime/arrival_01.png"; //도착
	var endMarker = new daum.maps.Marker({position:endMarkerPos, map:map, flat:true, zIndex:214750});
	setMarkerImageDaum(endMarker, endMarkerIcon);
	routeOverlays.push(endMarker);
	
	//화살표 마커, 경로 라인 속도색상 그리기
	for(var i = 0; carPosIdx.length > i; i++){
		var bi_date = operationList[carPosIdx[i]].biDate.substring(0,4) + "-" + operationList[carPosIdx[i]].biDate.substring(4,6) + "-" + operationList[carPosIdx[i]].biDate.substring(6);
		var bi_time = operationList[carPosIdx[i]].biTime.substring(0,2) + ":" + operationList[carPosIdx[i]].biTime.substring(2,4) + ":" + operationList[carPosIdx[i]].biTime.substring(4,6);
		var bi_gps_speed = operationList[carPosIdx[i]].biGpsSpeed;
		
		// 무단이동
		var bIllegallyMove = false; 
		if( operationList[carPosIdx[i]].biOpFlag == "901" || operationList[carPosIdx[i]].biOpFlag == "902") {
			bIllegallyMove = true;
		}
		
		//drawing interval(arrow symbol)
		if(i % interval_arrow == 0){	
			if( carPos[carPosIdx[i-1]] != null && carPos[carPosIdx[i]] != null ){
				var p1 = map.getProjection().pointFromCoords(carPos[carPosIdx[i-1]]);
				var p2 = map.getProjection().pointFromCoords(carPos[carPosIdx[i]]);

				if( carPos[carPosIdx[i+1]] != null ){
					var p3 = map.getProjection().pointFromCoords( carPos[carPosIdx[i+1]] );
					var dir = (Math.atan2(p2.y  - p1.y , p2.x  - p1.x ) * 180 / Math.PI) + 90;
					var dir2 = (Math.atan2(p3.y  - p2.y , p3.x  - p2.x ) * 180 / Math.PI) + 90;
					
					dir = Math.round(dir / 3) * 3;
					dir2 = Math.round(dir / 3) * 3;
					
					if( Math.abs(dir-dir2) > 30 )
						dir = dir2;
				} else {
					var dir = (Math.atan2(p2.y  - p1.y , p2.x  - p1.x ) * 180 / Math.PI) + 90;
					dir = Math.round(dir / 3) * 3;
				}
				
				if (dir < 0)
					dir += 360;
				
				//use the corresponding icon
				var icon = createIcon("dir_" + dir + ".png");
				var op_flag =  operationList[carPosIdx[i]].biOpFlag;

				if( op_flag == "901" || op_flag == "902") { 
					icon = createIcon("../arrow.png");
				}
				
				var marker = new daum.maps.Marker({
					position : carPos[i],
					map : map,
					zIndex: 2147,
					image : icon,
					title: bi_time + "\n" + operationList[carPosIdx[i]].biGpsSpeed + "km/h",
					clickable : true
				});
				routeOverlays.push(marker);
				
				//set marker events
				var targetId = String( carPosIdx[i] && operationList[carPosIdx[i]] ? operationList[carPosIdx[i]].biDate : 0 ) + String( carPosIdx[i] && operationList[carPosIdx[i]] ? operationList[carPosIdx[i]].biTime : 0 );
				setMarkerTarget(targetId, marker, bi_date + " " + bi_time, carPos[i], operationList[carPosIdx[i]].biGpsSpeed, operationList[carPosIdx[i]].txtStatus, operationList[carPosIdx[i]].txtGpsState, operationList[carPosIdx[i]].worText, operationList[carPosIdx[i]].biSensorSpeed);
			}
		}
		
		//속도색상 표시
		if(option_speed_color && i > 0) {
			var linePos = [carPos[i-1],carPos[i]];
			
			//BGF 운행경로라인 개선
			var lineWidth = 5;
			var lineColor = "#20CF24";
			if(bi_gps_speed < 30) lineColor = "#20CF24";
			else if(bi_gps_speed >= 30 && bi_gps_speed < 60) lineColor = "#0F88FD";
			else if(bi_gps_speed >= 60 && bi_gps_speed < 100) lineColor = "#B51AFD";
			if(bi_gps_speed > 100) lineColor = "#F70F0F";
			//BGF 운행경로라인 개선
			
			if( bIllegallyMove == true ){
				lineColor = "#ff7200"; // #ffc500
				lineWidth = 7;
			}
			
			//경로 라인 그리기
			var polyLine = new BDCCArrowedPolylineInterval(linePos, lineColor, 3, 0.8, null, 60, 6, lineColor, 5, 0.9);
			polyLine.setMap(map);
			routeOverlays.push(polyLine);
		}
		
		//맵바운더리 설정
		bounds.extend(carPos[i]);
	}
	
	//이상정보 마커
	for(var i = 0; operationList.length > i; i++){
		var bi_date = operationList[i].biDate.substring(0,4) + "-" + operationList[i].biDate.substring(4,6) + "-" + operationList[i].biDate.substring(6);
		var bi_time = operationList[i].biTime.substring(0,2) + ":" + operationList[i].biTime.substring(2,4) + ":" + operationList[i].biTime.substring(4,6);
		var pos = new daum.maps.LatLng(operationList[i].biXPosition, operationList[i].biYPosition);
		
		//set odd markers (worCode ex : 000001)=> 0000010000
		var worCode = operationList[i].worCode;
		var worText = operationList[i].worText;
		var worIcon = "";
		if(worCode.indexOf("1") != -1) {
			var overSpeed = worCode.substr(0, 1);		//과속
			var quickBreaking = worCode.substr(1, 1);	//급감속
			var quickOverSpeed = worCode.substr(2, 1);	//급가속
			var noLoadRotation = worCode.substr(3, 1);	//공회전
			var impact = worCode.substr(4, 1);			//충격
			var emergency = worCode.substr(5, 1);		//비상
			
			var temperature = worCode.substr(6, 1);
			var temperature_abnormal = worCode.substr(7, 1);
			
			if(overSpeed == "1") {
				//worText = txtMessage23;/* 과속 */
				worIcon = getContextPath() + "/resources/images/realtime/ico_error_01.png";
			}
			if(quickBreaking == "1") {
				//worText = txtMessage24;/* 급감속 */
				worIcon = getContextPath() + "/resources/images/realtime/ico_error_03.png";
			}
			if(quickOverSpeed == "1") {
				//worText = txtMessage25;/* 급가속 */
				worIcon = getContextPath() + "/resources/images/realtime/ico_error_02.png";
			}
			if(noLoadRotation == "1") {
				//worText = txtMessage26;/* 공회전 */
				worIcon = getContextPath() + "/resources/images/realtime/ico_error_05.png";
			}
			if(impact == "1") {
				//worText = txtMessage27;/* 충격 */
				worIcon = getContextPath() + "/resources/images/realtime/ico_error_04.png";
			}
			if(emergency == "1") {
				//worText = txtMessage28;/* 비상 */
				worIcon = getContextPath() + "/resources/images/realtime/ico_error_06.png";
			}
			
			if( temperature == "1" || temperature_abnormal == "1" ) {
				if( worText != "" ) {
					worText = worText + "|" + operationList[i].msg;
				}
				else {
					worText = operationList[i].msg;
				}
				
				if( worText.indexOf("위반") > -1 ) {
					worIcon = getContextPath() + "/resources/images/realtime/ico_event_temp01.png";
				} else {
					worIcon = getContextPath() + "/resources/images/realtime/ico_event_temp01.png";
				}
			}
			
			var marker = null; 
			if( temperature == "1" || temperature_abnormal == "1" ) {
				if( worText.indexOf("위반") > -1 ){
					if( (/^0.0/).test(operationList[i].biXPosition) == false && (/^0.0/).test(operationList[i].biYPosition)  == false ){
						marker = new daum.maps.Marker({position:carPos[i], map:map, flat:true, zIndex: 214748});
						setMarkerImageDaum(marker, worIcon);
						routeOverlays.push(marker);
						
						//set oddmarker events
						var targetId = String( operationList[i] ? operationList[i].biDate : 0 ) + String( operationList[i] ? operationList[i].biTime : 0 );
						setMarkerTarget(targetId, marker, bi_date + " " + bi_time, pos, operationList[i].biGpsSpeed, operationList[i].txtStatus, operationList[i].txtGpsState, operationList[i].worText, operationList[i].sensorSpeed);
					}
				}
			}
			else {
				// 충격/비상 이벤트 제외시킴 
				if(impact != "1") {		// mijurang 20150925 화약 비상
					marker = new daum.maps.Marker({position:carPos[i], map:map, flat:true, zIndex: 214748});
					routeOverlays.push(marker);
					setMarkerImageDaum(marker, worIcon);
					
					//set oddmarker events
					var targetId = String( operationList[i] ? operationList[i].biDate : 0 ) + String( operationList[i] ? operationList[i].biTime : 0 );
					setMarkerTarget(targetId, marker, bi_date + " " + bi_time, pos, operationList[i].biGpsSpeed, operationList[i].txtStatus, operationList[i].txtGpsState, operationList[i].worText, operationList[i].biSensorSpeed);
				}
			}
		}
	}
	
	if(!bounds.isEmpty()){
		//맵 바운더리 초기화
		map.setBounds(bounds);
	}
	
	return true;
}

function createIcon(file){
	var icon = new daum.maps.MarkerImage(
		getContextPath() + "/resources/images/realtime/path_img/" + file,
		new daum.maps.Size(20, 20), 
		new daum.maps.Point(7, 7)
	);
	return icon;
}

//마커 정보창
function getMarkerInfowindow(datetime, gpsSpeed, txtStatus, txtGpsState, worText, txtAddress, status, sensorSpeed) {
	var strHtml = "";

	strHtml += '<div class="pop-inner-map pop-map-car-detail" style="">';
	strHtml += '	<div class="modal-header">';
	strHtml += '		<button class="close" data-dismiss="modal" type="button" aria-label="Close" onclick="closeInfoWindow();" style="top:-10px; right:-5px;"></button>';
	strHtml += '	</div>';
	strHtml += '	<div class="data-form-table">';
	strHtml += '		<div class="data-form-table-body v-middle">';
	strHtml += '			<table>';
	strHtml += '				<colgroup>';
	strHtml += '					<col style="width:85px;">';
	strHtml += '					<col style="width:auto;">';
	strHtml += '					<col style="width:85px;">';
	strHtml += '					<col style="width:auto;">';
	strHtml += '				</colgroup>';
	strHtml += '				<tbody>';
	if(status == "OK"){
		strHtml += '					<tr>';
		strHtml += '						<th><span>'+txtMessage21+'</span></th>'; /* 위치 */
		strHtml += '						<td colspan="3"><span>' + txtAddress + '</span></td>';
		strHtml += '					</tr>';
	} else{
		strHtml += '					<tr>';
		strHtml += '						<th><span>'+txtMessage21+'</span></th>'; /* 위치 */
		strHtml += '						<td colspan="3"><span>' + txtMessage22 + '<br/>(' + status + ')</span></td>';
		strHtml += '					</tr>';
	}
	strHtml += '					<tr>';
	strHtml += '						<th><span>'+txtMessage04+'</span></th>'; /* 운행시간 */
	strHtml += '						<td><span>' + datetime + '</span></td>';
	//strHtml += '						<th><span>'+txtMessage17+'</span></th>';  /* 운행속도 */
	//strHtml += '						<td><span>' + gpsSpeed + '㎞/h</span></td>';

	if(sensorSpeed !== "" && $.isNumeric(sensorSpeed)){
		strHtml += '						<th><span>'+ infoGpsSpeed +'<br/>(' + txtMessage48 + ')</span></th>'; /* 현재속도 <br /> (제한속도)*/
		strHtml += '						<td><span style="padding-right:10px">' + gpsSpeed + '㎞/h</span><br/><span>(' + sensorSpeed + '㎞/h)</span></td>';
	}else{
		strHtml += '						<th><span>' + infoGpsSpeed + '</span></th>';
		strHtml += '						<td><span>' + gpsSpeed + '㎞/h</span></td>';
	}
	
	strHtml += '					</tr>';
	strHtml += '					<tr>';
	if( txtStatus == txtMessage01 ){
		strHtml += '						<th><span>'+txtMessage18+'</span></th>'; /*운행상태  */
		strHtml += '						<td><span style="background-color: #ffe897;">' + txtStatus + '</span></td>';
	}
	else{
		strHtml += '						<th><span>'+txtMessage18+'</span></th>'; /*운행상태  */
		strHtml += '						<td><span>' + txtStatus + '</span></td>';
	}
	strHtml += '						<th><span>'+txtMessage19+'</span></th>'; /* GPS상태 */
	strHtml += '						<td><span>' + txtGpsState + '</span></td>';
	strHtml += '					</tr>';
	

	if(worText != "") {
		strHtml += '					<tr>';
		strHtml += '						<th><span>'+txtMessage20+'</span></th>'; /* 운행이벤트 */
		strHtml += '						<td colspan="3"><span>' + worText + '</span></td>';
		strHtml += '					</tr>';
	}
	
	strHtml += '				</tbody>';
	strHtml += '			</table>';
	strHtml += '		</div>';
	strHtml += '	</div>';
	strHtml += '</div>';
	
	return strHtml;
}

//마커 생성
function setMarkerTarget(targetId, marker, datetime, pos, gpsSpeed, txtStatus, txtGpsState, worText, sensorSpeed) {
	daum.maps.event.addListener(marker, 'click', function() {
		routeGeocoder.coord2Address(pos.getLng(), pos.getLat(), function(results, status) {
			var strHtml = "";
			
			if(status == daum.maps.services.Status.OK) {
				strHtml = getMarkerInfowindow(datetime, gpsSpeed, txtStatus, txtGpsState, worText, results[0].address.address_name, status, sensorSpeed);
			}
			else {
				strHtml = getMarkerInfowindow(datetime, gpsSpeed, txtStatus, txtGpsState, worText, "", status, sensorSpeed);
			}
			
			scrollToTarget(targetId);
			
			routeInfowindow.setContent(strHtml);
			routeInfowindow.setPosition(pos);
			routeInfowindow.open(map);
		});
	});
}

//운행기록 리스트 클릭 시 해당지점으로 이동
function movePoint(rowNumber, posX, posY, datetime, gpsSpeed, txtStatus, txtGpsState, worText, sensorSpeed) {
	
	scrollToTargetColor(String(rowNumber));
	
	var pos = new daum.maps.LatLng(posX, posY);
	map.setCenter(pos);
	
	routeGeocoder.coord2Address(pos.getLng(), pos.getLat() , function(results, status) {
		var strHtml = "";
		
		if(status == daum.maps.services.Status.OK) {
			strHtml = getMarkerInfowindow(datetime, gpsSpeed, txtStatus, txtGpsState, worText, results[0].address.address_name, status, sensorSpeed);
		}
		else {
			strHtml = getMarkerInfowindow(datetime, gpsSpeed, txtStatus, txtGpsState, worText, "", status, sensorSpeed);
		}
		
		routeInfowindow.setContent(strHtml);
		routeInfowindow.setPosition(pos);
		routeInfowindow.open(map);
	});
}

function scrollToTarget(targetId){
	location.hash = "#row_" + String(targetId);
	scrollToTargetColor(targetId);
}

/**
 * 운행경로에서 특정지점 클릭 시 운행기록 스크롤
 * 
 * @param targetId
 */
var g_aRow = null;
var g_aRow_addr = null;
var g_aRow_color = null;
function scrollToTargetColor(targetId){
	if( g_aRow != null){
		g_aRow.style.backgroundColor = g_aRow_color;
	}
	
	g_aRow = document.getElementById("row_" + String(targetId)); 
	if( g_aRow != null ){
		g_aRow_color = g_aRow.style.backgroundColor;
		g_aRow.style.backgroundColor="#cee4fc";
		
	}
	
	var tgt_id_addr = targetId + "_addr";
	if( g_aRow_addr != null){
		g_aRow_addr.style.backgroundColor=g_aRow_color;
	}
	
	g_aRow_addr = document.getElementById("row_" + String(tgt_id_addr));
	if( g_aRow_addr != null){
		g_aRow_addr.style.backgroundColor="#cee4fc";
	}
}

//clear all overlays and infowindow
function clearRoute(redraw){
	//운행경로를 다시 그리기 위해 지우는지 여부
	if(!redraw) redraw = false;
	
	g1_chk_date_start = "";
	g1_chk_date_end = "";
	g1_chk_time_start = "";
	g1_chk_time_end = "";
	g1_val = "";
	
	clearRouteInfowindow();
	clearRouteOverlay();
	
	//범례 감추기
	$("#bum_ex").hide();
	
	//운행경로를 다시 그리지 않음 && 실시간 차량 타이머 중지 상태
	if(!redraw && realTimer == null) {
		//실시간 차량 타이머 재시작
		reStartTimer();
		
		//타임라인 접기
		collapseRouteList();
	}
}

/**
 * 경로보기 info창 지우기
 */
function clearRouteInfowindow(){
	if(routeInfowindow != null){
		routeInfowindow.close(map);
	}
}

/**
 * 경로보기 마커 지우기
 */
function clearRouteOverlay(){
	if(routeOverlays && routeOverlays.length >= 1) {
		var i = routeOverlays.length;
	   	while (i--){
			var oddoverlay = routeOverlays[i];
			if (oddoverlay) oddoverlay.setMap(null);
			delete routeOverlays[i];
	   	}
	}
	
   	routeOverlays = [];
}

/**
 * 화살표 간격 데이터 세팅
 */
function applySetArrowInterval(){
	interval_arrow = Number($("#selTimeInterval option:selected").val());
}

/**
 * 경로비교하기
 * @param operationList
 */
function addDrawTimeRoutePath(carInfo, operationList){
	
	var carInfo = JSON.parse($("#carInfoForm #carInfo").val());
//	var carInfo = $("#carInfoForm #carInfo").val();
	var preValue = $("#mpath_contents").html();

	var cacheTime = (new Date()).getTime();
	var genID = cacheTime;
	
	var genPathName = "";

	var carPos = []; 
	var carPosIdx = [];
	
	var worCode = null;
	var det_speed = null;
	var det_status = null;
	var det_gps = null;
	var msg = null;
	
	var bounds = new daum.maps.LatLngBounds();
	
	if( rnd_value < 15 ){
		rnd_value++;
	} else{
		rnd_value = 0;
	}
	
	var k = 0;
	carPos = [];
	
	for(var i = 0; i < operationList.length; i++){
		worCode = operationList[i].worCode;
		
		var temperature = worCode.substr(6, 1);
		var temperature_abnormal = worCode.substr(7, 1);
		
		if( temperature != "1" && temperature_abnormal != "1" ){
			carPos[k] = new daum.maps.LatLng(operationList[i].biXPosition, operationList[i].biYPosition);
			carPosIdx[k] = i;
			
			k++;
		}
		
		if(operationList[i].biTotalDistince) {
			total_distance = operationList[i].biTotalDistince;
		}
	}
	
	for(var i = 0; i < k; i++){
		bounds.extend(carPos[i]);
	}
	
	//지도 polyline 그리기 (정의된 prototypeonClick_timeroute( 사용)
	var polyIE8 = new BDCCArrowedPolylineSimple(carPos, lineSymbol_color[rnd_value], 8, 0.6, null, 60, 6, lineSymbol_color[rnd_value], 8, 0.6);
	polyIE8.setMap(map);
	
	//맵 바운더리 초기화
	map.setBounds(bounds);
	mapPathControl.put( genID, polyIE8 );
	
	var carName = "";
	if(carInfo.cmNumber == undefined || carInfo.cmNumber == ""){
		carName = carInfo.tidId;
	} else{
		carName = carInfo.cmNumber;
	}
	genPathName += carName + " ";
	
	//연속된 기간
	if(g1_chk_date_start != g1_chk_date_end) {
		genPathName += g1_chk_date_start.substring(0,4) + "-" + g1_chk_date_start.substring(4,6) + "-" + g1_chk_date_start.substring(6,8) + " ~ " + g1_chk_date_end.substring(0,4) + "-" + g1_chk_date_end.substring(4,6) + "-" + g1_chk_date_end.substring(6,8);
	}
	//하루
	else {
		genPathName += g1_chk_date_start.substring(0,4) + "-" + g1_chk_date_start.substring(4,6) + "-" + g1_chk_date_start.substring(6,8) + " " + g1_chk_time_start + ":00 ~ " + g1_chk_time_end + ":00";
	}
	
	//total_distance = $.setCommaNumber(Number(total_distance/1000).toFixed(1));
	genPathName += " <span style=\"display:inline-block; width:50px;\">("+total_distance+"km)</span>";
	
	var strItem = "";
	strItem += "<li><div id=\"" + genID + "\" class='myPathButton'><span><a href='javascript:void(0);'><img  src='"+getContextPath()+"/resources/images/common/path_block_" + rnd_value + ".png' />";
	strItem += "</img></a></span>";
	strItem += "<span class='button' style='background-color: black; opacity: 0.7;'><button onclick='javascript:void(0);' type='button'>";
	strItem += "<span style='color: white;'>" + genPathName + "</span></button></span>";
	strItem += "<span><a href='javascript:onclick_pathClose(\"" + genID + "\");' style='margin-left: 0px;'>";
	strItem += "<img src='"+getContextPath()+"/resources/images/common/path_block_close.png' alt='Close' style='width: 15px; height: 20px;' />";
	strItem += "</a></span></div></li>";
	
	$("#mpath_contents").html(preValue + strItem);
}

/**
 * 경로보기 삭제
 * 
 * @param tgt
 */
function onclick_pathClose(tgt){
	var poly = mapPathControl.get(tgt);
	if (poly){
		poly.onRemove();
		poly = null;
	}
	mapPathControl.put(tgt, null);
	$("#"+tgt).hide();
}

/**
 * 사고/공사 보기
 */
function showEventsView(){
	daum.maps.event.addListener(map, 'zoom_changed', function() {
		closeInfoWindow();
		daum.maps.event.addListener(map, 'bounds_changed', function (e) {
			if($("#icon_trouble").hasClass("on") == true){
				callApiInfo("2");
			}
		  });
	});
	
	daum.maps.event.addListener(map, 'dragend', function() {
		if($("#icon_trouble").hasClass("on") == true){
			callApiInfo("2");
		}
	});
}

/**
 * 사고/공사 마커 찍기
 * 
 * @param jsonData
 */
function addEventsMarker(jsonData){
	
	var LanesBlockType, LanesBlocked, EventStartDay, EventEndDay, EventStartTime, EventEndTime, EventStatusMsg, ExpectedCnt, ExpectedDetourMsg;
	
	switch (jsonData.lanesblocktype){
		case '0' : LanesBlockType = landsBlockType0; break;
		case '1' : LanesBlockType = landsBlockType1; break;
		case '2' : LanesBlockType = landsBlockType2; break;
		case '3' : LanesBlockType = landsBlockType3; break;
		default  : LanesBlockType = "-"; break;
	}
	
	EventStartDay = jsonData.eventstartday;
	EventEndDay = jsonData.eventendday;
	EventStatusMsg = jsonData.eventstatusmsg;
	
	EventStartDay = EventStartDay.substring(0, 4) + "-"+ EventStartDay.substring(4, 6) + "-" + EventStartDay.substring(6, 8);
	EventEndDay = EventEndDay.substring(0, 4) + "-"+ EventEndDay.substring(4, 6) + "-" + EventEndDay.substring(6, 8);
	
	var eventTitle = "";
	eventTitle += eventEventTitle1 + " : "+LanesBlockType + "\n";
	eventTitle += eventEventTitle2 + " : "+EventStartDay+"~"+EventEndDay + "\n";
	eventTitle += eventEventTitle3 + " : "+EventStatusMsg + "\n";

	var pos = new daum.maps.LatLng(jsonData.coordy,jsonData.coordx);
	var marker = new daum.maps.Marker({
		position: pos,
		title: eventTitle,
		map: map
	});
	setMarkerImageDaum(marker, getContextPath() + "/resources/images/realtime/new_ico/Icon_construction.gif");
	
	EventsMarkers.push(marker);
	
	delete pos, eventTitle, marker;
	delete LanesBlockType, LanesBlocked, EventStartDay, EventEndDay, EventStartTime, EventEndTime, EventStatusMsg, ExpectedCnt, ExpectedDetourMsg;
	
}

/**
 * cctv 보기
 */
function showCCTVView(){
	daum.maps.event.addListener(map, 'zoom_changed', function() {
		closeInfoWindow();
		clearMarkers(CCTVMarkers);
		daum.maps.event.addListener(map, 'bounds_changed', function (e) {
			if(IsCCTVView){
				var zoomLevel = map.getLevel();
				if($("#icon_cctv").hasClass("on") == true && zoomLevel<limitZoomLevel){
					callApiInfo("1");
				}
			}
		 });
	});
	
	daum.maps.event.addListener(map, 'dragend', function() {
		if(IsCCTVView){
			clearMarkers(CCTVMarkers);
			
			var zoomLevel = map.getLevel();
			if($("#icon_cctv").hasClass("on") == true && zoomLevel<limitZoomLevel){
				callApiInfo("1");
			}
		}
	});
}

/**
 * cctv 마커찍기
 * 
 * @param jsonData
 */
function addCCTVMarker(jsonData){        
	
	var CCTVType, FileCreateTime, CCTVFormat, CCTVResolution, CCTVName, CCTVurl;
	
	switch (jsonData.cctvtype){
		case '1' : CCTVType = cctvType1; break;
		case '2' : CCTVType = cctvType2; break;
		case '3' : CCTVType = cctvType3; break;
		default  : CCTVType = "-"; break;
	}
	
	FileCreateTime = jsonData.FileCreateTime;
	CCTVFormat = jsonData.cctvformat;
	CCTVResolution = jsonData.cctvresolution;
	CCTVName = jsonData.cctvname;
	CCTVurl = jsonData.cctvurl;
	
	CCTVurl = CCTVurl.replace("http://", "https://");
	
	var eventTitle = "";
	eventTitle += cctvEventTitle1 + " : "+CCTVName + "\n";
	eventTitle += cctvEventTitle2 + " : "+CCTVType + "\n";
	eventTitle += cctvEventTitle3 + " : "+CCTVFormat + "\n";
	
	var pos = new daum.maps.LatLng(jsonData.coordy,jsonData.coordx);        
	var marker = new daum.maps.Marker({
					position: pos,
					title: eventTitle,
					map: map
	});                 
	setMarkerImageDaum(marker, getContextPath()+ "/resources/images/realtime/new_ico/Icon_cctv.gif");
	
	daum.maps.event.addListener(marker,'click',function(){            
		var strHtml="";
		strHtml +="<div id=\"divCCTVContent\" style=\"padding-top:10px;width:320px;height:270px\">";
		strHtml +=" <span style='font-weight:bold;'>"+CCTVName+"</span>";
		strHtml +="	<button class='btn-close-info-window' type=\"button\" onclick=\"closeInfoWindow();\" style=\"\"></button>";
		strHtml +="	<object width=\"320\" height=\"245\"> ";
//		strHtml +="		<param name=\"movie\" value="+CCTVurl+"></param>"; 
//		strHtml +="	  	<param name=\"allowFullScreen\" value=\"false\"></param> ";
//		strHtml +="	  	<param name=\"allowscriptaccess\" value=\"always\"></param> ";
//		strHtml +="		<embed src="+CCTVurl+" allowscriptaccess=\"always\" showcontrols=\"false\" width=\"320\" height=\"245\" > ";
//		strHtml +="		</embed> ";
		strHtml +="		<html>";
		strHtml +="			<head>";
		strHtml +="				<meta name=\"viewport\" content=\"width=device-width\">";
		strHtml +="			</head>";
		strHtml +="			<body>";
		strHtml +="				<video controls=\"\" autoplay=\"\" name=\"media\" width=\"320\" height=\"245\">";
		strHtml +="					<source src="+CCTVurl+" type=\"video/mp4\">";
		strHtml +="				</video>";
		strHtml +="			</body>";
		strHtml +="		</html>";
		strHtml +="</object> ";
		strHtml +="</div> ";
		
		infowindow.setContent(strHtml);
		infowindow.setPosition(pos);
		infowindow.open(map);
	
		
	});
	
	CCTVMarkers.push(marker);
	delete pos, marker;
	delete CCTVType, FileCreateTime, CCTVFormat, CCTVResolution, CCTVName, CCTVurl
}

/**
 * 지점 보기 지우기
 */
function clearPlaceOverlays(){

	for ( var i = 0; i < placeMarkerGeoFences.length; i++){
		placeMarkerGeoFences[i].setMap(null);
	}
	placeMarkerGeoFences = [];
	delete placeMarkerGeoFences;
	
	removeTempFence();
}

function removeTempFence(){
	if( pt_fence != null ){
		pt_fence.setMap(null);
	}
	pt_fence = null;
}

/**
 * 지점 마커 생성
 * 
 * @param placeList
 */
function makePlaceMarkers(placeList){
	
	var strIconURL = "";
	var strNextIconURL = "";
	
	g_cntGeoFence = 0;
	
	//글꼴
	var fontFamily = $("#fontFamily").val();
	var fontWeight = $("#fontWeight").val();
	
	//글자 크기 비율
	var fontSizeRate = $("#fontSize").val();
	if(!fontSizeRate) fontSizeRate = 100;
	
	//글자 크기
	var fontSize = 16;
	if(Number(fontSizeRate) >= 0) {
		fontSize = Number(fontSizeRate) / 100 * fontSize;
	}
	
	for(var i=0; i<placeList.length; i++){
		var geoPos = new daum.maps.LatLng(placeList[i].yCoord, placeList[i].xCoord);
		var geoName = placeList[i].geoName;
		var geoClass = placeList[i].geoClass;
		
		var commonYn = placeList[i].commonYn
		
		var rmkMapYn = placeList[i].rmkMapYn;
		var geoRmk = placeList[i].geoRmk;
		
		var markerStyle = setPlaceMarkerImage(geoClass, false, commonYn);
		
		//제목
		var title = geoName + "\n(" + placeList[i].geoAddr + ")";
		if(rmkMapYn == "Y" && geoRmk) {
			title += "\n" + geoRmk;
		}
		
		//라벨
		var geoLabel = "<div style='font-family:"+fontFamily+",sans-serif; font-weight:"+fontWeight+"; font-size:"+fontSize+"px; line-height:"+fontSize+"px;' class='markerLabelKKPlace'>"+geoName;
		if(rmkMapYn == "Y" && geoRmk) {
			geoLabel += "<br>(" + geoRmk +")";
		}
		geoLabel += "</div>";
		
		var marker = placeMarkersMap.get(placeList[i].geoId);
		if(marker == null){
			marker = new daum.maps.Marker({
				map : map,
				position : geoPos,
				title : title,
				zIndex : 10000 + i
			});
			setMarkerImageDaum(marker, markerStyle);
		}
		
		var customOverlay = new kakao.maps.CustomOverlay({
			map : map,
			//position : geoPos,
			position : marker.getPosition(),
			content : geoLabel,
			xAnchor: 0.5,
			yAnchor: -0.3,
			zIndex : 10000 + i
		});
		
		marker.index = i;
		
		marker.offKey = placeList[i].offKey;
		marker.geoId = placeList[i].geoId;
		marker.geoName = placeList[i].geoName;
		marker.geoRmk = placeList[i].geoRmk;
		marker.geoClass = placeList[i].geoClass;
		marker.goeClassName = placeList[i].goeClassName;
		marker.xCoord = placeList[i].xCoord;
		marker.yCoord = placeList[i].yCoord;
		marker.geoAddr = placeList[i].geoAddr;
		marker.geoRadius = placeList[i].geoRadius;
		marker.smsGrpId = placeList[i].smsGrpId;
		marker.useYn = placeList[i].useYn;
		marker.commonYn = placeList[i].commonYn;
		marker.imgUrl = markerStyle;
        marker.geomFence = placeList[i].geomFence; // 지점범위표시(20240802)
        
		marker.geo_enable = true;
		
		placeMarkersMap.put(marker.geoId, marker);
		placeLabelsMap.put(marker.geoId, customOverlay);

		daum.maps.event.addListener(marker, 'click', (function(marker){
			return function() {
				pointInOutModal(marker);
				//drawFence(marker, true);
				setZoneArea(marker); // 지점범위표시(20240802)
			}
		})(marker));
		
		if(mapGeoFence.get(marker.geoId)){
			strIconURL = marker.imgUrl;
			strNextIconURL = setPlaceMarkerImage(marker.geoClass, "on", marker.commonYn);
			
			if(strIconURL != strNextIconURL){
				marker.imgUrl = strNextIconURL;
				setMarkerImageDaum(marker, strNextIconURL);
			}
			
			g_cntGeoFence++;
		} else{
			strIconURL = marker.imgUrl;
			strNextIconURL = setPlaceMarkerImage(marker.geoClass, "off", marker.commonYn);
			
			if(strIconURL != strNextIconURL){
				marker.imgUrl = strNextIconURL;
				setMarkerImageDaum(marker, strNextIconURL);
			}
			
		}
	}
}

/**
 * 지점 반경 그리기
 * 
 * @param marker
 * @param one
 */
function drawFence(marker, one){
	if( one == true){
		removeTempFence();
		
		var populationOptions = {
			      strokeColor: "#ee3b25",
			      strokeOpacity: 0.8,
			      strokeWeight: 2,
			      fillColor: "#ee3b25",
			      fillOpacity: 0.3,
			      map: map,
			      center: marker.getPosition(),
			      radius: Number(marker.geoRadius) * 1.11
			    };
	   pt_fence = new daum.maps.Circle(populationOptions);
	} else {
		var populationOptions = {
			      strokeColor: "#58a240",
			      strokeOpacity: 0.8,
			      strokeWeight: 2,
			      fillColor: "#58a240",
			      fillOpacity: 0.3,
			      map: map,
			      center: marker.getPosition(),
			      radius: Number(marker.geoRadius) * 1.1
			    };
	   var _fence = new daum.maps.Circle(populationOptions);
		placeMarkerGeoFences.push(_fence);
	}
}

function toggleTrafficViewDaum(view){
	if(view == "Y"){
		map.addOverlayMapTypeId(daum.maps.MapTypeId.TRAFFIC); 
	} else{
		map.removeOverlayMapTypeId(daum.maps.MapTypeId.TRAFFIC); 
	}
}

/**
 * 인접차량 초기화
 */
function onInitialNearestCar(){
	
	var searchRadius = $("#searchRadius").val();
	var _unit = $("#selMeasure option:selected").val();
	
	$("#searchRadius").val(10);
	$("#selMeasure").val(1000);

	$("#list1").jqGrid("clearGridData");
	$("#list1 > tbody").html("<tr><td align='center' colspan='3'></td></tr>");
	
	removeNearestFence();
}

/**
 * 인접차량 검색
 */
function onSearchNearestCar(){
	
	var carInfo = JSON.parse($("#carInfoForm #carInfo").val());
//	var carInfo = $("#carInfoForm #carInfo").val();
	var offKey = carInfo.offKey;
	var tidId = carInfo.tidId;
	
	var searchRadius = $("#searchRadius").val();
	var _unit = $("#selMeasure option:selected").val();
	
	if( nearestSeq > 100 ){
		nearestSeq = 0;
	}
	
	if(isCurrency(String(searchRadius)) != true){
		alert(onlyNumber);
		return;
	}
	
	var valRadius =  Number(searchRadius) * Number(_unit);
	
	removeNearestFence();
	
	var marker = null;
	
	var nCnt = fastMarkers.length;

	for ( var i = 0; i < nCnt; i++) {
		if( fastMarkers[i].tidId == tidId )
			marker = fastMarkers[i];
	}
	
	if( marker == null ){
		var c = map.getCenter();
		var location = new daum.maps.LatLng(c.lat(), c.lng() );

		var marker_carmoving_pick_pt = getContextPath()+"/resources/images/"+getLangset()+"/realtime/now_place.png";
		
		var pt_marker = new daum.maps.Marker({
			position : location,
			map : map,
			zIndex : 101,
			draggable : true
		});
		setMarkerImageDaum(pt_marker, marker_carmoving_pick_pt);
		
		daum.maps.event.addListener(pt_marker, 'dragend', (function(s_marker) {
			return function() {
				dragendFenceMarker(s_marker);
			}
		})(pt_marker));
		
		nearestObject.put(String(nearestSeq) + "_" + "_base", pt_marker );
		
		marker = pt_marker;
	}

	closeInfoWindow();
	
	var color = Colors.random();
	
	// 팬스
	createBase_Fence(marker, tidId, color.rgb, valRadius );
	
	// 레이블
	createBase_Label(marker, tidId, color.rgb, valRadius );
	
	// 차량 노드
	createBase_Node(marker, tidId, color.rgb, valRadius );
	
	nearestSeq++;
}

function removeNearestFence(){
	var nCnt = nearestObject.size();
	
	if( nCnt > 0 ){
		var keys = nearestObject.keys(); 
		for( var i=0; i<nCnt; i++){
			var tempObj = nearestObject.get( keys[i] );
			tempObj.setMap(null);
			tempObj = null;
		}
		nearestObject.clear();
	}
	nearestObject_dist.clear();
}

function createBase_Fence(marker, tidId, colorFence, valRadius){
	
	var strTidId = ''+ tidId;
	var strColor = ''+ colorFence;
	
	var populationOptions = {
		      //strokeColor: "#c77e0e",
			  strokeColor: strColor,
		      strokeOpacity: 0.9,
		      strokeWeight: 2,
		      //fillColor: "#bd8416",
		      fillColor: strColor,
		      fillOpacity: 0.1,
		      map: map,
		      center: marker.getPosition(),
		      radius: Number(valRadius)
		    };
	
	var tempFence = new daum.maps.Circle(populationOptions);
	nearestObject.put(String(nearestSeq) + "_" +strTidId + "_fence", tempFence);
	
	map.setCenter(marker.getPosition());
	map.setBounds(tempFence.getBounds());
	
}

function createBase_Label(marker, tidId, colorFence, valRadius){
	
	var strTidId = ''+ tidId;
	var strColor = ''+ colorFence;
	
	var r = Number(valRadius);
	var fence_label = "";
	
	if( r < 1000 ){
		fence_label = String(r.toFixed()) + 'm';
	} else {
		fence_label = String((r/1000).toFixed(1)) + 'km';
	}
	
	var dwidth = 1;
	dwidth = (dwidth * -1)/2 ;
	
	var geoName = fence_label;
	
	var default_style = "";
	if(!$.browser.msie){
		default_style = "left:"+(dwidth)+"px;border:1px solid #446285;height: 12px; -webkit-user-select: none; line-height: 14px; padding-right: 2px; background-image: -ms-linear-gradient(left, rgba(24,118,5, 0.5) 0px, rgba(24,118,5, 0.5) 50px); background-attachment: scroll; background-repeat: repeat; background-position-x: 0%; background-position-y: 0%; background-size: auto; background-origin: padding-box; background-clip: border-box; background-color: transparent; font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: rgb(255,255,255); white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;";
	} else{
		default_style = "left:"+(dwidth)+"px;border:1px solid #446285;height: 12px; -webkit-user-select: none; line-height: 14px; padding-right: 2px; background-image: -webkit-linear-gradient(left, rgba(24,118,5, 0.5) 0px, rgba(24,118,5, 0.5) 50px); font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: rgb(255,255,255); white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;";
	}
	
	var labelHtml = "";
//	labelHtml = "<div style='position:relative;z-index:1010;background-color:white;'>";
//	if(navigator.appVersion.indexOf("MSIE 8.0") != -1){
//   		labelHtml = labelHtml + "<div style='position:absolute;top:-15px;"+default_style+"'>"+geoName+"</div>";
//	}else if(navigator.appVersion.indexOf("safari") != -1){
//		labelHtml = labelHtml + "<div style='position:absolute;top:-20px;"+default_style+"'>"+geoName+"</div>";
//	}else{
//		labelHtml = labelHtml + "<div style='position:absolute; top:10px;"+default_style+"'>"+geoName+"</div>";
//	}
//    labelHtml = labelHtml + "</div>";

	// 커스텀 오버레이를 생성합니다
	var customOverlay = new daum.maps.CustomOverlay({
	    map: map,
	    position: marker.carPos,
	    content: labelHtml,
	    yAnchor: 1 
	});
    
	nearestObject.put(String(nearestSeq) + "_" +strTidId + "_fence_label", customOverlay );
	
}

function createBase_Node(marker, tidId, colorFence, valRadius){
	
	var strTidId = ''+ tidId;
	var strColor = ''+ colorFence;
	
	var src_lon = marker.getPosition().getLng();
	var src_lat = marker.getPosition().getLat();
	
	var nCnt = fastMarkers.length;
	
	var html = "";

	var itemArray = [];
	
	var nItemCnt = 0;
	
	for ( var i = 0; i < nCnt; i++) {
		var lat1 = src_lat;
		var lon1 = src_lon;
		var lat2 = fastMarkers[i].getPosition().getLat();
		var lon2 = fastMarkers[i].getPosition().getLng();
		var dist = getDistance(lat1, lon1, lat2, lon2 );

		nearestObject_dist.put( fastMarkers[i].tidId, dist );
		
		if( fastMarkers[i].tidId != strTidId && Number(dist) < Number(valRadius) ){
			
			var flightPlanCoordinates = [
			                             new daum.maps.LatLng(lat1, lon1),
			                             new daum.maps.LatLng(lat2, lon2)
			                           ];
			                           var flightPath = new daum.maps.Polyline({
			                             path: flightPlanCoordinates,
			                             geodesic: true,
			                             //strokeColor: '#db4105',
			                             strokeColor: colorFence,
			                             strokeOpacity: 0.5,
			                             strokeWeight: 2				                             
			                           });

            flightPath.setMap(map);

			nearestObject.put(String(nearestSeq) + "_" + fastMarkers[i].tidId + "_line", flightPath);
			
    		var tmpCarPos = new daum.maps.LatLng(lat2, lon2);
    			
    		var nodeMarker = new daum.maps.Marker({
    			position : tmpCarPos,
    			anchorPoint : new daum.maps.Point(5,-5),
    			map : map,
    			//title : fastMarkers[i].cmNum + "\n" + (Number(dist)/1000).toFixed(1) + 'km',
    			zIndex : 2000
    		});
    		setMarkerImageDaum(nodeMarker, getContextPath() + "/resources/images/realtime/ico_car_going.png");
			nearestObject.put(String(nearestSeq) + "_" + fastMarkers[i].tidId + "_node", nodeMarker);
			
			itemArray[nItemCnt] = { tidId: fastMarkers[i].tidId
									, dist: (Number(dist)/1000).toFixed(1)
									, cmNumber: fastMarkers[i].cmNumber
									, dbAddress: fastMarkers[i].dbAddress
									, driName:  fastMarkers[i].driName
									, driCel:  fastMarkers[i].driCel
									, offName: fastMarkers[i].offName
									, volt: fastMarkers[i].volt
									, gpsState: fastMarkers[i].gpsState
									, biOpFlag: fastMarkers[i].biOpFlag };
			nItemCnt++;
		}
	}

	itemArray.sort(function (a, b) {
	    if ( Number(a.dist) > Number(b.dist) )
	      return 1;
	    if (Number(a.dist) < Number(b.dist) )
	      return -1;
	    // a must be equal to b
	    return 0;
	});
	
	var mydata = new Array();
	
	for(var i=0; i<itemArray.length; i++){
		
		var s_cmNumber = itemArray[i].cmNumber;
		
		if(s_cmNumber == undefined || s_cmNumber == ""){
			s_cmNumber = nearestNoCarNumber;
		}
		
		var s_tidId = itemArray[i].tidId;
		var s_dist = itemArray[i].dist;
		
		var s_volt = itemArray[i].volt = "v";
		var s_gpsState = nearestGpsWrong;
		if(Number(itemArray[i].gpsState)>2){
			s_gpsState = nearestGpsGood;
		}
		
		var data = new Object();
		data.col1 = s_cmNumber;
        data.col2 = s_volt + "," + s_gpsState;
        data.col3 = s_dist;
        data.tidId = itemArray[i].tidId;
        
        mydata.push(data);
	}
	
	$("#list1 > tbody").html("");
	$("#list1").jqGrid("clearGridData");
	
	if(mydata.length > 0){
		for (var i = 0; i < mydata.length; i++){
	        $("#list1").jqGrid('addRowData', i + 1, mydata[i]);
	    }
	} else{
		$("#list1 > tbody").html("<tr><td align='center' colspan='3'>"+nearestSearchNoData+"</td></tr>");
	}
}


//지점 초기 폴리곤 설정 지점범위표시(20240802)
function setZoneArea(marker) {
  removeTempFence();
  
  var geom_fence = marker.geomFence;
  
  var dataRows = [{
    geom: geom_fence
  }];
  var features = new Array();
  for(var i=0; i<dataRows.length; i++) {      
  //dataRows.forEach(function (row) {
      //alert(row.geom.substring(row.geom.indexOf("("), row.geom.length));
      //var coords = row.geom.replace("(", "[").replace(")", "]").substring(row.geom.indexOf("("), row.geom.length);
      var coords = dataRows[i].geom.substring(dataRows[i].geom.indexOf("("), dataRows[i].geom.length).replace(/\(/gi, "").replace(/\)/gi, "");
      //alert(coords);
      features.push(coords);
  //});
  }
  var triangleCoords = [];
  
  var array = features[0].split(",");
  for(var i=0; i<array.length; i++) {
      var xycoord = array[i].replace(/^\s+/,"").replace(/ /, ",").split(",");
      triangleCoords.push(new daum.maps.LatLng(xycoord[1], xycoord[0]));
  }
  
  // Construct the polygon.
  pt_fence = new daum.maps.Polygon({
      paths: triangleCoords,
      strokeColor: '#5B67D9',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#5B67D9',
      fillOpacity: 0.2,
      //map: map,
      center: marker.getPosition(),
      zIndex : 100,
      draggable : false,
      editable: false
  });

  pt_fence.setMap(map);
  pt_fence.setPath(triangleCoords);
  
  //폴리곤 오브젝트 재설정
  objAreaPolygons = new s1_DistancePaint();
  for(var i=0; i<array.length; i++) {
      objAreaPolygons.put(i, pt_fence, 0);
  }
}