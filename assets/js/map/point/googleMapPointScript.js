var googleMap;

var geocoder;
var is_fitbound = false;

function initialize(data) {
	
	initPlaceIcon();
	
	var x = 33.113712 + (39.954758-33.113712)/2;
	var y = 124.612678 + (131.954758-124.612678)/2;
	
	var mapOptions = {
			disableDefaultUI : false,
			center : new google.maps.LatLng(x, y ),
			overviewMapControl : false,
			overviewMapControlOptions : {
				opened : false
			},
			panControl : false,
			zoomControl : true,
			zoomControlOptions : {
				style : google.maps.ZoomControlStyle.LARGE,
				position : google.maps.ControlPosition.TOP_RIGHT,
				style: google.maps.ZoomControlStyle.SMALL
			},
			scaleControl : false,
			mapTypeId : google.maps.MapTypeId.ROADMAP,
			zoom: 6,
			maxZoom : 19,
			minZoom : 3,
			streetViewControl : true,
			streetViewControlOptions: {
		        position: google.maps.ControlPosition.TOP_RIGHT
		    },
		    gestureHandling: 'greedy'
		};
		
  	googleMap = new google.maps.Map(document.getElementById('map_canvas'),
  			mapOptions);

	geocoder = new google.maps.Geocoder();
	
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

function toLatLng(lat, lng){
	return new google.maps.LatLng(lat, lng);
}

function toBounds(j,k){
    var pts = [];
    var latMin, latMax, lngMin, lngMax;
    var sw, ne;

    latMin = Math.min(j.lat(), k.lat());
    latMax = Math.max(j.lat(), k.lat());

    lngMin = Math.min(j.lng(), k.lng());
    lngMax = Math.max(j.lng(), k.lng());

    sw = toLatLng(latMin, lngMin);
    ne = toLatLng(latMax, lngMax);
    return new google.maps.LatLngBounds(sw, ne);
}


function onSearchAddress(){
	var geocoder = new google.maps.Geocoder();
	var address = document.getElementById("addressInput").value;
	
	//geocoder.addr2coord( address, function(status, result) {
	geocoder.geocode( { 'address': address, 'region':"kr" }, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			var firstDataIdx = -1;
			for( var i=0; i<results.length ; i++){
				
				var country_code = "";
		    	for( var j=0; j<results[i].address_components.length; j++){
		    		if( results[i].address_components[j].types[0] == "country"){
		    			country_code = results[i].address_components[j].short_name;
		    		}
		    	}
		    	
		    	if( country_code == "KR"  && firstDataIdx == -1) {
//		   			itemArray[i] = { seq : String(i), addr : toSimpleAddress( results[i] ), obj : results[i] };
		   			firstDataIdx = i;
		   			break;
		    	}
		    }
			
			var addr_item = results[i];
			
			if( addr_item.geometry.viewport != null ){
				ne = toLatLng( addr_item.geometry.viewport.getNorthEast().lat()
						,addr_item.geometry.viewport.getNorthEast().lng()  );
				sw = toLatLng( addr_item.geometry.viewport.getSouthWest().lat()
						,addr_item.geometry.viewport.getSouthWest().lng() );
				var _bounds = toBounds(ne, sw);
				googleMap.fitBounds( _bounds );
			} else if( addr_item.geometry.bounds != null ){
				ne = toLatLng( addr_item.geometry.bounds.getNorthEast().lat()
						,addr_item.geometry.bounds.getNorthEast().lng()  );
				sw = toLatLng( addr_item.geometry.bounds.getSouthWest().lat()
						,addr_item.geometry.bounds.getSouthWest().lng() );
				var _bounds = toBounds(ne, sw);
				googleMap.fitBounds( _bounds );
			} else {
				ne = toLatLng( addr_item.geometry.location.lat()
						,addr_item.geometry.bounds.lng()  );
				googleMap.panTo( ne );
			}
			
			googleMap.setZoom( googleMap.getZoom()-1 );
			
			onPlaceAddConfig();

		} else {
			alert(messageNoAddressResult);
//			html = getInitResultContents();
//			$("#searchAddrList").html = "";
//			$("#searchAddrList").html( html );
		}
	});
}

