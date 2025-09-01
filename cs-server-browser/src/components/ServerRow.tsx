import React, { useState } from 'react';
import axios from 'axios';
import { FaHeart, FaServer, FaCopy, FaMap, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { useQueryClient } from '@tanstack/react-query';
import type { Server } from '../types/server';

interface ServerRowProps {
  server: Server;
}

const ServerRow: React.FC<ServerRowProps> = ({ server }) => {
  const [expanded, setExpanded] = useState(false);

  const tags = server.tags ?? [];

  const toggleExpand = () => setExpanded(!expanded);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('IP copied to clipboard!');
    });
  };

  return (
    <div className={`server-row ${expanded ? 'expanded' : ''}`}>
      <div
        className="likes-count"
        title="Total likes"
        style={{ cursor: 'default' }}
      >
        <FaHeart /> {server.likes ?? 0}
      </div>
      <div className="server-info">
        <div className="server-icon">
          <FaServer />
        </div>
        <div className="server-details">
          <h3>
            {server.country_code ? (
              <img
                src={`https://flagcdn.com/16x12/${server.country_code.toLowerCase()}.png`}
                className="flag"
                alt={server.country_code}
              />
            ) : (
              <span className="flag-placeholder" />
            )}
            {server.name}
          </h3>
          <div
            className="server-ip"
            onClick={() => copyToClipboard(`${server.ip}:${server.port}`)}
          >
            {server.ip}:{server.port} <FaCopy />
          </div>
        </div>
      </div>
      <div className="map-info">
        <div className="map-icon">
          <FaMap />
        </div>
        <div>{server.map || server.current_map || 'Unknown'}</div>
      </div>
      <div className="mode-name">
        {server.mode || server.game_mode || tags[0] || 'Unknown'}
      </div>
      <div className="player-count">
        <span>
          {(server.current_players ?? 0)}/{server.max_players ?? 0}
        </span>
        <div
          className="progress"
          style={{
            width: `${
              ((server.current_players ?? 0) / (server.max_players ?? 1)) * 100
            }%`
          }}
        ></div>
      </div>
      <div className="join-btn">
        <button className={(server.current_players ?? 0) >= (server.max_players ?? 0) ? 'full' : ''}>
          {(server.current_players ?? 0) >= (server.max_players ?? 0) ? 'FULL' : 'JOIN'}
        </button>
      </div>
      <div className="expand-btn" onClick={toggleExpand}>
        {expanded ? <FaChevronUp /> : <FaChevronDown />}
      </div>
      {expanded && (
        <div className="server-expanded-content">
          <div className="server-banner">
            {server.banner_url ? (
              <img
                src={server.banner_url}
                alt="Server Banner"
                style={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: 'var(--border-radius)'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '150px',
                borderRadius: 'var(--border-radius)',
                background: 'linear-gradient(90deg, #1a2a6c, #b21f1f, #1a2a6c)'
              }} />
            )}
          </div>
          <p className="server-description">{server.description}</p>
          <div className="server-tags">
            {tags.map(tag => (
              <div key={tag} className="tag">{tag}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerRow;