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
    window.location.href = "landing.html";
}

function onFailure(error) {
    console.log(error);
}

document.querySelector("#submit_button").addEventListener("click", signUpEmail);
let box;
let notSameError = document.createElement('p');

async function signUpEmail(event) {
    event.preventDefault();
    let email = document.querySelector("#emailInput").value;
    let myVal = await database.child("users").orderByChild('email').equalTo(email).once("value");
    box = document.querySelector('#wrong');

    myVal = myVal.val();
    if (myVal) {
        console.log("Email already exists.");
        notSame('Email already exists.');
    } else if (document.querySelector("#firstName").value.length == 0 || document.querySelector("#lastName").value.length == 0) {
        notSame('Invalid Name');
    } else if (!(/^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u.test(document.querySelector("#firstName").value) && /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u.test(document.querySelector("#lastName").value))) {
        notSame('Invalid Name');
    } else if (!(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
            .test(email))) {
        console.log("Invalid email address.");
        notSame('Invalid email address.');
    } else if (document.querySelector("#passwordInput").value.length < 6) {
        console.log("Your password needs to be at least 6 characters.");
        notSame('Your password needs to be at least 6 characters.');
    } else if (document.querySelector("#passwordInput").value != document.querySelector("#passwordConfirm").value) {
        notSame('Your passwords don\'t match.');
    } else {
        const value = {
            email: document.querySelector("#emailInput").value,
            password: hash(document.querySelector("#passwordInput").value),
            name: `${document.querySelector("#firstName").value} ${document.querySelector("#lastName").value}`,
            imageURL: null
        }
        database.child("users").push(value);
        window.location.href = "landing.html";
    }
}

function hash(value) {
    let salt = bcrypt.genSaltSync(10);
    let hashVal = bcrypt.hashSync(value, salt);
    return hashVal;
}

function notSame(p) {
    notSameError.innerText = `${p}`;
    notSameError.class = "error";
    box.prepend(notSameError);
}