// GameMapPage — the full 3D Mafia game map experience.
// • R3F 3D Casino Royale scene with WASD + mouse-look character controller
// • Real-time Socket.IO sync (player-move, send-chat, phase-change, votes)
// • Discussion fountain (day-time meeting spot)
// • Left: players list, role panel, chat
// • Top: day/night clock + alive count
// • Right: mini-map + action buttons (REPORT, USE, CROUCH, RUN)
// • Bottom: TASKS, MAP, INTERACT, EMOTE, INVENTORY
// • Voting modal (day phase)

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky, Stars } from "@react-three/drei";
import * as THREE from "three";
import {
  Wifi,
  Settings,
  Mic,
  MicOff,
  Map as MapIcon,
  Megaphone,
  Hand,
  ChevronUp,
  ClipboardList,
  MapPin,
  Smile,
  Briefcase,
  Send,
  Skull,
  Shield,
  Heart,
  User,
  Swords,
  Vote,
} from "lucide-react";
import { getSocket, disconnectSocket } from "../services/socket.js";
import { getRoomDetails } from "../services/roomService.js";
import CasinoMap, {
  BUILDINGS,
  FOUNTAIN_POS,
} from "../components/CasinoMap.jsx";
import PlayerAvatar from "../components/PlayerAvatar.jsx";

// ── role meta ──────────────────────────────────────────────
const ROLE_META = {
  mafia: {
    label: "MAFIA",
    color: "#ff3344",
    icon: <Swords size={20} />,
    abilities: [
      { name: "Kill", count: 1 },
      { name: "Sabotage", count: 2 },
      { name: "Fake Task", count: 2 },
      { name: "Hide Body", count: 1 },
    ],
  },
  police: {
    label: "POLICE",
    color: "#4488ff",
    icon: <Shield size={20} />,
    abilities: [
      { name: "Investigate", count: 1 },
      { name: "Arrest", count: 1 },
    ],
  },
  doctor: {
    label: "DOCTOR",
    color: "#44cc88",
    icon: <Heart size={20} />,
    abilities: [
      { name: "Save", count: 1 },
      { name: "Self-Save", count: 1 },
    ],
  },
  villager: {
    label: "VILLAGER",
    color: "#dddddd",
    icon: <User size={20} />,
    abilities: [{ name: "Vote", count: 1 }],
  },
};

const NAME_COLORS = [
  "#ff66b2",
  "#ffa726",
  "#66bb6a",
  "#42a5f5",
  "#ab47bc",
  "#ec407a",
  "#26a69a",
  "#ffee58",
];

