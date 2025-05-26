import React, { useState, useEffect, useRef, useCallback } from 'react';

// Movie data - you can add more movies here
const MOVIES = [
  {
    id: 1,
    name: "Dune",
    poster: "/posters/dune-2.png",
    alt: "Dune Part Two"
  },
  {
    id: 2,
    name: "the lord of the rings",
    poster: "/posters/the-lord-of-the-rings.png",
    alt: "The Lord of the Rings"
  },
  {
    id: 3,
    name: "wall e",
    poster: "/posters/wall-E.png",
    alt: "Wall E"
  },
  {
    id: 4,
    name: "Benjamin Button",
    poster: "/posters/benjamin-button.png",
    alt: "Benjamin Button"
  },
  {
    id: 5,
    name: "Narnia",
    poster: "/posters/narnia.png",
    alt: "The Chronicles of Narnia"
  },
  {
    id: 6,
    name: "Harry Potter",
    poster: "/posters/harry-potter.png",
    alt: "Harry Potter and the Philosopher's Stone"
  },
  {
    id: 7,
    name: "John Carter",
    poster: "/posters/john-carter.png",
    alt: "John Carter"
  },
  {
    id: 8,
    name: "Little Prince",
    poster: "/posters/little-prince.png",
    alt: "Little Prince"
  },
];

interface Movie {
  id: number;
  name: string;
  poster: string;
  alt: string;
}

interface RevealedArea {
  x: number;
  y: number;
  id: number;
}

type GamePhase = 'playing' | 'dodging' | 'guessing' | 'result';

