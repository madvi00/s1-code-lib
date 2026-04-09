var kakaoMap;
var geocoder;
var is_fitbound = false;
var fastMarkers = [];
var fastMarkerlabels = [];

var pt_marker = null;
var pt_label = null;
var pt_fence = null;

function initialize(data) {
	
	initPlaceIcon();
	
	var x = 33.113712 + (39.954758-33.113712)/2;
	var y = 124.612678 + (131.954758-124.612678)/2;
	
	var latlng = new daum.maps.LatLng(37.597354, 127.000137);
	var mapOptions = { 
		center : latlng,
		level: 7 
	}
  	kakaoMap = new daum.maps.Map(document.getElementById('map_canvas'), mapOptions);
	
	// Zoom 컨트롤 
	var control = new daum.maps.ZoomControl();
	kakaoMap.addControl(control, daum.maps.ControlPosition.TOPRIGHT);
	
	// mapType 컨트롤 
	var mapTypeControl = new daum.maps.MapTypeControl();
	// 지도 오른쪽 위에 지도 타입 컨트롤이 표시되도록 지도에 컨트롤을 추가한다.
	kakaoMap.addControl(mapTypeControl, daum.maps.ControlPosition.TOPRIGHT);
	
	geocoder = new daum.maps.services.Geocoder();
	
	
	//로드뷰 컨트롤 만들어서 삽입하기
	/* var rvContainer = document.getElementById('id_roadview'); //로드뷰를 표시할 div
	
	//지도에 클릭 이벤트를 할당한다.
	daum.maps.event.addListener(map, 'click', function(e){
		if( IsRoadView ) {
			var position = e.latLng; //현재 클릭한 부분의 좌표를 리턴
			toggleRoadview(position); //로드뷰를 본다.
		}
	});
	
	// 직접 코드로 생성하는 것은 좋지않다. jsp에 넣자. 
	var htmls =  ' <div id=\"btnRoadviewWrapper\" class=\"custom_typecontrol radius_border\"> \n';
		htmls += '   <span id=\"btnRoadview\" class=\"btn\" >로드뷰</span> \n';
		htmls += ' </div>';
	$('#id_map_full').append(htmls);
	
	//로드뷰 토글
	var  btnRoad = $('#btnRoadview');
	btnRoad.click( function(e) {
		if( IsRoadView ) {			
			hide_roadview();
			
			IsRoadView = false;
			
			$('#btnRoadviewWrapper').css( {'top':'30px', 'right':'30px', 'width':'45px'});												
			$('#btnRoadview').text('로드뷰');
			btnRoad.attr('class', 'btn');
			
		} else {
			IsRoadView = true;
			btnRoad.attr('class', 'selected_btn');
			
			show_roadview();
		}		
	}); */

	
	function hide_roadview() {
		kakaoMap.removeOverlayMapTypeId(daum.maps.MapTypeId.ROADVIEW);
		
		var mapWrapper = document.getElementById('mapWrapper'); //지도를 감싸고 있는 DIV태그
		var rvWrapper = document.getElementById('rvWrapper'); //로드뷰 div
		
		rvWrapper.style.display = 'none'; //로드뷰를 넣은 컨테이너를 숨김니다.
		mapWrapper.style.display = 'block';
		
		kakaoMap.relayout();	
		$(".remocon_area").css('display', 'block');
		
		delete rvClient, rv;
		rvClient=null; rv = null;
	}

	function show_roadview() {
		kakaoMap.addOverlayMapTypeId(daum.maps.MapTypeId.ROADVIEW); //지도 위에 로드뷰 도로 올리기
		
		rv = new daum.maps.Roadview(rvContainer, {showToolBar :true}); //로드뷰 객체
		rvClient = new daum.maps.RoadviewClient(); //좌표로부터 로드뷰 파노ID를 가져올 로드뷰 helper객체
	}

	//로드뷰 Div 출력 함수
	function toggleRoadview(position){
		//return;	
		var mapWrapper = document.getElementById('mapWrapper'); //지도를 감싸고 있는 DIV태그
		var rvWrapper = document.getElementById('rvWrapper'); //로드뷰 div
		
		//전달받은 좌표(position)에 가까운 로드뷰의 panoId를 추출하여 로드뷰를 띄운다.
		rvClient.getNearestPanoId(position, 500, function(panoId) {
			if (panoId === null) {
				return;
			} else {			
				$('#btnRoadviewWrapper').css( {'top':'2px', 'right':'2px', 'width':'20px'});												
				$('#btnRoadview').text('X');
				
				mapWrapper.style.display = 'none'; 
				rvWrapper.style.display = 'block';
				
				rv.setPanoId(panoId, position); //panoId를 통한 로드뷰 실행
				rv.relayout(); 	//로드뷰를 감싸고 있는 영역이 변경됨에 따라, 로드뷰를 재배열한다.		
				
				$(".remocon_area").css('display', 'none');
			}
		});
	}

	delete mapOptions;

	
	is_fitbound = true;
	is_draggable = false;
	
	getPlaceData(data);
	
//	setPageDefault();
	
	document.getElementById('addressInput').onkeypress = function(e){
	    if (!e) e = window.event;
	    var keyCode = e.keyCode || e.which;
	    if (keyCode == '13'){
			onSearchAddress();
			return false;
	    }
	}
}

