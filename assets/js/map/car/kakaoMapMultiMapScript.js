
var map = null;
var mc; // markercluster

var infowindow = new daum.maps.InfoWindow({
	map:map,
	removable:true,
	zIndex:2147483647
});

var mapCenterPosition = new daum.maps.LatLng(37.570335, 126.978243);	// 맵 센터

var g_NearestPreviewTimer = -1;

var g_clusterInfoTimer = -1;
var g_clusterObj = null;

var routeGeocoder = new daum.maps.services.Geocoder();;

//IE8 이하 버전용 마커표시 데이타 셋
var det_timeIE8 = new Array();
var det_speedIE8 = new Array();
var det_statusIE8 = new Array();
var det_gpsIE8 = new Array();
var det_worCodeIE8 = new Array();

var interval_arrow = 12;

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

function initialize(){
	
	var x = 33.113712 + (39.954758-33.113712)/2;
	var y = 124.612678 + (131.954758-124.612678)/2;

	var latlng = new daum.maps.LatLng(37.597354, 127.000137);

	var mapOptions = {
		center : latlng,
		level: 7 
	};
		
	map = window.map = new daum.maps.Map(document.getElementById('id_map_full'), mapOptions);

	// 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
	var mapTypeControl = new daum.maps.MapTypeControl();

	// 지도에 컨트롤을 추가해야 지도위에 표시됩니다
	// daum.maps.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOPRIGHT는 오른쪽 위를 의미합니다
	map.addControl(mapTypeControl, daum.maps.ControlPosition.TOPLEFT);
	
	// 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
	var zoomControl = new daum.maps.ZoomControl();
	map.addControl(zoomControl, daum.maps.ControlPosition.RIGHT);
	
	daum.maps.event.addListener(map, 'zoom_changed', function() {
		infowindow.close();
	});
	
	daum.maps.event.addListener(map, 'dragend', function() {
		
	});
	
	// 데이터 가져오기
	getDataLoad("", "all", "Y");
	
    startTimer();
}

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

/**
 * 사고/공사 마커 지우기
 * 
 * @param arrMarkers
 */
function clearMarkers(arrMarkers) {
	for ( var i = 0; i < arrMarkers.length; i++) {
		arrMarkers[i].setMap(null);
	}
	arrMarkers = [];
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
	
	duplicateMarkerCheck = new Array();
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
			
			var markerStyle = setMarkerImage(tmpBiOpFlag, tmpBiTurnOnoff, 0, tmpCarNumColor, tmpCarType, "N");
			
			if(fastMarkers_prev.length > 0){
				var iPrevFastMarkerIndex = fastMarkers_prev.hasMarker(marker);
				
				if(iPrevFastMarkerIndex > -1 && distance(fastMarkers_prev[iPrevFastMarkerIndex].carPos, marker.carPos) > 0){//이전 좌표가 있고 거리가 차이나는 경우
					// Marker 회전 아이콘 적용
//					markerStyle = setMarkerImage(tmpBiOpFlag, tmpBiTurnOnoff, getBearing(fastMarkers_prev[iPrevFastMarkerIndex].carPos, marker.carPos), marker.cmColor, marker.carType, "N");
//					marker.setIcon(markerStyle);
					
					// 이전 좌표 대비 방위각 셋팅
					marker.bearing = getBearing(fastMarkers_prev[iPrevFastMarkerIndex].carPos, marker.carPos);
					
					setMarkerImageDaum(marker, setMarkerImage(tmpBiOpFlag, tmpBiTurnOnoff, marker.bearing, marker.cmColor, marker.carType, "N"));
					
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
					
				} else{
					// 현재 좌표가 없거나 이전 좌표와 같은 위치인경우
					if(iPrevFastMarkerIndex > -1 && fastMarkers_prev[iPrevFastMarkerIndex].bearing > 0){ 
						markerStyle = setMarkerImage(tmpBiOpFlag, tmpBiTurnOnoff, fastMarkers_prev[iPrevFastMarkerIndex].bearing, marker.cmColor, marker.carType, "N");
						
						// 이전 좌표와 거리가 같은 경우 방위각 유지위해 설정
						marker.bearing = fastMarkers_prev[iPrevFastMarkerIndex].bearing;
					}
					
					setMarkerImageDaum(marker, markerStyle);
					
					/*
					if(fastMarkers_prev && fastMarkers_prev[iPrevFastMarkerIndex]) {
						marker.setImage(fastMarkers_prev[iPrevFastMarkerIndex].getImage());
						
						// 이전 좌표와 거리가 같은 경우 방위각 유지위해 설정
						marker.bearing = fastMarkers_prev[iPrevFastMarkerIndex].bearing;
					}
					*/
				}
				delete iPrevFastMarkerIndex;
			}else{
				setMarkerImageDaum(marker, markerStyle);				
			}
			
			fastMarkers.push(marker);
			
			daum.maps.event.addListener(marker, 'mouseover', (function(marker){
				return function(){
					
				}
			})(marker));
			
			daum.maps.event.addListener(marker, 'click', (function(marker){
				return function(){
					
				}
			})(marker));
			
			daum.maps.event.addListener(marker, 'mouseout', (function(marker){
				return function(){
					
				}
			})(marker));
			
		}
	}
	duplicateMarkerCheck = [];
	delete duplicateMarkerCheck;
}

function makeClusters(){
	var clusterOptions = {
			gridSize: 40,
			maxZoom: 4,
			zoomOnClick: false
	};
	mc = new MarkerClusterer(map, fastMarkers, fastOverlays, clusterOptions);
	mc.setMap(map);
	delete clusterOptions;
	
	daum.maps.event.addListener(mc, 'clusterclick', function(cluster) {
		var content = '';

		// Get markers
		var markers = cluster.getMarkers();

		map.setCenter(cluster.getCenter());

		// Marker Bounds 처리
		setMapBounds(markers);

		delete bounds, markers;
	}); 
}

function setMapBounds(markers) {
	
	var bounds = new daum.maps.LatLngBounds();
	
	// fastMarkers 차량
	for ( var i = 0; i < markers.length; i++) {
		bounds.extend(markers[i].carPos);
	}
	
	map.setBounds(bounds);
	
	delete bounds;
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
			
			var canvas= document.getElementById('canvas_'+marker.tidId);
		    var context= canvas.getContext('2d');
	    
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
 * 차량상세정보 infowindow
 * 
 * @param marker
 */
function showInfo(marker){
	var biTurnOnoff = marker.biTurnOnoff;
	var cmNumber = marker.cmNumber;
	var cmCarname = marker.carName;
	var tidId = marker.tidId;
	var gpsState = marker.gpsState;
	var address = marker.address;
	var volt = marker.volt;
	var tempA = marker.tempA;
	var tempAMin = marker.tempAMin;
	var tempAMax = marker.tempAMax;
	var tempB = marker.tempB;
	var tempBMin = marker.tempBMin;
	var tempBMax = marker.tempBMax;
	var pGrpId = marker.pGrpId;
	var pGrpName = marker.pGrpName;
	var grpid = marker.grpId;
	var grpName = marker.grpName;
	var gpsSpeed = marker.gpsSpeed;
	var driName = marker.driName;
	var avgSpeed = marker.avgSpeed;
	var driCel = marker.driCel;
	var driveMin = marker.driveMin;
	var contNo = marker.contNo;
	var dayDist = marker.dayDist;
	var rentDt = marker.rentDt;
	var rentEndDt = marker.rendEndDt;
	var totDist = marker.totDist;
	var lastTurnOn = marker.lastTurnOn;
	var lastTurnOff = marker.lastTurnOff;
	
//	if(cmNumber == undefined || cmNumber == ""){
//		cmCarname = "차량미등록[" + tidId + "]";
//	} else{
//		if(cmCarname == undefined || cmCarname == ""){
//			cmCarname = "차량명미등록[" + tidId + "]";
//		}
//	}
	
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
	
	var geocoder = new daum.maps.services.Geocoder();
	var coord = new daum.maps.LatLng(marker.carPos.getLat(),marker.carPos.getLng());
	
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
	
	htmls += '				<span>' + address + '</span>';
	htmls += '				<dl>';
	htmls += '					<dt>' + infoBattery + '</dt>';
	htmls += '					<dd>' + volt + 'v</dd>';
	htmls += '				</dl>';
	if(temperatureFlag == "Y"){
		htmls += '				<dl>';
		htmls += '					<dt>' + infoTempArea + '</dt>';
		htmls += '					<dd>' + tempA + '℃, ' + tempB + '℃</dd>';
		htmls += '				</dl>';
	}
	htmls += '			</div>';
	htmls += '		</div>';
//	htmls += '		<button class="close" data-dismiss="modal" type="button" aria-label="Close" onclick="closeInfoWindow();"></button>';
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
//	htmls += '						<th><span>' + infoGpsSpeed + '</span></th>';
//	htmls += '						<td><span>' + gpsSpeed + '㎞/h</span></td>';

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
		htmls += '						<td colspan="3"><span>' + rentPeriod + '</span></td>';
		htmls += '					</tr>';
		
	} else{
		
		htmls += '					<tr>';
		htmls += '						<th><span>' + infoTidId + '</span></th>';
		htmls += '						<td><span>' + tidId + '</span></td>';
		htmls += '						<th><span>' + infoTotDist + '</span></th>';
		htmls += '						<td><span>' + totDist + '㎞</span></td>';
		htmls += '					</tr>';

	}
	
	/*
	htmls += '					<tr>';
	if(rfFlag == "Y"){
		htmls += '						<th><span>' + infoPeriod + '</span></th>';
		htmls += '						<td><span>' + rentPeriod + '</span></td>';
		htmls += '						<th><span>' + infoTotDist + '</span></th>';
		htmls += '						<td><span>' + totDist + '㎞</span></td>';
	} else{
		htmls += '						<th><span></span></th>';
		htmls += '						<td><span></span></td>';
		htmls += '						<th><span>' + infoTotDist + '</span></th>';
		htmls += '						<td><span>' + totDist + '㎞</span></td>';
	}
	htmls += '					</tr>';
	*/
	
	htmls += '					<tr>';
	htmls += '						<th><span>' + infoLastOn + '</span></th>';
	htmls += '						<td><span>' + lastTurnOn + '</span></td>';
	htmls += '						<th><span>' + infoLastOff + '</span></th>';
	htmls += '						<td><span>' + lastTurnOn + '</span></td>';
	htmls += '					</tr>';
	if(temperatureFlag == "Y"){
		htmls += '					<tr>';
		htmls += '						<th><span>' + infoTempA + '</span></th>';
		htmls += '						<td><span>' + tempA + '℃<em class="font-gray">기준 ' + tempAMin + '℃ ~ ' + tempAMax + '℃</em></span></td>';
		htmls += '						<th><span>' + infoTempB + '</span></th>';
		htmls += '						<td><span>' + tempB + '℃<em class="font-gray">기준 ' + tempBMin + '℃ ~ ' + tempBMax + '℃</em></span></td>';
		htmls += '					</tr>';
	}
	htmls += '				</tbody>';
	htmls += '			</table>';
	htmls += '		</div>';
	htmls += '	</div>';
	htmls += '	<div class="pop-footer flex-end">';
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
	
	delete biTurnOnoff, cmNumber, cmCarname, tidId, gpsState, address, volt, tempA, tempAMin, tempAMax, tempB, tempBMin, tempBMax, grpName, gpsSpeed, driName;
	delete avgSpeed, driCel, driveMin, contNo, dayDist, rentDt, rentEndDt, totDist, lastTurnOn, lastTurnOff;
	
}

