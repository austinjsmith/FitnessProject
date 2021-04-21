// "use strict";

// const tdeeForm = document.querySelector("#tdeeForm");
// async function logTDEE(event) {
//     event.preventDefault();
//     const weight = tdeeForm.querySelector("#weight").value;

//     try {
//         const response = await fetch("http://localhost:8001/counter", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({weight})
//         });
//         console.log(response);

//     } catch (err) {
//         console.error(err);
//         alert("Could not calculate tdee");
//     }

//     return false;
// }

// tdeeForm.addEventListener('submit', logTDEE);