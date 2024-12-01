// Canvas ve bağlam ayarları
const canvas = document.getElementById("graph");
const ctx = canvas.getContext("2d");
const functionInput = document.getElementById("functionInput");
const pointList = document.getElementById("pointList");

const width = canvas.width;
const height = canvas.height;
const centerX = width / 2;
const centerY = height / 2;
let scale = 40; // Başlangıç ölçeği
let functions = [];

// Grid ve eksenleri çizme
function drawGrid() {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= width; x += scale) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    for (let y = 0; y <= height; y += scale) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    drawAxes();
}

// Eksenleri ve üzerindeki sayıları çizme
function drawAxes() {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;

    // X ekseni
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Y ekseni
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Eksen üzerindeki sayılar
    ctx.fillStyle = "black";
    ctx.font = "12px Arial";

    // X eksenindeki sayılar
    for (let i = -centerX; i <= centerX; i += scale) {
        const xValue = Math.round(i / scale); // Tam sayılar
        const xPos = centerX + i;

        if (xValue !== 0) {
            ctx.fillText(xValue, xPos, centerY + 15);
        }
    }

    // Y eksenindeki sayılar
    for (let i = -centerY; i <= centerY; i += scale) {
        const yValue = Math.round(-i / scale); // Tam sayılar
        const yPos = centerY + i;

        if (yValue !== 0) {
            ctx.fillText(yValue, centerX + 5, yPos);
        }
    }
}

// Zoom işlemi
function zoomIn() {
    scale *= 1.2;
    drawAllFunctions();
}

function zoomOut() {
    scale /= 1.2;
    drawAllFunctions();
}

// Yeni bir fonksiyon ekleme
function addFunction() {
    const input = functionInput.value;
    const sanitizedInput = input.replace(/(\d)([a-zA-Z])/g, "$1 * $2").replace(/\^/g, "**");

    try {
        new Function("x", `return ${sanitizedInput}`); // Fonksiyonu test eder
        functions.push(sanitizedInput); // Listeye ekler
        drawAllFunctions();
    } catch {
        alert("Geçersiz bir fonksiyon girdiniz. Lütfen tekrar deneyin.");
    }
}

// Tüm fonksiyonları çizme
function drawAllFunctions() {
    drawGrid();

    functions.forEach((funcStr, index) => {
        const func = new Function("x", `return ${funcStr}`);
        ctx.beginPath();
        ctx.strokeStyle = `hsl(${(index * 60) % 360}, 70%, 50%)`; // Her fonksiyon farklı renkte
        ctx.lineWidth = 2;

        for (let x = -width / 2; x <= width / 2; x++) {
            const xValue = x / scale;
            const yValue = func(xValue);
            const canvasX = centerX + x;
            const canvasY = centerY - yValue * scale;

            if (x === -width / 2) {
                ctx.moveTo(canvasX, canvasY);
            } else {
                ctx.lineTo(canvasX, canvasY);
            }
        }

        ctx.stroke();
    });
}

// Nokta ekleme ve gösterme
canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const x = Math.round((mouseX - centerX) / scale); // Tam sayı
    const y = Math.round(-(mouseY - centerY) / scale); // Tam sayı

    functions.forEach((funcStr) => {
        const func = new Function("x", `return ${funcStr}`);
        const expectedY = func(x);

        // Nokta kontrolü ve ekleme
        if (Math.abs(expectedY - y) < 0.1) {
            drawAllFunctions(); // Yeniden çiz
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, 5, 0, 2 * Math.PI); // Nokta
            ctx.fill();

            addPointToList(x, expectedY);
        }
    });
});

// Listeye nokta ekleme
function addPointToList(x, y) {
    const li = document.createElement("li");
    li.textContent = `x: ${x}, y: ${y}`; // Tam sayılar
    pointList.appendChild(li);
}

// İlk çizim
drawGrid();
