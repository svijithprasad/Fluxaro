"use client";
import {
  Agency,
  AgencySidebarOption,
  SubAccount,
  SubAccountSidebarOption,
} from "@prisma/client";
import React, { useEffect, useMemo, useState } from "react";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { ChevronsUpDown, Compass, Menu, PlusCircleIcon } from "lucide-react";
import clsx from "clsx";
import { AspectRatio } from "../ui/aspect-ratio";
import Image from "next/image";
import { Popover, PopoverTrigger } from "../ui/popover";
import { PopoverContent } from "@radix-ui/react-popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import {
  AGENCY_SLUG,
  AGENCY_ADMIN,
  AGENCY_OWNER,
  SUBACCOUNT_SLUG,
  icons,
} from "@/lib/constants";
import Link from "next/link";
import { useModal } from "@/providers/modal-provider";
import CustomModal from "../global/custom-modal";
import SubAccountDetails from "../forms/subaccount-details";
import { Separator } from "../ui/separator";
import { usePathname } from "next/navigation";

type Props = {
  defaultOpen?: boolean;
  subAccounts: SubAccount[];
  sidebarOpt: AgencySidebarOption[] | SubAccountSidebarOption[];
  sidebarLogo: string;
  details: any;
  user: any;
  id: string;
};

