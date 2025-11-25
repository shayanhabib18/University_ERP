import { useEffect, useState } from "react";
import { BarChart3, CheckCircle, Clock, MessageSquare, Send, Tag } from "lucide-react";

export default function CoordinatorFeedback() {
  const feedbackSeed = [
    {
      id: "FDB-1201",
      facultyName: "Dr. Ayesha Malik",
      course: "Data Structures",
      submittedOn: "2025-11-15 09:15",
      priority: "High",
      status: "Pending",
      message:
        "Students are facing difficulty with the current evaluation rubrics. Requesting a moderation review before final grading.",
      attachments: ["Rubric-v2.pdf", "Section-B-progress.xlsx"],
      responses: [
        {
          by: "Quality Cell",
          date: "2025-11-16 11:40",
          text: "Received the request. Waiting for coordinator's confirmation to initiate moderation.",
        },
      ],
    },
    {
      id: "FDB-1205",
      facultyName: "Prof. Kamran Javed",
      course: "Compiler Construction",
      submittedOn: "2025-11-12 14:05",
      priority: "Medium",
      status: "In Progress",
      message:
        "Need clarity on the plagiarism thresholds for the project milestone that is due next week.",
      attachments: ["Project-Policy.docx"],
      responses: [
        {
          by: "Coordinator Office",
          date: "2025-11-13 10:28",
          text: "Provided latest academic policy. Waiting for acknowledgment.",
        },
      ],
    },
    {
      id: "FDB-1199",
      facultyName: "Ms. Hira Saeed",
      course: "Human Computer Interaction",
      submittedOn: "2025-11-10 08:30",
      priority: "Low",
      status: "Resolved",
      message: "Shared the updated lab manual. Please confirm if any further action is required.",
      attachments: [],
      responses: [
        {
          by: "Coordinator Office",
          date: "2025-11-10 12:00",
          text: "Reviewed and archived. No additional action needed.",
        },
      ],
    },
  ];

  const [feedbackItems, setFeedbackItems] = useState(feedbackSeed);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(feedbackSeed[0]?.id ?? null);
  const [responseDraft, setResponseDraft] = useState("");

  const filteredItems = feedbackItems.filter((item) => {
    const matchesStatus = filterStatus === "All" || item.status === filterStatus;
    const matchesSearch =
      item.facultyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const selectedFeedback =
    feedbackItems.find((item) => item.id === selectedFeedbackId) || filteredItems[0] || null;

  useEffect(() => {
    if (!selectedFeedback && filteredItems[0]) {
      setSelectedFeedbackId(filteredItems[0].id);
    }
  }, [filteredItems, selectedFeedback]);

  useEffect(() => {
    setResponseDraft("");
  }, [selectedFeedbackId]);

  const summary = feedbackItems.reduce(
    (acc, item) => {
      acc.total += 1;
      if (item.status === "Pending") acc.pending += 1;
      if (item.status === "In Progress") acc.progress += 1;
      if (item.status === "Resolved") acc.resolved += 1;
      return acc;
    },
    { total: 0, pending: 0, progress: 0, resolved: 0 }
  );

  const handleStatusUpdate = (status) => {
    if (!selectedFeedback) return;
    setFeedbackItems((prev) =>
      prev.map((item) => (item.id === selectedFeedback.id ? { ...item, status } : item))
    );
  };

  const handleAddResponse = () => {
    if (!selectedFeedback || !responseDraft.trim()) return;
    const newResponse = {
      by: "Coordinator",
      date: new Date().toLocaleString(),
      text: responseDraft.trim(),
    };
    setFeedbackItems((prev) =>
      prev.map((item) =>
        item.id === selectedFeedback.id
          ? { ...item, responses: [...item.responses, newResponse] }
          : item
      )
    );
    setResponseDraft("");
  };

  const statusOptions = ["All", "Pending", "In Progress", "Resolved"];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Faculty Feedback</h1>
          <p className="text-gray-500">Track escalations, respond, and keep everyone in sync.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option}
              onClick={() => setFilterStatus(option)}
              className={`px-4 py-2 rounded-full text-sm border transition ${
                filterStatus === option
                  ? "bg-orange-600 text-white border-orange-600 shadow"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <FeedbackStatCard label="Total" value={summary.total} icon={<MessageSquare size={20} />} />
        <FeedbackStatCard label="Pending" value={summary.pending} icon={<Clock size={20} />} />
        <FeedbackStatCard
          label="In Progress"
          value={summary.progress}
          icon={<BarChart3 size={20} />}
        />
        <FeedbackStatCard
          label="Resolved"
          value={summary.resolved}
          icon={<CheckCircle size={20} />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow border border-gray-100">
            <div className="flex items-center gap-3">
              <Tag className="text-orange-600" size={18} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by faculty name, course or ticket id"
                className="flex-1 bg-transparent outline-none text-sm text-gray-600"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow border border-gray-100 divide-y">
            {filteredItems.length === 0 && (
              <p className="p-6 text-center text-sm text-gray-500">
                No feedback matches your filters. Try adjusting the criteria.
              </p>
            )}
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedFeedbackId(item.id)}
                className={`w-full text-left p-5 transition ${
                  selectedFeedback?.id === item.id ? "bg-orange-50" : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.facultyName}</p>
                    <p className="text-xs text-gray-500">{item.course}</p>
                  </div>
                  <span className="text-xs text-gray-400">{item.submittedOn}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <StatusChip value={item.status} />
                  <PriorityChip value={item.priority} />
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">{item.id}</span>
                </div>
                <p className="mt-3 text-sm text-gray-600 line-clamp-2">{item.message}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
          {selectedFeedback ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-400">Ticket</p>
                  <h2 className="text-xl font-bold text-gray-800">{selectedFeedback.id}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedFeedback.facultyName} · {selectedFeedback.course}
                  </p>
                </div>
                <div className="space-y-2 text-right">
                  <StatusChip value={selectedFeedback.status} />
                  <PriorityChip value={selectedFeedback.priority} />
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600 whitespace-pre-wrap">{selectedFeedback.message}</p>

              {selectedFeedback.attachments.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Attachments</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFeedback.attachments.map((file) => (
                      <span
                        key={file}
                        className="px-3 py-1 rounded-full bg-gray-100 text-xs text-gray-600"
                      >
                        {file}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                {["Pending", "In Progress", "Resolved"].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    className={`px-4 py-2 rounded-lg text-sm border transition ${
                      selectedFeedback.status === status
                        ? "bg-orange-600 text-white border-orange-600"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <p className="text-sm font-semibold text-gray-700">Conversation</p>
                <div className="space-y-3 max-h-48 overflow-auto pr-2">
                  {selectedFeedback.responses.map((response, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-400">{response.date}</p>
                      <p className="text-sm font-semibold text-gray-700">{response.by}</p>
                      <p className="text-sm text-gray-600">{response.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <textarea
                  value={responseDraft}
                  onChange={(e) => setResponseDraft(e.target.value)}
                  rows={3}
                  placeholder="Add an update or response..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                <button
                  onClick={handleAddResponse}
                  className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white py-3 rounded-xl shadow hover:bg-orange-700 transition"
                >
                  <Send size={16} /> Send Update
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-sm text-gray-500">
              Select a feedback item to review details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function FeedbackStatCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-2xl shadow border border-gray-100 p-4 flex items-center gap-4">
      <div className="p-3 rounded-full bg-orange-100 text-orange-600">{icon}</div>
      <div>
        <p className="text-xs uppercase text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function StatusChip({ value }) {
  const styles = {
    Pending: "bg-amber-100 text-amber-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Resolved: "bg-emerald-100 text-emerald-700",
  }[value] || "bg-gray-100 text-gray-600";

  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles}`}>{value}</span>;
}

function PriorityChip({ value }) {
  const styles = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-700",
  }[value] || "bg-gray-100 text-gray-600";

  return <span className={`px-3 py-1 rounded-full text-xs ${styles}`}>{value} priority</span>;
}

