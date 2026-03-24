"use server";

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { redirect } from "next/navigation";
import { SIGN_IN, SUBACCOUNT_USER } from "./constants";
import { checkLimit } from "./subscription";
import {
  Agency,
  Lane,
  Prisma,
  Role,
  SubAccount,
  Tag,
  Ticket,
  User,
} from "@prisma/client";
import { v4 } from "uuid";
import {
  CreateFunnelFormSchema,
  CreateMediaType,
  UpsertFunnelPage,
} from "./types";
import { z } from "zod";
import { revalidatePath } from "next/cache";

/**
 * A function that check if the user exists with email or not?
 * @returns userDate - Optimized to fetch only essential fields
 */
export const getAuthUserDetails = async () => {
  const user = await currentUser();
  if (!user) {
    return;
  }

  const userData = await db.user.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
    },
    include: {
      Agency: {
        select: {
          id: true,
          name: true,
          agencyLogo: true,
          companyEmail: true,
          companyPhone: true,
          whiteLabel: true,
          address: true,
          city: true,
          state: true,
          country: true,
          zipCode: true,
          goal: true,
          connectAccountId: true,
          createdAt: true,
          updatedAt: true,
          SidebarOption: true,
          SubAccount: {
            select: {
              id: true,
              name: true,
              subAccountLogo: true,
              SidebarOption: true,
            },
          },
        },
      },
      Permissions: {
        select: {
          access: true,
          email: true,
          subAccountId: true,
        },
      },
    },
  });

  return userData;
};

export const saveActivityLogsNotification = async ({
  agencyId,
  description,
  subaccountId,
}: {
  agencyId?: string;
  description: string;
  subaccountId?: string;
}) => {
  const authUser = await currentUser();

  let userData;

  if (!authUser) {
    const response = await db.user.findFirst({
      where: {
        Agency: {
          SubAccount: {
            some: { id: subaccountId },
          },
        },
      },
    });

    if (response) {
      userData = response;
    }
  } else {
    userData = await db.user.findUnique({
      where: {
        email: authUser?.emailAddresses[0].emailAddress,
      },
    });
  }

  if (!userData) {
    console.error("Could not find a user data");
    return;
  }

  let foundAgencyId = agencyId;

  if (!foundAgencyId) {
    if (!subaccountId) {
      throw new Error(
        "You need to provide at least an agency ID for subacount ID"
      );
    }

    const response = await db.subAccount.findUnique({
      where: { id: subaccountId },
    });

    if (response) foundAgencyId = response.agencyId;
  }

  if (subaccountId) {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundAgencyId,
          },
        },
        SubAccount: {
          connect: {
            id: subaccountId,
          },
        },
      },
    });
  } else {
    await db.notification.create({
      data: {
        notification: `${userData.name} | ${description}`,
        User: {
          connect: {
            id: userData.id,
          },
        },
        Agency: {
          connect: {
            id: foundAgencyId,
          },
        },
      },
    });
  }
};

/**
 * Creates a new Team user
 * @param agencyId From Prisma Agency Table
 * @param user From Prisma client
 * @returns Response If user is created or not.
 */
export const createTeamUser = async (agencyId: string, user: User) => {
  if (user.role === "AGENCY_OWNER") return null;

  const response = await db.user.upsert({
    where: { email: user.email },
    update: {
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      agencyId: user.agencyId,
      updatedAt: new Date(),
    },
    create: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      agencyId: user.agencyId,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  return response;
};

export const verifyAndAcceptInvitation = async () => {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");
  const invitationExists = await db.invitation.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
      status: "PENDING",
    },
  });

  if (invitationExists) {
    const userDetails = await createTeamUser(invitationExists.agencyId, {
      email: invitationExists.email,
      agencyId: invitationExists.agencyId,
      avatarUrl: user.imageUrl,
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: invitationExists.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await saveActivityLogsNotification({
      agencyId: invitationExists?.agencyId,
      description: `Joined`,
      subaccountId: undefined,
    });

    if (userDetails) {
      await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata: {
          role: userDetails.role || "SUBACCOUNT_USER",
        },
      });

      await db.invitation.delete({
        where: { email: userDetails.email },
      });

      return userDetails.agencyId;
    } else return null;
  } else {
    const agency = await db.user.findUnique({
      where: {
        email: user.emailAddresses[0].emailAddress,
      },
    });

    return agency ? agency.agencyId : null;
  }
};

