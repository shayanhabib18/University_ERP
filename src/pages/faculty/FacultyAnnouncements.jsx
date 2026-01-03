import AnnouncementsList from "../../components/AnnouncementsList";

const FacultyAnnouncements = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Faculty Announcements</h1>
        <p className="text-gray-600 mt-1">Send announcements to students. Receive from coordinator and department chair.</p>
      </div>
      <AnnouncementsList role="faculty" canSend={true} allowedRecipients={["student"]} />
    </div>
  );
};

export default FacultyAnnouncements;
