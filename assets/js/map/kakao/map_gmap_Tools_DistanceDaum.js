/*
    Description : 
        Marker Moving을 위한 스크립트
        각 마커에 이벤트가 주어지면 됨
    Method : runDistancePolyline(map, [빈div], [top 위치], [right 위치] )
    Parameter   : 
        map : map object
        blankDivName : 빈 div 영역(레이어에 활용됨)
        [top 위치] : 상단 공백 px
        [right 위치] : 우측 공백 px
    Author		: 최용선															
    Date	    : 2013-12-09
*/
var isDistancePaintActive = false;
var isAreaPolygonPaintActive = false;
var iDistanceTotal = 0;

var iToolsIndex = 0;
var iMarkerIndex = 0;

var iDistancePolylineIndex = 0;
var iDistanceLabelIndex = 0;

var iAreaPolygonIndex = 0

var objDistanceMarkers, objDistancePolylines, objDistanceLabels;
var objDistanceTempPolylines, objAreaTempPolygons;
var objAreaPolygons;


runMapTools = function (map, blankDivName, top, right) {

    this._obj = new Object();
    this.map = map;

    this.iToolsTopPosition = top;
    this.iToolsRightPosition = right;

    objDistanceMarkers = new s1_DistancePaint();
    objDistancePolylines = new s1_DistancePaint();
    objDistanceLabels = new s1_DistancePaint();
    objDistanceTempPolylines = new s1_DistancePaint();


    objAreaPolygons = new s1_DistancePaint();
    objAreaTempPolygons =  new s1_DistancePaint();

    // 컨트롤 초기화
    initMapControls(blankDivName, this.iToolsTopPosition, this.iToolsRightPosition);

}


runMapTools.prototype = {
    setActive: function (pIsDistancePaintActive) {

        isDistancePaintActive = pIsDistancePaintActive;

        if (isDistancePaintActive) {
            createDistancePolyline();
        } else {
            setDistanceEnd();
        }


    },
    IsActive: function () {
        return isDistancePaintActive;
    },
    AddMarker: function (latLng) {
        addDistancePaintMarker(latLng);
    },
    GetViewPopup: function (event) {
        return GetViewPopup(event);
    },
    destroy: function () {
        objDistanceMarkers.clear();
        objDistancePolylines.clear();
        objDistanceLabels.clear();
    }

}



function initMapControls(blankDivName, top, right) {


    var htmls = "";

    htmls +="<div style=\"position:absolute; top:"+top+"px; right:"+right+"px; width:20px; padding-top:3px;padding-bottom:3px; border:1px solid #ccc; border-radius:3px;z-index:1000;background-color: rgb(245, 245, 245)\"> ";
    htmls +="    <ul style=\"list-style:none;text-align:center;margin:0; padding:0;\"> ";
    htmls +="	    <li style=\"position:relative; display:block; margin-bottom:0;\"> ";
    htmls +="            <span style=\"position:absolute; top:3px; left:-38px; visibility:hidden;\"><img src=\""+getContextPath()+"/resources/images/common/mapTools/txt_distance.gif\" alt=\"거리재기\"/></span> ";
    htmls +="            <img src=\""+getContextPath()+"/resources/images/common/mapTools/icon_distance.gif\" alt=\"거리재기\" name=\"icon_map\" id=\"btnDistance\"/> ";
    htmls +="	    </li> ";
    htmls +="	    <li style=\"position:relative; display:block; margin-bottom:0;\"> ";
    htmls += "            <span style=\"position:absolute; top:3px; left:-38px; visibility:hidden;\"><img src=\""+getContextPath()+"/resources/images/common/mapTools/txt_area.gif\" alt=\"면적재기\" /></span> ";
    htmls += "            <img src=\""+getContextPath()+"/resources/images/common/mapTools/icon_area.gif\" alt=\"면적재기\" name=\"icon_map\"  id=\"btnPolygonArea\"/> ";
    htmls +="	    </li> ";
    //htmls +="	    <li style=\"position:relative; display:block; margin-bottom:0;\"> ";
    //htmls +="            <span style=\"position:absolute; top:3px; left:-38px; visibility:hidden;\"><img src=\""+getContextPath()+"/resources/images/common/mapTools/txt_radius.gif\" alt=\"반경재기\" /></span><img src=\""+getContextPath()+"/resources/images/common/mapTools/icon_radius.gif\" alt=\"반경재기\" name=\"icon_map\" /> ";
    //htmls +="	    </li> ";
    htmls +="	    <li style=\"position:relative; display:block; margin-bottom:0;\"> ";
    htmls +="            <span style=\"position:absolute; top:3px; left:-38px; visibility:hidden;\"><img src=\""+getContextPath()+"/resources/images/common/mapTools/txt_clear2.gif\" alt=\"초기화\"  /></span><img src=\""+getContextPath()+"/resources/images/common/mapTools/icon_clear.gif\" alt=\"초기화\"  id=\"btnInit\" /> ";
    htmls +="	    </li> ";
    htmls +="    </ul> ";
    htmls += "</div> ";
    htmls += "<div id=\"popupLayer\"></div> ";

    var obj = document.getElementById(blankDivName);
    obj.innerHTML = htmls;

    daum.maps.event.addListener(map, 'click', function (event) {
        if (isDistancePaintActive) {
            addDistancePaintMarker(event.latLng);
        }

        if (isAreaPolygonPaintActive) {
            addAreaPolygonMarker(event.latLng);
        }
    });


    daum.maps.event.addListener(map, 'mousemove', function (event) {
        if (isDistancePaintActive) {
            // 빈레이블에 팝업 레이어 Value 지정
            var tempText = GetViewPopup(event);

            var obj = document.getElementById("popupLayer");
            obj.innerHTML = tempText;

            delete tempText;
        }
        
        if (isAreaPolygonPaintActive) {
            // 빈레이블에 팝업 레이어 Value 지정
            var tempText = GetAreaPolygonViewPopup(event);

            var obj = document.getElementById("popupLayer");
            obj.innerHTML = tempText;

            delete tempText;
        }
    });



	$(document).bind("keydown", function (e) {
	//document.addEventListener( "keydown", function (e) {
    //daum.maps.event.addDomListener(document, "keydown", function (e) {        
        if (e.keyCode === 27) { // Esc key
            if (isDistancePaintActive) {
                isDistancePaintActive = false;
                setDistanceEnd();
            }


            if (isAreaPolygonPaintActive) {
                isAreaPolygonPaintActive = false;
                setAreaPolygonEnd();
            }

			$(document).trigger("mouseup", e);
            //daum.maps.event.trigger(document, "mouseup", e);
        }
    });

	$(document).bind("mousedown", function (e) {
	//document.addEventListener( "mousedown", function (e) {
    //daum.maps.event.addDomListener(document, "mousedown", function (e) {
        
        if (e.which == 3) {
            if (isDistancePaintActive) {
                isDistancePaintActive = false;
                setDistanceEnd();
            }

            if (isAreaPolygonPaintActive) {
                isAreaPolygonPaintActive = false;
                setAreaPolygonEnd();
            }

			$(document).trigger("mouseup", e);
            //daum.maps.event.trigger(document, "mouseup", e);
        }
    });


    
    (function($) {
        $.each($("img[name=icon_map]"), function (i) {
            //마우스 오버
            $(this).mouseover(function () {
                $(this).parent().children("span").css("visibility", "visible");
            });
            //마우스 아웃
            $(this).mouseout(function () {
                $(this).parent().children("span").css("visibility", "hidden");
            });
            //마우스 클릭
            $(this).mousedown(function () {
                var src = $(this).attr("src");
                var src_on;

                if (src.substring(src.length, src.length - 7) != "_on.gif") {
                    src_on = src.substr(0, src.length - 4) + "_on.gif";
                } else {
                    src_on = src.substr(0, src.length - 7) + ".gif";
                }

                $(this).attr("src", src_on);
            });
        });


       

        $("#btnDistance").click(function () {
            //alert('btnStopMarker');
            //stopMarker();

            isDistancePaintActive = !isDistancePaintActive;

            if (isDistancePaintActive) {

                // 면적측정 종료 처리
                if (isAreaPolygonPaintActive) {
                    setAreaPolygonEnd();
                    isAreaPolygonPaintActive = false;
                }

                // 거리측정 폴리라인 생성
                createDistancePolyline();
            } else {
                setDistanceEnd();
            }

        });


        $("#btnPolygonArea").click(function () {
            //alert('btnStopMarker');
            //stopMarker();

            isAreaPolygonPaintActive = !isAreaPolygonPaintActive;

            if (isAreaPolygonPaintActive) {

                // 거리측정 종료 처리
                if (isDistancePaintActive) {
                    setDistanceEnd();
                    isDistancePaintActive = false;
                }

                // 면적측정 폴리곤 생성
                createAreaPolygon();

            } else {
                setDistanceEnd();
            }

        });


        $("#btnInit").click(function () {

            
            objDistanceMarkers.clear();
            objDistancePolylines.clear();
            objDistanceLabels.clear();

            objAreaPolygons.clear();
            

            iToolsIndex = 0;
            iMarkerIndex = 0;
            
        });
    })(jQuery);
}


