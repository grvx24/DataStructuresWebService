//Globals
var width = 500;
var height = 2000;

var dataRectWidth=100;
var dataRectHeight = 100;
var pointerRectWidth = 100;
var pointerRectHeight = 50;

var data=[];
var HeadX = 100

var svgContainer = null;


function Init() {
    svgContainer=d3.select("#svgContainer")
        .append("svg")
        .attr("class","SvgContainer")
        .attr("width",width)
        .attr("height",height)
        .attr("transform",
            "translate(100, 0)");


    var HeadGroup = d3.selectAll(".SvgContainer")
        .append("g")
        .attr("id","HeadGroup")
        .attr("transform", "translate(50 , 50)");



    var lastItemIndex = data.length;

    var NullGroup = d3.selectAll(".SvgContainer")
        .append("g")
        .attr("id","TailGroup")
        .attr("transform", "translate(50,"+(lastItemIndex*200+200)+")");

    NullGroup
        .append("rect")
        .attr("class","NullRect")
        .attr("y",0)
        .attr("x",HeadX)
        .attr("width",dataRectWidth)
        .attr("height",dataRectHeight)
        .attr("fill","green");

    NullGroup
        .append("text")
        .attr("class","SvgText")
        .text("NULL")
        .style("font-size", "30px")
        .style('fill', 'black')
        .style("font-weight","bold")
        .attr("x",(HeadX*2)-50)
        .attr("y",50);


    HeadGroup
        .append("rect")
        .attr("class","HeadRect")
        .attr("y",0)
        .attr("x",HeadX)
        .attr("width",dataRectWidth)
        .attr("height",dataRectHeight)
        .attr("fill","green");

    HeadGroup
        .append("text")
        .attr("class","SvgText")
        .text("Head")
        .style("font-size", "30px")
        .style('fill', 'black')
        .style("font-weight","bold")
        .attr("x",(HeadX*2)-50)
        .attr("y",50);

    HeadGroup
        .append("line")
        .attr("x1",HeadX*2-50)
        .attr("y1",100)
        .attr("x2",HeadX*2-50)
        .attr("y2",150)
        .attr("stroke-width", 5)
        .attr("stroke", "black");

    data=jsonData.data;

    var offset = (dataRectHeight + pointerRectHeight+50);
    var lineOffset = dataRectHeight + pointerRectHeight;


    var dataRectangles = svgContainer.selectAll(".SvgContainer")
        .data(data)
        .enter()
        .append("g")
        .attr("class","DataGroup")
        .attr("transform", "translate(100, 200)")
        .append("rect")
        .attr("class","DataRect")
        .attr("y",function (d,i) {
            return i *offset;
        })
        .attr("x",50)
        .attr("width",dataRectWidth)
        .attr("height",dataRectHeight);


    var pointerRectangles = svgContainer.selectAll(".DataGroup")
        .append("rect")
        .attr("class","PointerRect")
        .attr("y",function (d,i) {
            return i *offset+dataRectHeight;
        })
        .attr("x",50)
        .attr("width",pointerRectWidth)
        .attr("height",pointerRectHeight);


    var dataText = svgContainer.selectAll(".DataGroup")
        .append("text")
        .attr("class","StructureText")
        .text(function (d,i) {
            return "Data: "+d.value;
        })
        .attr("y",function (d,i) {
            return i *offset + dataRectHeight/2;
        })
        .attr("x",offset/2);

    var indexText = svgContainer.selectAll(".DataGroup")
        .append("text")
        .attr("class","PointerText")
        .text("Next")
        .attr("y",function (d,i) {
            return i *offset + dataRectHeight/2+pointerRectHeight*1.5;
        })
        .attr("x",offset/2);

    var lines = svgContainer.selectAll(".DataGroup")
        .append("line")
        .attr("x1",100)
        .attr("y1",function (d,i) {
            return i*200 + lineOffset;
        })
        .attr("x2",100)
        .attr("y2",function (d,i) {
            return i*200+lineOffset+50;
        })
        .attr("stroke-width", 5)
        .attr("stroke", "black");

    var lastItemIndex = data.length;

    var NullGroup = d3.selectAll("#TailGroup")
        .attr("transform", "translate(50,"+(lastItemIndex*200+200)+")");

    NullGroup.selectAll("rect")
        .attr("y",0)
        .attr("x",HeadX)
        .attr("width",dataRectWidth)
        .attr("height",dataRectHeight)
        .attr("fill","green");

    NullGroup.selectAll("text")
        .text("NULL")
        .style("font-size", "30px")
        .style('fill', 'black')
        .style("font-weight","bold")
        .attr("x",(HeadX*2)-50)
        .attr("y",50);

}



