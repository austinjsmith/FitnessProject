module.exports.calTdee = function(weight, gender, lean, activity){
    let tdeeW = 0.0;
    tdeeW = tdeeW + weight / 2.2;
    if (gender === "female"){
        tdeeW = tdeeW * 0.9;
    }
    
    tdeeW = tdeeW * lean * activity * 24;
    return tdeeW = parseInt(tdeeW);
}