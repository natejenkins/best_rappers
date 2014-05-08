require 'redis'
require 'json'

s = File.read('public/initial_data.json')
data = JSON.parse(s)
min_x = data.map{|k, d| d["x"]}.min
max_x = data.map{|k, d| d["x"]}.max
min_y = data.map{|k, d| d["y"]}.min
max_y = data.map{|k, d| d["y"]}.max
x_m = -1.0/(min_x*(1.0 - max_x/min_x))
x_b = 1.0/(1.0 - max_x/min_x)
y_m = -1.0/(min_y*(1.0 - max_y/min_y))
y_b = 1.0/(1.0 - max_y/min_y)

new_data = {}

new_data = data.map do |k, v|
  k = k.capitalize
  v["name"] = k
  v["vocab_score"] = x_m*v["x"] + x_b
  v["x"] = 0
  v["y"] = y_m*v["y"] + y_b  
  v["votes"] = 0
  {"#{k}"=>v}
end

new_data.sort! do |a,b|
  a[a.keys[0]]["x"]<=>b[b.keys[0]]["x"]
end

data = new_data.inject({}){|x,y| x.merge(y)}
puts "writing to file"

File.write("public/inital_data_normalized.json", JSON.pretty_generate(data))

r = Redis.new
r.flushdb

data.each do |k, v|
  r.set(k, v.to_json)
end