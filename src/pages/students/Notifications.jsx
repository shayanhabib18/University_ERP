export default function Notifications() {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold text-indigo-700 mb-4">🔔 Notifications</h2>
      <ul className="text-slate-700 list-disc ml-6 space-y-2">
        <li>Midterm exams schedule announced</li>
        <li>New assignment uploaded in Web Development</li>
        <li>Reminder: Fee due on 15th June</li>
      </ul>
    </div>
  );
}
