"use strict";

const postForm = document.querySelector("#postForm");
const errorContainer = document.querySelector("#errorContainer");

async function newPost(event){
    event.preventDefault();
    const title = document.querySelector(".form-title").value;
    const postText = document.querySelector(".postText").value;
    try{
        const response = await fetch(`${window.location.origin}/newpost`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({title, postText})
        });

        console.log(response + title + postText);

        if (response.status === 200){
            // postForm.submit();
            window.location = `${window.location.origin}/viewpost`;
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
                console.log(title + " " + postText + "here");
            } catch (err) {
                console.error(err);
                errorContainer.classList.remove("hidden");
                const errorMessage = errorContainer.querySelector("#errorMessage");
                errorMessage.textContent = err;
            }
            
        } else if (response.status === 500) {
            errorContainer.classList.remove("hidden");
            const errorMessage = errorContainer.querySelector("#errorMessage");
            errorMessage.textContent = "Could not post";
        } else {
            errorContainer.classList.remove("hidden");
            const errorMessage = errorContainer.querySelector("#errorMessage");
            errorMessage.textContent = "Unknown error";
        }
    } catch (err){
        console.error(err);
        errorContainer.classList.remove("hidden");
        const errorMessage = errorContainer.querySelector("#errorMessage");
        errorMessage.textContent = "Unknown error";
    }
    return false;
}

postForm.addEventListener('submit', newPost);

function show() {
    errorContainer.classList.add("hidden");
}