s1_DistancePaint = function () {
    this._obj = new Object();
}

s1_DistancePaint.prototype = {
    put: function (key, value, index) {
        this._obj[key] = value;
        this._obj[key].index = index;
    },
    get: function (key) {
        return this._obj[key];
    },
    containsKey: function (key) {
        return key in this._obj;
    },
    containsValue: function (value) {
        for (var prop in this._obj) {
            if (this._obj[prop] == value)
                return true;
        }
        return false;
    },
    isEmpty: function (key) {
        return (this.size() == 0);
    },
    clear: function () {
        for (var prop in this._obj) {
            this._obj[prop].setMap(null);
            delete this._obj[prop];

        }
    },
    remove: function (key) {
        delete this._obj[key];
    },
    keys: function () {
        var keys = new Array();
        for (var prop in this._obj) {
            keys.push(prop);
        }
        return keys;
    },
    values: function () {
        var values = new Array();
        for (var prop in this._obj) {
            values.push(this._obj[prop]);
        }
        return values;
    },
    size: function () {
        var count = 0;
        for (var prop in this._obj) {
            count++;
        }
        return count;
    }
}

// 거리측정 종료 처리
function setDistanceEnd() {
    clearDistanceViewPopup();
    endDistancePaint();
}

// 거리측정 종료 처리
function setAreaPolygonEnd() {
    clearDistanceViewPopup();
    endAreaPolygonPaint();
}



// 거리측정 활성화
function createDistancePolyline() {

    // 총거리 초기화
    iDistanceTotal = 0;

    // Polyline 인덱스
    if (this.isDistancePaintActive) {
        iToolsIndex++;
    }

    //$(document).css("cursor", "url('/Content/resources/images/mapTools/icon_distance.gif'");
}


 /* 다음 마커 이미지 전용 */
function setMarkerImage(marker, src) {
	//처음에는 기본마커가 나오기 때문에 아예 마커를 표시하지 않는다.
	marker.setImage(new daum.maps.MarkerImage( '',
		new daum.maps.Size(0, 0)));

	var img = new Image();
	img.src = src;
	
	img.onload = function() {
		var markerImage = new daum.maps.MarkerImage(
			src,
			new daum.maps.Size(img.width, img.height), new daum.maps.Point(img.width/2, img.height/2));
			
		marker.setImage(markerImage);
		delete markerImage;
	};
	delete img;
}

// 거리측정 마커 생성
function addDistancePaintMarker(latLng) {



    var marker_carmoving_pick = getContextPath()+"/resources/images/common/mapTools/ico_car_going.png";
    //var marker_carmoving_pick = getContextPath()+"/resources/images/common/mapTools/img_new_arrow.png";


    var marker = new daum.maps.Marker({
        position: latLng,
        map: map,
        title: latLng.getLat() + " : " + latLng.getLng(),
        zIndex: 5484
    });
	setMarkerImage(marker, marker_carmoving_pick);

    //marker.pos = latlngFromParent;
    marker.D_carPos = latLng;
    marker.D_AddedDistanceText = "0m";

    // 폴리 라인 추가
    addDistancePaintPolyline(marker);


    // Marker 고유 인덱스
    iMarkerIndex++;

    // 마커 리스트에 추가
    //arrDistancePaintMarkers.push(marker);
    objDistanceMarkers.put(iMarkerIndex, marker, iToolsIndex);



    daum.maps.event.addListener(marker, 'click', (function (marker) {
        return function () {

            var geocoder = new daum.maps.services.Geocoder();
            var emer_location = new daum.maps.LatLng(marker.D_carPos.getLat(), marker.D_carPos.getLng());

			/*geocoder.coord2addr( emer_location, function(status, result) {*/              
			geocoder.coord2Address( emer_location.getLng(),emer_location.getLat() , function(result, status) {
					
                                var htmls = "<div style='width:330px; height:230px; padding:5px;'> "

                                if (status == daum.maps.services.Status.OK) {

                                    htmls += " <br>현재위치 : " + result[0].address.address_name;
                                } else {
                                    htmls += " <br>현재위치 : *위치정보 조회 실패"
                                }

                                htmls += " <br>누적거리 : " + marker.D_AddedDistanceText;
                                htmls += " <br><img src='https://maps.googleapis.com/maps/api/streetview?size=300x150&location=" + marker.D_carPos.getLat() + "," + marker.D_carPos.getLng() + "&heading=" + marker.dBering + "&sensor=false'  />";
                                htmls += "</span></div>";

                                infowindow.close();
                                infowindow.setContent(htmls);
                                infowindow.open(map, marker);

                                // content to titles
                                //infowindow.open(map, null);
                            });

        }
    })(marker));


}

