import { useEffect } from "react";

export default function usePageTitle(title) {
  useEffect(() => {
    const appName = "Bitexly";
    document.title = title ? `${title} | ${appName}` : appName;
  }, [title]);
}