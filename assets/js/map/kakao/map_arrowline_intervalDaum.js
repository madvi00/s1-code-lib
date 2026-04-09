// Polyline with arrows
// Bill Chadwick May 2008 (Ported to v3 by Peter Bennett)
// Free for any use

var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();

//Constructor
function BDCCArrowedPolylineInterval(points, color, weight, opacity, opts, gapPx, headLength, headColor, headWeight, headOpacity, det_timeIE8, det_speedIE8, det_statusIE8, det_gpsIE8, interval) 
{     
    this.gapPx = gapPx;
    this.points = points;
    this.color = color;
    this.weight = weight;
    this.opacity = opacity;
    this.headLength = headLength;
    this.headColor = headColor;
    this.headWeight = headWeight;
    this.headOpacity = headOpacity;
    this.opts = opts;
    this.heads = new Array();
	this.infowindows = new Array();
    this.line = null;
    this.map = map;   
    this.interval = interval;
	//this.setMap(map);	오류발생 호출한 곳에서 생성 후에 setMap하라
}

// Overlay v3
BDCCArrowedPolylineInterval.prototype = new daum.maps.AbstractOverlay();

// onRemove function
BDCCArrowedPolylineInterval.prototype.onRemove = function() {
        
    try
    {
		if (this.line) { this.line.setMap(null); }
		 
		for(var i=0; i<this.heads.length; i++)
		{
		    this.heads[i].setMap(null);
		}
		delete points;
        	
        if (this.line) { this.line.setMap(null); }
        delete points;
		
		for(var i=0; i<this.infowindows.length; i++)
		{
			this.infowindows[i].close();
		    this.infowindows[i].setMap(null);
		}
    }
    catch(ex) { }
}

BDCCArrowedPolylineInterval.prototype.onAdd = function() {

   this.onRemove();
   
   this.line = new daum.maps.Polyline({
                        clickable:true,
                        editable:false,
                        geodesic:false,
                        map:this.map,
                        path:this.points,
                        strokeColor:this.headColor,
                        strokeOpacity:this.headOpacity,
                        strokeWeight:this.headWeight,
                        visible:true
                        });
   
    this.line.obj_my = 'test';
	daum.maps.event.addListener(this.line, 'mousedown', function() {
		//alert(this.obj_my);
		console.log(this.obj_my);
	});

		
   this.load(this.points, "onset");
}

//Returns the triangle icon object
BDCCArrowedPolylineInterval.prototype.addIcon = function(file) {
	var g = daum.maps;

	var icon = new daum.maps.MarkerImage(
		getContextPath() + "/resources/images/realtime/path_img/" + file,
		new daum.maps.Size(20, 20), 
		new daum.maps.Point(7, 7)
	);
	return icon;
};

