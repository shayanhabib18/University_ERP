import AnnouncementsBoard from "../../components/AnnouncementsBoard";

const initialAnnouncements = [
  {
    id: 1,
    title: "Faculty Meeting",
    message: "Department meeting on Monday at 10 AM.",
    senderName: "Chair",
    senderRole: "chair",
    date: "2025-10-20T10:00:00Z",
    recipients: ["faculty", "coordinator"],
  },
  {
    id: 2,
    title: "Midterm Reminder",
    message: "Midterms start next week. Prepare accordingly.",
    senderName: "Chair",
    senderRole: "chair",
    date: "2025-10-18T09:00:00Z",
    recipients: ["student"],
  },
  {
    id: 3,
    title: "University Clean-up Drive",
    message: "All departments must participate in the event.",
    senderName: "Admin Office",
    senderRole: "admin",
    date: "2025-10-17T08:30:00Z",
    recipients: ["chair"],
  },
];

export default function ChairAnnouncements() {
  return (
    <AnnouncementsBoard
      title="Chair Announcements"
      description="Send updates to faculty, students, and coordinators."
      currentRole="chair"
      senderRole="chair"
      senderName="Department Chair"
      allowedRecipients={["faculty", "student", "coordinator"]}
      storageKey="announcements:chair"
      initialAnnouncements={initialAnnouncements}
      visibleRoles={["chair", "faculty", "student", "coordinator"]}
    />
  );
}
