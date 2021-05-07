"use strict";
const name_form = document.getElementById('name_form');
// name_form.addEventListener("submit", get_data())
console.log('FindClient.js');


if (name_form){
    console.log('Name_form exists');
    name_form.addEventListener('submit', get_data(event));
}
    
async function get_data(event){
    document.getElementById('submit_name');
    event.preventDefault();
    console.log('in get_data');

    try {
        res = fetch('/get_client');
        const data = res.json();
        console.log(data);
    } catch {
        res.sendStatus(500);
    }
    console.log(data);
    
    return false;
}
