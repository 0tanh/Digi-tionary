import { useState } from 'react';
import { BrowserProvider } from 'ethers';
import { SiweMessage } from 'siwe';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAddress, setUserAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    setLoading(true);
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        const network = await provider.getNetwork();
        const message = new SiweMessage({
          domain: window.location.host,
          address: address,
          statement: 'Sign in to Digi-tionary',
          uri: window.location.origin,
          version: '1',
          chainId: Number(network.chainId)
        });

        const messageToSign = message.prepareMessage();
        const signature = await signer.signMessage(messageToSign);
        
        const response = await fetch('/api/auth/siwe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: messageToSign, signature })
        });

        if (response.ok) {
          setUserAddress(address);
          setIsAuthenticated(true);
        } else {
          alert('Authentication failed');
        }
      } else {
        alert('Please install MetaMask or another Web3 wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSSOLogin = async () => {
    setLoading(true);
    try {
      window.location.href = '/api/auth/sso';
    } catch (error) {
      console.error('SSO error:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setUserAddress('');
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Digi-tionary
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            You are successfully authenticated
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <p className="text-sm text-gray-500 mb-2">Connected as:</p>
            <p className="text-gray-900 font-mono text-sm break-all">
              {userAddress}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Digi-tionary</h1>
          <p className="text-gray-400">Sign in to continue</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={connectWallet}
            disabled={loading}
            className="w-full bg-white text-black py-4 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <span>Connecting...</span>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 256 417" fill="none">
                  <path d="M127.961 0L125.813 7.333V285.168L127.961 287.314L255.922 212.165L127.961 0Z" fill="#343434"/>
                  <path d="M127.962 0L0 212.165L127.962 287.314V153.448V0Z" fill="#8C8C8C"/>
                  <path d="M127.961 312.187L126.781 313.587V406.603L127.961 416.999L256 237.062L127.961 312.187Z" fill="#3C3C3B"/>
                  <path d="M127.962 416.999V312.187L0 237.062L127.962 416.999Z" fill="#8C8C8C"/>
                  <path d="M127.961 287.314L255.922 212.165L127.961 153.448V287.314Z" fill="#141414"/>
                  <path d="M0 212.165L127.962 287.314V153.448L0 212.165Z" fill="#393939"/>
                </svg>
                Sign in with Ethereum
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black text-gray-400">or</span>
            </div>
          </div>

          <button
            onClick={handleSSOLogin}
            disabled={loading}
            className="w-full bg-gray-800 text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in with SSO'}
          </button>
        </div>

        <p className="text-gray-500 text-sm text-center mt-8">
          By signing in, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
