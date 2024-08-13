// Preloader
const preloader2 = {
    show: () => $('.pageLoader').fadeIn(),
    hide: () => $('.pageLoader').fadeOut(100),
};

const INIT_COLOR = "#31ffd1";
const BTN_PICKCOLOR = $(".btn-color");
const BTN_PICKBRUSH = $(".btn-brush");
const BOX_COLORPICKER = $("#colorPickBox");
const BOX_BRUSHPICK = $("#brushPickBox");
const BTN_COMPLETE = $("#btnComplete");

let fish_index = 0;
let colorPicker;
let pickColorHex = INIT_COLOR;
let pickColorRgba;
let pickBrush = 0;
let selDivIdx;
let SVGDOC;
let colorMatrixVal = "0 0 0 0 0.19215686 0 0 0 0 1 0 0 0 0 0.81960784 0 0 0 1 0";

const sendColorHex = [];
const sendBrush = [];
const sendMatrixVal = [];

const COLORPICKER_CONFIG = {
    width: 404,
    handleRadius: 8,
    activeHandleRadius: 10,
    colors: [INIT_COLOR],
    borderWidth: 0,
    padding: 4,
    wheelLightness: true,
    transparency: true,
    display: "none",
    layout: [{
        component: iro.ui.Wheel,
        options: {
            wheelDirection: 'clockwise',
            wheelAngle: 0,
        },
    }],
};

// Initialize color picker
colorPicker = new iro.ColorPicker("#colorPickBox", COLORPICKER_CONFIG);

const initialize = () => {
    $(window).on("load", onWindowLoad);
    $(window).on("resize", onColorPickerResize);
    BTN_PICKCOLOR.on("click", onPickColorClick);
    BTN_PICKBRUSH.on("click", onPickBrushClick);
    BTN_COMPLETE.on("click", onCompleteClick);
    $("html").on('click', onOutsideClick);
}

const onWindowLoad = () => {
    const FISHSVG = document.querySelector('.fishsvg');

    FISHSVG.addEventListener('load', () => {
        SVGDOC = FISHSVG.contentDocument;
        const FISHSELECT = SVGDOC.querySelectorAll(".fish-selector");
        const FISHDIV = SVGDOC.querySelectorAll("g[id^='fishDiv']");
        const FISHDIV_LENGTH = FISHDIV.length;

        initializeColorMatrix(FISHDIV_LENGTH);
        initializeSendArrays(FISHDIV_LENGTH);

        $(FISHSELECT).on('click', (event) => {
            const _target = event.target;
            layerReset();
            selDivIdx = $(_target).data("idx");
			console.log(selDivIdx)
            drawFish(_target, fish_index, pickBrush, selDivIdx);
        });
    });
};

const initializeColorMatrix = (length) => {
    let filterHtml = `
        <svg x=0 y=0 width=500 height=500 id='brushSvg' color-interpolation-filters='sRGB'>
            <defs>
    `;

    for (let i = 0; i <= length; i++) {
        filterHtml += `
            <filter id='f${i}' x='0' y='0' width='100%' height='100%'>
                <feColorMatrix type='matrix' values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0' />
            </filter>
        `;
    }

    filterHtml += "</defs>";

    for (let i = 0; i <= length; i++) {
        filterHtml += `<image class='brush-div-${i} is-hidden' xlink:href='' x='0' y='0' height='100%' width='100%' />`;
    }

    filterHtml += "</svg>";

    $(".bg__brush").html(filterHtml);
}

const initializeSendArrays = (length) => {
    for (let i = 0; i < length; i++) {
        sendColorHex.push('#FFFFFF');
        sendBrush.push(0);
        sendMatrixVal.push('1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0');
    }
}

const onPickColorClick = () => {
    toggleLayer(BOX_COLORPICKER, BTN_PICKCOLOR);

    if (BOX_COLORPICKER.hasClass("visible")) {
        colorPicker.on('color:change', onColorChange);
        onColorPickerResize();
    } else {
        colorPicker.off('color:change', onColorChange);
        BTN_PICKCOLOR.children(".ico").css({ "background-color": pickColorHex });
    }
    compDisable();
}

