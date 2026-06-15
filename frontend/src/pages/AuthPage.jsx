import { useState, useEffect, useRef } from "react";
import { User, Lock, Eye, EyeOff, Fingerprint } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

/* ─────────────── Google Fonts ─────────────── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Creepster&family=Special+Elite&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html, body, #root {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    input::placeholder { color: rgba(180,120,120,0.55); }

    @keyframes breathe {
      0%,100% { opacity: 0.82; }
      50%      { opacity: 1; }
    }

    @keyframes drift {
      0%,100% { transform: translateX(0) scaleY(1); }
      33%      { transform: translateX(6px) scaleY(1.04); }
      66%      { transform: translateX(-4px) scaleY(0.98); }
    }

    @keyframes bloodFall {
      0%   { transform: scaleY(0); opacity:0; }
      60%  { opacity:1; }
      100% { transform: scaleY(1); opacity:1; }
    }

    @keyframes sheenSweep {
      0%   { left: -60%; }
      100% { left: 160%; }
    }

    .sheen-btn:hover .sheen-sweep { animation: sheenSweep 0.7s ease forwards; }
  `}</style>
);

/* ─────────────── Three.js Ember Particles ─────────────── */
const ThreeEmbers = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(w, h);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.z = 14;

    // Glow texture
    const sz = 64;
    const tc = document.createElement("canvas");
    tc.width = tc.height = sz;
    const cx = tc.getContext("2d");
    const g = cx.createRadialGradient(
      sz / 2,
      sz / 2,
      0,
      sz / 2,
      sz / 2,
      sz / 2,
    );
    g.addColorStop(0, "rgba(255,100,20,1)");
    g.addColorStop(0.18, "rgba(220,40,10,0.9)");
    g.addColorStop(0.45, "rgba(150,10,0,0.35)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    cx.fillStyle = g;
    cx.fillRect(0, 0, sz, sz);
    const tex = new THREE.CanvasTexture(tc);
    tex.minFilter = THREE.LinearFilter;

    const COUNT = 120;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    const vel = [];
    const seeds = [];

    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      vel.push({
        vy: 0.03 + Math.random() * 0.05,
        xn: 0.006 + Math.random() * 0.014,
        zn: 0.005 + Math.random() * 0.01,
      });
      seeds.push(Math.random() * 100);
    }

    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.75,
      map: tex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    let tx = 0,
      ty = 0,
      mx = 0,
      my = 0;
    const onMouse = (e) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouse);

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      mx += (tx - mx) * 0.04;
      my += (ty - my) * 0.04;
      const pa = geo.attributes.position.array;
      for (let i = 0; i < COUNT; i++) {
        pa[i * 3 + 1] += vel[i].vy;
        pa[i * 3] += Math.sin(t * 0.7 + seeds[i]) * vel[i].xn;
        pa[i * 3 + 2] += Math.cos(t * 0.7 + seeds[i]) * vel[i].zn;
        // mouse repulsion
        const wx = mx * 15,
          wy = my * 10;
        const dx = pa[i * 3] - wx,
          dy = pa[i * 3 + 1] - wy;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 5) {
          const f = (5 - d) * 0.01;
          pa[i * 3] += dx * f;
          pa[i * 3 + 1] += dy * f;
        }
        if (pa[i * 3 + 1] > 12) {
          pa[i * 3 + 1] = -12;
          pa[i * 3] = (Math.random() - 0.5) * 30;
        }
      }
      geo.attributes.position.needsUpdate = true;
      pts.rotation.y = t * 0.01;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      tex.dispose();
      mat.dispose();
      geo.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 3,
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
};

