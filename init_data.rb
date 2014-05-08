var data = {}
$(".rapper-circle").each(function(e, t){
console.info(e)
dt = $(t)
name = dt.attr("id");
x_pos = parseFloat(dt.css("left"));
y_pos = parseFloat(dt.css("top"));
data[name] = {name:name, x:x_pos, y:y_pos, votes: 1}
   
});
console.info(data);