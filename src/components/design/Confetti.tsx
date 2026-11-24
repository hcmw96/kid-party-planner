const pieces = [
  { left: "8%", delay: "0ms", color: "#F34AA5", rotate: "-12deg" },
  { left: "18%", delay: "80ms", color: "#6B7AFF", rotate: "16deg" },
  { left: "30%", delay: "40ms", color: "#F6C15B", rotate: "-8deg" },
  { left: "44%", delay: "140ms", color: "#32936A", rotate: "12deg" },
  { left: "58%", delay: "20ms", color: "#F34AA5", rotate: "8deg" },
  { left: "70%", delay: "110ms", color: "#6B7AFF", rotate: "-18deg" },
  { left: "82%", delay: "60ms", color: "#F6C15B", rotate: "10deg" },
  { left: "92%", delay: "160ms", color: "#EAE2F8", rotate: "-6deg" },
];

const Confetti = () => (
  <div className="pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden" aria-hidden>
    {pieces.map((piece) => (
      <span
        key={piece.left}
        className="confetti-piece motion-safe:animate-confetti"
        style={{
          left: piece.left,
          background: piece.color,
          animationDelay: piece.delay,
          transform: `rotate(${piece.rotate})`,
        }}
      />
    ))}
  </div>
);

export default Confetti;
