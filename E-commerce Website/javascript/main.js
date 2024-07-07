function confirmSubmission() {
    var ok = confirm("Your Service has been Registered! Click Ok to continue.");
    if (ok) {
        window.location.href = 'AccountHome';
    }
    else {
        window.location.href = window.location.href;
    }
}

function toggleComment() {
    const checkbox = document.querySelector('input[name="repairNMain"][value="Electrical Repairs"]');
    const commentTextarea = document.getElementsByName('commentForRepairs')[0];

    commentTextarea.disabled = !checkbox.checked;
    if (commentTextarea.disabled) {
        commentTextarea.value = '';
    }
}
function toggleQuestions(serviceType) {
    var serviceTypes = ["dailyQuestions", "biNWeeklyQuestions", "specificQuestions"];

    for (var i = 0; i < serviceTypes.length; i++) {
        var question = document.getElementById(serviceTypes[i]);

        if (serviceTypes[i] === serviceType) {
            question.style.display = "block";
        }
        else {
            question.style.display = "none";
        }
    }
}


function cancelSubscription(button, rsID) {
    var confirmCancel = confirm("You are about to cancel your subscription. Please be noted that there are no refunds available for this cancellation");
    if (confirmCancel) {
        button.closest('td').style.display = 'none';
    }
    window.location.href = 'RegisteredServices?cancelledRSID=' + rsID;

}

function logout() {
    var logoutConfirm = confirm("Are you sure you want to log out?");
    if (logoutConfirm) {
        window.location.href = 'logout';
    }
}
function login() {
    window.location.href = 'Login';
}
function viewProfile() {
    window.location.href = 'UserProfile';
}
function viewRegisteredServices() {
    window.location.href = 'RegisteredServices';
}


function viewElectricForm(discount) {
    window.location.href = 'ElectricalForm?discount=' + discount;
}

function viewPaintingForm(discount) {
    window.location.href = 'PaintingForm?discount=' + discount;
}

function viewCleaningForm(discount) {
    window.location.href = 'CleaningForm?discount=' + discount;
}


function validatePassword() {
    //check if passwords are equal
    var pass = document.getElementById("password").value;
    var pass2 = document.getElementById("passwordC").value;
    var lowercaseCheck = /[a-z]/;
    var upperCaseCheck = /[A-Z]/;
    var specialCheck = /[^a-zA-Z\d\s:]/;
    var numCheck = /[0-9]/;

    if (!lowercaseCheck.test(pass.trim())) {
        document.getElementById("passError").innerHTML = "Password should include atleast one lowercase letter";
        return false;

    }
    if (!upperCaseCheck.test(pass.trim())) {
        document.getElementById("passError").innerHTML = "Password should include atleast one uppercase letter";
        return false;

    }
    if (!specialCheck.test(pass.trim())) {
        document.getElementById("passError").innerHTML = "Password should include atleast one special character";
        return false;

    }

    if (!numCheck.test(pass.trim())) {
        document.getElementById("passError").innerHTML = "Password should include atleast one digit";
        return false;

    }

    if (pass.trim().length < 8 | pass.trim().length > 15) {
        document.getElementById("passError").innerHTML = "Password length should be between 8-15 characters";
        return false;

    }

    if (pass.trim() != pass2.trim()) {
        document.getElementById("passError").innerHTML = "Passwords do not match";
        return false;
    }
}

// This function display the drop list menu.
function processResult(obj) {
    emiratesObj = JSON.parse(obj);
    displayEmirateMenu(emiratesObj);
}
function displayEmirateMenu(emiratesObj) {
    var i;
    text = "Select Emirate:<br /><select name=\"emirate\" class=\"form_address\">";
    for (i = 0; i < emiratesObj.emirates.length; i++) {

        text += "<option value=\"" + emiratesObj.emirates[i].name + "\">" + emiratesObj.emirates[i].name + "</option>" + "\n";

    }
    document.getElementById("Emirate").innerHTML = text + "</select>";
    document.getElementById("Emirate").setAttribute("onchange", "displayCityMenu(emiratesObj)");

    displayCityMenu(emiratesObj);
}



function displayCityMenu(emiratesObj) {
    var selectedCity = document.getElementById("Emirate").value;
    var text = "Select City:<br /><select name=\"city\"  class=\"form_address\">";

    // Iterate through the emirates array to find the selected emirate
    for (var i = 0; i < emiratesObj.emirates.length; i++) {
        if (emiratesObj.emirates[i].name === selectedCity) {
            var cities = emiratesObj.emirates[i].cities;
            // Access each city within the 'cities' array
            for (var j = 0; j < cities.length; j++) {
                var city = cities[j];
                text += "<option>" + city + "</option>" + "\n";
            }
            break;
        }
    }

    document.getElementById("City").innerHTML = text + "</select>";
}