//Marker Polyline 그리기 S.
function addDistancePaintPolyline(marker) {


    // 이전 마커의 인덱스 찾기
    if (objDistanceMarkers.get(iMarkerIndex) && objDistanceMarkers.get(iMarkerIndex).index == iToolsIndex) {

        //var prevDistancePaintMarker = arrDistancePaintMarkers[arrDistancePaintMarkers.length - 1];
        var prevDistancePaintMarker = objDistanceMarkers.get(iMarkerIndex);


        //#393  #FF0000
        var points = [];
        /*var lineSymbol = {
            path: daum.maps.SymbolPath.CIRCLE,
            scale: 2,
            strokeColor: '#20CF24',
            offset: '100%'
        };*/

        //var linecolor = "#20CF24";
        var linecolor = "#FF0000";
        var txtDistance = "";
        var iBering = 0;

        points.push(prevDistancePaintMarker.D_carPos, marker.D_carPos);

        var polyLine = new daum.maps.Polyline({
            path: points,
            /*icons: [{
                icon: lineSymbol,
                offset: '100%'
            }],*/
            strokeColor: linecolor,
            strokeOpacity: 0.6,
            strokeWeight: 5

        });


        // 전체 이동거리
        //iDistanceTotal += Math.round(distance(prevDistancePaintMarker.D_carPos, marker.D_carPos));
        //iDistanceTotal += Math.round(daum.maps.geometry.spherical.computeLength(polyLine.getPath()));
		iDistanceTotal += Math.round(polyLine.getLength());

        // 차량 각도
        iBering = getBearing(prevDistancePaintMarker.D_carPos, marker.D_carPos);

        if (iDistanceTotal < 1000) {
            txtDistance = String(iDistanceTotal) + 'm';
        } else {
            txtDistance = String((iDistanceTotal / 1000).toFixed(1)) + 'km';
        }

        marker.title = txtDistance;

        marker.D_AddedDistance = iDistanceTotal;
        marker.D_AddedDistanceText = txtDistance;
        marker.dBering = iBering;
        
        // 거리정보 라벨
        createDistanceLabel(marker, txtDistance);
        

        // new polyline 그리기
        polyLine.setMap(this.map);
        //arrDistancePaintPolylines.push(polyLine);

        //alert(daum.maps.geometry.spherical.computeLength(polyLine.getPath()));
    
        // polyline 고유 인덱스 
        iDistancePolylineIndex++;
        objDistancePolylines.put(iDistancePolylineIndex, polyLine, iToolsIndex);

    } else {
        // 거리정보 라벨
        createDistanceLabel(marker, "시작점");
    }

    delete points, polyLine, linecolor, prevDistancePaintMarker;
}





function createDistanceLabel(marker, txtDistance) {


    //var dwidth = geo_name.length * 10;
    var dwidth = 1;
    dwidth = (dwidth * -1) / 2;

    //#446285
    var default_style = "";
    if (txtDistance == "시작점") {
        if (navigator.appVersion.indexOf("MSIE") != -1) {
            //default_style = "left:" + (dwidth) + "px;border:1px solid #446285;height: 12px; -webkit-user-select: none; line-height: 14px; padding-right: 2px; background-image: -ms-linear-gradient(left, rgba(24,118,5, 0.5) 0px, rgba(24,118,5, 0.5) 50px); background-attachment: scroll; background-repeat: repeat; background-position-x: 0%; background-position-y: 0%; background-size: auto; background-origin: padding-box; background-clip: border-box; background-color: transparent; font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: rgb(255,255,255); white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;";
            //default_style = "left:" + (dwidth) + "px;border:1px solid #ff1009;height: 12px; -webkit-user-select: none; line-height: 14px; padding: 4px; background-color: #ff1009; background-attachment: scroll; background-repeat: repeat; background-position-x: 0%; background-position-y: 0%; background-size: auto; background-origin: padding-box; background-clip: border-box; background-color: transparent; font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: #ffffff; white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;";
            default_style = "left:" + (dwidth) + "px;border:1px solid #ff1009;height: 12px; -webkit-user-select: none; line-height: 14px; padding: 4px; background-color: #ff1009; font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: #ffffff; white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;box-sizing: content-box;";
        } else {
            //default_style = "left:" + (dwidth) + "px;border:1px solid #446285;height: 12px; -webkit-user-select: none; line-height: 14px; padding-right: 2px; background-image: -webkit-linear-gradient(left, rgba(24,118,5, 0.5) 0px, rgba(24,118,5, 0.5) 50px); font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: rgb(255,255,255); white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;";
            default_style = "left:" + (dwidth) + "px;border:1px solid #ff1009;height: 12px; -webkit-user-select: none; line-height: 14px; padding: 4px; background-color: #ff1009; font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: #ffffff; white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;box-sizing: content-box;";
        }
    } else {
        if (navigator.appVersion.indexOf("MSIE") != -1) {
            //default_style = "left:" + (dwidth) + "px;border:1px solid #446285;height: 12px; -webkit-user-select: none; line-height: 14px; padding-right: 2px; background-image: -ms-linear-gradient(left, rgba(24,118,5, 0.5) 0px, rgba(24,118,5, 0.5) 50px); background-attachment: scroll; background-repeat: repeat; background-position-x: 0%; background-position-y: 0%; background-size: auto; background-origin: padding-box; background-clip: border-box; background-color: transparent; font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: rgb(255,255,255); white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;";
            //default_style = "left:" + (dwidth) + "px;border:1px solid #ff1009;height: 12px; -webkit-user-select: none; line-height: 14px; padding-right: 2px; background-color: rgb(245, 245, 245); background-attachment: scroll; background-repeat: repeat; background-position-x: 0%; background-position-y: 0%; background-size: auto; background-origin: padding-box; background-clip: border-box; background-color: transparent; font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: #ff1009; white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;";
            default_style = "left:" + (dwidth) + "px;border:1px solid #ff1009;height: 12px; -webkit-user-select: none; line-height: 14px; padding-right: 2px; background-color: rgb(245, 245, 245); font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: #ff1009; white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;box-sizing: content-box;";
        } else {
            //default_style = "left:" + (dwidth) + "px;border:1px solid #446285;height: 12px; -webkit-user-select: none; line-height: 14px; padding-right: 2px; background-image: -webkit-linear-gradient(left, rgba(24,118,5, 0.5) 0px, rgba(24,118,5, 0.5) 50px); font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: rgb(255,255,255); white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;";
            default_style = "left:" + (dwidth) + "px;border:1px solid #ff1009;height: 12px; -webkit-user-select: none; line-height: 14px; padding-right: 2px; background-color: rgb(245, 245, 245); font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: #ff1009; white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;box-sizing: content-box;";
        }
    }



    var labelHtml = "<div style='position:relative;z-index:1010;background-color:white;'>";
    if (navigator.appVersion.indexOf("MSIE 8.0") != -1) {
        labelHtml = labelHtml + "<div style='position:absolute;top:-15px;" + default_style + "'>" + txtDistance + "</div>";
    } else if (navigator.appVersion.indexOf("safari") != -1) {
        labelHtml = labelHtml + "<div style='position:absolute;top:-20px;" + default_style + "'>" + txtDistance + "</div>";
    } else {
        labelHtml = labelHtml + "<div style='position:absolute; top:10px;" + default_style + "'>" + txtDistance + "</div>";
    }
    labelHtml = labelHtml + "</div>";

	var label_opt = {
		pos: marker.getPosition(),
		text: labelHtml,
		visible : marker.getVisible(),
		top: 10, 
		left: -5,
		zIndex: 555100
	};
    var _label = new Label( this.map, label_opt );
    
    //_label.bindTo('position', marker, 'position');
    //_label.set('text', labelHtml);
    //_label.set('zIndex', 100);
    //_label.bindTo('visible', marker);
	

    iDistanceLabelIndex++;
    //arrDistancePaintLabels.push(_label);
    objDistanceLabels.put(iDistanceLabelIndex, _label, iToolsIndex);
	
	delete _label, label_opt;

}

