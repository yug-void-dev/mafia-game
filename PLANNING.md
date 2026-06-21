# 🎭 MAFIA GAME — PROJECT PLANNING

> Ye document project ka poora plan hai — kya banana hai, kaise banana hai, aur game ka flow kya hai.
> Dono log (jo bhi is project par kaam kar rahe hain) isse padhkar project ko samajh sakte hain.

---

## 👥 Tech Stack (Kya use kar rahe hain)

- **Frontend** : React (Vite) — jo user dikhta hai screen par
- **Backend**  : Node.js + Express — server side logic
- **Database** : MongoDB — data save karne ke liye
- **Real-time** : Socket.IO — live game events (night/day, kills, votes)

---

## 🎮 GAME KA BASIC FLOW

### Roles jo hongi game mein:
- **Mafia**    — Raat ko ek player ko kill karta hai. Asli identity chhupata hai.
- **Police**   — Raat ko ek player ko investigate karta hai — Mafia hai ya nahi.
- **Doctor**   — Raat ko ek player ko bachata hai Mafia ke attack se.
- **Villager** — Koi special power nahi. Din mein discussion aur voting mein participate karta hai.

---

### Game ka Step-by-Step Flow:

```
STEP 1 — Room Banana
  → Ek player "Host" banta hai aur room create karta hai
  → Room Code milta hai (jaise: MF4X9)
  → Dusre players wo code enter karke join karte hain
  → Host game settings set karta hai (kitne players, kitne Mafia, etc.)

STEP 2 — Lobby
  → Sabhi players lobby mein dikhte hain
  → Jab sab "Ready" ho jaate hain, Host game start karta hai
  → Roles randomly assign hoti hain (kisi ko Mafia, kisi ko Police, etc.)
  → Har player ko sirf apni role dikhti hai, doosron ki nahi

STEP 3 — Role Reveal
  → Game start hone par ek screen aati hai
  → Har player ko apni role ka kard dikhta hai (private)
  → Thodi der ke baad game shuru hoti hai

STEP 4 — NIGHT PHASE 🌙
  → Sabhi players ki aankhein "band" hoti hain (screen dark ho jaati hai)
  → Ek ek karke roles "jaagti" hain:
      - Mafia jaagti hai → Apne mein se ek player choose karte hain kill karne ke liye
      - Doctor jaagta hai → Ek player choose karta hai bachane ke liye
      - Police jaagti hai → Ek player choose karti hai investigate karne ke liye
                            (Usse result milta hai — Mafia hai ya innocent)
  → Sab actions secretly hote hain, kisi ko pata nahi chalta

STEP 5 — DAY PHASE ☀️
  → Subah hoti hai — screen roshan hoti hai
  → Announce hota hai ki raat ko kya hua:
      - Kaun mara? (agar Doctor ne nahi bachaya)
      - Ya "Koi nahi mara" (agar Doctor ne sahi player bachaya)
  → Jo player mar gaya, woh game se bahar ho jaata hai
  → Mara hua player apni role reveal kar sakta hai ya nahi — host ke settings par depend karta hai

STEP 6 — DISCUSSION
  → Sabhi zinda players milkar discuss karte hain ki kaun Mafia ho sakta hai
  → Koi bhi kisi par shak kar sakta hai
  → Mafia wale khud ko innocent dikhane ki koshish karte hain

STEP 7 — VOTING
  → Sab milkar vote karte hain — kise eliminate karna hai
  → Jis player ko sabse zyada votes milte hain, woh game se bahar ho jaata hai
  → Agar tie ho jaaye — koi eliminate nahi hota (ya re-vote hota hai — setting par depend karta hai)

STEP 8 — REPEAT
  → Phir se NIGHT PHASE shuru hoti hai
  → Ye cycle tab tak chalta hai jab tak koi ek side na jeet jaaye

STEP 9 — GAME END (Win Condition)
  → VILLAGERS JEETEIN JAB: Saari Mafia eliminate ho jaaye
  → MAFIA JEETE JAB: Mafia ki count, Villagers ki count ke barabar ya zyada ho jaaye
  → Winner announce hota hai
  → Sabhi players ki roles reveal hoti hain
  → Coins aur XP milte hain performance ke hisab se
```

---

## 🏗️ KYA KYA BANANA HAI — Feature List

### 1. User Account System
  - Register / Login / Logout
  - Profile page — naam, avatar, bio
  - Password change, settings

