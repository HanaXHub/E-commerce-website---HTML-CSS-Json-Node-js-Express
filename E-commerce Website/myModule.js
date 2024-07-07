var mysql = require('mysql');
var fs = require('fs');
var con;
// Connect to the Database 
exports.connectToDB = function () {
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "admin", // provide your own userPassword.
        database: "MicaDB"
    });
    return con;
};

con = this.connectToDB();
// Authenticate User for Login
exports.authenticateUser = function (res, body, mySess, myCallback, req, Callback2) {
    var custEmail = body.Email;
    var custPassword = body.Password;
    con = this.connectToDB();
    con.connect(function (err) {
        if (err) throw err;
        var sql = "SELECT * from Customers WHERE email ='" + custEmail + "' AND userPassword ='" + custPassword + "'";
        con.query(sql, function (err, result) {
            if (err) throw err;
            if (result !== undefined && result.length > 0) {
                myCallback(res, mySess, result[0].customerID, body, req, Callback2);
            }
            else {
                var message = "<script>document.getElementById(\"passError\").innerHTML = \"Incorrect Email or Password!\";</script> ";
                fs.readFile("Login.html", function (err, data) {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(data);
                    return res.end(message);
                });
            }
        });
    });
};
// Register new user to login
exports.registerUser = function (res, reqBody, mySess, myCallback, req, Callback2) {
    var custEmail = reqBody.Email;
    var custPassword = reqBody.Password;
    con = this.connectToDB();
    con.connect(function (err) {
        if (err) throw err;
        var CVV_ = reqBody.CVV_;
        var parsedCVV = parseInt(CVV_, 10);
        var paymentMethod = reqBody.COD === 'on' ? 'Cash' : 'Card';

        var sqlCheck = "SELECT * FROM Customers WHERE email = '" + custEmail + "'";
        con.query(sqlCheck, function (err, result) {
            if (err) throw err;
            if (result.length > 0) {
                var message = "<script>document.getElementById(\"passError\").innerHTML = \"This email is already registered. Use another one or log in below!\";</script> ";
                fs.readFile("Registration.html", function (err, data) {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(data);
                    //Read JSON File
                    let readData = fs.readFileSync('emirates.json');
                    let emiratesObj = JSON.parse(readData);
                    let emiratesStr = JSON.stringify(emiratesObj);
                    res.write("<script>processResult('" + emiratesStr + "');</script>");
                    return res.end(message);
                });

            }
            else {
                var sql = "INSERT INTO Customers (email, firstName, lastName, phoneNo, addressEmirate, addressCity, paymentMethod, cardNo, expiryDate, CVV_, userPassword) VALUES ('" + custEmail + "', '" + reqBody.fName + "', '" + reqBody.lName + "', '" + reqBody.phoneNo + "', '" + reqBody.Emirate + "', '" + reqBody.City + "', '" + paymentMethod + "', '" + reqBody.cardNo + "', '" + reqBody.expMn + "', '" + parsedCVV + "', '" + custPassword + "')";
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    var selectSql = "SELECT customerID FROM Customers WHERE email = '" + custEmail + "'";
                    con.query(selectSql, function (err, result) {
                        if (err) throw err;
                        if (result !== undefined && result.length > 0) {
                            myCallback(res, mySess, result[0].customerID, reqBody, req, Callback2); // Pass the customer ID to the callback
                        }
                    });
                });
            }

        });
    });
}
// Create Session for Logged In and Registered Users
exports.postAuthentication = function (res, mySess, customerID, body, req, callBack2) {
    if (customerID != -1 && customerID != "" && customerID !== undefined) {
        mySess.setMySession(body.Email);
        mySess.setCustomerIdSession(customerID);
        var s = mySess.getMySession();
        if (s.email != "" && s.email !== undefined) {
            callBack2(res, req, s.email);
        }
    }
}
// Display Home Pages
exports.navigateToHome = function (res, req, email_) {
    var checking;
    var sql = "SELECT * from Customers WHERE email = '" + email_ + "';";
    con.query(sql, function (err, result) {
        if (err) throw err;
        if (result !== undefined && result.length > 0) {
            checking= result[0].firstName;
        }
    });
    if (req.url === '/' || req.url === '/Home' || req.url === '/logout') {
        fs.readFile("Home.html", function (err, data) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
            res.write("<script>");
            var sql = "SELECT * FROM packages";
            con.query(sql, function (err, result) {
                if (err) throw err;
                if (result !== undefined && result.length > 0) {
                    var table = "<table><tr>";
                    var packageHeader = "";
                    var i = 0;
                    for (i = 0; i < result.length; i++) {
                        var j = 0;
                        packageHeader = "<td class=\"Cards\" onclick=\"login()\"><h2> " + result[i].PName + " </h2><ul><h3><b>" + result[i].PDiscount + "% off </b></h3>";
                        const packageDescArray = result[i].PDesc.split(',');
                        var packageListElements = "";
                        for (j = 0; j < packageDescArray.length; j++) {
                            packageListElements += " <li> <img class=\"checkpng\" src=\"http://localhost:3333/?png=checkmark.png\"/> " + packageDescArray[j] + " </li>";
                        }
                        packageListElements += "</ul></td>";
                        table += packageHeader;
                        table += packageListElements;
                    }
                    table += "</tr></table>";
                    res.write("document.getElementById(\"AllPackages\").innerHTML='" + table + "';");
                    res.write("</script>");
                    return res.end();
                }
            });
        });
    }
    else if (req.url === '/AccountHome' || req.url === '/Login' || req.url === '/Registration') {
        fs.readFile("AccountHome.html", function (err, data) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
            res.write("<script>");
            res.write("window.onload = function PackageFn() {");
       var sql1 = "SELECT * from Customers WHERE email = '" + email_ + "';";
       con.query(sql1, function (err, result) {
           if (err) throw err;
           if (result !== undefined && result.length > 0) {
            res.write("document.getElementById(\"myName\").innerHTML = 'Hello '+'"+result[0].firstName +"'+ ', Welcome Back';" );
           }
       });
            var table = "<table><tr>";
            res.write("var packs;");

            var sql = "SELECT * FROM packages";
            con.query(sql, function (err, result) {
            
                if (err) throw err;
                if (result !== undefined && result.length > 0) {
                    var packageHeader = "";
                    var i = 0;
                    var nextPage = "";
                    for (i = 0; i < result.length; i++) {
                        var j = 0;
                        if (result[i].PName.includes("Painting")) {
                            nextPage = "viewPaintingForm(" + result[i].PDiscount + ")";
                        }
                        else if (result[i].PName.includes("Electric")) {
                            nextPage = "viewElectricForm(" + result[i].PDiscount + ")";

                        }
                        else if (result[i].PName.includes("Cleaning")) {
                            nextPage = "viewCleaningForm(" + result[i].PDiscount + ")";
                        }
                        packageHeader = "<td class=\"Cards\"  onclick=\"" + nextPage + "\"><h2> " + result[i].PName + " </h2><ul><h3><b>" + result[i].PDiscount + "% off </b></h3>";
                        const packageDescArray = result[i].PDesc.split(',');
                        var packageListElements = "";
                        for (j = 0; j < packageDescArray.length; j++) {
                            packageListElements += " <li> <img class=\"checkpng\" src=\"http://localhost:3333/?png=checkmark.png\"/> " + packageDescArray[j] + " </li>";
                        }
                        packageListElements += "</ul></td>";
                        table += packageHeader;
                        table += packageListElements;
                        var discount = result[i].PDiscount;
                    }
                    table += "</tr></table>";
                    res.write("packs= '" + table + "';");
                    res.write("document.getElementById(\"AllPackages\").innerHTML=packs;");
                    res.write("}");
                    res.write("</script>");
                    return res.end();
                }
            });
        //     var sql = "SELECT * FROM packages";

        //     con.query(sql, function (err, result) {
        //         res.write("</script>");
        //     if(result[i].email == email ) res.write("document.getElementById(\"myName\").innerHTML=" + result[i].firstName + ";");
        //     res.write("</script>");
        // });
        });
    };
};
// Display Service Pages
exports.navigateToServices = function (res, req) {
    var sql = "SELECT * FROM services";

    if (req.url === '/Services') {
        fs.readFile("Services.html", function (err, data) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
            res.write("<script>");
            res.write("window.onload = function ServicesFn() {");

            var table = "<table><tr>";
            res.write("var services;");

            con.query(sql, function (err, result) {
                if (err) throw err;
                if (result !== undefined && result.length > 0) {
                    var serviceHeader = "";
                    var i = 0;
                    for (i = 0; i < result.length; i++) {
                        var j = 0;
                        var img = result[i].serviceName + "Services";
                        img = "http://localhost:3333/?jpeg=" + img + ".jpeg";

                        serviceHeader = "<td class=\"Cards\" onclick=\"login()\"><h2> " + result[i].serviceName + " </h2><img class=\"servPics\" src=\"" + img + "\"/>";
                        const serviceDescArray = result[i].serviceDesc.split(',');
                        var serviceListElements = "";
                        for (j = 0; j < serviceDescArray.length; j++) {
                            serviceListElements += " <h4>" + serviceDescArray[j] + " </h4>";
                        }
                        serviceListElements += "</td>";
                        table += serviceHeader;
                        table += serviceListElements;
                    }
                    table += "</tr></table>";
                    res.write("services= '" + table + "';");
                    res.write("document.getElementById(\"AllServices\").innerHTML=services;");
                    res.write("};")
                    res.write("</script>");
                    return res.end();

                }
            });
        });

    }

    else if (req.url === '/AccountServices') {
        fs.readFile("AccountServices.html", function (err, data) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(data);
            res.write("<script>");
            res.write("window.onload = function ServicesFn() {");

            var table = "<table><tr>";
            res.write("var services;");
            con.query(sql, function (err, result) {
                if (err) throw err;
                if (result !== undefined && result.length > 0) {
                    var serviceHeader = "";
                    var i = 0;
                    for (i = 0; i < result.length; i++) {
                        var j = 0;
                        var nextPage = "";
                        var img = result[i].serviceName + "Services";
                        img = "http://localhost:3333/?jpeg=" + img + ".jpeg";
                        if (result[i].serviceName === "Painting") {
                            nextPage = "viewPaintingForm()";
                        }
                        else if (result[i].serviceName === "Electrical") {
                            nextPage = "viewElectricForm()";

                        }
                        else if (result[i].serviceName === "Cleaning") {
                            nextPage = "viewCleaningForm()";
                        }
                        serviceHeader = "<td class=\"Cards\" onclick=\"" + nextPage + "\"><h2> " + result[i].serviceName + " </h2><img class=\"servPics\" src=\"" + img + "\"/>";
                        const serviceDescArray = result[i].serviceDesc.split(',');
                        var serviceListElements = "";
                        for (j = 0; j < serviceDescArray.length; j++) {
                            serviceListElements += " <h4>" + serviceDescArray[j] + " </h4>";
                        }
                        serviceListElements += "</td>";
                        table += serviceHeader;
                        table += serviceListElements;
                    }
                    table += "</tr></table>";
                    res.write("services= '" + table + "';");
                    res.write("document.getElementById(\"AllServices\").innerHTML=services;");
                    res.write("};")
                    res.write("</script>");
                    return res.end();
                }
            });
        });


    }

};
// Display About Us Page
exports.navigateToAboutUS = function (res) {
    fs.readFile("AboutUS.html", function (err, data) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        return res.end();
    });
};