const onPickBrushClick = () => {
    toggleLayer(BOX_BRUSHPICK, BTN_PICKBRUSH);
    compDisable();

    $("body").on("click", ".brush__list > li", function () {
        const ico = BTN_PICKBRUSH.children("i");
        $(this).addClass("on").siblings("li").removeClass("on");
        pickBrush = $(this).data("brush");

        ico.removeClass();
        ico.addClass(`ico ico-${getBrushName(pickBrush)}`);
    });
}

const getBrushName = (brushIndex) => {
    const brushNames = ['brush', 'crayon', 'marker'];
    return brushNames[brushIndex] || 'brush';
}

const onCompleteClick = () => {
    // Values to be sent
    // console.log(fish_index);
    // console.log(sendColorHex);
    // console.log(sendBrush);
    // console.log(sendMatrixVal);
}

const onOutsideClick = (e) => {
    if (!$(e.target).closest('.btn-color, .btn-brush, .lay-tit, .tx_brush_msg .IroColorPicker, .brush__list').length) {
        layerReset();
        colorPicker.off('color:change', onColorChange);
        if (BTN_COMPLETE.hasClass("is-disable")) {
            compAble();
        }
    }
}

const onColorChange = (color) => {
    pickColorRgba = color.rgba;
    pickColorHex = color.hexString;
    colorMatrixChange(pickColorRgba);
    BTN_PICKCOLOR.children(".ico").css({ "background-color": pickColorHex });
}

const colorMatrixChange = (rgbaColor) => {
    const { r, g, b, a } = rgbaColor;

    const rgbaToMatrix = (r, g, b, a) => `0 0 0 0 ${r / 255} 0 0 0 0 ${g / 255} 0 0 0 0 ${b / 255} 0 0 0 ${a} 0`;

    colorMatrixVal = rgbaToMatrix(r, g, b, a);
}

const onColorPickerResize = () => {
    const wid = $(".IroColorPicker").width();
    colorPicker.resize(wid);
}

const drawFish = (target, fishIdx, brushIdx, selIdx) => {
    target.style.fill = pickColorHex;
    sendColorHex[selIdx] = pickColorHex;

    if (brushIdx === undefined) {
        $(SVGDOC.querySelectorAll(`#fishDiv${selIdx} .fish-div`)).css({ "fill": pickColorHex });
        $(`.brush-div-${selIdx}`).css({ "opacity": 0 });
    } else {
        sendBrush[selIdx] = `${brushIdx}`;
        $(SVGDOC.querySelectorAll(`#fishDiv${selIdx} .fish-div`)).css({ "fill": "transparent" });

        $(`.brush-div-${selIdx}`)
        .attr("xlink:href", `../images/fishbrush/${fishIdx}_${brushIdx}_${selIdx}.png`)
        .css({
            "-webkit-filter": `url(#f${selIdx})`,
            "filter": `url(#f${selIdx})`,
            "opacity": 1,
        });

        sendMatrixVal[selIdx] = colorMatrixVal;
        $(`#f${selIdx} feColorMatrix`).attr({ "values": colorMatrixVal });
    }
}

const compDisable = () => BTN_COMPLETE.addClass("is-disable");
const compAble = () => BTN_COMPLETE.removeClass("is-disable");

const layerReset = () => {
    BTN_PICKCOLOR.removeClass("on");
    BOX_COLORPICKER.removeClass("visible");
    BTN_PICKBRUSH.removeClass("on");
    BOX_BRUSHPICK.removeClass("visible");
}

const toggleLayer = (box, button) => {
    if (!box.hasClass("visible")) {
        layerReset();
        button.addClass("on");
        box.addClass("visible");
    } else {
        button.removeClass("on");
        box.removeClass("visible");
    }
}

$(document).ready(initialize);
