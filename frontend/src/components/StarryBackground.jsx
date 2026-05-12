export default function StarryBackground() {
  return (
    <>
      <style>
        {`
          .bg-stars {
            background-image: 
              radial-gradient(1px 1px at 25px 30px, #ffffff, rgba(0,0,0,0)),
              radial-gradient(1px 1px at 50px 80px, #ffffff, rgba(0,0,0,0)),
              radial-gradient(1px 1px at 90px 110px, #ffffff, rgba(0,0,0,0)),
              radial-gradient(1.5px 1.5px at 130px 40px, #ffffff, rgba(0,0,0,0)),
              radial-gradient(2px 2px at 170px 90px, rgba(255,255,255,0.8), rgba(0,0,0,0)),
              radial-gradient(1.5px 1.5px at 190px 140px, #ffffff, rgba(0,0,0,0));
            background-repeat: repeat;
            background-size: 200px 200px;
            animation: twinkle 5s infinite alternate;
            opacity: 0.3;
          }

          @keyframes twinkle {
            0% { opacity: 0.1; transform: scale(0.9); }
            100% { opacity: 0.4; transform: scale(1); }
          }
        `}
      </style>
      {/* fixed ব্যবহার করা হয়েছে যাতে স্ক্রল করলেও ব্যাকগ্রাউন্ড জায়গামতো থাকে */}
      <div className="pointer-events-none fixed inset-0 z-0 hidden bg-stars dark:block"></div>
    </>
  );
}