// Display Account About Us Page
exports.navigateToAccountAboutus = function (res) {
    fs.readFile("AccountAboutUs.html", function (err, data) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        return res.end();
    });
};

// Display a User's Registered Services
exports.navigateToRegisteredServices = function (res, mySess, cancelID) {
    fs.readFile("RegisteredServices.html", function (err, data) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);

        if (cancelID != undefined && cancelID !== "undefined") {
            var del = "DELETE from RegisteredServices where registrationID=" + cancelID + ";";
            con.query(del, function (err, result) {
                if (err) throw err;
                console.log("Deleted " + cancelID);

            }); //con.query
        }
        res.write("<script>");
        res.write("window.onload = function tableFn() {");
        var t;
        res.write("var table ;");
        var sql = "select rs.serviceDescription, rs.SCost, rs.serviceDateNTime, rs.bookingDateNTime,rs.sid, rs.registrationID , s.serviceName from RegisteredServices rs join Services s on rs.sid = s.serviceID WHERE rs.customerID = " + mySess.customerID + " order by rs.serviceDateNTime desc;";
        con.query(sql, function (err, result) {
            if (err) throw err;
            if (result !== undefined && result.length > 0) {
                var i = 0;
                var upcomingTable = "<table><tr>";
                var pastTable = "<table><tr>";
           var counter=0;
                for (var i = 0; i < result.length; i++) {
                    if (/\d{4}-\d{2}-\d{2}/.test(result[i].serviceDateNTime))
                        result[i].serviceDateNTime = new Date(result[i].serviceDateNTime);

                    var serviceHeader = "";
                        serviceHeader = "<td><h3> " + result[i].serviceName + " </h3>  "; 

                        var regServices = "<ul>";
                        regServices += "<li>Service Charge: " + result[i].SCost + "</li>";
                        regServices += "<li>Service Date: " + result[i].serviceDateNTime + "</li>";
                        regServices += "<li>Booking Date: " + result[i].bookingDateNTime + "</li>";
                        regServices += "<button class=\"buttonMain\" onclick=\"cancelSubscription(this," + result[i].registrationID + ")\"> Cancel Subscription</button>"
                        regServices += "</ul>";
                        regServices += "</td>";
                        counter++;

                        if(counter >1){
                            regServices += "</tr>";
                            counter=0;
                        }
                    var tableRow = serviceHeader + regServices;

                    if (result[i].serviceDateNTime < new Date()) {
                        pastTable += tableRow;
                    } else {
                        upcomingTable += tableRow;
                    }
                }

                upcomingTable += "</tr></table>";
                pastTable += "</tr></table>";

                res.write("table = '" + upcomingTable + "';");
                res.write("  document.getElementById('upcomingServices').innerHTML += table;");

                res.write("table = '" + pastTable + "';");
                res.write("  document.getElementById('PastServices').innerHTML += table;");

                res.write("}");
                res.write("</script>");
                return res.end();
            }
        }); //con.query


        //}); //con.connect

    });
};

