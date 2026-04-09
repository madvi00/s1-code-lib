// Define the overlay, derived from daum.maps.OverlayView
function Label(map, options) {
	 options = options || {};

	 this.pos_ = options.pos || null;
	 this.visible_ = options.visible || true;
	 this.top_ = options.top || 0;
	 this.left_ = options.left || 10;
	 this.text_ = options.text || '';
	 this.zIndex_ = options.zIndex || 100;
	 	 
     // Here go the label styles
     this.span_ = document.createElement('span');
     this.span_.style.cssText = 'position: relative; right: 14px; top: -24px; ' +
                          'white-space: nowrap;color:#000000;' +
                          'padding: 2px;font-family: Arial;' +
                          'font-size: 10px;';
	 this.span_.innerHTML = this.text_; 
	 
     this.div_ = document.createElement('div');
     this.div_.appendChild(	 this.span_ );
     this.div_.style.cssText = 'position: absolute; display: none; whitespace: nowrap; z-Index:'+this.zIndex_+';';
	 
	 this.setMap(map);
};
 
Label.prototype = new daum.maps.AbstractOverlay();
 
Label.prototype.onAdd = function() {
     var pane = this.getPanels().overlayLayer;
     pane.appendChild(this.div_);
 
     // Ensures the label is redrawn if the text or position is changed.
	 // !!!! 지원이 안될 텐데.. 해당 이벤트가 있나. 
    var me = this;
    daum.maps.event.addListener(this, 'position_changed',
               function() { me.draw(); });
    daum.maps.event.addListener(this, 'text_changed',
               function() { me.draw(); });
    daum.maps.event.addListener(this, 'zindex_changed',
               function() { me.draw(); });
    daum.maps.event.addListener(this, 'visible_changed',
               function() { me.draw(); });
};
 
// Implement onRemove
Label.prototype.onRemove = function() {
	 if (this.div_ && this.div_.parentNode) {
		 this.div_.parentNode.removeChild(this.div_);
		 this.div_ = null;
	 }
};
 
// Implement draw
Label.prototype.draw = function() {
     var projection = this.getProjection();
     var point = projection.pointFromCoords(this.pos_);
	 
     //this.div_.style.left = (point.x-10) + 'px';		//다음맵 위치 보안
     //this.div_.style.top = (point.y+20) +'px';
	 this.div_.style.left = (point.x+this.left_) + 'px';		//다음맵 위치 보안
     this.div_.style.top = (point.y+this.top_) +'px';
	 
	 
	 //console.log('top:' + this.div_.style.top + ', y:' + point.y);
     this.div_.style.display = this.visible_ ? 'block' : 'none';
};

