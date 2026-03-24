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
import {
  Building2,
  Check,
  GitBranch,
  Image as ImageIcon,
  LayoutDashboard,
  MousePointer2,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    title: "Agency Management",
    description: "Manage multiple clients and team members in one centralized dashboard.",
    icon: LayoutDashboard,
  },
  {
    title: "Subaccount Creation",
    description: "Scale your agency by creating dedicated spaces for each of your clients.",
    icon: Building2,
  },
  {
    title: "Visual Funnel Builder",
    description: "Design high-converting sales funnels with our intuitive drag-and-drop tool.",
    icon: MousePointer2,
  },
  {
    title: "Automated Pipelines",
    description: "Streamline your sales process with custom pipelines and powerful automations.",
    icon: GitBranch,
  },
  {
    title: "Team Collaboration",
    description: "Work seamlessly with your team and assign specific permissions for each member.",
    icon: Users,
  },
  {
    title: "Media Management",
    description: "A centralized hub for all your client's images and media assets.",
    icon: ImageIcon,
  },
];

export default async function Home() {
  return (
    <main className="">
      <section className="h-full w-full pt-36 relative flex items-center justify-center flex-col ">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] -z-10" />
        <p className="flex items-center gap-2 text-center p-2 px-4 border-2 border-primary rounded-full bg-blue-950 text-white"><Star size={16} color="yellow" fill="yellow" />Run your agency, in one place</p>
        <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text relative">
          <h1 className="text-9xl font-bold text-center md:text-[300px]">
            Fluxaro.
          </h1>
        </div>

        <div className="flex justify-center items-center relative md:mt-[-20px]">
          <Image
            src={"/assets/preview.png"}
            alt={"banner image"}
            height={1200}
            width={1200}
            className={"rounded-tl-2xl rounded-tr-2xl border-2 border-muted shadow-2xl"}
          />
          <div className="bottom-0 top-[50%] bg-gradient-to-t dark:from-background left-0 right-0 absolute z-10" />
        </div>
      </section>

      <section id="features" className="flex flex-col items-center justify-center gap-4 pt-20 px-4">
        <h2 className="text-4xl text-center font-bold">Comprehensive Tools for Your Agency</h2>
        <p className="text-muted-foreground text-center max-w-2xl">
          Start managing your agency, projects, and team with our all-in-one platform. 
          Everything you need to scale your business is right here.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 max-w-[1200px] w-full">
          {features.map((feature, index) => (
            <Card key={index} className="border-muted bg-background/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="text-primary" size={24} />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="flex justify-center items-center flex-col gap-4 pt-24 px-4">
        <h2 className="text-4xl text-center font-bold">Choose the Plan That Works for You</h2>
        <p className="text-muted-foreground text-center max-w-2xl">
          Our flexible pricing plans are designed to help you grow. Whether you&apos;re just starting 
          out or managing a large agency, we have you covered.
        </p>
        <div className="flex justify-center gap-8 flex-wrap mt-12 max-w-[1200px] w-full pb-20">
          {pricingCards.map((card) => (
            <Card
              key={card.title}
              className={clsx("w-[350px] flex flex-col justify-between border-muted transition-all duration-300", {
                "border-primary shadow-[0_0_20px_rgba(var(--primary),0.3)] scale-105 z-10": card.title === "Unlimited",
              })}
            >
              <CardHeader>
                <CardTitle className={clsx("", {
                  "text-muted-foreground": card.title !== "Unlimited",
                })}>
                  {card.title}
                </CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-4xl font-bold">{card.price}</span>
                <span className="text-muted-foreground"> {card.duration ? `/ ${card.duration}` : "/ month"}</span>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold mb-2">{card.highlight}</p>
                  {card.features.map((feature) => (
                    <div key={feature} className="flex gap-2 items-center text-sm">
                      <Check className="text-primary" size={16} />
                      <p>{feature}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/agency?plan=${card.planName}`}
                  className={clsx(
                    "w-full text-center p-2 rounded-md transition-colors duration-300",
                    {
                      "bg-primary text-white hover:bg-primary/90": card.title === "Unlimited",
                      "bg-muted hover:bg-muted/80": card.title !== "Unlimited",
                    }
                  )}
                >
                  Get Started
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-muted pt-20 pb-12 px-4 bg-background/50">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-2">
             <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/assets/plura-logo.svg"
                alt="Fluxaro Logo"
                width={40}
                height={40}
              />
              <span className="text-2xl font-bold">Fluxaro.</span>
            </Link>
            <p className="text-muted-foreground max-w-xs">
              The all-in-one platform for modern agencies. Streamline your operations, 
              manage your team, and scale your business with ease.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Navigation</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Documentation</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-20 pt-8 border-t border-muted/50 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Fluxaro Inc. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
