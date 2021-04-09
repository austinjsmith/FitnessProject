"use strict";

const express = require('express');
const app = express();
const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const argon2 = require("argon2");
const Joi = require('joi');
const path = require("path");
 
const app = express();
app.arguments(exoress.json());


const {playListModel} = require('Models/playListModel');
const {uploadModel} = require('Models/uploadModel');

const PORT = 8000;

app.use(express.static(path.join(_dirname, "Public"),{
    extensions: ['html']
}));

 /*
app.get("/", (req, res) => {
    res.send("Hello, World!");
});
 
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});*/



/*
//upload file
app.post("/uploadVideo", upload.single(videoFile'), function (req, res) => ,
    console.log("POST / uploadVideo")
    upload.single('videoFile')

    
});*/
