var filename = 'LinkedList';
var canvas = document.getElementById("canvasId");

function DrawCanvas() {
    var svgHtml = document.getElementById("svgDiv").innerHTML.trim();
    canvg(canvas,svgHtml);
    canvas.style.display="none";
}

function DownloadPNG() {

    DrawCanvas();

    var url = canvas.toDataURL('image/png');
    var link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
}