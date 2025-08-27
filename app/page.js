"use client"

import { useEffect, useRef, useState } from "react";
import { VolumeOff, VolumeUp } from "@mui/icons-material";
import { Pong } from "@/constructors/Pong";
import { Player } from "@/constructors/Player";

// Determines if is being runned in production
const isProd = process.env.NODE_ENV === "production";
// Used to change src paths when in production
// Because with github the url is changed as it has an addition /pong as that is its repository
function resolveSRCPath(path) {
  return (isProd ? "/pong" : "") + path;
}

export default function Home() {
  const canvasRef = useRef();
  const [running, setRunning] = useState(false);
  const [winner, setWinner] = useState();
  const [mode, setMode] = useState();
  const [mute, setMute] = useState(false);
  const [audios, setAudios] = useState([]);

  // Global Constants
  const fps = 30;
  const boardWidth = 1000;
  const boardHeight = 600;
  const speed = 8;
  const pongSpeedMultiplier = 1.4;
  const playerWidth = 10;
  const playerHeight = 60;
  const player1XPosition = boardWidth / 10;
  const player2XPosition = boardWidth - boardWidth / 10;
  const pongSize = 20;
  const maxScore = 10;

  // Initial Variable Values
  const initialValues = {
    player1YPosition: boardHeight / 2,
    player2YPosition: boardHeight / 2,
    player1YVelocity: 0,
    player2YVelocity: 0,
    player1Score: 0,
    player2Score: 0,
    getPongPosition: () => ({
      x: boardWidth / 4,
      y: boardHeight / 2
    }),
    getPongVelocity: () => ({
      x: 0,
      y: 0
    })
  }

  const pong = new Pong({
    position: initialValues.getPongPosition(),
    speed: initialValues.getPongVelocity(),
    maxSpeed: speed * pongSpeedMultiplier,
    size: pongSize
  });

  const player1 = new Player({
    position: { x: player1XPosition, y: initialValues.player1YPosition },
    speed:  initialValues.player1YVelocity,
    maxSpeed: speed,
    height: playerHeight,
    width: playerWidth
  });

  const player2 = new Player({
    position: { x: player2XPosition, y: initialValues.player2YPosition },
    speed: initialValues.player2YVelocity,
    maxSpeed: speed,
    height: playerHeight,
    width: playerWidth
  });

  function handleKeyDown(e) {
    switch (e.keyCode) {
      // W Key
      case 87:
        player1.speed = -speed;
        break;

      // S Key
      case 83:
        player1.speed = speed;
        break;

      // These controls only work if mode is player
      // P Key
      case 80:
        if (mode === "player")
          player2.speed = -speed;
        break;

      // L Key
      case 76:
        if (mode === "player")
          player2.speed = speed;
        break;
    }
  }

  function handleKeyUp(e) {
    switch (e.keyCode) {
      // W  or S Key
      case 87 || 83:
        player1.speed = 0;
        break;

      // P or L Key
      case 80 || 76:
        if (mode === "player")
          player2.speed = 0;
        break;
    }
  }

  // Loads Audio files
  useEffect(() => {
    setAudios([
      new Audio(resolveSRCPath("/pong_beep.wav")),
      new Audio(resolveSRCPath("/pong_goal.wav"))
    ]);
  }, []);

  // Mute/Unmute Audio when mute state changes
  useEffect(() => {
    setAudios((prevAudios) => prevAudios.map((audio) => {
      audio.muted = mute;
      return audio;
    }));
  }, [mute]);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Provides instances with context
    // Used to draw itself
    pong.context = context;
    player1.context = context;
    player2.context = context;

    // Audio
    const [beep, goal] = audios;

    function setTextOptions() {
      context.fillStyle = "#fff";
      context.font = "30px Ariel";
    }

    // Starts Pong
    function createStartCountdown() { 
      return new Promise((resolve) => {
        context.reset();
        
        setTextOptions();
        context.fillText("3", boardWidth / 2, boardHeight / 2);

        setTimeout(() => {
          context.reset();
          setTextOptions();
          context.fillText("2", boardWidth / 2, boardHeight / 2);
        }, 1000);

        setTimeout(() => {
          context.reset();
          setTextOptions();
          context.fillText("1", boardWidth / 2, boardHeight / 2);
        }, 2000);
        
        setTimeout(() => {
          // Clears countdown
          context.reset();
          
          // Player Control Event Listeners
          window.addEventListener("keydown", handleKeyDown);
          window.addEventListener("keyup", handleKeyUp);
          
          pong.speed.x = -speed * pongSpeedMultiplier;

          resolve();
        }, 3000);
      });
    }

    function draw() {
      context.reset();

      context.fillStyle = "#fff";
      context.font = "30px Ariel";
      context.textAlign = "center";
      context.strokeStyle = "#fff";
      context.strokeWidth = 5;

      // Middle Line
      context.setLineDash([2, 4]); // Creates dotted pattern
      context.beginPath();
      context.moveTo(boardWidth / 2, 0);
      context.lineTo(boardWidth / 2, boardHeight);
      context.stroke();

      // Scores
      context.fillText(player1.score, boardWidth / 2 - 40, 30); // Player 1
      context.fillText(player2.score, boardWidth / 2 + 40, 30); // Player 2 
      
      pong.draw();

      player1.draw();
      player2.draw();
    }

    function game() {
      const loop = setInterval(() => {
        // Updates position based off speed
        player1.update();
        player2.update();
        
        // Updates position based off speed
        pong.update();

        // Computer make decision if in mode "computer"
        if (mode === "computer") {
          const distance = pong.position.y - player2.position.y;

          // Determines required velocity to move player to pong y position
          player2.speed = (distance > 0 ? speed : distance < 0 ? -speed : 0);
        }
        
        draw();

        collisionHandling();
      }, 1000 / fps);

      function finishGame(winner) {
        clearInterval(loop);
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        setRunning(false);
        setWinner(winner);
      }

      function nextGame(scorer) {
        // Checks if someone has won
        if (player1.score >= maxScore)
          finishGame(1);

        else if (player2.score >= maxScore)
          finishGame(2);
        
        // If no winner then next game is setup
        else {
          player1.position.y = initialValues.player1YPosition;
          player2.position.y = initialValues.player2YPosition;
          player1.speed = initialValues.player1YVelocity;
          player2.speed = initialValues.player2YVelocity;

          pong.position = initialValues.getPongPosition();
          pong.speed = initialValues.getPongVelocity();
          
          // Checks if player 1 scored
          // Only need to change pong position for player 2
          // As for player 1 the values are the initial values
          if (scorer === 1) {
            pong.position.x = boardWidth - boardWidth / 4;
            pong.speed.x = speed * pongSpeedMultiplier;
          } else {
            pong.speed.x = -speed * pongSpeedMultiplier;
          }
        }
      }

      function pongCollidedPlayer(playerVelocity) {
        beep.play();
        
        // Reflects x velocity
        pong.speed.x *= -1;

        pong.limitYSpeed(playerVelocity);
      }

      function playerYCollisionHandler(position, velocity) {
        // Checks if pong hits front side
        if (pong.position.y + pongSize <= position + playerHeight / 2 && pong.position.y >= position - playerHeight / 2) {
          pongCollidedPlayer(velocity);
        }

        // Checks if pong hits top side
        else if (pong.position.y <= position - playerHeight / 2 && pong.position.y + pongSize >= position - playerHeight / 2) {
          // Positions pong outside of player
          pong.position.y = position - playerHeight / 2 - pongSize - 1;
          pong.speed.y *= -1;

          pongCollidedPlayer(velocity);
        }

        // Checks if pong hits bottom side
        else if (pong.position.y <= position + playerHeight / 2 && pong.position.y + pongSize > position - playerHeight / 2) {
          pong.position.y = position + playerHeight / 2 + 1;
          pong.speed.y *= -1;
          
          pongCollidedPlayer(velocity);
        }
      }

      function collisionHandling() {
        // Checks Collisions
        // Checks if pong is within x window of player 1
        if (pong.position.x <= player1XPosition + playerWidth && pong.position.x + pongSize >= player1XPosition)
          playerYCollisionHandler(player1.position.y, player1.speed);

        // Checks if pong is within x window of player 2
        else if (pong.position.x <= player2XPosition && pong.position.x + pongSize > player2XPosition)
          playerYCollisionHandler(player2.position.y, player2.speed);

        // Top and bottom boundaries
        else if (pong.position.y <= 0 || pong.position.y + pongSize >= boardHeight) {
          beep.play();
          pong.speed.y *= -1;
        }

        // Right boundary
        if (pong.position.x + pongSize >= boardWidth) {
          goal.play();
          player1.score++;
          // Player 1 scored
          nextGame(1);
        }

        // Left boundary
        else if (pong.position.x <= 0) {
          goal.play();
          player2.score++;
          // Player 2 scored
          nextGame(2);
        }

        // Player 1
        if (player1.position.y - playerHeight / 2 <= 0) {
          player1.position.y = playerHeight / 2;
        } else if (player1.position.y + playerHeight / 2 >= boardHeight) {
          player1.position.y = boardHeight - playerHeight / 2;
        }

        // Player 2
        if (player2.position.y - playerHeight / 2 <= 0) {
          player2.position.y = playerHeight / 2;
        } else if (player2.position.y + playerHeight / 2 >= boardHeight) {
          player2.position.y = boardHeight - playerHeight / 2;
        }
      }
    }

    async function startGame() {
      await createStartCountdown();
      game();
    }

    if (running) 
      startGame();
  }, [running]);
  
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <canvas ref={canvasRef} width={boardWidth} height={boardHeight} style={{ backgroundColor: "#000" }} />

      {/* Mute Button */}
      <button id="mute-button" onClick={() => setMute(!mute)}>
        {mute ? <VolumeOff htmlColor="#fff" /> : <VolumeUp htmlColor="#fff" />}
      </button>

      {/* Start Menu */}
      <div hidden={running || winner} className="menu">
        {/* Title */}
        <h1 style={{ marginTop: 0, marginBottom: 10, fontSize: 60 }}>Pong</h1>

        {mode ? (
          // Start Game Button
          <button onClick={() => setRunning(true)} className="menu-button">
            Start Game!
          </button>
        ) : (
          // Mode Selection
          <div className="menu-buttons">
            <button onClick={() => setMode("computer")} className="menu-button">
              Computer
            </button>

            <button onClick={() => setMode("player")} className="menu-button">
              2 Player
            </button>
          </div>
        )}
      </div>

      {/* Restart Menu */}
      <div hidden={!winner} className="menu">
        {/* Title */}
        <h1>Player {winner} won!</h1>

        <div className="menu-buttons">
          {/* Restart Game Button */}
          <button className="menu-button" onClick={() => { 
            setWinner(); 
            setRunning(true) 
          }}>
            Restart Game!
          </button>

          {/* Quit To Menu Button */}
          <button className="menu-button" onClick={() => {
            setWinner();
            setMode();
          }}>
            Quit to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
