"use strict";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const bgmMuted = urlParams.get("nobgm");

let count = 0;

// idle
let idle = document.createElement("video");
let idleReady = false;
idle.src = "./hyaeh_idle.mp4";
idle.loop = true;
idle.muted = true;
idle.preload = "metadata";
idle.addEventListener("loadeddata", function(){
    idle.play();
    idleReady = true;
});

//hyaeh
let hyaeh = document.createElement("video");
let hyaehReady = false;
hyaeh.src = "./hyaeh.mp4";
hyaeh.loop = true;
hyaeh.muted = true;
idle.preload = "metadata";
hyaeh.addEventListener("loadeddata", function(){
    hyaeh.currentTime = 0.3;
    hyaehReady = true;
});

$.get("ost16.base64",
    function (data) {
        let bgm = document.createElement("audio");
        bgm.src = "data:audio/ogg;base64," + data;
        bgm.volume = bgmMuted ? 0 : 0.05;
        bgm.loop = true;
        let bgmFirstClick = function(){ 
            bgm.play();
            $(window).off("mousedown", bgmFirstClick);
        };
        $(window).mousedown(bgmFirstClick);
    }
);

let hyaehAudio = document.createElement("audio");
$.get("hyaeh.base64",
    function (data) {
        hyaehAudio.src = "data:audio/ogg;base64," + data;
        hyaehAudio.volume = 0.1;
    }
);

let canvas;
let ctx;
let canvasWidth = 0;
let canvasHeight = 0;

const setupCanvas = function(){
    const width = $(window).width();
    const height = $(window).height();
    const widthAppropriateRatio = !(width / 1920 >= height / 1080);

    canvasWidth = Math.floor(widthAppropriateRatio ? width : height / 1080 * 1920);
    canvasHeight = Math.floor(widthAppropriateRatio ? width / 1920 * 1080 : height);

    if (!canvas) {
        canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");

        $("#loading").before(canvas);
        $("#loading").remove();
    }
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
};

let frame = 0;
let active = false;
const mousedownUi = function(){
    hyaeh.play().catch(error => {});
    hyaehAudio.currentTime = 0;
    hyaehAudio.play();
    count++;
    active = true;
};
const mouseupUi = function(){
    hyaeh.currentTime = 0.3;
    hyaeh.pause();
    active = false;
};

$(window).mousedown(mousedownUi);
$(window).mouseup(mouseupUi);

const frameUi = function(){
    window.requestAnimationFrame(frameUi);
    if (!ctx || !idleReady || !hyaehReady)
        return;
    ctx.drawImage(active ? hyaeh : idle, 0, 0, canvasWidth, canvasHeight);
    
    ctx.fillStyle = "#F7F9FB";
    ctx.fillRect(canvasWidth * 840/1920, 0, canvasWidth * 160/1920, canvasHeight * 60/1080);
    ctx.fillRect(canvasWidth * 1160/1920, 0, canvasWidth * 190/1920, canvasHeight * 60/1080);
    ctx.fillRect(canvasWidth * 1450/1920, 0, canvasWidth * 150/1920, canvasHeight * 60/1080);

    ctx.fillStyle = "#2B3D57";

    ctx.font = "bold " + (canvasHeight / 1080 * 36) + "px sans-serif";
    let stam = (new Date().getHours().toString() * 10 + Math.floor(new Date().getMinutes()/6));
    ctx.fillText(stam + "/240", canvasWidth * 850/1920, canvasHeight * 49/1080);

    ctx.font = "bold " + (canvasHeight / 1080 * 34) + "px sans-serif";
    ctx.fillText("299,792,458", canvasWidth * 1165/1920, canvasHeight * 49/1080);

    ctx.font = "bold " + (canvasHeight / 1080 * 36) + "px sans-serif";
    ctx.fillText(count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","), canvasWidth * 1460/1920, canvasHeight * 49/1080);
};

$(function(){
    $("#loading").text("Page is loading... (If this message doesn't disappear, something went wrong. (damn it))");
    setupCanvas();
    $(window).resize(setupCanvas);
    frameUi();
});
