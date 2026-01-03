import AnnouncementsList from "../../components/AnnouncementsList";

export default function CoordinatorAnnouncements() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Coordinator Announcements</h1>
        <p className="text-gray-600 mt-1">Send to students, faculty, executive, dept chair. Receive from admin, faculty, executive, dept chair.</p>
      </div>
      <AnnouncementsList role="coordinator" canSend={true} allowedRecipients={["student", "faculty", "executive", "dept_chair"]} />
    </div>
  );
}
