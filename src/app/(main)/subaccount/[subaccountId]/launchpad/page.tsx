import BlurPage from "@/components/global/blur-page";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { CheckCircleIcon, Layout, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {
  searchParams: {
    state: string;
    code: string;
  };
  params: { subaccountId: string };
};

const LaunchPad = async ({ params, searchParams }: Props) => {
  const subaccountDetails = await db.subAccount.findUnique({
    where: {
      id: params.subaccountId,
    },
    include: {
      Pipeline: true,
      Contact: true,
      Media: true,
    },
  });

  if (!subaccountDetails) {
    return;
  }

  const allDetailsExist =
    subaccountDetails.address &&
    subaccountDetails.subAccountLogo &&
    subaccountDetails.city &&
    subaccountDetails.companyEmail &&
    subaccountDetails.companyPhone &&
    subaccountDetails.country &&
    subaccountDetails.name &&
    subaccountDetails.state;

  return (
    <BlurPage>
      <div className="flex flex-col justify-center items-center">
        <div className="w-full h-full max-w-[800px]">
          <Card className="border-none ">
            <CardHeader>
              <CardTitle>Welcome to your dashboard!</CardTitle>
              <CardDescription>
                Follow the steps below to complete your setup.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex justify-between items-center w-full h-20 border p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <Image
                    src={subaccountDetails.subAccountLogo}
                    alt="App logo"
                    height={80}
                    width={80}
                    className="rounded-md object-contain p-4"
                  />
                  <p>Fill in all your business details.</p>
                </div>
                {allDetailsExist ? (
                  <CheckCircleIcon
                    size={50}
                    className=" text-primary p-2 flex-shrink-0"
                  />
                ) : (
                  <Link
                    className="bg-primary py-2 px-4 rounded-md text-white hover:bg-primary/80"
                    href={`/subaccount/${subaccountDetails.id}/settings`}
                  >
                    Start
                  </Link>
                )}
              </div>
              <div className="flex justify-between items-center w-full h-20 border p-4 rounded-lg ">
                <div className="flex items-center gap-4">
                  <div className="h-[80px] w-[80px] flex items-center justify-center bg-muted rounded-md shrink-0">
                    <Layout size={40} className="text-muted-foreground" />
                  </div>
                  <p>Create a pipeline for your sales process</p>
                </div>
                {subaccountDetails.Pipeline.length > 0 ? (
                  <CheckCircleIcon
                    size={50}
                    className=" text-primary p-2 flex-shrink-0"
                  />
                ) : (
                  <Link
                    className="bg-primary py-2 px-4 rounded-md text-white hover:bg-primary/80"
                    href={`/subaccount/${subaccountDetails.id}/pipelines`}
                  >
                    Start
                  </Link>
                )}
              </div>
              <div className="flex justify-between items-center w-full h-20 border p-4 rounded-lg ">
                <div className="flex items-center gap-4">
                  <div className="h-[80px] w-[80px] flex items-center justify-center bg-muted rounded-md shrink-0">
                    <User size={40} className="text-muted-foreground" />
                  </div>
                  <p>Create your first contact to start managing leads</p>
                </div>
                {subaccountDetails.Contact.length > 0 ? (
                  <CheckCircleIcon
                    size={50}
                    className=" text-primary p-2 flex-shrink-0"
                  />
                ) : (
                  <Link
                    className="bg-primary py-2 px-4 rounded-md text-white hover:bg-primary/80"
                    href={`/subaccount/${subaccountDetails.id}/contacts`}
                  >
                    Start
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BlurPage>
  );
};

export default LaunchPad;
