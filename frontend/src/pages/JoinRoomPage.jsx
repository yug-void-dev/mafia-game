import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, LogIn, AlertTriangle, ShieldCheck, MapPin, X, Users } from 'lucide-react';

const MAPS = [
  { id: 'all', name: 'All Maps', desc: 'Display rooms from all environments.', icon: '🌍' },
  { id: 'city', name: 'City Nights', desc: 'Neon-lit alleys and urban crime.', icon: '🏙️' },
  { id: 'village', name: 'Cursed Village', desc: 'Foggy hamlet with dark secret spells.', icon: '🏘️' },
  { id: 'forest', name: 'Dark Forest', desc: 'Dense spooky woods with no escape.', icon: '🌲' },
  { id: 'docks', name: 'Harbor Docks', desc: 'Mist waterfront and pirate docks.', icon: '⚓' },
  { id: 'casino', name: 'Casino Royale', desc: 'Underground high-stakes gambling.', icon: '🎰' },
  { id: 'mansion', name: 'Old Mansion', desc: 'Classic gothic dark headquarters.', icon: '🏛️' },
];

const INITIAL_ROOMS = [
  { id: 101, name: 'Viper\'s Hideout', host: 'ViperEye', players: 6, max: 8, status: 'Waiting', mapId: 'village', mode: 'Classic' },
  { id: 102, name: 'Godfather Assemble', host: 'TheGodfather', players: 9, max: 10, status: 'Waiting', mapId: 'mansion', mode: 'Classic' },
  { id: 103, name: 'Quick Shot 44', host: 'BulletTracer', players: 3, max: 6, status: 'Waiting', mapId: 'city', mode: 'Quick' },
  { id: 104, name: 'Midnight Ritual', host: 'Necromancer', players: 5, max: 8, status: 'Waiting', mapId: 'forest', mode: 'Custom' },
  { id: 105, name: 'High Rollers Only', host: 'CasinoRoyaleHost', players: 7, max: 8, status: 'In Progress', mapId: 'casino', mode: 'Classic' },
  { id: 106, name: 'Smugglers Cove', host: 'PirateCaptain', players: 4, max: 8, status: 'Waiting', mapId: 'docks', mode: 'Classic' },
  { id: 107, name: 'Village Witchcraft', host: 'WitchDoctor', players: 2, max: 6, status: 'Waiting', mapId: 'village', mode: 'Quick' },
];

