/*
    Description : 
        Marker Moving을 위한 스크립트
        각 마커에 이벤트가 주어지면 됨
    Method : runMarker(marker, Pos, PrevPos, id, period)
    Parameter   : 
        marker  - 대상 마커 
        Pos     - 마커 현재 위치
        PrevPos - 마커 나중 위치
        id      - 마커 아이디
        period  - 주기
    Author		: 최용선															
    Date	    : 2013-10-08
*/


arrInterval = function () {
    this.interval = new Object();
}

arrInterval.prototype = {
    put: function (key, value) {
        this.interval[key] = value;
    },
    get: function (key) {
        return this.interval[key];
    },
    containsKey: function (key) {
        return key in this.interval;
    },
    containsValue: function (value) {
        for (var prop in this.interval) {
            if (this.interval[prop] == value)
                return true;
        }
        return false;
    },
    isEmpty: function (key) {
        return (this.size() == 0);
    },
    clear: function () {
        for (var prop in this.interval) {
            clearInterval(this.interval[prop]);
            delete this.interval[prop];
        }
    },
    remove: function (key) {
        clearInterval(this.interval[key]);
        delete this.interval[key];
    },
    keys: function () {
        var keys = new Array();
        for (var prop in this.interval) {
            keys.push(prop);
        }
        return keys;
    },
    values: function () {
        var values = new Array();
        for (var prop in this.interval) {
            values.push(this.interval[prop]);
        }
        return values;
    },
    size: function () {
        var count = 0;
        for (var prop in this.interval) {
            count++;
        }
        return count;
    }
}

// 객체 생성
var arrInterval = new arrInterval();

function runMarker(marker, Pos, PrevPos, id, period) {

    var diffLat = Pos.lat() - PrevPos.lat();
    var diffLng = Pos.lng() - PrevPos.lng();
    var diffLatPerPeriod = diffLat / period;
    var diffLngPerPeriod = diffLng / period;

    marker.aniPos = Pos;
    marker.aniPrevPos = PrevPos;
    marker.aniID = id;

    var carAniInterval = setInterval(function () { moveMarker(marker, diffLat, diffLatPerPeriod, diffLngPerPeriod); }, 1000);


    arrInterval.put(marker.carTid, carAniInterval);

    delete diffLat, diffLng, diffLatPerPeriod, diffLngPerPeriod, carAniInterval;
}

function stopMarker() {
    arrInterval.clear();
}

function moveMarker(marker, diffLat, diffLatPerPeriod, diffLngPerPeriod) {

    var startPosionLat = marker.aniPrevPos.lat() + diffLatPerPeriod;
    var startPosionLng = marker.aniPrevPos.lng() + diffLngPerPeriod;
    marker.aniPrevPos = new google.maps.LatLng(startPosionLat, startPosionLng);
    
    if (diffLat > 0 ){
        if (marker.aniPos.lat() > marker.aniPrevPos.lat())
            marker.setPosition(marker.aniPrevPos);
        else 
            arrInterval.remove(marker.aniID);
    } else if (diffLat < 0) {
        if (marker.aniPos.lat() < marker.aniPrevPos.lat())
            marker.setPosition(marker.aniPrevPos);
        else
            arrInterval.remove(marker.aniID);
    } else 
        arrInterval.remove(marker.aniID);
       

    delete startPosionLat, startPosionLng;

}
