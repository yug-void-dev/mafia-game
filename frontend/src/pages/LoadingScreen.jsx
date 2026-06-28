import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import "./LoadingScreen.css";

export default function LoadingScreen() {
  const navigate = useNavigate();
  const { roomId } = useParams();

  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1200),
      setTimeout(() => setStep(3), 2000),
      setTimeout(() => setStep(4), 2800),
    ];

    const values = [0, 12, 24, 36, 58, 73, 91, 100];
    let i = 0;

    const interval = setInterval(() => {
      if (i < values.length) {
        setProgress(values[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 300);

    const nav = setTimeout(() => {
      navigate(`/role-reveal/${roomId || ''}`);
    }, 5000);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
      clearTimeout(nav);
    };
  }, [navigate, roomId]);

  return (
    <div className="loading-screen">

      <div className="fog"></div>

      <div className="rain"></div>

      <div className="particles"></div>

      <motion.div
        className="lightning"
        animate={{ opacity: [0, 0.9, 0] }}
        transition={{
          duration: 0.2,
          repeat: Infinity,
          repeatDelay: 2.5
        }}
      />

      <AnimatePresence>

        {step >= 1 && (
          <motion.div
            className="eye"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            👁
          </motion.div>
        )}

      </AnimatePresence>

      <AnimatePresence>

        {step >= 2 && (
          <motion.img
            src="/logo.png"
            className="logo"
            initial={{
              scale: 0,
              rotate: -15,
              opacity: 0
            }}
            animate={{
              scale: [0, 1.15, 1],
              rotate: [-15, 0],
              opacity: 1
            }}
            transition={{ duration: 0.8 }}
          />
        )}

      </AnimatePresence>

      <AnimatePresence>

        {step >= 3 && (
          <motion.div
            className="title"
            initial={{
              opacity: 0,
              y: 40
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
          >
            <h1>CONTRACT</h1>

            <h2>ACCEPTED</h2>

            <p>Preparing Operation...</p>
          </motion.div>
        )}

      </AnimatePresence>

      <AnimatePresence>

        {step >= 4 && (
          <motion.div
            className="hud"
            initial={{
              opacity: 0,
              y: 40
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
          >
            <div className="progress">

              <div
                className="fill"
                style={{
                  width: `${progress}%`
                }}
              ></div>

            </div>

            <div className="percent">

              {progress}%

            </div>

            <div className="task">
              {progress >= 20 ? "✔" : "○"} Loading Environment
            </div>

            <div className="task">
              {progress >= 40 ? "✔" : "○"} Assigning Roles
            </div>

            <div className="task">
              {progress >= 70 ? "✔" : "○"} Connecting Players
            </div>

            <div className="task">
              {progress >= 90 ? "✔" : "○"} Syncing Match
            </div>

            <div className="task">
              {progress === 100 ? "✔" : "○"} Finalizing Session
            </div>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}