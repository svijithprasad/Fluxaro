import Navigation from "@/components/site/navigation";
import { ClerkProvider, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";


const layout = async ({ children }: { children: React.ReactNode }) => {
  const user = await currentUser();
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <main className="h-full">
        <Navigation user={user}/>
        {children}
      </main>
    </ClerkProvider>
  );
};

export default layout;
