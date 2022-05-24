const currentURL = window.location.href;
console.log(currentURL);

if (currentURL.includes('viewpost') || currentURL.includes('posts')){
    document.querySelector("#forum").classList.add("active");
} else if (currentURL.includes('index')){
    document.querySelector("#calorie-counter").classList.add("active");
} else if (currentURL.includes('meallog')){
    document.querySelector("#meal-log").classList.add("active");
} else if (currentURL.includes('tdee')){
    document.querySelector("#calculator").classList.add("active");
} else {
    document.querySelector("#account").classList.add("active");
}