/* ─────────────── Blood Drips SVG ─────────────── */
const BloodDrips = () => {
  const drips = [
    { x: 30, bh: 18, th: 62, w: 4, d: 0.0 },
    { x: 70, bh: 14, th: 40, w: 3, d: 0.3 },
    { x: 105, bh: 22, th: 85, w: 5, d: 0.1 },
    { x: 148, bh: 12, th: 32, w: 3, d: 0.5 },
    { x: 195, bh: 20, th: 78, w: 4, d: 0.2 },
    { x: 250, bh: 16, th: 50, w: 3, d: 0.7 },
    { x: 310, bh: 10, th: 25, w: 3, d: 0.9 },
    { x: 360, bh: 8, th: 20, w: 2, d: 1.1 },
    /* right side */
    { x: 1100, bh: 10, th: 22, w: 2, d: 0.8 },
    { x: 1150, bh: 14, th: 38, w: 3, d: 0.4 },
    { x: 1200, bh: 20, th: 72, w: 4, d: 0.2 },
    { x: 1250, bh: 12, th: 42, w: 3, d: 0.6 },
    { x: 1300, bh: 22, th: 88, w: 5, d: 0.1 },
    { x: 1350, bh: 16, th: 52, w: 3, d: 0.5 },
    { x: 1400, bh: 18, th: 65, w: 4, d: 0.3 },
    { x: 1440, bh: 10, th: 28, w: 2, d: 1.0 },
  ];
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: 200,
        zIndex: 4,
        pointerEvents: "none",
      }}
    >
      <svg
        width="100%"
        height="200"
        viewBox="0 0 1440 200"
        preserveAspectRatio="xMidYMin slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b0000" />
            <stop offset="50%" stopColor="#aa0000" />
            <stop offset="85%" stopColor="#cc1111" />
            <stop offset="100%" stopColor="#880000" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {drips.map((d, i) => (
          <motion.g
            key={i}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{
              duration: 1.4 + i * 0.04,
              delay: d.d,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{ transformOrigin: `${d.x}px 0px` }}
          >
            <rect
              x={d.x - d.w / 2}
              y={0}
              width={d.w}
              height={d.bh + d.th * 0.65}
              fill="url(#dg)"
            />
            <polygon
              points={`${d.x - d.w / 2},${d.bh + d.th * 0.65} ${d.x + d.w / 2},${d.bh + d.th * 0.65} ${d.x},${d.bh + d.th}`}
              fill="#aa0000"
            />
          </motion.g>
        ))}
      </svg>
    </div>
  );
};

