let pocitadlo = 0;

// nájdeme HTML elementy podľa id
const span = document.getElementById("pocitadlo");
const button = document.getElementById("tlacidlo");
const resetButton = document.getElementById("reset");

// pridáme reakciu na kliknutie
button.addEventListener("click", () => {
  pocitadlo++; // zvýš počet
  span.textContent = pocitadlo; // prepíš číslo v HTML
  zmenFarbu();
});

// pridáme reakciu na resetovanie
resetButton.addEventListener("click", () => {
  pocitadlo = 0; // resetuj počet
  span.textContent = pocitadlo; // prepíš číslo v HTML
});

// funkcia, ktorá zmení farbu pozadia podľa parity
function zmenFarbu() {
  // načítaj číslo z HTML (ako text → preto parseInt)
  let cislo = parseInt(span.textContent);

  if (cislo % 2 === 0) {
    document.body.style.backgroundColor = "green"; // párne → zelená
  } else {
    document.body.style.backgroundColor = "red";   // nepárne → červená
  }
}

