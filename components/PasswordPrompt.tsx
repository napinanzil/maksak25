import React, { useState } from 'react';

interface PasswordPromptProps {
  onAuthSuccess: () => void;
}

const CORRECT_PASSWORD = 'KKMG2005';

const PasswordPrompt: React.FC<PasswordPromptProps> = ({ onAuthSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setError('');
      onAuthSuccess();
    } else {
      setError('Kata laluan salah. Sila cuba lagi.');
      setPassword('');
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-mak-gold mb-4">Akses Terhad</h2>
        <p className="text-gray-400 mb-6">Sila masukkan kata laluan untuk mengakses halaman ini.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Kata Laluan"
            className="w-full bg-gray-700 border-2 border-gray-600 focus:border-mak-gold focus:ring-mak-gold rounded-md py-2 px-4 text-white placeholder-gray-400 transition duration-300 text-center"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-mak-blue hover:bg-blue-800 text-white font-bold py-2.5 px-6 rounded-md shadow-sm transition-colors duration-300"
          >
            Sahkan
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordPrompt;
