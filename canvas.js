const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Board sesuai tugas
const rows = 30;   // tinggi
const cols = 48;   // lebar

// Ukuran per kotak = 960/48 = 600/30 = 20px
const cellSize = 20;

// Gambar grid
function drawBoard() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {

            // Warna checkerboard
            if ((row + col) % 2 === 0) {
                ctx.fillStyle = "#0e1128";   // kotak gelap
            } else {
                ctx.fillStyle = "#000b6c";   // kotak terang
            }

            let x = col * cellSize;
            let y = row * cellSize;

            ctx.fillRect(x, y, cellSize, cellSize);
        }
    }
}

// Panggil saat load
drawBoard();
