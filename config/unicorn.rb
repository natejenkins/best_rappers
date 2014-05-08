APP_DIR = "/home/steve/best_rappers"
worker_processes 6
working_directory APP_DIR

# This loads the application in the master process before forking
# worker processes
# Read more about it here:
# http://unicorn.bogomips.org/Unicorn/Configurator.html
preload_app true

timeout 30

# This is where we specify the socket.
# We will point the upstream Nginx module to this socket later on
listen APP_DIR + "/tmp/sockets/unicorn.sock", :backlog => 1024
#listen 8080, :tcp_nopush => true

pid APP_DIR + "/tmp/pids/unicorn.pid"

# Set the path of the log files inside the log folder of the testapp
stderr_path APP_DIR + "/log/unicorn.stderr.log"
stdout_path APP_DIR + "/log/unicorn.stdout.log"

before_fork do |server, worker|
  # Before forking, kill the master process that belongs to the .oldbin PID.
  # This enables 0 downtime deploys.
  old_pid = APP_DIR + "/tmp/pids/unicorn.pid.oldbin"
  if File.exists?(old_pid) && server.pid != old_pid
    begin
      Process.kill("QUIT", File.read(old_pid).to_i)
    rescue Errno::ENOENT, Errno::ESRCH
      # someone else did our job for us
    end
  end

end

after_fork do |server, worker|

end