function onClickMove(tgt, resultID){
	var addr_item = mapTgtSearchAddr.get(resultID);
	//alert ("northeast : " + addr_item.geometry.viewport.getNorthEast().getLat() + ", " + addr_item.geometry.viewport.getNorthEast().getLng() );
	//alert ("southwest : " + addr_item.geometry.viewport.getSouthWest().getLat() + ", " + addr_item.geometry.viewport.getSouthWest().getLng() );
	$('#searchAddrList ul li').removeClass('selected');
	$('#'+ resultID ).addClass('selected');
			
	var coords = new daum.maps.LatLng(addr_item.y, addr_item.x);
	map.setLevel(4);
	map.setCenter(coords);
	
	onPlaceAddConfig();
}


function getPlaceData(data) {
	clearOverlays();

	fastMarkers = new Array();
	
	makeMarkers(data);
	if( is_fitbound == true ) {
		setMapBounds(fastMarkers);
	}
}

var fastMarkers = [];
var fastMarkerlabels = [];

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

		var geo_pos = new google.maps.LatLng(
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
			//var marker_style = setPlaceMarkerImageName(geo_class);
			//var marker_style = setPlaceMarkerImageName(geo_class, false, geo_name, common_yn);
		}
		
		var marker = null;
		
		if( is_draggable == true ){
			marker = new google.maps.Marker({
				position : geo_pos,
				map : googleMap,
				flat : true,
//				icon : marker_style,
				icon : getContextPath() + "/resources/images/realtime/new_ico/" + mapPlaceIcon.get(Number(jsonContentsList[i].geoClass)) + ".png",
				title : title,
				labelContent: geo_name,
				draggable : true,
				zIndex : i
			});
			
		} else {
			marker = new google.maps.Marker({
				position : geo_pos,
				map : googleMap,
				flat : true,
//				icon : marker_style,
//				icon : getContextPath() + "/resources/images/realtime/ico_new_16.png",
				icon : getContextPath() + "/resources/images/realtime/new_ico/" + mapPlaceIcon.get(Number(jsonContentsList[i].geoClass)) + ".png",
				title : title,
				labelContent: geo_name,
				//draggable : false,
				zIndex : i
			});
			
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
		
	    google.maps.event.addListener(marker, 'dragend', (function(marker) {
			return function() {
				
				dragendMarker(marker);
				objAreaPolygons=null;
				marker.geom_fence = null;
				drawFence(marker);
//				clickMarker(marker);
			}
		})(marker));

		google.maps.event.addListener(marker, 'click', (function(marker) {
			return function() {
				
				clickMarker(marker);
			}
		})(marker));
	}
}

function setPlaceMarkerImageName(geo_class, strOn, sName, CommonYN){
	var tempClass = geo_class;
	if( strOn == 'on' ){
		tempClass = Number(geo_class) + 10;
	}
	
	//return getContextPath()+"/images/"+langset+"/realtime/ico_new_16_"+geo_class+".png";
	//return getContextPath()+"/images/"+langset+"/realtime/" + mapPlaceIcon.get( tempClass );

	var selColor = "A46997";
	if( CommonYN == "Y" )
		selColor = "604040";
	
	return encodeURI(getContextPath() + "/ImageControlAction.do?method=getCarMarker"
			+ "&TYPE=" + mapPlaceIcon.get( tempClass ) 
			+ "&NUM=" + sName
			+ "&NUMCOLOR="+ selColor
			+ "&FONTSIZE=11"
			+ "&FONTNAME=Dotum"
			+ "&VER=20130718_v1"
			);
}

