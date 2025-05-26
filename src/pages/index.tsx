import React, { useState, useEffect, useRef, useCallback } from 'react';

// Movie data - you can add more movies here
const MOVIES = [
  {
    id: 1,
    name: "Dune",
    poster: "public/posters/dune-2.png", // You'll need to add this image
    alt: "Dune Part Two"
  },
  {
    id: 2,
    name: "the lord of the rings",
    poster: "public/posters/the-lord-of-the-rings.png",
    alt: "The Lord of the Rings"
  },
  {
    id: 3,
    name: "wall e",
    poster: "public/posters/wall-E.png",
    alt: "Wall E"
  }
];

const MoviePosterGame = () => {
  const [currentMovie, setCurrentMovie] = useState(MOVIES[0]);
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
  const [revealedAreas, setRevealedAreas] = useState([]);
  const [touchCount, setTouchCount] = useState(0);
  const [gamePhase, setGamePhase] = useState('playing'); // 'playing', 'dodging', 'guessing', 'result'
  const [userGuess, setUserGuess] = useState('');
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const ballRef = useRef(null);
  const gameAreaRef = useRef(null);
  const animationRef = useRef(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });

  // Initialize random movie
  useEffect(() => {
    const randomMovie = MOVIES[Math.floor(Math.random() * MOVIES.length)];
    setCurrentMovie(randomMovie);
  }, []);

  // Ball movement animation
  const moveBall = useCallback(() => {
    if (gamePhase === 'dodging') {
      // Dodging phase - ball actively avoids cursor
      setBallPosition(prev => {
        const mouseX = mousePositionRef.current.x;
        const mouseY = mousePositionRef.current.y;
        
        // Calculate distance from mouse
        const dx = prev.x - mouseX;
        const dy = prev.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        let newX = prev.x;
        let newY = prev.y;
        
        if (distance < 150) {
          // Run away from mouse
          const angle = Math.atan2(dy, dx);
          newX = prev.x + Math.cos(angle) * 3;
          newY = prev.y + Math.sin(angle) * 3;
        } else {
          // Random movement when far from mouse
          newX = prev.x + (Math.random() - 0.5) * 4;
          newY = prev.y + (Math.random() - 0.5) * 4;
        }
        
        // Keep ball within bounds
        newX = Math.max(5, Math.min(95, newX));
        newY = Math.max(5, Math.min(95, newY));
        
        return { x: newX, y: newY };
      });
    } else if (gamePhase === 'playing') {
      // Normal phase - random movement
      setBallPosition(prev => {
        const newX = Math.max(5, Math.min(95, prev.x + (Math.random() - 0.5) * 2));
        const newY = Math.max(5, Math.min(95, prev.y + (Math.random() - 0.5) * 2));
        return { x: newX, y: newY };
      });
    }
  }, [gamePhase]);

  useEffect(() => {
    if (gameStarted && (gamePhase === 'playing' || gamePhase === 'dodging')) {
      animationRef.current = setInterval(moveBall, 50);
      return () => clearInterval(animationRef.current);
    }
  }, [moveBall, gameStarted, gamePhase]);

  // Track mouse position for dodging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (gameAreaRef.current) {
        const rect = gameAreaRef.current.getBoundingClientRect();
        mousePositionRef.current = {
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        };
      }
    };

    if (gamePhase === 'dodging') {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [gamePhase]);

  const handleBallClick = () => {
    if (gamePhase !== 'playing') return;
    
    const newRevealedArea = {
      x: ballPosition.x,
      y: ballPosition.y,
      id: Date.now()
    };
    
    setRevealedAreas(prev => [...prev, newRevealedArea]);
    setTouchCount(prev => prev + 1);
    
    if (touchCount + 1 >= 3) {
      setGamePhase('dodging');
      setTimeout(() => {
        setGamePhase('guessing');
      }, 5000); // 5 seconds of dodging
    }
  };

  const handleGuessSubmit = (e) => {
    e.preventDefault();
    const isCorrect = userGuess.toLowerCase().trim() === currentMovie.name.toLowerCase().trim();
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setGamePhase('result');
  };

  const startNewGame = () => {
    const randomMovie = MOVIES[Math.floor(Math.random() * MOVIES.length)];
    setCurrentMovie(randomMovie);
    setBallPosition({ x: 50, y: 50 });
    setRevealedAreas([]);
    setTouchCount(0);
    setGamePhase('playing');
    setUserGuess('');
    setGameStarted(true);
    setShowInstructions(false);
  };

  const startGame = () => {
    setShowInstructions(false);
    setGameStarted(true);
    startNewGame();
  };

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 max-w-2xl text-center text-white">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            🎬 Movie Poster Mystery
          </h1>
          <div className="space-y-4 text-lg">
            <p>🕵️ Your mission: Guess the hidden movie poster!</p>
            <p>⚡ Chase and click the glowing orb to reveal parts of the poster</p>
            <p>🎯 You get exactly 3 reveals - make them count!</p>
            <p>🏃 After 3 touches, the orb becomes elusive...</p>
            <p>🎭 Use your reveals wisely to identify the movie!</p>
          </div>
          <button
            onClick={startGame}
            className="mt-8 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-xl font-semibold hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Start Playing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black relative overflow-hidden">
      {/* Score and Status */}
      <div className="absolute top-4 left-4 z-20 bg-black/70 rounded-lg px-4 py-2 text-white">
        <div>Score: {score}</div>
        <div>Reveals: {touchCount}/3</div>
        <div className="text-sm">
          {gamePhase === 'playing' && 'Catch the orb!'}
          {gamePhase === 'dodging' && 'Orb is avoiding you...'}
          {gamePhase === 'guessing' && 'Time to guess!'}
        </div>
      </div>

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="w-full h-screen relative cursor-crosshair"
        style={{
          backgroundImage: `url(${currentMovie.poster})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Black Overlay */}
        <div className="absolute inset-0 bg-black z-10" />
        
        {/* Revealed Areas */}
        {revealedAreas.map((area) => (
          <div
            key={area.id}
            className="absolute z-15 rounded-full"
            style={{
              left: `${area.x}%`,
              top: `${area.y}%`,
              width: '120px',
              height: '120px',
              transform: 'translate(-50%, -50%)',
              boxShadow: `0 0 0 60px black`,
              clipPath: 'circle(60px)',
              background: 'transparent'
            }}
          />
        ))}

        {/* Moving Ball */}
        {(gamePhase === 'playing' || gamePhase === 'dodging') && (
          <div
            ref={ballRef}
            className={`absolute w-6 h-6 rounded-full z-20 cursor-pointer transition-all duration-100 ${
              gamePhase === 'dodging' 
                ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse' 
                : 'bg-cyan-400 shadow-lg shadow-cyan-400/50'
            }`}
            style={{
              left: `${ballPosition.x}%`,
              top: `${ballPosition.y}%`,
              transform: 'translate(-50%, -50%)',
              animation: gamePhase === 'dodging' ? 'pulse 0.5s infinite' : 'glow 2s ease-in-out infinite alternate'
            }}
            onClick={handleBallClick}
          />
        )}

        {/* Guessing Phase */}
        {gamePhase === 'guessing' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
                What's the movie?
              </h2>
              <form onSubmit={handleGuessSubmit} className="space-y-4">
                <input
                  type="text"
                  value={userGuess}
                  onChange={(e) => setUserGuess(e.target.value)}
                  placeholder="Enter movie name..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                  autoFocus
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                >
                  Submit Guess
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Result Phase */}
        {gamePhase === 'result' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/90">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
              <h2 className={`text-3xl font-bold mb-4 ${
                userGuess.toLowerCase().trim() === currentMovie.name.toLowerCase().trim() 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {userGuess.toLowerCase().trim() === currentMovie.name.toLowerCase().trim() 
                  ? '🎉 Correct!' 
                  : '❌ Wrong!'}
              </h2>
              <p className="text-xl mb-2 text-gray-800">The movie was:</p>
              <p className="text-2xl font-bold mb-6 text-blue-600">{currentMovie.name}</p>
              <p className="mb-6 text-gray-600">Your guess: "{userGuess}"</p>
              <button
                onClick={startNewGame}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-200"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes glow {
          from { box-shadow: 0 0 20px currentColor; }
          to { box-shadow: 0 0 30px currentColor, 0 0 40px currentColor; }
        }
      `}</style>
    </div>
  );
};

export default MoviePosterGame;