function onSearchAddress(){
	var geocoder = new daum.maps.services.Geocoder();
	var address = document.getElementById("addressInput").value;

	//geocoder.addr2coord( address, function(status, result) {
	geocoder.addressSearch( address, function(result, status) {

		if (status == daum.maps.services.Status.OK) {
			var addr_item = result[0];
			
			var coords = new daum.maps.LatLng(addr_item.y, addr_item.x);
			kakaoMap.setLevel(4);
			kakaoMap.setCenter(coords);
			
			onPlaceAddConfig();
			
		} else {
			alert(messageNoAddressResult);
	//		html = getInitResultContents();
	//		$("#searchAddrList").html = "";
	//		$("#searchAddrList").html( html );
		}
	});
}

function onPlaceAddConfig(){
//	$("#geo_func_right_add").show();
	//$("#geo_func_right_savepos").show();
	//$("#geo_func_right_delete").hide();
	//$("#geo_func_right_cancelpos").show();
	
	//var zoom = map.getLevel();
	var marker = addNewMarker();	
	dragendMarker(marker);	
	//map.setLevel(zoom);
	
	clickMarker(marker);	

	if(objAreaPolygons != null) {
		objAreaPolygons = null;
	}
}

var c_default_radius = 300;
var c_detect_type = 0;

function addNewMarker() {

	//refreshTargetInfo();
	
	var c = kakaoMap.getCenter();

	var location = new daum.maps.LatLng(c.getLat(), c.getLng() );

	var marker_carmoving_pick = getContextPath()+"/resources/images/"+getLangset()+"/realtime/ico_new_16.png";
	var marker_carmoving_pick_pt = getContextPath()+"/resources/images/"+getLangset()+"/realtime/now_place.png";
	
	if( pt_marker != null )
		pt_marker.setMap(null);

	// if( pt_label != null )
		// pt_label.setMap(null);
	
	pt_marker = new daum.maps.Marker({
		position : location,
		map : kakaoMap,		
		zIndex : 50000,
		draggable : true,
		clickable : true
	});
	setMarkerImage(pt_marker, marker_carmoving_pick_pt);
	
	pt_marker.geo_id = 0;
	pt_marker.geo_name = messageMarkerNew;
	pt_marker.geo_rmk = "";
	pt_marker.geo_class = 1;
	pt_marker.geo_class_name = messageMarkerClassName;
	pt_marker.x_coord = pt_marker.getPosition().getLng();
	pt_marker.y_coord = pt_marker.getPosition().getLat();
	pt_marker.geo_addr = "";
	pt_marker.geo_radius = defaultRadius ;
	pt_marker.detect_type = defaultDetectType;
	pt_marker.sms_grp_id = defaultSmsGrpId;
	pt_marker.new_flag = true;
	
	pt_marker.api_key = "";
	pt_marker.geo_max_speed = "";
	
	dragendLabel(pt_marker);
	 
	daum.maps.event.addListener(pt_marker, 'dragend', (function(marker) {
		return function() {			
			dragendMarker(marker);
//			clickMarker(marker);
//			infowindow.close();
			//dragendLabel(marker);
		}
	})(pt_marker));

	daum.maps.event.addListener(pt_marker, 'click', (function(marker) {
		return function() {
			clickMarker(marker);
		}
	})(pt_marker));	
	
	kakaoMap.setLevel(5);	
	kakaoMap.setCenter(location);
    
    
    return pt_marker;
 }