function endDistancePaint() {

    var objLabel;

    //임시 폴리라인 삭제
    objDistanceTempPolylines.clear();

    //시작점만 있는경우
    if (iDistanceTotal == 0) {
        clearDistancePolyline(iToolsIndex);
    }

    // 이전 마커의 인덱스 찾기
    if (objDistanceLabels.get(iDistanceLabelIndex) && iDistanceTotal > 0) {
        objLabel = objDistanceLabels.get(iDistanceLabelIndex);

        //var dwidth = geo_name.length * 10;
        var dwidth = 28;
        dwidth = (dwidth * -1) / 2;


        // 도보 
        var iWorkMinute = Math.round((2 * objDistanceMarkers.get(iMarkerIndex).D_AddedDistance) / 100); // 2분당 100m
        var iWorkMinuteText = "";
        if (iWorkMinute < 60) {
            iWorkMinuteText = String(iWorkMinute) + '분';
        } else {
            iWorkMinuteText += String((iWorkMinute / 60).toFixed()) + '시간';
            iWorkMinuteText += String(iWorkMinute - (Math.ceil(iWorkMinute / 60.0) - 1) * 60) + '분';
        }


        var iBikeMinute = String(Math.round((1 * objDistanceMarkers.get(iMarkerIndex).D_AddedDistance) / 100)); // 1분당 100m
        var iBikeMinuteText = "";
        if (iBikeMinute < 60) {
            iBikeMinuteText = String(iBikeMinute) + '분';
        } else {
            iBikeMinuteText += String((iBikeMinute / 60).toFixed()) + '시간';
            iBikeMinuteText += String(iBikeMinute - (Math.ceil(iBikeMinute / 60.0) - 1) * 60) + '분';
        }


        //#446285
        var default_style = "";

        if (navigator.appVersion.indexOf("MSIE") != -1) {
            //default_style = "left:" + (dwidth) + "px;border:1px solid #446285;height: 12px; -webkit-user-select: none; line-height: 14px; padding-right: 2px; background-image: -ms-linear-gradient(left, rgba(24,118,5, 0.5) 0px, rgba(24,118,5, 0.5) 50px); background-attachment: scroll; background-repeat: repeat; background-position-x: 0%; background-position-y: 0%; background-size: auto; background-origin: padding-box; background-clip: border-box; background-color: transparent; font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: rgb(255,255,255); white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;";
            //default_style = "left:" + (dwidth) + "px;border:1px solid #ff1009;height: 70px; -webkit-user-select: none; line-height: 14px; padding-left: 4px;padding-right: 4px; background-color: rgb(245, 245, 245); background-attachment: scroll; background-repeat: repeat; background-position-x: 0%; background-position-y: 0%; background-size: auto; background-origin: padding-box; background-clip: border-box; background-color: transparent; font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: #ff1009; white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;";
            default_style = "left:" + (dwidth) + "px;border:1px solid #ff1009; -webkit-user-select: none; line-height: 14px; padding-top: 1px; padding-left: 4px;padding-right: 4px; background-color: rgb(245, 245, 245);  font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: #ff1009; white-space: nowrap; direction: ltr; text-align: left; background-position: initial; background-repeat: initial;";
        } else {
            //default_style = "left:" + (dwidth) + "px;border:1px solid #446285;height: 12px; -webkit-user-select: none; line-height: 14px; padding-right: 2px; background-image: -webkit-linear-gradient(left, rgba(24,118,5, 0.5) 0px, rgba(24,118,5, 0.5) 50px); font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: rgb(255,255,255); white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;";
            default_style = "left:" + (dwidth) + "px;border:1px solid #ff1009; -webkit-user-select: none; line-height: 14px; padding-top: 1px; padding-left: 4px;padding-right: 4px; background-color: rgb(245, 245, 245); font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: #ff1009; white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial ;";
        }


        var labelHtml = "<div style='position:relative;z-index:1010;background-color:white;text-decoration:blink;'>";
        if (navigator.appVersion.indexOf("MSIE") != -1) {
            labelHtml = labelHtml + "<div style='position:absolute;top:7px;" + default_style + "font-weight:bold;'><a href=\"javascript:void(0);\" style=\"text-decoration: blink;color:#ff1009;\" onclick=\"clearDistancePolyline('" + objDistanceLabels.get(iDistanceLabelIndex).index + "');\">X</a></div>";
            //labelHtml = labelHtml + "<div style='position:absolute;top:-22px" + default_style + "'><span style=\"color:#000000\">총거리 : </span>" + objDistanceMarkers.get(iMarkerIndex).D_AddedDistanceText + "</div>";
            labelHtml += "<div style='position:absolute;top:25px;" + default_style + "'> ";
            labelHtml += "   <ul style=\"display: inline;list-style: none;-webkit-padding-start: 1px;\"> ";
            labelHtml += "       <li style=\"text-decoration: none;\"><span style=\"color:#000000\">총거리 : </span>" + objDistanceMarkers.get(iMarkerIndex).D_AddedDistanceText + "</li> ";
            labelHtml += "       <li><span style=\"color:#000000\">도&nbsp;&nbsp;&nbsp;보 : </span>" + iWorkMinuteText + "</li> ";
            labelHtml += "       <li><span style=\"color:#000000\">자전거 : </span>" + iBikeMinuteText + "</li>";
            labelHtml += "   </ul>";
            labelHtml += "</div>";
        } else if (navigator.appVersion.indexOf("safari") != -1) {
            labelHtml = labelHtml + "<div style='position:absolute;top:7px;" + default_style + "font-weight:bold;'><a href=\"javascript:void(0);\" style=\"text-decoration: blink;color:#ff1009;\" onclick=\"clearDistancePolyline('" + objDistanceLabels.get(iDistanceLabelIndex).index + "');\">X</a></div>";
            //labelHtml = labelHtml + "<div style='position:absolute;top:-27px;" + default_style + "'><span style=\"color:#000000\">총거리 : </span>" + objDistanceMarkers.get(iMarkerIndex).D_AddedDistanceText + "</div>";
            labelHtml += "<div style='position:absolute;top:23px;" + default_style + "'> ";
            labelHtml += "   <ul style=\"display: inline;list-style: none;-webkit-padding-start: 1px;\"> ";
            labelHtml += "       <li style=\"text-decoration: none;\"><span style=\"color:#000000\">총거리 : </span>" + objDistanceMarkers.get(iMarkerIndex).D_AddedDistanceText + "</li> ";
            labelHtml += "       <li><span style=\"color:#000000\">도&nbsp;&nbsp;&nbsp;보 : </span>" + iWorkMinuteText + "</li> ";
            labelHtml += "       <li><span style=\"color:#000000\">자전거 : </span>" + iBikeMinuteText + "</li>";
            labelHtml += "   </ul>";
            labelHtml += "</div>";
        } else {
            labelHtml = labelHtml + "<div style='position:absolute; top:7px;" + default_style + "font-weight:bold;'><a href=\"javascript:void(0);\" style=\"text-decoration: blink;color:#ff1009;\" onclick=\"clearDistancePolyline('" + objDistanceLabels.get(iDistanceLabelIndex).index + "');\">X</a></div>";
            //labelHtml = labelHtml + "<div style='position:absolute; top:10px;" + default_style + "'><span style=\"color:#000000\">총거리 : </span>" + objDistanceMarkers.get(iMarkerIndex).D_AddedDistanceText + "</div>";
            labelHtml += "<div style='position:absolute;top:23px;" + default_style + "'> ";
            labelHtml += "   <ul style=\"display: inline;list-style: none;-webkit-padding-start: 1px;\"> ";
            labelHtml += "       <li style=\"text-decoration: none;\"><span style=\"color:#000000\">총거리 : </span>" + objDistanceMarkers.get(iMarkerIndex).D_AddedDistanceText + "</li> ";
            labelHtml += "       <li><span style=\"color:#000000\">도&nbsp;&nbsp;&nbsp;보 : </span>" + iWorkMinuteText + "</li> ";
            labelHtml += "       <li><span style=\"color:#000000\">자전거 : </span>" + iBikeMinuteText + "</li>";
            labelHtml += "   </ul>";
            labelHtml += "</div>";
        }
        labelHtml = labelHtml + "</div>";

		
		objLabel.pos_ = objDistanceMarkers.get(iMarkerIndex).getPosition();
		objLabel.span_.innerHTML = labelHtml;
		objLabel.draw();
		
        //objLabel.bindTo('position', objDistanceMarkers.get(iMarkerIndex), 'position');
        //objLabel.set('text', labelHtml);
        //objLabel.set('zIndex', 100);
    }

    delete objLabel, dwidth, labelHtml;

}





