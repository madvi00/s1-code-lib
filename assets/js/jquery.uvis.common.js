
/**
 * html form data 를 직렬화(serialize) 한다. 
 * 
 * @author choyoungjun
 * 
 * e.g.
 * 		$("#formId").serializeObject();
 */
$.fn.serializeObject = function() {
	var o = {};
	var a = this.serializeArray();
	
	$.each(a, function() {
		var name = $.trim(this.name),
		value = $.trim(this.value);	
		
		if (o[name]) {
			if (!o[name].push) {
				o[name] = [o[name]];
			}
			o[name].push(value || '');
		} else {
			o[name] = value || '';
		}
	});
	return o;
};

/**
 * ajax 로딩 인디케이터(indicator) 를 보여준다.
 * 
 * @author choyoungjun
 * 
 * e.g.
 * 		$.showAjaxIndicator();
 */
$.showAjaxIndicator = function() {
	
	var html = '';
	var ajaxIdicatorObj = $("#wp-ajax-indicator");
	
	if (ajaxIdicatorObj.length == 0) {
		html += '<div id="wp-ajax-indicator" style="position: fixed; z-index: 99998; top: 0; left: 0; width: 100%; height: 100%;">';
		//html += '	<div style="position: absolute; z-index: 99998; top: 0; left: 0; width: 100%; height: 100%; background-color: #000; opacity: 0.1; filter: alpha(opacity=10)"></div>';
		//html += '	<div style="position: absolute; z-index: 99999; top: 50%; left: 50%; width: 64px; height: 64px; margin: -32px 0 0 -32px;"><img src="/resources/images/ajax_indicator_ring.gif" style="max-width: 100%;" /></div>';
		//html += '	<div style="position: absolute; z-index: 99998; top: 0; left: 0; width: 100%; height: 100%; background-color: #000; opacity: 0.1; filter: alpha(opacity=10)"></div>';
		html += '	<div style="position: absolute; z-index: 99998; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0, 0.1);"></div>';
		html += '	<div style="position: absolute; z-index: 99999; top: 50%; left: 50%; width: 48px; height: 48px; margin: -24px 0 0 -24px;"><img src="./resources/images/ajax_indicator_default.gif" style="max-width: 100%;" /></div>';
		html += '</div>';
		
		$("body").append(html);
	} else {
		ajaxIdicatorObj.show();
	}
}

/**
 * ajax 로딩 인디케이터(indicator) 를 숨긴다.
 * 
 * @author choyoungjun
 * 
 * e.g.
 * 		$.hideAjaxIndicator();
 */
$.hideAjaxIndicator = function() {
	var ajaxIdicatorObj = $("#wp-ajax-indicator");
	if (ajaxIdicatorObj.length > 0) {
		ajaxIdicatorObj.hide();
	}
}

/**
 * 숫자에 천단위 콤마를 추가한다.
 * 
 * @author choyoungjun
 * 
 * e.g.
 * 		$.setCommaNumber(9999999);
 */
$.setCommaNumber = function(val){
	if(val) {
		while (/(\d+)(\d{3})/.test(val.toString())){
	    	val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
		}
	}
	
	return val;
}

/**
 * HTML 태그를 제거한다.
 * 
 * @author choyoungjun
 */
$.removeTag = function(val) {
	if(val) {
		val = val.replace(/(<([^>]+)>)/gi, "");
	}
	
	return val;
}

/**
 * 특수문자 포함 여부 확인
 * 
 * @author choyoungjun
 */
$.isContainSpecialCharacter = function(val) {
    var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
    if (val && regExp.test(val)) {
    	return true;
    } else {
    	return false;
    }
}

/**
 * 아이디 특수문자 포함 여부 확인
 * .(dot) -(hyphen) _(underbar) 를 특수문자를 확인
 * 
 * @author iskim
 */
