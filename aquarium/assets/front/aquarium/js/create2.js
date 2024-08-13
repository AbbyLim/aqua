// Preloader
const preloader = {
    show : function() {
        $('.pageLoader').fadeIn();
    },
    hide : function() {
        $('.pageLoader').fadeOut(100);
    }
};

const INIT_COLOR = "#31ffd1"; // 초기 컬러값
const BTN_PICKCOLOR = $(".btn-color");          // 버튼 : 컬러선택
const BTN_PICKBRUSH = $(".btn-brush");          // 버튼 : 브러쉬선택
const BOX_COLORPICKER = $("#colorPickBox");     // 박스 : 컬러피커
const BOX_BRUSHPICK = $("#brushPickBox");       // 박스 : 브러쉬
const LIST_BRUSH_ITEM = BOX_BRUSHPICK.find(".brush__list > li"); // 아이템 : 브러쉬
const BTN_COMPLETE = $("#btnComplete");         // 버튼 : 완성 (값 전달)
let fish_index = 0;                             // 선택한 물고기
let colorPicker;                                // 컬러피커 생성
let pickColorHex = INIT_COLOR;                  // 선택한 컬러
let pickColorRgba;
let pickBrush = 0;                                  // 선택한 브러쉬
let selDivIdx;                                  // 면 인덱스
let result = [];

// 선택한 색상, 브러쉬(, 브러쉬 컬러매트릭스)
/******
 * 각 면의 값(색상, 브러쉬, 매트릭스컬러)는 0번부터 순서대로 저장됩니다.
 *******/
let sendColorHex = []; // 선택 Hexcode
let sendBrush = []; // 선택 브러쉬
let sendMatrixVal = []; // 선택 컬러매트릭스

// 컬러피커 옵션
const COLORPICKER_CONFIG = {
    width : 404,
    handleRadius : 8,
    activeHandleRadius : 10,
    colors : [INIT_COLOR], // 초기 세팅값
    borderWidth : 0,
    padding : 4,
    wheelLightness : true,
    transparency : true,
    display : "none",
    layout : [{
        component : iro.ui.Wheel,
        options : {
            wheelDirection : 'clockwise',
            wheelAngle : 0,
        }
    }]
}

// 컬러피커 생성
colorPicker = new iro.ColorPicker("#colorPickBox", COLORPICKER_CONFIG);

// 클릭 : 컬러피커 오픈
BTN_PICKCOLOR.on("click", function() {
    compDisable(); // 완성 버튼 비활성화

    if(!BOX_COLORPICKER.hasClass("visible")) {
        layerReset(); // 초기화

        $(this).addClass("on");
        BOX_COLORPICKER.addClass("visible");
    } else {
        $(this).removeClass("on");
        BOX_COLORPICKER.removeClass("visible");
        BTN_PICKCOLOR.children(".ico").css({"background-color" : pickColorHex});
    }

    colorPicker.on('color:change', onColorChange);

    onColorPickerResize();
});

// 선택한 컬러값 저장 (16진수 hex)
let colorMatrixVal = "0 0 0 0 0.19215686 0 0 0 0 1 0 0 0 0 0.81960784 0 0 0 1 0"; // feColorMatrix default values (#31ffd1 해당 hexcode 컬러의 매트릭스 값이 기본입니다.)

function onColorChange(color) {
    pickColorRgba = color.rgba;
    pickColorHex = color.hexString;

    colorMatrixChange(pickColorRgba);

    BTN_PICKCOLOR.children(".ico").css({"background-color" : pickColorHex});
}

// 컬러매트릭스 rgba => 매트릭스 values 변환
function colorMatrixChange(rgbaColor) {
    let r = rgbaColor.r;
    let g = rgbaColor.g;
    let b = rgbaColor.b;
    let a = rgbaColor.a;

    function rgbaToMatrix(r, g, b, a) {
        return `0 0 0 0 ${r / 255} 0 0 0 0 ${g / 255} 0 0 0 0 ${b / 255} 0 0 0 ${a} 0`
    }

    colorMatrixVal = rgbaToMatrix(r, g, b, a);
}

// 컬러피커 사이즈 조정
function onColorPickerResize() {
    let wid = $(".IroColorPicker").width();
    colorPicker.resize(wid);
}

// 클릭 : 브러쉬 레이어 오픈
BTN_PICKBRUSH.on("click", function() {
    compDisable(); // 완성 버튼 비활성화

    if(!BOX_BRUSHPICK.hasClass("visible")) {
        layerReset(); // 초기화

        $(this).addClass("on");
        BOX_BRUSHPICK.addClass("visible");
    } else {
        $(this).removeClass("on");
        BOX_BRUSHPICK.removeClass("visible");
    }

    // 클릭 : 브러쉬 아이템 선택
    $("body").on("click", ".brush__list > li", function() {
        const ico = BTN_PICKBRUSH.children("i"); // 브러쉬 아이콘

        $(this).addClass("on").siblings("li").removeClass("on");
        pickBrush = $(this).data("brush"); // 선택한 브러쉬 [0:물감,1:크레용,2:마커]
        ico.removeClass();

        switch(pickBrush) {
            case 0 :
                ico.addClass("ico ico-brush");
                break;
            case 1 :
                ico.addClass("ico ico-crayon");
                break;
            case 2 :
                ico.addClass("ico ico-marker");
                break;
        }
    });
});

function compDisable() {
    BTN_COMPLETE.addClass("is-disable");
}

function compAble() {
    BTN_COMPLETE.removeClass("is-disable");
}

// 컬러,브러쉬 초기화
const layerReset = function() {
    BTN_PICKCOLOR.removeClass("on");
    BOX_COLORPICKER.removeClass("visible");
    BTN_PICKBRUSH.removeClass("on");
    BOX_BRUSHPICK.removeClass("visible");
}

// 외부클릭 => 레이어 숨김
$("html").on('click', function(e) {
    var $t = $(e.target);
    var $carea = $t.closest('.btn-color, .btn-brush, .lay-tit, .tx_brush_msg .IroColorPicker, .brush__list'); // 클릭 영역
    if(!$carea.length) {
        layerReset();
        colorPicker.off('color:change', onColorChange);

        // 완성 버튼 활성화
        if(BTN_COMPLETE.hasClass("is-disable")) {
            compAble();
        }
    }
});

$(window).load(function() {
    // SVG 파일 내 JS 제어
    const FISHSVG = document.querySelector('.fishsvg');
    const SVGDOC = FISHSVG.contentDocument;// contentDocument 속성으로 접근
    const FISHSELECT = SVGDOC.querySelectorAll(".fish-selector"); // 물고기 각 면(g) 선택
    const FISHDIV = SVGDOC.querySelectorAll("g[id^='fishDiv']");
    const FISHDIV_LENGTH = FISHDIV.length; // 면 갯수

    // 전송할 배열 면의 갯수 초기화
    $.each(FISHDIV, function(i, v) {
        sendColorHex.push('#FFFFFF');
        sendBrush.push(0);
        sendMatrixVal.push('1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0');
    });

    // feColorMatrix SVG 삽입 : 면 갯수대로 추가
    let filterHtml = "";
    filterHtml += "<svg x=0 y=0 width=500 height=500 id='brushSvg' color-interpolation-filters='sRGB'>";
    filterHtml += "<defs>";
    for(let i = 0; i <= FISHDIV_LENGTH; i++) {
        filterHtml += "<filter id='f" + i + "' x='0' y='0' width='100%' height='100%'>";
        filterHtml += "     <feColorMatrix type='matrix' values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0' />";
        filterHtml += "</filter>";
    }
    filterHtml += "</defs>";
    for(let i = 0; i <= FISHDIV_LENGTH; i++) {
        filterHtml += "<image class='brush-div-" + i + " is-hidden' xlink:href='' x='0' y='0' height='100%' width='100%' />";
    }
    filterHtml += "</svg>";

    $(".bg__brush").html(filterHtml);

    // 원 선택시, drawFish(색칠) 실행
    $(FISHSELECT).on('click', event => {
        let _target = event.target;
        layerReset();

        selDivIdx = $(_target).data("idx"); // 선택한 면 인덱스

        drawFish(_target, fish_index, pickBrush, selDivIdx); //타겟, 물고기, 브러쉬, 선택한 면
    });

    // 물고기 색칠하기
    function drawFish(target, fishIdx, brushIdx, selIdx) {
        target.style.fill = pickColorHex;
        sendColorHex[selIdx] = pickColorHex; // 헥스코드 컬러 저장
        console.log(fishIdx, brushIdx, selIdx);
        if(brushIdx == undefined) {
            // 브러쉬 선택 안했을때 단색 & 브러쉬 숨김
            $(SVGDOC.querySelectorAll("#fishDiv" + selIdx + " .fish-div")).css({"fill" : pickColorHex});
            $(".brush-div-" + selIdx).css({"opacity" : 0});
        } else {
            sendBrush[selIdx] = `${brushIdx}`; // 브러쉬 네이밍 번호 저장

            $(SVGDOC.querySelectorAll("#fishDiv" + selIdx + " .fish-div")).css({"fill" : "transparent"});
            $(".brush-div-" + selIdx)
            .attr("xlink:href", `/assets/front/aquarium/images/fishbrush/${fishIdx}_${brushIdx}_${selIdx}.png`)
            .css({
                "-webkit-filter" : "url(#f" + selIdx + ")",
                "filter" : "url(#f" + selIdx + ")",
                "opacity" : 1
            });

            sendMatrixVal[selIdx] = colorMatrixVal;
            $("#f" + selIdx + " feColorMatrix").attr({"values" : colorMatrixVal});
        }
    }

    // 완성 버튼 클릭 시, 값 전달
    BTN_COMPLETE.on("click", function() {
        // 선택한 컬러 저장한 뒤 전송할 변수
        // console.log(fish_index);        // 물고기 번호
        // console.log(sendColorHex);      // 면에 채워진 색상 (ex: #000000)
        // console.log(sendBrush);         // 면에 채워진 브러쉬 (ex: 0~2)
        // console.log(sendMatrixVal);     // 브러쉬 선택된 면에 채워진 매트릭스 값
    });
});

$(document).ready(function() {
    // // 파라미터 물고기 인덱스 svg 변경
    // const _URL = window.location.search.split("=");
    // let getParam = _URL[_URL.length - 1];
    //
    // if(getParam != "") { // 파라미터 체크
    //     fish_index = getParam; // 파라미터 없을 땐 1번 물고기 노출
    // }
    // $(".svg__area > .capture_box").append(`<object class="fishsvg" type="image/svg+xml" data="./images/fishsvg/fish${fish_index}.svg"></object>`)
    // console.log(fish_index + "번째 물고기 svg 노출");
});

$(window).resize(function() {
    // 리사이즈 될 때 컬러피커 width 조정
    $(window).on("resize", function() {
        onColorPickerResize();
    });
});