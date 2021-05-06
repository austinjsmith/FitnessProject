"use strict";

const commentForm = document.querySelector("#commentForm");
const errorContainer = document.querySelector("#errorContainer");

async function subComment(event){
    event.preventDefault();
    
    const commentText = document.querySelector("#commentinput").value;
    // let url = new URL(`http://localhost:8000/posts/${postid}/comments`);
    const response = await fetch(`${window.location.href}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({commentText})
        });
    console.log(response);
    if (response.ok){
        // commentForm.submit();
        window.location = window.location.href;
        console.log('ere');
    } else if (response.status === 400){
        const errors = await response.json();
        console.log(errors);
        errorContainer.classList.remove("hidden");
        const errorMessage = errorContainer.querySelector("#errorMessage");
        let errorString ="";
        for (const error of errors){
            errorString += error + "";
            console.log(error);
        }
        errorMessage.textContent = errorString;
    } else {
        errorContainer.classList.remove("hidden");
        const errorMessage = errorContainer.querySelector("#errorMessage");

        errorMessage.textContent = "unknown error";
    }
    return false;
}
commentForm.addEventListener('submit', subComment);

function show() {
    errorContainer.classList.add("hidden");
}

// deletePost = document.querySelector("#deleteForm");
// async function deleteP(event){
//     event.preventDefault();
//     return false;
// }

// deletePost.addEventListener('click', deleteP);
// function disable(){
//     commentForm.disable = true;
//     setTimeout(function(){
//         commentForm.disable = false; 
//     }, 5000);
// }
// commentForm.addEventListener('click', disable);