/*!************************************************************************************
* jQuery Paging 0.2.1
* by composite (ukjinplant@msn.com)
* http://hazard.kr
* This project licensed under a MIT License.
**************************************************************************************/;
!function($){
	'use strict';
	//default properties.
	var a=/a/i,
	defs={
			/*
			item:'a',next:'[&gt;{5}]',prev:'[{4}&lt;]',format:'[{0}]',
			itemClass:'paging-item',sideClass:'paging-side',className:'jquery-paging',
			prevClass:'btn-prev',nextClass:'btn-next',firstClass:'btn-first',lastClass:'btn-last',
			itemCurrent:'selected',length:10,max:1,current:1,append:false,href:'#{0}',event:true,first:'[1&lt;&lt;]',last:'[&gt;&gt;{6}]'
			*/
			item:'a',next:'',prev:'',format:'{0}',
			itemClass:'',sideClass:'paging-side',className:'jquery-paging',
			prevClass:'btn-prev',nextClass:'btn-next',firstClass:'btn-first',lastClass:'btn-last',
			itemCurrent:'on',length:10,max:1,current:1,append:false,href:'#{0}',event:true,first:'',last:''
	},
	format=function(str){
		var arg=arguments;
		return str.replace(/\{(\d+)}/g,function(m,d){
			if(+d<0) return m;
			else return arg[+d+1]||"";
		});
	},item,make=function(op,page,cls,str){
		item=document.createElement(op.item);
		item.className=cls;
		item.innerHTML=format(str,page,op.length,op.start,op.end,op.start-1,op.end+1,op.max);
		if(a.test(op.item)) item.href=format(op.href,page);
		if(op.event){
			$(item).bind('click',function(e){
				var fired=true;
				if($.isFunction(op.onclick)) fired=op.onclick.call(item,e,page,op);
				if(fired==undefined||fired)
					$(op.origin).paging({current:page});
				e.preventDefault();
				return fired;
			}).appendTo(op.origin);
			//bind event for each elements.
			var ev='on';
			switch(str){
			case op.prev:ev+='prev';break;
			case op.next:ev+='next';break;
			case op.first:ev+='first';break;
			case op.last:ev+='last';break;
			default:ev+='item';break;
			}
			if($.isFunction(op[ev])) op[ev].call(item,page,op);
		}
		return item;
	};
	$.fn.paging=function(op){
		$(this).each(function(){
			if(this.__JQ_PAGING){
				if(op === 'destroy'){
					$(this).removeClass(this.__JQ_PAGING.className).empty();
					delete this.__JQ_PAGING;
					return true;
				}else if(op in this.__JQ_PAGING){
					return this.__JQ_PAGING[op];
				}
				op=$.extend(this.__JQ_PAGING,op||{});$(this).empty();
			}else if(op instanceof String || typeof op === 'string') return false;
			else{
				op=$.extend({origin:this},defs,op||{});
				$(this).addClass(op.className).empty();
			}
			if(op.max<1) op.max=1; if(op.current<1) op.current=1;
			op.start=~~((op.current-1)/op.length)*op.length+1;
			op.end=op.start-1+op.length;
			if(op.end>op.max) op.end=op.max;
			if(op.first!==false) make(op,1,op.firstClass,op.first);//first button
			if(op.current>op.length){
				//if(op.first!==false) make(op,1,op.sideClass,op.first);//first button
				//make(op,op.start-1,op.sideClass,op.prev);//prev button
				//if(op.first!==false) make(op,1,op.firstClass,op.first);//first button
				make(op,op.start-1,op.prevClass,op.prev);//prev button
			}
			//	pages button
			for(var i=op.start;i<=op.end;i++)
				make(op,i,op.itemClass+(i==op.current?' '+op.itemCurrent:''),op.format);
			if(op.current/op.length<op.max/op.length){
				//if(op.end<op.max) make(op,op.end+1,op.sideClass,op.next);//next button
				//if(op.last!==false) make(op,op.max,op.sideClass,op.last);//last button
				if(op.end<op.max) make(op,op.end+1,op.nextClass,op.next);//next button
				//if(op.last!==false) make(op,op.max,op.lastClass,op.last);//last button
			}
			if(op.last!==false) make(op,op.max,op.lastClass,op.last);//last button
			this.__JQ_PAGING=op;
			//console.log("paging");
		});
	};
}(jQuery);

