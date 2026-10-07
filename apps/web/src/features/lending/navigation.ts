// Shared by the landing header, app sidebar, and their mobile menus.
export const PRIMARY_NAV_ITEMS = [
  {
    label: "Overview",
    to: "/dashboard",
    iconPath: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  },
  { label: "Markets", to: "/markets", iconPath: "M2 17 9 10l5 5 8-8M16 7h6v6" },
  {
    label: "Positions",
    to: "/portfolio",
    iconPath: "m12 3 9 5-9 5-9-5 9-5Zm-9 5v9l9 5 9-5V8M12 13v9",
  },
  { label: "Activity", to: "/activity", iconPath: "M3 12h4l3-8 4 16 3-8h4" },
  {
    label: "Learn",
    to: "/docs",
    iconPath: "M4 3h10l6 6v12H4V3Zm10 0v6h6M8 13h8M8 17h8",
  },
] as const
