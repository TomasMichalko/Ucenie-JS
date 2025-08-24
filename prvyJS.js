function parne(cislo) {
    if (cislo % 2 === 0) {
        return console.log("Cislo je parne"); 
    }
    else {
        return console.log("Cislo nie je parne");
    } 
}
function vecsie(cislo1 , cislo2){
    if(cislo1 > cislo2){
        return console.log(`${cislo1} je vacsie ako ${cislo2}`);
    }
    else if(cislo1 < cislo2){
        return console.log(`${cislo1} je mensie ako ${cislo2}`);
    }
    else {
        return console.log(`${cislo1} je rovne ${cislo2}`);
    }
}
    
function nasobok(cislo){
    for(let i = 1; i <= 10; i++){
        console.log(`${cislo} * ${i} = ${cislo * i}`);
    }
}

parne(4);
parne(5);   
vecsie(4, 5);
vecsie(5, 4);
vecsie(4, 4);
nasobok(4);
nasobok(5);