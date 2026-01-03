import AnnouncementsList from "../../components/AnnouncementsList";

const StudentAnnouncements = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Student Announcements</h1>
        <p className="text-gray-600 mt-1">View announcements shared by faculty and coordinator.</p>
      </div>
      <AnnouncementsList role="student" canSend={false} allowedRecipients={[]} />
    </div>
  );
};

export default StudentAnnouncements;
