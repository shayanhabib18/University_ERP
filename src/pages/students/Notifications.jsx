import AnnouncementsBoard from "../../components/AnnouncementsBoard";

const initialAnnouncements = [
  {
    id: 1,
    title: "Portal Maintenance",
    message: "The online portal will be under maintenance this weekend.",
    senderName: "Admin",
    senderRole: "admin",
    date: "2025-06-20T08:00:00Z",
    recipients: ["student"],
  },
  {
    id: 2,
    title: "Midterm Schedule",
    message: "Mid-term exams will start from 10th July.",
    senderName: "Faculty Member",
    senderRole: "faculty",
    date: "2025-06-25T09:00:00Z",
    recipients: ["student"],
  },
  {
    id: 3,
    title: "Orientation",
    message: "Department orientation will be held on 1st July.",
    senderName: "Coordinator",
    senderRole: "coordinator",
    date: "2025-06-27T10:00:00Z",
    recipients: ["student"],
  },
];

const StudentAnnouncements = () => {
  return (
    <AnnouncementsBoard
      title="Student Announcements"
      description="View announcements shared by faculty, chair, and coordinator."
      currentRole="student"
      senderRole="student"
      senderName="Student"
      allowedRecipients={[]}
      canCreate={false}
      storageKey="announcements:student"
      initialAnnouncements={initialAnnouncements}
      visibleRoles={["student"]}
    />
  );
};

export default StudentAnnouncements;