// 면적측정 활성화
function createAreaPolygon() {

    // 총거리 초기화
    iDistanceTotal = 0;

    // Polyline 인덱스
    if (this.isAreaPolygonPaintActive) {
        iToolsIndex++;
    }

}


// 면적측정 마커 생성
function addAreaPolygonMarker(latLng) {

    //var marker_carmoving_pick = getContextPath()+"/resources/images/common/mapTools/ico_car_going.png";
    var marker_carmoving_pick = getContextPath()+"/resources/images/common/mapTools/img_new_arrow.png";
    //var marker_carmoving_pick = getContextPath()+"/resources/images/common/mapTools/img_path.gif";


    var marker = new daum.maps.Marker({
        position: latLng,
        map: map,        
        title: latLng.getLat() + " : " + latLng.getLng(),
        zIndex: 5554
    });
	setMarkerImage(marker, marker_carmoving_pick);

    //marker.pos = latlngFromParent;
    marker.D_carPos = latLng;

    // 폴리곤 라인 추가
    addAreaPolygon(marker);

    // Marker 고유 인덱스
    iMarkerIndex++;

    // 마커 리스트에 추가
    //arrDistancePaintMarkers.push(marker);
    objDistanceMarkers.put(iMarkerIndex, marker, iToolsIndex);


    daum.maps.event.addListener(marker, 'click', (function (marker) {
        return function () {

		var geocoder = new daum.maps.services.Geocoder();
            var emer_location = new daum.maps.LatLng(marker.D_carPos.getLat(), marker.D_carPos.getLng());

			/*geocoder.coord2addr( emer_location, function(status, result) {*/              
			geocoder.coord2Address( emer_location.getLng(),emer_location.getLat() , function(result, status) {
					
                                var htmls = "<div style='width:330px; height:230px; padding:5px;'> "

                                if (status == daum.maps.services.Status.OK) {

                                    htmls += " <br>현재위치 : " + result[0].address.address_name;
                                } else {
                                    htmls += " <br>현재위치 : *위치정보 조회 실패"
                                }

                                htmls += " <br><img src='https://maps.googleapis.com/maps/api/streetview?size=300x150&location=" + marker.D_carPos.getLat() + "," + marker.D_carPos.getLng() + "&heading=" + marker.dBering + "&sensor=false'  />";
                                htmls += "</span></div>";

                                infowindow.close();
                                infowindow.setContent(htmls);
                                infowindow.open(map, marker);

                                // content to titles
                                //infowindow.open(map, null);
                            });
        }
    })(marker));
}


//Marker Polyline 그리기 S.
function addAreaPolygon(marker) {
    

    // 이전 마커의 인덱스 찾기
    if (objDistanceMarkers.get(iMarkerIndex) && objDistanceMarkers.get(iMarkerIndex).index == iToolsIndex) {

        var prevDistancePaintMarker = objDistanceMarkers.get(iMarkerIndex-1);

        marker.title = "";

        // 기존 폴리곤 지우기 
        var keys = objAreaPolygons.keys();
        var tempObj;
        for (var i = 0; i < objAreaPolygons.size() ; i++) {
            tempObj = objAreaPolygons.get(keys[i]);

            if (tempObj.index == iToolsIndex) {
                tempObj.setMap(null);
            }
        }

        //var arrPolygon = new daum.maps.MVCArray();
		var arrPolygon = new Array();

        for (var i = 1; i <= objDistanceMarkers.size() ; i++) {
            if (objDistanceMarkers.get(i) && objDistanceMarkers.get(i).index == iToolsIndex) {
                arrPolygon.push(objDistanceMarkers.get(i).D_carPos);
            }
        }

        arrPolygon.push(marker.D_carPos);


        polygon = new daum.maps.Polygon({
            //strokeColor: '#FF0000',
            strokeColor: '#5B67D9',
            strokeOpacity: 0.8,
            strokeWeight: 3,
            strokeColor: '#5B67D9',
            fillOpacity: 0.2,
            path: arrPolygon
        });



        // new polyline 그리기
        polygon.setMap(this.map);

        // polyline 고유 인덱스 
        iAreaPolygonIndex++;
        objAreaPolygons.put(iAreaPolygonIndex, polygon, iToolsIndex);

    } else {
        
    }

    delete polygon, prevDistancePaintMarker, arrPolygon;
}


