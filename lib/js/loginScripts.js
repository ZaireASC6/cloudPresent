const database = firebase.database().ref();
const bcrypt = dcodeIO.bcrypt;

window.onbeforeunload = function(e) {
    gapi.auth2.getAuthInstance().signOut();
};

function renderButton() {
    gapi.signin2.render('my-signin2', {
        'scope': 'profile email',
        'width': 240,
        'height': 50,
        'longtitle': true,
        'theme': 'dark',
        'onsuccess': onSuccess,
        'onfailure': onFailure
    });
}


async function onSuccess(googleUser) {
    let profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
    const value = {
        email: profile.getEmail(),
        password: "",
        name: profile.getName(),
        imageURL: profile.getImageUrl()
    }
    let myVal = await database.child("users").orderByChild('email').equalTo(profile.getEmail()).once("value");
    myVal = myVal.val();
    if (!myVal) {
        database.child("users").push(value);
    }
    window.location = "./landing.html";
}

function onFailure(error) {
    console.log(error);
}

document.querySelector("#submit_button").addEventListener("click", signInEmail);

async function signInEmail(event) {
    event.preventDefault();
    let email = document.querySelector("#emailInput").value;
    let myVal = await database.child("users").orderByChild('email').equalTo(email).once("value");
    myVal = myVal.val();
    if (!myVal) {
        console.log("Incorrect email address.");
    } else {
        let inputPassword = document.querySelector("#passwordInput").value;
        let userPassword;
        for (key in myVal) {
            userPassword = myVal[key].password;
        }
        if (bcrypt.compareSync(inputPassword, userPassword)) {
            window.location = "./landing.html";
        } else {
            console.log("Incorrect Password.");
        }
    }
}

function hash(value) {
    let salt = bcrypt.genSaltSync(10);
    let hashVal = bcrypt.hashSync(value, salt);
    return hashVal;
}