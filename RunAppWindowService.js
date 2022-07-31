var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'GetMailAPI',
  description: 'The nodejs.org get mail API.',
  script: 'D:\\Bravo\\Other_Project\\GetMailListener2\\server.js'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();