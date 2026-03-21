import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { VisitorRegistration } from "./components/VisitorRegistration";
import { VisitorLog } from "./components/VisitorLog";
import { Dashboard } from "./components/Dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "register", Component: VisitorRegistration },
      { path: "log", Component: VisitorLog },
    ],
  },
]);
