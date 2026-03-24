import Link from "next/link";
import React from "react";

type Props = {};

const Unauthorized = (props: Props) => {
  return (
    <div className="p-4 text-center h-screen flex justify-center items-center flex-col">
      <h1 className="text-3xl md:text-6xl">Coming Soon</h1>
      <p>Please contact support to know more about this upcoming feature</p>
    </div>
  );
};

export default Unauthorized;