// Display Electric Form
exports.navigateToElectricalForm = function (res, req, body, mySess, discount, myCallback) {

    var ElectricalInstallaion = body.ElectricalInstallaion;
    var repairNMain = body.repairNMain;
    var commentForRepairs = body.commentForRepairs;
    var updatesNEnchance = body.updatesNEnchance;
    var outdoorInstall = body.outdoorInstall;
    var comment = body.commentForFixtures;
    var date = body.consultTime;
    var payment = body.paymentMethod;
    var options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    var currentDate = new Date().toLocaleString('en-US', options);
    var finalDiscount = 0;
    if (discount != undefined) {
        finalDiscount = parseInt(discount) / 100;
    }

    var cost = 0;

    var listOfNames = ['ElectricalInstallaion', 'repairNMain', 'updatesNEnchance', "outdoorInstall"]

    for (var i = 0; i < listOfNames.length; i++) {
        if (Array.isArray(eval(listOfNames[i]))) {
            cost += eval(listOfNames[i]).length

        } else if (eval(listOfNames[i]) !== undefined) {
            cost += 1;
        }

    }

    cost = cost * 105;
    cost = cost - (cost * finalDiscount);
    s = mySess.getMySession();
    var con = this.connectToDB();
    con.connect(function (err) {
        if (err) throw err;
        var sql = "INSERT INTO RegisteredServices (serviceDescription, SCost, customerID,sid, pid, bookingDateNTime, serviceDateNTime, extraComments, payment) VALUES ('Electrical Intallation: "
            + ElectricalInstallaion + "/Repair and Extra Comment:" + repairNMain + "/Comments For Repairs:" + commentForRepairs + "/Updates and Enchancements:" + updatesNEnchance + "/Outdoor Installations:" + outdoorInstall + "'," + cost + "," + s.customerID + ",2,null,'" + currentDate + "', '" + date + "', '" + comment + "', '" + payment + "')";

        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Inserted Electrical");

        });
    });
    res.writeHead(301, { Location: "http://localhost:8080/AccountServices" });
    return res.end();

};
// Display Painting Form 
exports.navigateToPaintingForm = function (res, req, body, mySess, discount) {
    fs.readFile("PaintingForm.html", function (err, data) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        var cost = 0;
        var numberofRooms = body.numOfRoom;
        var IndoorPainting = body.IndoorPainting;
        var OutdoorPainting = body.OutdoorPainting;
        var SpecialPainting = body.SpecialPainting;
        var comment = body.commentForFixtures;
        var date = body.consultTime;

        var payment = body.paymentMethod;
        var options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        var currentDate = new Date().toLocaleString('en-US', options);
        var finalDiscount = 0;
        var pid = null;
        if (discount != undefined) {
            pid = 3;
            finalDiscount = parseInt(discount) / 100;
        }


        if (numberofRooms !== undefined) {
            cost += 1;
        }
        var listOfNames = ['SpecialPainting', 'IndoorPainting', 'OutdoorPainting',]

        for (var i = 0; i < listOfNames.length; i++) {
            if (Array.isArray(eval(listOfNames[i]))) {
                cost += eval(listOfNames[i]).length


            } else if (eval(listOfNames[i]) !== undefined) {
                cost += 1;
            }

        }

        cost = cost * 45;
        cost = cost - (cost * finalDiscount);

        s = mySess.getMySession();
        var sql = "INSERT INTO RegisteredServices (serviceDescription, SCost, customerID,sid, pid, bookingDateNTime, serviceDateNTime, extraComments, payment) VALUES ('NumberOfRooms:"
            + numberofRooms + "/IndoorPainting:" + IndoorPainting + "/OutdoorPainting:" + OutdoorPainting + "/SpecialPainting:" + SpecialPainting + "'," + cost + "," + s.customerID + ",1," + pid + ",'" + currentDate + "', '" + date + "', '" + comment + "', '" + payment + "')";


        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Inserted Painting");

        });
    });

    res.writeHead(301, { Location: "http://localhost:8080/AccountServices" });
    return res.end();
};

