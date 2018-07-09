const exampleData= {
    "type":"tree",
    "subtype":"simple_v2",
    "data":{
        "node_data":"Value1",
        "children":[
            {
                "node_data":"Value34",
                "children":[
                    {
                        "node_data":"Value111",
                        "children": [
                            {
                                "node_data":"Value67",
                                "children":[
                                    {
                                        "node_data":"Value1",
                                        "children":[]
                                    },                            {
                                        "node_data":"Value2",
                                        "children":[]
                                    },                            {
                                        "node_data":"Value3",
                                        "children":[]
                                    },                            {
                                        "node_data":"Value4",
                                        "children":[]
                                    },
                                ]
                            },
                            {
                                "node_data":"Value674",
                                "children":[]
                            },
                        ]
                    },                            {
                        "node_data":"Value111",
                        "children": [
                            {
                                "node_data":"Value67",
                                "children":[]
                            },
                            {
                                "node_data":"Value674",
                                "children":[]
                            },
                            {
                                "node_data":"Value1294",
                                "children":[]
                            },
                        ]
                    }
                ]
            },
            {
                "node_data":"Value303",
                "children":[
                    {
                        "node_data":"Value456",
                        "children": []
                    },
                    {
                        "node_data":"Value150",
                        "children": []
                    }
                ]
            }
        ]
    }
};

const exampleString = "{\n" +
    "    \"type\":\"tree\",\n" +
    "    \"subtype\":\"simple_v2\",\n" +
    "    \"data\":{\n" +
    "        \"node_data\":\"Value1\",\n" +
    "        \"children\":[\n" +
    "            {\n" +
    "                \"node_data\":\"Value34\",\n" +
    "                \"children\":[\n" +
    "                    {\n" +
    "                        \"node_data\":\"Value111\",\n" +
    "                        \"children\": [\n" +
    "                            {\n" +
    "                                \"node_data\":\"Value67\",\n" +
    "                                \"children\":[\n" +
    "                                    {\n" +
    "                                        \"node_data\":\"Value1\",\n" +
    "                                        \"children\":[]\n" +
    "                                    },                            {\n" +
    "                                        \"node_data\":\"Value2\",\n" +
    "                                        \"children\":[]\n" +
    "                                    },                            {\n" +
    "                                        \"node_data\":\"Value3\",\n" +
    "                                        \"children\":[]\n" +
    "                                    },                            {\n" +
    "                                        \"node_data\":\"Value4\",\n" +
    "                                        \"children\":[]\n" +
    "                                    },\n" +
    "                                ]\n" +
    "                            },\n" +
    "                            {\n" +
    "                                \"node_data\":\"Value674\",\n" +
    "                                \"children\":[]\n" +
    "                            },\n" +
    "                        ]\n" +
    "                    },                            {\n" +
    "                        \"node_data\":\"Value111\",\n" +
    "                        \"children\": [\n" +
    "                            {\n" +
    "                                \"node_data\":\"Value67\",\n" +
    "                                \"children\":[]\n" +
    "                            },\n" +
    "                            {\n" +
    "                                \"node_data\":\"Value674\",\n" +
    "                                \"children\":[]\n" +
    "                            },\n" +
    "                            {\n" +
    "                                \"node_data\":\"Value1294\",\n" +
    "                                \"children\":[]\n" +
    "                            },\n" +
    "                        ]\n" +
    "                    }\n" +
    "                ]\n" +
    "            },\n" +
    "            {\n" +
    "                \"node_data\":\"Value303\",\n" +
    "                \"children\":[\n" +
    "                    {\n" +
    "                        \"node_data\":\"Value456\",\n" +
    "                        \"children\": []\n" +
    "                    },\n" +
    "                    {\n" +
    "                        \"node_data\":\"Value150\",\n" +
    "                        \"children\": []\n" +
    "                    }\n" +
    "                ]\n" +
    "            }\n" +
    "        ]\n" +
    "    }\n" +
    "}";



function RunExample() {

    var text = JSON.stringify(exampleData);
    var jsonData = JSON.parse(text);
    console.log(exampleData);
    document.getElementById("JsonInput").value =text;
    Visualize(jsonData);


}

function ResetSvg() {
    var myNode = document.getElementById("SvgContainer");
    if (myNode != null) {
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }

        myNode.innerHTML = "<style>\n" +
            "                .node {\n" +
            "                    cursor: pointer;\n" +
            "                }\n" +
            "\n" +
            "                .node circle {\n" +
            "                    fill: darkgreen;\n" +
            "                    stroke: yellow;\n" +
            "                    stroke-width: 3px;\n" +
            "                }\n" +
            "\n" +
            "                .node text {\n" +
            "                    font: 20px sans-serif;\n" +
            "                    font-weight: bold;\n" +
            "                }\n" +
            "\n" +
            "                .link {\n" +
            "                    fill: none;\n" +
            "                    stroke: #ccc;\n" +
            "                    stroke-width: 1.5px;\n" +
            "                }\n" +
            "            </style>";
    }
}

function StartVisualization() {

    var text =document.getElementById("JsonInput").value;
    try {
        console.log(text);
        Visualize(JSON.parse(text));
    }catch (e) {
        alert(e.message);
    }
    
}


function Visualize(jsonData) {

    ResetSvg();


    var margin = {top: 20, right: 120, bottom: 20, left: 120},
        width = 1500 - margin.right - margin.left,
        height = 1000 - margin.top - margin.bottom;

    var i = 0,
        duration = 750,
        root;

    var tree = d3.layout.tree()
        .size([height, width]);

    var diagonal = d3.svg.diagonal()
        .projection(function(d) { return [d.x, d.y]; });

    var svg = d3.select("#SvgContainer")
        .attr("transform", "translate(100,0)")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(0,100)");

    var root = jsonData.data;
    root.x0 = height / 2;
    root.y0 = 0;

    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    root.children.forEach(collapse);
    update(root);


    d3.select(self.frameElement).style("height", "800px");

    function update(source) {

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function(d) { d.y = d.depth * 100; });

        // Update the nodes…
        var node = svg.selectAll("g.node")
            .data(nodes, function(d) { return d.id || (d.id = ++i); });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
            .on("click", click);

        nodeEnter.append("circle")
            .attr("r", 10)
            .style("fill", function(d) { return d._children ? "red" : "green"; });

        nodeEnter.append("text")
            .attr("y", function(d) {
                return d.children || d._children ? -35 : 35; })
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .text(function(d) { return d.node_data; })
            .style("fill-opacity", 1);

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

        nodeUpdate.select("circle")
            .attr("r", 25)
            .style("fill", function(d) { return d._children ? "red" : "green"; });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
            .remove();

        nodeExit.select("circle")
            .attr("r", 1e-6);

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);

        // Update the links…
        var link = svg.selectAll("path.link")
            .data(links, function(d) { return d.target.id; });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
                var o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                var o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    // Toggle children on click.
    function click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update(d);
    }
}