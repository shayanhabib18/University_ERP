import AnnouncementsBoard from "../../components/AnnouncementsBoard";

const initialAnnouncements = [
  {
    id: 1,
    title: "Semester Kickoff",
    message: "Welcome back! Please review the academic calendar for this term.",
    senderName: "Coordinator",
    senderRole: "coordinator",
    date: "2025-11-15T08:00:00Z",
    recipients: ["faculty", "student", "chair", "admin", "executive", "coordinator"],
  },
];

export default function CoordinatorAnnouncements() {
  return (
    <AnnouncementsBoard
      title="Coordinator Announcements"
      description="Broadcast updates to all roles across the institution."
      currentRole="coordinator"
      senderRole="coordinator"
      senderName="Coordinator"
      allowedRecipients={["admin", "executive", "chair", "faculty", "coordinator", "student"]}
      storageKey="announcements:coordinator"
      initialAnnouncements={initialAnnouncements}
    />
  );
}