function dragendLabel(marker) {
 	if( pt_label != null )
		pt_label.setMap(null);
		
	var dwidth = //Number($("#checkWidth").width());
		marker.geo_name.length*10;
	dwidth = (dwidth * -1)/2;
	
	//alert(cmNum);
	
	var labelHtml = "<div style='position:relative;z-index:1010;background-color:white;border:0px solid #555;'>";
	if(navigator.appVersion.indexOf("MSIE 8.0") != -1){
   		labelHtml +=  "<div style='position:absolute;top:10px;left:"
   						+(dwidth)
   						+"px;text-align:center;height:20px;background-color:white;box-shadow:10px 10px 10px silver;-moz-box-shadow:10px 10px 10px silver;-webkit-box-shadow:10px 10px 10px silver;border:1px solid #555;'><p class='marker_name'>"
   						+marker.geo_name
   						+"</p></div>";
	}else if(navigator.appVersion.indexOf("safari") != -1){
		labelHtml +=  "<div style='position:absolute;top:-20px;left:"
						+(dwidth)
						+"px;text-align:center;height:20px;background-color: white;box-shadow:10px 10px 10px silver;-moz-box-shadow:10px 10px 10px silver;-webkit-box-shadow:10px 10px 10px silver;border:1px solid #555;'><p class='marker_name'>"
						+marker.geo_name
						+"</p></div>";
	}else{
		labelHtml +=  "<div style='position:absolute; top:10px;left:"
						+(dwidth+6)
						+"px;text-align:center;height:20px;background-color: white;box-shadow:10px 10px 10px silver;-moz-box-shadow:10px 10px 10px silver;-webkit-box-shadow:10px 10px 10px silver;border:1px solid #555;'><p class='marker_name'>"
						+marker.geo_name
						+"</p></div>";
	}
    labelHtml += "</div>";

	var label_opt = {
			pos: marker.getPosition(),
			text: labelHtml,
			visible : marker.getVisible(),
			top: 30, 
			left: -2,
			zIndex: 555100
		};
	pt_label = new Label( this.map, label_opt );
 }

function drawFence(marker){
	removeTempFence();
	var populationOptions = {
		      strokeColor: "#58a240",
		      strokeOpacity: 0.8,
		      strokeWeight: 2,
		      fillColor: "#58a240",
		      fillOpacity: 0.3,
		      map: kakaoMap,
		      center: marker.getPosition(),
			  zIndex : 100,
		      radius: Number(marker.geo_radius) * 1.1
		    };
   pt_fence = new daum.maps.Circle(populationOptions);
   
   //pt_fence.bindTo('center', marker, 'position');
   //pt_fence.set('zIndex', 1010);
   //pt_fence.bindTo('visible', marker);
   
}


function getPlaceData(data) {

	clearOverlays();

	fastMarkers = new Array();
	
	makeMarkers(data);
	if( is_fitbound == true ) {
		setMapBounds(fastMarkers);
	}
}

function clearOverlays() {
	for ( var i = 0; i < fastMarkers.length; i++)
		fastMarkers[i].setMap(null);
	fastMarkers = [];
	delete fastMarkers;

	for ( var i = 0; i < fastMarkerlabels.length; i++)
		fastMarkerlabels[i].setMap(null);
	fastMarkerlabels = [];
	delete fastMarkerlabels;
}

function makeMarkers(jsonContentsList){
	for ( var i = 0; i < jsonContentsList.length; i++) {

		var geo_pos = new daum.maps.LatLng(
				jsonContentsList[i].yCoord,
				jsonContentsList[i].xCoord);
		var geo_name = jsonContentsList[i].geoName;
		var geo_class = jsonContentsList[i].geoClass;

		var common_yn = jsonContentsList[i].commonYn;
     
		var RMK_Map_YN = jsonContentsList[i].rmkMapYn;
        var GEO_RMK = jsonContentsList[i].geoRmk;
        
        //제목
		var title = geo_name + "\n(" + jsonContentsList[i].geoAddr + ")";
		
		//비고 표시
		if(RMK_Map_YN == 'Y' && GEO_RMK) {
			title += "\n" + GEO_RMK;
            //var marker_style = setPlaceMarkerImageName(geo_class, false, geo_name + '\n' + GEO_RMK, common_yn);
        }
        else{
			//var marker_style = setPlaceMarkerImageName(geo_class, false, geo_name, common_yn);
        }
		
		var marker = null;
		
		if( is_draggable == true ){
			marker = new daum.maps.Marker({
				position : geo_pos,
				map : kakaoMap,
				title : title,
				draggable : true,
				clickable : true,
				zIndex : i+1000
			});
//			setMarkerImage(marker, marker_style);
			setMarkerImage(marker, getContextPath() + "/resources/images/realtime/new_ico/" + mapPlaceIcon.get(Number(jsonContentsList[i].geoClass)) + ".png");
			
		} else {
			marker = new daum.maps.Marker({
				position : geo_pos,
				map : kakaoMap,				
				title : title,
				draggable : false,
				clickable : true,
				zIndex : i+1000
			});
//			setMarkerImage(marker, marker_style);
			setMarkerImage(marker, getContextPath() + "/resources/images/realtime/new_ico/" + mapPlaceIcon.get(Number(jsonContentsList[i].geoClass)) + ".png");
			
		}

		marker.index = i;

		marker.geo_id = jsonContentsList[i].geoId;
		marker.geo_name = jsonContentsList[i].geoName;
		marker.geo_rmk = jsonContentsList[i].geoRmk;
		marker.geo_class = jsonContentsList[i].geoClass;
		marker.geo_class_name = jsonContentsList[i].geoClassName;
		marker.x_coord = jsonContentsList[i].xCoord;
		marker.y_coord = jsonContentsList[i].yCoord;
		marker.geo_addr = jsonContentsList[i].geoAddr;
		marker.geo_radius = jsonContentsList[i].geoRadius;
		marker.geo_noti_yn = jsonContentsList[i].geoNotiYn;
		marker.use_yn = jsonContentsList[i].USE_YN;
		marker.common_yn = jsonContentsList[i].commonYn;
		marker.edit_uder_id = jsonContentsList[i].editUserId;
		marker.detect_type = jsonContentsList[i].detectType;
		marker.geom_fence = jsonContentsList[i].geomFence;
		marker.sms_grp_id = jsonContentsList[i].smsGrpId;
		marker.rmk_map_yn = jsonContentsList[i].rmkMapYn;
		marker.new_flag = false;
		marker.off_key = jsonContentsList[i].offKey;
		
		marker.api_key = jsonContentsList[i].apiKey;
		if (jsonContentsList[i].geoMaxSpeed == 0) {
			marker.geo_max_speed = "";
		} else {
			marker.geo_max_speed = jsonContentsList[i].geoMaxSpeed;
		}

		fastMarkers.push(marker);
		
	    daum.maps.event.addListener(marker, 'dragend', (function(marker) {
			return function() {				
				dragendMarker(marker);
				objAreaPolygons=null;
				marker.geom_fence = null;
				drawFence(marker);
			}
		})(marker));

		//클로저
		daum.maps.event.addListener(marker, 'click', (function(marker) {
			return function() {
				clickMarker(marker);
			}
		})(marker));
		
//		if(updateFlag && refreshMarker != null) {
//			if(marker.geo_id == refreshMarker.geo_id) {
//				infowindow.close();
//				refreshMarker = marker;
//			}
//		}
	}
	
//	if(updateFlag && refreshMarker != null) {
//		clickMarker(refreshMarker);
//		updateFlag = false;
//	}
}

