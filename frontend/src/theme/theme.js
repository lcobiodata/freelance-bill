import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#003b46" },   // Dark petrol blue for primary actions
    secondary: { main: "#07575b" }, // Slightly lighter petrol blue for secondary actions
    background: { default: "#c4dfe6" }, // Light petrol blue background for a clean look
    success: { main: "#4caf50" },  // Green for success messages
    error: { main: "#f44336" },  // Red for errors
    warning: { main: "#ff9800" }, // Orange for warnings
    info: { main: "#2196f3" },  // Blue for informational messages
  },
  typography: {
    fontFamily: "Inter, sans-serif",  // A modern, clean font
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 500 },
    button: { textTransform: "none" },
  },
});

export default theme;