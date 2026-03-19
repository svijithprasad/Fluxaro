import Image from "next/image";
import { pricingCards } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { clsx } from "clsx";
import { Check } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  // ⚠️ DISABLED: Stripe pricing no longer fetched
  // Using static pricing cards instead
  const staticPricingCard = pricingCards[0];

  return (
    <main className="">
      <section className="h-full w-full pt-36 relative flex items-center justify-center flex-col ">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] -z-10" />
        <p className="text-center">Run your agency, in one place</p>
        <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text relative">
          <h1 className="text-9xl font-bold text-center md:text-[300px]">
            Fluxaro.
          </h1>
        </div>

        <div
          className={"flex justify-center items-center relative md:mt-[-20px]"}
        >
          <Image
            src={"/assets/preview.png"}
            alt={"banner image"}
            height={1200}
            width={1200}
            className={"rounded-tl-2xl rounded-tr-2xl border-2 border-muted"}
          />
          <div
            className={
              "bottom-0 top-[50%] bg-gradient-to-t dark:from-background left-0 right-0 absolute z-10"
            }
          ></div>
        </div>
      </section>

      <section
        className={"flex justify-center items-center flex-col gap-4 md:mt-20"}
      >
        <h2 className={"text-4xl text-center"}>Welcome to Fluxaro</h2>
        <p className={"text-muted-foreground text-center"}>
          Start managing your agency, projects, and team with our all-in-one <br /> platform.
        </p>
        <div className="flex justify-center gap-4 flex-wrap mt-6">
          <Card className={"w-[300px] flex flex-col justify-between"}>
            <CardHeader>
              <CardTitle
                className={clsx("", {
                  "text-muted-foreground": false,
                })}
              >
                {staticPricingCard.title}
              </CardTitle>
              <CardDescription>{staticPricingCard.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <span className={"text-4xl font-bold"}>Free</span>
              <span className={"text-muted-foreground"}>/ unlimited</span>
            </CardContent>
            <CardFooter className={"flex flex-col items-start gap-4"}>
              <div>
                {staticPricingCard?.features.map((feature) => (
                  <div key={feature} className={"flex gap-2 items-center"}>
                    <Check className={"text-muted-foreground"} />
                    <p>{feature}</p>
                  </div>
                ))}
              </div>
              <Link
                href={`/agency`}
                className={clsx(
                  "w-full text-center bg-primary p-2 rounded-md"
                )}
              >
                Get Started
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>
    </main>
  );
}
