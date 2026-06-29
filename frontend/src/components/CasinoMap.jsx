/**
 * CasinoMap.jsx
 * Premium 3D Casino Royale environment with high-fidelity assets.
 * Creates a luxury gaming environment with velvet carpets, golden marble roads,
 * palms, card suits, VIP entrances, poker table props, glowing skyscraper windows,
 * and sky-sweeping spotlight beams.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────
// Re-ordered building coordinates for optimal spawn view
// ─────────────────────────────────────────────────────────────
export const BUILDINGS = [
  { id: 'casino',   label: 'ROYALE CASINO', pos: [  0, -32], size: [16, 9.0, 14], color: '#09091f', neon: '#ffd700' }, // North (Front Center)
  { id: 'bank',     label: 'GOLD BANK',     pos: [-28, -28], size: [12, 6.5, 10], color: '#05180f', neon: '#00ff88' }, // North-West
  { id: 'police',   label: 'SHERIFF HQ',    pos: [ 28, -28], size: [12, 6.0, 10], color: '#050c21', neon: '#2277ff' }, // North-East
  { id: 'bar',      label: 'VIP BAR',       pos: [-28,  28], size: [12, 5.5, 10], color: '#3a0f08', neon: '#ff4400' }, // South-West
  { id: 'house',    label: 'LOUNGE',        pos: [ 28,  28], size: [11, 4.5, 10], color: '#180518', neon: '#cc22ff' }, // South-East
  { id: 'garden',   label: 'COURTYARD',     pos: [  0,  36], size: [16, 0.15, 12], color: '#0c260f', neon: '#11ff55' }, // South
  { id: 'helipad',  label: 'VIP PAD',       pos: [ 36,   0], size: [10, 0.25, 10], color: '#161616', neon: '#ff2244' }, // East
];

export const FOUNTAIN_POS = [0, 0];

// ── Rotating sky spotlight ──
function SkySearchlight({ position, color = '#ffffff' }) {
  const beamRef = useRef();
  
  useFrame(({ clock }) => {
    if (beamRef.current) {
      beamRef.current.rotation.y = clock.elapsedTime * 0.4;
      beamRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.6) * 0.12 - 0.45;
    }
  });

  return (
    <group position={position}>
      {/* Searchlight base */}
      <mesh castShadow>
        <cylinderGeometry args={[0.35, 0.45, 0.5, 8]} />
        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Light beam */}
      <group ref={beamRef}>
        <mesh position={[0, 12, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[2.0, 24, 16, 1, true]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.16}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
        <pointLight position={[0, 1, 0]} color={color} intensity={2.5} distance={18} decay={2} />
      </group>
    </group>
  );
}

// ── Building Windows Grid helper ──
function WindowGrid({ width, height, depth, cols = 4, rows = 5 }) {
  const wSpacing = width / (cols + 1);
  const hSpacing = height / (rows + 1);

  return (
    <group>
      {/* Front Windows */}
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => (
          <mesh key={`f-${r}-${c}`} position={[-width / 2 + (c + 1) * wSpacing, (r + 1) * hSpacing, depth / 2 + 0.02]}>
            <planeGeometry args={[wSpacing * 0.45, hSpacing * 0.45]} />
            <meshBasicMaterial color="#ffea88" />
          </mesh>
        ))
      )}
      {/* Left Windows */}
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => (
          <mesh key={`l-${r}-${c}`} position={[-width / 2 - 0.02, (r + 1) * hSpacing, -depth / 2 + (c + 1) * (depth / (cols + 1))]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[depth / (cols + 1) * 0.45, hSpacing * 0.45]} />
            <meshBasicMaterial color="#ffea88" />
          </mesh>
        ))
      )}
      {/* Right Windows */}
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => (
          <mesh key={`r-${r}-${c}`} position={[width / 2 + 0.02, (r + 1) * hSpacing, -depth / 2 + (c + 1) * (depth / (cols + 1))]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[depth / (cols + 1) * 0.45, hSpacing * 0.45]} />
            <meshBasicMaterial color="#ffea88" />
          </mesh>
        ))
      )}
    </group>
  );
}

