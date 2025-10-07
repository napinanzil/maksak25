
import React, { useState } from 'react';

interface AddTeamFormProps {
  onAddTeam: (teamName: string) => void;
}

const AddTeamForm: React.FC<AddTeamFormProps> = ({ onAddTeam }) => {
  const [teamName, setTeamName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim()) {
      onAddTeam(teamName.trim());
      setTeamName('');
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
        <label htmlFor="teamName" className="text-lg font-semibold text-mak-gold whitespace-nowrap">Nama Pasukan:</label>
        <input
          id="teamName"
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="e.g., JABATAN X"
          className="flex-grow bg-gray-700 border-2 border-gray-600 focus:border-mak-gold focus:ring-mak-gold rounded-md py-2 px-4 text-white placeholder-gray-400 transition duration-300"
        />
        <button
          type="submit"
          className="w-full sm:w-auto bg-mak-blue hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-md shadow-sm transition-colors duration-300"
        >
          + Tambah Pasukan
        </button>
      </form>
    </div>
  );
};

export default AddTeamForm;
