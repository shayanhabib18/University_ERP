import AnnouncementsList from "../../components/AnnouncementsList";

export default function AdminAnnouncements() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Admin Announcements</h1>
        <p className="text-gray-600 mt-1">Send updates to coordinators only.</p>
      </div>
      <AnnouncementsList role="admin" canSend={true} allowedRecipients={["coordinator"]} />
    </div>
  );
}