//그리드 페이징
function initPage(gridId, pageId, totalSize, currentPage){
	
	// 변수로 그리드아이디, 총 데이터 수, 현재 페이지를 받는다
	if(currentPage==""){
		var currentPage = $('#'+gridId).getGridParam('page');
	}
	// 한 페이지에 보여줄 페이지 수 (ex:1 2 3 4 5)
	var pageCount = 10;
	// 그리드 데이터 전체의 페이지 수
	var totalPage = Math.ceil(totalSize/$('#'+gridId).getGridParam('rowNum'));
	// 전체 페이지 수를 한화면에 보여줄 페이지로 나눈다.
	var totalPageList = Math.ceil(totalPage/pageCount);
	// 페이지 리스트가 몇번째 리스트인지
	var pageList=Math.ceil(currentPage/pageCount);
	
	//alert("currentPage="+currentPage+"/ totalPage="+totalSize);
	//alert("pageCount="+pageCount+"/ pageList="+pageList);
	
	// 페이지 리스트가 1보다 작으면 1로 초기화
	if(pageList<1) pageList=1;
	// 페이지 리스트가 총 페이지 리스트보다 커지면 총 페이지 리스트로 설정
	if(pageList>totalPageList) pageList = totalPageList;
	// 시작 페이지
	var startPageList=((pageList-1)*pageCount)+1;
	// 끝 페이지
	var endPageList=startPageList+pageCount-1;
	
	//alert("startPageList="+startPageList+"/ endPageList="+endPageList);
	
	// 시작 페이지와 끝페이지가 1보다 작으면 1로 설정
	// 끝 페이지가 마지막 페이지보다 클 경우 마지막 페이지값으로 설정
	if(startPageList<1) startPageList=1;
	if(endPageList>totalPage) endPageList=totalPage;
	if(endPageList<1) endPageList=1;
	
	// 페이징 DIV에 넣어줄 태그 생성변수
	var pageInner="";
	
	// 페이지 리스트가 1이나 데이터가 없을 경우 (링크 빼고 흐린 이미지로 변경)
	if(pageList<2){
// 		pageInner+="<img src='firstPage2.gif'>";
// 		pageInner+="<img src='prePage2.gif'>";
	}
	// 이전 페이지 리스트가 있을 경우 (링크넣고 뚜렷한 이미지로 변경)
	
	pageInner+="<a class='btn-first' href='javascript:firstPage(\""+gridId+"\")'></a>"; // 페이징 처음 20200526
	
	if(pageList>1){
//		pageInner+="<a class='btn-first' href='javascript:firstPage(\""+gridId+"\")'></a>"; // 페이징 처음 20200526
		pageInner+="<a class='btn-prev' href='javascript:prePage(\""+gridId+"\", "+totalSize+")'></a>";
	}
    // 페이지 숫자를 찍으며 태그생성 (현재페이지는 강조태그)
	for(var i=startPageList; i<=endPageList; i++){
		if(i==currentPage){
			pageInner = pageInner +"<a class='on' href='javascript:goPage(\""+gridId+"\", "+(i)+")' id='"+(i)+"'>"+(i)+"</a> ";
		}else{
			pageInner = pageInner +"<a href='javascript:goPage(\""+gridId+"\", "+(i)+")' id='"+(i)+"'>"+(i)+"</a> ";
		}
	}
    //alert("총페이지 갯수"+totalPageList);
    //alert("현재페이지리스트 번호"+pageList);
   
    // 다음 페이지 리스트가 있을 경우
	if(totalPageList>pageList){
		pageInner+="<a class='btn-next' href='javascript:nextPage(\""+gridId+"\", "+totalSize+")'></a>";
//		pageInner+="<a class='btn-last' href='javascript:lastPage(\""+gridId+"\", "+totalPage+")'></a>"; // 페이징 마지막 20200526
	}
	
	pageInner+="<a class='btn-last' href='javascript:lastPage(\""+gridId+"\", "+totalPage+")'></a>"; // 페이징 마지막 20200526
	
    // 현재 페이지리스트가 마지막 페이지 리스트일 경우
	if(totalPageList==pageList){
//     	pageInner+="<img src='nextPage2.gif'>";
//     	pageInner+="<img src='lastPage2.gif'>";
	}  
    //alert(pageInner);
    // 페이징할 DIV태그에 우선 내용을 비우고 페이징 태그삽입
	$('#'+pageId).html("");
	$('#'+pageId).append(pageInner);
   
}

//그리드 첫페이지로 이동
function firstPage(gridId){
	$('#'+gridId).jqGrid('setGridParam', {
		page:1
	}).trigger("reloadGrid");
       
}
// 그리드 이전페이지 이동
function prePage(gridId, totalSize){
	var currentPage = $('#'+gridId).getGridParam('page');
	var pageCount = 10;
	
	currentPage-=pageCount;
	pageList=Math.ceil(currentPage/pageCount);
	currentPage=(pageList-1)*pageCount+pageCount;
	
	initPage(gridId,totalSize,currentPage);
	
	$('#'+gridId).jqGrid('setGridParam', {
		page:currentPage
	}).trigger("reloadGrid");
       
}
// 그리드 다음페이지 이동    
function nextPage(gridId, totalSize){
	var currentPage = $('#'+gridId).getGridParam('page');
	var pageCount = 10;
	
	currentPage+=pageCount;
	pageList=Math.ceil(currentPage/pageCount);
	currentPage=(pageList-1)*pageCount+1;
	
	initPage(gridId,totalSize,currentPage);
	
	$('#'+gridId).jqGrid('setGridParam', {
		page:currentPage
	}).trigger("reloadGrid");
}
// 그리드 마지막페이지 이동
function lastPage(gridId, totalSize){
	$('#'+gridId).jqGrid('setGridParam', {
		page:totalSize
	}).trigger("reloadGrid");
}
// 그리드 페이지 이동
function goPage(gridId, num){
	$('#'+gridId).jqGrid('setGridParam', {
		page:num
	}).trigger("reloadGrid");
}