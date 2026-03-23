import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <line x1="14" y1="2" x2="14" y2="26" stroke="#0C1E33" strokeWidth="1.8" />
          <line x1="2" y1="14" x2="26" y2="14" stroke="#0C1E33" strokeWidth="1.8" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}