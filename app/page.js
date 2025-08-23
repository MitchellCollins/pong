"use client"

import { useEffect, useRef } from "react";

export default function Home() {
  const canvasRef = useRef();

  // Global Constants
  const fps = 30;
  const boardWidth = 1000;
  const boardHeight = 600;
  const speed = 4;
  const playerSize = 50;
  const player1XPosition = boardWidth / 10;
  const player2XPosition = boardWidth - boardWidth / 10;
  const pongSize = 20;

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

  // Global Variables
  let player1YPosition = initialValues.player1YPosition;
  let player2YPosition = initialValues.player2YPosition;
  let player1YVelocity = initialValues.player1YVelocity;
  let player2YVelocity = initialValues.player2YVelocity;
  let player1Score = initialValues.player1Score;
  let player2Score = initialValues.player2Score;
  let pongPosition = initialValues.getPongPosition();
  let pongVelocity = initialValues.getPongVelocity();

  function handleKeyDown(e) {
    switch (e.keyCode) {
      // W Key
      case 87:
        player1YVelocity = -speed;
        break;

      // S Key
      case 83:
        player1YVelocity = speed;
        break;

      // P Key
      case 80:
        player2YVelocity = -speed;
        break;

      // L Key
      case 76:
        player2YVelocity = speed;
        break;
    }
  }

  function handleKeyUp(e) {
    switch (e.keyCode) {
      // W  or S Key
      case 87 || 83:
        player1YVelocity = 0;
        break;

      // P or L Key
      case 80 || 76:
        player2YVelocity = 0;
        break;
    }
  }

  // Starts Pong
  function createStartTimeout() { 
    setTimeout(() => {
      pongVelocity.x = -speed;
    }, 3000);
  }

  function nextGame() {
    player1YPosition = initialValues.player1YPosition;
    player2YPosition = initialValues.player2YPosition;
    player1YVelocity = initialValues.player1YVelocity;
    player2YVelocity = initialValues.player2YVelocity;
    pongPosition = initialValues.getPongPosition();
    pongVelocity = initialValues.getPongVelocity();
    createStartTimeout();
  }

  function collisionHandling() {
    // Checks Collisions
    // With Player 1
    if (
      // X axis
      pongPosition.x <= player1XPosition && pongPosition.x + pongSize > player1XPosition &&
      // Y axis
      pongPosition.y <= player1YPosition + (playerSize / 2) && pongPosition.y + pongSize >= player1YPosition - (playerSize / 2)
    ) {
      // Reflects x velocity
      pongVelocity.x *= -1;
      // Update pong y velocity based off player y velocity 
      pongVelocity.y += player1YVelocity;
    }

    // With Player 2
    else if (
      // X axis
      pongPosition.x <= player2XPosition && pongPosition.x + pongSize > player2XPosition &&
      // Y axis
      pongPosition.y <= player2YPosition + (playerSize / 2) && pongPosition.y + pongSize >= player2YPosition - (playerSize / 2)
    ) {
      pongVelocity.x *= -1;
      pongVelocity.y += player2YVelocity;
    }

    // Top and bottom boundaries
    else if (pongPosition.y <= 0 || pongPosition.y + pongSize >= boardHeight) {
      pongVelocity.y *= -1;
    }

    // Right boundary
    if (pongPosition.x + pongSize >= boardWidth) {
      nextGame();
      player1Score++;
    }

    // Left boundary
    else if (pongPosition.x <= 0) {
      nextGame();
      player2Score++;
    }

    // Player 1
    if (player1YPosition - playerSize / 2 <= 0) {
      player1YPosition = playerSize / 2;
    } else if (player1YPosition + playerSize / 2 >= boardHeight) {
      player1YPosition = boardHeight - playerSize / 2;
    }

    // Player 2
    if (player2YPosition - playerSize / 2 <= 0) {
      player2YPosition = playerSize / 2;
    } else if (player2YPosition + playerSize / 2 >= boardHeight) {
      player2YPosition = boardHeight - playerSize / 2;
    }
  }

  useEffect(() => {
    if (!canvasRef.current) return null;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    function drawPlayer(x, y) {
      context.beginPath();
      // Moves player up half its size
      // So that position is relative to its center
      context.moveTo(x, y - (playerSize / 2));
      context.lineTo(x, y + playerSize);
      context.stroke();
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
      context.setLineDash([]); // Removes dotted pattern

      // Scores
      context.fillText(player1Score, boardWidth / 2 - 40, 30); // Player 1
      context.fillText(player2Score, boardWidth / 2 + 40, 30); // Player 2

      // Pong
      context.fillRect(pongPosition.x, pongPosition.y, pongSize, pongSize);

      // Player 1
      drawPlayer(player1XPosition, player1YPosition);
      // Player 2
      drawPlayer(player2XPosition, player2YPosition);
    }

    function game() {
      // Player Control Event Listeners
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      
      const loop = setInterval(() => {
        // Updates Players
        player1YPosition += player1YVelocity;
        player2YPosition += player2YVelocity;
        
        // Updates Pong
        pongPosition.x += pongVelocity.x;
        pongPosition.y += pongVelocity.y;
        
        draw();

        collisionHandling();
      }, 1000 / fps);
    }

    createStartTimeout();

    game();
  }, []);
  
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <canvas ref={canvasRef} width={boardWidth} height={boardHeight} style={{ backgroundColor: "#000" }} />
    </div>
  );
}
