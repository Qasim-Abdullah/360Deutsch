import React from "react";

type RoomProps = {
  locked?: boolean;
  blur?: boolean;
};

function Room({ locked = true, blur = true }: RoomProps) {
  return (
    <div className="relative inline-block p-10 m-10">
      {blur && (
        <div
          className="absolute z-10 inset-0 pointer-events-none glow w-[20rem] left-[0.5rem] bottom-[2.5rem]"
          style={{
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(2px) saturate(140%)",
            WebkitBackdropFilter: "blur(2px) saturate(140%)",
            borderTop: "1px solid rgba(255,255,255,0.35)",
            borderLeft: "1px solid rgba(255,255,255,0.25)",
            borderRight: "1px solid rgba(255,255,255,0.25)",
          }}
        >
          {locked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <img src="/images/lock.png" alt="lock" className="w-42" />
            </div>
          )}
        </div>
      )}

      <div
        className="relative z-0 rounded-xl overflow-hidden bg-no-repeat bg-contain bg-center"
        style={{
          backgroundImage: "url('/images/room1.png')",
          width: "260px",
          aspectRatio: "1 / 1",
        }}
      />

      <style jsx global>{`
        .glow {
          border-top: 6px solid rgba(255, 215, 0, 0.25);
          border-left: 6px solid rgba(255, 215, 0, 0.18);
          border-right: 6px solid rgba(255, 215, 0, 0.18);
          border-bottom: none;

          box-shadow: 0px -6px 18px rgba(255, 215, 0, 0.22),
            -14px -6px 26px rgba(255, 215, 0, 0.16),
            14px -6px 26px rgba(255, 215, 0, 0.16);

          border-radius: 14px;
        }
      `}</style>
    </div>
  );
}

export default Room;
