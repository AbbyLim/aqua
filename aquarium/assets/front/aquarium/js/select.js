// DOM 생성
const loadSwiperDom = function() {
    const fishLen = 28; // 물고기 갯수

    let num = 0; // 물고기 인덱스 초기화
    let fishHtml = ""; // 물고기 html
    for(let i = 0; i < fishLen / 6; i++) {
        fishHtml += "<div class='swiper-slide'>";
        fishHtml += "   <ul class='fish_list'>";
        for(var j = 0; j < 6; j++) {
            if(num < fishLen){
                fishHtml += "  <li data-set='" + num + "'><img src='../images/fishswiper/fish_item" + num + ".png' alt='물고기 " + num + "'></li>";
            }
            num++;
        }
        fishHtml += "   </ul>";
        fishHtml += "</div>";
    }

    // 스와이퍼 DOM APPEND
    $(".fishSwiper .swiper-wrapper").append(fishHtml);

    // 이벤트 : 물고기 클릭
    const fishItem = ".fish_list > li";
    let selFishIndex; // 선택한 물고기 파라미터로 전달

    $("body").on("click", fishItem, function() {
        const _this = $(this);
        selFishIndex = _this.data("set");
        $(fishItem).removeClass("on");
        _this.addClass("on");
    });

    // 선택 후 도메인 이동 파라미터 전달
    // const btnComplete = $(".btn_complete");
    //
    // btnComplete.on("click", function(e) {
    //     if(selFishIndex != undefined) {
    //         location.href = "aquarium3.html?selFish=" + selFishIndex;
    //     } else {
    //         selFishIndex = 0;
    //     }
    //     e.preventDefault();
    // });

    // 스와이퍼 실행
    swiperInit();
}

function swiperInit() {
    const fishSwiper = new Swiper(".fishSwiper", {
        spaceBetween : 0,
        loop : true,
        navigation : {nextEl : ".swiper-button-next", prevEl : ".swiper-button-prev"},
        pagination : {el : ".swiper-pagination", clickable : true},
        on : {
            init : function(swipe) {
                $(".fish_list li[data-set=0]").addClass("on")
            }
        }
    });
}