// ── Character controller (3rd-person follow camera + WASD) ──
function CharacterController({
  position,
  setPosition,
  rotation,
  setRotation,
  onMoving,
}) {
  const { camera } = useThree();
  const keys = useRef({});
  const yaw = useRef(rotation);
  const dragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const moveAccumRef = useRef(0);

  useEffect(() => {
    const dn = (e) => {
      keys.current[e.code] = true;
    };
    const up = (e) => {
      keys.current[e.code] = false;
    };
    const md = (e) => {
      if (e.button === 2) {
        dragging.current = true;
        lastMouse.current = { x: e.clientX, y: e.clientY };
      }
    };
    const mu = (e) => {
      if (e.button === 2) dragging.current = false;
    };
    const mm = (e) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastMouse.current.x;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      yaw.current -= dx * 0.005;
    };
    const ctx = (e) => e.preventDefault();
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    window.addEventListener("mousedown", md);
    window.addEventListener("mouseup", mu);
    window.addEventListener("mousemove", mm);
    window.addEventListener("contextmenu", ctx);
    return () => {
      window.removeEventListener("keydown", dn);
      window.removeEventListener("keyup", up);
      window.removeEventListener("mousedown", md);
      window.removeEventListener("mouseup", mu);
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("contextmenu", ctx);
    };
  }, []);

  useFrame((state, delta) => {
    const k = keys.current;
    const sprint = k["ShiftLeft"] || k["ShiftRight"];
    const speed = (sprint ? 9 : 5) * delta;
    let dx = 0,
      dz = 0;
    if (k["KeyW"] || k["ArrowUp"]) dz -= 1;
    if (k["KeyS"] || k["ArrowDown"]) dz += 1;
    if (k["KeyA"] || k["ArrowLeft"]) dx -= 1;
    if (k["KeyD"] || k["ArrowRight"]) dx += 1;
    const moving = dx !== 0 || dz !== 0;
    if (moving) {
      const len = Math.hypot(dx, dz);
      dx /= len;
      dz /= len;
      const cos = Math.cos(yaw.current),
        sin = Math.sin(yaw.current);
      const worldDx = dx * cos - dz * sin;
      const worldDz = dx * sin + dz * cos;
      const nx = position[0] + worldDx * speed;
      const nz = position[2] + worldDz * speed;
      // Boundary + simple collision with buildings
      const blocked = BUILDINGS.some((b) => {
        if (b.id === "garden" || b.id === "helipad") return false; // flat zones
        const [bx, bz] = b.pos;
        const [bw, , bd] = b.size;
        return (
          Math.abs(nx - bx) < bw / 2 + 0.4 && Math.abs(nz - bz) < bd / 2 + 0.4
        );
      });
      const outOfBounds = Math.abs(nx) > 43 || Math.abs(nz) > 43;
      if (!blocked && !outOfBounds) {
        setPosition([nx, 0, nz]);
        // face movement direction
        const heading = Math.atan2(worldDx, worldDz);
        setRotation(heading);
      }
      moveAccumRef.current += delta;
    }
    onMoving(moving);

    // 3rd-person camera
    const camDist = 9,
      camHeight = 5.5;
    const cx = position[0] - Math.sin(yaw.current) * camDist;
    const cz = position[2] - Math.cos(yaw.current) * camDist;
    camera.position.lerp(
      { x: cx, y: camHeight, z: cz },
      Math.min(1, delta * 6),
    );
    camera.lookAt(position[0], 1.4, position[2]);
  });

  return null;
}

// ── Tiny scene component that owns my player + remote players ──
function Scene({
  myPos,
  setMyPos,
  myRot,
  setMyRot,
  players,
  phase,
  onMovingChange,
  myName,
  myColor,
  myRole,
  isAlive,
}) {
  return (
    <>
      {phase === "NIGHT" ? (
        <>
          <color attach="background" args={["#04020a"]} />
          <Stars
            radius={120}
            depth={50}
            count={3000}
            factor={4}
            fade
            speed={1}
          />
        </>
      ) : (
        <>
          <color attach="background" args={["#1a1525"]} />
          <Sky
            distance={450000}
            sunPosition={[10, 8, -5]}
            inclination={0.49}
            azimuth={0.25}
            turbidity={8}
            rayleigh={2}
          />
        </>
      )}
      <CasinoMap phase={phase} />
      <CharacterController
        position={myPos}
        setPosition={setMyPos}
        rotation={myRot}
        setRotation={setMyRot}
        onMoving={onMovingChange}
      />
      {/* My avatar */}
      <PlayerAvatar
        position={myPos}
        rotation={myRot}
        color={myColor}
        name={myName}
        role={myRole}
        isMe
        isAlive={isAlive}
      />
      {/* Remote players */}
      {players.map((p) => (
        <PlayerAvatar
          key={p.id}
          position={[
            p.position?.x || 0,
            p.position?.y || 0,
            p.position?.z || 0,
          ]}
          rotation={p.rotation || 0}
          color={p.color}
          name={p.username}
          isAlive={p.isAlive !== false}
          walking={!!p.walking}
        />
      ))}
    </>
  );
}