function RunExample()
{

    var jsonString =
        '{\n' +
        '        "type":"linked_list",\n' +
        '        "subtype":"single",\n' +
        '        "data":[\n' +
        '            {"value":33},\n' +
        '            {"value":234},\n' +
        '            {"value":123},\n' +
        '            {"value":0},\n' +
        '            {"value":1}\n' +
        '        ]\n' +
        '}';
    document.getElementById('JsonInput').value =jsonString;

    try
    {
        var jsonData = JSON.parse(jsonString);

    }catch (e) {
        console.log(e.message);
    }
    Visualize(jsonData);

}

function StartVisualization() {
    var jsonString = document.getElementById('JsonInput').value;

    try
    {
        var jsonData = JSON.parse(jsonString);
        Visualize(jsonData);
    }catch (e)
    {
        console.log(e.message);
    }
}

function RemoveSvgChildren() {
    var element=document.getElementById("svgContainer");
    while(element.firstChild)
    {
        element.removeChild(element.firstChild);
    }
}

function Visualize(jsonData) {
    RemoveSvgChildren();
    Init();

    data=jsonData.data;

    var offset = (dataRectHeight + pointerRectHeight+50);
    var lineOffset = dataRectHeight + pointerRectHeight;


    var dataRectangles = svgContainer.selectAll(".SvgContainer")
        .data(data)
        .enter()
        .append("g")
        .attr("class","DataGroup")
        .attr("transform", "translate(100, 200)")
        .append("rect")
        .attr("class","DataRect")
        .attr("y",function (d,i) {
            return i *offset;
        })
        .attr("x",50)
        .attr("width",dataRectWidth)
        .attr("height",dataRectHeight);



    var pointerRectangles = svgContainer.selectAll(".DataGroup")
        .append("rect")
        .attr("class","PointerRect")
        .attr("y",function (d,i) {
            return i *offset+dataRectHeight;
        })
        .attr("x",50)
        .attr("width",pointerRectWidth)
        .attr("height",pointerRectHeight);


    var dataText = svgContainer.selectAll(".DataGroup")
        .append("text")
        .attr("class","StructureText")
        .text(function (d,i) {
            return "Data: "+d.value;
        })
        .attr("y",function (d,i) {
            return i *offset + dataRectHeight/2;
        })
        .attr("x",offset/2);

    var indexText = svgContainer.selectAll(".DataGroup")
        .append("text")
        .attr("class","PointerText")
        .text("Next")
        .attr("y",function (d,i) {
            return i *offset + dataRectHeight/2+pointerRectHeight*1.5;
        })
        .attr("x",offset/2);

    var lines = svgContainer.selectAll(".DataGroup")
        .append("line")
        .attr("x1",100)
        .attr("y1",function (d,i) {
            return i*200 + lineOffset;
        })
        .attr("x2",100)
        .attr("y2",function (d,i) {
            return i*200+lineOffset+50;
        })
        .attr("stroke-width", 5)
        .attr("stroke", "black");

    var lastItemIndex = data.length;

    var NullGroup = d3.selectAll("#TailGroup")
        .attr("transform", "translate(50,"+(lastItemIndex*200+200)+")");

    NullGroup.selectAll("rect")
        .attr("y",0)
        .attr("x",HeadX)
        .attr("width",dataRectWidth)
        .attr("height",dataRectHeight)
        .attr("fill","green");

    NullGroup.selectAll("text")
        .text("NULL")
        .style("font-size", "30px")
        .style('fill', 'black')
        .style("font-weight","bold")
        .attr("x",(HeadX*2)-50)
        .attr("y",50);
}