function setMapBounds(markers) {

	
	/*
	 
	124.612678624038
	33.1137120675166
	131.954758672386
	39.954758672386
	 
	 */
	 
	 	//alert(markers.length);
	 
		if( markers.length == 0 ){
		 	var center = new google.maps.LatLng( 33.1137120675166 + (39.954758672386 - 33.1137120675166) /2
					, 124.612678624038 + ( 131.954758672386 - 124.612678624038)/2 );
			googleMap.setCenter(center);
		} else {
			var bounds = new google.maps.LatLngBounds();
			var x_coord = 0;
			var y_coord = 0;
			for ( var i = 0; i < markers.length; i++){
				x_coord = markers[i].getPosition().lng();
				y_coord = markers[i].getPosition().lat();
				if( x_coord < 180 && x_coord > -180 && y_coord < 90 && y_coord > -90)
					bounds.extend( markers[i].getPosition() );
			}
			googleMap.fitBounds(bounds);
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

var is_modified_pos = false;

function dragendMarker(marker){
	
	var x_coord = marker.getPosition().lng();
	var y_coord = marker.getPosition().lat();
	
	pt_marker = marker;
	
	var cacheTime = (new Date()).getTime();
	
	getAddress(x_coord, y_coord, "dragendMarkerCallbak");
	
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

function updateMarkerAddress(marker) {
	// 레이어 및 상단 타이틀 변경.. renewal에서 어찌바뀔지
	
//		$("#geo_title").removeClass( "geo_title" );
//		$("#geo_title").addClass( "geo_title_2" );
		
//		pt_marker.geo_addr = str;
		
//		document.getElementById('rtn_addr').innerHTML = '&nbsp;&nbsp;(위치) ' + str;
		
//		if( document.getElementById('labelInfoWindowAddr') != null )
//			document.getElementById('labelInfoWindowAddr').innerHTML = '&nbsp;&nbsp;(위치) ' + str;
	}

var pt_marker = null;
var pt_label = null;
var pt_fence = null;
var geomFence = "";
var objAreaPolygons;

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
    	triangleCoords.push(new google.maps.LatLng(xycoord[1], xycoord[0]));
    }

	  // Construct the polygon.
	pt_fence = new google.maps.Polygon({
	    paths: triangleCoords,
	    strokeColor: '#5B67D9',
	    strokeOpacity: 0.8,
	    strokeWeight: 2,
	    fillColor: '#5B67D9',
	    fillOpacity: 0.2,
	    map: googleMap,
	    draggable : false,
	    editable: false
    });

   //pt_fence.setMap(map);
   // map.setZoom(16);
    pt_fence.bindTo('center', marker, 'position');
    
    //폴리곤 오브젝트 재설정
    objAreaPolygons = new s1_DistancePaint();
    for(var i=0; i<array.length; i++) {
    	objAreaPolygons.put(i, pt_fence, 0);
    }
}

var infowindow = null;
function openInfoWindow(marker){
	
	if( infowindow == null ){
		infowindow = new google.maps.InfoWindow({
		maxWidth : "auto"});
	}
	
	pt_marker = marker;
	
	var x_coord = marker.getPosition().lng();
	var y_coord = marker.getPosition().lat();
	
	getAddress(x_coord, y_coord, "openInfoWindowCallback");
	
	google.maps.event.addListener(infowindow,'closeclick',function(){
		if(pt_marker.geo_id == "0") {
			onPlaceCancelConfig();
		}
	});
}

function openInfoWindowCallback(dbAddress) {
	var marker = pt_marker;
	marker.geo_addr = "";
	if (dbAddress != null && dbAddress != "") {
		marker.geo_addr = dbAddress;
	}
	showInfoMain(marker, googleMap);
}



function setPlaceMarkerIcon(geo_class){
	var tempClass = geo_class;
	
	//return getContextPath()+"/images/"+langset+"/realtime/ico_new_16_"+geo_class+".png";
//	return getContextPath()+"/images/"+langset+"/realtime/new_ico/" + mapPlaceIcon.get( tempClass ) + ".png";
	return getContextPath() + "/resources/images/icon-step-input.png";
}

function viewMarkerPos( latLng, geoName ){
	googleMap.setCenter( latLng );
	googleMap.setZoom(12);
}

function removeTempFence(){

	if( pt_fence != null )
		pt_fence.setMap(null);
	pt_fence = null;
}



function openInOutBoundView(geo_id, geo_name){
	
	//alert("첫번째 아이템 선택");
	current_geoid = geo_id;
	current_geoName = geo_name;
	
	var populationOptions = {
		      strokeColor: "#58a240",
		      strokeOpacity: 0.8,
		      strokeWeight: 2,
		      fillColor: "#58a240",
		      fillOpacity: 0.0,
		      map: googleMap,
		      center: new google.maps.LatLng( lat, lng ),
		      radius: Number(geo_radius) * 1.1
		    };
	var geo_circle = new google.maps.Circle(populationOptions);
	googleMap.fitBounds(geo_circle.getBounds());
	geo_circle.setMap(null);
	
//	loadInOutBoundList_Idx();
	
//	$("#geoplace_name").html('[ ' + geo_name + ' ]');
//
//	$("#GeoInOutReport").show();
	
}

function loadInOutBoundList(){
	loadInOutBoundList_Idx(geo_id);
}

function loadInOutBoundList_Idx(){

//	var date_sub = $("#scopeSelectBox").val(); 
	
	var getUrl = '';
	//retrieve dataset
	var getUrl2 = getContextPath() + "/PlaceConfigAction.do?method=getInOutBoundListArea";
	var postData = "&KEY_DATE_SUB=" + date_sub;
	postData += "&KEY_GEO_ID=" + geo_id;
	//postData  += "&REQ_COMPRESS=Y";
	getUrl += postData;
	
	//alert( getUrl );
	
	//$("#det_timeline").html(curDateFmatter(f.key_date.value, '', '') +" "+ 	f.KEY_START_TIME.value.substring(0,2) + ":" + f.KEY_START_TIME.value.substring(2,4) +  "~" + f.KEY_END_TIME.value.substring(0,2)+ ":" + f.KEY_END_TIME.value.substring(2,4));

	//테이블 그리는 비용때문에 서버 사이드에서 처리 start
	//Table Data progress start
	$("#tableData").html("<tr><td style=\"border-width:0px;\"><div style=\"width:290px; text-align:center;\"><img src=\""+getContextPath()+"/images/common/loadingType2.gif\">" + messagePointInOutLoading + "</div></td></tr>");	
	
	//Render Table Data
	$.get(getUrl2+postData, {}, function(returnData) {
		//$("#tableData").html(renderHTMLData);
		if( returnData[0] != null ){
			makeCarMarkers(returnData[0].Area);
			reloadInOutBound(returnData[0].InOutBound);
		}
	});

	$("#tableData").html("");	

}



function onPlaceAddConfig(){
	$("#geo_func_right_add").show();
	//$("#geo_func_right_savepos").show();
	//$("#geo_func_right_delete").hide();
	//$("#geo_func_right_cancelpos").show();
	
	showTOCPanel();

	var zoom = googleMap.getZoom();
	var marker = addNewMarker();
	
	dragendMarker(marker);
	
	googleMap.setZoom(zoom);

	clickMarker(marker);
	
	if(objAreaPolygons != null) {
		objAreaPolygons = null;
	}
}

var stateSrarchTOC = false;
function showTOCPanel(){
	if( stateSrarchTOC != true )
		onClickSearchTOCToggle();
}

function onClickSearchTOCToggle(){

	if( stateSrarchTOC == false){
//		showSearchTOC();
	} else {
//		hideSearchTOC();
	}
	
	var center = googleMap.getCenter();
	google.maps.event.trigger(googleMap, "resize");
	googleMap.setCenter(center); 	
}

function showSearchTOC(){
	var html = document.getElementById('geo_toc_sub').innerHTML;

	$("#geo_search").removeClass( "geo_search_1" );
	$("#geo_search").addClass( "geo_search_2" );

	$("#map_canvas").removeClass( "map_canvas_1" );
	$("#map_canvas").addClass( "map_canvas_2" );

	html = myReplaceAll( html, "_off.", "_on.");
	
	/*
	$("#map_canvas").animate({ width:'499px' }, "fast", function(){
		$("#geo_search").animate({ width:'266px' }, "fast");}	
	);
	*/
	
	stateSrarchTOC = true;
	$("#geo_toc_sub").html(html);
	
	$("#KEY_SEARCH_ADDR").focus();
	$("#KEY_CONFIG_RADIUS").focus();
	
}

function hideSearchTOC(){
	var html = document.getElementById('geo_toc_sub').innerHTML;

	$("#geo_search").removeClass( "geo_search_2" );
	$("#geo_search").addClass( "geo_search_1" );
	
	$("#map_canvas").removeClass( "map_canvas_2" );
	$("#map_canvas").addClass( "map_canvas_1" );

	html = myReplaceAll( html, "_on.", "_off.");
	
	/*
	$("#geo_search").animate({ width:'0px'}, "fast", function(){
	    	$("#map_canvas").animate({width:'100%'}, "fast");}
	);
	*/
	
	stateSrarchTOC = false;
	$("#geo_toc_sub").html(html);
}

function addNewMarker() {

	//refreshTargetInfo();
	
	var c = googleMap.getCenter();

	var location = new google.maps.LatLng(c.lat(), c.lng() );

//	var marker_carmoving_pick = getContextPath()+"/images/"+langset+"/realtime/ico_new_16.png";
//	var marker_carmoving_pick_pt = getContextPath()+"/images/"+langset+"/realtime/now_place.png";
	var marker_carmoving_pick = getContextPath()+"/resources/images/map/now_place.png";
	var marker_carmoving_pick_pt = getContextPath()+"/resources/images/map/now_place.png";
	
	if( pt_marker != null )
		pt_marker.setMap(null);

	if( pt_label != null )
		pt_label.setMap(null);
	
	pt_marker = new google.maps.Marker({
		position : location,
		map : googleMap,
		flat : true,
		icon : marker_carmoving_pick_pt,
		//title : cmNum,
		zIndex : 101,
		draggable : true,
		//labelContent: "",
		animation: google.maps.Animation.DROP
	});
	
	pt_marker.geo_id = 0;
	pt_marker.geo_name = messageMarkerNew;
	pt_marker.geo_rmk = "";
	pt_marker.geo_class = "1";
	pt_marker.geo_class_name = messageMarkerClassName;
	pt_marker.x_coord = pt_marker.getPosition().lng();
	pt_marker.y_coord = pt_marker.getPosition().lat();
	pt_marker.geo_addr = "";
//	pt_marker.geo_radius = c_default_radius ;
	pt_marker.geo_radius = defaultRadius ;
//	pt_marker.detect_type = c_detect_type;
	pt_marker.detect_type = defaultDetectType;
	pt_marker.sms_grp_id = defaultSmsGrpId;
	pt_marker.new_flag = true;
	
	pt_marker.api_key = "";
	pt_marker.geo_max_speed = "";

	pt_label = new Label({
		map:googleMap
    });
	var dwidth = //Number($("#checkWidth").width());
		pt_marker.geo_name.length*10;
	dwidth = (dwidth * -1)/2;
	
	//alert(cmNum);
	
	var labelHtml = "";
//	var labelHtml = "<div style='position:relative;z-index:1010;background-color:white;border:0px solid #555;'>";
//	if(navigator.appVersion.indexOf("MSIE 8.0") != -1){
//   		labelHtml = labelHtml + "<div style='position:absolute;top:10px;left:"
//   						+(dwidth)
//   						+"px;text-align:center;height:20px;background-color:white;box-shadow:10px 10px 10px silver;-moz-box-shadow:10px 10px 10px silver;-webkit-box-shadow:10px 10px 10px silver;border:1px solid #555;'><p class='marker_name'>"
//   						+pt_marker.geo_name
//   						+"</p></div>";
//	}else if(navigator.appVersion.indexOf("safari") != -1){
//		labelHtml = labelHtml + "<div style='position:absolute;top:-20px;left:"
//						+(dwidth)
//						+"px;text-align:center;height:20px;background-color: white;box-shadow:10px 10px 10px silver;-moz-box-shadow:10px 10px 10px silver;-webkit-box-shadow:10px 10px 10px silver;border:1px solid #555;'><p class='marker_name'>"
//						+pt_marker.geo_name
//						+"</p></div>";
//	}else{
//		labelHtml = labelHtml + "<div style='position:absolute; top:10px;left:"
//						+(dwidth+6)
//						+"px;text-align:center;height:20px;background-color: white;box-shadow:10px 10px 10px silver;-moz-box-shadow:10px 10px 10px silver;-webkit-box-shadow:10px 10px 10px silver;border:1px solid #555;'><p class='marker_name'>"
//						+pt_marker.geo_name
//						+"</p></div>";
//	}
//    labelHtml = labelHtml + "</div>";
   	
    pt_label.bindTo('position', pt_marker, 'position');
    pt_label.set('text', labelHtml);		
    pt_label.set('zIndex', 1010);
    pt_label.bindTo('visible', pt_marker);
    
    /*
	// 차량 번호 라벨 세팅
	var label = new Label({ map: map });
	
	label.set('zIndex', 1000); label.bindTo('position', marker,'position'); label.set('text', cmNum);
	label.bindTo('visible', marker);
	*/
    
	/*
	google.maps.event.addListener(pt_marker, 'dragend', function() {
			dragendMarker(pt_marker);
	});
	
	google.maps.event.addListener(pt_marker, 'click', function() {
		clickMarker(pt_marker);
	});
	*/
	
	google.maps.event.addListener(pt_marker, 'dragend', (function(marker) {
		return function() {
			dragendMarker(marker);
//			clickMarker(marker);
		}
	})(pt_marker));

	google.maps.event.addListener(pt_marker, 'click', (function(marker) {
		return function() {
			
			clickMarker(marker);
		}
	})(pt_marker));
	
	googleMap.setCenter(location);
    googleMap.setZoom(12);
    
    return pt_marker;
 }

//ZONE path 추출
function getZonePoint() {
	//GEO 데이터 추출
	var geo_data = "";
	if(objAreaPolygons != null) {
		var keys = objAreaPolygons.keys();
	   
	    var lngLat0 = "";
		var polygon = objAreaPolygons.get(keys[objAreaPolygons.size()-1]);
	    var array = polygon.getPath().getArray();
	    for(var j=0; j<array.length; j++) {
	    	if(j == 0) {
	    		lngLat0 = array[j].lng() + "," + array[j].lat();
	    	}
	    	
			var path = array[j].lng() + ",";
	    	path = path + array[j].lat();
	    	
	    	if(lngLat0 != path) {
	    		geo_data = geo_data + path + "$";
	    	}
	    }
	    
	    geo_data = lngLat0 + "$" + geo_data + lngLat0;
	}
	
	return geo_data;
}

function drawFence(marker){
	removeTempFence();
	var populationOptions = {
		      strokeColor: "#58a240",
		      strokeOpacity: 0.8,
		      strokeWeight: 2,
		      fillColor: "#58a240",
		      fillOpacity: 0.3,
		      map: googleMap,
		      center: marker.getPosition(),
		      radius: Number(marker.geo_radius) * 1.1
		    };
   pt_fence = new google.maps.Circle(populationOptions);
   
   pt_fence.bindTo('center', marker, 'position');
   //pt_fence.set('zIndex', 1010);
   //pt_fence.bindTo('visible', marker);
   
}

function onPlaceCancelConfig(type){
	
	$("#placeChangeCancelBtn").hide();
	if(type == "1") {
		$("#placeChangeBtn").show();
	}
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

var is_draggable = false;
function onPlacePosConfigMode(){

	is_fitbound = false;
	is_draggable = true;

	getPlaceData(pointListTemp);
	
	is_modified_pos = true;
	
	$("#placeChangeCancelBtn").show();
	$("#placeChangeBtn").hide();
}

var map;
var geoXPOS = "";
var geoYPOS = "";
var strokeColor = "";
var fillColor = "";
var zoomLevel = "";
var bermudaTriangle;
var objAreaPolygonsLayer;
var markerLayer;
var beforeXPOS;
var beforeYPOS;



//지점 편집 화면에서 설정된 폴리곤 적용
function applyPolygon(pathArray, marker) {
	var x_coord = marker.getPosition().lng();
	var y_coord = marker.getPosition().lat();
	pt_marker.x_coord = x_coord;
	pt_marker.y_coord = y_coord;
	
	var geo_pos = new google.maps.LatLng(y_coord, x_coord);
	
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
    	triangleCoords.push(new google.maps.LatLng(pathArray[i].lat(), pathArray[i].lng()));
    }
    
	// Construct the polygon.
	pt_fence = new google.maps.Polygon({
		paths: triangleCoords,
		strokeColor: '#5B67D9',
	    strokeOpacity: 0.8,
	    strokeWeight: 2,
	    fillColor: '#5B67D9',
	    fillOpacity: 0.2,
	    map: googleMap,
	    draggable : false,
	    editable: false
    });
	  
	
	pt_fence.bindTo('center', pt_marker, 'position');
	   
	//폴리곤 오브젝트 재설정
    objAreaPolygons = new s1_DistancePaint();
    for(var i=0; i<pathArray.length; i++) {
    	objAreaPolygons.put(i, pt_fence, 0);
    }
//    
    
    var center = new google.maps.LatLng( y_coord, x_coord );
	googleMap.setCenter(center);
	$('#popModel2').modal('hide');
}