// Display Cleaning Form
exports.navigateToCleaningForm = function (res, req, body, mySess, discount) {


    var cleaningFrequency = body.cleaningFrequency;
    var cleanerCount = body.cleanerCount;

    var timings = body.timings;
    var sessionHoursD = body.sessionHoursD;

    var dayOfWeek = body.dayOfWeek;
    var sessionHoursB = body.sessionHoursB;

    var specialOptions = body.specialOptions;
    var day = body.dateForSpecialCleaning;

    var comment = body.commentForFixtures;
    var payment = body.paymentMethod;

    var currentDate = new Date();

    var finalDiscount = 0;
    var pid = null;
    if (discount.trim() === "20") {
        finalDiscount = parseInt(discount) / 100
        pid = 1;

    } else if (discount === "30") {
        finalDiscount = parseInt(discount) / 100;
        pid = 2;
    }

    var cost = 0;

    switch (cleanerCount) {
        case "One Cleaner":
            cost += 30
            break;
        case "Two Cleaner":
            cost += 60
            break;
        case "Three Cleaner":
            cost += 130
            break;
        case "Four Cleaner":
            cost += 250
            break;
    }
    var s = mySess.getMySession();
    var con = this.connectToDB();
    con.connect(function (err) {
        if (err) throw err;

        switch (cleaningFrequency) {
            case "Daily Cleaning":

                switch (sessionHoursD) {
                    case "One To Three Hr":
                        cost += 50 * 1;
                        break;
                    case "Four To Six Hr":
                        cost += 50 * 2;
                        break;
                    case "Seven To Nine Hr":
                        cost += 50 * 3;
                        break;
                    case "Ten To Twele Hr":
                        cost += 50 * 4;
                        break;
                    case "Full Day Hr":
                        cost += 500;
                        break;
                }
                cost = cost - (cost * finalDiscount);
                var sql = "INSERT INTO RegisteredServices (serviceDescription, SCost, customerID,sid, pid, bookingDateNTime, serviceDateNTime,extraComments, payment) VALUES ('Cleaning Frequency: "
                    + cleaningFrequency + "/Number of cleaners:" + cleanerCount + "'," + cost + "," + s.customerID + ",3," + pid + ",'" + currentDate + "', 'Timings:" + timings + "/Number Of Hours:" + sessionHoursD + "/Daily','" + comment + "', '" + payment + "')";
                break;

            case "Weekly Cleaning":
            case "Bi-Weekly Cleaning":

                switch (sessionHoursB) {
                    case "One To Three Hr":
                        cost += 50 * 1;
                        break;
                    case "Four To Six Hr":
                        cost += 50 * 2;
                        break;
                    case "Seven To Nine Hr":
                        cost += 50 * 3;
                        break;
                    case "Ten To Twele Hr":
                        cost += 50 * 4;
                        break;
                    case "Full Day Hr":
                        cost += 500;
                        break;
                }
                cost = cost - (cost * finalDiscount);

                if (cleaningFrequency == "Weekly Cleaning") {
                    var sql = "INSERT INTO RegisteredServices (serviceDescription, SCost, customerID,sid, pid, bookingDateNTime, serviceDateNTime, extraComments, payment) VALUES ('Cleaning Frequency: "
                        + cleaningFrequency + "/Number of cleaners:" + cleanerCount + "'," + cost + "," + s.customerID + ",3," + pid + ",'" + currentDate + "', 'Day Of Week Every Week:" + dayOfWeek + "/Number Of Hours:" + sessionHoursB + "', '" + comment + "', '" + payment + "')";

                }
                else if (cleaningFrequency == "Bi-Weekly Cleaning") {


                    var sql = "INSERT INTO RegisteredServices (serviceDescription, SCost, customerID,sid, pid, bookingDateNTime, serviceDateNTime, extraComments, payment) VALUES ('Cleaning Frequency: "
                        + cleaningFrequency + "/Number of cleaners:" + cleanerCount + "'," + cost + "," + s.customerID + ",3," + pid + ",'" + currentDate + "', 'Day Of Week Every Other Week:" + dayOfWeek + "/Number Of Hours:" + sessionHoursB + "', '" + comment + "', '" + payment + "')";
                }

                break;


            case "Special Occasion/Specific Cleaning":

                if (Array.isArray(specialOptions)) {
                    cost += eval(specialOptions).length
                } else if (specialOptions !== undefined) {
                    cost += 1;
                }
                cost = cost * 250;
                cost = cost - (cost * finalDiscount);

                var sql = "INSERT INTO RegisteredServices (serviceDescription, SCost, customerID,sid, pid, bookingDateNTime, serviceDateNTime,extraComments, payment) VALUES ('Cleaning Frequency: "
                    + cleaningFrequency + "/Number of cleaners:" + cleanerCount + "/Special Options:" + specialOptions + "'," + cost + "," + s.customerID + ",3," + pid + ",'" + currentDate + "', '" + day + "', '" + comment + "', '" + payment + "')";
                break;
        }


        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Inserted Cleaning");
        });
    });

    res.writeHead(301, { Location: "http://localhost:8080/AccountServices" });
    return res.end();
};

