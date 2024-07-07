var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');
var imageDir = './images/';
var cssDir = './css/';
var javaScriptDir = './javascript/';
var htmlDir = './html/';

http.createServer(function (req, res) {
    var query = url.parse(req.url, true).query;
    var file;
    if (query.png !== undefined) {
        file = query.png;
        fs.readFile(imageDir + file, function (err, content) {
            res.writeHead(200, { 'Content-type': 'image/png' });
            res.end(content);

        });
    } else if (query.jpg !== undefined) {
        file = query.jpg;
        fs.readFile(imageDir + file, function (err, content) {
            res.writeHead(200, { 'Content-type': 'image/jpg' });
            res.end(content);
        });

    }
    else if (query.jpeg !== undefined) {
        file = query.jpeg;
        fs.readFile(imageDir + file, function (err, content) {
            res.writeHead(200, { 'Content-type': 'image/jpg' });
            res.end(content);
        });
    }
    else if (query.css !== undefined) {
        file = query.css;
        fs.readFile(cssDir + file, function (err, content) {
            res.writeHead(200, { 'Content-type': 'text/css' });
            res.end(content);

        });
    } else if (query.js != undefined) {
        file = query.js;
        fs.readFile(javaScriptDir + file, function (err, content) {
            res.writeHead(200, { 'Content-type': 'application/javascript' });
            res.end(content);

        });
    }
    else if (query.html != undefined) {
        file = query.html;
        fs.readFile(htmlDir + file, function (err, content) {
            res.writeHead(200, { 'Content-type': 'text/html' });
            res.end(content);

        });
    }
}).listen(3333);
console.log("File Server running at http://localhost:3333/");

