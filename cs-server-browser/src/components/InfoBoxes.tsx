import React from 'react';
import { FaServer, FaUser } from 'react-icons/fa';
import type { Server } from '../types/server';

const MODES = [
  { key: 'Deathmatch', label: 'Deathmatch', img: '/images/test.png' },
  { key: 'Retake', label: 'Retake', img: '/images/test.png' },
  { key: '5v5', label: '5v5', img: '/images/test.png' },
  { key: 'Surf', label: 'Surf', img: '/images/surf.png' },
  { key: 'Bhop', label: 'Bhop', img: '/images/test.png' },
];

interface InfoBoxesProps {
  activeMode: string;
  onModeClick: (mode: string) => void;
  servers: Server[];
}

const InfoBoxes: React.FC<InfoBoxesProps> = ({ activeMode, onModeClick, servers }) => {
  // Calculate counts for each mode
  const getCounts = (modeKey: string) => {
    const modeLower = modeKey.toLowerCase();
    const filtered = servers.filter(server => {
      const tags = Array.isArray(server.tags)
        ? server.tags.map(tag => String(tag).toLowerCase())
        : [];
      return tags.includes(modeLower) ||
        (server.game_mode && server.game_mode.toLowerCase() === modeLower);
    });
    const serverCount = filtered.length;
    const playerCount = filtered.reduce(
      (sum, server) => sum + (server.current_players ?? 0),
      0
    );
    return { serverCount, playerCount };
  };

  return (
    <section className="info-boxes">
      {MODES.map(mode => {
        const { serverCount, playerCount } = getCounts(mode.key);
        return (
          <div
            key={mode.key}
            className={`box${activeMode === mode.key ? ' active' : ''}`}
            onClick={() => onModeClick(mode.key)}
            style={{ cursor: 'pointer' }}
          >
            <div className="box-content">
              <div className="box-text">{mode.label}</div>
              <div className="box-stats" style={{ display: 'flex', justifyContent: 'center', gap: '40px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <FaServer size={28} />
                  <span style={{ marginTop: '6px', fontWeight: 600 }}>{serverCount}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <FaUser size={28} />
                  <span style={{ marginTop: '6px', fontWeight: 600 }}>{playerCount}</span>
                </div>
              </div>
              <img src={mode.img} alt={mode.label} className="box-image" />
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default InfoBoxes;