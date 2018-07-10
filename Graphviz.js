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

function LinkedListExample() {

    RemoveImage();
    var code = 'digraph LinkedList{\n' +
        '        rankdir=LR;\n' +
        '        node [shape=record];\n' +
        '        a [label="{ <data> 12 | <ref>  }", width=1.2]\n' +
        '        b [label="{ <data> 99 | <ref>  }"];\n' +
        '        c [label="{ <data> 37 | <ref>  }"];\n' +
        '        d [label="{ <data> 99 | <ref>  }"];\n' +
        '        e [label="{ <data> 37 | <ref>  }"];\n' +
        '        f [label="{ <data> null }"];\n' +
        '        a:ref:c -> b:data [arrowhead=vee, arrowtail=dot, dir=both, tailclip=false, arrowsize=1.2];\n' +
        '        b:ref:c -> c:data [arrowhead=vee, arrowtail=dot, dir=both, tailclip=false];\n' +
        '        c:ref:c -> d      [arrowhead=vee, arrowtail=dot, dir=both, tailclip=false];\n' +
        '        d:ref:d -> e      [arrowhead=vee, arrowtail=dot, dir=both, tailclip=false];\n' +
        '        e:ref:e -> f      [arrowhead=vee, arrowtail=dot, dir=both, tailclip=false];\n' +
        '    }';

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


