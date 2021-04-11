function getSelectValue(){
    const lean = document.querySelector("#lean option:checked").value;
    
}
function getCheckedValue(){
    const gender = document.querySelector("#gender option:checked").value;
}

function getActValue(){
    const activity = document.querySelector("#activity option:checked").value;
}

function button(){
    let click = document.querySelector("button");
    if (click.innerHTML === "Add Meal"){
        click.innerHTML = "Meal Added";
    } else {
        click.innerHTML= "Add Meal";
    }
}
function confirm(){
    const added = setTimeout(button(), 5000);
}