import { useEffect, useState } from "react";

const usePhantom = () => {
  const [isPhantom, setIsPhantom] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      // @ts-ignore
      if (typeof window !== "undefined" && window!.solana) {
        setIsPhantom(true);
      }
    }, 200);
  }, []);

  return isPhantom;
};

export default usePhantom;
