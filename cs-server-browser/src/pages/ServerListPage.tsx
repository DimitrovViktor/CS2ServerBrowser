import React, { useState } from 'react';
import { FaCrown, FaUsers } from 'react-icons/fa';
import { useServers } from '../hooks/useServers';
import ServerRow from '../components/ServerRow';
import Header from '../components/Header';
import InfoBoxes from '../components/InfoBoxes';
import StatsBar from '../components/StatsBar';
import type { Server } from '../types/server';

const ServerListPage: React.FC = () => {
  const { data: servers, isLoading, error } = useServers();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [statsBarVisible, setStatsBarVisible] = useState(true);

  // InfoBox click handler
  const handleModeClick = (mode: string) => {
    setFilterMode(prev => (prev === mode ? 'all' : mode));
  };

  // Listen for toggleStats button click
  React.useEffect(() => {
    const btn = document.getElementById('toggleStats');
    if (btn) {
      btn.onclick = () => setStatsBarVisible(v => !v);
    }
    return () => {
      if (btn) btn.onclick = null;
    };
  }, []);

  if (isLoading) return <div className="loading">Loading servers...</div>;
  if (error) return <div className="error">Error loading servers</div>;

  console.log('servers from API:', servers);

  const serverList: Server[] = servers ? (servers as Server[]) : [];

  const filteredServers = serverList.filter(server => {
    // If 'all' is selected, show all servers
    if (filterMode === 'all') return true;

    // Normalize tags and game_mode for comparison
    const tags = Array.isArray(server.tags)
      ? server.tags.map(tag => String(tag).toLowerCase())
      : [];
    const mode = filterMode.toLowerCase();

    // Match either tag or game_mode
    return tags.includes(mode) ||
      (server.game_mode && server.game_mode.toLowerCase() === mode);
  });

  const premiumServers = filteredServers.filter(server =>
    Array.isArray(server.tags) &&
    server.tags.map(tag => tag.toLowerCase()).includes('premium')
  );
  const communityServers = filteredServers.filter(server =>
    !(
      Array.isArray(server.tags) &&
      server.tags.map(tag => tag.toLowerCase()).includes('premium')
    )
  );

  return (
    <div className="container">
      <div className="header-statsbar-wrapper">
        <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>
      <InfoBoxes activeMode={filterMode} onModeClick={handleModeClick} servers={serverList} />
      
      {/* Premium Servers Section */}
      <div className="server-section">
        <div className="section-header">
          <FaCrown />
          <h2>Premium Servers</h2>
          <div className="badge">VIP ACCESS</div>
        </div>
        <div className="server-list">
          <div className="server-header">
            <div className="header-likes"></div>
            <div>SERVER</div>
            <div>MAP</div>
            <div>MODE</div>
            <div>PLAYERS</div>
            <div>ACTION</div>
            <div></div>
          </div>
          {premiumServers.map(server => (
            <ServerRow key={server.id} server={server} />
          ))}
        </div>
      </div>

      {/* Community Servers Section */}
      <div className="server-section">
        <div className="section-header">
          <FaUsers />
          <h2>Community Servers</h2>
          <div className="badge">TOP RATED</div>
        </div>
        <div className="server-list">
          <div className="server-header">
            <div className="header-likes"></div>
            <div>SERVER</div>
            <div>MAP</div>
            <div>MODE</div>
            <div>PLAYERS</div>
            <div>ACTION</div>
            <div></div>
          </div>
          {communityServers.map(server => (
            <ServerRow key={server.id} server={server} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServerListPage;