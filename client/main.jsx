import React from 'react';
import ReactDOM from 'react-dom/client';
import { DiscordSDK } from "@discord/embedded-app-sdk";
import './style.css';
import rocketLogo from '/rocket.png';

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

  return (
    <div>
      <img src={rocketLogo} className="logo" alt="Discord" />
      <h1>Hello, World!</h1>
    </div>
  );
}

async function setupDiscordSdk() {
  await discordSdk.ready();
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
