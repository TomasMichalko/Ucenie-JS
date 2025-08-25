const prompt = require("prompt-sync")(); // import knižnice


// 1. vygenerujeme číslo od 5 do 15
let min = 5;
let max = 15;
const tajneCislo = Math.floor(Math.random() * (max - min + 1)) + min;

let hadanie; // sem si budeme ukladať tip hráča

// 2. cyklus - opakuj, kým sa netrafí
while (hadanie !== tajneCislo) {
  // pýta sa hráča o tip
  hadanie = parseInt(prompt("Tipni číslo od 5 do 15: "));

  if (hadanie > tajneCislo) {
    console.log("Príliš veľké! Skús menšie číslo.");
  } else if (hadanie < tajneCislo) {
    console.log("Príliš malé! Skús väčšie číslo.");
  } else {
    console.log("🎉 Trafil si správne číslo: " + tajneCislo);
  }
}