function setMapBounds(markers) {
		if( markers.length == 0 ){
		 	var center = new daum.maps.LatLng( 33.1137120675166 + (39.954758672386 - 33.1137120675166) /2, 124.612678624038 + ( 131.954758672386 - 124.612678624038)/2 );
			kakaoMap.setCenter(center);
		} else {
			var bounds = new daum.maps.LatLngBounds();
			var x_coord = 0;
			var y_coord = 0;
			for ( var i = 0; i < markers.length; i++){
				x_coord = markers[i].getPosition().getLng();
				y_coord = markers[i].getPosition().getLat();
				if( x_coord < 180 && x_coord > -180 && y_coord < 90 && y_coord > -90)
					bounds.extend( markers[i].getPosition() );
				
			}
			kakaoMap.setBounds(bounds);
			delete bounds;
		} 
		
	}

function clickMarker(marker){
	// zone편집, 위치변경, 도착순서설정 버튼 노출
	var newFlag = false;
    	newFlag = marker.new_flag;
	
//	if(pt_marker != null || newFlag != true) {
	if(newFlag != true) {
		$("#zoneEditBtn, #placeChangeBtn, #arrivalBtn").show();
		$("#addressSearchBox").hide();
	} else {
		$("#zoneEditBtn, #placeChangeBtn, #arrivalBtn").hide();
		$("#addressSearchBox").show();
	}
	
	//$("#geo_func_right_savepos").hide();
	//$("#geo_func_right_cancelpos").show();
	dragendMarker(marker);

	openInfoWindow(marker);
}

function dragendMarker(marker){
	
	var x_coord = marker.getPosition().getLng();
	var y_coord = marker.getPosition().getLat();
	
	pt_marker = marker;
	
	var cacheTime = (new Date()).getTime();
	
	getAddress(x_coord, y_coord, "dragendMarkerCallbak");
	
	// 구글과 달리 카카오지도에선 marker의 움직임에 따라 infowindow 위치가 움직이지 않아 위치를 별도 세팅 해줘야됨
	if(infowindow != null)
		infowindow.setPosition(marker.getPosition());
}

function dragendMarkerCallbak(dbAddress) {
	var marker = pt_marker;
	marker.geo_addr = "";
	if (dbAddress != null && dbAddress != "") {
		marker.geo_addr = dbAddress;
		$("#labelInfoWindowAddr").html(dbAddress);
//		updateMarkerAddress( marker);
	}
	is_modified_pos = true;
	
//	if("${GeoFence_Flag}" == "Y") {
		if( marker.geom_fence != null && marker.geom_fence != undefined ){
			setZoneArea(marker);
		} else {
			drawFence(marker);
		}
//	}
}

var infowindow = null;
function openInfoWindow(marker){
	
	if( infowindow == null ){
		//종료 버튼이 있는 것
			infowindow = new daum.maps.InfoWindow({
			//map: map,
			//removable: true,
			zIndex : 2147483647		//max z-index (최상위 표출)
		});
	}
		
	
	pt_marker = marker;
	
	var x_coord = marker.getPosition().getLng();
	var y_coord = marker.getPosition().getLat();
	
	getAddress(x_coord, y_coord, "openInfoWindowCallback");
}

function openInfoWindowCallback(dbAddress) {
	var marker = pt_marker;
	marker.geo_addr = "";
	if (dbAddress != null && dbAddress != "") {
		marker.geo_addr = dbAddress;
	}
	showInfoMain(marker, kakaoMap);
}

//지점 초기 폴리곤 설정
function setZoneArea(marker) {
	removeTempFence();
	
	var geom_fence = marker.geom_fence;
	
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

	pt_fence.setMap(kakaoMap);
	pt_fence.setPath(triangleCoords);
    
    //폴리곤 오브젝트 재설정
    objAreaPolygons = new s1_DistancePaint();
    for(var i=0; i<array.length; i++) {
    	objAreaPolygons.put(i, pt_fence, 0);
    }
}

function removeTempFence(){

	if( pt_fence != null )
		pt_fence.setMap(null);
	pt_fence = null;
}

