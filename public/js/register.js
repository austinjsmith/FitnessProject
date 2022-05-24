"use strict";

function show() {
    errorContainer.classList.add("hidden");
}

const registerForm = document.querySelector("#registerForm");
const errorContainer = document.querySelector("#errorContainer");

async function registerLog(event){
    event.preventDefault();
    const email = document.querySelector("#email").value;
    const username = document.querySelector("#username").value;
    const password = document.querySelector("#password").value;

    const response = await fetch(`${window.location.origin}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({email, username, password})
    });

    console.log(response + email + username + password);

    if (response.ok){
        registerForm.submit();
        window.location = `${window.location.origin}/login`;
    } else if (response.status === 400){
        const errors = await response.json();
        console.log(errors);
        errorContainer.classList.remove("hidden");
        const errorMessage = errorContainer.querySelector("#errorMessage");
        let errorString ="";
        for (const error of errors){
            errorString += error + ",\n\n";
            console.log(error);
        }
        errorMessage.textContent = errorString;
    } else if (response.status === 500){
        console.log("500 error");
        errorContainer.classList.remove("hidden");
        const errorMessage = errorContainer.querySelector("#errorMessage");
        errorMessage.textContent = "could not register";
    } else {
        console.log(" error");
        errorContainer.classList.remove("hidden");
        const errorMessage = errorContainer.querySelector("#errorMessage");
        errorMessage.textContent = "error";
    }
    return false;
}
registerForm.addEventListener('submit', registerLog);
