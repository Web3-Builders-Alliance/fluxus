import { useEffect, useState } from "react";

const usePhantom = () => {
  const [isPhantom, setIsPhantom] = useState(false);

  useEffect(() => {
    // @ts-ignore
    if (typeof window !== "undefined" && window!.solana) {
      setIsPhantom(true);
    }
  }, []);

  return isPhantom;
};

export default usePhantom;