function endAreaPolygonPaint() {

  
    
    //임시 폴리라인 삭제
    objAreaTempPolygons.clear();

    var polygon = objAreaPolygons.get(iAreaPolygonIndex);
    var area = "0m";

    var dwidth = 28;
    dwidth = (dwidth * -1) / 2;

    //#446285
    var default_style = "";

    if (polygon.getPath().length > 2) {

        //area = daum.maps.geometry.spherical.computeArea(polygon.getPath());
		//area = polygon.getLenght();
		area = Math.round(polygon.getArea());

        
        if (area < (1000*1000)) {
            area = String(area.toFixed(0)).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + 'm<sup style=\"vertical-align: super;line-height: 0;font-size: 0.83em;\">2</sup>';
        } else {
            area = String((area / (1000*1000)).toFixed(0)).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + 'km<sup style=\"vertical-align: super;line-height: 0;font-size: 0.83em;\">2</sup>';
        }
        
        //area = String(area.toFixed(1));
        //alert(area); //this is not working
        
     // new polyline 그리기
        polygon.setMap(this.map);

    }



    if (navigator.appVersion.indexOf("MSIE") != -1) {
        //default_style = "left:" + (dwidth) + "px;border:1px solid #446285;height: 12px; -webkit-user-select: none; line-height: 14px; padding-right: 2px; background-image: -ms-linear-gradient(left, rgba(24,118,5, 0.5) 0px, rgba(24,118,5, 0.5) 50px); background-attachment: scroll; background-repeat: repeat; background-position-x: 0%; background-position-y: 0%; background-size: auto; background-origin: padding-box; background-clip: border-box; background-color: transparent; font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: rgb(255,255,255); white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;";
        //default_style = "left:" + (dwidth) + "px;border:1px solid #ff1009;height: 70px; -webkit-user-select: none; line-height: 14px; padding-left: 4px;padding-right: 4px; background-color: rgb(245, 245, 245); background-attachment: scroll; background-repeat: repeat; background-position-x: 0%; background-position-y: 0%; background-size: auto; background-origin: padding-box; background-clip: border-box; background-color: transparent; font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: #ff1009; white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;";
        default_style = "left:" + (dwidth) + "px;border:1px solid #ff1009; -webkit-user-select: none; line-height: 14px; padding-top: 4px; padding-left: 4px;padding-right: 4px; background-color: rgb(245, 245, 245);  font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: #ff1009; white-space: nowrap; direction: ltr; text-align: left; background-position: initial; background-repeat: initial;";
    } else {
        //default_style = "left:" + (dwidth) + "px;border:1px solid #446285;height: 12px; -webkit-user-select: none; line-height: 14px; padding-right: 2px; background-image: -webkit-linear-gradient(left, rgba(24,118,5, 0.5) 0px, rgba(24,118,5, 0.5) 50px); font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: rgb(255,255,255); white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;";
        default_style = "left:" + (dwidth) + "px;border:1px solid #ff1009; -webkit-user-select: none; line-height: 14px; padding-left: 4px;padding-right: 4px; background-color: rgb(245, 245, 245); font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: #ff1009; white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial ;";
    }

    iDistanceLabelIndex++;

    var labelHtml = "<div style='position:relative;z-index:1010;background-color:white;text-decoration:blink;'>  ";
    labelHtml += "<div style='position:absolute; top:7px;" + default_style + "font-weight:bold;'><a href=\"javascript:void(0);\" style=\"text-decoration: blink;color:#ff1009;\" onclick=\"clearAreaPolygon('" + objDistanceMarkers.get(iMarkerIndex).index + "');\">X</a></div>";
    labelHtml += "<div style='position:absolute;top:23px;" + default_style + ";width:100px'> ";
    labelHtml += "   <ul style=\"display: inline;list-style: none;-webkit-padding-start: 1px;\"> ";
    labelHtml += "       <li > ";
    labelHtml += "          <span style=\"display:block;color:#000000;text-align:left;width:80px;\">총면적 : </span><span style=\"display:block;width:80px;text-align:right\">" + area;
    labelHtml += "          </span></li> ";
    labelHtml += "   </ul>";
    labelHtml += "</div>";
    labelHtml = labelHtml + "</div>";

	var label_opt = {
		pos: objDistanceMarkers.get(iMarkerIndex).getPosition(),
		text: labelHtml,
		visible : objDistanceMarkers.get(iMarkerIndex).getVisible(),
		top: 10, 
		left: -5,
		zIndex: 555100
	};
    var objLabel = new Label( this.map, label_opt );
	//objLabel.setMap(this.map);
    //objLabel.bindTo('position', objDistanceMarkers.get(iMarkerIndex), 'position');
    //objLabel.set('text', labelHtml);
    //objLabel.set('zIndex', 100);
    //objLabel.bindTo('visible', objDistanceMarkers.get(iMarkerIndex));


    
    //arrDistancePaintLabels.push(_label);
    objDistanceLabels.put(iDistanceLabelIndex, objLabel, iToolsIndex);
 
    delete objLabel, dwidth, labelHtml, label_opt;
}