// Display User Profile Page
exports.navigateToUserProfile = function (res, custObj) {
    fs.readFile("userProfile.html", function (err, data) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        res.write("<script>");
        res.write("document.getElementById(\"myName\").innerHTML = ' Welcome Home " + custObj[0].firstName + "';" + "\n");
        res.write("document.getElementById(\"firstName\").value = '" + custObj[0].firstName + "';" + "\n");
        res.write("document.getElementById(\"lastName\").value = '" + custObj[0].lastName + "';" + "\n");
        res.write("document.getElementById(\"addressEmirate\").value = '" + custObj[0].addressEmirate + "';" + "\n");
        res.write("document.getElementById(\"addressCity\").value = '" + custObj[0].addressCity + "';" + "\n");
        res.write("document.getElementById(\"phone\").value = '" + custObj[0].phoneNo + "';" + "\n");
        res.write("document.getElementById(\"email\").value = '" + custObj[0].email + "';" + "\n");
        res.write("document.getElementById(\"cardNumber\").value = '" + custObj[0].cardNo + "';" + "\n");
        res.write("document.getElementById(\"expiryDate\").value = '" + custObj[0].expiryDate + "';" + "\n");
        res.write("document.getElementById(\"CVV_\").value = '" + custObj[0].CVV_ + "';" + "\n");
        res.write("document.getElementById(\"password\").value = '" + custObj[0].userPassword + "';" + "\n");
        res.write("</script>");
        return res.end();
    });
};

// Get Customer information to display in User Profile Page
exports.getCustomer = function (res, mySess, myCallback) {
    var sql = "SELECT * from Customers WHERE email = '" + mySess.email + "';";
    con.query(sql, function (err, result) {
        if (err) throw err;
        if (result !== undefined && result.length > 0) {
            myCallback(res, result);
        }
    });
};

