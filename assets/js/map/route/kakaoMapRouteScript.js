//////////////////////////////////////////////////////////////////////////////////////////
	// Map 지도처리 시작
	//////////////////////////////////////////////////////////////////////////////////////////
	var objMapDaum; //지도 객체
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
		//path: daum.maps.SymbolPath.FORWARD_OPEN_ARROW,
		scale: 3,
		strokeColor: '#FF0000'
	};

	function initializeMapBasic(map_id) {
		mapPosition = new daum.maps.LatLng(strMapBasicXPOS,strMapBasicYPOS);
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
			/* zoomControlOptions: {
				style: daum.maps.ZoomControlStyle.LARGE,
				position: daum.maps.ControlPosition.TOP_RIGHT
			}, */
			scaleControl: false,
			mapTypeId: daum.maps.MapTypeId.ROADMAP,
			level: 8,
			maxZoom: 19,
			minZoom: 3,
		    gestureHandling: 'greedy'
		};
		objMapDaum = window.map = new daum.maps.Map(document.getElementById(map_id), mapOptions);
		
		objMapDaum.addControl(new daum.maps.MapTypeControl(), daum.maps.ControlPosition.TOPRIGHT);
		
		daum.maps.event.addListener(map, 'maptypeid_changed', function() {
			var mapType = objMapDaum.getMapTypeId();
			
//			if(mapType == 'roadmap') {
//				objMapDaum.setOptions({'minZoom': 3});
//				objMapDaum.setOptions({'maxZoom': 19});
//			}
//			
//			if(mapType == 'hybrid') {
//				objMapDaum.setOptions({'minZoom': 3});
//				objMapDaum.setOptions({'maxZoom': 19});
//			}
		});
	}

	function setMapPosition(intNum) {
		intMarkerNum = intNum;
		mapPosition = fastMarkers[intMarkerNum].getPosition();
		objMapDaum.setCenter(mapPosition);
	}

	function setMapMarker(x_pos, y_pos, strTitle) {
		var markerPosition = new daum.maps.LatLng(x_pos, y_pos);
		var marker = new daum.maps.Marker({position:markerPosition, map:map, flat:true, icon: strMapMarkerIco, title:strTitle});
		fastMarkers.push(marker);
		if (fastMarkers.length > 1) {
			var FromPos = fastMarkers[fastMarkers.length - 2].getPosition();
			var ToPos = fastMarkers[fastMarkers.length - 1].getPosition();
			var LinePos = [FromPos,ToPos];
			var lineOpts = {
				path: LinePos,
				map: map,
				icons: [{
					icon: lineSymbol,
					offset: '100%',
					strokeOpacity: 0.5,
					strokeWeight: 20
				}],
				strokeColor: "#FF0000",
				strokeOpacity: 0.7,
				strokeWeight: 3,
				endArrow : true
				
			};
			lineOpts.geodesic = true;
			var markerPath = new daum.maps.Polyline(lineOpts);
			
			fastMarkersPath.push(markerPath);
			fastMarkersPath[fastMarkersPath.length - 1].setMap(map);
		}
	}

	function setMapMarkerClickEvent() {
		$(fastMarkers).each(function(index) {
			daum.maps.event.addListener(this, 'click', function() {
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
		//fastMarkers[intMark].setIcon(strMapMarkerIco);
		setMarkerImage(fastMarkers[intMark], strMapMarkerIco);
	}

	 /* 다음 마커 이미지 전용 */
	function setMarkerImage(marker, src) {
		//처음에는 기본마커가 나오기 때문에 아예 마커를 표시하지 않는다.
		marker.setImage(new daum.maps.MarkerImage('', new daum.maps.Size(0, 0)));

		var img = new Image();
		img.src = src;
		
		img.onload = function() {
			var markerImage = new daum.maps.MarkerImage(src, new daum.maps.Size(img.width, img.height), new daum.maps.Point(img.width/2, img.height));
				
			marker.setImage(markerImage);
			delete markerImage;
		};
		delete img;
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