function GetViewPopup(event) {


    // 이전 마커의 인덱스 찾기
    if (objDistanceMarkers.get(iMarkerIndex) && objDistanceMarkers.get(iMarkerIndex).index == iToolsIndex) {


        //var arrPolyline = new daum.maps.MVCArray();
		var arrPolyline = new Array();

        //var dwidth = geo_name.length * 10;
        var dwidth = 4;
        dwidth = (dwidth * -1) / 2;

        var txtDistance = "";
        var prevDistancePaintMarker = objDistanceMarkers.get(iMarkerIndex);
        //var iDistance = Math.round(distance(prevDistancePaintMarker.D_carPos, event.latLng)) + iDistanceTotal;

        arrPolyline.push(prevDistancePaintMarker.D_carPos);
        arrPolyline.push(event.latLng);

        //var iDistance = Math.round(daum.maps.geometry.spherical.computeLength(arrPolyline)) + iDistanceTotal;
		//var iDistance = Math.round(arrPolyline.getLength()) + iDistanceTotal;
        //iDistanceTotal += Math.round(daum.maps.geometry.spherical.computeLength(polyLine.getPath()));


        // 임시 Poly 그리기  S. //////////////////
        //#393  #FF0000
        objDistanceTempPolylines.clear();

        var points = [];
        /*var lineSymbol = {
            path: daum.maps.SymbolPath.CIRCLE,
            scale: 2,
            strokeColor: '#20CF24',
            offset: '100%'
        };*/

        //var linecolor = "#20CF24";
        var linecolor = "#FF0000";

        points.push(prevDistancePaintMarker.D_carPos, event.latLng);


        var polyLine = new daum.maps.Polyline({
            path: points,
            /*icons: [{
                icon: lineSymbol,
                offset: '100%'
            }],*/
            strokeColor: linecolor,
            strokeOpacity: 0.3,
            strokeWeight: 5,
            clickable: false,
            draggable: false,
            editable: false

        });

        // new polyline 그리기
        polyLine.setMap(this.map);

        objDistanceTempPolylines.put(0, polyLine);

        // 임시 Poly 그리기  E. //////////////////

		var iDistance = Math.round(polyLine.getLength()) + iDistanceTotal;

        if (iDistance < 1000) {
            txtDistance = String(iDistance) + 'm';
        } else {
            txtDistance = String((iDistance / 1000).toFixed(1)) + 'km';
        }

        // 도보 
        var iWorkMinute = String(Math.round((2 * iDistance) / 100)); // 2분당 100m
        var iWorkMinuteText = "";
        if (iWorkMinute < 60) {
            iWorkMinuteText = String(iWorkMinute) + '분';
        } else {
            iWorkMinuteText += String((iWorkMinute / 60).toFixed()) + '시간';
            iWorkMinuteText += String(iWorkMinute - (Math.ceil(iWorkMinute / 60.0) - 1) * 60) + '분';
        }


        var iBikeMinute = String(Math.round((1 * iDistance) / 100)); // 1분당 100m
        var iBikeMinuteText = "";
        if (iBikeMinute < 60) {
            iBikeMinuteText = String(iBikeMinute) + '분';
        } else {
            iBikeMinuteText += String((iBikeMinute / 60).toFixed()) + '시간';
            iBikeMinuteText += String(iBikeMinute - (Math.ceil(iBikeMinute / 60.0) - 1) * 60) + '분';
        }

        //#446285
        var default_style = "";
        if (navigator.appVersion.indexOf("MSIE") != -1) {
            //default_style = "left:" + (dwidth) + "px;border:1px solid #446285;height: 12px; -webkit-user-select: none; line-height: 14px; padding-right: 2px; background-image: -ms-linear-gradient(left, rgba(24,118,5, 0.5) 0px, rgba(24,118,5, 0.5) 50px); background-attachment: scroll; background-repeat: repeat; background-position-x: 0%; background-position-y: 0%; background-size: auto; background-origin: padding-box; background-clip: border-box; background-color: transparent; font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: rgb(255,255,255); white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;";
            //default_style = "left:" + (dwidth) + "px;border:1px solid #ff1009;height: 120px; -webkit-user-select: none; line-height: 14px; padding-left: 4px;padding-right: 4px; background-color: rgb(245, 245, 245); background-attachment: scroll; background-repeat: repeat; background-position-x: 0%; background-position-y: 0%; background-size: auto; background-origin: padding-box; background-clip: border-box; background-color: transparent; font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: #ff1009; white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;";
            default_style = "left:" + (dwidth) + "px;border:1px solid #ff1009;height: 120px; -webkit-user-select: none; line-height: 14px; padding-top: 5px; padding-left: 4px;padding-right: 4px; background-color: rgb(245, 245, 245); font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: #ff1009; white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;";
        } else {
            //default_style = "left:" + (dwidth) + "px;border:1px solid #446285;height: 12px; -webkit-user-select: none; line-height: 14px; padding-right: 2px; background-image: -webkit-linear-gradient(left, rgba(24,118,5, 0.5) 0px, rgba(24,118,5, 0.5) 50px); font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: rgb(255,255,255); white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;";
            default_style = "left:" + (dwidth) + "px;border:1px solid #ff1009;height: 120px; -webkit-user-select: none; line-height: 14px; padding-top: 5px; padding-left: 4px;padding-right: 4px; background-color: rgb(245, 245, 245); font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: #ff1009; white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;";
        }

        //{ 'position': 'absolute', 'top': event.point.y+240, 'left': event.point.x+30 })
        //var labelHtml = "<div id='divDistanceViewPopup' style='position:relative;z-index:1010;background-color:white;text-decoration:blink;'>";
        var labelHtml = "<div id='divDistanceViewPopup' style='position:absolute;top:" + (event.point.y + 5) + "px;left:" + (event.point.x + 5) + "px;z-index:1010;background-color:white;text-decoration:blink;'>";
        //if (navigator.appVersion.indexOf("MSIE 8.0") != -1) {
        //    labelHtml = labelHtml + "<div style='position:absolute;top:-12px" + default_style + "'><span style=\"color:#000000\">총거리 : </span>" + txtDistance + "</div>";
        //} else if (navigator.appVersion.indexOf("safari") != -1) {
        //    labelHtml = labelHtml + "<div style='position:absolute;top:-17px;" + default_style + "'><span style=\"color:#000000\">총거리 : </span>" + txtDistance + "</div>";
        //} else {
        labelHtml += "<div style='position:absolute;top:0px;" + default_style + "'> ";
        labelHtml += "   <ul style=\"display: inline;list-style: none;\"> ";
        labelHtml += "       <li style=\"text-decoration: none;\"><span style=\"color:#000000\">총거리 : </span>" + txtDistance + "</li> ";
        labelHtml += "       <li><span style=\"color:#000000\">도&nbsp;&nbsp;&nbsp;보 : </span>" + iWorkMinuteText + "</li> ";
        labelHtml += "       <li><span style=\"color:#000000\">자전거 : </span>" + iBikeMinuteText + "</li>";
        labelHtml += "       <li><hr><span style=\"color:#000000;text-align:center;\">마우스 오른쪽 버튼<br>또는 키보드esc를<br>누르면 마침</li>";
        labelHtml += "   </ul>";
        labelHtml += "</div>";

        //}
        labelHtml = labelHtml + "</div>";

    }


    return labelHtml;

    delete dwidth, labelHtml, arrPolyline;

}