/* ─────────────── SVG Lamp ─────────────── */
const Lamp = ({ flicker }) => (
  <svg
    width="160"
    height="200"
    viewBox="0 0 160 200"
    xmlns="http://www.w3.org/2000/svg"
    style={{ overflow: "visible" }}
  >
    <defs>
      <linearGradient id="cord" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#222" />
        <stop offset="40%" stopColor="#444" />
        <stop offset="100%" stopColor="#111" />
      </linearGradient>
      <linearGradient id="cap" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3a3a3a" />
        <stop offset="100%" stopColor="#1a1a1a" />
      </linearGradient>
      <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2e2e2e" />
        <stop offset="60%" stopColor="#1c1c1c" />
        <stop offset="100%" stopColor="#111" />
      </linearGradient>
      <radialGradient id="bulb" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fff8e1" />
        <stop offset="30%" stopColor="#ffdd66" />
        <stop offset="70%" stopColor="#cc8800" />
        <stop offset="100%" stopColor="#884400" />
      </radialGradient>
      <radialGradient id="cone" cx="50%" cy="0%" r="100%" fx="50%" fy="0%">
        <stop offset="0%" stopColor="rgba(255,200,80,0.18)" />
        <stop offset="55%" stopColor="rgba(255,160,40,0.05)" />
        <stop offset="100%" stopColor="rgba(255,120,0,0)" />
      </radialGradient>
    </defs>
    <rect x="78" y="0" width="4" height="52" fill="url(#cord)" rx="2" />
    <rect x="62" y="48" width="36" height="8" rx="3" fill="url(#cap)" />
    <rect x="60" y="55" width="40" height="4" rx="1" fill="#111" />
    <polygon points="44,62 116,62 100,120 60,120" fill="url(#shade)" />
    <line x1="60" y1="120" x2="100" y2="120" stroke="#333" strokeWidth="2" />
    <line x1="44" y1="62" x2="60" y2="120" stroke="#0a0a0a" strokeWidth="1.5" />
    <line
      x1="116"
      y1="62"
      x2="100"
      y2="120"
      stroke="#0a0a0a"
      strokeWidth="1.5"
    />
    <line x1="44" y1="62" x2="116" y2="62" stroke="#3a3a3a" strokeWidth="1" />
    <circle cx="52" cy="72" r="2" fill="#222" />
    <circle cx="108" cy="72" r="2" fill="#222" />
    <motion.polygon
      points="60,120 100,120 155,400 5,400"
      fill="url(#cone)"
      animate={{ opacity: flicker ? [0.15, 0.35, 0.1] : [0.5, 0.7, 0.52] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.circle
      cx="80"
      cy="124"
      r="8"
      fill="url(#bulb)"
      animate={{
        opacity: flicker ? [0.4, 0.9, 0.3] : [0.9, 1, 0.92],
        filter: flicker
          ? ["drop-shadow(0 0 3px #ffcc44)", "drop-shadow(0 0 1px #ffcc44)"]
          : ["drop-shadow(0 0 8px #ffcc44)", "drop-shadow(0 0 18px #ffdd66)"],
      }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.circle
      cx="79"
      cy="121"
      r="3"
      fill="white"
      animate={{ opacity: flicker ? [0.3, 0.8, 0.2] : [0.7, 1, 0.75] }}
      transition={{ duration: 1.8, repeat: Infinity }}
    />
  </svg>
);

/* ─────────────── Skull Divider ─────────────── */
const SkullDivider = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      width: "100%",
      margin: "10px 0 14px",
    }}
  >
    <div
      style={{
        flex: 1,
        height: 1,
        background: "linear-gradient(90deg,transparent,#cc1111)",
      }}
    />
    <div style={{ margin: "0 14px" }}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(0 0 6px #cc1111)" }}
      >
        <path
          d="M50 12 L85 25 V55 C85 75 50 88 50 88 C50 88 15 75 15 55 V25 Z"
          stroke="#cc1111"
          strokeWidth="4"
          fill="rgba(8,0,0,0.92)"
        />
        <path
          d="M50 18 L79 29 V53 C79 70 50 81 50 81 C50 81 21 70 21 53 V29 Z"
          stroke="#880000"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M35 45 C35 34 65 34 65 45 C65 52 62 58 58 58 V64 H42 V58 C38 58 35 52 35 45 Z"
          fill="#cc1111"
        />
        <circle cx="43" cy="46" r="4" fill="#0c0000" />
        <circle cx="57" cy="46" r="4" fill="#0c0000" />
        <path d="M50 50 L48 54 H52 Z" fill="#0c0000" />
        <line
          x1="46"
          y1="60"
          x2="46"
          y2="64"
          stroke="#0c0000"
          strokeWidth="1.5"
        />
        <line
          x1="50"
          y1="60"
          x2="50"
          y2="64"
          stroke="#0c0000"
          strokeWidth="1.5"
        />
        <line
          x1="54"
          y1="60"
          x2="54"
          y2="64"
          stroke="#0c0000"
          strokeWidth="1.5"
        />
      </svg>
    </div>
    <div
      style={{
        flex: 1,
        height: 1,
        background: "linear-gradient(270deg,transparent,#cc1111)",
      }}
    />
  </div>
);

/* ─────────────── Input Field ─────────────── */
const InputField = ({
  icon: Icon,
  placeholder,
  type = "text",
  value,
  onChange,
  rightIcon,
  onRightClick,
}) => (
  <div style={{ position: "relative", marginBottom: 10 }}>
    <div
      style={{
        position: "absolute",
        left: 14,
        top: "50%",
        transform: "translateY(-50%)",
        color: "#cc1111",
        zIndex: 1,
        display: "flex",
        alignItems: "center",
      }}
    >
      <Icon size={15} />
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        width: "100%",
        padding: "12px 12px 12px 42px",
        background: "rgba(8,0,0,0.75)",
        border: "1px solid rgba(150,15,15,0.55)",
        borderRadius: 3,
        color: "#e0cccc",
        fontSize: 13,
        letterSpacing: "0.05em",
        outline: "none",
        fontFamily: "'Special Elite',monospace",
        transition: "border-color 0.25s,box-shadow 0.25s,background 0.25s",
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "rgba(255,25,25,0.85)";
        e.target.style.boxShadow = "0 0 12px rgba(255,20,20,0.28)";
        e.target.style.background = "rgba(18,2,2,0.9)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "rgba(150,15,15,0.55)";
        e.target.style.boxShadow = "none";
        e.target.style.background = "rgba(8,0,0,0.75)";
      }}
    />
    {rightIcon && (
      <button
        onClick={onRightClick}
        type="button"
        style={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          color: "#cc1111",
          cursor: "pointer",
          padding: 0,
          display: "flex",
          alignItems: "center",
          opacity: 0.8,
        }}
      >
        {rightIcon}
      </button>
    )}
  </div>
);

