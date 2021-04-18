"use strict"
const {db} = require("./db");
const uuidV4 = require('uuid'.v4);

var videoPlayer = document.getElementById("videoPlayer");
var myVideo = document.getElementById("myVideo");

function stopVideo(){
    videoPlayer.style.display = "none";
}

function playVodeo(file){
    myVideo.src = file;
    videoPlayer.style.display = "block";
}