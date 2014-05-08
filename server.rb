require 'sinatra/base'
require 'redis'
require 'json'

class Server < Sinatra::Base
  set :protection, :except => [:frame_options, :json_csrf]
  enable :static

  def best_rappers 
    rappers = []
    r = Redis.new
    keys = r.keys
    
    keys.each do |key|
      rapper = JSON.parse(r.get(key))
      rappers += [rapper]

    end

    # rappers.sort! do |a,b|
    #   -(a["x"]<=>b["x"])      
    # end
    data = {data: rappers}
  end

  get "/" do
    redirect '/index.html'
  end

  get "/best_rappers.json" do
    content_type :json
    best_rappers().to_json
  end

  post "/vote" do
    puts "*** VOTING ***"
    puts params
    data = JSON.parse(params["data"])
    r = Redis.new
    data.each do |rapper_key, rapper|
      rapper_name = rapper["name"]
      new_num_votes = 1
      vocab_score = 1
      new_x = rapper["x"].to_f
      new_y = rapper["y"].to_f
      if(new_x)>1.0
        new_x = 1.0
      end
      if(new_x)<0.0
        new_x = 0.0
      end

      voted_x = new_x
      voted_y = new_y
      redis_entry = r.get(rapper_name)
      if redis_entry
        rapper_score = JSON.parse(redis_entry)
        num_votes = rapper_score["votes"]
        cur_x = rapper_score["x"].to_f
        cur_y = rapper_score["y"].to_f
        new_x = (cur_x*num_votes + voted_x)/(num_votes + 1)
        new_y = (cur_y*num_votes + voted_y)/(num_votes + 1)
        vocab_score = rapper_score["vocab_score"]
        new_num_votes = num_votes + 1
        r.set(rapper_name, {name: rapper_name, x: new_x, y: new_y, votes: new_num_votes, vocab_score: vocab_score}.to_json)
      end
      
    end
    
    content_type :json
    return best_rappers().to_json
  end
end