/* ─────────────── Glowing Primary Button ─────────────── */
const PrimaryBtn = ({ children, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <motion.button
      whileHover={{
        scale: 1.012,
        boxShadow:
          "0 0 26px rgba(255,25,25,0.75), inset 0 0 10px rgba(255,0,0,0.4)",
      }}
      whileTap={{ scale: 0.988 }}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="sheen-btn"
      style={{
        width: "100%",
        padding: "13px 0",
        marginTop: 8,
        background: "rgba(20,2,2,0.92)",
        border: "2px solid #ff2222",
        borderRadius: 3,
        color: "#f2f2f2",
        fontSize: 13,
        letterSpacing: "0.38em",
        textTransform: "uppercase",
        cursor: "pointer",
        fontFamily: "'Special Elite',monospace",
        fontWeight: 700,
        boxShadow:
          "0 0 14px rgba(255,0,0,0.45), inset 0 0 6px rgba(255,0,0,0.18)",
        textShadow:
          "0 0 8px rgba(255,255,255,0.4), 0 0 14px rgba(255,0,0,0.55)",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <AnimatePresence>
        {hov && (
          <motion.div
            className="sheen-sweep"
            initial={{ left: "-60%" }}
            animate={{ left: "160%" }}
            transition={{ duration: 0.75, ease: "easeInOut" }}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "38%",
              pointerEvents: "none",
              background:
                "linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent)",
              transform: "skewX(-22deg)",
            }}
          />
        )}
      </AnimatePresence>
      {children}
    </motion.button>
  );
};

