import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { FaPlus } from 'react-icons/fa';
import { FaPen } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

const AddServerPage: React.FC = () => {
  const { user, token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [myServers, setMyServers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editServer, setEditServer] = useState<any>(null);
  const [editBannerPreview, setEditBannerPreview] = useState<string | null>(null);
  const [editBannerFile, setEditBannerFile] = useState<File | null>(null);
  // Handle banner change in edit modal
  const handleEditBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditBannerFile(file);
      const reader = new FileReader();
      reader.onload = ev => {
        setEditBannerPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    owner_id: user?.id || null,
    name: '',
    ip: '',
    port: 27015,
    description: '',
    country_code: '',
    game: '',           // Added
    prime: '',          // Added
    tags: '',
    banner: '',
    game_mode: ''
  });

  const gamemodes = [
    'Deathmatch',
    'Retake',
    '5v5',
    'Surf',
    'Bhop'
  ];

  const games = ['CSGO', 'CS2']; // Added
  const primes = ['Yes', 'No'];  // Added

  // Fetch user's servers
  useEffect(() => {
    if (!user || !token) return;
    setLoading(true);
    axios
      .get(`http://localhost:3001/api/servers?owner_id=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setMyServers(res.data.filter((s: any) => s.owner_id === user.id));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, token]);

  // Handle banner upload (file selection)
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = ev => {
        setBannerPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      alert('You must be logged in to add a server.');
      return;
    }
    let banner_url = '';
    if (bannerFile) {
      const formDataImg = new FormData();
      formDataImg.append('banner', bannerFile);
      try {
        const res = await axios.post('http://localhost:3001/api/upload/banner', formDataImg, {
          headers: { Authorization: `Bearer ${token}` }
        });
        banner_url = res.data.banner_url;
      } catch {
        alert('Failed to upload banner image.');
        return;
      }
    }
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        owner_id: user.id,
        banner_url
      };
      const res = await axios.post('http://localhost:3001/api/servers', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyServers(prev => [...prev, res.data]);
      setShowModal(false);
      setFormData({
        owner_id: user.id,
        name: '',
        ip: '',
        port: 27015,
        description: '',
        country_code: '',
        game: '',
        prime: '',
        tags: '',
        banner: '',
        game_mode: ''
      });
      setBannerPreview(null);
      setBannerFile(null);
    } catch (error) {
      alert('Failed to add server.');
    }
  };

  // Close edit modal
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditServer(null);
  };

  // Open edit modal
  const openEditModal = (server: any) => {
    setEditServer(server);
    setEditTags(Array.isArray(server.tags) ? server.tags : (typeof server.tags === 'string' ? server.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []));
    setShowEditModal(true);
  };

  if (!user) {
    return (
      <>
        <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <div className="container">
          <div className="form-card">
            <h1>Add New Server</h1>
            <p>You must be logged in to add a server.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="container">
        {/* Empty State */}
        {loading ? (
          <div style={{ color: '#b0b0b0', textAlign: 'center', marginTop: 60 }}>Loading...</div>
        ) : myServers.length === 0 ? (
          <div className="empty-state" style={{ margin: '60px auto', maxWidth: 500 }}>
            <i className="fas fa-server" style={{ fontSize: 48, color: 'var(--accent-primary)' }} />
            <h2>You haven't registered any servers yet</h2>
            <p>Add your first server to get started!</p>
            <button className="add-server-btn" onClick={() => setShowModal(true)}>
              <span style={{ color: 'var(--accent-primary)', marginRight: 8, display: 'inline-flex', verticalAlign: 'middle' }}>
                <FaPlus />
              </span>
              Add Server
            </button>
          </div>
        ) : (
          <>
            <div className="section-header" style={{ marginTop: 40 }}>
              <i className="fas fa-heart" />
              <h2>My Servers</h2>
              <button className="add-server-btn" onClick={() => setShowModal(true)}>
                <span style={{ marginRight: 8, display: 'inline-flex', verticalAlign: 'middle' }}>
                  <FaPlus />
                </span>
                Add Server
              </button>
            </div>
            <div className="server-list">
              <div className="server-header my-servers-header" style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 2fr 1fr' }}>
                <div>NAME</div>
                <div>IP</div>
                <div>PORT</div>
                <div>COUNTRY</div>
                <div>GAME</div>
                <div>PRIME</div>
                <div>BANNER</div>
                <div>ACTIONS</div>
              </div>
              {myServers.map(server => (
                <div className="server-row my-server-row" key={server.id} style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr 2fr 1fr' }}>
                  <div>{server.name}</div>
                  <div>{server.ip}</div>
                  <div>{server.port}</div>
                  <div>{server.country_code}</div>
                  <div>{server.game}</div>
                  <div>{server.prime}</div>
                  <div>
                    {server.banner_url ? (
                      <img src={server.banner_url} alt="Banner" style={{ width: '100%', maxWidth: 160, height: 40, objectFit: 'cover', borderRadius: 8 }} />
                    ) : (
                      <span style={{ color: '#777' }}>No Banner</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      className="icon-btn edit-btn"
                      title="Edit"
                      onClick={() => openEditModal(server)}
                    >
                      <FaPen />
                    </button>
                    <button
                      className="icon-btn delete-btn"
                      title="Delete"
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this server?')) {
                          try {
                            await axios.delete(`http://localhost:3001/api/servers/${server.id}`, {
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            setMyServers(prev => prev.filter(s => s.id !== server.id));
                          } catch {
                            alert('Failed to delete server.');
                          }
                        }
                      }}
                    >
                      <MdDeleteForever />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modal for adding server */}
        {showModal && (
          <div className="modal" style={{ display: 'block' }}>
            <div className="modal-content" style={{ maxWidth: 600, margin: '4rem auto' }}>
              <div className="modal-header">
                <h2>Add New Server</h2>
                <button className="close-modal" onClick={() => setShowModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Server Name</label>
                    <input
                      className="form-input"
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>IP</label>
                    <input
                      className="form-input"
                      type="text"
                      value={formData.ip}
                      onChange={e => setFormData({ ...formData, ip: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Port</label>
                    <input
                      className="form-input"
                      type="number"
                      value={formData.port}
                      onChange={e => setFormData({ ...formData, port: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      className="form-input"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      className="form-input"
                      type="text"
                      value={formData.country_code}
                      onChange={e => setFormData({ ...formData, country_code: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Game</label>
                    <select
                      className="form-input"
                      value={formData.game}
                      onChange={e => setFormData({ ...formData, game: e.target.value })}
                      required
                    >
                      <option value="">Select Game</option>
                      {games.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Prime</label>
                    <select
                      className="form-input"
                      value={formData.prime}
                      onChange={e => setFormData({ ...formData, prime: e.target.value })}
                      required
                    >
                      <option value="">Select Prime Status</option>
                      {primes.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tags (comma separated)</label>
                    <input
                      className="form-input"
                      type="text"
                      value={formData.tags}
                      onChange={e => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="e.g., 128-tick, competitive, EU"
                    />
                  </div>
                  <div className="form-group">
                    <label>Server Banner (image/gif)</label>
                    <input
                      className="form-input"
                      type="file"
                      accept="image/*,image/gif"
                      onChange={handleBannerChange}
                    />
                    {bannerPreview && (
                      <img
                        src={bannerPreview}
                        alt="Banner Preview"
                        style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 12, marginTop: 10 }}
                      />
                    )}
                  </div>
                  <div className="form-group">
                    <label>Gamemode</label>
                    <select
                      className="form-input"
                      value={formData.game_mode}
                      onChange={e => setFormData({ ...formData, game_mode: e.target.value })}
                      required
                    >
                      <option value="">Select Gamemode</option>
                      {gamemodes.map(mode => (
                        <option key={mode} value={mode}>{mode}</option>
                      ))}
                    </select>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="Or enter custom mode"
                      value={formData.game_mode}
                      onChange={e => setFormData({ ...formData, game_mode: e.target.value })}
                      style={{ marginTop: 8 }}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={() => { setShowModal(false); setBannerPreview(null); }}>
                      Cancel
                    </button>
                    <button className="save-btn" type="submit">Add Server</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal for editing server */}
        {showEditModal && editServer && (
          <div className="modal" style={{ display: 'block' }}>
            <div className="modal-content" style={{ maxWidth: 600, margin: '4rem auto' }}>
              <div className="modal-header">
                <h2>Edit Server</h2>
                <button className="close-modal" onClick={closeEditModal}>&times;</button>
              </div>
              <div className="modal-body">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    let banner_url = editServer.banner_url;
                    if (editBannerFile) {
                      const formDataImg = new FormData();
                      formDataImg.append('banner', editBannerFile);
                      formDataImg.append('old_banner_url', editServer.banner_url || '');
                      try {
                        const res = await axios.post('http://localhost:3001/api/upload/banner', formDataImg, {
                          headers: { Authorization: `Bearer ${token}` }
                        });
                        banner_url = res.data.banner_url;
                      } catch {
                        alert('Failed to upload new banner image.');
                        return;
                      }
                    }
                    try {
                      const payload = {
                        name: editServer.name,
                        ip: editServer.ip,
                        port: editServer.port,
                        description: editServer.description,
                        country_code: editServer.country_code,
                        game: editServer.game,
                        prime: editServer.prime,
                        game_mode: editServer.game_mode,
                        banner_url,
                        tags: editTags
                      };
                      const res = await axios.put(
                        `http://localhost:3001/api/servers/${editServer.id}`,
                        payload,
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                      setMyServers((prev) =>
                        prev.map((s) => (s.id === editServer.id ? res.data : s))
                      );
                      closeEditModal();
                    } catch {
                      alert('Failed to update server.');
                    }
                  }}
                >
                  {/* Example fields, add more as needed */}
                  <div className="form-group">
                    <label>Server Name</label>
                    <input
                      className="form-input"
                      type="text"
                      value={editServer.name}
                      onChange={(e) =>
                        setEditServer({ ...editServer, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>IP</label>
                    <input
                      className="form-input"
                      type="text"
                      value={editServer.ip}
                      onChange={(e) =>
                        setEditServer({ ...editServer, ip: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Port</label>
                    <input
                      className="form-input"
                      type="number"
                      value={editServer.port}
                      onChange={(e) =>
                        setEditServer({ ...editServer, port: parseInt(e.target.value) })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      className="form-input"
                      value={editServer.description}
                      onChange={(e) =>
                        setEditServer({ ...editServer, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      className="form-input"
                      type="text"
                      value={editServer.country_code}
                      onChange={(e) =>
                        setEditServer({ ...editServer, country_code: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Game</label>
                    <select
                      className="form-input"
                      value={editServer.game}
                      onChange={e =>
                        setEditServer({ ...editServer, game: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Game</option>
                      {games.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Prime</label>
                    <select
                      className="form-input"
                      value={editServer.prime}
                      onChange={e =>
                        setEditServer({ ...editServer, prime: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Prime Status</option>
                      {primes.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Banner</label>
                    <div style={{ marginBottom: 10 }}>
                      {(editBannerPreview || editServer.banner_url) ? (
                        <img
                          src={editBannerPreview || editServer.banner_url}
                          alt="Banner Preview"
                          style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 12, marginBottom: 10 }}
                        />
                      ) : (
                        <span style={{ color: '#777' }}>No Banner</span>
                      )}
                    </div>
                    <input
                      className="form-input"
                      type="file"
                      accept="image/*,image/gif"
                      onChange={handleEditBannerChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tags</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                      {editTags.map((tag, idx) => (
                        <span key={idx} className="tag" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(74,134,232,0.15)', color: 'var(--accent-primary)', padding: '5px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 500 }}>
                          {tag}
                          <button type="button" style={{ marginLeft: 6, background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: 16 }} onClick={() => setEditTags(editTags.filter((_, i) => i !== idx))}>&times;</button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Add tag"
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                        onKeyDown={e => {
                          if ((e.key === 'Enter' || e.key === ',') && newTag.trim()) {
                            e.preventDefault();
                            if (!editTags.includes(newTag.trim())) {
                              setEditTags([...editTags, newTag.trim()]);
                            }
                            setNewTag('');
                          }
                        }}
                      />
                      <button type="button" className="save-btn" style={{ padding: '0 16px', height: 40 }} onClick={() => {
                        if (newTag.trim() && !editTags.includes(newTag.trim())) {
                          setEditTags([...editTags, newTag.trim()]);
                          setNewTag('');
                        }
                      }}>Add</button>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={closeEditModal}>
                      Cancel
                    </button>
                    <button className="save-btn" type="submit">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AddServerPage;