function openInOutBoundView( geo_id, geo_name ){
	//alert("첫번째 아이템 선택");
	current_geoid = geo_id;
	current_geoName = geo_name;
	
	var populationOptions = {
		      strokeColor: "#58a240",
		      strokeOpacity: 0.8,
		      strokeWeight: 2,
		      fillColor: "#58a240",
		      fillOpacity: 0.0,
		      map: kakaoMap,
		      center: new daum.maps.LatLng( lat, lng ),
		      radius: Number(geo_radius) * 1.1
		    };
	var geo_circle = new daum.maps.Circle(populationOptions);
	//map.fitBounds(geo_circle.getBounds());
	kakaoMap.setBounds(geo_circle.getBounds());
	geo_circle.setMap(null);
	
//	loadInOutBoundList(rowid);
	
//	$("#geoplace_name").html('[ ' + geo_name + ' ]');

//	$("#GeoInOutReport").show();
	
}

function onPlaceCancelConfig(){
	
	$("#placeChangeCancelBtn").hide();
//	$("#placeChangeBtn").show();
//	$("#geo_func_right_add").show();
	//$("#geo_func_right_savepos").hide();
	//$("#geo_func_right_delete").hide();
//	$("#geo_func_right_cancelpos").hide();
		
	var marker = pt_marker;
	clearMarkersEtc(marker);
	
	is_fitbound = false;
	is_draggable = false;
	
	loadType = "3";        // 맵 데이터 갱신을 위한 파라미터
	pointListLoad();       // list load 및 맵 데이터 갱신
	
	is_modified_pos = false;
	//is_new = false;
	is_openInfo = false;
	
	if(infowindow != null) {
		infowindow.close();
	}
}

function clearMarkersEtc(marker){
	
	if( marker != null && marker != undefined ){
		if( marker.geo_id == 0 ){
			if( marker != null )
				marker.setMap(null);
			marker = null;
		
			if( pt_label != null )
				pt_label.setMap(null);
			pt_label = null;
			
			if( pt_fence != null )
				pt_fence.setMap(null);
			pt_fence = null;
			
		}
	}
//	document.getElementById('rtn_addr').innerHTML = "&nbsp;&nbsp;";
	removeTempFence();
}

//지점 편집 화면에서 설정된 폴리곤 적용
function applyPolygon(pathArray, marker) {
    var x_coord = marker.getPosition().getLng();
    var y_coord = marker.getPosition().getLat();
    
    pt_marker.x_coord = x_coord;
    pt_marker.y_coord = y_coord;
    
    var geo_pos = new daum.maps.LatLng(y_coord, x_coord);
    
    var geo_id = pt_marker.geo_id;
    for(var i=0; i<fastMarkers.length; i++) {
        if(fastMarkers[i].geo_id == geo_id) {
            fastMarkers[i].setPosition(geo_pos);
            fastMarkers[i].x_coord = x_coord;
            fastMarkers[i].y_coord = y_coord;
        } 
    }
    
    /////////
    //기존 반경 zone 제거
    removeTempFence();
    
    var triangleCoords = [];
  
    for(var i=0; i<pathArray.length; i++) {
        triangleCoords.push(new daum.maps.LatLng(pathArray[i].getLat(), pathArray[i].getLng()));
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
    
    pt_fence.setMap(kakaoMap);
    pt_fence.setPath(triangleCoords);
    //pt_fence.bindTo('center', pt_marker, 'position');
       
    //폴리곤 오브젝트 재설정
    objAreaPolygons = new s1_DistancePaint();
    for(var i=0; i<pathArray.length; i++) {
        objAreaPolygons.put(i, pt_fence, 0);
    }

    var center = new daum.maps.LatLng( y_coord, x_coord );
    kakaoMap.setCenter(center);
    
    $('#popModel2').modal('hide');
}

var is_draggable = false;
function onPlacePosConfigMode(){

	is_fitbound = false;
	is_draggable = true;

	getPlaceData(pointListTemp);
	
	is_modified_pos = true;
	
	$("#placeChangeCancelBtn").show();
	$("#placeChangeBtn").hide();
}