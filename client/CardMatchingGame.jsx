import React, { useState, useEffect } from 'react';
import Card from './Card';
import './CardMatchingGame.css';

// Word pairs for matching
const WORD_PAIRS = [
  { id: 1, word: 'Apple' },
  { id: 2, word: 'Apple' },
  { id: 3, word: 'Banana' },
  { id: 4, word: 'Banana' },
  { id: 5, word: 'Cherry' },
  { id: 6, word: 'Cherry' },
  { id: 7, word: 'Dragon' },
  { id: 8, word: 'Dragon' },
  { id: 9, word: 'Elephant' },
  { id: 10, word: 'Elephant' },
  { id: 11, word: 'Forest' },
  { id: 12, word: 'Forest' },
  { id: 13, word: 'Guitar' },
  { id: 14, word: 'Guitar' },
  { id: 15, word: 'Hockey' },
  { id: 16, word: 'Hockey' },
];

function CardMatchingGame() {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize game - shuffle cards
  useEffect(() => {
    startNewGame();
  }, []);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startNewGame = () => {
    const shuffled = shuffleArray(WORD_PAIRS);
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoves(0);
    setGameWon(false);
    setIsProcessing(false);
  };

  const handleCardClick = (cardId) => {
    // Don't allow clicks if processing or if card is already flipped/matched
    if (isProcessing || flippedCards.includes(cardId) || matchedPairs.includes(cardId)) {
      return;
    }

    // Don't allow clicking the same card twice
    if (flippedCards.length === 1 && flippedCards[0] === cardId) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    setMoves(moves + 1);

    // If two cards are flipped, check for a match
    if (newFlippedCards.length === 2) {
      setIsProcessing(true);
      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstCardId);
      const secondCard = cards.find(c => c.id === secondCardId);

      setTimeout(() => {
        if (firstCard.word === secondCard.word) {
          // Match found!
          const newMatchedPairs = [...matchedPairs, firstCardId, secondCardId];
          setMatchedPairs(newMatchedPairs);
          setFlippedCards([]);
          
          // Check if game is won
          if (newMatchedPairs.length === cards.length) {
            setGameWon(true);
          }
        } else {
          // No match - flip cards back
          setFlippedCards([]);
        }
        setIsProcessing(false);
      }, 1000);
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>Card Matching Game</h1>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Moves:</span>
            <span className="stat-value">{moves}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Matches:</span>
            <span className="stat-value">{matchedPairs.length / 2}</span>
          </div>
        </div>
        <button className="new-game-btn" onClick={startNewGame}>
          New Game
        </button>
      </div>

      {gameWon && (
        <div className="win-message">
          <h2>🎉 Congratulations! 🎉</h2>
          <p>You won in {moves} moves!</p>
        </div>
      )}

      <div className="cards-grid">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            isFlipped={flippedCards.includes(card.id)}
            isMatched={matchedPairs.includes(card.id)}
            onClick={() => handleCardClick(card.id)}
            disabled={isProcessing}
          />
        ))}
      </div>
    </div>
  );
}

export default CardMatchingGame;