export default function JoinRoomPage() {
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMapFilter, setSelectedMapFilter] = useState('all');
  const [matchingOverlay, setMatchingOverlay] = useState(false);
  const [matchedRoom, setMatchedRoom] = useState(null);

  // Filter Rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesSearch = 
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        room.host.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesMap = selectedMapFilter === 'all' || room.mapId === selectedMapFilter;

      return matchesSearch && matchesMap;
    });
  }, [rooms, searchQuery, selectedMapFilter]);

  // Quick Match trigger
  const handleQuickMatch = () => {
    setMatchingOverlay(true);
    setMatchedRoom(null);

    // Simulate search spinner delay
    setTimeout(() => {
      // Find nearest waiting room that is not full
      const available = filteredRooms.filter(r => r.status === 'Waiting' && r.players < r.max);
      if (available.length > 0) {
        // Pick the one with highest players to fill faster
        const bestRoom = [...available].sort((a, b) => b.players - a.players)[0];
        setMatchedRoom(bestRoom);
      } else {
        setMatchedRoom({ error: 'No available rooms found matching filters.' });
      }
    }, 2200);
  };

  return (
    <div className="page-scroll" style={{
      width: '100%', height: '100%',
      padding: '24px 40px 100px 40px',
      color: '#fff',
      display: 'flex', flexDirection: 'column', gap: 24,
    }}>
      {/* Page Title */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
      >
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '0.12em', color: '#ff4455' }}>
          JOIN CONTRACT LOBBY
        </h1>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Infiltrate active lobbies or initialize a matchmaking scan</span>
      </motion.div>

      {/* Grid: Left Map Filters, Right Rooms list */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: 24,
        alignItems: 'start',
      }}>
        {/* LEFT COLUMN: Map Filters */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-panel"
          style={{
            padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
            background: 'rgba(10,5,15,0.85)',
            border: '1.5px solid rgba(120,40,60,0.25)',
          }}
        >
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, letterSpacing: '0.08em', color: '#ff4455' }}>
            MAP SELECTOR FILTER
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MAPS.map(m => {
              const isSelected = selectedMapFilter === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMapFilter(m.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    borderRadius: 8, border: isSelected ? '1.5px solid #ff3344' : '1px solid rgba(255,255,255,0.04)',
                    background: isSelected ? 'rgba(255,20,40,0.08)' : 'rgba(255,255,255,0.01)',
                    color: isSelected ? '#fff' : 'var(--text-muted)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)';
                  }}
                >
                  <span style={{ fontSize: 20 }}>{m.icon}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <span style={{ fontWeight: 700, fontSize: 12.5, color: isSelected ? '#ff4455' : '#eee' }}>{m.name}</span>
                    <span style={{ fontSize: 9.5, color: 'var(--text-muted)', display: 'block', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Rooms Search and List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Search bar & Quick Match button */}
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 16 }} />
              <input
                type="text"
                placeholder="Filter by lobby name or host..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-dark"
                style={{ paddingLeft: 44, height: 46 }}
              />
            </div>
            <button 
              onClick={handleQuickMatch}
              className="btn-primary" 
              style={{ gap: 8, padding: '0 24px', flexShrink: 0, height: 46 }}
            >
              <Sparkles size={16} /> QUICK MATCH
            </button>
          </div>

          {/* Rooms List */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="glass-panel"
            style={{
              padding: 24, display: 'flex', flexDirection: 'column', gap: 12,
              background: 'rgba(10,5,15,0.85)',
              border: '1.5px solid rgba(120,40,60,0.25)',
              minHeight: 300,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 10, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              <span>ACTIVE LOBBIES ({filteredRooms.length})</span>
              <span>FILTER: {MAPS.find(m => m.id === selectedMapFilter)?.name.toUpperCase()}</span>
            </div>

            {filteredRooms.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)', padding: '60px 0' }}>
                <AlertTriangle size={32} color="#cc0020" />
                <span style={{ fontSize: 13 }}>No active rooms match your filters. Try choosing a different map.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredRooms.map(room => {
                  const mapObj = MAPS.find(m => m.id === room.mapId) || { name: 'Old Mansion', icon: '🏛️' };
                  const isFull = room.players >= room.max;
                  const isPlaying = room.status === 'In Progress';
                  const cannotJoin = isFull || isPlaying;

                  return (
                    <div 
                      key={room.id}
                      className="room-card"
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '14px 20px', background: 'rgba(255,255,255,0.02)',
                        opacity: cannotJoin ? 0.6 : 1,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <span style={{ fontSize: 26 }}>{mapObj.icon}</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 700, color: '#fff', fontSize: 14.5 }}>{room.name}</span>
                            <span style={{ fontSize: 9.5, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: 4, color: 'var(--text-muted)' }}>
                              {room.mode.toUpperCase()}
                            </span>
                          </div>
                          <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                            Host: <strong>{room.host}</strong> · Map: <strong>{mapObj.name}</strong>
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: isFull ? '#ff4455' : '#ddd' }}>
                          <Users size={14} color={isFull ? '#ff4455' : '#aaa'} />
                          {room.players}/{room.max}
                        </div>

                        <div style={{
                          fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
                          color: isPlaying ? '#ff4455' : '#5ad15a',
                          background: isPlaying ? 'rgba(255,20,40,0.08)' : 'rgba(90,200,100,0.08)',
                          border: `1px solid ${isPlaying ? 'rgba(255,20,40,0.2)' : 'rgba(90,200,100,0.2)'}`,
                          padding: '3px 8px', borderRadius: 4,
                          minWidth: 84, textAlign: 'center'
                        }}>
                          {room.status.toUpperCase()}
                        </div>

                        <button 
                          className={cannotJoin ? 'btn-ghost' : 'btn-primary'}
                          disabled={cannotJoin}
                          style={{
                            padding: '8px 16px', fontSize: 12, height: 36,
                            border: cannotJoin ? '1px solid rgba(255,255,255,0.05)' : '1.5px solid var(--blood)',
                          }}
                        >
                          <LogIn size={13} /> JOIN
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* MATCHMAKING RADAR SPIN OVERLAY */}
      <AnimatePresence>
        {matchingOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(2, 1, 6, 0.9)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass-panel"
              style={{
                width: '100%', maxWidth: 440,
                border: '2px solid rgba(120,40,60,0.4)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                padding: 32, borderRadius: 16,
                background: 'linear-gradient(135deg,#130a18,#0a050f)',
                textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 20,
                alignItems: 'center', position: 'relative',
              }}
            >
              {/* Close scanner */}
              <button 
                onClick={() => setMatchingOverlay(false)}
                style={{
                  position: 'absolute', top: 16, right: 16,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}
              >
                <X size={20} />
              </button>

              {!matchedRoom ? (
                <>
                  {/* Matching radar animation */}
                  <div style={{ position: 'relative', width: 90, height: 90, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: '50%',
                      border: '2.5px dashed #ff3344',
                      animation: 'spin-slow 4s linear infinite',
                    }} />
                    <div style={{
                      position: 'absolute', inset: 12, borderRadius: '50%',
                      border: '1.5px dashed rgba(255,255,255,0.1)',
                      animation: 'spin-slow 6s linear infinite reverse',
                    }} />
                    <Sparkles size={32} color="#ff3344" className="animate-flicker" />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#ff3344', letterSpacing: '0.08em', marginBottom: 4 }}>
                      MATCHMAKING ACTIVE
                    </h3>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Scanning nodes for open lobbies...</span>
                  </div>
                </>
              ) : matchedRoom.error ? (
                <>
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%',
                    background: 'rgba(200,20,40,0.15)',
                    border: '2.5px solid #ff3344',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24,
                  }}>
                    ⚠️
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#ff3344', marginBottom: 4 }}>
                      SCAN FAILED
                    </h3>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{matchedRoom.error}</span>
                  </div>
                  <button onClick={() => setMatchingOverlay(false)} className="btn-secondary" style={{ width: '100%' }}>
                    CANCEL SCAN
                  </button>
                </>
              ) : (
                <>
                  <div style={{
                    width: 60, height: 60, borderRadius: '50%',
                    background: 'rgba(90,200,100,0.15)',
                    border: '2.5px solid #5ad15a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <ShieldCheck size={32} color="#5ad15a" />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#5ad15a', marginBottom: 4 }}>
                      TARGET ACQUIRED!
                    </h3>
                    <span style={{ fontSize: 12.5, color: '#fff', fontWeight: 600 }}>{matchedRoom.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>
                      Host: {matchedRoom.host} · Mode: {matchedRoom.mode}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 12, width: '100%', marginTop: 8 }}>
                    <button onClick={() => setMatchingOverlay(false)} className="btn-secondary" style={{ flex: 1 }}>
                      CANCEL
                    </button>
                    <button className="btn-primary" style={{ flex: 1, padding: '10px 16px' }}>
                      CONNECT
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
