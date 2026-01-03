import AnnouncementsBoard from "../../components/AnnouncementsBoard";

const initialAnnouncements = [
  {
    id: 1,
    title: "New Academic Policies",
    message: "Updated academic policies are now in effect. Please review and share with your teams.",
    senderName: "Executive Office",
    senderRole: "executive",
    date: "2025-11-05T09:00:00Z",
    recipients: ["admin", "chair", "coordinator"],
    important: true,
  },
];

export default function ExecutiveAnnouncements() {
  return (
    <AnnouncementsBoard
      title="Executive Announcements"
      description="Create and view executive communications to admins, chairs, and coordinators."
      currentRole="executive"
      senderRole="executive"
      senderName="Executive"
      allowedRecipients={["admin", "chair", "coordinator"]}
      storageKey="announcements:executive"
      initialAnnouncements={initialAnnouncements}
      visibleRoles={["executive", "admin", "chair", "coordinator"]}
    />
  );
}
