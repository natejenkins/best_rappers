# Does a Bigger Vocabulary Make a Better Rapper?

This is a simple app which allows voting on the relative abilities of the rappers listed in [Matt Daniels'](http://www.mdaniels.com)
recent article on [the size of vocabulary](http://rappers.mdaniels.com.s3-website-us-east-1.amazonaws.com) used by various rappers.

It is a sinatra app on the backend using redis as a data-store.

There is a small ruby script called 'load_data' that can be run to load initial data from the file 'public/inital_data.json'.

After running 'bundle install' you can launch the app locally via:
rackup -p 4567

or to have hot-loading:

rerun -- rackup --port 4567 config.ru 