const MoviePosterGame: React.FC = () => {
  const [currentMovie, setCurrentMovie] = useState<Movie>(MOVIES[0]);
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
  const [ballVelocity, setBallVelocity] = useState({ x: 1.5, y: 1.2 });
  const [revealedAreas, setRevealedAreas] = useState<RevealedArea[]>([]);
  const [touchCount, setTouchCount] = useState(0);
  const [gamePhase, setGamePhase] = useState<GamePhase>('playing');
  const [userGuess, setUserGuess] = useState('');
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  
  const ballRef = useRef<HTMLDivElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const mousePositionRef = useRef({ x: 0, y: 0 });

  // Initialize random movie
  useEffect(() => {
    const randomMovie = MOVIES[Math.floor(Math.random() * MOVIES.length)];
    setCurrentMovie(randomMovie);
  }, []);

  // Normalize text for comparison - removes special characters, spaces, and converts to lowercase
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric characters
      .trim();
  };

  // Ball movement animation with bouncing
  const moveBall = useCallback(() => {
    setBallPosition(prev => {
      setBallVelocity(prevVel => {
        let newX = prev.x;
        let newY = prev.y;
        let newVelX = prevVel.x;
        let newVelY = prevVel.y;

        if (gamePhase === 'dodging') {
          // Dodging phase - ball actively avoids cursor
          const mouseX = mousePositionRef.current.x;
          const mouseY = mousePositionRef.current.y;
          
          // Calculate distance from mouse
          const dx = prev.x - mouseX;
          const dy = prev.y - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            // Run away from mouse
            const angle = Math.atan2(dy, dx);
            newVelX = Math.cos(angle) * 3;
            newVelY = Math.sin(angle) * 3;
          } else {
            // Continue with bouncing movement
            newX = prev.x + newVelX;
            newY = prev.y + newVelY;
          }
        } else if (gamePhase === 'playing') {
          // Normal phase - bouncing movement
          newX = prev.x + newVelX;
          newY = prev.y + newVelY;
        }
        
        // Bounce off walls
        if (newX <= 2 || newX >= 98) {
          newVelX = -newVelX;
          newX = newX <= 2 ? 2 : 98;
        }
        if (newY <= 2 || newY >= 98) {
          newVelY = -newVelY;
          newY = newY <= 2 ? 2 : 98;
        }

        // Keep ball within bounds
        newX = Math.max(2, Math.min(98, newX));
        newY = Math.max(2, Math.min(98, newY));
        
        return { x: newVelX, y: newVelY };
      });

      // Apply velocity changes for dodging mode
      if (gamePhase === 'dodging') {
        const mouseX = mousePositionRef.current.x;
        const mouseY = mousePositionRef.current.y;
        
        const dx = prev.x - mouseX;
        const dy = prev.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const angle = Math.atan2(dy, dx);
          const newX = Math.max(2, Math.min(98, prev.x + Math.cos(angle) * 3));
          const newY = Math.max(2, Math.min(98, prev.y + Math.sin(angle) * 3));
          return { x: newX, y: newY };
        }
      }

      // Normal bouncing movement
      const newX = Math.max(2, Math.min(98, prev.x + ballVelocity.x));
      const newY = Math.max(2, Math.min(98, prev.y + ballVelocity.y));
      
      return { x: newX, y: newY };
    });
  }, [gamePhase, ballVelocity.x, ballVelocity.y]);

  useEffect(() => {
    if (gameStarted && (gamePhase === 'playing' || gamePhase === 'dodging')) {
      animationRef.current = setInterval(moveBall, 50);
      return () => {
        if (animationRef.current) {
          clearInterval(animationRef.current);
        }
      };
    }
  }, [moveBall, gameStarted, gamePhase]);

  // Track mouse position for dodging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
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
    
    const newRevealedArea: RevealedArea = {
      x: ballPosition.x,
      y: ballPosition.y,
      id: Date.now()
    };
    
    setRevealedAreas(prev => [...prev, newRevealedArea]);
    setTouchCount(prev => prev + 1);
    
    if (touchCount + 1 >= 6) {
      setGamePhase('dodging');
      setTimeout(() => {
        setGamePhase('guessing');
      }, 5000); // 5 seconds of dodging
    }
  };

  const handleGuessSubmit = () => {
    if (!userGuess.trim()) return;
    
    const normalizedGuess = normalizeText(userGuess);
    const normalizedAnswer = normalizeText(currentMovie.name);
    const isCorrect = normalizedGuess === normalizedAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setGamePhase('result');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGuessSubmit();
    }
  };

  const startNewGame = () => {
    const randomMovie = MOVIES[Math.floor(Math.random() * MOVIES.length)];
    setCurrentMovie(randomMovie);
    setBallPosition({ x: 50, y: 50 });
    setBallVelocity({ 
      x: (Math.random() - 0.5) * 3, 
      y: (Math.random() - 0.5) * 3 
    });
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
            <p>⚡ Chase and click the bouncing orb to reveal parts of the poster</p>
            <p>🎯 You get exactly 6 reveals - make them count!</p>
            <p>🏃 After 6 touches, the orb becomes elusive...</p>
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

  const normalizedGuess = normalizeText(userGuess);
  const normalizedAnswer = normalizeText(currentMovie.name);
  const isCorrect = normalizedGuess === normalizedAnswer;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black relative overflow-hidden">
      {/* Score and Status */}
      <div className="absolute top-4 left-4 z-20 bg-black/70 rounded-lg px-4 py-2 text-white">
        <div>Score: {score}</div>
        <div>Reveals: {touchCount}/6</div>
        <div className="text-sm">
          {gamePhase === 'playing' && 'Catch the bouncing orb!'}
          {gamePhase === 'dodging' && 'Orb is avoiding you...'}
          {gamePhase === 'guessing' && 'Time to guess!'}
        </div>
      </div>

      {/* Game Area */}
      <div
        ref={gameAreaRef}
        className="w-full h-screen relative cursor-crosshair"
      >
        {/* Movie Poster Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${currentMovie.poster})`,
          }}
        />
        
        {/* Black Overlay with SVG mask for holes */}
        <div className="absolute inset-0">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <mask id="reveal-mask">
                <rect width="100%" height="100%" fill="white" />
                {revealedAreas.map((area) => (
                  <circle
                    key={area.id}
                    cx={`${area.x}%`}
                    cy={`${area.y}%`}
                    r="60"
                    fill="black"
                  />
                ))}
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="black"
              mask="url(#reveal-mask)"
            />
          </svg>
        </div>

        {/* Moving Ball */}
        {(gamePhase === 'playing' || gamePhase === 'dodging') && (
          <div
            ref={ballRef}
            className={`absolute w-6 h-6 rounded-full z-20 cursor-pointer transition-colors duration-200 ${
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
                What&apos;s the movie?
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={userGuess}
                  onChange={(e) => setUserGuess(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter movie name..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                  autoFocus
                />
                <button
                  onClick={handleGuessSubmit}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                >
                  Submit Guess
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Result Phase */}
        {gamePhase === 'result' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/90">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
              <h2 className={`text-3xl font-bold mb-4 ${
                isCorrect ? 'text-green-600' : 'text-red-600'
              }`}>
                {isCorrect ? '🎉 Correct!' : '❌ Wrong!'}
              </h2>
              <p className="text-xl mb-2 text-gray-800">The movie was:</p>
              <p className="text-2xl font-bold mb-6 text-blue-600">{currentMovie.name}</p>
              <p className="mb-6 text-gray-600">Your guess: &quot;{userGuess}&quot;</p>
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