export const updateAgencyDetails = async (
  agencyId: string,
  agencyDetails: Partial<Agency>
) => {
  const response = await db.agency.update({
    where: { id: agencyId },
    data: { ...agencyDetails },
  });
  return response;
};

export const deleteAgency = async (agencyId: string) => {
  const response = await db.agency.delete({ where: { id: agencyId } });
  return response;
};

export const initUser = async (newUser: Partial<User>) => {
  const user = await currentUser();

  if (!user) return;

  const userData = await db.user.upsert({
    where: { email: user.emailAddresses[0].emailAddress },
    update: newUser,
    create: {
      id: user.id,
      avatarUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName} ${user.lastName}`,
      role: newUser.role || "SUBACCOUNT_USER",
    },
  });

  await clerkClient.users.updateUserMetadata(user.id, {
    privateMetadata: {
      role: newUser.role || SUBACCOUNT_USER,
    },
  });

  return userData;
};

// export const upsertAgency = async (agency: Agency, price?: Plan) => {
//   if (!agency.companyEmail) return null;
//   try {
//     const agencyDetails = await db.agency.upsert({
//       where: {
//         id: agency.id,
//       },
//       update: agency,
//       create: {
//         users: {
//           connect: { email: agency.companyEmail },
//         },
//         ...agency,
//         SidebarOption: {
//           create: [
//             {
//               name: "Dashboard",
//               icon: "category",
//               link: `/agency/${agency.id}`,
//             },
//             {
//               name: "Launchpad",
//               icon: "clipboardIcon",
//               link: `/agency/${agency.id}/launchpad`,
//             },
//             {
//               name: "Billing",
//               icon: "payment",
//               link: `/agency/${agency.id}/billing`,
//             },
//             {
//               name: "Settings",
//               icon: "settings",
//               link: `/agency/${agency.id}/settings`,
//             },
//             {
//               name: "Sub Accounts",
//               icon: "person",
//               link: `/agency/${agency.id}/all-subaccounts`,
//             },
//             {
//               name: "Team",
//               icon: "shield",
//               link: `/agency/${agency.id}/team`,
//             },
//           ],
//         },
//       },
//     });
//     return agencyDetails;
//   } catch (error) {
//     console.log(error);
//   }
// };

export const upsertAgency = async (agency: Agency) => {
  const authUser = await currentUser();
  if (!authUser) return null;

  const userEmail = authUser.emailAddresses[0].emailAddress;

  // Ensure user exists
  const user = await db.user.findUnique({
    where: { email: userEmail },
  });

  if (!user) {
    throw new Error("User must exist before creating agency");
  }

  const agencyDetails = await db.agency.upsert({
    where: { id: agency.id },
    update: agency,
    create: {
      ...agency,
      SidebarOption: {
        create: [
          { name: "Dashboard", icon: "category", link: `/agency/${agency.id}` },
          { name: "Launchpad", icon: "clipboardIcon", link: `/agency/${agency.id}/launchpad` },
          { name: "Billing", icon: "payment", link: `/agency/${agency.id}/billing` },
          { name: "Settings", icon: "settings", link: `/agency/${agency.id}/settings` },
          { name: "Sub Accounts", icon: "person", link: `/agency/${agency.id}/all-subaccounts` },
          { name: "Team", icon: "shield", link: `/agency/${agency.id}/team` },
        ],
      },
    },
  });

  // 🔥 Attach user to agency AFTER creation
  await db.user.update({
    where: { id: user.id },
    data: {
      agencyId: agencyDetails.id,
      role: "AGENCY_OWNER",
    },
  });

  return agencyDetails;
};


export const getNotificationAndUser = async (agencyId: string, limit: number = 20) => {
  try {
    const response = await db.notification.findMany({
      where: { agencyId },
      select: {
        id: true,
        notification: true,
        createdAt: true,
        subAccountId: true,
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return response;
  } catch (error) {
    console.error(error);
  }
};

export const upsertSubAccount = async (subAccount: SubAccount) => {
  if (!subAccount.companyEmail) return null;

  // Check tier limit for sub accounts (only on create, not update)
  const existingSubAccount = await db.subAccount.findUnique({
    where: { id: subAccount.id },
  });
  if (!existingSubAccount) {
    const limitCheck = await checkLimit(subAccount.agencyId, "subAccounts");
    if (!limitCheck.allowed) {
      throw new Error(
        JSON.stringify({
          error: "LIMIT_REACHED",
          resource: "Sub Accounts",
          plan: limitCheck.plan,
          current: limitCheck.current,
          limit: limitCheck.limit,
          agencyId: subAccount.agencyId,
        })
      );
    }
  }

  const agencyOwner = await db.user.findFirst({
    where: { Agency: { id: subAccount.agencyId }, role: "AGENCY_OWNER" },
  });

  if (!agencyOwner)
    return console.error("🔴 Error: Could not create a Sub-Account");

  const permissionId = v4();

  const response = await db.subAccount.upsert({
    where: { id: subAccount.id },
    update: subAccount,
    create: {
      ...subAccount,
      Permissions: {
        create: {
          access: true,
          email: agencyOwner.email,
          id: permissionId,
        },
        connect: {
          subAccountId: subAccount.id,
          id: permissionId,
        },
      },
      Pipeline: {
        create: { name: "Lead Cycle" },
      },
      SidebarOption: {
        create: [
          {
            name: "Launchpad",
            icon: "clipboardIcon",
            link: `/subaccount/${subAccount.id}/launchpad`,
          },
          {
            name: "Settings",
            icon: "settings",
            link: `/subaccount/${subAccount.id}/settings`,
          },
          {
            name: "Funnels",
            icon: "pipelines",
            link: `/subaccount/${subAccount.id}/funnels`,
          },
          {
            name: "Media",
            icon: "database",
            link: `/subaccount/${subAccount.id}/media`,
          },
          {
            name: "Automations",
            icon: "chip",
            link: `/subaccount/${subAccount.id}/automations`,
          },
          {
            name: "Pipelines",
            icon: "flag",
            link: `/subaccount/${subAccount.id}/pipelines`,
          },
          {
            name: "Contacts",
            icon: "person",
            link: `/subaccount/${subAccount.id}/contacts`,
          },
          {
            name: "Dashboard",
            icon: "category",
            link: `/subaccount/${subAccount.id}`,
          },
        ],
      },
    },
  });

  return response;
};

export const getUserPermissions = async (userId: string) => {
  const response = await db.user.findUnique({
    where: { id: userId },
    select: { Permissions: { include: { SubAccount: true } } },
  });

  return response;
};

export const updateUser = async (user: Partial<User>) => {
  const response = await db.user.update({
    where: {
      email: user.email,
    },
    data: { ...user },
  });

  await clerkClient.users.updateUserMetadata(response.id, {
    privateMetadata: { role: user.role || SUBACCOUNT_USER },
  });

  return response;
};

export const changeUserPermissions = async (
  permissionId: string | undefined,
  userEmail: string,
  subAccountId: string,
  permission: boolean
) => {
  try {
    const response = await db.permissions.upsert({
      where: { id: permissionId },
      update: { access: permission },
      create: {
        access: permission,
        email: userEmail,
        subAccountId: subAccountId,
      },
    });
    return response;
  } catch (error) {
    console.log("🔴 Error: Couldn't change persmission", error);
  }
};

export const getSubaccountDetails = async (subAccountId: string) => {
  try {
    const response = await db.subAccount.findFirst({
      where: { id: subAccountId },
    });

    return response;
  } catch (error) {
    console.log("🔴 Error: Couldn't find sub account details.", error);
  }
};

export const deleteSubAccount = async (subAccountId: string) => {
  try {
    const response = await db.subAccount.delete({
      where: { id: subAccountId },
    });

    return response;
  } catch (error) {
    console.log("🔴 Error: Couldn't delete sub account.", error);
  }
};

export const deleteUser = async (userId: string) => {
  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      role: undefined,
    },
  });
  const deletedUser = await db.user.delete({ where: { id: userId } });

  return deletedUser;
};

export const deleteInvitation = async (invitationId: string) => {
  const response = await db.invitation.delete({
    where: { id: invitationId },
  })
  return response
}

export const getUser = async (id: string) => {
  const user = await db.user.findUnique({
    where: {
      id,
    },
  });

  return user;
};

export const sendInvitation = async (
  role: Role,
  email: string,
  agencyId: string
) => {
  try {
    const limitCheck = await checkLimit(agencyId, 'teamMembers')
    if (!limitCheck.allowed) {
      throw new Error(
        JSON.stringify({
          error: 'LIMIT_REACHED',
          resource: 'Team Members',
          plan: limitCheck.plan,
          current: limitCheck.current,
          limit: limitCheck.limit,
          agencyId: agencyId,
        })
      )
    }

    // Check if user is already a member of this agency
    const userExists = await db.user.findUnique({
      where: { email },
    })

    if (userExists && userExists.agencyId === agencyId) {
      throw new Error('User is already a member of this agency')
    }

    // Create or update an invitation in your database
    const response = await db.invitation.upsert({
      where: { email },
      update: { role, status: 'PENDING' },
      create: { email, agencyId, role },
    })

    // Create an invitation using Clerk
    try {
      await clerkClient.invitations.createInvitation({
        emailAddress: email,
        redirectUrl: process.env.NEXT_PUBLIC_URL,
        publicMetadata: {
          throughInvitation: true,
          role,
        },
      })
    } catch (clerkError: any) {
      console.log('Clerk invitation error:', clerkError)
      // If user already exists in Clerk, it's fine, we still want the DB invitation
      // but if it's another error we might want to know.
      // Clerk throws if user already exists or if there's a pending invitation.
    }

    return response
  } catch (error) {
    console.log('Error sending invitation:', error)
    throw error
  }
}

export const createMedia = async (
  subAccountId: string,
  mediaFiles: CreateMediaType
) => {
  const subAccount = await db.subAccount.findUnique({
    where: { id: subAccountId },
    select: { agencyId: true },
  });
  if (subAccount) {
    const limitCheck = await checkLimit(subAccount.agencyId, "mediaUploads");
    if (!limitCheck.allowed) {
      throw new Error(
        JSON.stringify({
          error: "LIMIT_REACHED",
          resource: "Media Uploads",
          plan: limitCheck.plan,
          current: limitCheck.current,
          limit: limitCheck.limit,
          agencyId: subAccount.agencyId,
        })
      );
    }
  }

  const response = await db.media.create({
    data: {
      link: mediaFiles.link,
      name: mediaFiles.name,
      subAccountId: subAccountId,
    },
  });
  return response;
};

export const downgradeSubscription = async (agencyId: string, newPlan: "FREE" | "BASIC" | "UNLIMITED") => {
  try {
    const authUser = await currentUser();
    if (!authUser) return { error: "Unauthorized" };
    
    const { TIER_LIMITS } = await import("./subscription");
    const limits = TIER_LIMITS[newPlan];

    // Check SubAccounts
    const subAccountCount = await db.subAccount.count({ where: { agencyId } });
    if (subAccountCount > limits.subAccounts) {
      return { error: `Cannot downgrade: You have ${subAccountCount} Sub Accounts, but the ${newPlan} plan only allows ${limits.subAccounts}.` };
    }

    // Check Team Members
    const teamMembersCount = await db.user.count({ where: { agencyId } });
    if (teamMembersCount > limits.teamMembers) {
      return { error: `Cannot downgrade: You have ${teamMembersCount} Team Members, but the ${newPlan} plan only allows ${limits.teamMembers}.` };
    }

    // Check Media Uploads, Funnels, and Pipelines per SubAccount
    const subAccounts = await db.subAccount.findMany({
      where: { agencyId },
      select: { id: true, name: true, _count: { select: { Funnels: true, Pipeline: true } } },
    });
    const subAccountIds = subAccounts.map((s) => s.id);
    
    if (subAccountIds.length > 0) {
      const mediaUploadsCount = await db.media.count({
        where: { subAccountId: { in: subAccountIds } },
      });
      if (mediaUploadsCount > limits.mediaUploads) {
        return { error: `Cannot downgrade: You have ${mediaUploadsCount} Media Uploads, but the ${newPlan} plan only allows ${limits.mediaUploads}.` };
      }
    }

    for (const sa of subAccounts) {
      if (sa._count.Funnels > limits.funnelsPerSubAccount) {
        return { error: `Cannot downgrade: Sub Account '${sa.name}' has ${sa._count.Funnels} Funnels. The ${newPlan} plan allows a maximum of ${limits.funnelsPerSubAccount} funnels per Sub Account.` };
      }
      if (sa._count.Pipeline > limits.pipelinesPerSubAccount) {
        return { error: `Cannot downgrade: Sub Account '${sa.name}' has ${sa._count.Pipeline} Pipelines. The ${newPlan} plan allows a maximum of ${limits.pipelinesPerSubAccount} pipelines per Sub Account.` };
      }
    }

    // Update subscription
    await db.subscription.update({
      where: { agencyId },
      data: {
        plan: newPlan,
        active: true,
        razorpaySubscriptionId: newPlan === "FREE" ? null : undefined,
        currentPeriodEndDate: newPlan === "FREE" ? null : undefined,
      },
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Downgrade Error", error);
    return { error: "An unexpected error occurred during downgrade." };
  }
};

export const getMedia = async (subaccountId: string) => {
  const mediaFiles = await db.media.findMany({
    where: {
      subAccountId: subaccountId,
    },
    select: {
      id: true,
      name: true,
      link: true,
      type: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return mediaFiles;
};

export const deleteMedia = async (mediaId: string) => {
  const response = await db.media.delete({
    where: {
      id: mediaId,
    },
  });
  return response;
};

export const getPipelineDetails = async (pipelineId: string) => {
  const response = await db.pipeline.findUnique({
    where: { id: pipelineId },
  });

  return response;
};

export const getLanesWithTicketAndTags = async (pipelineId: string, ticketsLimit: number = 100) => {
  const response = await db.lane.findMany({
    where: {
      pipelineId,
    },
    orderBy: { order: "asc" },
    include: {
      Tickets: {
        orderBy: {
          order: "asc",
        },
        take: ticketsLimit,
        select: {
          id: true,
          name: true,
          description: true,
          value: true,
          order: true,
          laneId: true,
          customerId: true,
          assignedUserId: true,
          createdAt: true,
          updatedAt: true,
          version: true,
          Tags: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          Assigned: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          Customer: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });
  return response;
};

export const upsertFunnel = async (
  subaccountId: string,
  funnel: z.infer<typeof CreateFunnelFormSchema> & { liveProducts: string },
  funnelId: string,
  expectedVersion?: number
) => {
  // Check tier limit for funnels per subaccount (only on create)
  const existingFunnel = await db.funnel.findUnique({ where: { id: funnelId } });
  if (!existingFunnel) {
    const subAccount = await db.subAccount.findUnique({
      where: { id: subaccountId },
      select: { agencyId: true },
    });
    if (subAccount) {
      const limitCheck = await checkLimit(
        subAccount.agencyId,
        "funnelsPerSubAccount",
        subaccountId
      );
      if (!limitCheck.allowed) {
        throw new Error(
          JSON.stringify({
            error: "LIMIT_REACHED",
            resource: "Funnels",
            plan: limitCheck.plan,
            current: limitCheck.current,
            limit: limitCheck.limit,
            agencyId: subAccount.agencyId,
          })
        );
      }
    }
  }

  // Optimistic concurrency check on update
  if (existingFunnel && expectedVersion !== undefined) {
    if (existingFunnel.version !== expectedVersion) {
      throw new Error(
        JSON.stringify({
          error: "CONFLICT",
          message:
            "This funnel was modified by another user. Please refresh and try again.",
        })
      );
    }
  }

  const response = await db.funnel.upsert({
    where: { id: funnelId },
    update: { ...funnel, version: { increment: 1 } },
    create: {
      ...funnel,
      id: funnelId || v4(),
      subAccountId: subaccountId,
    },
  });

  return response;
};

export const upsertPipeline = async (
  pipeline: Prisma.PipelineUncheckedCreateWithoutLaneInput,
  expectedVersion?: number
) => {
  // Check tier limit for pipelines per subaccount (only on create)
  if (pipeline.subAccountId) {
    const existingPipeline = pipeline.id
      ? await db.pipeline.findUnique({ where: { id: pipeline.id } })
      : null;
    if (!existingPipeline) {
      const subAccount = await db.subAccount.findUnique({
        where: { id: pipeline.subAccountId },
        select: { agencyId: true },
      });
      if (subAccount) {
        const limitCheck = await checkLimit(
          subAccount.agencyId,
          "pipelinesPerSubAccount",
          pipeline.subAccountId
        );
        if (!limitCheck.allowed) {
          throw new Error(
            JSON.stringify({
              error: "LIMIT_REACHED",
              resource: "Pipelines",
              plan: limitCheck.plan,
              current: limitCheck.current,
              limit: limitCheck.limit,
              agencyId: subAccount.agencyId,
            })
          );
        }
      }
    }
  }

  // Optimistic concurrency check on update
  if (pipeline.id && expectedVersion !== undefined) {
    const current = await db.pipeline.findUnique({
      where: { id: pipeline.id },
      select: { version: true },
    });
    if (current && current.version !== expectedVersion) {
      throw new Error(
        JSON.stringify({
          error: "CONFLICT",
          message:
            "This pipeline was modified by another user. Please refresh and try again.",
        })
      );
    }
  }

  const { version: _v, ...pipelineData } = pipeline as any;
  const response = await db.pipeline.upsert({
    where: { id: pipeline.id || v4() },
    update: { ...pipelineData, version: { increment: 1 } },
    create: pipeline,
  });

  return response;
};

export const deletePipeline = async (pipelineId: string) => {
  const response = await db.pipeline.delete({
    where: { id: pipelineId },
  });
  return response;
};

export const updateLanesOrder = async (lanes: Lane[]) => {
  try {
    // Optimistic concurrency check for each lane
    for (const lane of lanes) {
      const current = await db.lane.findUnique({
        where: { id: lane.id },
        select: { version: true },
      });
      if (current && current.version !== lane.version) {
        throw new Error(
          JSON.stringify({
            error: "CONFLICT",
            message:
              "Lane order was modified by another user. Please refresh and try again.",
          })
        );
      }
    }

    const updateTrans = lanes.map((lane) =>
      db.lane.update({
        where: { id: lane.id },
        data: { order: lane.order, version: { increment: 1 } },
      })
    );

    await db.$transaction(updateTrans);
    console.log("🟢 Reordered Lane Successfully 🟢");
  } catch (error: any) {
    console.error("🔴 Failed while Reordering Lane 🔴", error.message);
    throw error;
  }
};

export const updateTicketsOrder = async (tickets: Ticket[]) => {
  try {
    // Optimistic concurrency check for each ticket
    for (const ticket of tickets) {
      const current = await db.ticket.findUnique({
        where: { id: ticket.id },
        select: { version: true },
      });
      if (current && current.version !== ticket.version) {
        throw new Error(
          JSON.stringify({
            error: "CONFLICT",
            message:
              "Ticket order was modified by another user. Please refresh and try again.",
          })
        );
      }
    }

    const updateTrans = tickets.map((ticket) =>
      db.ticket.update({
        where: { id: ticket.id },
        data: {
          order: ticket.order,
          laneId: ticket.laneId,
          version: { increment: 1 },
        },
      })
    );

    await db.$transaction(updateTrans);
    console.log("🟢 Reordered Tickets Successfully 🟢");
  } catch (error: any) {
    console.error("🔴 Failed while Reordering Ticket 🔴", error.message);
    throw error;
  }
};

export const upsertLane = async (
  lane: Prisma.LaneUncheckedCreateInput,
  expectedVersion?: number
) => {
  let order: number;

  if (!lane.order) {
    const lanes = await db.lane.findMany({
      where: {
        pipelineId: lane.pipelineId,
      },
    });

    order = lanes.length;
  } else {
    order = lane.order;
  }

  // Optimistic concurrency check on update
  if (lane.id && expectedVersion !== undefined) {
    const current = await db.lane.findUnique({
      where: { id: lane.id as string },
      select: { version: true },
    });
    if (current && current.version !== expectedVersion) {
      throw new Error(
        JSON.stringify({
          error: "CONFLICT",
          message:
            "This lane was modified by another user. Please refresh and try again.",
        })
      );
    }
  }

  const { version: _v, ...laneData } = lane as any;
  const response = await db.lane.upsert({
    where: { id: lane.id || v4() },
    update: { ...laneData, version: { increment: 1 } },
    create: { ...lane, order },
  });

  return response;
};

export const deleteLane = async (laneId: string) => {
  const response = await db.lane.delete({ where: { id: laneId } });

  return response;
};

export const getTicketsWithTags = async (pipelineId: string) => {
  const response = await db.ticket.findMany({
    where: {
      Lane: {
        pipelineId: pipelineId,
      },
    },
    include: {
      Tags: true,
      Assigned: true,
      Customer: true,
    },
  });

  return response;
};

export const getSubAccountTeamMembers = async (subAccountId: string) => {
  const subAccountUserWithAccess = await db.user.findMany({
    where: {
      Agency: {
        SubAccount: {
          some: {
            id: subAccountId,
          },
        },
      },
      role: "SUBACCOUNT_USER",
      Permissions: {
        some: {
          subAccountId: subAccountId,
          access: true,
        },
      },
    },
  });

  return subAccountUserWithAccess;
};

export const searchContacts = async (searchTerms: string, subAccountId: string) => {
  const response = await db.contact.findMany({
    where: {
      subAccountId,
      name: {
        contains: searchTerms,
      },
    },
  });

  return response;
};

export const upsertTicket = async (
  ticket: Prisma.TicketUncheckedCreateInput,
  tags: Tag[],
  expectedVersion?: number
) => {
  let order: number;

  if (!ticket.order) {
    const tickets = await db.ticket.findMany({
      where: {
        laneId: ticket.laneId,
      },
    });
    order = tickets.length;
  } else {
    order = ticket.order;
  }

  // Optimistic concurrency check on update
  if (ticket.id && expectedVersion !== undefined) {
    const current = await db.ticket.findUnique({
      where: { id: ticket.id as string },
      select: { version: true },
    });
    if (current && current.version !== expectedVersion) {
      throw new Error(
        JSON.stringify({
          error: "CONFLICT",
          message:
            "This ticket was modified by another user. Please refresh and try again.",
        })
      );
    }
  }

  const { version: _v, ...ticketData } = ticket as any;
  const response = await db.ticket.upsert({
    where: { id: ticket.id || v4() },
    update: { ...ticketData, Tags: { set: tags.map((tag) => ({ id: tag.id })) }, version: { increment: 1 } },
    create: { ...ticket, Tags: { connect: tags.map((tag) => ({ id: tag.id })) }, order },
    include: {
      Assigned: true,
      Customer: true,
      Tags: true,
      Lane: true,
    },
  });

  return response;
};

export const _getTicketsWithAllRelations = async (laneId: string) => {
  const response = await db.ticket.findMany({
    where: { laneId: laneId },
    include: {
      Assigned: true,
      Customer: true,
      Lane: true,
      Tags: true,
    },
  });

  return response;
};

export const deleteTicket = async (ticketId: string) => {
  const response = await db.ticket.delete({
    where: {
      id: ticketId,
    },
  });

  return response;
};

export const deleteTag = async (tagId: string) => {
  const response = await db.tag.delete({ where: { id: tagId } });
  return response;
};

export const getTagsForSubaccount = async (subaccountId: string) => {
  const response = await db.subAccount.findUnique({
    where: { id: subaccountId },
    select: { Tags: true },
  });
  return response;
};

export const upsertTag = async (
  subaccountId: string,
  tag: Prisma.TagUncheckedCreateInput,
  expectedVersion?: number
) => {
  // Optimistic concurrency check on update
  if (tag.id && expectedVersion !== undefined) {
    const current = await db.tag.findUnique({
      where: { id: tag.id as string },
      select: { version: true },
    });
    if (current && current.version !== expectedVersion) {
      throw new Error(
        JSON.stringify({
          error: "CONFLICT",
          message:
            "This tag was modified by another user. Please refresh and try again.",
        })
      );
    }
  }

  const { version: _v, ...tagData } = tag as any;
  const response = await db.tag.upsert({
    where: { id: tag.id || v4(), subAccountId: subaccountId },
    update: { ...tagData, version: { increment: 1 } },
    create: { ...tag, subAccountId: subaccountId },
  });

  return response;
};

export const upsertContact = async (
  contact: Prisma.ContactUncheckedCreateInput,
  expectedVersion?: number
) => {
  // Optimistic concurrency check on update
  if (contact.id && expectedVersion !== undefined) {
    const current = await db.contact.findUnique({
      where: { id: contact.id as string },
      select: { version: true },
    });
    if (current && current.version !== expectedVersion) {
      throw new Error(
        JSON.stringify({
          error: "CONFLICT",
          message:
            "This contact was modified by another user. Please refresh and try again.",
        })
      );
    }
  }

  const { version: _v, ...contactData } = contact as any;
  const response = await db.contact.upsert({
    where: { id: contact.id || v4() },
    update: { ...contactData, version: { increment: 1 } },
    create: contact,
  });

  return response;
};

export const getFunnels = async (subacountId: string) => {
  const funnels = await db.funnel.findMany({
    where: { subAccountId: subacountId },
    include: { FunnelPages: true },
  });

  return funnels;
};

export const getFunnel = async (funnelId: string) => {
  const funnel = await db.funnel.findUnique({
    where: { id: funnelId },
    include: {
      FunnelPages: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  return funnel;
};

export const updateFunnelProducts = async (
  products: string,
  funnelId: string
) => {
  const data = await db.funnel.update({
    where: { id: funnelId },
    data: { liveProducts: products },
  });
  return data;
};

export const upsertFunnelPage = async (
  subaccountId: string,
  funnelPage: UpsertFunnelPage,
  funnelId: string,
  expectedVersion?: number
) => {
  if (!subaccountId || !funnelId) return;

  // Optimistic concurrency check on update
  if (funnelPage.id && expectedVersion !== undefined) {
    const current = await db.funnelPage.findUnique({
      where: { id: funnelPage.id },
      select: { version: true },
    });
    if (current && current.version !== expectedVersion) {
      throw new Error(
        JSON.stringify({
          error: "CONFLICT",
          message:
            "This funnel page was modified by another user. Please refresh and try again.",
        })
      );
    }
  }

  const { version: _v, ...funnelPageData } = funnelPage as any;
  const response = await db.funnelPage.upsert({
    where: { id: funnelPage.id || "" },
    update: { ...funnelPageData, version: { increment: 1 } },
    create: {
      ...funnelPage,
      content: funnelPage.content
        ? funnelPage.content
        : JSON.stringify([
            {
              content: [],
              id: "__body",
              name: "Body",
              styles: { backgroundColor: "white" },
              type: "__body",
            },
          ]),
      funnelId,
    },
  });

  revalidatePath(`/subaccount/${subaccountId}/funnels/${funnelId}`, "page");
  return response;
};

export const deleteFunnelePage = async (funnelPageId: string) => {
  const response = await db.funnelPage.delete({ where: { id: funnelPageId } });

  return response;
};

export const getFunnelPageDetails = async (funnelPageId: string) => {
  const response = await db.funnelPage.findUnique({
    where: {
      id: funnelPageId,
    },
  });

  return response;
};

export const getDomainContent = async (subDomainName: string) => {
  const response = await db.funnel.findUnique({
    where: { subDomainName },
    include: { FunnelPages: true },
  });

  return response;
};

export const getPipelines = async (subaccountId: string) => {
  const response = await db.pipeline.findMany({
    where: { subAccountId: subaccountId },
    include: {
      Lane: {
        include: { Tickets: true },
      },
    },
  });
  return response;
};
