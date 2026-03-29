/**
 * MOTOR DE JUEGO: ROMPE LADRILLOS (Versión 700x700)
 * Desarrolladores: Armando Antonio Lopez, Juan Jose Cossio, Juan Pablo Parra y Sebastián Londoño
 */

const canvas = document.getElementById('gameCanvas'); 
const ctx = canvas.getContext('2d'); 
const scoreElement = document.getElementById('score'); 
const saveBtn = document.getElementById('saveScoreBtn');
const resetBtn = document.getElementById('resetBtn');

// --- ESTADO GLOBAL ---
let score = 0;
let gameOver = false;
let gameWin = false;
let animationId; 

// --- CONFIGURACIÓN ---
const paddleHeight = 12;
const paddleWidth = 100; 
let paddleX = (canvas.width - paddleWidth) / 2;
const paddleSpeed = 4; 

let x, y, dx, dy;
const ballRadius = 8;

const brickRowCount = 6;
const brickColumnCount = 9;
const brickWidth = 65;
const brickHeight = 25;
const brickPadding = 10;
const brickOffsetTop = 50;
const brickOffsetLeft = 15;
let bricks = [];

// --- INICIALIZACIÓN ---
function initVariables() {
    // Detener cualquier animación previa antes de reiniciar
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    score = 0;
    scoreElement.innerText = score;
    gameOver = false;
    gameWin = false;
    
    // OCULTAR BOTÓN AL EMPEZAR
    resetBtn.style.display = "none";
    
    // Posición y dirección aleatoria
    const minX = canvas.width * 0.2;
    const maxX = canvas.width * 0.8;
    x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
    y = canvas.height - 40;
    dx = (Math.random() < 0.5 ? 3 : -3); 
    dy = -3;

    paddleX = (canvas.width - paddleWidth) / 2;

    // Inicializar matriz de ladrillos con blindaje en la fila 1
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            // Fila 1 (segunda fila) es blindada (2 golpes)
            let hitsNeeded = (r === 1) ? 2 : 1; 
            bricks[c][r] = { x: 0, y: 0, status: hitsNeeded };
        }
    }
    
    // Iniciar el bucle
    draw();
}

// --- CONTROLES ---
let rightPressed = false;
let leftPressed = false;

document.addEventListener("keydown", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
});
document.addEventListener("keyup", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
});

// --- COLISIONES (CORREGIDO PARA BLINDAJE) ---
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status > 0) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status--; // Restar vida al ladrillo
                    
                    if (b.status === 0) {
                        score += 10;
                        scoreElement.innerText = score;
                    }
                    
                    // Verificar victoria: si no quedan ladrillos con status > 0
                    let bricksLeft = bricks.flat().filter(br => br.status > 0).length;
                    if (bricksLeft === 0) {
                        gameWin = true;
                    }
                }
            }
        }
    }
}

// --- RENDERIZADO ---
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status > 0) {
                let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                
                // Color dinámico según blindaje
                if (bricks[c][r].status === 2) {
                    ctx.fillStyle = "#888888"; // Gris para blindados
                } else {
                    ctx.fillStyle = `hsl(${r * 40}, 70%, 50%)`;
                }
                
                ctx.fill();
                ctx.strokeStyle = "white";
                ctx.stroke();
                ctx.closePath();
            }
        }
    }
}

function draw() {
    if (gameOver || gameWin) {
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "bold 32px Courier New";
        ctx.fillStyle = gameWin ? "#00FF00" : "#FF0000";
        ctx.textAlign = "center";
        ctx.fillText(gameWin ? "¡VICTORIA!" : "GAME OVER", canvas.width / 2, canvas.height / 2);
        
        // MOSTRAR BOTÓN AL FINALIZAR
        resetBtn.style.display = "inline-block";
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBricks();
    
    // Dibujar Bola
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#FFCC00";
    ctx.fill();
    ctx.closePath();

    // Dibujar Paleta
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight - 10, paddleWidth, paddleHeight);
    ctx.fillStyle = "#00D4FF";
    ctx.fill();
    ctx.closePath();

    collisionDetection();

    // Rebotar paredes
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) dx = -dx;
    if (y + dy < ballRadius) dy = -dy;
    else if (y + dy > canvas.height - ballRadius - 10) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
            dx *= 1.01; // Aumentar dificultad
            dy *= 1.01;
        } else {
            gameOver = true;
        }
    }

    // Mover paleta
    if (rightPressed && paddleX < canvas.width - paddleWidth) paddleX += paddleSpeed;
    if (leftPressed && paddleX > 0) paddleX -= paddleSpeed;

    x += dx;
    y += dy;
    
    animationId = requestAnimationFrame(draw);
}

// --- EVENTOS ---
resetBtn.addEventListener('click', initVariables);

saveBtn.addEventListener('click', async () => {
    if (score === 0) return alert('¡Juega antes de guardar!');
    saveBtn.innerText = "Guardando...";
    saveBtn.disabled = true;
    try {
        const response = await fetch('http://localhost:3000/api/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ player: 'Usuario_Unibague', score: score })
        });
        if (response.ok) alert('Puntuación guardada.');
        else alert('Error en el servidor.');
    } catch (error) {
        alert('No se pudo conectar con el Backend.');
    } finally {
        saveBtn.innerText = "Guardar Puntuación";
        saveBtn.disabled = false;
    }
});

// Iniciar juego por primera vez
initVariables();