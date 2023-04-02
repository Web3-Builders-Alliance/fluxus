import React from "react";

const empty = (
  props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>
) => {
  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M50.0001 33.3333V50M50.0001 66.7083L50.0417 66.6625M37.5001 12.5H16.6667V25M16.6667 45.8333V54.1667M83.3334 45.8333V54.1667M62.5001 12.5H83.3334V25M37.5001 87.5H16.6667V75M62.5001 87.5H83.3334V75"
        stroke="#4A5568"
        stroke-width="6.25"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default empty;
