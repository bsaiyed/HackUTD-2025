import React from 'react';
import ReactDOM from 'react-dom/client';
import { DiscordSDK } from "@discord/embedded-app-sdk";
import './style.css';
import CardMatchingGame from './CardMatchingGame';

// Instantiate the SDK
const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

function App() {
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    setupDiscordSdk().then(() => {
      console.log("Discord SDK is ready");
      setIsReady(true);
    });
  }, []);

  if (!isReady) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div>
      <CardMatchingGame />
    </div>
  );
}

async function setupDiscordSdk() {
  await discordSdk.ready();
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
