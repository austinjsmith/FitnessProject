"use strict";

const tdeeForm = document.querySelector("#tdeeForm");
const errorContainer = document.querySelector("#errorContainer");

async function logTDEE (event) {
    event.preventDefault();
    const weight = document.querySelector("#weight").value;
    const age = document.querySelector("#age").value;
    const gender = document.querySelector("#gender").value;
    const activity = document.querySelector("#activity").value;
    const height = document.querySelector("#height").value;
    const goal = document.querySelector("#goal").value;
    try {
        const response = await fetch(`${window.location.origin}/counter`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({weight, age, gender, activity, height, goal})
        });

        console.log(response + "the response is: ");

        if (response.ok){
            tdeeForm.submit();
        } else if (response.status === 400){
            try{
                const errors = await response.json();

                errorContainer.classList.remove("hidden");
                const errorMessage = errorContainer.querySelector("#errorMessage");
                errorMessage.textContent = errors;
            } catch (err) {
                console.error(err);
                errorContainer.classList.remove("hidden");
                const errorMessage = errorContainer.querySelector("#errorMessage");
                errorMessage.textContent = "Could not calculate catch err";
            }
        } else if (response.status === 500) {
            errorContainer.classList.remove("hidden");
            const errorMessage = errorContainer.querySelector("#errorMessage");
            errorMessage.textContent = "Could not calculate 500";
        } else {
            errorContainer.classList.remove("hidden");
            const errorMessage = errorContainer.querySelector("#errorMessage");
            errorMessage.textContent = "Could not calculate else";
        }
        
    } catch (err) {
        console.error(err);
        errorContainer.classList.remove("hidden");
        const errorMessage = errorContainer.querySelector("#errorMessage");
        errorMessage.textContent = "Could not parse here";
    }
    
    return false;
}


function show() {
    document.querySelector("#errorContainer").classList.add("hidden");
}

tdeeForm.addEventListener('submit', logTDEE);

function toggle(value) {
    const male = document.querySelector(".male");
    const female = document.querySelector(".female");

    //if female, hide male select
    if (value === "female"){
        female.style.display = 'block'
        male.style.display = 'none';
    } else {
        //if male, hide female select
        male.style.display = 'block';
        female.style.display = 'none';
    }
}

