var http = require('http');
var url = require('url');
var fs = require('fs');
var myModule = require('./myModule')
var mySess = require('./mySession')
var querystring = require('querystring');

http.createServer(function (req, res) {
  var s='';
  var q = url.parse(req.url, true);
  var reqData = q.query;

  if (req.url == '/') {
    myModule.navigateToHome(res, req,s);
  }
  else if (req.url == '/Home') {
    myModule.navigateToHome(res, req,s);

  }
  else if (req.url == '/Services') {
    myModule.navigateToServices(res, req);
  }
  else if (req.url == '/Aboutus') {
    myModule.navigateToAboutUS(res);
  }

  // Login
  if (req.url == '/Login') {
    if (req.method !== 'POST') {
      fs.readFile("Login.html", function (err, data) {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          return res.end("404 Not Found");
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        return res.end();
      });
    } else { //user was trying to login
      let body = '';

      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', () => {
        const querystring = require('querystring');
        body = querystring.parse(body);
        myModule.authenticateUser(res, body, mySess, myModule.postAuthentication, req, myModule.navigateToHome);
      });
    }
  }
  //Registration
  else if (req.url == '/Registration') {
    if (req.method !== 'POST') {
      fs.readFile("Registration.html", function (err, data) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        //Read JSON File
        let readData = fs.readFileSync('emirates.json');
        let emiratesObj = JSON.parse(readData);
        let emiratesStr = JSON.stringify(emiratesObj);
        res.write("<script>processResult('" + emiratesStr + "');</script>");
        return res.end();
      });
    }
    else {
      let regBody = '';
      req.on('data', chunk => {
        regBody += chunk.toString();
      });

      req.on('end', () => {
        const querystring = require('querystring');
        regBody = querystring.parse(regBody)
        myModule.registerUser(res, regBody, mySess, myModule.postAuthentication, req, myModule.navigateToHome);
      });
    }
  }
  else if (req.url == "/AccountHome") {
    var s_ = mySess.getMySession();
    var email_= s_.email;
    if (s === undefined || s.email === "" && s.email === undefined) {
      fs.readFile("Home.html", function (err, data) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
      });

    } else {
      myModule.navigateToHome(res, req,email_);
      
    }
  }
  else if (req.url == "/AccountAboutUs") {
    s = mySess.getMySession();

    if (s !== undefined) {
      if (s.email != "" && s.email !== undefined) {
        myModule.navigateToAccountAboutus(res);
      }
    } else {
      myModule.navigateToHome(res, req);
    }
  }

  else if (req.url == "/AccountServices") {
    s = mySess.getMySession();

    if (s === undefined || s.email === "" && s.email === undefined) {
      fs.readFile("Services.html", function (err, data) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
      });

    } else {
      myModule.navigateToServices(res, req);
    }
  }

  else if (req.url.includes("/RegisteredServices")) {
    s = mySess.getMySession();
    email_= mySess.email;

    if (s !== undefined) {
      if (s.email != "" && s.email !== undefined) {
        var cancelled = reqData.cancelledRSID;
        myModule.navigateToRegisteredServices(res, s, cancelled);
      }

    } else {
      myModule.navigateToHome(res, req,email_);
    }
  }

  else if (req.url == "/UserProfile") {
    s = mySess.getMySession();
    email_= s.email;

    if (s !== undefined) {
      if (s.email != "" && s.email !== undefined) {
        myModule.getCustomer(res, s, myModule.navigateToUserProfile);
      }
    }
    else {
      myModule.navigateToHome(res, req,email_);
    }
  }
  else if (req.url.includes("/PaintingForm")) {
    if (req.method !== 'POST') {
      fs.readFile("PaintingForm.html", function (err, data) {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          return res.end("404 Not Found");
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        return res.end();

      });

    }
    else {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        const querystring = require('querystring');
        body = querystring.parse(body);
        myModule.navigateToPaintingForm(res, req, body, mySess, reqData.discount);

      });
    }
  }

  else if (req.url.includes("/CleaningForm")) {
    if (req.method !== 'POST') {
      fs.readFile("CleaningForm.html", function (err, data) {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          return res.end("404 Not Found");
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        return res.end();

      });

    }
    else {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      // when complete POST data is received
      req.on('end', () => {
        const querystring = require('querystring');
        body = querystring.parse(body);
        myModule.navigateToCleaningForm(res, req, body, mySess, reqData.discount, myModule.navigateToServices);

      });
    }

  }


  else if (req.url.includes("/ElectricalForm")) {

    if (req.method !== 'POST') {
      fs.readFile("ElectricalForm.html", function (err, data) {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          return res.end("404 Not Found");
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        return res.end();

      });

    }
    else {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', () => {

        const querystring = require('querystring');
        body = querystring.parse(body);

        myModule.navigateToElectricalForm(res, req, body, mySess, reqData.discount, myModule.navigateToServices);

      });
    }

  }
  //Logout
  else if (req.url == "/logout") {
    s = mySess.getMySession();
    email_= s.email;

    if (s !== undefined) {
      if (s.email != "" && s.email !== undefined) {
        mySess.deleteSession();
      }
    }
    myModule.navigateToHome(res, req,email_);
  }

}).listen(8080);