$.isIDContainSpecialCharacter = function(val) {
    var regExp = /[\{\}\[\]\/?,;:|\)*~`!^+<>\#$%&\\\=\(\'\"]/gi;
    if (val && regExp.test(val)) {
    	return true;
    } else {
    	return false;
    }
}

/**
 * 문자열 마스킹
 * 
 * @author choyoungjun
 * @param originString	원본 문자열
 * @param maskingChar	마스킹할 문자
 * @param maskingCount	마스킹할 갯수
 * 
 * e.g.
 * 		$.setMasking("abcdefg", "*", 2)
 * 			= abcde**
 *
 * 		$.setMasking("ab", "*", 1)
 * 			= a*		
 */
$.setMasking = function(originString, maskingChar, maskingCount) {
	
	var result = "";
	
	try {
		if (maskingChar == "") {
			maskingChar = "*";	// default 마스킹 문자
		}
		
		var prevString = originString.substring(0, originString.length-maskingCount);
		var maskingString = "";
		
		for (var i = 0 ; i < maskingCount ; i++) {
			maskingString += maskingChar;
		}
		
		result = prevString + maskingString;
	} catch (e) {
		result = maskingChar;
	}
	
	return result;	
}

/**
 * 날짜 더하기 빼기
 * 
 * @author kimimsoo
 * @param dateValue			날짜
 * @param period			더하거나 뺄 기간
 * @param type				계산 기준(Y:년, M:월, D:일)
 * 
 * @see
 * 		$.dateAddDel('2017-09-25', -7, 'd'); 
 */

$.dateAddDel = function(dateValue, period, type) {
	var yy = parseInt(dateValue.substr(0, 4), 10);
    var mm = parseInt(dateValue.substr(5, 2), 10);
    var dd = parseInt(dateValue.substr(8), 10);
    
    if (type == "D") {
        d = new Date(yy, mm - 1, dd + period);
    }
    else if (type == "M") {
        d = new Date(yy, mm - 1, dd + (period * 31));
    }
    else if (type == "Y") {
        d = new Date(yy + period, mm - 1, dd);
    }
 
    yy = d.getFullYear();
    mm = d.getMonth() + 1; mm = (mm < 10) ? '0' + mm : mm;
    dd = d.getDate(); dd = (dd < 10) ? '0' + dd : dd;
 
    return '' + yy + '-' +  mm  + '-' + dd;
}

/**
 * 검색기간 설정
 * 
 * @author choyoungjun
 * @param startDateObjId	검색 시작일자 el object id
 * @param endDateObjId		검색 종료일자 el object id
 * @param splitType		년월일 구분자('-','.','/')
 * @param ymdType		검색 시작일자의 계산 기준(Y:년, M:월, D:일)
 * @param period		0(오늘), N(몇일전, 몇달전, 몇년전), ""(전체)
 * 
 * @see
 * 		(시작일 element id = "startDate") AND (종료일 element id = "endDate") 일때..
 * 		$.setSearchCalandar('startDate','endDate','-','D','0'); //오늘
 *		$.setSearchCalandar('startDate','endDate','-','D','7'); //일주일
 *   	$.setSearchCalandar('startDate','endDate','-','M','1'); //한달
 *   	$.setSearchCalandar('startDate','endDate','-','M','2'); //두달
 *   	$.setSearchCalandar('startDate','endDate','-','',''); //전체 (시작, 종료일자를 빈값으로 초기화한다.)
 */
$.setSearchCalandar = function(startDateObjId, endDateObjId, splitType, ymdType, period) {
	var now = new Date();
	var fromYear;
	var fromMonth;
	var fromDay;
	var toYear = now.getFullYear();
	var toMonth = (now.getMonth() + 1) > 9 ? '' + (now.getMonth() + 1) : '0' + (now.getMonth() + 1);
	var toDay = now.getDate() > 9 ? '' + now.getDate() : '0' + now.getDate();

	if (splitType == "") {
		splitType = "-"; // default 년월일 구분자
	}

	var to = toYear + splitType + toMonth + splitType + toDay;
	var from;

	//console.log("ymdType : [" + ymdType + "], period : [" + period + "]");

	if (ymdType === "Y" || ymdType === "M") {
    	//참고 사이트 http://www.programkr.com/blog/MgzMwADMwYTz.html
		//현재 월
		var oldMonth = now.getMonth();
		//현재 몇 번
		var oldDay = now.getDate();
		//매월 얼마 동안 평년
		var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		//월 29 일 때문에 윤년
		var fullYear = now.getFullYear();
		if ((fullYear % 4 == 0 && fullYear % 100 != 0) || fullYear % 400 == 0) {
			days[1] = 29;
		}
		if (ymdType === "Y") {
			now.setYear(now.getFullYear() - period);
		} else {
        		now.setMonth(now.getMonth() - period);
		}
		//계산 월 일
		var newDay = now.getDate();
		if (oldDay == days[oldMonth]) {
			if (newDay != oldDay) {
				//설정을 위해 새 날짜: 새로운 날짜의 달 마지막 날
				now.setDate(0);
			} else {
				//설정 을 당월 마지막 날
				now.setDate(1);
				now.setMonth(now.getMonth() + 1);
				now.setDate(0);
			}
		}

		fromYear = now.getFullYear();
		fromMonth = (now.getMonth() + 1) > 9 ? '' + (now.getMonth() + 1) : '0' + (now.getMonth() + 1);
		fromDay = now.getDate() > 9 ? '' + now.getDate() : '0' + now.getDate();

		from = fromYear + splitType + fromMonth + splitType + fromDay;
		to = to;
	} else if (ymdType === "D") {
		now.setDate(now.getDate() - period);
		fromYear = now.getFullYear();
		fromMonth = (now.getMonth() + 1) > 9 ? '' + (now.getMonth() + 1) : '0' + (now.getMonth() + 1);
		fromDay = now.getDate() > 9 ? '' + now.getDate() : '0' + now.getDate();
		
		from = fromYear + splitType + fromMonth + splitType + fromDay;
		to = to;
	} else if (ymdType === "0" || ymdType === 0) {
		from = to;
		to = to;
	} else if (ymdType === "" || period === "") {
		from = "";
		to = "";
	}

	$("#" + startDateObjId).val(from);
	$("#" + endDateObjId).val(to);
}

$.setDateFormat = function(date, splitType) {
	var year = date.getFullYear();
	var month = (date.getMonth() + 1) > 9 ? '' + (date.getMonth() + 1) : '0' + (date.getMonth() + 1);
	var day = date.getDate() > 9 ? '' + date.getDate() : '0' + date.getDate();

	return year + splitType + month + splitType + day;
}

/**
 * 비밀번호 유효성 체크
 * 
 * @author choyoungjun
 *		e.g. 
 *			$.checkPasswordRegex( $("#[password element id]") ) 
 */
$.checkPasswordRegex = function(passwordObj) {

	// 공백체크
	var regexSpace = /\s/g;

	// 특수문자, 영문, 숫자, 8~20자
	var regex = /^.*(?=^.{8,20}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/;

	if (regexSpace.test(passwordObj.val()) == true) {
		alert(jquery_uvis_common_checkPasswordRegex1);
		passwordObj.focus();
		return false;
	}

	if (passwordObj.val().length >= 8) {
		if (regex.test(passwordObj.val()) == true) {
			return true;
		} else {
			alert(jquery_uvis_common_checkPasswordRegex2);
			passwordObj.focus();
			return false;
		}
	}

	alert(jquery_uvis_common_checkPasswordRegex2);
	passwordObj.focus();
	return false;
};

$.ajaxErrorMessage = function(x, e) {
	if (x.responseText == "requireLoginForAjax") {
		//alert(jquery_uvis_common_ajaxErrorMessage1);
		//top.document.location.href = "/login.do";
		top.document.location.href = "" + getContextPath() + "/logout.do?mode=sessionExpire";
		return;
	}
	
	if (x.status == 0) {
		//alert(jquery_uvis_common_ajaxErrorMessage2);	//에러가 발생하였습니다. 네트워크 상태를 확인해주세요.
		$.errorNetworkMessage(true);
	} else if (x.status == 403) {
		alert(jquery_uvis_common_ajaxErrorMessage3);	//에러가 발생하였습니다. 접근이 거부되었습니다.\\n\\n새로고침 또는 로그인을 다시 해주세요.
	} else if (x.status == 404) {
		alert(jquery_uvis_common_ajaxErrorMessage4);	//에러가 발생하였습니다. URL을 찾을 수 없습니다.
	} else if (x.status == 500) {
		alert(jquery_uvis_common_ajaxErrorMessage5);	//에러가 발생하였습니다. 내부 서버 에러가 발생하였습니다.
	} else if (e == "parsererror") {
		alert(jquery_uvis_common_ajaxErrorMessage6);	//에러가 발생하였습니다. 파싱 에러가 발생하였습니다.
	} else if (e == "timeout") {
		alert(jquery_uvis_common_ajaxErrorMessage7);	//에러가 발생하였습니다. 실행시간이 지연되어 타임아웃이 발생하였습니다.
	} else {
		alert(jquery_uvis_common_ajaxErrorMessage8 + x.responseText);	//에러가 발생하였습니다. 알 수 없는 에러입니다.
	}
	
	return;
};

$.errorNetworkMessage = function(show) {
	$("#errorNetworkBg").remove();
	$("#errorNetworkTxt").remove();
	
	if(show) {
		//접속이 원활하지 않습니다. 네트워크 상태를 확인해주세요.
		var errorNetworkBg = $("<div id='errorNetworkBg' onclick='$.errorNetworkMessage(false);' style='position:absolute; z-index:99998; width:100%; top:0px; cursor:pointer; height:21px; background-color:black; opacity:0.2; filter:alpha(opacity=20);'>&nbsp;</div>");
		var errorNetworkTxt = $("<div id='errorNetworkTxt' onclick='$.errorNetworkMessage(false);' style='position:absolute; z-index:99999; width:100%; top:0px; cursor:pointer; line-height:21px; color:white; text-align:center; font-weight:bold;'>" + jquery_uvis_common_ajaxErrorMessage0 + "</div>");
		$("body").append(errorNetworkBg);
		$("body").append(errorNetworkTxt);
		
		//60초 후 제거
		setTimeout(function() {
			$("#errorNetworkBg").remove();
			$("#errorNetworkTxt").remove();
		}, 60000);
	}
}

$.isHttpUrl = function(url) {
	var regex = /^((http(s?))\:\/\/)([0-9a-zA-Z\-]+\.)+[a-zA-Z]{2,6}(\:[0-9]+)?(\/\S*)?$/; 
	
	if (regex.test( url ) == true) {
		return true;
	}
	
	return false;
};

$.isValidDate = function(param) {
	try
    {
        param = param.replace(/-/g, "");

        // 자리수가 맞지않을때
        if( isNaN(param) || param.length != 8 ) {
        	alert(jquery_uvis_common_isValidDate1);
            return false;
        }
         
        var year = Number(param.substring(0, 4));
        var month = Number(param.substring(4, 6));
        var day = Number(param.substring(6, 8));

        var dd = day / 0;
         
        if( month < 1 || month > 12 ) {
        	alert(jquery_uvis_common_isValidDate21 + month + jquery_uvis_common_isValidDate22);
            return false;
        }
         
        var maxDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        var maxDay = maxDaysInMonth[month-1];
         
        // 윤년 체크
        if( month==2 && ( year%4==0 && year%100!=0 || year%400==0 ) ) {
            maxDay = 29;
        }
         
        if( day <= 0 || day > maxDay ) {
        	alert(jquery_uvis_common_isValidDate31 + " " + maxDay + jquery_uvis_common_isValidDate32);
            return false;
        }
        return true;

    } catch (err) {
    	alert(jquery_uvis_common_isValidDate4);
        return false;
    }                       
};

$.checkFileExt = function(obj, availableExts) {
	
	if ($.trim(obj.val()) == "") {
		alert(jquery_uvis_common_checkFileExt1);
		obj.val("");
		return false;
	}

	var arrFileName = obj.val().split(".");

	if (arrFileName.length <= 1) {
		alert(jquery_uvis_common_checkFileExt1);
		obj.val("");
		return false;
	}
	
	var availableExtCount = 0;
	var ext = arrFileName[arrFileName.length - 1];
	
	if (availableExts.length > 0) {
		for (var i = 0 ; i < availableExts.length ; i++) {
			if (ext.toLowerCase() == availableExts[i].toLowerCase()) {
				availableExtCount++;
			}
		}
	}

	if (availableExtCount == 0) {
		alert(availableExts + " " + jquery_uvis_common_checkFileExt2);
		obj.val("");
		return false;
	}
	
	return true;
};

$.clearXSS = function(val) {
	return val.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

$.getScrollBarWidth = function() {
	var inner = document.createElement('p');
	inner.style.width = "100%";
	inner.style.height = "200px";

	var outer = document.createElement('div');
	outer.style.position = "absolute";
	outer.style.top = "0px";
	outer.style.left = "0px";
	outer.style.visibility = "hidden";
	outer.style.width = "200px";
	outer.style.height = "150px";
	outer.style.overflow = "hidden";
	outer.appendChild (inner);

	document.body.appendChild (outer);
	var w1 = inner.offsetWidth;
	outer.style.overflow = 'scroll';
	var w2 = inner.offsetWidth;
	if (w1 == w2) w2 = outer.clientWidth;

	document.body.removeChild (outer);

	return (w1 - w2);
}

String.prototype.replaceAll = function(regexp, replaceValue) {
	return this.replace(new RegExp(escapeRegExp(regexp), "g"), replaceValue);
}

String.prototype.replaceSpace = function() {
	return this.replaceAll(" ", "&nbsp;");
}

String.prototype.replaceEnter = function() {
	return this.replaceAll("\\r\\n", "<br />").replaceAll("\r\n", "<br />").replaceAll("\\n", "<br />").replaceAll("\n", "<br />");
}

function escapeRegExp(str) {
	return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

/**
 * Ajax 실행 공통 함수
 * 
 * HTTP Method: POST
 * contentType: application/json;charset=UTF-8
 * 
 * @author domoyosi
 * @param ajax (Type: JsonObject)
 * 
 * POST example
 * 		$.restful({url: "[url]", data: "[data]", callback: [callback function name]});
 * 
 * GET example
 * 		$.restful({url: "[url]", method: "GET", data: "[data]", callback: [callback function name]});
 * 
 * Header example
 * 		$.restful({url: "[url]", header: "[header json object]", data: "[data]", callback: [callback function name]});
 */
$.restful = function(request) {
	
	try {
		
		//$.showAjaxIndicator();
		
		var request_url = "";
		var request_method = "POST";
		var request_header = "";
		var request_data = "";
		var request_dataType = "json";
		var request_contentType = "application/json;charset=UTF-8";
		var request_callback = "";
		var request_ajaxIndicator = true;
		var request_async = true;
		
		// url
		if (request.url != undefined && request.url != null && request.url != "") {
			request_url = request.url;
		}
		
		// method(type: POST, GET / default: POST)
		if (request.method != undefined && request.method != null && request.method != "") {
			request_method = request.method;
		}
		
		// header parameter
		if (request.header != undefined && request.header != null && request.header != "") {
			request_header = request.header;
		}
		
		// body parameter
		if (request.data != undefined && request.data != null && request.data != "") {
			request_data = request.data;
		}
		
		// dataType (default: json)
		if (request.dataType != undefined && request.dataType != null && request.dataType != "") {
			request_dataType = request.dataType;
		}
		
		// contentType (default: application/json;charset=UTF-8)
		if (request.contentType != undefined && request.contentType != null && request.contentType != "") {
			request_contentType = request.contentType;
		}
		
		// callback
		if (request.callback != undefined && request.callback != null && request.callback != "") {
			request_callback = request.callback;
		}

		// ajaxIndicator
		if (request.ajaxIndicator != null) {
			request_ajaxIndicator = request.ajaxIndicator;
		}

		// async
		if (request.async != null) {
			request_async = request.async;
		}
		
		if (request_url != "" && request_method != "") {
			$.ajax({
				url: request_url,
				type: request_method,
				data: request_data,
				dataType: request_dataType,
				contentType: request_contentType,
				async: request_async,
				beforeSend: function(xhrObj) {
					
					if (request_ajaxIndicator == true) {
						$.showAjaxIndicator();
					}
					
					if (request_header != undefined && request_header != null) {	
						$.each(request_header, function(key, value) {
							xhrObj.setRequestHeader(key, value);
						});
					}
				},
				success: function(data, textStatus, jqXHR) {
					if (request_callback != "") {
						return request_callback(data, textStatus, jqXHR);	
					}
				},
				error: function(x, e) {
					$.ajaxErrorMessage(x, e);
				},
				complete: function() {
					$.hideAjaxIndicator();
				}
			});
		}
	} catch(e) {
		console.log(e);
	} finally {
		//$.hideAjaxIndicator();
	}
	
}

$.logRestful = function(request) {
	
	try {
		
		//$.showAjaxIndicator();
		
		var request_url = "";
		var request_method = "POST";
		var request_header = "";
		var request_data = "";
		var request_dataType = "json";
		var request_contentType = "application/json;charset=UTF-8";
		var request_callback = "";
		var request_ajaxIndicator = true;
		
		// url
		if (request.url != undefined && request.url != null && request.url != "") {
			request_url = request.url;
		}
		
		// method(type: POST, GET / default: POST)
		if (request.method != undefined && request.method != null && request.method != "") {
			request_method = request.method;
		}
		
		// header parameter
		if (request.header != undefined && request.header != null && request.header != "") {
			request_header = request.header;
		}
		
		// body parameter
		if (request.data != undefined && request.data != null && request.data != "") {
			request_data = request.data;
		}
		
		// dataType (default: json)
		if (request.dataType != undefined && request.dataType != null && request.dataType != "") {
			request_dataType = request.dataType;
		}
		
		// contentType (default: application/json;charset=UTF-8)
		if (request.contentType != undefined && request.contentType != null && request.contentType != "") {
			request_contentType = request.contentType;
		}
		
		// callback
		if (request.callback != undefined && request.callback != null && request.callback != "") {
			request_callback = request.callback;
		}
		
		// ajaxIndicator
		if (request.ajaxIndicator != null) {
			request_ajaxIndicator = request.ajaxIndicator;
		}
		
		if (request_url != "" && request_method != "") {
			$.ajax({
				url: request_url,
				type: request_method,
				data: request_data,
				dataType: request_dataType,
				contentType: request_contentType,
				beforeSend: function(xhrObj) {
					
					if (request_ajaxIndicator == true) {
						$.showAjaxIndicator();
					}
					//console.log("request.header : " + (request.header));
					//console.log("request.header == undefined : " + (request.header == undefined));
					
					if (request_header != undefined && request_header != null) {	
						$.each(request_header, function(key, value) {
							//console.log("key: " + key + ", value: " + value);
							xhrObj.setRequestHeader(key, value);
						});
					}
				},
				success: function(data, textStatus, jqXHR) {
					if (request_callback != "") {
						return request_callback(data, textStatus, jqXHR);	
					}
				},
				error: function(x, e) {
				},
				complete: function() {
					$.hideAjaxIndicator();
				}
			});
		}
	} catch(e) {
		console.log(e);
	} finally {
		//$.hideAjaxIndicator();
	}
	
}


/**
 * 특정 영역의 html 을 이미지(png) 파일로 캡쳐하여 다운로드
 * client-side 로 동작한다.
 * 
 * @param captureAreaObj 캡쳐할 html 영역
 * @param downloadFileName 다운로드할 파일명
 * @author domoyosi
 * 
 */
$.downloadCapture = function(captureAreaObj, downloadFileName) {
//	var uAgent = navigator.userAgent;
//	 if (uAgent.indexOf('Trident') > -1 || uAgent.indexOf('MSIE') > -1) {
//		 alert(jquery_uvis_common_downloadCapture1);
//	 } else{
	 var element = $(captureAreaObj).get(0);
		
	try {
		$.showAjaxIndicator();
		
		var btnDownloadCaptureHiddenName = '_btnDownloadCaptureHidden_';
	if ($('#' + btnDownloadCaptureHiddenName).length == 0) {
		$('body').append('<a id="' + btnDownloadCaptureHiddenName + '" download="" href="" type=""></a>');
	} else {
		$('#' + btnDownloadCaptureHiddenName).attr('download', '').attr('href', '').attr('type', '');
	}
	
	html2canvas(element).then(function (canvas) {
		var imageData = canvas.toDataURL('image/png');
		var newData = imageData.replace(/^data:image\/png/, 'data:application/octet-stream');
	
		if (newData != null && newData != undefined && newData != '') {
			$('#' + btnDownloadCaptureHiddenName).attr('download', (downloadFileName + '.png')).attr('href', newData).attr('type', 'application/octet-stream');
			$('#' + btnDownloadCaptureHiddenName).get(0).click();
		}
			
		$.hideAjaxIndicator();
    });
		
	} catch (e) {
		$.hideAjaxIndicator();
		alert(jquery_uvis_common_downloadCapture2);
	}
//	 }
};

function save_chart(chart, filename) {
	
	try {
		$.showAjaxIndicator();
		
	    var render_width = 1000;
	    var render_height = render_width * chart.chartHeight / chart.chartWidth
	
	    var svg = chart.getSVG({
	        exporting: {
	            sourceWidth: chart.chartWidth,
	            sourceHeight: chart.chartHeight
	        }
	    });
	
	    var canvas = document.createElement('canvas');
	    canvas.height = render_height;
	    canvas.width = render_width;
	    
	    canvg(canvas, svg, {
	        scaleWidth: render_width,
	        scaleHeight: render_height,
	        ignoreDimensions: true
	    });
	    
	    download(canvas, filename + '.png');
	    
	    $.hideAjaxIndicator();
	} catch(e){
		$.hideAjaxIndicator();
		alert(jquery_uvis_common_downloadCapture2);
    }
}

function download(canvas, filename) {
    download_in_ie(canvas, filename) || download_with_link(canvas, filename);
}

//Works in IE10 and newer
function download_in_ie(canvas, filename) {
    return(navigator.msSaveOrOpenBlob && navigator.msSaveOrOpenBlob(canvas.msToBlob(), filename));
}

// Works in Chrome and FF. Safari just opens image in current window, since .download attribute is not supported
function download_with_link(canvas, filename) {
    var a = document.createElement('a')
    a.download = filename
    a.href = canvas.toDataURL("image/png")
    document.body.appendChild(a);
    a.click();
    a.remove();
}

/**
 * 입력란 Max Length Count
 * 
 * @param countObj
 */
function setMaxTextCount(countObj) {
	countObj.keyup(function() {
		if ($(this).length > 0) {
			var count = $(this).val().length;
			var maxCount = parseInt($(this).attr("maxlength"));
			var printObj = $(this).siblings("span").find("strong");

			if (maxCount >= count) {
				printObj.text(count + " / " + maxCount + " 자");	
			}
		}
	});
	countObj.trigger("keyup");
}

/**
 * 숫자 n을 width자리 숫자로 표현
 */
function pad(n, width) {
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

function sendToUrl(path, params, method) {
	method = method || "post"; // 전송 방식 기본값을 POST로

	var form = document.createElement("form");
	form.setAttribute("method", method);
	form.setAttribute("action", path);

	//히든으로 값을 주입시킨다.
	for(var key in params) {
		var hiddenField = document.createElement("input");
		hiddenField.setAttribute("type", "hidden");
		hiddenField.setAttribute("name", key);
		hiddenField.setAttribute("value", params[key]);

		form.appendChild(hiddenField);
	}

	document.body.appendChild(form);
	form.submit();
};

/**
 * Date를 포맷에 맞게 변경
 * @param Date
 * @param String
 * ex) dateFormat(new Date('2018-12-19 09:47:00'), "MM월dd일 HH:mm:ss"); 
 * @author bamcong
 */
function dateFormat(date, format) {
	String.prototype.string = function(len){var s = '', i = 0; while (i++ < len) { s += this; } return s;};
	String.prototype.zf = function(len){return "0".string(len - this.length) + this;};
	Number.prototype.zf = function(len){return this.toString().zf(len);};

    if (!date.valueOf()) return " ";
 
    var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    
    var d = new Date(date);
    var f = format;
    
    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p)/gi, function($1) {
        switch ($1) {
            case "yyyy": return d.getFullYear();
            case "yy": return (d.getFullYear() % 1000).zf(2);
            case "MM": return (d.getMonth() + 1).zf(2);
            case "dd": return d.getDate().zf(2);
            case "E": return weekName[d.getDay()];
            case "HH": return d.getHours().zf(2);
            case "hh": return ((h = d.getHours() % 12) ? h : 12).zf(2);
            case "mm": return d.getMinutes().zf(2);
            case "ss": return d.getSeconds().zf(2);
            case "a/p": return d.getHours() < 12 ? "오전" : "오후";
            default: return $1;
        }
    });
}

/**
 * 전화번호 포맷 변환
 * ex) phoneFomatter('01012341234'); => 010-1234-1234
 * ex) phoneFomatter('01012341234', 0); => 010-****-1234 
 */
function phoneFomatter(num, type){
	var formatNum = '';
	
	if (num.length == 11) {
	    if (type == 0) {
	        formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3');
	    } else {
	        formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
	    }
	} else if (num.length == 8) {
	    formatNum = num.replace(/(\d{4})(\d{4})/, '$1-$2');
	} else {
	    if (num.indexOf('02') == 0) {
	        if (type == 0) {
	            formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-****-$3');
	        } else {
	            formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
	        }
	    } else {
	        if (type == 0) {
	            formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-***-$3');
	        } else {
	            formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
	        }
	    }
	}
	
	return formatNum;
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getContextPath() {
	return sessionStorage.getItem("contextpath");
}

function getLangset(){
	return sessionStorage.getItem("langSet") || 'ko';
}

/**
 * input value reset
 * @author     DFCC
 * @param      type1 (selector가 id인지, name인지)
               type2 (input, select, checkbox ... ) : type1이 name일 경우에 입력, id일경우 ""로 보내도 무방
               array : type1 값이 name 일 경우 ["form name", "type2 name", "type2 name", ...]
                       type1 값이 id일 경우    ["type2 id", "type2 id", "type2 id", ...]
 * @return      
 * @example  
 * 			   resetValueFun("name", "input", ["saveForm", "action", "offKey", "driIdx", "driName", "driTel", "cmNumber"])
			   resetValueFun("id", "", ["offKey", "driName", "driTel", "cmNumber"]);
		
 */
function resetValueFun(type1, type2, arrayList) {
	
	if(type1 == "id") {
		// 선택자 id
		for(var i = 0 ; i < arrayList.length ; i ++ ) {
			$("#" + arrayList[i]).val("");
		}
	} else {
		// 선택자 name
		for(var i = 1 ; i < arrayList.length ; i ++ ) {
			$("#" + arrayList[0] + " " + type2 + "[name='" + arrayList[i] + "']").val("").trigger("change");
		}
	}
}

/**
 * 휴대폰 번호 형식으로 문자열 리턴
 * @author     DFCC
 * @param     
 * @return      
 * @example  
 */
function makePhoneNumber(str) {
	if(str != "" && str != undefined) {
		var num = str.trim();
		
		if(str.length == 11) {
			return num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
		} else if(str.length == 10) {
			return num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
		} else {
			return "";
		}
	} else {
		return "";
	}
}

/*  호출시점 : select (조회 버튼 클릭시) // result 성공으로 고정
            insert (insert 콜백)  // result 실패 성공 분기 필요
            update (update 콜백)  // result 실패 성공 분기 필요
            delete (delete 콜백)  // result 실패 성공 분기 필요
  
* userList 에서 권한 주고받기, 로그인 시도 등의 권한과 관련된 곳에서는
* select와 관계없이 콜백에서 실패 유무에 대한 파라미터들을 세세히 넘겨야됨
  
saveLogHeader : js단에서 표현식 인식을 못하기에 jsp 단에서 헤더를 만들어서 인자로 전달한다.
                       페이지마다 쓰는 이름은 같으므로, saveLogHeader 수정할 필요는 없음.
// var saveLogHeader = {"userId": "${ssUserInfo.iUserid}", "${csrf.name}": "${csrf.value}"};
                       
userLogInsert : 
* @param saveLogHeader    : 위에 적힌 header를 jsp단에서 그대로 넘기면 됨
* @param iUserid        : 아이디찾기, 비밀번호 찾기 등 로그인이 불필요한 페이지에서 이름이나, 아이디 등 특정할수 있는 값을 넘김
* @param menuName         : 메뉴명
* @param pageName         : 페이지명
* @param infoType         : 정보유형(1:일반정보 2:개인정보)
* @param action           : 동작명(M:메뉴 C:등록 R:읽기 U;수정 D:삭제 DW:다운로드 UP:업로드)
* @param buttonName       : 버튼이름
* @param result           : 수행결과(S:성공 F:실패)
* @param resultValue      : result가 F(실패)일 경우 오류메세지
* @param resultCount      : insert, update, delete 적용 행수
* @param fileName         : file upload시 리턴된 파일명을 넣어준다.
* @param remark1          : 비고1
* @param remark2          : 비고2
*/
function userLogInsert(saveLogHeader, ssIUserid, menuName, pageName, infoType, action, buttonName, result, resultValue, resultCount, fileName, remark1, remark2) {
	var html  = '<form id="userLogSaveForm" name="userLogSaveForm">';
		html += '	<input type="hidden" name="iUserid" 	value="' + ssIUserid + '">';
		html += '	<input type="hidden" name="menuName" 	value="' + menuName + '">';
		html += '	<input type="hidden" name="pageName"	value="' + pageName + '">';
		html += '	<input type="hidden" name="infoType" 	value="' + infoType + '">';
		html += '	<input type="hidden" name="action" 		value="' + action + '">';
		html += '	<input type="hidden" name="buttonName" 	value="' + buttonName + '">';
		html += '	<input type="hidden" name="result" 		value="' + result + '">';
		html += '	<input type="hidden" name="resultValue" value="' + resultValue + '">';
		html += '	<input type="hidden" name="resultCount" value="' + resultCount + '">';
		html += '	<input type="hidden" name="fileName"	value="' + fileName + '">';
		html += '	<input type="hidden" name="remark1" 	value="' + remark1 + '">';
		html += '	<input type="hidden" name="remark2" 	value="' + remark2 + '">';
		html += '</form>';
		
	// 기존 logForm 존재유무 확인  후 제거
	if($("#userLogSaveForm").length > 0 ) {
		$("#userLogSaveForm").remove();
	}
	$("body").append(html);
		
	$.logRestful({
        url: getContextPath() + "/userLogSave.ajax",
        header: saveLogHeader,
        data: JSON.stringify($("#userLogSaveForm").serializeObject()),
        callback: function(data, textStatus, jqXHR) {}
    });
	
	$("#userLogSaveForm").remove();
}