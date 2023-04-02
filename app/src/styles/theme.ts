import { extendTheme } from "@chakra-ui/react";
import "@fontsource/unbounded";
import Button from "./components/button";
import Modal from "./components/modal";
import Popover from "./components/popover";

export const colors = {
  primary: {
    100: "#1A000C",
    500: "#F80046",
    900: "#FFF5F7",
  },
  secondary: {
    100: "#F6B7C7",
    500: "#231F20",
    800: "#42000E",
    900: "#170006",
  },
  background: {
    100: "#1B1E23",
    500: "#20232A",
    900: "#2B2F39",
  },
  error: {
    100: "#160705",
    500: "#EA4F30",
    900: "#FAEDEA",
  },
  warning: {
    100: "#170F02",
    500: "#F0AD2D",
    900: "#FDF4E7",
  },
  success: {
    100: "#091108",
    500: "#1EB871",
    900: "#EFF7EE",
  },
  text: {
    100: "#000000",
    500: "#C4C4C4",
    900: "#FFFFFF",
  },
  transparent: {
    main: "rgba(0, 0, 0, 0.5)",
    dark: "rgba(0, 0, 0, 0.7)",
  },
};

export const theme = extendTheme({
  components: {
    Button,
    Modal,
    Popover,
  },
  colors,
  styles: {
    global: () => ({
      "*, *::before, *::after": {
        WebkitTapHighlightColor: "transparent",
      },
      body: {
        bg: "#111010",
      },
    }),
  },
  fonts: {
    heading: "Unbounded, cursive",
    body: `Unbounded, cursive`,
  },
});
