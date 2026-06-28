import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, LogOut, RefreshCw, Clock, Shield, Swords, Heart, User } from 'lucide-react';
import { getRoomDetails, leaveRoom, startGame } from '../services/roomService.js';

const MAP_META = {
  city:    { name: 'City Nights',    icon: '🏙️', color: '#ff66b2' },
  village: { name: 'Cursed Village', icon: '🏘️', color: '#b0a0d0' },
  forest:  { name: 'Dark Forest',    icon: '🌲', color: '#5ad15a' },
  harbor:  { name: 'Harbor Docks',   icon: '⚓', color: '#a8d8f0' },
  casino:  { name: 'Casino Royale',  icon: '🎰', color: '#f0c848' },
  mansion: { name: 'Old Mansion',    icon: '🏛️', color: '#ff4455' },
};

const ROLE_ICONS = {
  mafia:    { icon: <Swords size={14} />,  label: 'Mafia',    color: '#ff4455' },
  police:   { icon: <Shield size={14} />,  label: 'Police',   color: '#4488ff' },
  doctor:   { icon: <Heart size={14} />,   label: 'Doctor',   color: '#44cc88' },
  villager: { icon: <User size={14} />,    label: 'Villager', color: '#aaaaaa' },
};

export default function RoomLobbyPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [leaveError, setLeaveError] = useState(null);

  // Derive current user id from JWT stored in localStorage
  const currentUserId = (() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      return JSON.parse(atob(token.split('.')[1]))._id;
    } catch {
      return null;
    }
  })();

  const fetchRoom = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await getRoomDetails(token, roomId);
      setRoom(response.data.room);
      setFetchError(null);
    } catch (err) {
      if (err?.response?.status === 404) {
        setFetchError('This room no longer exists.');
      } else {
        setFetchError('Could not load room details.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  // Initial load + auto-refresh every 5 seconds
  useEffect(() => {
    fetchRoom();
    const interval = setInterval(fetchRoom, 5000);
    return () => clearInterval(interval);
  }, [fetchRoom]);

  // Auto-redirect to loading screen if game started
  useEffect(() => {
    if (room?.gameStarted) {
      navigate(`/loading/${roomId}`);
    }
  }, [room?.gameStarted, navigate, roomId]);

  const handleLeave = async () => {
    setIsLeaving(true);
    setLeaveError(null);
    try {
      const token = localStorage.getItem('token');
      await leaveRoom(token, roomId);
      navigate('/join-room');
    } catch (err) {
      setLeaveError(err?.response?.data?.error || 'Failed to leave room.');
      setIsLeaving(false);
    }
  };

  const handleStartGame = async () => {
    setIsStarting(true);
    setLeaveError(null);
    try {
      const token = localStorage.getItem('token');
      await startGame(token, roomId);
      navigate(`/loading/${roomId}`);
    } catch (err) {
      setLeaveError(err?.response?.data?.error || 'Failed to start game.');
      setIsStarting(false);
    }
  };

  // ─── Loading State ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="page-scroll" style={{
        width: '100%', height: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: '#fff',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48, height: 48, border: '3px solid #ff3344',
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin-slow 0.8s linear infinite',
          }} />
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading lobby...</span>
        </div>
      </div>
    );
  }

  // ─── Error State ─────────────────────────────────────────────────
  if (fetchError || !room) {
    return (
      <div className="page-scroll" style={{
        width: '100%', height: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: '#fff',
        padding: '24px 40px',
      }}>
        <div style={{
          background: 'rgba(255,20,40,0.06)', border: '1px solid rgba(255,20,40,0.25)',
          borderRadius: 16, padding: '40px 48px', textAlign: 'center', display: 'flex',
          flexDirection: 'column', gap: 16, alignItems: 'center',
        }}>
          <span style={{ fontSize: 40 }}>💀</span>
          <h2 style={{ fontFamily: 'var(--font-display)', color: '#ff4455', fontSize: 20 }}>
            ROOM NOT FOUND
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {fetchError || 'This lobby no longer exists.'}
          </p>
          <button onClick={() => navigate('/join-room')} className="btn-primary" style={{ marginTop: 8 }}>
            BACK TO ROOMS
          </button>
        </div>
      </div>
    );
  }

  const mapMeta = MAP_META[room.map] || { name: room.map, icon: '🏛️', color: '#ff4455' };
  const currentPlayers = room.users?.length || 0;
  const isHost = room.host?._id === currentUserId || room.host === currentUserId;
  const isFull = currentPlayers >= room.totalPlayers;

  return (
    <div className="page-scroll" style={{
      width: '100%', height: '100%',
      padding: '24px 40px 100px 40px',
      color: '#fff',
      display: 'flex', flexDirection: 'column', gap: 24,
    }}>

      {/* ── Page Header ─────────────────────────────────────────── */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>{mapMeta.icon}</span>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 26,
              letterSpacing: '0.1em', color: '#ff4455',
            }}>
              {room.roomName}
            </h1>
            {isHost && (
              <span style={{
                fontSize: 10, background: 'rgba(255,200,0,0.12)',
                border: '1px solid rgba(255,200,0,0.4)',
                color: '#ffd700', padding: '2px 8px', borderRadius: 4,
                fontWeight: 800, letterSpacing: '0.05em',
              }}>
                HOST
              </span>
            )}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Room Code: <strong style={{ color: '#fff' }}>#{room.roomCode}</strong>
            &nbsp;·&nbsp; Map: <strong style={{ color: mapMeta.color }}>{mapMeta.name}</strong>
            &nbsp;·&nbsp; Mode: <strong style={{ color: '#fff' }}>{room.contractMode?.toUpperCase()}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={fetchRoom}
            title="Refresh players"
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, padding: '10px 14px', cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
            }}
          >
            <RefreshCw size={14} /> REFRESH
          </button>
          <button
            onClick={handleLeave}
            disabled={isLeaving}
            className="btn-secondary"
            style={{ gap: 8, opacity: isLeaving ? 0.6 : 1, cursor: isLeaving ? 'not-allowed' : 'pointer' }}
          >
            <LogOut size={14} />
            {isLeaving ? 'LEAVING...' : 'LEAVE ROOM'}
          </button>
        </div>
      </motion.div>

      {/* ── Leave error ─────────────────────────────────────────── */}
      <AnimatePresence>
        {leaveError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'rgba(255,20,40,0.08)', border: '1px solid rgba(255,20,40,0.3)',
              borderRadius: 8, padding: '10px 16px', fontSize: 12, color: '#ff6677',
            }}
          >
            ⚠️ {leaveError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Grid ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

        {/* LEFT: Players Grid */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-panel"
          style={{
            padding: 28, display: 'flex', flexDirection: 'column', gap: 20,
            background: 'rgba(10,5,15,0.85)',
            border: '1.5px solid rgba(120,40,60,0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, letterSpacing: '0.08em', color: '#ff4455' }}>
              PLAYERS IN LOBBY
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
              <Users size={14} color={isFull ? '#ff4455' : '#5ad15a'} />
              <span style={{ color: isFull ? '#ff4455' : '#5ad15a' }}>
                {currentPlayers}/{room.totalPlayers}
              </span>
            </div>
          </div>

          {/* Player slots grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 12,
          }}>
            {/* Filled slots */}
            {room.users?.map((player, idx) => {
              const isMe = player._id === currentUserId;
              const isPlayerHost = player._id === room.host?._id || player._id === room.host;

              return (
                <motion.div
                  key={player._id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{
                    background: isMe ? 'rgba(255,20,40,0.08)' : 'rgba(255,255,255,0.03)',
                    border: isMe ? '1.5px solid rgba(255,20,40,0.35)' : '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 10, padding: '14px 16px',
                    display: 'flex', flexDirection: 'column', gap: 8, position: 'relative',
                  }}
                >
                  {isPlayerHost && (
                    <Crown
                      size={13}
                      color="#ffd700"
                      style={{ position: 'absolute', top: 10, right: 10 }}
                    />
                  )}

                  {/* Avatar */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1.5px solid rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, overflow: 'hidden'
                  }}>
                    {player.avatar ? (
                      player.avatar.startsWith('http') || player.avatar.startsWith('/') ? (
                        <img src={player.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        player.avatar
                      )
                    ) : '🎭'}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: isMe ? '#ff6677' : '#fff' }}>
                      {player.username}
                      {isMe && <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 6 }}>(you)</span>}
                    </span>
                    <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                      {isPlayerHost ? '👑 Host' : '⚔️ Player'}
                    </span>
                  </div>
                </motion.div>
              );
            })}

            {/* Empty slots */}
            {Array.from({ length: room.totalPlayers - currentPlayers }).map((_, i) => (
              <div
                key={`empty-${i}`}
                style={{
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px dashed rgba(255,255,255,0.08)',
                  borderRadius: 10, padding: '14px 16px', height: 104,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: 6,
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  border: '1.5px dashed rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 18, opacity: 0.3 }}>?</span>
                </div>
                <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.15)' }}>EMPTY SLOT</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT: Room Info + Status */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          {/* Status Card */}
          <div
            className="glass-panel"
            style={{
              padding: 20, background: 'rgba(10,5,15,0.85)',
              border: '1.5px solid rgba(120,40,60,0.25)',
              display: 'flex', flexDirection: 'column', gap: 14,
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '0.08em', color: '#ff4455' }}>
              LOBBY STATUS
            </h3>

            {/* Status pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: isFull ? 'rgba(90,200,100,0.08)' : 'rgba(255,200,0,0.06)',
              border: `1px solid ${isFull ? 'rgba(90,200,100,0.25)' : 'rgba(255,200,0,0.2)'}`,
              borderRadius: 8, padding: '12px 14px',
            }}>
              <Clock size={16} color={isFull ? '#5ad15a' : '#ffd700'} />
              <div>
                <span style={{ fontWeight: 700, fontSize: 13, color: isFull ? '#5ad15a' : '#ffd700', display: 'block' }}>
                  {isFull ? 'LOBBY FULL — READY!' : 'WAITING FOR PLAYERS'}
                </span>
                <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                  {isFull
                    ? 'All players have joined. Host can start the game.'
                    : `${room.totalPlayers - currentPlayers} more player${room.totalPlayers - currentPlayers !== 1 ? 's' : ''} needed`}
                </span>
              </div>
            </div>

            {/* Room details list */}
            {[
              { label: 'ROOM CODE', value: `#${room.roomCode}` },
              { label: 'MAP', value: `${mapMeta.icon} ${mapMeta.name}` },
              { label: 'MODE', value: room.contractMode?.toUpperCase() },
              { label: 'MAX PLAYERS', value: room.totalPlayers },
              { label: 'MAFIA COUNT', value: room.mafiaCount },
              { label: 'VISIBILITY', value: room.roomType?.toUpperCase() },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.04)',
                fontSize: 12,
              }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>{label}</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Roles info card */}
          <div
            className="glass-panel"
            style={{
              padding: 20, background: 'rgba(10,5,15,0.85)',
              border: '1.5px solid rgba(120,40,60,0.25)',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, letterSpacing: '0.08em', color: '#ff4455' }}>
              ROLES IN THIS GAME
            </h3>
            {Object.entries(ROLE_ICONS).map(([role, meta]) => (
              <div key={role} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px',
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid rgba(255,255,255,0.04)`,
                borderRadius: 6,
              }}>
                <span style={{ color: meta.color }}>{meta.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 12, color: meta.color }}>{meta.label.toUpperCase()}</span>
                {role === 'mafia' && (
                  <span style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--text-muted)' }}>
                    ×{room.mafiaCount}
                  </span>
                )}
              </div>
            ))}
            <p style={{ fontSize: 10.5, color: 'var(--text-muted)', lineHeight: 1.5, marginTop: 4 }}>
              Roles are assigned randomly when the host starts the game.
            </p>
          </div>

          {/* Start game — host only */}
          {isHost && (
            <button
              onClick={handleStartGame}
              className="btn-primary"
              disabled={!isFull || isStarting}
              style={{
                width: '100%', height: 48, fontSize: 14, gap: 10,
                opacity: isFull ? 1 : 0.45,
                cursor: isFull ? (isStarting ? 'not-allowed' : 'pointer') : 'not-allowed',
              }}
            >
              {isStarting ? 'STARTING...' : (isFull ? '🚀 START GAME' : `⏳ WAITING (${currentPlayers}/${room.totalPlayers})`)}
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
