import { useState, useRef, useEffect } from 'react';
import axios from "axios";
import { motion, AnimatePresence } from 'framer-motion';
import { getUserData } from '../services/userService.js';
import {
  ShieldAlert, Upload, Trophy, Star, Target, Shield,
  Smile, Swords, Zap, CheckCircle2, AlertTriangle, Eye
} from 'lucide-react';

const DEFAULT_AVATARS = [
  { id: '🎭', emoji: '🎭', label: 'Spooky Mask' },
  { id: '🕵️', emoji: '🕵️', label: 'Detective' },
  { id: '🧛', emoji: '🧛', label: 'Vampire' },
  { id: '🐺', emoji: '🐺', label: 'Werewolf' },
  { id: '🤡', emoji: '🤡', label: 'Joker' },
  { id: '💀', emoji: '💀', label: 'Skull' },
  { id: '🧙', emoji: '🧙', label: 'Witch' },
  { id: '👹', emoji: '👹', label: 'Demon' },
];

const ACHIEVEMENTS_CONFIG = [
  {
    key: 'first_blood',
    icon: Swords,
    title: 'First Blood',
    desc: 'Eliminate a player in Night 1.',
    color: '#ff4444',
    hint: 'Play as Mafia and get the first kill of the night.',
  },
  {
    key: 'detective_eye',
    icon: Eye,
    title: 'Detective Eye',
    desc: 'Correctly accuse a Mafia member on Day 1.',
    color: '#a8d8f0',
    hint: 'Point out the Mafia correctly on the very first voting round.',
  },
  {
    key: 'silent_killer',
    icon: Target,
    title: 'Silent Killer',
    desc: 'Win as Mafia without being suspected once.',
    color: '#f0c848',
    hint: 'Finish a full match as Mafia with zero accusations.',
  },
  {
    key: 'guardian_angel',
    icon: Shield,
    title: 'Guardian Angel',
    desc: 'Save the same target 3 nights in a row.',
    color: '#5ad15a',
    hint: 'As Doctor, protect the same player on 3 consecutive nights.',
  },
  {
    key: 'veteran_spirit',
    icon: Star,
    title: 'Veteran Spirit',
    desc: 'Play 50 total matches.',
    color: '#b088ff',
    hint: 'Reach 50 total games played.',
  },
  {
    key: 'serial_winner',
    icon: Trophy,
    title: 'Serial Winner',
    desc: 'Win 10 matches.',
    color: '#ffd700',
    hint: 'Accumulate 10 wins across any role.',
  },
  {
    key: 'killing_spree',
    icon: Swords,
    title: 'Killing Spree',
    desc: 'Get 20 Mafia kills.',
    color: '#ff6633',
    hint: 'Eliminate 20 players total as Mafia across all matches.',
  },
];

const RANK_CONFIG = [
  { name: 'Bronze',   min:    0, max:  499,  color: '#cd7f32', icon: '🥉', nextName: 'Silver'  },
  { name: 'Silver',   min:  500, max: 1499,  color: '#aaa9ad', icon: '🥈', nextName: 'Gold'    },
  { name: 'Gold',     min: 1500, max: 2999,  color: '#ffd700', icon: '🥇', nextName: 'Diamond' },
  { name: 'Diamond',  min: 3000, max: 4999,  color: '#a8d8f0', icon: '💎', nextName: 'Master'  },
  { name: 'Master',   min: 5000, max: 99999, color: '#ff4455', icon: '👑', nextName: 'Master'  },
];
function getRank(trophies) {
  return RANK_CONFIG.find(r => trophies >= r.min && trophies <= r.max) || RANK_CONFIG[0];
}