/* ─────────────── Auth Page ─────────────── */
export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [flicker, setFlicker] = useState(false);
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirm: "",
  });

  useEffect(() => {
    const t = setInterval(() => {
      if (Math.random() < 0.08) {
        setFlicker(true);
        setTimeout(() => setFlicker(false), 50 + Math.random() * 110);
      }
    }, 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <FontLoader />

      {/* ── Root viewport ── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* ── Background: deep dark + red atmospheric glow (exact reference) ── */}
        <motion.div
          animate={{ opacity: flicker ? 0.68 : 1 }}
          transition={{ duration: 0.04 }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            background: `
              radial-gradient(ellipse 65% 52% at 54% 20%, rgba(165,30,0,0.58) 0%, rgba(100,5,0,0.36) 30%, transparent 68%),
              radial-gradient(ellipse 48% 38% at 16% 62%, rgba(60,0,0,0.48) 0%, transparent 62%),
              radial-gradient(ellipse 42% 34% at 85% 58%, rgba(55,0,0,0.36) 0%, transparent 58%),
              radial-gradient(ellipse 100% 75% at 50% 0%, rgba(80,0,0,0.28) 0%, transparent 80%),
              #0d0000
            `,
          }}
        />

        {/* ── Film grain noise ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.07'/%3E%3C/svg%3E")`,
            opacity: 0.45,
          }}
        />

        {/* ── Three.js Embers ── */}
        <ThreeEmbers />

        {/* ── Blood Drips ── */}
        <BloodDrips />

        {/* ── Vignette edges ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 38%, rgba(0,0,0,0.72) 100%)",
            animation: "breathe 7s ease-in-out infinite",
          }}
        />

        {/* ── Swaying Lamp ── */}
        <div
          style={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 6,
            pointerEvents: "none",
          }}
        >
          <motion.div
            animate={{ rotate: [-2.5, 2.5, -2.5] }}
            transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "80px 0px" }}
          >
            <Lamp flicker={flicker} />
          </motion.div>
        </div>

        {/* ── Main Content ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            maxWidth: 400,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "0 16px",
          }}
        >
          {/* ── Title Block ── */}
          <div
            style={{
              textAlign: "center",
              marginBottom: 2,
              userSelect: "none",
              lineHeight: 1,
            }}
          >
            <motion.p
              animate={{
                textShadow: flicker
                  ? "0 0 5px #ff2222"
                  : "0 0 10px rgba(255,10,10,0.6), 0 0 22px rgba(200,0,0,0.4)",
              }}
              style={{
                fontFamily: "'Creepster',cursive",
                fontSize: 26,
                color: "#9a0e0e",
                letterSpacing: "0.14em",
                margin: 0,
              }}
            >
              WELCOME
            </motion.p>
            <motion.p
              animate={{
                textShadow: flicker
                  ? "0 0 3px #ff2222"
                  : "0 0 7px rgba(255,10,10,0.4)",
              }}
              style={{
                fontFamily: "'Creepster',cursive",
                fontSize: 16,
                color: "#7a0a0a",
                letterSpacing: "0.1em",
                margin: "1px 0",
              }}
            >
              TO THE
            </motion.p>
            <motion.h1
              animate={{
                textShadow: flicker
                  ? "0 0 8px #ff2222,0 0 18px #cc0000"
                  : "0 0 18px rgba(255,10,10,0.95),0 0 40px rgba(220,0,0,0.7),0 0 65px rgba(160,0,0,0.5)",
              }}
              style={{
                fontFamily: "'Creepster',cursive",
                fontSize: 58,
                color: "#f00000",
                letterSpacing: "0.07em",
                margin: 0,
                lineHeight: 0.9,
              }}
            >
              FAMILY
            </motion.h1>
          </div>

          {/* Tagline */}
          <p
            style={{
              fontFamily: "'Special Elite',monospace",
              fontSize: 11,
              color: "#a8a8a8",
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              margin: "6px 0 0",
            }}
          >
            TRUST{" "}
            <span
              style={{
                color: "#d91414",
                textShadow: "0 0 5px rgba(220,0,0,0.4)",
              }}
            >
              NO ONE.
            </span>
          </p>

          {/* Skull Divider */}
          <SkullDivider />

          {/* ╔══════════════════════════════╗
              ║       GLASS FORM BOX         ║
              ╚══════════════════════════════╝ */}
          <motion.div
            layout
            style={{
              width: "100%",
              background: "rgba(6,0,0,0.88)",
              border: "1px solid rgba(150,12,12,0.55)",
              borderRadius: 6,
              padding: "22px 24px 18px",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              boxShadow: `
                0 0 0 1px rgba(80,0,0,0.2),
                0 8px 60px rgba(60,0,0,0.65),
                inset 0 0 40px rgba(50,0,0,0.14),
                0 0 30px rgba(160,0,0,0.08)
              `,
            }}
          >
            {/* Tab switcher */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid rgba(110,0,0,0.35)",
                marginBottom: 18,
              }}
            >
              {["login", "register"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    background:
                      mode === m
                        ? "linear-gradient(180deg,#7a0000 0%,#480000 100%)"
                        : "transparent",
                    border: "none",
                    borderBottom:
                      mode === m
                        ? "2px solid #cc2222"
                        : "2px solid transparent",
                    color: mode === m ? "#ffcccc" : "#663333",
                    fontSize: 10,
                    letterSpacing: "0.35em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    fontFamily: "'Special Elite',monospace",
                    transition: "all 0.22s",
                    boxShadow:
                      mode === m ? "0 0 14px rgba(160,0,0,0.3)" : "none",
                  }}
                >
                  {m === "login" ? "SIGN IN" : "REGISTER"}
                </button>
              ))}
            </div>

            {/* Form Fields */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
              >
                {mode === "register" && (
                  <InputField
                    icon={User}
                    placeholder="Username"
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                  />
                )}
                <InputField
                  icon={User}
                  placeholder="Email or Username"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <InputField
                  icon={Lock}
                  placeholder="Password"
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  rightIcon={
                    showPass ? <EyeOff size={15} /> : <Eye size={15} />
                  }
                  onRightClick={() => setShowPass((v) => !v)}
                />
                {mode === "register" && (
                  <InputField
                    icon={Lock}
                    placeholder="Confirm Password"
                    type={showConf ? "text" : "password"}
                    value={form.confirm}
                    onChange={(e) =>
                      setForm({ ...form, confirm: e.target.value })
                    }
                    rightIcon={
                      showConf ? <EyeOff size={15} /> : <Eye size={15} />
                    }
                    onRightClick={() => setShowConf((v) => !v)}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Primary Button */}
            <PrimaryBtn onClick={() => console.log("submit", form)}>
              {mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
            </PrimaryBtn>

            {/* OR */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                margin: "13px 0",
                color: "#4d2222",
                fontSize: 10,
                letterSpacing: "0.28em",
                fontFamily: "'Special Elite',monospace",
              }}
            >
              <div
                style={{ flex: 1, height: 1, background: "rgba(100,0,0,0.4)" }}
              />
              OR
              <div
                style={{ flex: 1, height: 1, background: "rgba(100,0,0,0.4)" }}
              />
            </div>

            {/* Secondary Button */}
            <motion.button
              whileHover={{
                scale: 1.01,
                borderColor: "rgba(230,20,20,0.7)",
                color: "#ffaaaa",
              }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              style={{
                width: "100%",
                padding: "11px 0",
                background: "rgba(10,0,0,0.65)",
                border: "1px solid rgba(120,0,0,0.5)",
                borderRadius: 3,
                color: "#885555",
                fontSize: 10,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                cursor: "pointer",
                fontFamily: "'Special Elite',monospace",
                transition: "all 0.25s",
              }}
            >
              {mode === "login" ? "CREATE ACCOUNT" : "ALREADY A MEMBER"}
            </motion.button>

            {/* Fingerprint */}
            <motion.div
              animate={{ opacity: [0.5, 0.88, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                marginTop: 16,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                gap: 5,
              }}
            >
              <div
                style={{
                  position: "relative",
                  padding: "9px",
                  border: "1px solid rgba(255,0,0,0.14)",
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* corner brackets */}
                {[
                  ["top", "left"],
                  ["top", "right"],
                  ["bottom", "left"],
                  ["bottom", "right"],
                ].map(([v, h], i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      [v]: 0,
                      [h]: 0,
                      width: 5,
                      height: 5,
                      borderTop: v === "top" ? "2px solid #ff1111" : "none",
                      borderBottom:
                        v === "bottom" ? "2px solid #ff1111" : "none",
                      borderLeft: h === "left" ? "2px solid #ff1111" : "none",
                      borderRight: h === "right" ? "2px solid #ff1111" : "none",
                    }}
                  />
                ))}
                <Fingerprint
                  size={26}
                  color="#ff1111"
                  style={{ filter: "drop-shadow(0 0 5px #ff0000)" }}
                />
              </div>
              <p
                style={{
                  fontSize: 9,
                  letterSpacing: "0.22em",
                  color: "#6e4b4b",
                  textTransform: "uppercase",
                  fontFamily: "'Special Elite',monospace",
                  margin: 0,
                }}
              >
                JOIN THE FAMILY
              </p>
              <p
                style={{
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  color: "#e61a1a",
                  textTransform: "uppercase",
                  fontFamily: "'Special Elite',monospace",
                  margin: 0,
                  textShadow: "0 0 5px rgba(255,0,0,0.3)",
                }}
              >
                IF YOU DARE
              </p>
            </motion.div>
          </motion.div>
          {/* end glass box */}
        </motion.div>
      </div>
    </>
  );
}
