"use strict";

function show() {
    errorContainer.classList.add("hidden");
}

const loginForm = document.querySelector("#loginForm");
const errorContainer = document.querySelector("#errorContainer");

async function logIn(event){
    event.preventDefault();

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    try{
        const response = await fetch(`${window.location.origin}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({email, password})
        });

        console.log(response);

        if (response.ok){
            loginForm.submit();
        } else if (response.status === 400){
            try{
                const errors = await response.json();

                errorContainer.classList.remove("hidden");
                const errorMessage = errorContainer.querySelector("#errorMessage");
                let errorString ="";
                for (const error of errors){
                    errorString += error + ",\n\n";
                    console.log(error);
                }
                errorMessage.textContent = errorString;
            } catch (err) {
                console.error(err);
        
                errorContainer.classList.remove("hidden");
                const errorMessage = errorContainer.querySelector("#errorMessage");
                errorMessage.textContent = "account does not exist";
            }
            
        } else if (reponse.status === 500){
            errorContainer.classList.remove("hidden");
            const errorMessage = errorContainer.querySelector("#errorMessage");
            errorMessage.textContent = "Could not login";
        } else {
            errorContainer.classList.remove("hidden");
            const errorMessage = errorContainer.querySelector("#errorMessage");
            errorMessage.textContent = "Could not login";
        }
    } catch (err) {
        console.error(err);
        
        errorContainer.classList.remove("hidden");
        const errorMessage = errorContainer.querySelector("#errorMessage");
        errorMessage.textContent = "account does not exist";
    }
    return false;
}

loginForm.addEventListener('submit', logIn);