// Creates markers with corresponding triangle icons
BDCCArrowedPolylineInterval.prototype.create = function(p_1, p_2, p_3, mode, det_timeIE8, det_speedIE8, det_statusIE8, det_gpsIE8) {
	var g = daum.maps;
	var	markerpos = p_1;
		
	var proj = this.getProjection();
	var p1 = proj.pointFromCoords(p_1);	//pointFromCoords
	var p2 = proj.pointFromCoords(p_2);
	var p3 = proj.pointFromCoords(p_3);
	
	var dir = (Math.atan2(p2.y  - p1.y , p2.x  - p1.x ) * 180 / Math.PI) + 90;
	var dir2 = (Math.atan2(p3.y  - p2.y , p3.x  - p2.x ) * 180 / Math.PI) + 90;

	
	//round it to a multiple of 3 and correct unusable numbers
	dir = Math.round(dir / 3) * 3;
	dir2 = Math.round(dir / 3) * 3;
	if( Math.abs(dir-dir2) > 30 ){
		dir = dir2;
	}

	if (dir < 0)
		dir += 360;
	
	/*
	if (dir < 0)
		dir += 240;
	if (dir > 117)
		dir -= 120;
	*/	
	
	//use the corresponding icon
	var icon = this.addIcon("dir_" + dir + ".png");
	var marker = new g.Marker({
		position : markerpos,
		map : map,
		image : icon,
		clickable : true,
		title: det_timeIE8 + "\n" + det_speedIE8 + "km/h"
	});
	
	//운행상태
	if(det_statusIE8 == "5" || det_statusIE8 == "13") { det_statusIE8 = txtSidongOn; /*시동 ON*/ }
	if(det_statusIE8 == "9" || det_statusIE8 == "8") { det_statusIE8 = txtSidongOff; /*시동 OFF*/ }
	
	//GPS신호이상여부
	var txtGpsState = txtMessage11; /*GPS신호이상*/
	if(parseInt(det_gpsIE8) > 2) { txtGpsState = txtMessage12; /*정상*/ }
		
	//방향각 화살표 클릭 이벤트 추가
	var infowindow = new daum.maps.InfoWindow({
		removable: true,
		zIndex : 2147483647	
		//maxWidth: 200
	});
	this.infowindows.push(infowindow);
	
    g.event.addListener(marker, 'click', (function(marker) {
		return function() {
			var uuid = guid();
		
			var strHtml = "";			
			strHtml += "<div class='dm-route-view' style='width:430px'> ";
			strHtml += "	<table border='0' cellpadding='0' cellspacing='0' style='width:400px'> ";
			strHtml += "		<colgroup> ";
			strHtml += "			<col width='70' /><col width='80' /><col width='70' /><col width='80' /> ";
			strHtml += "		</colgroup> ";
			//strHtml += "		<tr><td colspan='4'></td></tr> ";
			strHtml += "		<tr><th>" + txtMessage21 + "</th>";
			strHtml += "			<td colspan='3'>";
			strHtml += "				<span id='" + uuid + "' >.</span>";
			strHtml += "			</td>";
			strHtml += "		</tr> ";			
			strHtml += "		<tr> ";
			strHtml += "			<th>" + txtMessage04 + "</th><td>"+ det_timeIE8 + "</td> ";
			strHtml += "			<th>" + txtMessage17 + "</th><td>"+ det_speedIE8 + " km/h</td> ";
			strHtml += "		</tr> ";
			strHtml += "		<tr> ";
			strHtml += "			<th>" + txtMessage18 + "</th><td >"+ det_statusIE8 + "</td> ";
			strHtml += "			<th>" + txtMessage19 + "</th><td>"+ txtGpsState + "</td> ";
			strHtml += "		</tr> ";
			strHtml += "		<tr><td colspan='4' style='line-height:7px;'>&nbsp;</td></tr> ";
			strHtml += "	</table> ";
			strHtml += "</div> ";						
			infowindow.setContent(strHtml);
			infowindow.open(map, marker);
			
			
			var geocoder = new daum.maps.services.Geocoder(); 
			/*geocoder.coord2addr( markerpos, function(status, result) {*/
			geocoder.coord2Address( markerpos.getLng(),markerpos.getLat() , function(result, status) {
					
				// !!!!infowindow가 개별적으로 띄워진다. id로 만들어서 넣어야 한다. 
				//infowindow.getContent()로 찾아서 여기서 object를 다시 만들어서 띄워버려? 
				if(status == daum.maps.services.Status.OK) {
					document.getElementById(uuid).innerHTML = result[0].address.address_name;
				} else {
					//$(".outer_Realtimedata_list span").text( '변환 실패' );
				}
			});
			
			delete geocoder;
		}
	})(marker));
    
    this.heads.push(marker);
};

BDCCArrowedPolylineInterval.prototype.load = function(points, mode) {
	

	for ( var i = 0; i < points.length - 2; i++) 
	{
		var p1 = points[i], p2 = points[i + 1], p3 = points[i + 2];
		if( i%this.interval == 0 )
		{
			this.create(p1, p2, p3, mode, det_timeIE8[i], det_speedIE8[i], det_statusIE8[i], det_gpsIE8[i]);
		}
	}
};

BDCCArrowedPolylineInterval.prototype.draw = function() { };

BDCCArrowedPolylineInterval.prototype.addHead = function(x,y,theta,zoom) {
    //add an arrow head at the specified point
    var t = theta + (Math.PI/4) ;
    if(t > Math.PI)
        t -= 2*Math.PI;
    var t2 = theta - (Math.PI/4) ;
    if(t2 <= (-Math.PI))
        t2 += 2*Math.PI;
    var pts = new Array();
    var x1 = x-Math.cos(t)*this.headLength;
    var y1 = y+Math.sin(t)*this.headLength;
    var x2 = x-Math.cos(t2)*this.headLength;
    var y2 = y+Math.sin(t2)*this.headLength;

    this.prj = 	null;
    this.prj = 	this.getProjection();
    pts.push(this.prj.fromContainerPixelToLatLng(new daum.maps.Point(x1,y1)));	// !!!! CoordsFromPoint는 제공되지 않음. 
    pts.push(this.prj.fromContainerPixelToLatLng(new daum.maps.Point(x,y)));    
    pts.push(this.prj.fromContainerPixelToLatLng(new daum.maps.Point(x2,y2)));

	var arrow = new daum.maps.Polyline({
										 clickable:false,
										 editable:false,
										 geodesic:false,
										 path:pts,
										 strokeColor:this.color,
										 strokeOpacity:this.opacity,
										 strokeWeight:this.weight,
										 visible:true
										 });
 
    this.heads.push(arrow);
    this.heads[this.heads.length-1].setMap(this.map);
}
