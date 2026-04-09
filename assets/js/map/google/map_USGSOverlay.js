

// 독도 오버레이 관련 항목
var overlayDokdo;
var overlayDokdo_default;

/** constructor */
function USGSOverlay(bounds, image, map) {

    // Initialize all properties.
    this.bounds_ = bounds;
    this.image_ = image;
    this.map_ = map;

    // Define a property to hold the image's div. We'll
    // actually create this div upon receipt of the onAdd()
    // method so we'll leave it null for now.
    this.div_ = null;

    // Explicitly call setMap on this overlay.
    this.setMap(map);
    
}

USGSOverlay.prototype = new google.maps.OverlayView();



function makeDokdo_overay(mapType){

    var swBound, neBound, bounds, srcImage;

    
    srcImage = getContextPath() + "/resources/images/realtime/new_ico/img_use_real.gif" 
    
    //window.open(srcImage);
    
    if (overlayDokdo != undefined)
    	overlayDokdo.setMap(null);

    if (overlayDokdo_default != undefined)
    	overlayDokdo_default.setMap(null);
            
    
    if (mapType == 'hybrid' || mapType == 'satellite') {  // 위성맵

        // 독도 Default 이미지
        swBound = new google.maps.LatLng(37.00603045000039, 131.35701074304552);
        neBound = new google.maps.LatLng(37.49800187512366, 132.42098535242052);
        bounds = new google.maps.LatLngBounds(swBound, neBound);
        srcImage = getContextPath() + "/resources/images/realtime/new_ico/dokdo_Image_Hybrid_max.png";
        overlayDokdo_default = new USGSOverlay(bounds, srcImage, map);

        // 독도 작은이미지
        swBound = new google.maps.LatLng(37.19656972740642, 131.8445975502965);
        neBound = new google.maps.LatLng(37.24494366271668, 131.8949675683947);
        bounds = new google.maps.LatLngBounds(swBound, neBound);
        srcImage = getContextPath() + "/resources/images/realtime/new_ico/dokdo_Image_Hybrid_min.png";
        overlayDokdo = new USGSOverlay(bounds, srcImage, map);

        // 동해 영역
        swBound = new google.maps.LatLng(38.81318335830046, 132.03305251398058);
        neBound = new google.maps.LatLng(40.68503179208661, 137.26348220148058);
        bounds = new google.maps.LatLngBounds(swBound, neBound);
        srcImage = getContextPath() + "/resources/images/realtime/new_ico/dokdo_Image_eastsea_Hybrid.png";
        overlayDokdo = new USGSOverlay(bounds, srcImage, map);

    } else if (mapType == 'terrain'){ 
    	
    	swBound = new google.maps.LatLng(36.99603045000039, 131.45301074304552);
        neBound = new google.maps.LatLng(37.48800187512366, 132.27698535242052);
        bounds = new google.maps.LatLngBounds(swBound, neBound);
        srcImage = getContextPath() + "/resources/images/realtime/new_ico/dokdo_Image_max_terrain.png";
        overlayDokdo_default = new USGSOverlay(bounds, srcImage, map);

        swBound = new google.maps.LatLng(37.22756972740642, 131.8295975502965);
        neBound = new google.maps.LatLng(37.24294366271668, 131.8599675683947);
        bounds = new google.maps.LatLngBounds(swBound, neBound);
        srcImage = getContextPath() + "/resources/images/realtime/new_ico/dokdo_Image_min_terrain.png";
        overlayDokdo = new USGSOverlay(bounds, srcImage, map);

        // 동해 영역
        swBound = new google.maps.LatLng(38.42823450468092, 131.76313037195177);
        neBound = new google.maps.LatLng(42.330492512902435, 137.60834521570177);
        bounds = new google.maps.LatLngBounds(swBound, neBound);
        srcImage = getContextPath() + "/resources/images/realtime/new_ico/dokdo_Image_eastsea_terrain.png";
        overlayDokdo = new USGSOverlay(bounds, srcImage, map);
    
    } else {    // 일반맵

        swBound = new google.maps.LatLng(36.99603045000039, 131.45301074304552);
        neBound = new google.maps.LatLng(37.48800187512366, 132.27698535242052);
        bounds = new google.maps.LatLngBounds(swBound, neBound);
        srcImage = getContextPath() + "/resources/images/realtime/new_ico/dokdo_Image_max_new.png";
        overlayDokdo_default = new USGSOverlay(bounds, srcImage, map);

        swBound = new google.maps.LatLng(37.22756972740642, 131.8295975502965);
        neBound = new google.maps.LatLng(37.24294366271668, 131.8599675683947);
        bounds = new google.maps.LatLngBounds(swBound, neBound);
        srcImage = getContextPath() + "/resources/images/realtime/new_ico/dokdo_Image_min_new.png";
        overlayDokdo = new USGSOverlay(bounds, srcImage, map);

        // 동해 영역
        swBound = new google.maps.LatLng(38.42823450468092, 131.76313037195177);
        neBound = new google.maps.LatLng(42.330492512902435, 137.60834521570177);
        bounds = new google.maps.LatLngBounds(swBound, neBound);
        srcImage = getContextPath() + "/resources/images/realtime/new_ico/dokdo_Image_eastsea_new.png";
        overlayDokdo = new USGSOverlay(bounds, srcImage, map);

    }

    delete mapType;
    delete swBound, neBound, bounds, srcImage;

}


/**
 * onAdd is called when the map's panes are ready and the overlay has been
 * added to the map.
 */
USGSOverlay.prototype.onAdd = function () {

    var div = document.createElement('div');
    div.style.borderStyle = 'none';
    div.style.borderWidth = '0px';
    div.style.position = 'absolute';

    // Create the img element and attach it to the div.
    var img = document.createElement('img');
    img.src = this.image_;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.position = 'absolute';
    div.appendChild(img);

    this.div_ = div;

    // Add the element to the "overlayLayer" pane.
    var panes = this.getPanes();
    panes.overlayLayer.appendChild(div);
};

USGSOverlay.prototype.draw = function () {

    // We use the south-west and north-east
    // coordinates of the overlay to peg it to the correct position and size.
    // To do this, we need to retrieve the projection from the overlay.
    var overlayProjection = this.getProjection();

    // Retrieve the south-west and north-east coordinates of this overlay
    // in LatLngs and convert them to pixel coordinates.
    // We'll use these coordinates to resize the div.
    var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
    var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

    // Resize the image's div to fit the indicated dimensions.
    var div = this.div_;
    div.style.left = sw.x + 'px';
    div.style.top = ne.y + 'px';
    div.style.width = (ne.x - sw.x) + 'px';
    div.style.height = (sw.y - ne.y) + 'px';
};

// The onRemove() method will be called automatically from the API if
// we ever set the overlay's map property to 'null'.
USGSOverlay.prototype.onRemove = function () {
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
};
