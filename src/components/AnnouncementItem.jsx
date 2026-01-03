// src/components/Announcements/AnnouncementItem.jsx
import React, { useState } from "react";

const AnnouncementItem = ({ announcement, role }) => {
  const [expanded, setExpanded] = useState(false);
  const [read, setRead] = useState(announcement.readBy?.includes(role));

  const toggleExpand = () => setExpanded(!expanded);
  const markAsRead = () => setRead(true);

  return (
    <div
      className={`p-4 border rounded-md shadow-sm ${
        announcement.important ? "border-red-500 bg-red-50" : "border-gray-200"
      } ${read ? "opacity-80" : "opacity-100"}`}
      onClick={markAsRead}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{announcement.title}</h3>
          <p className="text-gray-700">
            {expanded
              ? announcement.message
              : `${announcement.message.slice(0, 100)}${
                  announcement.message.length > 100 ? "..." : ""
                }`}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            From {announcement.senderName} ({announcement.senderRole}) •{" "}
            {new Date(announcement.date).toLocaleString()}
          </p>
        </div>
        <button
          onClick={toggleExpand}
          className="ml-2 text-blue-600 text-sm hover:underline"
        >
          {expanded ? "Show Less" : "Read More"}
        </button>
      </div>
      {!read && <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Unread</span>}
    </div>
  );
};

export default AnnouncementItem;