// ── Mini-map (top-right) ─────────────────────────────────────
function MiniMap({ myPos, players, myColor }) {
  const W = 180,
    H = 140;
  const worldToMap = (x, z) => ({
    left: ((x + 45) / 90) * W,
    top: ((z + 45) / 90) * H,
  });
  return (
    <div
      data-testid="mini-map"
      style={{
        width: W,
        height: H,
        position: "relative",
        background:
          "radial-gradient(ellipse at center, rgba(50,30,40,0.85), rgba(10,5,15,0.95))",
        border: "1.5px solid rgba(255,180,80,0.4)",
        borderRadius: 90,
        overflow: "hidden",
        boxShadow: "0 0 16px rgba(0,0,0,0.6)",
      }}
    >
      {BUILDINGS.map((b) => {
        const { left, top } = worldToMap(b.pos[0], b.pos[1]);
        const [w, , d] = b.size;
        return (
          <div
            key={b.id}
            style={{
              position: "absolute",
              left: left - ((w / 90) * W) / 2,
              top: top - ((d / 90) * H) / 2,
              width: (w / 90) * W,
              height: (d / 90) * H,
              background: "rgba(120,80,60,0.55)",
              border: `1px solid ${b.neon}77`,
              fontSize: 7,
              color: "#fff",
              textAlign: "center",
              lineHeight: "8px",
              paddingTop: 2,
              fontWeight: 700,
              letterSpacing: "0.04em",
            }}
          >
            {b.label.split(" ")[0]}
          </div>
        );
      })}
      {/* Fountain */}
      <div
        style={{
          position: "absolute",
          left: worldToMap(FOUNTAIN_POS[0], FOUNTAIN_POS[1]).left - 5,
          top: worldToMap(FOUNTAIN_POS[0], FOUNTAIN_POS[1]).top - 5,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "#ffd700",
          boxShadow: "0 0 8px #ffd700",
        }}
      />
      {/* Other players */}
      {players.map((p) => {
        const { left, top } = worldToMap(
          p.position?.x || 0,
          p.position?.z || 0,
        );
        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: left - 3,
              top: top - 3,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: p.color || "#fff",
              boxShadow: `0 0 4px ${p.color || "#fff"}`,
            }}
          />
        );
      })}
      {/* Me (arrow) */}
      {(() => {
        const { left, top } = worldToMap(myPos[0], myPos[2]);
        return (
          <div
            style={{
              position: "absolute",
              left: left - 6,
              top: top - 6,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: myColor,
              border: "2px solid #fff",
              boxShadow: `0 0 8px ${myColor}`,
            }}
          />
        );
      })()}
    </div>
  );
}

