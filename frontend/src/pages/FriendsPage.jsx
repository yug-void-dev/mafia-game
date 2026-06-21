import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, UserCheck, UserX, Search, MessageSquare, ShieldAlert, Sparkles } from 'lucide-react';

const INITIAL_FRIENDS = [
  { id: 1, name: 'GhostRider', level: 12, online: true, rank: 'Gold' },
  { id: 2, name: 'ViperEye', level: 9, online: true, rank: 'Silver' },
  { id: 3, name: 'SilentNight', level: 5, online: false, rank: 'Bronze' },
  { id: 4, name: 'CrimsonBlade', level: 15, online: false, rank: 'Diamond' },
];

const INITIAL_REQUESTS = [
  { id: 101, name: 'Nightstalker', level: 6, rank: 'Bronze' },
  { id: 102, name: 'PoisonIvy', level: 8, rank: 'Silver' },
];

export default function FriendsPage() {
  const [friends, setFriends] = useState(INITIAL_FRIENDS);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null); // null | { name, level, found: boolean }
  const [notification, setNotification] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Simulate search API
    const name = searchQuery.trim();
    const alreadyFriend = friends.some(f => f.name.toLowerCase() === name.toLowerCase());
    const alreadyPending = requests.some(r => r.name.toLowerCase() === name.toLowerCase());

    if (alreadyFriend) {
      setSearchResult({ name, error: 'Already your friend', found: false });
    } else if (alreadyPending) {
      setSearchResult({ name, error: 'Already has a pending request', found: false });
    } else if (name.toLowerCase() === 'shadow') {
      setSearchResult({ name, error: 'Cannot add yourself', found: false });
    } else {
      // Simulate finding a player
      setSearchResult({ 
        name, 
        level: Math.floor(Math.random() * 15) + 2, 
        rank: ['Bronze', 'Silver', 'Gold', 'Diamond'][Math.floor(Math.random() * 4)],
        found: true 
      });
    }
  };

  const sendRequest = (targetPlayer) => {
    showNotification(`Friend request sent to ${targetPlayer.name}!`);
    setSearchResult(null);
    setSearchQuery('');
  };

  const acceptRequest = (id, name) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    // Add to friends
    const newFriend = {
      id: Date.now(),
      name,
      level: Math.floor(Math.random() * 8) + 4,
      online: true,
      rank: 'Silver'
    };
    setFriends(prev => [newFriend, ...prev]);
    showNotification(`Accepted ${name}'s request!`);
  };

  const declineRequest = (id, name) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    showNotification(`Declined ${name}'s request.`);
  };

  const inviteFriend = (name) => {
    showNotification(`Invited ${name} to your room!`);
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="page-scroll" style={{
      width: '100%', height: '100%',
      padding: '24px 40px 100px 40px',
      color: '#fff',
      display: 'flex', flexDirection: 'column', gap: 24,
    }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              position: 'fixed', top: 90, left: '50%', transform: 'translateX(-50%)',
              zIndex: 100, background: 'rgba(200,20,40,0.95)', color: '#fff',
              padding: '10px 24px', borderRadius: 8, fontWeight: 700, fontSize: 13,
              boxShadow: '0 0 20px rgba(255,20,40,0.5)', border: '1px solid #ff4444',
              fontFamily: 'var(--font-display)', letterSpacing: '0.05em',
            }}
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Title */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
      >
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '0.12em', color: '#ff4455' }}>
          SOCIAL HUB
        </h1>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Manage your allies, review pending alerts, and invite them to play</span>
      </motion.div>

      {/* Grid Layout: Left Add Friend, Right List & Requests */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '340px 1fr',
        gap: 24,
        alignItems: 'start',
      }}>
        {/* LEFT COLUMN: Search & Add Friend */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-panel"
          style={{
            padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
            background: 'rgba(10,5,15,0.85)',
            border: '1.5px solid rgba(120,40,60,0.25)',
          }}
        >
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.08em', color: '#ff4455' }}>
            FIND SURVIVORS
          </h3>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Search username..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-dark"
              style={{ flex: 1 }}
            />
            <button className="btn-primary" style={{ padding: '0 14px', borderRadius: 8 }} type="submit">
              <Search size={16} />
            </button>
          </form>

          {/* Search Result */}
          {searchResult && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8, padding: 16,
                display: 'flex', flexDirection: 'column', gap: 12,
              }}
            >
              {searchResult.found ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{searchResult.name}</span>
                      <span style={{ fontSize: 10.5, color: 'var(--text-muted)', display: 'block' }}>
                        LVL {searchResult.level} · {searchResult.rank}
                      </span>
                    </div>
                    <span style={{ fontSize: 18 }}>🎭</span>
                  </div>
                  <button 
                    onClick={() => sendRequest(searchResult)}
                    className="btn-primary" 
                    style={{ width: '100%', padding: '10px', fontSize: 13, gap: 6 }}
                  >
                    <UserPlus size={15} /> SEND REQUEST
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ff4455', fontSize: 12.5 }}>
                  <ShieldAlert size={16} />
                  <span>{searchResult.error || 'Player not found'}</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Tips */}
          <div style={{
            fontSize: 11, color: 'var(--text-muted)', lineHeight: '1.4',
            background: 'rgba(255,255,255,0.01)', padding: 12, borderRadius: 6,
          }}>
            ℹ️ Friend requests expire after 7 days. Make sure to invite your friends to custom rooms to unlock multiplayer achievements together!
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Incoming Requests & Friends List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* FRIEND REQUESTS (Incoming) */}
          {requests.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="glass-panel"
              style={{
                padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
                background: 'rgba(20,5,10,0.85)',
                border: '1.5px solid rgba(180,40,60,0.3)',
                boxShadow: '0 8px 30px rgba(180,0,20,0.1)',
              }}
            >
              <h3 style={{ 
                fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.08em', color: '#ff3344',
                display: 'flex', alignItems: 'center', gap: 8 
              }}>
                <Sparkles size={16} className="animate-flicker" /> INCOMING REQUESTS ({requests.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {requests.map(req => (
                  <div 
                    key={req.id}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{req.name}</span>
                      <span style={{ fontSize: 10.5, color: 'var(--text-muted)', display: 'block' }}>
                        LVL {req.level} · {req.rank}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        onClick={() => acceptRequest(req.id, req.name)}
                        className="btn-secondary" 
                        style={{ padding: '8px 12px', borderColor: 'rgba(90,200,100,0.4)', color: '#5ad15a' }}
                      >
                        <UserCheck size={14} /> ACCEPT
                      </button>
                      <button 
                        onClick={() => declineRequest(req.id, req.name)}
                        className="btn-ghost" 
                        style={{ padding: '8px 12px', color: '#c88a8a', borderColor: 'rgba(200,80,80,0.2)' }}
                      >
                        <UserX size={14} /> DECLINE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* FRIENDS LIST */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-panel"
            style={{
              padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
              background: 'rgba(10,5,15,0.85)',
              border: '1.5px solid rgba(120,40,60,0.25)',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.08em', color: '#ff4455' }}>
              FRIENDS LIST ({friends.length})
            </h3>

            {friends.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0', fontSize: 13 }}>
                You have no friends on your roster yet. Search players on the left to build your alliance!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {friends.map(friend => (
                  <div 
                    key={friend.id}
                    className="friend-row"
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'rgba(255,255,255,0.02)', padding: '12px 16px',
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Online dot indicator overlay */}
                      <div style={{
                        position: 'relative', width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#1c0a22,#0a030c)',
                        border: '1.5px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16,
                      }}>
                        🎭
                        <span style={{
                          position: 'absolute', bottom: -1, right: -1,
                          width: 10, height: 10, borderRadius: '50%',
                          background: friend.online ? '#5ad15a' : '#776a70',
                          border: '2px solid #0c0812',
                        }} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontWeight: 700, color: friend.online ? '#fff' : 'var(--text-muted)', fontSize: 14 }}>
                          {friend.name}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                          LVL {friend.level} · {friend.rank}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ 
                        fontSize: 9.5, letterSpacing: '0.06em', 
                        color: friend.online ? '#5ad15a' : 'var(--text-muted)',
                        fontWeight: 700, marginRight: 8
                      }}>
                        {friend.online ? 'ONLINE' : 'OFFLINE'}
                      </span>
                      {friend.online && (
                        <button 
                          onClick={() => inviteFriend(friend.name)}
                          className="btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: 11, border: '1px solid rgba(120,80,180,0.5)' }}
                        >
                          <MessageSquare size={12} /> INVITE
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
