import React, { useState } from 'react';

interface Props {
  visible: boolean;
  onSubmit: (tray: string, unit: string) => void;
}

export default function PromptModal({ visible, onSubmit }: Props) {
  const [tray, setTray] = useState('');
  const [unit, setUnit] = useState('');

  if (!visible) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg space-y-4">
        <h2 className="text-xl font-semibold">Select Tray & Unit</h2>
        <input
          className="border p-2 w-full"
          placeholder="Tray name"
          value={tray}
          onChange={e => setTray(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          placeholder="Unit name"
          value={unit}
          onChange={e => setUnit(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => onSubmit(tray, unit)}
          disabled={!tray || !unit}
        >
          OK
        </button>
      </div>
    </div>
  );
}
