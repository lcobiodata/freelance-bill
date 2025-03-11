import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#1565C0" },   // Deep blue for professionalism
    secondary: { main: "#FF6F00" }, // Vibrant orange for energy & action
    background: { default: "#F9FAFB" }, // Soft grayish-white for a clean UI
    success: { main: "#2E7D32" },  // Green for successful transactions
    error: { main: "#D32F2F" },  // Red for error alerts
    warning: { main: "#ED6C02" }, // Orange for important notices
    info: { main: "#0288D1" },  // Blue for informational messages
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 500 },
    button: { textTransform: "none" },
  },
});

export default theme;