//Globals
var width = 1600;
var height = 500;

var dataRectWidth=100;
var dataRectHeight = 100;
var pointerRectWidth = 100;
var pointerRectHeight = 50;

var data=[];
var HeadX = 50;
var HeadY=0;
var LineX = HeadX*2+50;
var LineY = HeadY+50;

var svgContainer = null;

var lineThickness=4;

var lastItemIndex = data.length;
var svgContainer = null;

function Init() {


     svgContainer=d3.select("svg")
            .attr("width",width)
            .attr("height",height)
            .attr("transform",
                "translate(100, 0)");

    var HeadGroup = svgContainer
        .append("g")
        .attr("id","HeadGroup")
        .attr("transform", "translate(0 , 50)");

    HeadGroup
        .append("rect")
        .attr("class","HeadRect")
        .attr("y",HeadY)
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
        .attr("x",(HeadX*2))
        .attr("y",50);


    HeadGroup
        .append("line")
        .attr("x1",LineX)
        .attr("y1",LineY)
        .attr("x2",LineX+50)
        .attr("y2",LineY)
        .attr("stroke-width", lineThickness)
        .attr("stroke", "red");



    var NullGroup = d3.selectAll("svg")
        .append("g")
        .attr("id","TailGroup")
        .attr("transform", "translate("+(lastItemIndex*dataRectWidth*2+150)+",50)");

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
        .attr("x",(HeadX*2))
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
        alert(e.message);
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
        alert(e.message);
    }
}

function RemoveAllGroups() {
    var myNode = document.getElementById("SvgContainer");
    if(myNode !=null)
    {
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }

        myNode.innerHTML="                <style type=\"text/css\">\n" +
            "                    .DataRect\n" +
            "                    {\n" +
            "                        fill:yellow;\n" +
            "                        stroke-width: 3px;\n" +
            "                        stroke:black;\n" +
            "                    }\n" +
            "                    .PointerRect\n" +
            "                    {\n" +
            "                        fill:orange;\n" +
            "                        stroke-width: 3px;\n" +
            "                        stroke:black;\n" +
            "                    }\n" +
            "\n" +
            "                    .SvgContainer\n" +
            "                    {\n" +
            "                        background-color: aliceblue;\n" +
            "                    }\n" +
            "\n" +
            "                    .HeadRect\n" +
            "                    {\n" +
            "                        fill:limegreen;\n" +
            "                        stroke-width: 3px;\n" +
            "                        stroke:black;\n" +
            "                    }\n" +
            "\n" +
            "                    .NullRect\n" +
            "                    {\n" +
            "                        fill:red;\n" +
            "                        stroke-width: 3px;\n" +
            "                        stroke:black;\n" +
            "                    }\n" +
            "\n" +
            "                    .StructureText\n" +
            "                    {\n" +
            "                        text-anchor: middle;\n" +
            "                        font-weight: bold;\n" +
            "                    }\n" +
            "                    .PointerText\n" +
            "                    {\n" +
            "                        text-anchor: middle;\n" +
            "                        font-weight: bold;\n" +
            "                    }\n" +
            "\n" +
            "                    .SvgText\n" +
            "                    {\n" +
            "                        text-anchor: middle;\n" +
            "                    }\n" +
            "\n" +
            "                </style>"
    }



}


function Visualize(jsonData) {

    RemoveAllGroups();
    Init();

    var data=[];

    if(jsonData==null)
    {
        try {
            jsonData= document.getElementById('JsonInput').value;
            data = JSON.parse(jsonData).data;
            console.log(data);
        }catch (e) {
            alert(e.message);
        }

    }else
    {
        data=jsonData.data;
    }

    var offset = (dataRectHeight + pointerRectHeight);
    var lineOffset = dataRectWidth;
    var lineY1=125;
    var lineY2=50;

    var verticalOffset = 0;


    var dataRectangles = svgContainer.selectAll("#SvgContainer")
        .data(data)
        .enter()
        .append("g")
        .attr("class","DataGroup")
        .attr("transform", "translate(200, 50)")
        .append("rect")
        .attr("class","DataRect")
        .attr("y",verticalOffset*100)
        .attr("x",function (d,i) {
            return i *offset;
        })
        .attr("width",dataRectWidth)
        .attr("height",dataRectHeight);



    var pointerRectangles = svgContainer.selectAll(".DataGroup")
        .append("rect")
        .attr("class","PointerRect")
        .attr("x",function (d,i) {
            return i *offset;
        })
        .attr("y",(offset-50))
        .attr("width",pointerRectWidth)
        .attr("height",pointerRectHeight);


    var dataText = svgContainer.selectAll(".DataGroup")
        .append("text")
        .attr("class","StructureText")
        .text(function (d,i) {
            return "Data: "+d.value;
        })
        .attr("y",(offset/2-25))
        .attr("x",function (d,i) {
            return i *offset+50;
        });

    var indexText = svgContainer.selectAll(".DataGroup")
        .append("text")
        .attr("class","PointerText")
        .text("Next")
        .attr("x",function (d,i) {
            return i *offset + dataRectHeight/2;
        })
        .attr("y",(offset-25));

    var lines = svgContainer.selectAll(".DataGroup")
        .append("line")
        .attr("y1",lineY1)
        .attr("x1",function (d,i) {
            return i*150+lineOffset;
        })
        .attr("y2",lineY2)
        .attr("x2",function (d,i) {
            return i*150+lineOffset+50;
        })
        .attr("stroke-width", lineThickness)
        .attr("stroke", "red");

    var lastItemIndex = data.length;

    var NullGroup = d3.selectAll("#TailGroup")
        .attr("transform", "translate("+(lastItemIndex*150+150)+",50)");

}





