import AnnouncementsList from "../../components/AnnouncementsList";

export default function CoordinatorAnnouncements() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Coordinator Announcements</h1>
        <p className="text-gray-600 mt-1">Manage what you receive and what you send.</p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">My Announcements</h2>
        <p className="text-gray-600 text-sm">Announcements you send to others.</p>
        <AnnouncementsList
          role="coordinator"
          canSend={true}
          allowedRecipients={["student", "faculty", "executive", "dept_chair"]}
          sentOnly={true}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-gray-800">Received</h2>
        <p className="text-gray-600 text-sm">Announcements sent to coordinators.</p>
        <AnnouncementsList
          role="coordinator"
          canSend={false}
          allowedRecipients={["student", "faculty", "executive", "dept_chair"]}
          sentOnly={false}
        />
      </div>
    </div>
  );
}
