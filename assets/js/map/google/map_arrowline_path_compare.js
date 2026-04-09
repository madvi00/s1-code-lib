// Polyline with arrows
// Bill Chadwick May 2008 (Ported to v3 by Peter Bennett)
// Free for any use

//Constructor
function BDCCArrowedPolylineSimple(points, color, weight, opacity, opts, gapPx, headLength, headColor, headWeight, headOpacity ) 
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
    this.line = null;
    this.map = map;   
    this.setMap(map);
}

// Overlay v3
BDCCArrowedPolylineSimple.prototype = new google.maps.OverlayView();

// onRemove function
BDCCArrowedPolylineSimple.prototype.onRemove = function() {
        
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
    }
    catch(ex) { }
}

BDCCArrowedPolylineSimple.prototype.onAdd = function() {

   this.onRemove();
   
   this.line = new google.maps.Polyline({
                        clickable:false,
                        editable:false,
                        geodesic:false,
                        map:this.map,
                        path:this.points,
                        strokeColor:this.headColor,
                        strokeOpacity:this.headOpacity,
                        strokeWeight:this.headWeight,
                        visible:true
                        });
   
   //this.load(this.points, "onset");
}

/*
//Returns the triangle icon object
BDCCArrowedPolylineSimple.prototype.addIcon = function(file) {
	var g = google.maps;
	var icon = {
		url : "http://www.google.com/mapfiles/" + file,
		size : new g.Size(24, 24),
		anchor : new g.Point(12, 12)
	};
	return icon;
};


// Creates markers with corresponding triangle icons
BDCCArrowedPolylineSimple.prototype.create = function(p_1, p_2, mode, det_timeIE8, det_speedIE8, det_statusIE8, det_gpsIE8) {
	var g = google.maps;
	
	var	markerpos = p_1;
		
	var proj = this.getProjection();
	var p1 = proj.fromLatLngToContainerPixel(p_1)
	var p2 = proj.fromLatLngToContainerPixel(p_2);
	
	var dir = (Math.atan2(p2.y  - p1.y , p2.x  - p1.x ) * 180 / Math.PI) + 90;
	
	//round it to a multiple of 3 and correct unusable numbers
	dir = Math.round(dir / 3) * 3;

	if (dir < 0)
		dir += 240;
	if (dir > 117)
		dir -= 120;
	
	//use the corresponding icon
	var icon = this.addIcon("dir_" + dir + ".png");
	var marker = new g.Marker({
		position : markerpos,
		map : map,
		icon : icon,
		clickable : true
	});
	
	//운행상태
	if(det_statusIE8 == "5" || det_statusIE8 == "13") { det_statusIE8 = "시동 ON"; }
	if(det_statusIE8 == "9" || det_statusIE8 == "8") { det_statusIE8 = "시동 OFF"; }
	
	//GPS신호이상여부
	var txtGpsState = "GPS신호이상";
	if(parseInt(det_gpsIE8) > 2) { txtGpsState = "정상"; }
		
	//방향각 화살표 클릭 이벤트 추가
	var infowindow = new google.maps.InfoWindow({
		//maxWidth: 200
	});
	
    g.event.addListener(marker, 'click', (function(marker) {
		return function() {
			geocoder.geocode({'latLng': markerpos}, function(results, status) {
				var strHtml = "";
				
				if(status == google.maps.GeocoderStatus.OK)
				{
					strHtml += "<div class=\"carInfo\">";
					strHtml += "<div class=\"bottom\">";
					strHtml += "<p>위치: " + results[0].formatted_address + "</p>";
					strHtml += "<p>시간: " + det_timeIE8 + "</p>"
					strHtml += "<p>속도: " + det_speedIE8 + "Km/h</p>";
					strHtml += "<p>운행상태: " + det_statusIE8 + "</p>";
					strHtml += "<p>GPS상태: " + txtGpsState + "</p>";
					strHtml += "</div>";
					strHtml += "</div>";
				}
				else 
				{
					strHtml += "<div class=\"carInfo\">";
					strHtml += "<div class=\"bottom\">";
					strHtml += "<p>시간: " + det_timeIE8 + "</p>";
					strHtml += "<p>속도: " + det_speedIE8 + "Km/h</p>";
					strHtml += "<p>운행상태: " + det_statusIE8 + "</p>";
					strHtml += "<p>GPS상태: " + txtGpsState + "</p>";
					strHtml += "</div>";
					strHtml += "</div>";
				}
					
				infowindow.setContent(strHtml);
			    infowindow.open(map, marker);
			});
			
		}
	})(marker));
    
    this.heads.push(marker);

};
*/

/*
BDCCArrowedPolylineSimple.prototype.load = function(points, mode) {
	
	for ( var i = 0; i < points.length - 1; i++) 
	{
		var p1 = points[i], p2 = points[i + 1];
		if( i%12 == 0 )
		{
			this.create(p1, p2, mode, det_timeIE8[i], det_speedIE8[i], det_statusIE8[i], det_gpsIE8[i]);
		}
	}
	
};
*/

BDCCArrowedPolylineSimple.prototype.draw = function() { };

BDCCArrowedPolylineSimple.prototype.addHead = function(x,y,theta,zoom) {
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
    pts.push(this.prj.fromContainerPixelToLatLng(new google.maps.Point(x1,y1)));
    pts.push(this.prj.fromContainerPixelToLatLng(new google.maps.Point(x,y)));    
    pts.push(this.prj.fromContainerPixelToLatLng(new google.maps.Point(x2,y2)));

        var arrow = new google.maps.Polyline({
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
