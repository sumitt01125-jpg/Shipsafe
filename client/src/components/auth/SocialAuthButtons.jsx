import { useState } from "react";

function SocialAuthButtons() {
  const [loadingProvider, setLoadingProvider] = useState(null);

  const handleOAuth = (provider) => {
    setLoadingProvider(provider);

    const apiUrl =
      import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    window.location.assign(`${apiUrl}/auth/${provider}`);
  };

  return (
    <div className="space-y-3">
      {/* GOOGLE LOGIN */}
      <button
        type="button"
        onClick={() => handleOAuth("google")}
        disabled={loadingProvider !== null}
        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition disabled:opacity-60"
      >
        <svg viewBox="0 0 48 48" className="w-5 h-5">
          <path
            fill="#4285F4"
            d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
          />
          <path
            fill="#34A853"
            d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4.1 1.9-6.9 1.9-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
          />
          <path
            fill="#FBBC05"
            d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z"
          />
          <path
            fill="#EA4335"
            d="M24 12.1c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6.2 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.3c1.6-4.7 6.1-8.3 11.4-8.3Z"
          />
        </svg>

        {loadingProvider === "google"
          ? "Connecting to Google..."
          : "Continue with Google"}
      </button>

      {/* GITHUB LOGIN */}
      <button
        type="button"
        onClick={() => handleOAuth("github")}
        disabled={loadingProvider !== null}
        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-[#24292f] text-white font-semibold hover:bg-[#32383f] transition disabled:opacity-60"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 fill-current"
          aria-hidden="true"
        >
          <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.24-1.62-1.24-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.59 1.21 3.22.93.1-.72.39-1.21.7-1.49-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.95 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.05-1.14 3.05-1.14.61 1.53.23 2.67.11 2.95.72.78 1.15 1.77 1.15 2.99 0 4.29-2.61 5.23-5.1 5.51.4.35.75 1.02.75 2.06v3.06c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
        </svg>

        {loadingProvider === "github"
          ? "Connecting to GitHub..."
          : "Continue with GitHub"}
      </button>
    </div>
  );
}

export default SocialAuthButtons;