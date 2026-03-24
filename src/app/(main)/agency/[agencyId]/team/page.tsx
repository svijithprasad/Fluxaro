import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";
import DataTable from "./_components/data-table";
import { Plus } from "lucide-react";
import { columns } from "./_components/columns";
import SendInvitation from "@/components/forms/send-invitation";

type Props = {
  params: { agencyId: string };
};

const TeamPage = async ({ params }: Props) => {
  const authUser = await currentUser();
  if (!authUser) return null;

  const agencyDetails = await db.agency.findUnique({
    where: { id: params.agencyId },
    include: { SubAccount: true },
  });

  if (!agencyDetails) return;

  const teamMembers = await db.user.findMany({
    where: { agencyId: params.agencyId },
    include: {
      Agency: { include: { SubAccount: true } },
      Permissions: { include: { SubAccount: true } },
    },
  })

  const invitations = await db.invitation.findMany({
    where: {
      agencyId: params.agencyId,
      status: 'PENDING',
    },
    include: { Agency: { include: { SubAccount: true } } },
  })

  // Merge team members and invitations
  const allTeamMembers = [
    ...teamMembers.map((user) => ({
      ...user,
      status: 'ACTIVE',
    })),
    ...invitations
      .filter(
        (invitation) =>
          !teamMembers.some((user) => user.email === invitation.email)
      )
      .map((invitation) => ({
        ...invitation,
      role: invitation.role,
      id: invitation.id,
      name: invitation.email.split('@')[0], // Use part of email as name for now
      avatarUrl: '', // No avatar for pending invitations
      Permissions: [], // No permissions yet
      createdAt: new Date(), // Placeholder
      updatedAt: new Date(), // Placeholder
      status: 'PENDING',
    })),
  ]

  return (
    <DataTable
      acctionButtonText={
        <>
          <Plus size={15} /> Add
        </>
      }
      modalChildren={<SendInvitation agencyId={agencyDetails.id} />}
      filterValue="name"
      columns={columns}
      data={allTeamMembers}
    ></DataTable>
  )
}

export default TeamPage;
