//////////////////////////////////////////////////////////////////////////////////////////
	// Map 지도처리 시작
	//////////////////////////////////////////////////////////////////////////////////////////
	var objMapGoogle; //지도 객체
	var mapPosition; //지도 좌표
	var fastMarkers = [];
	var fastMarkersPath = [];
	var strMapMarkerIco1 = getContextPath() + "/resources/images/realtime/ico_map_gray15_1.png"; // 정류장 Map Marker 출근 아이콘
	var strMapMarkerIco2 = getContextPath() + "/resources/images/realtime/ico_map_gray15_2.png"; // 정류장 Map Marker 퇴근 아이콘
	var strMapMarkerIco3 = getContextPath() + "/resources/images/realtime/ico_map_gray15_3.png"; // 정류장 Map Marker 기타 아이콘
	var strMapMarkerIco = strMapMarkerIco3;
	var strMapBasicName = "서울특별시";
	var strMapBasicXPOS = "37.5665004467318";
	var strMapBasicYPOS = "126.978181776408";
	var intMarkerNum = 0;
	var lineSymbol = {
		path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
		scale: 3,
		strokeColor: '#FF0000'
	};

	function initializeMapBasic(map_id) {
		mapPosition = new google.maps.LatLng(strMapBasicXPOS,strMapBasicYPOS);
		var mapOptions = {
			disableDefaultUI: false,
			center: mapPosition,
			overviewMapControl: true,
			overviewMapControlOptions: {
				opened: true
			},
			streetViewControl:true,
			panControl: false,
			zoomControl: true,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.LARGE,
				position: google.maps.ControlPosition.TOP_RIGHT
			},
			scaleControl: false,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			zoom: 12,
			maxZoom: 19,
			minZoom: 3,
		    gestureHandling: 'greedy'
		};
		objMapGoogle = window.map = new google.maps.Map(document.getElementById(map_id), mapOptions);
		
		google.maps.event.addListener(map, 'maptypeid_changed', function() {
			var mapType = map.getMapTypeId();
			
//			if(mapType == 'roadmap') {
//				map.setOptions({'minZoom': 3});
//				map.setOptions({'maxZoom': 19});
//			}
//			
//			if(mapType == 'hybrid') {
//				map.setOptions({'minZoom': 4});
//				map.setOptions({'maxZoom': 19});
//			}
		});
	}

	function setMapPosition(intNum) {
		intMarkerNum = intNum;
		mapPosition = fastMarkers[intMarkerNum].getPosition();
		objMapGoogle.setCenter(mapPosition);
	}

	function setMapMarker(x_pos, y_pos, strTitle) {
		var markerPosition = new google.maps.LatLng(x_pos, y_pos);
		var marker = new google.maps.Marker({position:markerPosition, map:objMapGoogle, flat:true, icon: strMapMarkerIco, title:strTitle});
		fastMarkers.push(marker);
		if (fastMarkers.length > 1) {
			var FromPos = fastMarkers[fastMarkers.length - 2].getPosition();
			var ToPos = fastMarkers[fastMarkers.length - 1].getPosition();
			var LinePos = [FromPos,ToPos];
			var lineOpts = {
				path: LinePos,
				map: objMapGoogle,
				icons: [{
					icon: lineSymbol,
					offset: '100%',
					strokeOpacity: 0.5,
					strokeWeight: 20
				}],
				strokeColor: "#FF0000",
				strokeOpacity: 0.7,
				strokeWeight: 3
			};
			lineOpts.geodesic = true;
			var markerPath = new google.maps.Polyline(lineOpts);
			fastMarkersPath.push(markerPath);
			fastMarkersPath[fastMarkersPath.length - 1].setMap(objMapGoogle);
		}
	}

	function setMapMarkerClickEvent() {
		$(fastMarkers).each(function(index) {
			google.maps.event.addListener(this, 'click', function() {
				setMapPosition(index);
				$("#MapMarkerSelectBox").val(index);
			});
		});
	}

	function setMarkersIconChange(intMark,SI_FLAG) {
		if (SI_FLAG == "1") {
			strMapMarkerIco = strMapMarkerIco1;
		} else if (SI_FLAG == "2") {
			strMapMarkerIco = strMapMarkerIco2;
		} else {
			strMapMarkerIco = strMapMarkerIco3;
		}
		fastMarkers[intMark].setIcon(strMapMarkerIco);
	}

	function clearMarkers() {
		for (var i = 0; i < fastMarkers.length; i++ ) {
			fastMarkers[i].setMap(null);
		}
		fastMarkers.length = 0;
	}
	//////////////////////////////////////////////////////////////////////////////////////////
	// Map 지도처리 끝
	//////////////////////////////////////////////////////////////////////////////////////////