const isImageSrc = (val) =>
  val && (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:image/'));

export default function ProfilePage() {
  const [avatar, setAvatar] = useState(() => {
    const saved = localStorage.getItem('mafia_avatar');
    // Return URL or base64 as image src; ignore emoji strings
    if (saved && isImageSrc(saved)) return saved;
    return null;
  });
  const [selectedDefault, setSelectedDefault] = useState(() => {
    const saved = localStorage.getItem('mafia_avatar');
    if (!saved) return '🎭';           // nothing saved → default emoji
    if (isImageSrc(saved)) return null;  // image → no emoji selected
    if ([...saved].length <= 2) return saved; // emoji
    return '🎭';                        // fallback
  });
  const [tempUsername, setTempUsername] =
    useState("Shadow");
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [rawFile, setRawFile] = useState(null);
  const fileRef = useRef(null);
  const [profile, setProfile] = useState(null);

  // Player stats mapped from DB
  const getFavRoleName = (role) => {
    switch (role) {
      case 'mafia': return 'The Mastermind (Mafia)';
      case 'police': return 'The Investigator (Detective)';
      case 'doctor': return 'The Guardian (Doctor)';
      case 'villager': return 'The Innocent (Villager)';
      default: return 'The Unpredictable (All-Rounder)';
    }
  };

  const stats = {
    matchesPlayed:
      profile?.totalGamesPlayed || 0,

    wins:
      profile?.totalGamesWon || 0,

    losses:
      (profile?.totalGamesPlayed || 0) -
      (profile?.totalGamesWon || 0),

    mafiaKills:
      profile?.mafiaKills || 0,

    trophies:
      profile?.trophies || 0,

    favRoleDesc: getFavRoleName(profile?.roleGetMaximumTime),
  };
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        let userId = localStorage.getItem("userId");

        if (token && !userId) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload && payload._id) {
              userId = payload._id;
              localStorage.setItem("userId", userId);
            }
          } catch (e) {
            console.error("Failed to decode token in ProfilePage:", e);
          }
        }

        if (!token || !userId) return;

        const res = await getUserData(token, userId);

        setProfile(res.data.user);

        setTempUsername(res.data.user.username);

        if (res.data.user.avatar) {
          const av = res.data.user.avatar;
          if (isImageSrc(av)) {
            // server URL or base64 → show as image
            setAvatar(av);
            setSelectedDefault(null);
          } else {
            // emoji (length <= 2)
            if ([...av].length <= 2) {
              setAvatar(null);
              setSelectedDefault(av);
            } else {
              setAvatar(null);
              setSelectedDefault('🎭'); // Fallback for invalid emoji / old DB values like "avatar1"
            }
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchProfile();
  }, []);
  const winRate =
    stats.matchesPlayed > 0
      ? Math.round(
        (stats.wins / stats.matchesPlayed) * 100
      )
      : 0;

  // Dynamic rank based on real trophies
  const currentRank  = getRank(stats.trophies);
  const currentRankName = currentRank.name;
  const nextRankName  = currentRank.nextName;
  const rankMin       = currentRank.min;
  const rankMax       = currentRank.max;
  const rankProgress  = Math.max(0, stats.trophies - rankMin);
  const rankTotal     = rankMax - rankMin || 1;  // avoid divide-by-zero for Master tier
  const progressPct   = Math.min(100, Math.round((rankProgress / rankTotal) * 100));

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRawFile(file);
    setAvatar(URL.createObjectURL(file));
    setSelectedDefault(null);
  };

  const handleSelectDefault = (emoji) => {
    setAvatar(null);
    setRawFile(null);
    setSelectedDefault(emoji);
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("username", tempUsername);

      if (rawFile) {
        formData.append("avatar", rawFile);
      } else {
        formData.append("avatar", selectedDefault || avatar);
      }

      const res = await axios.put(
        `http://localhost:5000/api/profile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // update local state
      setProfile((prev) => ({
        ...prev,
        username: tempUsername,
        avatar: res.data.user.avatar,
      }));

      // Update local storage so HUD can update
      localStorage.setItem('mafia_avatar', res.data.user.avatar);
      localStorage.setItem('mafia_username', tempUsername);

      window.dispatchEvent(new Event("profileUpdate"));

      setShowSavedToast(true);

      setTimeout(() => {
        setShowSavedToast(false);
      }, 2500);

    } catch (err) {
      console.error("Error saving profile changes:", err);
    }
  };


  return (
    <div className="page-scroll" style={{
      width: '100%', height: '100%',
      padding: '24px 40px 100px 40px',
      color: '#fff',
      display: 'flex', flexDirection: 'column', gap: 24,
      position: 'relative',
    }}>
      {/* Toast Notification */}
      <AnimatePresence>
        {showSavedToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              position: 'fixed', top: 90, left: '50%', transform: 'translateX(-50%)',
              zIndex: 100, background: 'rgba(90,200,100,0.95)', color: '#fff',
              padding: '10px 24px', borderRadius: 8, fontWeight: 700, fontSize: 13,
              boxShadow: '0 0 20px rgba(90,200,100,0.5)', border: '1px solid #5ad15a',
              fontFamily: 'var(--font-display)', letterSpacing: '0.05em',
            }}
          >
            ✓ Profile changes saved successfully!
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
          PLAYER PROFILE
        </h1>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Customize your appearance and inspect your records</span>
      </motion.div>

      {/* Main Grid: Left side customizer, Right side stats & achievements */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: 24,
        alignItems: 'start',
      }}>
        {/* LEFT COLUMN: Avatar & Username Customization */}
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-panel"
          style={{
            padding: 24, display: 'flex', flexDirection: 'column', gap: 20,
            alignItems: 'center', background: 'linear-gradient(180deg, rgba(20,8,22,0.85) 0%, rgba(8,3,10,0.9) 100%)',
            border: '1.5px solid rgba(120,40,60,0.3)',
          }}
        >
          {/* Avatar Preview */}
          <div style={{
            width: 140, height: 140, borderRadius: '50%',
            border: '3px solid #ff4455',
            boxShadow: '0 0 24px rgba(255,20,40,0.4)',
            overflow: 'hidden',
            background: 'linear-gradient(135deg,#1d0c24,#0c0412)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            {avatar ? (
              <img src={avatar} alt="custom avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 72 }}>{selectedDefault}</span>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={() => fileRef.current?.click()}
            className="btn-secondary"
            style={{ width: '100%', gap: 8, justifyContent: 'center', border: '1px solid rgba(180,50,80,0.4)' }}
          >
            <Upload size={16} /> UPLOAD CUSTOM
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />

          <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.06)' }} />

          {/* Username Input Field */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              CODENAME (USERNAME)
            </label>
            <input
              type="text"
              value={tempUsername}
              onChange={e => setTempUsername(e.target.value)}
              className="input-dark"
              maxLength={15}
              placeholder="Enter codename..."
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveChanges}
            className="btn-primary"
            style={{ width: '100%', gap: 8, justifyContent: 'center', marginTop: 4, height: 44 }}
          >
            SAVE CHANGES
          </button>

          <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.06)' }} />

          {/* Default Avatars Grid */}
          <div style={{ width: '100%' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', display: 'block', marginBottom: 12 }}>
              SELECT DEFAULT AVATAR
            </span>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8
            }}>
              {DEFAULT_AVATARS.map((av) => (
                <button
                  key={av.id}
                  onClick={() => handleSelectDefault(av.emoji)}
                  style={{
                    height: 52, borderRadius: 8,
                    background: selectedDefault === av.emoji ? 'rgba(255,20,40,0.12)' : 'rgba(255,255,255,0.02)',
                    border: selectedDefault === av.emoji ? '1.5px solid #ff3344' : '1.5px solid rgba(255,255,255,0.05)',
                    fontSize: 24, cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: selectedDefault === av.emoji ? '0 0 10px rgba(255,30,50,0.3)' : 'none',
                  }}
                  onMouseEnter={e => {
                    if (selectedDefault !== av.emoji) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                  onMouseLeave={e => {
                    if (selectedDefault !== av.emoji) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  }}
                >
                  {av.emoji}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Stats, Rank, and Achievements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* STATS GRID & RANK */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Stats Panel */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="glass-panel"
              style={{
                padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
                background: 'rgba(10,5,15,0.85)',
                border: '1.5px solid rgba(120,40,60,0.25)',
              }}
            >
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.08em', color: '#ff4455' }}>
                MATCH RECOGNITIONS
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block' }}>TOTAL MATCHES</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{stats.matchesPlayed}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block' }}>WIN RATE</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#5ad15a' }}>{winRate}%</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block' }}>MAFIA KILLS</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#ff3344' }}>{stats.mafiaKills}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block' }}>W/L RECORDS</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#eee', display: 'block', marginTop: 4 }}>
                    {stats.wins}W / {stats.losses}L
                  </span>
                </div>
              </div>

              {/* Favourite Role Hook */}
              <div style={{
                background: 'linear-gradient(90deg, rgba(200,30,50,0.1), transparent)',
                padding: '12px 16px', borderRadius: 8,
                borderLeft: '4px solid #ff3344',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <ShieldAlert size={24} color="#ff3344" style={{ flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>FAVOURITE ROLE</span>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#ff4455' }}>
                    "{stats.favRoleDesc}"
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Rank Panel */}
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
                LEAGUE STANDINGS
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.02)',
                  border: `2px solid ${currentRank.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, boxShadow: `0 0 15px ${currentRank.color}40`,
                }}>
                  {currentRank.icon}
                </div>
                <div>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block' }}>CURRENT LEAGUE</span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#eee', letterSpacing: '0.05em' }}>
                    {currentRankName.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 11, color: '#f0c848', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Trophy size={12} /> {stats.trophies} Trophies
                  </span>
                </div>
              </div>

              {/* Progress to next rank */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Next Rank: <strong>{nextRankName}</strong></span>
                  <span style={{ color: '#ffd700', fontWeight: 600 }}>{stats.trophies} / {rankMax} 🏆</span>
                </div>
                <div style={{
                  width: '100%', height: 8,
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 4, overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{
                    width: `${progressPct}%`, height: '100%',
                    background: 'linear-gradient(90deg, #8a78a8, #ffd700)',
                    borderRadius: 4,
                    boxShadow: '0 0 10px rgba(255,215,0,0.3)',
                  }} />
                </div>
                <span style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>
                  You need {rankMax - stats.trophies} more trophies to claim {nextRankName} rank.
                </span>
              </div>
            </motion.div>
          </div>

          {/* ACHIEVEMENTS LIST */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="glass-panel"
            style={{
              padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
              background: 'rgba(10,5,15,0.85)',
              border: '1.5px solid rgba(120,40,60,0.25)',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.08em', color: '#ff4455', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              ACHIEVEMENTS & BADGES
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                {(profile?.achievements || []).length} / {ACHIEVEMENTS_CONFIG.length} UNLOCKED
              </span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ACHIEVEMENTS_CONFIG.map((ach, i) => {
                const IconComp = ach.icon;
                // unlocked = this key exists in the user's achievements array from DB
                const unlocked = (profile?.achievements || []).includes(ach.key);
                return (
                  <div
                    key={ach.key}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', borderRadius: 8,
                      background: unlocked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                      border: unlocked ? `1px solid ${ach.color}22` : '1px solid rgba(255,255,255,0.02)',
                      opacity: unlocked ? 1 : 0.5,
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: '50%',
                        background: unlocked ? `${ach.color}12` : 'rgba(255,255,255,0.01)',
                        border: `1.5px solid ${unlocked ? ach.color : 'rgba(255,255,255,0.1)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: unlocked ? `0 0 12px ${ach.color}44` : 'none',
                        flexShrink: 0,
                      }}>
                        <IconComp size={20} color={unlocked ? ach.color : '#555'} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontWeight: 700, color: unlocked ? '#fff' : '#777', fontSize: 14 }}>
                          {ach.title}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {ach.desc}
                        </span>
                        {/* Show how-to hint only when locked */}
                        {!unlocked && (
                          <span style={{ fontSize: 10, color: '#555', fontStyle: 'italic', marginTop: 1 }}>
                            💡 {ach.hint}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {unlocked ? (
                        <span style={{ fontSize: 11, color: '#5ad15a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={12} /> UNLOCKED
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: 600 }}>
                          LOCKED
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