function GetAreaPolygonViewPopup(event) {


    // 이전 마커의 인덱스 찾기
    if (objDistanceMarkers.get(iMarkerIndex) && objDistanceMarkers.get(iMarkerIndex).index == iToolsIndex) {

        objAreaTempPolygons.clear();

        // 기존 폴리곤 지우기 
        var keys = objAreaPolygons.keys();
        var tempObj;
        for (var i = 0; i < objAreaPolygons.size() ; i++) {
            tempObj = objAreaPolygons.get(keys[i]);

            if (tempObj.index == iToolsIndex) {
                tempObj.setMap(null);
            }
        }


        //var arrPolygon = new daum.maps.MVCArray();
		var arrPolygon = new Array();

        for (var i = 1; i <= objDistanceMarkers.size() ; i++) {
            if (objDistanceMarkers.get(i) && objDistanceMarkers.get(i).index == iToolsIndex) {
                arrPolygon.push(objDistanceMarkers.get(i).D_carPos);
            }
        }

        arrPolygon.push(event.latLng);

        polygon = new daum.maps.Polygon({
            //strokeColor: '#FF0000',
            strokeColor: '#5B67D9',
            strokeOpacity: 0.8,
            strokeWeight: 3,
            strokeColor: '#5B67D9',
            fillOpacity: 0.2,
            path: arrPolygon,
            clickable: false,
            draggable: false,
            editable: false

        });

        objAreaTempPolygons.put(0, polygon);

        // new polygon 그리기
    	polygon.setMap(this.map);
    	
        var area = "0m";

        var dwidth = 28;
        dwidth = (dwidth * -1) / 2;

        //#446285
        var default_style = "";
        
        

        if (polygon.getPath().length > 2) {

            

            //area = daum.maps.geometry.spherical.computeArea(polygon.getPath());
			area = Math.round(polygon.getLength());

            if (area < (1000 * 1000)) {
                area = String(area.toFixed(0)).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + 'm<sup style=\"vertical-align: super;line-height: 0;font-size: 0.83em;\">2</sup>';
            } else {
                area = String((area / (1000 * 1000)).toFixed(0)).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + 'km<sup style=\"vertical-align: super;line-height: 0;font-size: 0.83em;\">2</sup>';
            }

        }


        // 임시 Polygon 그리기  E. //////////////////


        //#446285
        var default_style = "";
        if (navigator.appVersion.indexOf("MSIE") != -1) {
            //default_style = "left:" + (dwidth) + "px;border:1px solid #446285;height: 12px; -webkit-user-select: none; line-height: 14px; padding-right: 2px; background-image: -ms-linear-gradient(left, rgba(24,118,5, 0.5) 0px, rgba(24,118,5, 0.5) 50px); background-attachment: scroll; background-repeat: repeat; background-position-x: 0%; background-position-y: 0%; background-size: auto; background-origin: padding-box; background-clip: border-box; background-color: transparent; font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: rgb(255,255,255); white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;";
            //default_style = "left:" + (dwidth) + "px;border:1px solid #ff1009;height: 120px; -webkit-user-select: none; line-height: 14px; padding-left: 4px;padding-right: 4px; background-color: rgb(245, 245, 245); background-attachment: scroll; background-repeat: repeat; background-position-x: 0%; background-position-y: 0%; background-size: auto; background-origin: padding-box; background-clip: border-box; background-color: transparent; font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: #ff1009; white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;";
            default_style = "left:" + (dwidth) + "px;border:1px solid #ff1009;height: 120px; -webkit-user-select: none; line-height: 14px; padding-top: 4px; padding-left: 4px;padding-right: 4px; background-color: rgb(245, 245, 245); font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: #ff1009; white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;";
        } else {
            //default_style = "left:" + (dwidth) + "px;border:1px solid #446285;height: 12px; -webkit-user-select: none; line-height: 14px; padding-right: 2px; background-image: -webkit-linear-gradient(left, rgba(24,118,5, 0.5) 0px, rgba(24,118,5, 0.5) 50px); font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: rgb(255,255,255); white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;";
            default_style = "left:" + (dwidth) + "px;border:1px solid #ff1009;height: 120px; -webkit-user-select: none; line-height: 14px; padding-top: 4px;padding-left: 4px;padding-right: 4px; background-color: rgb(245, 245, 245); font-family:돋움,Dotum,굴림,Arial,AppleGothic,sans-serif; font-size: 11px; color: #ff1009; white-space: nowrap; direction: ltr; text-align: left; background-position: initial initial; background-repeat: initial initial;";
        }

        //{ 'position': 'absolute', 'top': event.point.y+240, 'left': event.point.x+30 })
        //var labelHtml = "<div id='divDistanceViewPopup' style='position:relative;z-index:1010;background-color:white;text-decoration:blink;'>";
        var labelHtml = "<div id='divDistanceViewPopup' style='position:absolute;top:" + (event.point.y + 5) + "px;left:" + (event.point.x + 5) + "px;z-index:1010;background-color:white;text-decoration:blink;'>";
        //if (navigator.appVersion.indexOf("MSIE 8.0") != -1) {
        //    labelHtml = labelHtml + "<div style='position:absolute;top:-12px" + default_style + "'><span style=\"color:#000000\">총거리 : </span>" + txtDistance + "</div>";
        //} else if (navigator.appVersion.indexOf("safari") != -1) {
        //    labelHtml = labelHtml + "<div style='position:absolute;top:-17px;" + default_style + "'><span style=\"color:#000000\">총거리 : </span>" + txtDistance + "</div>";
        //} else {
        labelHtml += "<div style='position:absolute;top:5px;" + default_style + "'> ";
        labelHtml += "   <ul style=\"display: inline;list-style: none;\"> ";
        if (polygon.getPath().length > 2) {
        	labelHtml += "       <li style=\"text-decoration: none;\"><span style=\"color:#000000\">총면적 : </span>" + area + "<hr></li> ";
        }
        labelHtml += "       <li><span style=\"color:#000000;text-align:center;\">마우스 오른쪽 버튼<br>또는 키보드esc를<br>누르면 마침</li>";
        labelHtml += "   </ul>";
        labelHtml += "</div>";

        //}
        labelHtml = labelHtml + "</div>";

    }


    return labelHtml;

    delete dwidth, labelHtml, arrPolyline;

}


function clearDistanceViewPopup() {

    var obj = document.getElementById("divDistanceViewPopup");
    if (obj)
        obj.innerHTML = "";


    //$.each($("img[name=icon_map]"), function (i) {
    jQuery.each(jQuery("img[name=icon_map]"), function (i) {
        var src = jQuery(this).attr("src");
        var src_on;

        if (src.substring(src.length, src.length - 7) == "_on.gif") {
            src_on = src.substr(0, src.length - 7) + ".gif";
        } 
        jQuery(this).attr("src", src_on);
    });

}



function clearDistancePolyline(index) {

    var keys, tempObj;

    keys = objDistanceMarkers.keys();
    for (var i = 0; i < objDistanceMarkers.size() ; i++) {
        tempObj = objDistanceMarkers.get(keys[i]);

        if (tempObj.index == index) {
            tempObj.setMap(null);
        }
    }

    keys = objDistancePolylines.keys();
    for (var i = 0; i < objDistancePolylines.size() ; i++) {
        tempObj = objDistancePolylines.get(keys[i]);

        if (tempObj.index == index) {
            tempObj.setMap(null);
        }
    }

    keys = objDistanceLabels.keys();
    for (var i = 0; i < objDistanceLabels.size() ; i++) {
        tempObj = objDistanceLabels.get(keys[i]);

        if (tempObj.index == index) {
            tempObj.setMap(null);
        }
    }


    keys = objDistanceTempPolylines.keys();
    for (var i = 0; i < objDistanceTempPolylines.size() ; i++) {
        tempObj = objDistanceTempPolylines.get(keys[i]);

        tempObj.setMap(null);
    }



    delete keys, tempObj;

}


function clearAreaPolygon(index) {

    var keys, tempObj;

    keys = objDistanceMarkers.keys();
    for (var i = 0; i < objDistanceMarkers.size() ; i++) {
        tempObj = objDistanceMarkers.get(keys[i]);
        if (tempObj.index == index) {
            tempObj.setMap(null);
        }
    }

    keys = objAreaPolygons.keys();
    for (var i = 0; i < objAreaPolygons.size() ; i++) {
        tempObj = objAreaPolygons.get(keys[i]);

        if (tempObj.index == index) {
            tempObj.setMap(null);
        }
    }

    keys = objDistanceLabels.keys();
    for (var i = 0; i < objDistanceLabels.size() ; i++) {
        tempObj = objDistanceLabels.get(keys[i]);

        if (tempObj.index == index) {
            tempObj.setMap(null);
        }
    }

    delete keys, tempObj;

}



/*
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

    //  타원체 GRS80 
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
*/

function getBearing(carPos1, carPos2) {

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
			/ (Math.cos(Cur_Lat_radian) * Math.sin(radian_distance))); // acos의
    // 인수로
    // 주어지는
    // x는
    // 360분법의
    // 각도가
    // 아닌
    // radian(호도)값이다.

    var true_bearing = 0;
    if (Math.sin(Dest_Lon_radian - Cur_Lon_radian) < 0) {
        true_bearing = radian_bearing * (180 / 3.141592);
        true_bearing = 360 - true_bearing;
    } else {
        true_bearing = radian_bearing * (180 / 3.141592);
    }

    return true_bearing;
}