// ── Voting Panel (modal) ─────────────────────────────────────
function VotingPanel({ players, tally, onVote, onClose, myId }) {
  return (
    <div
      data-testid="voting-panel"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(180deg, rgba(20,8,15,0.98), rgba(8,4,10,0.98))",
          border: "1.5px solid rgba(255,68,85,0.4)",
          borderRadius: 16,
          padding: 28,
          width: 520,
          maxWidth: "92vw",
          color: "#fff",
        }}
      >
        <h2
          style={{
            fontSize: 22,
            color: "#ff4455",
            letterSpacing: "0.06em",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Vote size={22} /> VOTE TO ELIMINATE
        </h2>
        <p style={{ color: "#aaa", fontSize: 12, margin: "6px 0 16px" }}>
          Pick the player you suspect is Mafia. Day discussion happens at the
          fountain.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            maxHeight: 320,
            overflowY: "auto",
          }}
        >
          {players
            .filter((p) => p.id !== myId && p.isAlive !== false)
            .map((p) => {
              const votes = tally[p.id] || 0;
              return (
                <button
                  key={p.id}
                  data-testid={`vote-${p.id}`}
                  onClick={() => onVote(p.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,68,85,0.2)",
                    color: "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.18s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,68,85,0.12)";
                    e.currentTarget.style.borderColor = "#ff4455";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.borderColor = "rgba(255,68,85,0.2)";
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: p.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                    }}
                  >
                    {p.username?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {p.username}
                    </div>
                    <div style={{ fontSize: 11, color: "#888" }}>
                      {votes} vote{votes !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <Skull size={16} color="#ff4455" />
                </button>
              );
            })}
        </div>
        <button
          onClick={onClose}
          data-testid="voting-close"
          style={{
            marginTop: 18,
            width: "100%",
            padding: "12px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#aaa",
            cursor: "pointer",
            letterSpacing: "0.06em",
            fontWeight: 700,
          }}
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function GameMapPage() {
  const { roomId = "demo" } = useParams();
  const navigate = useNavigate();

  // In-memory token lock on mount to prevent multi-tab token sharing overrides
  const tokenRef = useRef(localStorage.getItem("token"));

  const myId = useMemo(() => {
    try {
      const token = tokenRef.current;
      if (!token) return `guest-${Math.random().toString(36).slice(2, 7)}`;
      return JSON.parse(atob(token.split(".")[1]))._id;
    } catch {
      return `guest-${Math.random().toString(36).slice(2, 7)}`;
    }
  }, []);

  const [myName, setMyName] = useState(() => {
    return localStorage.getItem("username") || localStorage.getItem("mafia_username") || `Player_${myId.slice(-4)}`;
  });

  const myColor = useMemo(
    () =>
      NAME_COLORS[
        Math.abs(myId.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) %
          NAME_COLORS.length
      ],
    [myId],
  );

  // Game state
  const [myPos, setMyPos] = useState([0, 0, 6]);
  const [myRot, setMyRot] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [players, setPlayers] = useState([]); // remote players
  const [phase, setPhase] = useState("DAY");
  const [timer, setTimer] = useState(165);
  const [day, setDay] = useState(1);
  const [myRole, setMyRole] = useState("villager");
  const [isAlive, setIsAlive] = useState(true);
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [voteTally, setVoteTally] = useState({});
  const [showVote, setShowVote] = useState(false);
  const [muted, setMuted] = useState(false);

  const chatBoxRef = useRef(null);
  const lastEmitRef = useRef(0);

  // Fetch real game state & roles from backend API on mount using locked token
  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const token = tokenRef.current;
        const response = await getRoomDetails(token, roomId);
        if (response.data?.success) {
          const room = response.data.room;

          // Resolve dynamic username
          if (room?.users) {
            const me = room.users.find(u => (u._id?.toString() || u.toString()) === myId);
            if (me?.username) setMyName(me.username);
          }

          // Resolve role & status
          if (response.data.myRole) {
            setMyRole(response.data.myRole);
          } else if (room?.playersState) {
            const myState = room.playersState.find(p => {
              const pid = p.user?._id?.toString() || p.user?.toString();
              return pid === myId;
            });
            if (myState?.role) setMyRole(myState.role);
            if (myState) setIsAlive(myState.isAlive !== false);
          }
        }
      } catch (err) {
        console.error("Error fetching room role info:", err);
      }
    };
    if (roomId && roomId !== "demo") {
      fetchGameDetails();
    }
  }, [roomId, myId]);

  // Connect socket & wire events
  useEffect(() => {
    // Wait until the real user profile is loaded from the database
    if (myName === "Player") return;

    const sock = getSocket();
    sock.emit("join-map", roomId, {
      username: myName,
      color: myColor,
      role: myRole,
      position: { x: myPos[0], y: 0, z: myPos[2] },
    });

    const onSnapshot = (snap) => {
      setPlayers((snap.players || []).filter((p) => p.id !== sock.id));
      setPhase(snap.phase || "DAY");
      setTimer(snap.timer || 0);
      setDay(snap.day || 1);
    };
    const onJoin = (p) => {
      setPlayers((prev) =>
        prev.find((x) => x.id === p.id) ? prev : [...prev, p],
      );
      setChat((c) => [
        ...c,
        {
          sender: "System",
          text: `${p.username} entered the map`,
          color: "#5ad15a",
        },
      ]);
    };
    const onMove = (p) => {
      setPlayers((prev) =>
        prev.map((x) =>
          x.id === p.id
            ? {
                ...x,
                position: p.position,
                rotation: p.rotation,
                walking: true,
              }
            : x,
        ),
      );
    };
    const onLeave = ({ id }) =>
      setPlayers((prev) => prev.filter((p) => p.id !== id));
    const onChat = (m) => setChat((c) => [...c, m]);
    const onPhase = (d) => {
      setPhase(d.phase);
      setTimer(d.timer);
      setDay(d.day);
      setVoteTally({});
    };
    const onTick = (d) => {
      setTimer(d.timer);
      setPhase(d.phase);
      setDay(d.day);
    };
    const onVote = (d) => setVoteTally(d.tally || {});

    sock.on("map-snapshot", onSnapshot);
    sock.on("player-joined", onJoin);
    sock.on("player-moved", onMove);
    sock.on("player-left", onLeave);
    sock.on("receive-chat", onChat);
    sock.on("phase-change", onPhase);
    sock.on("phase-tick", onTick);
    sock.on("vote-update", onVote);

    return () => {
      sock.off("map-snapshot", onSnapshot);
      sock.off("player-joined", onJoin);
      sock.off("player-moved", onMove);
      sock.off("player-left", onLeave);
      sock.off("receive-chat", onChat);
      sock.off("phase-change", onPhase);
      sock.off("phase-tick", onTick);
      sock.off("vote-update", onVote);
      disconnectSocket();
    };
  }, [roomId, myName, myColor, myRole]);

  // Clear "walking" indicator on other players after 200ms of no updates
  useEffect(() => {
    const t = setInterval(() => {
      setPlayers((prev) => prev.map((p) => ({ ...p, walking: false })));
    }, 400);
    return () => clearInterval(t);
  }, []);

  // Throttle outgoing position updates (every ~80ms)
  useEffect(() => {
    const now = performance.now();
    if (now - lastEmitRef.current < 70) return;
    lastEmitRef.current = now;
    const sock = getSocket();
    sock.emit("player-move", roomId, {
      position: { x: myPos[0], y: myPos[1], z: myPos[2] },
      rotation: myRot,
    });
  }, [myPos, myRot, roomId]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatBoxRef.current)
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }, [chat]);

  const sendChat = useCallback(
    (e) => {
      e?.preventDefault?.();
      if (!chatInput.trim()) return;
      const sock = getSocket();
      sock.emit("send-chat", roomId, {
        sender: myName,
        text: chatInput,
        color: myColor,
        ts: Date.now(),
      });
      setChatInput("");
    },
    [chatInput, roomId, myName, myColor],
  );

  const castVote = (targetId) => {
    const sock = getSocket();
    sock.emit("cast-vote", roomId, { targetId });
    setChat((c) => [
      ...c,
      {
        sender: "System",
        text: `You voted to eliminate a player.`,
        color: "#ffd700",
      },
    ]);
  };

  // Timer mm:ss formatter
  const mmss = useMemo(() => {
    const m = Math.floor(timer / 60)
      .toString()
      .padStart(2, "0");
    const s = (timer % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [timer]);

  const meta = ROLE_META[myRole] || ROLE_META.villager;
  const aliveCount = 1 + players.filter((p) => p.isAlive !== false).length;
  const totalPlayers = aliveCount; // demo

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        overflow: "hidden",
        color: "#fff",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 6, 10], fov: 55 }}
        style={{ position: "absolute", inset: 0 }}
        data-testid="game-3d-canvas"
      >
        <Scene
          myPos={myPos}
          setMyPos={setMyPos}
          myRot={myRot}
          setMyRot={setMyRot}
          players={players}
          phase={phase}
          onMovingChange={setIsMoving}
          myName={myName}
          myColor={myColor}
          myRole={myRole}
          isAlive={isAlive}
        />
      </Canvas>

      {/* TOP-LEFT: Room banner */}
      <div
        data-testid="hud-room-banner"
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          padding: "10px 20px",
          background: "linear-gradient(135deg, rgba(30,10,40,0.85) 0%, rgba(10,5,20,0.95) 100%)",
          backdropFilter: "blur(12px)",
          border: "1.5px solid #ffd70044",
          borderRadius: 14,
          boxShadow: "0 0 15px rgba(255, 215, 0, 0.15)",
          display: "flex",
          alignItems: "center",
          gap: 14,
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontWeight: 900,
            letterSpacing: "0.15em",
            fontSize: 14,
            color: "#ffd700",
            textShadow: "0 0 8px rgba(255, 215, 0, 0.6)",
          }}
        >
          🎰 CASINO ROYALE
        </span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            color: "#5ad15a",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          <Wifi size={13} /> 48ms
        </span>
      </div>

      {/* LEFT: Players Alive list */}
      <div
        data-testid="hud-players-list"
        style={{
          position: "absolute",
          top: 74,
          left: 16,
          width: 270,
          background: "linear-gradient(180deg, rgba(28,9,38,0.85) 0%, rgba(8,4,12,0.95) 100%)",
          backdropFilter: "blur(12px)",
          border: "1.5px solid rgba(255, 215, 0, 0.25)",
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
            fontSize: 12,
            color: "#ffd700",
            fontWeight: 800,
            letterSpacing: "0.05em",
            borderBottom: "1px solid rgba(255, 215, 0, 0.15)",
            paddingBottom: 6,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>👥 Players Alive</span>
          <span style={{ color: "#5ad15a", background: 'rgba(90,209,90,0.1)', padding: '2px 8px', borderRadius: 8 }}>
            {aliveCount}/{totalPlayers}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 180, overflowY: 'auto' }}>
          {[
            { id: myId, username: myName, color: myColor, isAlive },
            ...players,
          ].map((p, i) => (
            <div
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: 'rgba(255,255,255,0.03)',
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <span style={{ color: "#ffd70088", fontSize: 11, fontWeight: 700, width: 12 }}>
                {i + 1}
              </span>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: p.color,
                  border: '1.5px solid #fff',
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 900,
                  color: '#000',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                {p.username?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: p.isAlive !== false ? '#fff' : '#888' }}>
                  {p.username}
                </div>
                <div
                  style={{
                    height: 3,
                    background: p.isAlive !== false ? "#5ad15a" : "#ff4455",
                    borderRadius: 2,
                    marginTop: 2,
                    boxShadow: p.isAlive !== false ? '0 0 6px #5ad15a' : '0 0 6px #ff4455',
                  }}
                />
              </div>
              {p.id === myId ? (
                <span
                  style={{
                    fontSize: 8,
                    background: "linear-gradient(90deg, #7c3aed, #4f46e5)",
                    padding: "2px 6px",
                    borderRadius: 6,
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                  }}
                >
                  YOU
                </span>
              ) : !p.isAlive && (
                <span style={{ fontSize: 10 }}>💀</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* LEFT-MIDDLE: Role panel */}
      <div
        data-testid="hud-role-panel"
        style={{
          position: "absolute",
          bottom: 280,
          left: 16,
          width: 270,
          background: "linear-gradient(135deg, rgba(15,8,25,0.9) 0%, rgba(5,2,10,0.96) 100%)",
          backdropFilter: "blur(12px)",
          border: `1.5px solid ${meta.color}`,
          boxShadow: `0 0 16px ${meta.color}33, inset 0 0 12px rgba(255, 215, 0, 0.1)`,
          borderRadius: 16,
          padding: 16,
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div style={{
            color: meta.color,
            background: `${meta.color}18`,
            padding: 8,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 8px ${meta.color}22`
          }}>{meta.icon}</div>
          <div>
            <div
              style={{ fontSize: 9, color: "#aaa", letterSpacing: "0.15em", fontWeight: 800 }}
            >
              YOUR ASSIGNED FATE
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: meta.color,
                letterSpacing: "0.08em",
                textShadow: `0 0 8px ${meta.color}55`,
              }}
            >
              {meta.label}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 10, color: "#ffd700", fontWeight: 800, letterSpacing: '0.05em', marginBottom: 8 }}>
          SPECIAL ABILITIES
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {meta.abilities.map((a, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: 'center',
                padding: "6px 10px",
                fontSize: 12,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.03)',
                borderRadius: 8,
              }}
            >
              <span style={{ color: '#eee', fontWeight: 600 }}>✦ {a.name}</span>
              <span style={{ color: meta.color, fontWeight: 900, fontSize: 11, background: `${meta.color}15`, padding: '1px 6px', borderRadius: 4 }}>
                {a.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* LEFT-BOTTOM: Chat */}
      <div
        data-testid="hud-chat"
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          width: 320,
          background: "linear-gradient(180deg, rgba(12,4,18,0.85) 0%, rgba(5,2,8,0.95) 100%)",
          backdropFilter: "blur(12px)",
          border: "1.5px solid rgba(255, 215, 0, 0.2)",
          borderRadius: 16,
          padding: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div
          ref={chatBoxRef}
          style={{
            height: 150,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            fontSize: 12,
            paddingRight: 4,
          }}
        >
          {chat.length === 0 && (
            <div style={{ color: "#555", textAlign: "center", marginTop: 55, fontSize: 11 }}>
              No messages in chat ledger yet.
            </div>
          )}
          {chat.map((m, i) => (
            <div key={i} style={{
              background: m.sender === 'System' ? 'transparent' : 'rgba(255,255,255,0.02)',
              padding: m.sender === 'System' ? '2px 0' : '4px 8px',
              borderRadius: 6,
            }}>
              {m.sender === "System" ? (
                <span
                  style={{ color: m.color || "#ffd700", fontStyle: "italic", fontWeight: 600 }}
                >
                  🔔 {m.text}
                </span>
              ) : (
                <span>
                  <span
                    style={{ color: m.color || "#ff4455", fontWeight: 800 }}
                  >
                    {m.sender}:
                  </span>{" "}
                  <span style={{ color: "#eee", fontWeight: 500 }}>{m.text}</span>
                </span>
              )}
            </div>
          ))}
        </div>
        <form onSubmit={sendChat} style={{ display: "flex", gap: 6 }}>
          <input
            data-testid="chat-input"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Whisper to room..."
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(0,0,0,0.5)",
              border: "1.2px solid rgba(255, 215, 0, 0.25)",
              color: "#fff",
              outline: "none",
              fontSize: 12,
            }}
          />
          <button
            data-testid="chat-send"
            type="submit"
            style={{
              padding: "6px 16px",
              borderRadius: 10,
              background: "linear-gradient(135deg, #cc1122, #99000a)",
              border: "1px solid #ff445555",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: "0.08em",
            }}
          >
            SEND
          </button>
        </form>
      </div>

      {/* TOP CENTER: Day/Night clock */}
      <div
        data-testid="hud-phase-clock"
        style={{
          position: "absolute",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          background: "linear-gradient(180deg, rgba(20,10,30,0.88) 0%, rgba(8,4,12,0.96) 100%)",
          backdropFilter: "blur(12px)",
          border: "1.5px solid #ffd700",
          boxShadow: '0 0 15px rgba(255, 215, 0, 0.2), 0 8px 32px rgba(0,0,0,0.5)',
          borderRadius: 14,
          padding: "10px 26px",
          display: "flex",
          alignItems: "center",
          gap: 18,
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: 26 }}>{phase === "NIGHT" ? "🌙" : "☀️"}</span>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#888", letterSpacing: "0.1em" }}>
            {phase} · Day {day}
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 900,
              fontFamily: "monospace",
              color: phase === "NIGHT" ? "#7c8cff" : "#ffe066",
            }}
          >
            {mmss}
          </div>
          <div style={{ fontSize: 10, color: "#5aa8ff" }}>
            {phase === "DAY" ? "Discussion phase" : "Mafia phase"}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#888" }}>Alive</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#5ad15a" }}>
            {aliveCount}
          </div>
        </div>
      </div>

      {/* TOP-RIGHT: side buttons + mini-map */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "flex",
          gap: 14,
          alignItems: "flex-start",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { icon: <Settings size={18} />, t: "settings" },
            { icon: <MapIcon size={18} />, t: "map" },
            {
              icon: muted ? <MicOff size={18} /> : <Mic size={18} />,
              t: "mute",
              onClick: () => setMuted((m) => !m),
            },
          ].map((b) => (
            <button
              key={b.t}
              data-testid={`btn-${b.t}`}
              onClick={b.onClick}
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.7)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.18s",
              }}
            >
              {b.icon}
            </button>
          ))}
        </div>
        <MiniMap myPos={myPos} players={players} myColor={myColor} />
      </div>

      {/* RIGHT-BOTTOM: Action buttons */}
      <div
        data-testid="hud-actions"
        style={{
          position: "absolute",
          right: 20,
          bottom: 24,
          display: "flex",
          flexDirection: "column",
          gap: 14,
          alignItems: "center",
          zIndex: 10,
        }}
      >
        {[
          {
            icon: <Megaphone size={20} />,
            label: "REPORT",
            color: "#ff4455",
            testid: "btn-report",
            onClick: () => phase === "DAY" && setShowVote(true),
          },
          {
            icon: <Hand size={20} />,
            label: "USE",
            color: "#fff",
            testid: "btn-use",
          },
          {
            icon: (
              <ChevronUp size={20} style={{ transform: "rotate(180deg)" }} />
            ),
            label: "CROUCH",
            color: "#fff",
            testid: "btn-crouch",
          },
          {
            icon: <span style={{ fontSize: 18 }}>🏃</span>,
            label: "RUN",
            color: "#fff",
            testid: "btn-run",
          },
        ].map((a) => (
          <button
            key={a.label}
            data-testid={a.testid}
            onClick={a.onClick}
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: a.color === '#ff4455' 
                ? "radial-gradient(circle, #cc1122 0%, #66000a 100%)" 
                : "radial-gradient(circle, #2d2a33 0%, #151319 100%)",
              border: `2px double ${a.color === '#ff4455' ? '#ffd700' : 'rgba(255,255,255,0.4)'}`,
              color: a.color === '#ff4455' ? '#fff' : '#eee',
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              cursor: "pointer",
              backdropFilter: "blur(12px)",
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
              transition: 'all 0.15s ease-in-out',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.borderColor = '#ffd700'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = a.color === '#ff4455' ? '#ffd700' : 'rgba(255,255,255,0.4)'; }}
          >
            {a.icon}
            <span
              style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.08em" }}
            >
              {a.label}
            </span>
          </button>
        ))}
      </div>

      {/* BOTTOM CENTER: HUD buttons */}
      <div
        data-testid="hud-bottom-bar"
        style={{
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 14,
          alignItems: "center",
          zIndex: 10,
        }}
      >
        {[
          {
            icon: <ClipboardList size={18} />,
            label: "TASKS",
            testid: "btn-tasks",
          },
          { icon: <MapPin size={18} />, label: "MAP", testid: "btn-map" },
          {
            icon: <Hand size={20} />,
            label: "Interact",
            testid: "btn-interact",
            big: true,
          },
          { icon: <Smile size={18} />, label: "EMOTE", testid: "btn-emote" },
          {
            icon: <Briefcase size={18} />,
            label: "INVENTORY",
            testid: "btn-inventory",
          },
        ].map((a) => (
          <button
            key={a.label}
            data-testid={a.testid}
            style={{
              width: a.big ? 76 : 58,
              height: a.big ? 76 : 58,
              borderRadius: "50%",
              background: a.big 
                ? "radial-gradient(circle, #b8860b 0%, #5a3d06 100%)" 
                : "radial-gradient(circle, rgba(140,15,30,0.92) 0%, rgba(20,5,10,0.96) 100%)",
              border: a.big ? "2.5px double #ffffff" : "2.5px double #ffd700",
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              cursor: "pointer",
              backdropFilter: "blur(12px)",
              boxShadow: '0 6px 16px rgba(0,0,0,0.6)',
              transition: 'all 0.15s ease-in-out',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.12)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {a.icon}
            <span
              style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.06em", color: a.big ? '#fff' : '#ffd700' }}
            >
              {a.label}
            </span>
          </button>
        ))}
      </div>

      {/* Phase notification banner */}
      {phase === "DAY" && (
        <div
          style={{
            position: "absolute",
            top: 100,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255, 215, 0, 0.12)",
            border: "1px solid #ffd70077",
            color: "#ffd700",
            padding: "6px 16px",
            borderRadius: 20,
            fontSize: 11,
            letterSpacing: "0.1em",
            zIndex: 10,
          }}
        >
          ☀ Day Discussion — head to the golden fountain to meet & vote!
        </div>
      )}

      {/* Vote modal */}
      {showVote && (
        <VotingPanel
          players={[
            { id: myId, username: myName, color: myColor, isAlive },
            ...players,
          ]}
          tally={voteTally}
          onVote={castVote}
          onClose={() => setShowVote(false)}
          myId={myId}
        />
      )}

      {/* Controls hint */}
      <div
        style={{
          position: "absolute",
          bottom: 4,
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 10,
          color: "rgba(255,255,255,0.4)",
          letterSpacing: "0.08em",
          zIndex: 5,
        }}
      >
        WASD to move · Shift to sprint · Right-click + drag to look · Step on
        fountain ring for discussion
      </div>

      {/* Exit button */}
      <button
        data-testid="btn-exit"
        onClick={() => {
          disconnectSocket();
          navigate("/");
        }}
        style={{
          position: "absolute",
          bottom: 6,
          right: 12,
          background: "transparent",
          border: "none",
          color: "rgba(255,255,255,0.4)",
          cursor: "pointer",
          fontSize: 11,
          zIndex: 10,
        }}
      >
        Leave game →
      </button>
    </div>
  );
}
