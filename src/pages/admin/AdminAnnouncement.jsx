import AnnouncementsBoard from "../../components/AnnouncementsBoard";

const initialAnnouncements = [
  {
    id: 1,
    title: "Coordinator Briefing",
    message: "Quarterly briefing scheduled for coordinators next Monday at 10 AM.",
    senderName: "Administrator",
    senderRole: "admin",
    date: "2025-12-01T10:00:00Z",
    recipients: ["coordinator"],
    important: true,
  },
];

export default function AdminAnnouncements() {
  return (
    <AnnouncementsBoard
      title="Admin Announcements"
      description="Send updates to coordinators and review recent posts."
      currentRole="admin"
      senderRole="admin"
      senderName="Administrator"
      allowedRecipients={["coordinator"]}
      storageKey="announcements:admin"
      initialAnnouncements={initialAnnouncements}
    />
  );
}
