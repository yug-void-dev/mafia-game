/**
 * PlayerAvatar.jsx
 * A 3D avatar representation of a player in the scene.
 * It shows:
 * - A colorful stylized cylinder body and round head (reminiscent of Mafia/Among Us characters)
 * - An animated walking bounce effect when moving
 * - A floating text label for the player's username above the head
 * - A role badge overlay or special rendering if the player is Dead (ghostly transparent/skull)
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

export default function PlayerAvatar({
  position = [0, 0, 0],
  rotation = 0,
  color = '#ffffff',
  name = 'Player',
  role = '',
  isMe = false,
  isAlive = true,
  walking = false,
}) {
  const groupRef = useRef();
  const bodyRef = useRef();

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Lerp/apply position & rotation directly for smooth network transitions
      groupRef.current.position.set(position[0], position[1], position[2]);
      groupRef.current.rotation.y = rotation;
    }

    if (bodyRef.current) {
      // Bounce animation if walking
      if (walking) {
        bodyRef.current.position.y = 0.9 + Math.abs(Math.sin(clock.elapsedTime * 12)) * 0.15;
        bodyRef.current.rotation.z = Math.sin(clock.elapsedTime * 12) * 0.08;
      } else {
        // Idle breathing
        bodyRef.current.position.y = 0.9 + Math.sin(clock.elapsedTime * 2) * 0.02;
        bodyRef.current.rotation.z = 0;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={bodyRef} position={[0, 0.9, 0]}>
        {/* Main body (cylinder) */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.3, 0.4, 1.0, 16]} />
          <meshStandardMaterial
            color={color}
            roughness={0.7}
            metalness={0.2}
            transparent={!isAlive}
            opacity={isAlive ? 1.0 : 0.35}
          />
        </mesh>

        {/* Head (sphere) */}
        <mesh position={[0, 0.75, 0]} castShadow>
          <sphereGeometry args={[0.26, 16, 16]} />
          <meshStandardMaterial
            color={color}
            roughness={0.7}
            metalness={0.2}
            transparent={!isAlive}
            opacity={isAlive ? 1.0 : 0.35}
          />
        </mesh>

        {/* Face visor (glasses/mask) */}
        <mesh position={[0, 0.78, 0.16]}>
          <boxGeometry args={[0.3, 0.12, 0.15]} />
          <meshStandardMaterial
            color={isAlive ? '#111122' : '#ffffff'}
            roughness={0.1}
            metalness={0.9}
            transparent={!isAlive}
            opacity={isAlive ? 0.9 : 0.4}
          />
        </mesh>

        {/* Dead player indicator (floating halo/skull symbol if dead) */}
        {!isAlive && (
          <mesh position={[0, 1.2, 0]}>
            <torusGeometry args={[0.2, 0.03, 8, 24]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
          </mesh>
        )}
      </group>

      {/* Floating Username and Badge Overlay */}
      <Html position={[0, 2.1, 0]} center distanceFactor={10}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none',
          userSelect: 'none',
          fontFamily: 'Inter, system-ui, sans-serif',
          whiteSpace: 'nowrap',
        }}>
          {/* Role text if shown */}
          {role && isMe && (
            <span style={{
              background: role === 'mafia' ? '#ff3344' : role === 'police' ? '#4488ff' : role === 'doctor' ? '#44cc88' : '#777777',
              color: '#fff',
              fontSize: '8px',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '4px',
              marginBottom: '3px',
              letterSpacing: '0.08em',
              boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}>
              {role.toUpperCase()}
            </span>
          )}

          {/* Username */}
          <span style={{
            background: 'rgba(0, 0, 0, 0.75)',
            color: isAlive ? '#ffffff' : '#aaaaaa',
            border: isMe ? `1.5px solid ${color}` : '1px solid rgba(255,255,255,0.2)',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 700,
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            {!isAlive && '👻 '}
            {name}
            {isMe && ' (You)'}
          </span>
        </div>
      </Html>
    </group>
  );
}
