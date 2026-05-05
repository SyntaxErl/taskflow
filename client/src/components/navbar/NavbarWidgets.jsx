// ─── Navbar Widget Sub-components ────────────────────────────────────────────

export const SearchBar = ({ placeholder }) => (
  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 bg-white w-full max-w-md">
    <span className="material-icons text-gray-400" style={{ fontSize: "18px" }}>
      search
    </span>
    <input
      type="text"
      placeholder={placeholder}
      className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent min-w-0"
    />
  </div>
);

export const CalendarNav = () => {
  const now = new Date();
  const monthYear = now.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <button className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 bg-white hover:bg-gray-50 transition hidden sm:block">
        Today
      </button>
      <button className="border border-gray-200 rounded-xl p-2 bg-white hover:bg-gray-50 transition">
        <span
          className="material-icons text-gray-500"
          style={{ fontSize: "18px" }}
        >
          chevron_left
        </span>
      </button>
      <button className="border border-gray-200 rounded-xl p-2 bg-white hover:bg-gray-50 transition">
        <span
          className="material-icons text-gray-500"
          style={{ fontSize: "18px" }}
        >
          chevron_right
        </span>
      </button>
      <div className="flex items-center gap-1 border border-gray-200 rounded-xl px-3 py-2 bg-white">
        <span className="text-sm font-medium text-gray-700">{monthYear}</span>
        <span
          className="material-icons text-gray-400"
          style={{ fontSize: "18px" }}
        >
          keyboard_arrow_down
        </span>
      </div>
    </div>
  );
};

export const AnalyticsDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30);
  const fmt = (d) =>
    d.toLocaleDateString("default", { month: "short", day: "numeric" });
  return (
    <div className="flex items-center gap-1 border border-gray-200 rounded-xl px-3 py-2 bg-white min-w-0">
      <span
        className="material-icons text-gray-400 flex-shrink-0"
        style={{ fontSize: "16px" }}
      >
        calendar_today
      </span>
      <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
        {fmt(start)} – {fmt(end)}
      </span>
      <span
        className="material-icons text-gray-400 flex-shrink-0"
        style={{ fontSize: "16px" }}
      >
        keyboard_arrow_down
      </span>
    </div>
  );
};
