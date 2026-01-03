import React, { useEffect, useMemo, useState } from "react";
import { Megaphone, Plus, UserCircle2, Clock3, Target } from "lucide-react";
import CreateAnnouncementModal from "./CreateAnnouncementModal";

const roleLabel = (role) => role ? role.charAt(0).toUpperCase() + role.slice(1) : "";

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch (err) {
    return null;
  }
};

const AnnouncementsBoard = ({
  title = "Announcements",
  description = "Create and view announcements for your portal",
  currentRole = "user",
  senderRole,
  senderName = "You",
  allowedRecipients = [],
  canCreate = true,
  storageKey,
  initialAnnouncements = [],
  visibleRoles,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const [announcements, setAnnouncements] = useState(() => {
    if (storageKey) {
      const cached = safeParse(localStorage.getItem(storageKey));
      if (Array.isArray(cached)) return cached;
    }
    return initialAnnouncements;
  });

  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(announcements));
    }
  }, [announcements, storageKey]);

  const audienceRoles = useMemo(() => {
    if (visibleRoles && visibleRoles.length > 0) return visibleRoles.map((r) => r.toLowerCase());
    return [currentRole.toLowerCase()];
  }, [visibleRoles, currentRole]);

  const handleSubmit = (payload) => {
    const next = {
      ...payload,
      senderName: payload.senderName || senderName,
      senderRole: (payload.senderRole || senderRole || currentRole).toLowerCase(),
      recipients: (payload.recipients || []).map((r) => r.toLowerCase()),
    };
    setAnnouncements((prev) => [next, ...prev]);
  };

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      const recipients = ann.recipients && ann.recipients.length > 0 ? ann.recipients.map((r) => r.toLowerCase()) : ["everyone"];
      const senderMatches = ann.senderRole && ann.senderRole.toLowerCase() === currentRole.toLowerCase();
      const roleMatches = selectedFilter === "all" ? recipients.some((r) => r === "everyone" || audienceRoles.includes(r)) : recipients.includes(selectedFilter);
      return senderMatches || roleMatches;
    });
  }, [announcements, selectedFilter, audienceRoles, currentRole]);

  const recipientFilters = useMemo(() => {
    const roles = new Set(["all", ...allowedRecipients.map((r) => r.toLowerCase())]);
    return Array.from(roles);
  }, [allowedRecipients]);

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-700">
              <Megaphone size={22} />
              <h2 className="text-2xl font-bold">{title}</h2>
            </div>
            <p className="text-gray-500 text-sm mt-1">{description}</p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              <Plus size={16} />
              New Announcement
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs uppercase tracking-wide text-gray-500">View</div>
          <div className="flex items-center gap-2">
            <Target size={14} className="text-gray-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="border rounded-md px-3 py-1.5 text-sm"
            >
              {recipientFilters.map((role) => (
                <option key={role} value={role}>
                  {role === "all" ? "All recipients" : roleLabel(role)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500">
            No announcements yet.
          </div>
        ) : (
          filteredAnnouncements.map((ann) => (
            <div key={ann.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold text-gray-800">{ann.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock3 size={14} />
                    <span>{ann.date ? new Date(ann.date).toLocaleString() : "Just now"}</span>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{ann.message}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                  <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <UserCircle2 size={14} />
                    {ann.senderName || "Unknown"} • {roleLabel(ann.senderRole)}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(ann.recipients && ann.recipients.length > 0 ? ann.recipients : ["everyone"]).map((r) => (
                      <span
                        key={`${ann.id}-${r}`}
                        className="inline-flex px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                      >
                        {roleLabel(r)}
                      </span>
                    ))}
                  </div>
                  {ann.important && (
                    <span className="inline-flex px-2 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                      High Priority
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <CreateAnnouncementModal
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          allowedRecipients={allowedRecipients.map((r) => r.toLowerCase())}
          senderRole={(senderRole || currentRole).toLowerCase()}
          senderName={senderName}
        />
      )}
    </div>
  );
};

export default AnnouncementsBoard;
