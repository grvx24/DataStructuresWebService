var http = require('http'); // Import Node.js core module
var fs = require('fs');


var server = http.createServer(function (req, res) {
    if (req.url == '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<html><body><p>This is home Page.</p></body></html>');
        res.end();
    }
    else if (req.url == '/LinkedList.css') {
        res.writeHead(200, {"Content-Type": "text/css"});
        fs.readFile('LinkedList.css',null, function(error, data){
            if(error){
                res.writeHead(404);
                res.write('File not found.');
            }else{
                res.write(data);
            }
            res.end();
        });
    }
    else if (req.url == '/linkedlist') {
        res.writeHead(200, {"Content-Type": "text/html"});
        fs.readFile('LinkedList.html',null, function(error, data){
            if(error){
                res.writeHead(404);
                res.write('File not found.');
            }else{
                res.write(data);
            }
            res.end();
        });
    }
    else
        res.end('404 Invalid Request!');

});

server.listen(5000); //6 - listen for any incoming requests

console.log('Node.js web server at port 5000 is running..')