// src/components/Announcements/AnnouncementItem.jsx
import React, { useState } from "react";
import { FiAlertCircle, FiClock, FiUser, FiChevronDown, FiChevronUp } from "react-icons/fi";

const AnnouncementItem = ({ announcement, role }) => {
  const [expanded, setExpanded] = useState(false);
  const [read, setRead] = useState(announcement.readBy?.includes(role));

  const toggleExpand = () => setExpanded(!expanded);
  const markAsRead = () => !read && setRead(true);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now - date) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className={`p-6 transition-all hover:bg-gray-50 ${
        !read ? "bg-blue-50/50" : ""
      }`}
      onClick={markAsRead}
    >
      <div className="flex gap-4">
        {/* Avatar/Badge */}
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            announcement.important 
              ? "bg-red-100 text-red-600" 
              : "bg-blue-100 text-blue-600"
          }`}>
            {announcement.important ? (
              <FiAlertCircle className="text-lg" />
            ) : (
              <FiUser className="text-lg" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold ${
                  !read ? "text-gray-900" : "text-gray-700"
                }`}>
                  {announcement.title}
                </h3>
                {announcement.important && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                    Important
                  </span>
                )}
                {!read && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    New
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm flex items-center gap-2">
                <span className="font-medium">{announcement.senderName}</span>
                <span className="text-gray-400">•</span>
                <span>{announcement.senderRole}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <FiClock className="text-gray-400" />
                <span>{formatDate(announcement.date)}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand();
                }}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
              >
                {expanded ? (
                  <>
                    <FiChevronUp />
                    <span>Show less</span>
                  </>
                ) : (
                  <>
                    <FiChevronDown />
                    <span>Read more</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Message */}
          <div className="mb-4">
            <p className={`text-gray-700 ${
              expanded ? "" : "line-clamp-2"
            }`}>
              {announcement.message}
            </p>
          </div>

          {/* Recipients */}
          <div className="flex flex-wrap gap-2">
            {announcement.recipients?.map((recipient) => (
              <span
                key={recipient}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
              >
                {recipient}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementItem;