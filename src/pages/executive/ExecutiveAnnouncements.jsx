import AnnouncementsList from "../../components/AnnouncementsList";

export default function ExecutiveAnnouncements() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Executive Announcements</h1>
        <p className="text-gray-600 mt-1">Send to students, dept chair, faculty, coordinator. Receive from coordinator and dept chair.</p>
      </div>
      <AnnouncementsList role="executive" canSend={true} allowedRecipients={["student", "dept_chair", "faculty", "coordinator"]} />
    </div>
  );
}
