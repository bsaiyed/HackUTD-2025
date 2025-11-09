import React, { useState, useEffect, useCallback } from 'react';
import './MemoryGame.css';

function MemoryGame({ discordSdk, instanceId, currentUser }) {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to safely parse JSON responses
  const safeJsonParse = async (response) => {
    const text = await response.text();
    if (!text) {
      throw new Error('Empty response from server');
    }
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
    }
  };

  // Fetch game state
  const fetchGameState = useCallback(async () => {
    try {
      const response = await fetch(`/api/game/${instanceId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch game state: ${response.status} ${errorText}`);
      }
      const data = await safeJsonParse(response);
      setGameState(data);
    } catch (err) {
      console.error('Fetch game state error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [instanceId]);

  // Initialize game or join existing game
  useEffect(() => {
    const initGame = async () => {
      try {
        // First, try to get existing game state
        const existingResponse = await fetch(`/api/game/${instanceId}`);
        
        if (existingResponse.ok) {
          const existingData = await safeJsonParse(existingResponse);
          
          // Check if current user is already in the game
          const userInGame = existingData.players?.some(p => p.id === currentUser.id);
          
          if (!userInGame) {
            // Join the existing game
            const joinResponse = await fetch(`/api/game/${instanceId}/join`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ player: currentUser })
            });
            
            if (joinResponse.ok) {
              const joinData = await safeJsonParse(joinResponse);
              setGameState(joinData);
              setLoading(false);
              return;
            } else {
              const errorText = await joinResponse.text();
              console.warn('Join failed:', errorText);
            }
          } else {
            // User already in game, just fetch state
            setGameState(existingData);
            setLoading(false);
            return;
          }
        }

        // If no existing game or join failed, create new game
        const response = await fetch('/api/game/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            instanceId, 
            players: [currentUser]
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to initialize game: ${response.status} ${errorText}`);
        }
        
        const data = await safeJsonParse(response);
        setGameState(data);
        setLoading(false);
      } catch (err) {
        console.error('Init error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (instanceId && currentUser) {
      initGame();
    }
  }, [discordSdk, instanceId, currentUser]);

  // Poll for game state updates
  useEffect(() => {
    if (!gameState || loading) return;

    const interval = setInterval(fetchGameState, 1000);
    return () => clearInterval(interval);
  }, [gameState, fetchGameState, loading]);

  // Auto-reset flipped cards after 2 seconds
  useEffect(() => {
    if (!gameState || gameState.flippedCards.length !== 2) return;

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/game/${instanceId}/reset-flipped`, {
          method: 'POST'
        });
        if (response.ok) {
          const data = await safeJsonParse(response);
          setGameState(data);
        }
      } catch (err) {
        console.error('Failed to reset flipped cards:', err);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [gameState, instanceId]);

  const handleCardClick = async (cardId) => {
    if (!gameState || gameState.gameStatus !== 'playing') return;
    if (gameState.flippedCards.length >= 2) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (currentPlayer.id !== currentUser.id) return;

    try {
      const response = await fetch(`/api/game/${instanceId}/flip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, playerId: currentUser.id })
      });

      if (!response.ok) {
        const errorData = await safeJsonParse(response).catch(() => ({ error: 'Unknown error' }));
        console.error(errorData.error);
        return;
      }

      const data = await safeJsonParse(response);
      setGameState(data);
    } catch (err) {
      console.error('Failed to flip card:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading game...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!gameState) {
    return <div className="error">No game state found</div>;
  }

  // Check if we have enough players
  if (gameState.players.length < 2) {
    return (
      <div className="waiting-for-players">
        <h2>Waiting for Players</h2>
        <p>Current players: {gameState.players.length}/4</p>
        <div className="current-players">
          {gameState.players.map(player => (
            <div key={player.id} className="player-badge">
              {player.username}
            </div>
          ))}
        </div>
        <p style={{ marginTop: '20px', color: '#b9bbbe' }}>
          Other players in the voice channel will automatically join when they open the activity.
        </p>
      </div>
    );
  }

  if (gameState.players.length > 4) {
    return (
      <div className="error">
        Too many players! Maximum 4 players allowed.
      </div>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer.id === currentUser.id;

  return (
    <div className="memory-game">
      <div className="game-header">
        <h1>Memory Card Game</h1>
        <div className="players">
          {gameState.players.map((player, index) => (
            <div
              key={player.id}
              className={`player ${index === gameState.currentPlayerIndex ? 'active' : ''} ${player.id === currentUser.id ? 'me' : ''}`}
            >
              <div className="player-name">{player.username}</div>
              <div className="player-score">Score: {player.score}</div>
            </div>
          ))}
        </div>
        {gameState.gameStatus === 'playing' && (
          <div className="turn-indicator">
            {isMyTurn ? (
              <p className="your-turn">🎯 Your Turn!</p>
            ) : (
              <p>{currentPlayer.username}'s Turn</p>
            )}
          </div>
        )}
        {gameState.gameStatus === 'finished' && (
          <div className="game-over">
            <h2>Game Over!</h2>
            <div className="winners">
              {gameState.players
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <div key={player.id} className="winner">
                    {index === 0 && '🏆 '}
                    {player.username}: {player.score} pairs
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="cards-grid">
        {gameState.cards.map((card) => (
          <div
            key={card.id}
            className={`card ${card.flipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''} ${!isMyTurn || gameState.flippedCards.length >= 2 ? 'disabled' : ''}`}
            onClick={() => handleCardClick(card.id)}
          >
            <div className="card-front">?</div>
            <div className="card-back">{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MemoryGame;
