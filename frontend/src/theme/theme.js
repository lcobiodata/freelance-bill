import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#0A84C1" },   // Adjusted blue from the logo
    secondary: { main: "#2E4A62" }, // Darker blue-gray for contrast
    background: { default: "#F4F7FA" }, // Light grayish-blue for a clean look
    success: { main: "#30A14E" },  // Softer green for positive actions
    error: { main: "#E63946" },  // Slightly muted red for errors
    warning: { main: "#E7A218" }, // Warm yellow-orange for warnings
    info: { main: "#1E88E5" },  // Refined blue for informational messages
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
