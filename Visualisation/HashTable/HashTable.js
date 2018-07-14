function RemoveSvg() {
    var node = document.getElementById("SvgContainer");
    if(node !=null)
    {
        while(node.firstChild)
        {
            node.removeChild(node.firstChild);
        }

    }

}


function RunHashTableExample() {
    RemoveSvg();


    var width = 1500;
    var height = 1000;
    var offset = 100;
    var dataRectWidth=125;
    var dataRectHeight=100;

    var valueRectWidth=100;
    var valueRectHeight=70;

    var indexRectWidth = 100;
    var indexRectHeight = 30;

    var pointerRectWidth = 50;
    var pointerRectHeight = 100;

    var jsonText = '{\n' +
        '    "type":"hash_table",\n' +
        '        "subtype":"many_values",\n' +
        '        "data":[\n' +
        '            {"key":"key_example0", "value" : ["val1","val2",3,5]},\n' +
        '            {"key":"key_example1", "value" : ["hi"]},\n' +
        '            {"key":"key_example2", "value" : ["val14",33,"val0",5]},\n' +
        '            {"key":"key_example3", "value" : ["val5",3]},\n' +
        '            {"key":"key_example4", "value" : [12,54]},\n' +
        '            {"key":"key_example5", "value" : [11]}\n' +
        '        ]\n' +
        '  \n' +
        '}\n' +
        '\n';

    var jsonData = JSON.parse(jsonText);
    document.getElementById("JsonInput").value =JSON.stringify(jsonData);


    var keys = [];
    var values = [];
    for (var i in jsonData.data)
    {
        keys.push(jsonData.data[i].key);
    }

    for(var i=0;i<keys.length;i++)
    {
        values.push(jsonData.data[i].value);
    }




    var svgContainer=d3.select("svg")
        .attr("width",width)
        .attr("height",height)
        .attr("transform",
            "translate(0, 0)");

    var keyRectangles=svgContainer.selectAll("#SvgContainer")
        .data(keys)
        .enter()
        .append("g")
        .attr("class","DataGroup")
        .attr("transform", "translate(0, 50)")
        .append("rect")
        .attr("class","DataRect")
        .attr("x",100)
        .attr("y",function (d,i) {
            return i *offset;
        })
        .attr("width",dataRectWidth)
        .attr("height",dataRectHeight);



    var keyText =svgContainer.selectAll(".DataGroup")
        .append("text")
        .attr("class","StructureText")
        .text(function (d,i) {
            return d;
        })
        .attr("x",(offset+60))
        .attr("y",function (d,i) {
            return i *offset+50;
        });

    var pointers =svgContainer.selectAll(".DataGroup")
        .append("rect")
        .attr("class","PointerRect")
        .attr("y",function (d,i) {
            return i *offset;
        })
        .attr("x",(offset+125))
        .attr("width",pointerRectWidth)
        .attr("height",pointerRectHeight);


    var lineX=250;
    var lineY=100;
    var lineThickness=3;

    var lines = svgContainer.selectAll(".DataGroup")
        .append("line")
        .attr("x1",lineX)
        .attr("y1",function (d,i) {
            return i*lineY+50;
        })
        .attr("x2",lineX+150)
        .attr("y2",function (d,i) {
            return i*lineY+50;
        })
        .attr("stroke-width", lineThickness)
        .attr("stroke", "red");

    var valuesRectangles = svgContainer.selectAll(".DataGroup");


    valuesRectangles.each(function (d,index) {
        d3.select(this).selectAll("g")
            .data(values[index])
            .enter()
            .append("g")
            .attr("class","ValuesGroup")
            .append("rect")
            .attr("class","ValueRect")
            .attr("x",function (d,i) {
                return 400+valueRectWidth*i;
            })
            .attr("y",function (d,i) {
                return offset*index;
            })
            .attr("width",valueRectWidth)
            .attr("height",valueRectHeight);
    });

    valuesRectangles.each(function (d,index) {
        d3.select(this).selectAll(".ValuesGroup")
            .append("rect")
            .attr("class","ValueRect2")
            .attr("x",function (d,i) {
                return 400+valueRectWidth*i;
            })
            .attr("y",function (d,i) {
                return offset*index+70;
            })
            .attr("width",indexRectWidth)
            .attr("height",indexRectHeight);


    });

    valuesRectangles.each(function (d,index) {
        d3.select(this).selectAll(".ValuesGroup")
            .append("text")
            .attr("class","StructureText")
            .text(function (d,i) {
                return d;
            })
            .attr("x",function (d,i) {
                return 400+offset*i+50;
            })
            .attr("y",function (d,i) {
                return offset*index+40;
            });
    });


    valuesRectangles.each(function (d,index) {
        d3.select(this).selectAll(".ValuesGroup")
            .append("text")
            .attr("class","StructureText")
            .text(function (d,i) {
                return i;
            })
            .attr("x",function (d,i) {
                return 400+offset*i+50;
            })
            .attr("y",function (d,i) {
                return offset*index+90;
            });
    });
    

}

function StartVisualization() {
    
}


function Visualize() {
    
}
