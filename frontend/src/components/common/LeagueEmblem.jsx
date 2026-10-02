import React from 'react';
import { motion } from 'framer-motion';
import { getLeagueByTrophies } from '../../shared/leagueConfig';

/**
 * Size presets for LeagueEmblem:
 * - 'xs': 28px (compact lists / HUD)
 * - 'sm': 38px (HUD / inline badges)
 * - 'md': 56px (leaderboards / cards)
 * - 'lg': 90px (modal / summary)
 * - 'xl': 130px (profile dossier hero badge)
 */
const SIZES = {
  xs: { size: 28, strokeWidth: 1.5 },
  sm: { size: 38, strokeWidth: 2 },
  md: { size: 56, strokeWidth: 2.5 },
  lg: { size: 90, strokeWidth: 3 },
  xl: { size: 130, strokeWidth: 3.5 },
};

export default function LeagueEmblem({
  tierId,
  trophies,
  size = 'md',
  showLabel = false,
  animate = true,
  className = '',
  style = {},
}) {
  const league = trophies !== undefined ? getLeagueByTrophies(trophies) : null;
  const currentTierId = tierId || league?.id || 'bronze';
  const cfg = league || getLeagueByTrophies(
    currentTierId === 'legendary' ? 6000 :
    currentTierId === 'grand_master' ? 4500 :
    currentTierId === 'elite_master' ? 3500 :
    currentTierId === 'master' ? 2800 :
    currentTierId === 'diamond' ? 2000 :
    currentTierId === 'platinum' ? 1400 :
    currentTierId === 'gold' ? 800 :
    currentTierId === 'silver' ? 400 : 100
  );

  const dim = SIZES[size] || SIZES.md;
  const isLarge = size === 'lg' || size === 'xl';

  // Specific insignia rendering for each tier (fitted within 100x100 viewport)
  const renderTierInsignia = () => {
    switch (currentTierId) {
      case 'bronze':
        return (
          <g>
            {/* Bronze Shield */}
            <path
              d="M50 10 L82 24 V54 C82 74 50 90 50 90 C50 90 18 74 18 54 V24 Z"
              fill="url(#bronzeGrad)"
              stroke="#e59866"
              strokeWidth={dim.strokeWidth}
            />
            {/* Cross daggers */}
            <path d="M34 34 L66 66 M66 34 L34 66" stroke="#2a1005" strokeWidth="4" strokeLinecap="round" />
            <path d="M34 34 L66 66 M66 34 L34 66" stroke="#f0a868" strokeWidth="2" strokeLinecap="round" />
            <circle cx="50" cy="50" r="8" fill="#8b4513" stroke="#ffd700" strokeWidth="1.5" />
          </g>
        );

      case 'silver':
        return (
          <g>
            {/* Silver Winged Crest */}
            <path
              d="M50 10 L78 24 L86 46 L76 70 L50 88 L24 70 L14 46 L22 24 Z"
              fill="url(#silverGrad)"
              stroke="#eef2f7"
              strokeWidth={dim.strokeWidth}
            />
            {/* Wings */}
            <path d="M12 40 Q30 32 50 46 Q70 32 88 40" fill="none" stroke="#ffffff" strokeWidth="2.5" />
            <path d="M18 50 Q34 44 50 54 Q66 44 82 50" fill="none" stroke="#94a3b8" strokeWidth="2" />
            {/* Core Gem */}
            <polygon points="50,36 60,50 50,64 40,50" fill="#38bdf8" stroke="#fff" strokeWidth="1.5" />
          </g>
        );

      case 'gold':
        return (
          <g>
            {/* Gold Radiant Crown Crest */}
            <path
              d="M50 8 L74 20 L88 38 L80 68 L50 90 L20 68 L12 38 L26 20 Z"
              fill="url(#goldGrad)"
              stroke="#fff380"
              strokeWidth={dim.strokeWidth}
            />
            {/* Crown Points */}
            <path d="M30 62 L30 40 L40 48 L50 32 L60 48 L70 40 L70 62 Z" fill="#b8860b" stroke="#ffe066" strokeWidth="1.8" />
            <circle cx="50" cy="54" r="6" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
            <circle cx="30" cy="40" r="2.5" fill="#ffd700" />
            <circle cx="50" cy="32" r="3" fill="#ffd700" />
            <circle cx="70" cy="40" r="2.5" fill="#ffd700" />
          </g>
        );

      case 'platinum':
        return (
          <g>
            {/* Futuristic Platinum Diamond Shield */}
            <polygon
              points="50,6 88,24 88,68 50,94 12,68 12,24"
              fill="url(#platinumGrad)"
              stroke="#a5f3fc"
              strokeWidth={dim.strokeWidth}
            />
            {/* Tech Angles */}
            <polygon points="50,18 78,32 78,64 50,82 22,64 22,32" fill="rgba(6, 182, 212, 0.25)" stroke="#22d3ee" strokeWidth="2" />
            <line x1="50" y1="18" x2="50" y2="82" stroke="#e0f2fe" strokeWidth="2.5" />
            <line x1="22" y1="50" x2="78" y2="50" stroke="#00f0ff" strokeWidth="2" />
            <circle cx="50" cy="50" r="8" fill="#0891b2" stroke="#fff" strokeWidth="1.8" />
          </g>
        );

      case 'diamond':
        return (
          <g>
            {/* Brilliant Faceted Amethyst Diamond */}
            <polygon
              points="50,6 84,20 94,50 84,80 50,94 16,80 6,50 16,20"
              fill="url(#diamondGrad)"
              stroke="#e0aaff"
              strokeWidth={dim.strokeWidth}
            />
            {/* Diamond Facets */}
            <polygon points="50,14 74,32 50,86 26,32" fill="rgba(199, 125, 255, 0.4)" stroke="#f3d9fa" strokeWidth="1.8" />
            <polygon points="50,14 74,32 50,48 26,32" fill="#9d4edd" stroke="#fff" strokeWidth="1.5" />
            <line x1="16" y1="20" x2="84" y2="20" stroke="#f3d9fa" strokeWidth="1.5" />
            <line x1="6" y1="50" x2="94" y2="50" stroke="#c77dff" strokeWidth="1.5" />
          </g>
        );

      case 'master':
        return (
          <g>
            {/* Demonic Crimson Master Insignia */}
            <path
              d="M50 8 C75 8 92 25 90 54 C88 78 50 94 50 94 C50 94 12 78 10 54 C8 25 25 8 50 8 Z"
              fill="url(#masterGrad)"
              stroke="#ff80aa"
              strokeWidth={dim.strokeWidth}
            />
            {/* Skull & Dual Blood-Blades */}
            <path d="M22 22 L78 78 M78 22 L22 78" stroke="#ff0055" strokeWidth="4" strokeLinecap="round" />
            <path d="M22 22 L78 78 M78 22 L22 78" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            <circle cx="50" cy="50" r="14" fill="#660022" stroke="#ff3366" strokeWidth="2.5" />
            <circle cx="45" cy="48" r="2.5" fill="#ff0055" />
            <circle cx="55" cy="48" r="2.5" fill="#ff0055" />
            <path d="M44 56 Q50 60 56 56" stroke="#fff" strokeWidth="1.5" fill="none" />
          </g>
        );

      case 'elite_master':
        return (
          <g>
            {/* Blazing Inferno Dragon Crest */}
            <path
              d="M50 4 L68 18 L92 24 L84 52 L94 76 L66 84 L50 96 L34 84 L6 76 L16 52 L8 24 L32 18 Z"
              fill="url(#eliteGrad)"
              stroke="#ffc299"
              strokeWidth={dim.strokeWidth}
            />
            {/* Flaming Spikes */}
            <path d="M30 46 L50 20 L70 46 L50 38 Z" fill="#ff4500" stroke="#fff" strokeWidth="1.5" />
            <path d="M36 68 L50 44 L64 68 L50 60 Z" fill="#ffa500" stroke="#ff3300" strokeWidth="1.5" />
            <circle cx="50" cy="54" r="6" fill="#fff" stroke="#ff6b00" strokeWidth="2" />
          </g>
        );

      case 'grand_master':
        return (
          <g>
            {/* Astral Cosmic Godfather Crest */}
            <polygon
              points="50,4 64,16 88,14 84,38 98,52 82,68 84,92 60,86 50,98 40,86 16,92 18,68 2,52 16,38 12,14 36,16"
              fill="url(#grandGrad)"
              stroke="#f9a8d4"
              strokeWidth={dim.strokeWidth}
            />
            {/* Cosmic Ring */}
            <circle cx="50" cy="52" r="22" fill="none" stroke="#ec4899" strokeWidth="2.5" strokeDasharray="6 3" />
            <polygon points="50,30 64,48 50,74 36,48" fill="#a855f7" stroke="#fff" strokeWidth="2" />
            <circle cx="50" cy="52" r="5" fill="#fff" />
          </g>
        );

      case 'legendary':
      default:
        return (
          <g>
            {/* Mythic Overlord Transcendent Crown & Wings */}
            <polygon
              points="50,2 68,14 96,10 88,38 100,56 80,72 86,98 50,90 14,98 20,72 0,56 12,38 4,10 32,14"
              fill="url(#legendGrad)"
              stroke="#00ffff"
              strokeWidth={dim.strokeWidth}
            />
            {/* Supreme Mythic Star */}
            <polygon points="50,16 60,38 84,42 66,58 72,82 50,68 28,82 34,58 16,42 40,38" fill="url(#legendCoreGrad)" stroke="#ffe600" strokeWidth="2" />
            <circle cx="50" cy="50" r="8" fill="#fff" stroke="#ff0077" strokeWidth="2.5" />
          </g>
        );
    }
  };

  return (
    <div
      className={`league-emblem-container ${className}`}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Outer Halo Glow */}
      <motion.div
        animate={
          animate
            ? {
                scale: [1, 1.05, 1],
              }
            : undefined
        }
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        style={{
          width: dim.size,
          height: dim.size,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {/* Animated Background Ring for Large Hero Display */}
        {isLarge && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
            style={{
              position: 'absolute',
              inset: -12,
              borderRadius: '50%',
              border: `2px dashed ${cfg.primaryColor}88`,
              boxShadow: `0 0 25px ${cfg.glowColor}`,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* SVG Crest */}
        <svg
          viewBox="0 0 100 100"
          width="100%"
          height="100%"
          style={{
            filter: `drop-shadow(0 0 ${isLarge ? '16px' : '6px'} ${cfg.glowColor})`,
            display: 'block',
          }}
        >
          <defs>
            {/* Bronze Gradient */}
            <linearGradient id="bronzeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d98236" />
              <stop offset="50%" stopColor="#8b4513" />
              <stop offset="100%" stopColor="#4a2205" />
            </linearGradient>

            {/* Silver Gradient */}
            <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>

            {/* Gold Gradient */}
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff275" />
              <stop offset="40%" stopColor="#ffd700" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            {/* Platinum Gradient */}
            <linearGradient id="platinumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="40%" stopColor="#00f0ff" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>

            {/* Diamond Gradient */}
            <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f3d9fa" />
              <stop offset="40%" stopColor="#c77dff" />
              <stop offset="100%" stopColor="#581c87" />
            </linearGradient>

            {/* Master Gradient */}
            <linearGradient id="masterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff4d79" />
              <stop offset="50%" stopColor="#ff0055" />
              <stop offset="100%" stopColor="#4a0011" />
            </linearGradient>

            {/* Elite Master Gradient */}
            <linearGradient id="eliteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffc04d" />
              <stop offset="40%" stopColor="#ff6b00" />
              <stop offset="100%" stopColor="#7c1a00" />
            </linearGradient>

            {/* Grand Master Gradient */}
            <linearGradient id="grandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#3b0764" />
            </linearGradient>

            {/* Legendary Gradient */}
            <linearGradient id="legendGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffe600" />
              <stop offset="40%" stopColor="#ff0077" />
              <stop offset="80%" stopColor="#00f0ff" />
              <stop offset="100%" stopColor="#7000ff" />
            </linearGradient>

            <linearGradient id="legendCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#ffea00" />
              <stop offset="100%" stopColor="#ff0055" />
            </linearGradient>
          </defs>

          {renderTierInsignia()}
        </svg>
      </motion.div>

      {/* Optional Label */}
      {showLabel && (
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: isLarge ? 20 : 12,
              fontWeight: 900,
              letterSpacing: '0.1em',
              color: cfg.primaryColor,
              textShadow: `0 0 12px ${cfg.glowColor}`,
              textTransform: 'uppercase',
            }}
          >
            {cfg.name}
          </div>
          {isLarge && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {cfg.title}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
