function GraphExample()
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

function HashTableExample() {
    var code = 'digraph G {\n' +
        '\n' +
        'nodesep=.05;\n' +
        '\n' +
        'rankdir=LR;\n' +
        '\n' +
        'node [shape=record,width=.1,height=.1];\n' +
        '\n' +
        ' \n' +
        'node0 [label = " | | | | | | | ",height=2.0];\n' +
        '\n' +
        'node [width = 1.5];\n' +
        '\n' +
        'node1 [label = "{ n14 | 719 | }"];\n' +
        '\n' +
        'node2 [label = "{ a1 | 805 | }"];\n' +
        '\n' +
        'node3 [label = "{ i9 | 718 | }"];\n' +
        '\n' +
        'node4 [label = "{ e5 | 989 | }"];\n' +
        '\n' +
        'node5 [label = "{ t20 | 959 | }"] ;\n' +
        '\n' +
        'node6 [label = "{ o15 | 794 | }"] ;\n' +
        '\n' +
        'node7 [label = "{ s19 | 659 | }"] ;\n' +
        '\n' +
        ' \n' +
        'node0:f0 -> node1:n;\n' +
        '\n' +
        'node0:f1 -> node2:n;\n' +
        '\n' +
        'node0:f2 -> node3:n;\n' +
        '\n' +
        'node0:f5 -> node4:n;\n' +
        '\n' +
        'node0:f6 -> node5:n;\n' +
        '\n' +
        'node2:p -> node6:n;\n' +
        '\n' +
        'node4:p -> node7:n;\n' +
        '\n' +
        '}';

    document.getElementById('Input').value=code;

    d3.select("#graph").graphviz()
        .fade(false)
        .renderDot(code);
}


function RunExample() {
    var option = document.getElementById("examples");

    switch (option.options[option.selectedIndex].value)
    {
        case "LinkedList":
            LinkedListExample();
            break;

        case "Graph":
            GraphExample();
            break;
        case "HashTable":
            HashTableExample();
            break;
        default:
            break;

    }

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


