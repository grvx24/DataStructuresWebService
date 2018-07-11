var filename = 'DataStructure';
var canvas = document.getElementById("canvasId");

function DrawCanvas() {
    var svgHtml = document.getElementById("svgDiv").innerHTML.trim();


    console.log(svgHtml);

    canvg(canvas,svgHtml);
    canvas.style.display="none";
}

function DownloadPNG() {

    DrawCanvas();

    var url = canvas.toDataURL('image/png');
    var link = document.getElementById('DownloadLink');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
}