"use strict";
const mealForm = document.querySelector("#mealForm");
const errorContainer = document.querySelector("#errorContainer");

async function logMeal(event){
    event.preventDefault();

    const mealname = mealForm.querySelector("#mealname").value;
    const maincalorie = mealForm.querySelector("#maincalorie").value;
    const proteins = mealForm.querySelector("#proteins").value;
    const carbs = mealForm.querySelector("#carbs").value;
    const fats = mealForm.querySelector("#fats").value;

    try {
        const response = await fetch("http://localhost:8001/calories", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({mealname, maincalorie, proteins, carbs, fats})
        });
        
        console.log(response); 

        if (response.status === 200){
            errorContainer.classList.remove("hidden");
            const errorMessage = errorContainer.querySelector("#errorMessage");
            errorMessage.textContent = "Meal Added";
        }  else if (response.status === 400){
            try {
                const errors = await response.json();
        
                errorContainer.classList.remove("hidden");
                const errorMessage = errorContainer.querySelector("#errorMessage");
                let errorString = "";
                for (const error of errors){
                    errorString += error + ",\n\n";
                    console.log(error);
                }
                errorMessage.textContent = errorString;
            } catch (err) {
                console.error(err);
                errorContainer.classList.remove("hidden");
                const errorMessage = errorContainer.querySelector("#errorMessage");
                errorMessage.textContent = "Could not parse";
            }
        } else if (response.status === 500) {
            errorContainer.classList.remove("hidden");
            const errorMessage = errorContainer.querySelector("#errorMessage");
            errorMessage.textContent = "Could not create account";
        } else {
            errorContainer.classList.remove("hidden");
            const errorMessage = errorContainer.querySelector("#errorMessage");
            errorMessage.textContent = "Unknown error";
        }
        
    } catch (err) {
        console.error(err);
        errorContainer.classList.remove("hidden");
        const errorMessage = errorContainer.querySelector("#errorMessage");
        errorMessage.textContent = "Could not parse";
    }
 
    return false;
}

mealForm.addEventListener('submit', logMeal);