### 2. Economy System
  - Coins — game jeetne par milte hain (free currency)
  - Cash — premium currency (baad mein real money se)
  - Coins se Store mein items khareedna

### 3. Store
  - Avatars — alag alag character pictures
  - Avatar Frames — profile ke around decorative border
  - Titles — jaise "Shadow Lord", "The Detective" etc.
  - Sound Packs — alag alag game sounds

### 4. Profile & Stats
  - Total games played
  - Total games won / lost
  - Win percentage
  - Best win streak
  - Favourite role (jis role par sabse zyada jeete)
  - Level aur XP
  - Badges / Achievements

### 5. Friends System
  - Friend request bhejna / accept karna
  - Friends list dekhna
  - Friend ke saath room join karna

### 6. Leaderboard
  - Top players by wins
  - Top players by coins
  - Weekly / All-time filter

### 7. Room System
  - Room create karna with a unique code
  - Room join karna code se
  - Host ke liye settings:
    - Kitne players (minimum 5, maximum 15 recommended)
    - Kitni Mafia
    - Doctor on/off
    - Police on/off
    - Discussion time kitna
    - Voting time kitna

### 8. Lobby
  - Sabhi joined players dikhna
  - Ready / Not Ready status
  - Host ka "Start Game" button
  - Leave room option

### 9. Game Screen (Main Game)
  - Sabhi players ka circle view
  - Har player ka status — Alive / Dead
  - Current phase — Night ya Day
  - Timer — kitna time bacha hai phase mein
  - Mera role ka reminder (corner mein)
  - Night action panel — apni role ka action karna
  - Day voting panel — kisko eliminate karna hai
  - In-game chat — discussion ke liye
  - Game events — "Player X was killed", "No one died tonight" etc.

### 10. End Screen
  - Winner announce — Villagers ya Mafia
  - Sabhi players ki roles reveal
  - Stats — kisi ne kise kill kiya, police ne kya investigate kiya
  - Coins aur XP earned
  - Play Again / Back to Dashboard button

### 11. Sound & Animations
  - Night aane par dark theme + eerie sounds
  - Day aane par bright theme + morning sounds
  - Kill announcement par dramatic sound
  - Vote casting par click sounds
  - Win/Lose par music

### 12. Spectator Mode (Optional - Advanced)
  - Jo players mar jaate hain, woh game dekhte rahein
  - Sab kuch unhe dikhta hai (sab roles bhi)

---

## 📦 DATABASE MEIN KYA SAVE HOGA

### User ka Data:
  - Naam, email, password (encrypted)
  - Coins, Cash, Level, XP
  - Game stats (played, won, lost, streak)
  - Inventory (kharida hua items)
  - Friends list

### Room ka Data:
  - Room code
  - Host kaun hai
  - Kaun kaun join kiya
  - Game settings
  - Room status (waiting / in-game / finished)

### Game ka Data:
  - Kaun se room mein khela
  - Sabhi players aur unki roles
  - Kaun jeeta
  - Kitne rounds hue
  - Game ka date/time

### Game History:
  - Purani games ka record
  - Profile par "Match History" dikhane ke liye

---

## 🚀 KAAM KARNE KA ORDER (Priority)

```
Phase 1 — Backend Ready Karo
  1. User model update karo (coins, stats, avatar, etc.)
  2. Room model banao
  3. Room create / join / list ki APIs banao
  4. Socket.IO setup karo (real-time connection)

Phase 2 — Core Game Logic
  5. Role assignment system
  6. Night / Day phase switching
  7. Night actions — kill, save, investigate
  8. Day voting system
  9. Win condition check

Phase 3 — Frontend Game Screen
  10. Game page banao
  11. Player circle UI
  12. Night action panel
  13. Voting panel
  14. Phase announcements
  15. Game end screen

Phase 4 — Polish & Extra Features
  16. Store functional karo
  17. Leaderboard real data se connect karo
  18. Friends system complete karo
  19. Sound effects aur animations
  20. Game history page
```

---

## 🎯 IMPORTANT NOTES

- Game **real-time** hai — Socket.IO ke bina kuch bhi live nahi hoga
- Roles **randomly** assign honi chahiye — koi predict na kar sake
- Night actions **secretly** process hone chahiye — kisi doosre player ko pata nahi chalna chahiye
- Agar koi player **disconnect** ho jaaye — game gracefully handle kare
- **Mobile friendly** design rakho — kaafi log phone par khelenge

---

*Document last updated: June 2026*
*Project: Mafia Game (Online Multiplayer)*