const MenuOptions = ({
  details,
  id,
  sidebarLogo,
  sidebarOpt,
  subAccounts,
  user,
  defaultOpen,
}: Props) => {
  const { setOpen } = useModal();
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  const openState = useMemo(
    () => (defaultOpen ? { open: true } : {}),
    [defaultOpen]
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return;

  return (
    <Sheet modal={false} {...openState}>
      <SheetTrigger
        asChild
        className="absolute left-4 top-4 z-[100] md:!hidden flex"
      >
        <Button variant={"outline"} size={"icon"}>
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent
        showX={!defaultOpen}
        side={"left"}
        className={clsx(
          "bg-background/80 backdrop-blur-xl fixed top-0 border-r-[1px] p-6",
          {
            "hidden md:inline-block z-0 w-[300px]": defaultOpen,
            "inline-block md:hidden z-[100] w-full": !defaultOpen,
          }
        )}
      >
        <div>
          <AspectRatio ratio={16 / 5}>
            <Image
              src={sidebarLogo}
              alt="Sidebar Logo"
              fill
              className="rounded-md object-contain"
            />
          </AspectRatio>


          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="w-full my-4 flex items-center justify-between py-8 border-none" // Optional: Added border-none if there was a lingering border
                variant={"ghost"}
              >
                <div className="flex items-center text-left gap-2">
                  <Compass />
                  <div className="flex flex-col">
                    {details.name}
                    <span className="text-muted-foreground text-wrap">
                      {details.address}
                    </span>
                  </div>
                </div>
                <ChevronsUpDown size={20} className="text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            {/* FIX 1: Make popover match the width of the trigger button */}
            <PopoverContent className="w-[--radix-popover-trigger-width] mt-4 z-[200]"> 
              <Command className="rounded-lg border shadow-md"> {/* Added standard border/shadow to the dropdown container */}
                <CommandInput placeholder="Search Accounts..." />
                <CommandList className="pb-4"> {/* Reduced bottom padding from pb-16 to pb-4 */}
                  <CommandEmpty>No results found</CommandEmpty>
                  
                  {(user?.role === AGENCY_OWNER ||
                    user?.role === AGENCY_ADMIN) &&
                    user?.Agency && (
                      <CommandGroup heading="Agency">
                        {/* FIX 2: Removed border, margins, and cleaned up the CommandItem classes */}
                        <CommandItem className="!p-0 !bg-transparent aria-selected:bg-transparent data-[selected=true]:bg-transparent">
                          {defaultOpen ? (
                            <Link
                              href={`${AGENCY_SLUG}/${user?.Agency?.id}`}
                              className={clsx(
                                "flex gap-4 w-full h-full rounded-md px-2 py-2 transition-all",
                                pathname.startsWith(`/agency/${user?.Agency?.id}`) && !pathname.includes('/subaccount')
                                  ? "bg-primary/20 text-primary font-semibold"
                                  : "hover:bg-muted/50"
                              )}
                            >
                              <div className="relative w-16 h-12"> {/* Explicit height for image container */}
                                <Image
                                  src={user?.Agency?.agencyLogo}
                                  alt="Agency Logo"
                                  fill
                                  className="rounded-md object-cover" // Changed to object-cover for better fit
                                />
                              </div>
                              <div className="flex flex-col flex-1 justify-center">
                                <span className="text-sm font-medium">{user?.Agency?.name}</span>
                                <span className="text-muted-foreground text-xs">
                                  {user?.Agency?.address}
                                </span>
                              </div>
                            </Link>
                          ) : (
                            // ... (Mirror the Link changes in the SheetClose version)
                            <SheetClose asChild>
                              <Link
                                href={`/agency/${user?.Agency?.id}`}
                                className={clsx(
                                  "flex gap-4 w-full h-full rounded-md px-2 py-2 transition-all",
                                  pathname.startsWith(`/agency/${user?.Agency?.id}`) && !pathname.includes('/subaccount')
                                    ? "bg-primary/20 text-primary font-semibold"
                                    : "hover:bg-muted/50"
                                )}
                              >
                                <div className="relative w-16 h-12">
                                  <Image
                                    src={user?.Agency?.agencyLogo}
                                    alt="Agency Logo"
                                    fill
                                    className="rounded-md object-cover"
                                  />
                                </div>
                                <div className="flex flex-col flex-1 justify-center">
                                  <span className="text-sm font-medium">{user?.Agency?.name}</span>
                                  <span className="text-muted-foreground text-xs">
                                    {user?.Agency?.address}
                                  </span>
                                </div>
                              </Link>
                            </SheetClose>
                          )}
                        </CommandItem>
                      </CommandGroup>
                    )}
                  
                  <CommandGroup heading="Accounts">
                    {!!subAccounts
                      ? subAccounts.map((subaccount) => (
                        <CommandItem 
                          key={subaccount.id}
                          // FIX 3: Consistent padding override and clean hover state for Accounts as well
                          className="!p-0 !bg-transparent aria-selected:bg-transparent data-[selected=true]:bg-transparent mb-1"
                        >
                          {defaultOpen ? (
                            <Link
                              href={`${SUBACCOUNT_SLUG}/${subaccount?.id}`}
                              className={clsx(
                                "flex gap-4 w-full h-full rounded-md px-2 py-2 transition-all",
                                pathname.includes(`/subaccount/${subaccount?.id}`)
                                  ? "bg-primary/20 text-primary font-semibold"
                                  : "hover:bg-muted/50"
                              )}
                            >
                              <div className="relative w-16 h-12">
                                <Image
                                  src={subaccount?.subAccountLogo}
                                  alt="Subaccount Logo"
                                  fill
                                  className="rounded-md object-cover"
                                />
                              </div>
                              <div className="flex flex-col flex-1 justify-center">
                                <span className="text-sm font-medium">{subaccount?.name}</span>
                                <span className="text-muted-foreground text-xs">
                                  {subaccount?.address}
                                </span>
                              </div>
                            </Link>
                          ) : (
                            // ... (Mirror changes for SheetClose)
                            <SheetClose asChild>
                              <Link
                                href={`${SUBACCOUNT_SLUG}/${subaccount?.id}`}
                                className={clsx(
                                  "flex gap-4 w-full h-full rounded-md px-2 py-2 transition-all",
                                  pathname.includes(`/subaccount/${subaccount?.id}`)
                                    ? "bg-primary/20 text-primary font-semibold"
                                    : "hover:bg-muted/50"
                                )}
                              >
                                <div className="relative w-16 h-12">
                                  <Image
                                    src={subaccount?.subAccountLogo}
                                    alt="Subaccount Logo"
                                    fill
                                    className="rounded-md object-cover"
                                  />
                                </div>
                                <div className="flex flex-col flex-1 justify-center">
                                  <span className="text-sm font-medium">{subaccount?.name}</span>
                                  <span className="text-muted-foreground text-xs">
                                    {subaccount?.address}
                                  </span>
                                </div>
                              </Link>
                            </SheetClose>
                          )}
                        </CommandItem>
                      ))
                      : "No Accounts"}
                  </CommandGroup>
                </CommandList>
                
                <div className="p-2 border-t"> {/* Added a border and padding container for the button */}
                  {(user?.role === AGENCY_OWNER ||
                    user?.role === AGENCY_ADMIN) && (
                      <Button
                        className="w-full flex gap-2"
                        onClick={() => {
                          setOpen(
                            <CustomModal
                              title="Create A Subaccount"
                              subheading="You can switch between your agency account and the subaccount from the sidebar"
                            >
                              <SubAccountDetails
                                agencyDetails={user?.Agency as Agency}
                                userId={user?.id as string}
                                userName={user?.name}
                              />
                            </CustomModal>
                          );
                        }}
                      >
                        <PlusCircleIcon size={15} />
                        Create Sub Account
                      </Button>
                    )}
                </div>
              </Command>
            </PopoverContent>
          </Popover>

          <p className="text-muted-foreground text-xs mb-2">MENU LINKS</p>
          <Separator className="mb-4" />
          <nav className="relative">
            <Command className="rounded-lg overflow-visible bg-transparent">
              <CommandInput placeholder="Search..." />
              <CommandList className="py-4 overflow-visible">
                <CommandEmpty>No Results Found</CommandEmpty>
                <CommandGroup className="overflow-visible">
                  {sidebarOpt.map((sidebarOptions) => {
                    let val;
                    const result = icons.find(
                      (icon) => icon.value === sidebarOptions.icon
                    );
                    if (result) {
                      val = <result.path />;
                    }

                    const currentRouteSegment = pathname.split('/').pop() || '';
                    const linkRouteSegment = sidebarOptions.link.split('/').pop() || '';

                    const isActive = currentRouteSegment === linkRouteSegment ||
                      pathname === sidebarOptions.link;

                    return (
                      <CommandItem
                        key={sidebarOptions.id}
                        className="w-full !p-0 bg-transparent aria-selected:bg-transparent data-[selected=true]:bg-transparent"
                      >
                        <SheetClose asChild>
                          <Link
                            href={sidebarOptions.link}
                            className={clsx(
                              "flex items-center gap-2 rounded-md transition-all w-full px-3 py-2",
                              isActive
                                ? "bg-primary text-white font-semibold"
                                : "hover:bg-primary/10 hover:text-primary text-foreground"
                            )}
                          >
                            {val}
                            <span>{sidebarOptions.name}</span>
                          </Link>
                        </SheetClose>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MenuOptions;