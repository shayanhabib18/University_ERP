import AnnouncementsList from "../../components/AnnouncementsList";

export default function ChairAnnouncements() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Department Chair Announcements</h1>
        <p className="text-gray-600 mt-1">Send to students, faculty, coordinator, executive. Receive from executive and coordinator.</p>
      </div>
      <AnnouncementsList role="dept_chair" canSend={true} allowedRecipients={["student", "faculty", "coordinator", "executive"]} />
    </div>
  );
}
