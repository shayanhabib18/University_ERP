import { useEffect, useState } from "react";
import {
  Send,
  Inbox,
  FileText,
  Upload,
  Users,
  Mail,
  Clock,
  Download,
  Trash2,
} from "lucide-react";
import facultyMessageAPI from "../../services/facultyMessageAPI";

export default function ContactFaculty() {
  const [faculties, setFaculties] = useState([]);
  const [form, setForm] = useState({ recipient: "", subject: "", body: "", file: null });
  const [inbox, setInbox] = useState([]);
  const [sent, setSent] = useState([]);
  const [activeTab, setActiveTab] = useState("compose");
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    loadFaculties();
    loadMessages();
  }, []);

  const loadFaculties = async () => {
    try {
      const token = localStorage.getItem("facultyToken");
      const res = await fetch("http://localhost:5000/faculties", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setFaculties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading faculties", err);
    }
  };

  const loadMessages = async () => {
    try {
      setLoadingMessages(true);
      const [inboxData, sentData] = await Promise.all([
        facultyMessageAPI.getInbox().catch(() => []),
        facultyMessageAPI.getSent().catch(() => []),
      ]);
      setInbox(inboxData || []);
      setSent(sentData || []);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSend = async () => {
    if (!form.recipient || (!form.subject && !form.body)) {
      alert("Recipient and a subject or message are required");
      return;
    }
    try {
      setLoading(true);
      await facultyMessageAPI.sendMessage({
        recipientFacultyId: form.recipient,
        subject: form.subject,
        body: form.body,
        file: form.file,
      });
      alert("✅ Message sent");
      setForm({ recipient: "", subject: "", body: "", file: null });
      loadMessages();
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleDownload = (url) => {
    if (!url) return;
    const downloadUrl = url.startsWith("http") ? url : `http://localhost:5000${url}`;
    window.open(downloadUrl, "_blank");
  };

  const handleDelete = async (messageId) => {
    if (!confirm("Are you sure you want to delete this message?")) {
      return;
    }
    try {
      await facultyMessageAPI.deleteMessage(messageId);
      alert("✅ Message deleted");
      loadMessages();
    } catch (err) {
      alert(`❌ ${err.message}`);
    }
  };

  const MessageList = ({ items, title, empty }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Inbox size={18} className="text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">{empty}</p>
      ) : (
        <div className="space-y-3">
          {items.map((msg) => (
            <div
              key={msg.id}
              className="border border-gray-200 rounded-lg p-3 hover:border-blue-200"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {msg.sender?.name || msg.recipient?.name || "Faculty"}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Mail size={12} />
                    {msg.sender?.email || msg.recipient?.email || ""}
                  </p>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={12} /> {formatDateTime(msg.created_at)}
                </p>
              </div>
              {msg.subject && (
                <p className="text-sm font-semibold text-gray-800 mt-2">{msg.subject}</p>
              )}
              {msg.body && (
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{msg.body}</p>
              )}
              {msg.attachment_url && (
                <button
                  onClick={() => handleDownload(msg.attachment_url)}
                  className="mt-2 inline-flex items-center gap-2 text-blue-600 hover:underline text-sm"
                >
                  <Download size={14} /> Download Attachment
                </button>
              )}
              <button
                onClick={() => handleDelete(msg.id)}
                className="mt-2 ml-3 inline-flex items-center gap-2 text-red-600 hover:underline text-sm"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/10 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="text-blue-600" size={26} />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Contact Faculty</h1>
                <p className="text-gray-500 text-sm">Send messages and share documents with colleagues</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("compose")}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  activeTab === "compose" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                Compose
              </button>
              <button
                onClick={() => setActiveTab("inbox")}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  activeTab === "inbox" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                Inbox
              </button>
              <button
                onClick={() => setActiveTab("sent")}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  activeTab === "sent" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                Sent
              </button>
            </div>
          </div>
        </div>

        {activeTab === "compose" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient</label>
              <select
                name="recipient"
                value={form.recipient}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="">Select faculty</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name || f.email} ({f.designation || ""})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter subject"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                name="body"
                value={form.body}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Write your message"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (optional)</label>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200">
                <Upload size={16} />
                {form.file ? form.file.name : "Choose file"}
                <input type="file" name="file" onChange={handleChange} className="hidden" />
              </label>
            </div>
            <button
              onClick={handleSend}
              disabled={loading}
              className="px-5 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:bg-gray-400"
            >
              <Send size={16} /> {loading ? "Sending..." : "Send Message"}
            </button>
          </div>
        )}

        {activeTab === "inbox" && (
          <MessageList
            items={inbox}
            title="Inbox"
            empty={loadingMessages ? "Loading..." : "No messages"}
          />
        )}

        {activeTab === "sent" && (
          <MessageList
            items={sent}
            title="Sent"
            empty={loadingMessages ? "Loading..." : "No sent messages"}
          />
        )}
      </div>
    </div>
  );
}
