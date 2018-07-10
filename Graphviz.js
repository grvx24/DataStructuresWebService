function RunExample()
{
    RemoveImage();
    var code = 'graph {\n' +
        '    a -- b[color=red,penwidth=3.0];\n' +
        '    b -- c;\n' +
        '    c -- d[color=red,penwidth=3.0];\n' +
        '    d -- e;\n' +
        '    e -- f;\n' +
        '    a -- d;\n' +
        '    b -- d[color=red,penwidth=3.0];\n' +
        '    c -- f[color=red,penwidth=3.0];\n' +
        '}';

    document.getElementById('Input').value=code;

    d3.select("#graph").graphviz()
        .fade(false)
        .renderDot(code);
}

function RemoveImage() {
    var node = document.getElementById("graph");
    if(node.firstChild!=null)
    {
        node.removeChild(node.firstChild);
    }
}


function StartVisualization() {

    RemoveImage();

    var code=document.getElementById('Input').value;
    console.log(code);

    try{
        d3.select("#graph").graphviz()
            .fade(false)
            .renderDot(code);
    }catch (e) {
        alert(e.message);
    }


}


