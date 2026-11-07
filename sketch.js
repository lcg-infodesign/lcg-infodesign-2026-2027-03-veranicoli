let myTable;
let maxHours = 0;
 
let categorie = ["alone", "with_friends", "with_children", "with_family", "with_partner", "with_coworkers"];
let nomiCategorie = ["Alone", "With friends", "With children", "With family", "With partner", "With coworkers"];
let colori = ["#91B8C9", "#D6A477", "#A8B99A", "#C98791", "#A99BCB", "#D5C77D"];
 
let margine = 40;
let topMatrice = 190;
let bassoMatrice;
let numeroEta;
let passo;
let spazioY;
let diametroMax;
 
async function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Futura, 'Century Gothic', 'Trebuchet MS', sans-serif");
 
  //carico il cvs
  myTable = await loadTable("assets/time_relationships_age.csv", ",", "header");
 
  //valore massimo di ore in tutta la tabella, ciclo scorre tutte le righe della tabella, per ogni riga scorre le 6 categorie
  for (let riga = 0; riga < myTable.getRowCount(); riga++) {
    for (let categoria = 0; categoria < 6; categoria++) {
      let valore = myTable.getNum(riga, categorie[categoria]);
      if (valore > maxHours) {
        maxHours = valore; //se il valore è più grande del massimo trovato finora, diventa il nuovo massimo
      }
    }
  }
}
 
function calcolaDimensioni() {
  numeroEta = myTable.getRowCount(); //numero di colonne della visualizzazione: una per riga del CSV
  bassoMatrice = windowHeight - 70; //lascio 70 px in fondo per le etichette dei decenni
  passo = (windowWidth - margine * 2) / numeroEta; //larghezza di una colonna: finestra meno i due margini diviso per il numero di età
  spazioY = (bassoMatrice - topMatrice) / 6; //altezza di una riga
  diametroMax = min(passo * 3.2, spazioY * 0.8); //diametro del cerchio più grande-si sovrappongono in orizzontale
}
 
//mouse dentro la matrice, restituisce la colonna (età) sotto il mouse, -1 se il mouse è fuori dalla matrice (=nessuna colonna)
function trovaColonna() {
  if (mouseX > margine && mouseX < margine + passo * numeroEta && mouseY > topMatrice && mouseY < bassoMatrice) {
    return floor((mouseX - margine) / passo);
  }
  return -1;
}
 
function drawEvidenziazione(colonna) {
  noStroke();
  fill(255, 30); //trasparenza
  rect(margine + colonna * passo, topMatrice, passo, bassoMatrice - topMatrice); 
}
 
//creo un cerchio per ogni età (colonna) e per ogni categoria (riga)
function drawCerchi() {
  noStroke();
  for (let i = 0; i < numeroEta; i++) {
    let posx = margine + i * passo + passo / 2;
 
    for (let categoria = 0; categoria < 6; categoria++) {
      let valore = myTable.getNum(i, categorie[categoria]);
      let posy = topMatrice + spazioY * (categoria + 0.5);
      let diametro = map(valore, 0, maxHours, 0, diametroMax); //map() converte il valore: da 0 a maxHours diventa da 0 a diametroMax, valore più alto ha cerchio più grande, gli altri sono proporzionali
 
      let colore = color(colori[categoria]);
      colore.setAlpha(175); //trasparenza fa vedere le sovrapposizioni
      fill(colore);
      circle(posx, posy, diametro);
    }
  }
}
 
//etichette all'inizio di ogni decennio
function drawDecenni() {
  for (let i = 0; i < numeroEta; i++) {
    let eta = myTable.getNum(i, "year");
    if (eta % 10 == 0) { //divisione per individuare decenni (resto della divisione deve essere uguale a zero)
      let posx = margine + i * passo + passo / 2;
      //per tacchetta
      stroke(120);
      line(posx, bassoMatrice + 10, posx, bassoMatrice + 24);
      //per numero decenni
      noStroke();
      fill(210);
      textSize(15);
      text(eta, posx + 5, bassoMatrice + 38);
    }
  }
}
 
// titolo, legenda dei colori e spiegazione
function drawLegenda() {
  noStroke();
  fill(235);
  textSize(28);
  text("Who Americans spend most of their time with?", margine, 50);
 
  textSize(16);
  let x = margine;
  for (let categoria = 0; categoria < 6; categoria++) {
    fill(colori[categoria]);
    circle(x + 7, 91, 14);
    fill(230);
    text(nomiCategorie[categoria], x + 22, 97);
    // la prossima voce parte dopo la fine della parola più 32 px di spazio
    x = x + 22 + textWidth(nomiCategorie[categoria]) + 32;
  }
 
  fill(185);
  textSize(14);
  text("Each column is one age. Circle size = average daily hours. Based on averages from surveys in the United States between 2010 and 2024", margine, 128);
}
 
// valori dell'età sotto il mouse, su una riga
function drawInfo(colonna) {
  textSize(15);
  noStroke();
  if (colonna >= 0) { //se il mouse è su una colonna
    fill(255);
    let titolo = "Age " + myTable.getNum(colonna, "year") + ":";
    text(titolo, margine, 165);
 
    let x = margine + textWidth(titolo) + 20;
    for (let categoria = 0; categoria < 6; categoria++) {
      let valore = myTable.getNum(colonna, categorie[categoria]);
      let testo = nomiCategorie[categoria] + " " + valore.toFixed(1) + " h"; //per ogni categoria legge le ore di quell’età, usa il colore della categoria e scrive nome e valore. toFixed(1) arrotonda a una cifra decimale
      fill(colori[categoria]);
      text(testo, x, 165);
      x = x + textWidth(testo) + 24; 
    }
  } else {
    fill(120);
    text("Hover a column to read its values.", margine, 165); //se il mouse è fuori dalla matrice, mostra un suggerimento in grigio
  }
}
 
function draw() {
  background("#202536");
  
  calcolaDimensioni();
 
  //aggiorna le misure, trova la colonna sotto il mouse e, se c’è, disegna la fascia
  let colonna = trovaColonna();
  if (colonna >= 0) {
    drawEvidenziazione(colonna);
  }
 
  drawCerchi();
  drawDecenni();
  drawLegenda();
  drawInfo(colonna);
}