/**
 * 운행경로 그리기
 * 
 * @param operationList
 */
function drawTimeRoute(operationList){
	var prev_time;
	var cur_time;
	var linecolor;
	// var lineWidth = 5;
	var lineWidth = 7;
	
	var carPos = []; 
	var carPosIdx = [];
	
	var worCode = null;
	var det_speed = null;
	var det_status = null;
	var det_gps = null;
	var msg = null;
	
	var bounds = new daum.maps.LatLngBounds();
	
	var option_speed_color = $("#checkSpeedColor").is(":checked");
	if($.browser.msie){
		option_speed_color = false;
	}
	
	clearRoute();
	
	if(option_speed_color){

		var k = 0;
		carPos = [];
		
		for(var i = 0; i < operationList.length; i++) {
			worCode = operationList[i].worCode;
			
			var temperature = worCode.substr(6, 1);
			var temperature_abnormal = worCode.substr(7, 1);

			if( temperature != "1" && temperature_abnormal != "1" ){
				carPos[k] = new daum.maps.LatLng(operationList[i].biXPosition, operationList[i].biYPosition);
				carPosIdx[k] = i;
				k++;
			}
		}
		
		for(var i = 0; i < k; i++){
			
			worCode = operationList[carPosIdx[i]].worCode;
			
			var bi_time = operationList[carPosIdx[i]].biTime.substring(0,2) + ":" + operationList[carPosIdx[i]].biTime.substring(2,4) + ":" + operationList[carPosIdx[i]].biTime.substring(4,6);
			det_speed = operationList[carPosIdx[i]].biGpsSpeed;
			
			var temperature = worCode.substr(6, 1);
			var temperature_abnormal = worCode.substr(7, 1);
			
			det_status = operationList[carPosIdx[i]].biOpFlag;
			det_gps = operationList[carPosIdx[i]].biGpsState;
			msg = operationList[carPosIdx[i]].msg;
			
			//운행상태
			var txtStatus = "";
			if(det_status != "8" && det_status != "9" && det_status != "38") { txtStatus = txtSidongOn; }/* 시동on  */
			if(det_status == "38") { txtStatus = txtSidongOff; }/* 시동off */

			if(det_status == "5" ) { txtStatus = txtDeviceOn; }
			if(det_status == "8" || det_status == "9" ) { txtStatus = txtDeviceOff; }

			// 무단이동
			var bIllegallyMove = false; 
			
			if( det_status == "901" || det_status == "902"){
				bIllegallyMove = true;
				txtStatus = txtMessage01;
			}
			
			//GPS신호이상여부
			var txtGpsState = txtMessage11;/* GPS신호이상 */
			if(Number(det_gps) > 2) { txtGpsState = txtMessage12; }/* 정상 */
			
			//draw polyline
			if(i > 0 )
			{
				var LinePos = [carPos[i-1],carPos[i]];
				
				/* BGF 운행경로라인 개선 */
				if(det_speed < 30) linecolor = "#20CF24";
				else if(det_speed >= 30 && det_speed < 60) linecolor = "#0F88FD";
				else if(det_speed >= 60 && det_speed < 100) linecolor = "#B51AFD";
				if(det_speed > 100) linecolor = "#F70F0F";
				/* BGF 운행경로라인 개선 */
				
				if( bIllegallyMove == true ){
					linecolor = "#ff7200"; // #ffc500
					lineWidth = 7;
				}
				
				//init polyline object
				var polyLines = new daum.maps.Polyline({
					path: LinePos,
					strokeColor: linecolor,
					strokeOpacity: 1.0,
					strokeWeight: lineWidth
				});

				applySetArrowInterval();
				//drawing interval(arrow symbol)
				if(i % interval_arrow == 0){	
					if( carPos[carPosIdx[i-1]] != null && carPos[carPosIdx[i]] != null ){
						var p1 = map.getProjection().fromLatLngToPoint(carPos[carPosIdx[i-1]]);
						var p2 = map.getProjection().fromLatLngToPoint(carPos[carPosIdx[i]]);

						if( carPos[carPosIdx[i+1]] != null ){
							var p3 = map.getProjection().fromLatLngToPoint( carPos[carPosIdx[i+1]] );
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
						var icon = addIcon("dir_" + dir + ".png");
						var op_flag =  operationList[carPosIdx[i]].biOpFlag;

						if( op_flag == "901" || op_flag == "902") { 
							icon = addIcon("../arrow.png");
						}
						
						var marker = new daum.maps.Marker({
							position : carPos[i],
							map : map,
							zIndex: 2147,
							image : icon,
							title: bi_time + "\n" + det_speed + "km/h",
							clickable : true
						});
					
						setInfowindowPolylineTarget(String(  operationList[carPosIdx[i]].biTime  ), marker, bi_time, carPos[i], det_speed, txtStatus, txtGpsState);

						//put a polyline to array object
//						polyLinesArray.push(marker);
						oddoverlays.push(marker);
					}
				}
				
				//draw polylines(setMap)
				polyLines.setMap(map);

				//put a polyline to array object
				polyLinesArray.push(polyLines)
					
				//set polyline events
				setInfowindowPolylineTarget(String(  operationList[carPosIdx[i]].biTime  ), polyLines, bi_time, carPos[i], det_speed, txtStatus, txtGpsState);

			}

			//맵바운더리 설정
			bounds.extend(carPos[i]);
		}
		
		for(var i = 0; i < operationList.length; i++){
			
			worCode = operationList[i].worCode;
			
			var bi_time = operationList[i].biTime.substring(0,2) + ":" + operationList[i].biTime.substring(2,4) + ":" + operationList[i].biTime.substring(4,6);

			carPos[i] = new daum.maps.LatLng(operationList[i].biXPosition, operationList[i].biYPosition);
			var x_coord = operationList[i].biXPosition;
			var y_coord = operationList[i].biYPosition;
			
			det_speed = operationList[i].biGpsSpeed;
			det_status = operationList[i].biOpFlag;
			det_gps = operationList[i].biGpsState;
			msg = operationList[i].msg;
			
			// ======= Area -01 start ======
			
			//운행상태
			var txtStatus = "";
			if(det_status != "8" && det_status != "9" && det_status != "38") { txtStatus = txtSidongOn; }/* 시동on  */
			if(det_status == "8" || det_status == "9" || det_status == "38") { txtStatus = txtSidongOff; }/* 시동off */
			
			if(det_status == "5" ) { txtStatus = txtDeviceOn; }
			if(det_status == "8" || det_status == "9" ) { txtStatus = txtDeviceOff; }
			
			//GPS신호이상여부
			var txtGpsState = txtMessage11;/* GPS신호이상 */
			if(Number(det_gps) > 2) { txtGpsState = txtMessage12; }/* 정상 */
	
			//set odd markers (worCode ex : 000001)=> 0000010000
			var worText = "";
			var worIcon = "";
			if(worCode.indexOf("1") != -1) 
			{
				var overSpeed = worCode.substr(0, 1);
				var quickBreaking = worCode.substr(1, 1);
				var quickOverSpeed = worCode.substr(2, 1);
				var noLoadRotation = worCode.substr(3, 1);
				var impact = worCode.substr(4, 1);
				var emergency = worCode.substr(5, 1);
				
				var temperature = worCode.substr(6, 1);
				var temperature_abnormal = worCode.substr(7, 1);
				
				if(overSpeed == "1")
				{
					worText = txtMessage23;/* 과속 */
					worIcon = getContextPath() + "/resources/images/realtime/ico_error_01.png";
				}
				if(quickBreaking == "1")
				{
					worText = txtMessage24;/* 급감속 */
					worIcon = getContextPath() + "/resources/images/realtime/ico_error_03.png";
				}
				if(quickOverSpeed == "1")
				{
					worText = txtMessage25;/* 급가속 */
					worIcon = getContextPath() + "/resources/images/realtime/ico_error_02.png";
				}
				if(noLoadRotation == "1")
				{
					worText = txtMessage26;/* 공회전 */
					worIcon = getContextPath() + "/resources/images/realtime/ico_error_05.png";
				}
				if(impact == "1")
				{
					worText = txtMessage27;/* 충격 */
					worIcon = getContextPath() + "/resources/images/realtime/ico_error_04.png";
				}
				if(emergency == "1")
				{
					worText = txtMessage28;/* 비상 */
					worIcon = getContextPath() + "/resources/images/realtime/ico_error_06.png";
				}
				
				if( temperature == "1" || temperature_abnormal == "1" ){
					if( worText != "" )
						worText = worText + "|" + msg;
					else
						worText = msg;
					
					if( worText.indexOf("위반") > -1 ){
						worIcon = getContextPath() + "/resources/images/realtime/ico_event_temp01.png";
					} else {
						worIcon = getContextPath() + "/resources/images/realtime/ico_event_temp01.png";
					}
				}
				
				var oddMarker = null; 
				if(  temperature == "1" || temperature_abnormal == "1"  ){
					if( worText.indexOf("위반") > -1 ){
						
						if(  (/^0.0/).test(x_coord) == false && (/^0.0/).test(x_coord)  == false ){
							oddMarker = new daum.maps.Marker({position:carPos[i], map:map, flat:true, icon: worIcon});
							oddoverlays.push(oddMarker);
							setOddMarkerTarget(String( operationList[i].biTime ), oddMarker, carPos[i], worText, worIcon, bi_time, det_speed, txtStatus, txtGpsState);
						}
					}
				} else {
					
					// 충격/비상 이벤트 제외시킴 
					if(impact != "1"){		// mijurang 20150925 화약 비상
						oddMarker = new daum.maps.Marker({position:carPos[i], map:map, flat:true, icon: worIcon});
						
						//put a oddmarker to array object
						oddoverlays.push(oddMarker);
						
						//set oddmarker events
						setOddMarkerTarget(String( operationList[i].biTime ), oddMarker, carPos[i], worText, worIcon, bi_time, det_speed, txtStatus, txtGpsState);
					}
				}
																
			}

			var marker_start = getContextPath() + "/resources/images/"+getLangset()+"/realtime/start_01.png"; //출발
			var marker_end = getContextPath() + "/resources/images/"+getLangset()+"/realtime/arrival_01.png"; //도착
			
			//start, end 마커 표시
			var marker = new daum.maps.Marker({position:carPos[0], map:map, flat:true, zIndex:214750});
			setMarkerImageDaum(marker, marker_start);
			oddoverlays.push(marker);
			
			marker = new daum.maps.Marker({position:carPos[operationList.length-1], map:map, flat:true, zIndex:214750});
			setMarkerImageDaum(marker, marker_end);
			oddoverlays.push(marker);
			// ======= Area -01 end ======
			//}
		}
		
		//맵 바운더리 초기화
		map.setBounds (bounds);
		
	} else{

		var k = 0;
		carPos = [];

		for(var i = 0; i < operationList.length; i++){
			worCode = operationList[i].worCode;
			
			det_speed = operationList[i].biGpsSpeed;
			det_status = operationList[i].biOpFlag;
			det_gps = operationList[i].biGpsState;
			var temperature = worCode.substr(6, 1);
			var temperature_abnormal = worCode.substr(7, 1);
			
			
			if( temperature != "1" && temperature_abnormal != "1" ){
				carPos[k] = new daum.maps.LatLng(operationList[i].biXPosition, operationList[i].biYPosition);
				carPosIdx[k] = i;
				k++;
			}
			
		}
		
		for(var i = 0; i < k; i++){
			
			worCode =operationList[carPosIdx[i]].worCode;
			
			det_timeIE8[i] = operationList[carPosIdx[i]].biTime.substring(0,2) + ":" + operationList[carPosIdx[i]].biTime.substring(2,4) + ":" + operationList[carPosIdx[i]].biTime.substring(4,6);

			var x_coord = operationList[carPosIdx[i]].biXPosition;
			var y_coord = operationList[carPosIdx[i]].biYPosition;
			
			det_speedIE8[i] = operationList[carPosIdx[i]].biGpsSpeed;
			det_statusIE8[i] = operationList[carPosIdx[i]].biOpFlag;
			det_gpsIE8[i] = operationList[carPosIdx[i]].biGpsState;
			det_worCodeIE8[i] = operationList[carPosIdx[i]].worCode;

			//운행상태
			var txtStatus = "";
			if(det_statusIE8[i] != "8" && det_statusIE8[i] != "9" && det_statusIE8[i] != "38") { txtStatus = txtSidongOn; }/* 시동on  */
			if(det_statusIE8[i] == "8" || det_statusIE8[i] == "9" || det_statusIE8[i] == "38") { txtStatus = txtSidongOff; }/* 시동off */
			
			if(det_statusIE8[i] == "5" ) { txtStatus = txtDeviceOn; }
			if(det_statusIE8[i] == "8" || det_statusIE8[i] == "9" ) { txtStatus = txtDeviceOff; }
			
			//GPS신호이상여부
			var txtGpsState = txtMessage11;/* GPS신호이상 */
			if(Number(det_gpsIE8[i]) > 2) { txtGpsState = txtMessage12; }/* 정상 */
			
			//set odd markers (worCode ex : 000001)
			var worText = "";
			var worIcon = "";
			if(det_worCodeIE8[i].indexOf("1") != -1) 
			{
				var overSpeed = det_worCodeIE8[i].substr(0, 1);
				var quickBreaking = det_worCodeIE8[i].substr(1, 1);
				var quickOverSpeed = det_worCodeIE8[i].substr(2, 1);
				var noLoadRotation = det_worCodeIE8[i].substr(3, 1);
				var impact = det_worCodeIE8[i].substr(4, 1);
				var emergency = det_worCodeIE8[i].substr(5, 1);

				var temperature = det_worCodeIE8[i].substr(6, 1);
				var temperature_abnormal = det_worCodeIE8[i].substr(7, 1);
				
				if(overSpeed == "1")
				{
					worText = txtMessage23;/* 과속 */
					worIcon = getContextPath() + "/resources/images/realtime/ico_error_01.png";
				}
				if(quickBreaking == "1")
				{
					worText = txtMessage24;/* 급감속 */
					worIcon = getContextPath() + "/resources/images/realtime/ico_error_03.png";
				}
				if(quickOverSpeed == "1")
				{
					worText = txtMessage25;/* 급가속 */
					worIcon = getContextPath() + "/resources/images/realtime/ico_error_02.png";
				}
				if(noLoadRotation == "1")
				{
					worText = txtMessage26;/* 공회전 */
					worIcon = getContextPath() + "/resources/images/realtime/ico_error_05.png";
				}
				if(impact == "1")
				{
					worText = txtMessage27;/* 충격 */
					worIcon = getContextPath() + "/resources/images/realtime/ico_error_04.png";
				}
				if(emergency == "1")
				{
					worText = txtMessage28;/* 비상 */
					worIcon = getContextPath() + "/resources/images/realtime/ico_error_06.png";
				}

				// 충격/비상 이벤트 제외시킴 
				// mijurang 20150925 화약 비상		if(impact != "1" && emergency != "1" ){
				if(impact != "1"){		// mijurang 20150925 화약 비상
					//init oddMarker
					var oddMarker = new daum.maps.Marker({position:carPos_new, map:map, flat:true, zIndex: 214750});
					setMarkerImageDaum(oddMarker, worIcon);
					
					//put a oddmarker to array object
					oddoverlays.push(oddMarker);
					
					//set oddmarker events
					setOddMarkerTarget(String( operationList[carPosIdx[i]].biTime), oddMarker, carPos[i], worText, worIcon, det_timeIE8[i], det_speedIE8[i], txtStatus, txtGpsState);
					
				}
				
			}
			
			//맵바운더리 설정
			bounds.extend(carPos[i]);
		}
		
		applySetArrowInterval();
		//지도 polyline 그리기 (정의된 prototype 사용)
		var polyIE8 = new BDCCArrowedPolylineInterval(carPos, "#FF0000", 3, 0.8, null, 60, 6, "#FF0000", 3, 0.8, det_timeIE8, det_speedIE8, det_statusIE8, det_gpsIE8, interval_arrow);
		
		//맵 바운더리 초기화
		map.setBounds (bounds);

		var marker_start = getContextPath() + "/resources/images/"+getLangset()+"/realtime/start_01.png"; //출발
		var marker_end = getContextPath() + "/resources/images/"+getLangset()+"/realtime/arrival_01.png"; //도착
		
		//start, end 마커 표시
		var marker = new daum.maps.Marker({position:carPos[0], map:map, flat:true, zIndex:214750});
		setMarkerImageDaum(marker, marker_start);
		oddoverlays.push(marker);
		
		marker = new daum.maps.Marker({position:carPos[operationList.length-1], map:map, flat:true, zIndex:214750});
		setMarkerImageDaum(marker, marker_end);
		
		for(var i = 0; i < operationList.length; i++){

			var det_worCode_new = operationList[i].worCode;
			
			if( det_worCode_new == null || det_worCode_new == undefined) 
				break;
			
			var temperature = det_worCode_new.substr(6, 1);
			var temperature_abnormal = det_worCode_new.substr(7, 1);
			msg = operationList[i].msg;
			
			// ======= Area -02 start ======
		
			var carPos_new = new daum.maps.LatLng(operationList[i].biXPosition, operationList[i].biYPosition);
			
			var x_coord = operationList[i].biXPosition;
			var y_coord = operationList[i].biYPosition;
			
			var det_time_new = operationList[i].biTime.substring(0,2) + ":" + operationList[i].biTime.substring(2,4) + ":" + operationList[i].biTime.substring(4,6);
			
			var det_speed_new = operationList[i].biGpsSpeed;
			var det_status_new = operationList[i].biOpFlag;
			var det_gps_new = operationList[i].biGpsState;
			
			var det_worCode_new = operationList[i].worCode;

			
			//운행상태
			var txtStatus = "";
			if(det_status_new != "8" && det_status_new != "9" && det_status_new != "38") { txtStatus = txtSidongOn; }/* 시동on  */
			if(det_status_new == "8" || det_status_new == "9" || det_status_new == "38") { txtStatus = txtSidongOff; }/* 시동off */
			
			if(det_status_new == "5" ) { txtStatus = txtDeviceOn; }
			if(det_status_new == "8" || det_status_new == "9" ) { txtStatus = txtDeviceOff; }
			
			//GPS신호이상여부
			var txtGpsState = txtMessage11;/* GPS신호이상 */
			if(Number(det_gps_new) > 2) { txtGpsState = txtMessage12; }/* 정상 */
			
			var worText = "";
			var worIcon = "";
					
			worText = msg;
			
			if( worText.indexOf("위반") > -1 ){
				worIcon = getContextPath() + "/resources/images/realtime/ico_event_temp01.png";
			} else {
				worIcon = getContextPath() + "/resources/images/realtime/ico_event_temp01.png";
			}

			if( worText.indexOf("위반") > -1 ){
			
				if(  (/^0.0/).test(x_coord) == false && (/^0.0/).test(x_coord)  == false ){
					
					//init oddMarker
					var oddMarker = new daum.maps.Marker({position:carPos_new, map:map, flat:true, zIndex: 214750});
					
					//put a oddmarker to array object
					oddoverlays.push(oddMarker);
				
					//set oddmarker events
					setOddMarkerTarget(String( operationList[carPosIdx[i]].biTime ), oddMarker, carPos_new, worText, worIcon, det_time_new, det_speed_new, txtStatus, txtGpsState);
					
				}
			}

			// ======= Area -02 end ======
		}
		
		delete det_timeIE8;
		delete det_speedIE8;
		delete det_statusIE8;
		delete det_gpsIE8;
		delete det_worCodeIE8;
		// IE9 이하의 버전 체크 IF
	}
	
}

function addIcon(file){
	var icon = {
		url : getContextPath() + "/resources/images/realtime/path_img/" + file,
		size : new daum.maps.Size(24, 24),
		anchor : new daum.maps.Point(12, 12)
	};
	return icon;
}

//polyline events
function setInfowindowPolylineTarget(tgt_id, polyline, bi_time, carPos, det_speed, det_status, det_gps)
{
	daum.maps.event.addListener(polyline, 'click', function() {
		routeGeocoder.coord2Address(carPos.getLng(), carPos.getLat(), function(results, status) {
			var strHtml = "";
			
			if(status == daum.maps.services.Status.OK)
			{
				strHtml = getMessageForm(bi_time, carPos, det_speed, det_status, det_gps, "", results[0].formatted_address, status);
			}
			else 
			{
				strHtml = getMessageForm(bi_time, carPos, det_speed, det_status, det_gps, "", "", status);
			}
			
//			scrollToTarget(tgt_id);
				
			routeInfowindow.setContent(strHtml);
			routeInfowindow.setPosition(carPos);
			routeInfowindow.open(map);
		});
	});
	
}

//이벤트 마커 생성
function setOddMarkerTarget(tgt_id, oddMarker, carPos, worText, worIcon, bi_time, det_speed, det_status, det_gps)
{
	daum.maps.event.addListener(oddMarker, 'click', function() {
		routeGeocoder.coord2Address(carPos.getLng(), carPos.getLat(), function(results, status) {
			var strHtml = "";
			
			if(status == daum.maps.services.Status.OK)
			{
				strHtml = getMessageForm(bi_time, carPos, det_speed, det_status, det_gps, worText, results[0].formatted_address, status);
			}
			else 
			{
				strHtml = getMessageForm(bi_time, carPos, det_speed, det_status, det_gps, worText, "", status);
			}
			
//			scrollToTarget(tgt_id);
			
			routeInfowindow.setContent(strHtml);
			routeInfowindow.setPosition(carPos);
			routeInfowindow.open(map);
		});
	});
}

/**
 * 사고/공사 보기
 */
function showEventsView(){
	daum.maps.event.addListener(map, 'zoom_changed', function() {
		infowindow.close();
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
		infowindow.close();
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
		strHtml +="<div id=\"divCCTVContent\" style=\"padding-top:10px;width:320px;height:270px\"> ";
		strHtml +=" <span style='font-weight:bold;'>"+CCTVName+"</span>";
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
		marker.useYn = placeList[i].useYn;
		marker.commonYn = placeList[i].commonYn;
		marker.imgUrl = markerStyle;
		
		marker.geo_enable = true;
		
		placeMarkersMap.put(marker.geoId, marker);
		placeLabelsMap.put(marker.geoId, customOverlay);

		daum.maps.event.addListener(marker, 'click', (function(marker){
			return function() {
				drawFence(marker, true);
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









