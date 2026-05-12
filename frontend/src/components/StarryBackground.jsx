export default function StarryBackground() {
  return (
    <>
      <style>
        {`
          .stars-layer {
            position: absolute;
            inset: 0;
            pointer-events: none;
          }
          .stars-1 {
            background-image: radial-gradient(circle at 20% 30%, rgba(255,255,255,0.8) 1px, transparent 1px),
                              radial-gradient(circle at 80% 40%, rgba(255,255,255,0.8) 1px, transparent 1px),
                              radial-gradient(circle at 40% 80%, rgba(255,255,255,0.8) 1.5px, transparent 1.5px),
                              radial-gradient(circle at 60% 15%, rgba(255,255,255,0.8) 1px, transparent 1px),
                              radial-gradient(circle at 90% 85%, rgba(255,255,255,0.8) 1px, transparent 1px),
                              radial-gradient(circle at 10% 90%, rgba(255,255,255,0.8) 1.5px, transparent 1.5px);
            background-size: 150px 150px;
            animation: twinkle 3s infinite alternate;
          }
          .stars-2 {
            background-image: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 1px, transparent 1px),
                              radial-gradient(circle at 15% 70%, rgba(255,255,255,0.8) 1.5px, transparent 1.5px),
                              radial-gradient(circle at 85% 10%, rgba(255,255,255,0.8) 1px, transparent 1px),
                              radial-gradient(circle at 30% 50%, rgba(255,255,255,0.8) 2px, transparent 2px);
            background-size: 200px 200px;
            background-position: 50px 50px;
            animation: twinkle 4s infinite alternate-reverse;
          }
          @keyframes twinkle {
            0% { opacity: 0.1; }
            100% { opacity: 0.7; }
          }
        `}
      </style>
      {/* z-20 এবং mix-blend-screen যোগ করা হয়েছে যাতে হোমপেজের ছবি বা কন্টেন্ট একে ঢেকে না দেয় */}
      <div className="pointer-events-none fixed inset-0 z-20 hidden mix-blend-screen dark:block">
        <div className="stars-layer stars-1"></div>
        <div className="stars-layer stars-2"></div>
      </div>
    </>
  );
}