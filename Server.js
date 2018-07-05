var http = require('http'); // Import Node.js core module
var fs = require('fs');


var server = http.createServer(function (req, res) {

    var filename;
    switch (req.url) {
        case '/':

            filename = "index.html";
            break;
        case '/index.css':

            filename = "index.css";
            break;

        case '/linkedlist':

            filename = "LinkedList.html";
            break;

        case '/LinkedList.css':
            filename = "LinkedList.css";
            break;

        case '/graph':
            filename = "Graph.html";
            break;

        case '/Graph.css':
            filename = "Graph.css";
            break;

        case '/stack':
            filename = "Stack_animation.html";
            break;

        case '/Stack_animation.css':
            filename = "Stack_animation.css";
            break;

        case '/tree':
            filename = "Tree.html";
            break;

        default:
            res.end('404 Invalid Request!');
            break;

    }

    if (filename) {
       var isHtml =  filename.search("html");

       if(isHtml>0){
           res.writeHead(200, {"Content-Type": "text/html"});
       }else{
           res.writeHead(200, {"Content-Type": "text/css"});
       }

        fs.readFile(filename, null, function (error, data) {
            if (error) {
                res.writeHead(404);
                res.write('File not found.');
            } else {
                res.write(data);
            }
            res.end();
        });
    }
});

server.listen(5000); //6 - listen for any incoming requests

console.log('Node.js web server at port 5000 is running..')