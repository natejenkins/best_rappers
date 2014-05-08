var data;
var modified_data = {};

$(document).ready( function(){

/******************* Adopted from https://github.com/mbostock/d3/wiki/Requests ****************/
d3.json("best_rappers.json", function(error, json) {
  if (error) return console.warn(error);
  data = json.data;
  visualizeit();
});
/*********************************************************************************************/


/********************* Adopted from http://bl.ocks.org/mbostock/1557377 **********************/
function visualizeit(){

var width = 1200,
    height = 1800,
    radius = 5.0;

var y_min = height*0.1;
var x_min = width*0.15;
var x_max = width*0.85;
var y_max = height*0.9;
var y_separator = 20;
var y_offset = 100;
var r_0   = 5;

var drag = d3.behavior.drag()
    .on("drag", dragmove);

var svg = d3.select("body").append("div").selectAll("svg")
  .data(["nothing"])
  .enter().append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("border-style", "solid").style("border-width", "1px")  

var x_scale = d3.scale.linear().range([x_min, x_max]);
var y_scale = d3.scale.linear().range([height, 0]);
var xAxis = d3.svg.axis().scale(x_scale).tickSize(-height).tickSubdivide(false);
var yAxis = d3.svg.axis().scale(y_scale).tickSize(-width).ticks(30).tickSubdivide(false).orient("right");

 /* Add the x-axis. */
svg.append("g")
.attr("class", "x axis")
.attr("transform", "translate(0," + height + ")")
 .call(xAxis);
 
/* Add the y-axis. */
svg.append("g")
.attr("class", "y axis")
.attr("transform", "translate(" + width + ",0)")
.call(yAxis);

/* Draw bars for each score based on the rapper's vocabulary. */
var vocab_rectangles = d3.select("svg").append("g").selectAll(".vocab-rect")
  .data(data)
  .enter().append("rect")
  .attr("x", x_min)
  .attr("y", function(d, i){return (y_separator*i + y_offset - y_separator/2.0);})
  .attr("width", function(d){ 
    var score = from_normalized(d.vocab_score, 0, x_max-x_min);
    var width = Math.max(score, 2);
    return width}
    )
  .attr("height", y_separator*1.0)
  .classed("vocab-rect", true)
  .append("svg:title")
    .text(function(d) { return d.name + "\n" + "Vocab Score: " + (10*d.vocab_score).toFixed(2) });

/* This are the bars that will show the final results of the voting*/
var final_rectangles = d3.select("svg").append("g").selectAll(".final-rect")
  .data(data)
  .enter().append("rect")
  .attr("x", x_min)
  .attr("y", function(d, i){
    return (y_separator*i + y_offset - y_separator/2.0);
  })
  .attr("width", function(d){ 
    var score = from_normalized(d.x, 0, x_max-x_min);
    var width = Math.max(score, 2);
    return width}
    )
  //.attr("width", function(d){ return 0})
  .attr("height", y_separator*1.0)
  .classed("final-rect", true)
  .classed("hidden", true)

final_rectangles.append("svg:title")
    .text(function(d) { return d.name + "\n" + "Vocab Score: " + (10*d.vocab_score).toFixed(2) + "\n" + "Final Score: " + (10*d.x).toFixed(2) });

/* Just some text at the top which gives a general idea of the scale */
var indicator_text = d3.select("svg").selectAll(".indicators")
  .data([{"x":1050, "y":y_offset/2, "s": "Better"}, {"x":20, "y":y_offset/2, "s": "Worse"}])
  .enter()
  .append("text")
    //.attr("dominant-baseline", "central")
    .classed("indicator", true)
    .style("font-size","34px")
    .text(function(d) { return d.s})
    .attr("transform", function(d, i) { 
    return "translate(" + d.x + "," +  d.y + ")"; 
    })


var x_axis_title = d3.select("svg").selectAll("nothing")
  .data([{"x":500, "y":y_offset/2+20, "s": "Score"}])
  .enter()
  .append("text")
    //.attr("dominant-baseline", "central")
    .classed("indicator-blue", true)
    .style("font-size","80px")
    .text(function(d) { return d.s})
    .attr("transform", function(d, i) { 
    return "translate(" + d.x + "," +  d.y + ")"; 
    })


/* the nodes contain the rapper name and the small blue circle */
var nodes = d3.select("svg").selectAll("node")
  .data(data)
  .enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d, i) { 
    x = from_normalized(0, x_min, x_max);
    y = from_normalized(d.y, y_min, y_max);
    return "translate(" + x + "," +  (y_separator*i + y_offset) + ")"; 
    })
    .on("mousedown", function(d){d3.select(this).select("circle").classed("green-circle", true);})
    .call(drag)

var circles = d3.selectAll("g.node")
  .append("circle")
    .attr("r", function(d) { 
      d.r = r_0;
      return d.r })

var labels = d3.selectAll("g.node")
  .append("text")
    .attr("dx", function(d){ return -d.r - 5; })
    .attr("dy", 0)
    .attr("dominant-baseline", "central")
    .text(function(d) { return d.name});

$("#vote").click(function(e){
  $.post( "vote", {"data": JSON.stringify(modified_data)})
    .success(function( return_data ) {
      data = return_data.data;
      modified_data = {};
      d3.selectAll("circle").classed("hidden", true);
      final_rectangles.classed("hidden", false);
      final_rectangles.data(data)
        .attr("width", function(d){ 
          var score = from_normalized(d.x, 0, x_max-x_min);
          var width = Math.max(score, 2);
          return width}
        )
      d3.select("svg").selectAll(".node")
        .data(data)
        .attr("transform", function(d, i) { 
        x = from_normalized(d.x, x_min, x_max);
        y = from_normalized(d.y, y_min, y_max);
        return "translate(" + x + "," +  (y_separator*i + y_offset) + ")"; 
      });

      labels.data(data).text(function(d) { 
        var s = ""
        if (d.votes == 0)
          s = '';
        else if(d.votes == 1)
          s = " (" + d.votes + " vote)";
        else
          s = " (" + d.votes + " votes)";
        return d.name + s});
     
      
    })
});

function dragmove(d, i) {
  var modified_rapper = jQuery.extend({},d);
  var x = within_range(d3.event.x, x_min, x_max);
  var y = from_normalized(d.y, y_min, y_max);
  modified_rapper.x = to_normalized(x, x_min, x_max);
  modified_rapper.y = d.y
  modified_data[d.name] = modified_rapper;
  d3.select(this)
    .attr("transform", function(d) { return "translate("  + x + "," + (y_separator*i + y_offset) + ")"; })
}

function within_range(val, min, max){
  var t;
  t = Math.min(val, max);
  return Math.max(t, min);
}

function from_normalized(val, min, max){
  return (max-min)*val + min;
}

function to_normalized(val, min, max){
  var m = -1.0/(min*(1.0 - 1.0*max/min));
  var b = 1.0/(1.0 - 1.0*max/min);
  return m*val + b;
}

} //function visualizeit()

}); //$(document).ready( function()