// ── VIP Entrance Red Carpet with gold stanchions ──
function RedCarpet({ pos, size, rotation = 0 }) {
  const [x, z] = pos;
  const [w, d] = size;
  return (
    <group position={[x, 0.015, z]} rotation={[0, rotation, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#8a0014" roughness={0.85} />
      </mesh>
      <mesh position={[-w / 2 - 0.02, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.06, d]} />
        <meshStandardMaterial color="#e5c158" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[w / 2 + 0.02, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.06, d]} />
        <meshStandardMaterial color="#e5c158" metalness={0.9} roughness={0.1} />
      </mesh>
      {[-d / 2.5, 0, d / 2.5].map((zOffset, idx) => (
        <group key={idx} position={[0, 0, zOffset]}>
          <mesh position={[-w / 2 - 0.15, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 1.0, 8]} />
            <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.05} />
          </mesh>
          <mesh position={[-w / 2 - 0.15, 1.02, 0]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.05} />
          </mesh>
          <mesh position={[w / 2 + 0.15, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 1.0, 8]} />
            <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.05} />
          </mesh>
          <mesh position={[w / 2 + 0.15, 1.02, 0]}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.05} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── Giant Neon Card Suits ──
function CardSuitProp({ type = 'spade', position, color = '#ff2244', size = 1.3 }) {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.elapsedTime * 0.8 + (type === 'heart' ? 0 : 1);
      meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2 + (size * 5)) * 0.15;
    }
  });

  return (
    <group position={position} ref={meshRef}>
      {type === 'diamond' && (
        <mesh rotation={[0, 0, Math.PI / 4]} castShadow>
          <boxGeometry args={[size, size, 0.28]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} roughness={0.2} />
        </mesh>
      )}
      {type === 'heart' && (
        <group scale={[size, size, size]}>
          <mesh position={[-0.25, 0.2, 0]} castShadow>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
          </mesh>
          <mesh position={[0.25, 0.2, 0]} castShadow>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
          </mesh>
          <mesh position={[0, -0.1, 0]} rotation={[0, 0, Math.PI]} castShadow>
            <coneGeometry args={[0.54, 0.8, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
          </mesh>
        </group>
      )}
      {type === 'spade' && (
        <group scale={[size, size, size]}>
          <mesh position={[-0.25, -0.1, 0]} castShadow>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
          </mesh>
          <mesh position={[0.25, -0.1, 0]} castShadow>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow>
            <coneGeometry args={[0.54, 0.8, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
          </mesh>
          <mesh position={[0, -0.5, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.3, 0.4, 12]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
          </mesh>
        </group>
      )}
      {type === 'club' && (
        <group scale={[size, size, size]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
          </mesh>
          <mesh position={[-0.25, -0.05, 0]} castShadow>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
          </mesh>
          <mesh position={[0.25, -0.05, 0]} castShadow>
            <sphereGeometry args={[0.28, 16, 16]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
          </mesh>
          <mesh position={[0, -0.4, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.28, 0.4, 12]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5} />
          </mesh>
        </group>
      )}
      <pointLight color={color} intensity={2.0} distance={6} decay={2} />
    </group>
  );
}

// ── Potted Palm Tree ──
function PalmTree({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.36, 0.8, 12]} />
        <meshStandardMaterial color="#c5a049" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 2.0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.2, 2.5, 8]} />
        <meshStandardMaterial color="#4e3527" roughness={0.9} />
      </mesh>
      {Array.from({ length: 6 }).map((_, idx) => {
        const angle = (idx * Math.PI * 2) / 6;
        return (
          <group key={idx} position={[0, 3.2, 0]} rotation={[0.18, angle, 0]}>
            <mesh position={[0, -0.1, 0.9]} castShadow>
              <boxGeometry args={[0.38, 0.03, 1.6]} />
              <meshStandardMaterial color="#1a6e3d" roughness={0.7} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ── Giant Glowing Red Dice ──
function GlowingDice({ position, rotation = [0.4, 0.6, 0.2] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.6, 1.6, 1.6]} />
        <meshStandardMaterial color="#ff1e43" roughness={0.05} metalness={0.8} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 0.81, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.02, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {[-0.42, 0, 0.42].flatMap(x => [-0.35, 0.35].map(y => (
        <mesh key={`${x}-${y}`} position={[x, y, 0.81]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.02, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )))}
      <pointLight color="#ff1133" intensity={2.8} distance={8} decay={2} />
    </group>
  );
}

// ── Casino Green Felt Poker Table Prop ──
function CasinoTable({ position, label = 'VIP POKER' }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.0, 1.8, 0.18, 32]} />
        <meshStandardMaterial color="#0b6323" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.96, 0]}>
        <torusGeometry args={[1.96, 0.1, 10, 48]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#47260c" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.55, 0.9, 16]} />
        <meshStandardMaterial color="#c5a049" metalness={0.9} roughness={0.15} />
      </mesh>
      {Array.from({ length: 5 }).map((_, idx) => {
        const angle = (idx * Math.PI * 2) / 5;
        const cx = Math.sin(angle) * 2.6;
        const cz = Math.cos(angle) * 2.6;
        return (
          <group key={idx} position={[cx, 0, cz]} rotation={[0, angle, 0]}>
            <mesh position={[0, 0.3, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
              <meshStandardMaterial color="#1a1a1a" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.61, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} />
              <meshStandardMaterial color="#a1152a" roughness={0.6} />
            </mesh>
          </group>
        );
      })}
      <Html position={[0, 1.4, 0]} center distanceFactor={9}>
        <div style={{
          background: 'rgba(11,99,35,0.92)', border: '1.2px solid #ffd700',
          padding: '2px 8px', borderRadius: '4px', fontSize: '9px',
          fontWeight: 900, color: '#fff', letterSpacing: '0.08em', whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
        }}>
          {label}
        </div>
      </Html>
    </group>
  );
}

// ── Building component with architectural details ──
function NeonBuilding({ id, pos, size, color, neon, label }) {
  const [x, z] = pos;
  const [w, h, d] = size;
  const y = h / 2;

  // Custom tiers to make it look like a gorgeous hotel tower instead of a boring block
  const isCasino = id === 'casino';
  
  return (
    <group position={[x, 0, z]}>
      {/* Tier 1 (Base Box) */}
      <mesh position={[0, y, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Skyscraper glowing windows grid */}
      <WindowGrid width={w} height={h} depth={d} cols={isCasino ? 6 : 4} rows={isCasino ? 7 : 5} />

      {/* Tier 2 (Upper Tower - only for main Casino and Banks) */}
      {(isCasino || id === 'bank' || id === 'police') && (
        <group position={[0, h, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w * 0.75, h * 0.6, d * 0.75]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.4} />
          </mesh>
          {/* Glowing windows on upper tier */}
          <WindowGrid width={w * 0.75} height={h * 0.6} depth={d * 0.75} cols={3} rows={3} />
          
          {/* Tier 2 neon outline */}
          <mesh position={[0, h * 0.6 + 0.05, 0]}>
            <boxGeometry args={[w * 0.75 + 0.1, 0.1, d * 0.75 + 0.1]} />
            <meshStandardMaterial color={neon} emissive={neon} emissiveIntensity={3} />
          </mesh>
        </group>
      )}

      {/* Golden trim accent columns in the corners */}
      {[[ -w/2, -d/2 ], [ w/2, -d/2 ], [ -w/2, d/2 ], [ w/2, d/2 ]].map(([cx, cz], idx) => (
        <mesh key={idx} position={[cx, y, cz]}>
          <cylinderGeometry args={[0.2, 0.2, h, 8]} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}

      {/* Glowing neon fascia on the top edges of the base tier */}
      <mesh position={[0, h + 0.06, 0]}>
        <boxGeometry args={[w + 0.14, 0.14, d + 0.14]} />
        <meshStandardMaterial color={neon} emissive={neon} emissiveIntensity={3.2} />
      </mesh>

      {/* Rotating searchlights on top of casino, bank, and HQ */}
      {(isCasino || id === 'police') && (
        <SkySearchlight position={[0, isCasino ? h * 1.6 + 0.2 : h + 0.2, 0]} color={neon} />
      )}

      {/* Point light for facade lighting */}
      <pointLight position={[0, h + 1.8, 0]} color={neon} intensity={2.5} distance={16} decay={2} />

      {/* Label Sign in 3D (Html overlay for sharp rendering) */}
      <Html position={[0, isCasino ? h * 1.6 + 1.4 : h + 0.9, 0]} center distanceFactor={14}>
        <div style={{
          background: 'rgba(0,0,0,0.9)',
          border: `2px solid ${neon}`,
          color: '#fff',
          padding: '4px 14px',
          borderRadius: '6px',
          fontWeight: 900,
          fontSize: '11px',
          letterSpacing: '0.14em',
          textShadow: `0 0 6px ${neon}`,
          boxShadow: `0 0 15px ${neon}55`,
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
        }}>
          {label}
        </div>
      </Html>
    </group>
  );
}

// ── Streetlight Component ──
function Streetlight({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 2.2, 0]}>
        <cylinderGeometry args={[0.06, 0.12, 4.4, 8]} />
        <meshStandardMaterial color="#c5a049" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 4.4, 0]}>
        <boxGeometry args={[0.4, 0.12, 0.4]} />
        <meshStandardMaterial color="#ffd700" metalness={0.9} />
      </mesh>
      {[-0.3, 0.3].map((dx, idx) => (
        <group key={idx} position={[dx, 4.25, 0]}>
          <mesh>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial color="#fffad2" emissive="#ffe680" emissiveIntensity={3.8} />
          </mesh>
          <pointLight color="#ffd066" intensity={2.4} distance={12} decay={2} />
        </group>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN ENVIRONMENT COMPONENT
// ─────────────────────────────────────────────────────────────
export default function CasinoMap({ phase = 'DAY' }) {
  const isNight = phase === 'NIGHT';

  // Ground patterns memoized
  const carpetPattern = useMemo(() => {
    const lines = [];
    for (let i = -45; i <= 45; i += 15) {
      lines.push(
        { pos: [i, 0.002, 0], rot: [0, 0, 0], size: [0.08, 90] },
        { pos: [0, 0.002, i], rot: [0, Math.PI / 2, 0], size: [0.08, 90] }
      );
    }
    return lines;
  }, []);

  return (
    <group>
      {/* ── Sky & Lighting Settings ── */}
      <ambientLight intensity={isNight ? 0.18 : 0.7} color={isNight ? '#16092e' : '#fff0df'} />
      <directionalLight
        position={[25, 45, 15]}
        intensity={isNight ? 0.12 : 1.6}
        color={isNight ? '#3a2e7c' : '#ffe0b2'}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={140}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      {isNight && (
        <pointLight position={[-20, 60, -20]} color="#7c8cff" intensity={1.2} distance={180} />
      )}

      {/* ── Floor: Royal Purple/Crimson Carpet ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[92, 92]} />
        <meshStandardMaterial
          color={isNight ? '#1c0628' : '#33083d'}
          roughness={0.85}
          metalness={0.08}
        />
      </mesh>

      {/* ── Floor Accents (Luxury Gold grid lines) ── */}
      {carpetPattern.map((line, idx) => (
        <mesh key={idx} position={line.pos} rotation={line.rot} receiveShadow>
          <planeGeometry args={line.size} />
          <meshStandardMaterial color="#b8860b" roughness={0.4} metalness={0.9} />
        </mesh>
      ))}

      {/* ── VIP Red Carpets leading to entrances ── */}
      <RedCarpet pos={[-28, 22.0]} size={[3.5, 6]} rotation={0} /> {/* Bar */}
      <RedCarpet pos={[0, -24.5]} size={[4.2, 5]} rotation={0} />  {/* Casino Royale (in front!) */}
      <RedCarpet pos={[-28, -22.0]} size={[3.5, 6]} rotation={0} /> {/* Gold Bank */}

      {/* ── Golden Marble Road Cross ── */}
      <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5, 90]} />
        <meshStandardMaterial color="#221e16" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} receiveShadow>
        <planeGeometry args={[5, 90]} />
        <meshStandardMaterial color="#221e16" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Golden Road center trims */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.12, 90]} />
        <meshStandardMaterial color="#ffd700" emissive="#b8860b" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[0.12, 90]} />
        <meshStandardMaterial color="#ffd700" emissive="#b8860b" emissiveIntensity={0.8} />
      </mesh>

      {/* Outer Golden boundary trim */}
      {[
        { pos: [0, 0.02, -46],  rot: [0, 0, 0],           size: [92, 0.15, 0.3] },
        { pos: [0, 0.02,  46],  rot: [0, 0, 0],           size: [92, 0.15, 0.3] },
        { pos: [-46, 0.02, 0],  rot: [0, Math.PI / 2, 0], size: [92, 0.15, 0.3] },
        { pos: [ 45, 0.02, 0],  rot: [0, Math.PI / 2, 0], size: [92, 0.15, 0.3] },
      ].map((b, i) => (
        <mesh key={i} position={b.pos} rotation={b.rot}>
          <boxGeometry args={b.size} />
          <meshStandardMaterial color="#ffd700" metalness={0.9} emissive="#ffd700" emissiveIntensity={1.2} />
        </mesh>
      ))}

      {/* ── Buildings ── */}
      {BUILDINGS.map((b) => (
        <NeonBuilding key={b.id} id={b.id} pos={b.pos} size={b.size} color={b.color} neon={b.neon} label={b.label} />
      ))}

      {/* ── Potted Palm Trees along paths ── */}
      {[[ -6, 12 ], [ 6, 12 ], [ -6, -12 ], [ 6, -12 ], [ -12, 6 ], [ 12, 6 ], [ -12, -6 ], [ 12, -6 ]].map(([x, z], i) => (
        <PalmTree key={i} position={[x, 0, z]} />
      ))}

      {/* ── Casino Table Props in game zones ── */}
      <CasinoTable position={[-16, 0, 16]} label="ROULETTE VIP" />
      <CasinoTable position={[16, 0, 16]} label="TEXAS HOLD'EM" />

      {/* ── Card Suits floating sculptures ── */}
      <CardSuitProp type="spade" position={[0, 11.5, -32]} color="#ffd700" size={1.8} />   {/* Casino Royale Spade */}
      <CardSuitProp type="diamond" position={[-28, 7.5, -28]} color="#ff1133" size={1.5} /> {/* Gold Bank Diamond */}
      <CardSuitProp type="club" position={[28, 7.0, -28]} color="#2277ff" size={1.5} />     {/* Sheriff HQ Club */}
      <CardSuitProp type="heart" position={[28, 5.5, 28]} color="#cc22ff" size={1.4} />     {/* Lounge Heart */}

      {/* ── Scattered Glowing Dice ── */}
      <GlowingDice position={[-14, 0.8, -14]} rotation={[0.4, 0.8, 0.1]} />
      <GlowingDice position={[14, 0.8, -14]} rotation={[0.2, 0.5, 0.6]} />

      {/* ── Streetlights ── */}
      {[[ -10, 10 ], [ 10, 10 ], [ -10, -10 ], [ 10, -10 ], [ -22, 22 ], [ 22, 22 ], [ -22, -22 ], [ 22, -22 ]].map(([x, z], i) => (
        <Streetlight key={i} position={[x, 0, z]} />
      ))}

      {/* ── Gold Discussion Fountain at [0,0] ── */}
      <group position={[FOUNTAIN_POS[0], 0, FOUNTAIN_POS[1]]}>
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.5, 3.2, 48]} />
          <meshStandardMaterial
            color="#ffd700"
            emissive="#ffd700"
            emissiveIntensity={2.5}
            transparent
            opacity={0.85}
          />
        </mesh>
        
        <mesh position={[0, 0.12, 0]} castShadow>
          <cylinderGeometry args={[2.0, 2.2, 0.24, 32]} />
          <meshStandardMaterial color="#c5a049" metalness={0.95} roughness={0.1} />
        </mesh>
        
        <mesh position={[0, 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.32, 1.2, 12]} />
          <meshStandardMaterial color="#c5a049" metalness={0.95} roughness={0.1} />
        </mesh>

        <CardSuitProp type="spade" position={[0, 2.2, 0]} color="#ffd700" size={0.8} />

        <mesh position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.9, 32]} />
          <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={1.5} transparent opacity={0.65} />
        </mesh>

        <pointLight position={[0, 1.2, 0]} color="#00ffff" intensity={3.5} distance={12} decay={2} />
      </group>

      {/* Atmosphere Night Fog */}
      {isNight && <fog attach="fog" args={['#06020c', 35, 95]} />}
    </group>
  );
}
