var http = require('http'); // Import Node.js core module
var fs = require('fs');

var server = http.createServer(function (req, res) {

    var filename;

    if(req.url.search("Styles")>0){

        switch(req.url.replace('/Styles','')){
            case '/MainStyles.css':
                filename = "Styles/MainStyles.css";
                break;
            case '/Buttons.css':
                filename = "Styles/Buttons.css";
                break;
        }
    }else if (req.url.search("Images")>0){

        switch(req.url.replace('/Images','')){
            case '/canvas.png':
                filename = "Images/canvas.png";
                break;
        }
    }else{

        switch (req.url) {
            case '/':
                filename = "index.html";
                break;
            case '/index.css':
                filename = "index.css";
                break;


            case '/linkedlist':
                filename = "Visualisation/LinkedList/LinkedList.html";
                break;
            case '/LinkedList.css':
                filename = "Visualisation/LinkedList/LinkedList.css";
                break;
            case '/LinkedList.js':
                filename = "Visualisation/LinkedList/LinkedList.js";
                break;

            case '/tree':
                filename = "Visualisation/Tree/Tree.html";
                break;
            case '/Tree.css':
                filename = "Visualisation/Tree/Tree.css";
                break;
            case '/Tree.js':
                filename = "Visualisation/Tree/Tree.js";
                break;


            case '/graph':
                filename = "Visualisation/Graph/Graph.html";
                break;
            case '/Graph.css':
                filename = "Visualisation/Graph/Graph.css";
                break;
            case '/Graph.js':
                filename = "Visualisation/Graph/Graph.js";
                break;


            case '/graphviz':
                filename = "Visualisation/Graphviz/Graphviz.html";
                break;
            case '/Graphviz.css':
                filename = "Visualisation/Graphviz/Graphviz.css";
                break;
            case '/Graphviz.js':
                filename = "Visualisation/Graphviz/Graphviz.js";
                break;


            case '/hashtable':
                filename = "Visualisation/HashTable/HashTable.html";
                break;
            case '/HashTable.css':
                filename = "Visualisation/HashTable/HashTable.css";
                break;
            case '/HashTable.js':
                filename = "Visualisation/HashTable/HashTable.js";
                break;



            case '/stackAnimation':
                filename = "Animations/Stack/Stack_animation.html";
                break;
            case '/Stack_animation.css':
                filename = "Animations/Stack/Stack_animation.css";
                break;
            case '/Stack_animation.js':
                filename = "Animations/Stack/Stack_animation.js";
                break;


            case '/graphAnimation':
                filename = "Animations/Graph/Graph_Animation.html";
                break;
            case '/Graph_Animation.css':
                filename = "Animations/Graph/Graph_Animation.css";
                break;
            case '/Graph_Animation.js':
                filename = "Animations/Graph/Graph_Animation.js";
                break;


            case '/queueAnimation':
                filename = "Animations/Queue/Queue.html";
                break;
            case '/Queue.css':
                filename = "Animations/Queue/Queue.css";
                break;

            case '/queueWorkerAnimation':
                filename = "Animations/QueueWorker/QueueWorker.html";
                break;

            case '/stackAnimation':
                filename = "Animations/Stack/Stack_animation.html";
                break;
            case '/Stack_animation.css':
                filename = "Animations/Stack/Stack_animation.css";
                break;



            case '/SaveToFile.js':
                filename = "SaveToFile.js";
                break;

            default:
                res.end('404 Invalid Request!');
                break;
        }
    }

    if (filename) {
       var isHtml =  filename.search("html");
       var isPng =  filename.search("png");
       var isJS =  filename.search("js");
       var isJSON =  filename.search("json");

       if(isHtml>0){
           res.writeHead(200, {"Content-Type": "text/html"});

       }else if(isPng>0){
           res.writeHead(200, {"Content-Type": "image/png"});

       }else if(isJSON>0){
           res.writeHead(200, {"Content-Type": "application/json"});

       }else if(isJS>0){
           res.writeHead(200, {"Content-Type": "application/javascript"});

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