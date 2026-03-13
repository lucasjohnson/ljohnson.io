import HeroAnimated from "./components/HeroAnimated";

export default function Home() {
  return (
    <>
      <style>{`
        .pill-link:hover {
          border-color: rgba(255,255,255,0.4) !important;
          color: #fff !important;
        }
      `}</style>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#000000",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
          padding: "0 24px",
        }}
      >
        <HeroAnimated />
      </div>
    </>
  );
}
