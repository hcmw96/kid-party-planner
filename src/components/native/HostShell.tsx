import { Outlet } from "react-router-dom";
import NativeTabBar from "./NativeTabBar";

/**
 * Authenticated host chrome: content scrolls; tab bar owns bottom safe area.
 * Individual screens supply NativeNavBar for the top inset.
 */
const HostShell = () => {
  return (
    <div className="host-shell">
      <div className="host-shell-scroll">
        <Outlet />
      </div>
      <NativeTabBar />
    </div>
  );
};

export default HostShell;
