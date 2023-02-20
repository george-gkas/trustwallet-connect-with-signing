import React from "react";
import { ethers } from "ethers";
import { getTrustWalletInjectedProvider } from "./trustWallet";

const App = () => {
  const [initializing, setInitializing] = React.useState(true);
  const [injectedProvider, setInjectedProvider] = React.useState(null);
  const [initializationError, setInitializationError] = React.useState("");

  const [connected, setConnected] = React.useState(false);
  const [signedMessage, setSignedMessage] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const initializeInjectedProvider = async () => {
      const trustWallet = await getTrustWalletInjectedProvider();

      if (!trustWallet) {
        setInitializationError("Trust Wallet is not installed.");
        setInitializing(false);
        return;
      }

      setInjectedProvider(trustWallet);
      setInitializing(false);
    };

    initializeInjectedProvider();
  }, []);

  const connect = async () => {
    try {
      setError("");

      const addresses = await injectedProvider.request({
        method: "eth_requestAccounts",
      });

      setSignedMessage(await signMessage(addresses[0]))

      setConnected(true);
    } catch (e) {
      console.error(e);
      if (e.code === 4001) {
        setError("User denied connection.");
      }
    }
  };

  const signMessage = async (address) => {
    const ethersProvider = new ethers.providers.Web3Provider(injectedProvider)
    const signer = ethersProvider.getSigner(address)
    const loginMessage = `
      Sign to login

      APP NAME:
      dmail.
    `
    const signature = await signer.signMessage(loginMessage)
    return signature
  };

  if (initializing) {
    return <p>Waiting for provider...</p>;
  }

  if (initializationError) {
    return <p style={{ color: "red" }}>{initializationError}</p>;
  }

  if (connected) {
    return (
      <div>
        <p>Welcome</p>
        <p>Signed message: {signedMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <p style={{ color: "red" }}>{error}</p>
      <button onClick={connect}>Connect</button>
    </div>
  );
};

export default App;
