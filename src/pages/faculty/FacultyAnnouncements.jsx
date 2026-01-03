import AnnouncementsBoard from "../../components/AnnouncementsBoard";

const initialAnnouncements = [
  {
    id: 1,
    title: "Department Meeting",
    message: "All faculty are requested to join the meeting on Friday at 11 AM.",
    senderName: "Department Chair",
    senderRole: "chair",
    date: "2025-12-05T11:00:00Z",
    recipients: ["faculty"],
  },
  {
    id: 2,
    title: "Policy Update",
    message: "Updated grading policy is now in effect.",
    senderName: "Executive Office",
    senderRole: "executive",
    date: "2025-12-01T09:30:00Z",
    recipients: ["faculty"],
    important: true,
  },
];

const FacultyAnnouncements = () => {
  return (
    <AnnouncementsBoard
      title="Faculty Announcements"
      description="Review incoming announcements and send updates to students."
      currentRole="faculty"
      senderRole="faculty"
      senderName="Faculty"
      allowedRecipients={["student"]}
      storageKey="announcements:faculty"
      initialAnnouncements={initialAnnouncements}
      visibleRoles={["faculty", "chair", "executive", "coordinator"]}
    />
  );
};

export default FacultyAnnouncements;
