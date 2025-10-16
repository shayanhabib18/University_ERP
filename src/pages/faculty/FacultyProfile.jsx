import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Award,
  Edit3,
  Save,
  X,
  Camera,
  GraduationCap,
  Briefcase,
  Globe,
  Linkedin,
  Twitter,
  FileText,
  Download,
  Shield,
  Bell,
  Lock,
} from "lucide-react";

const FacultyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [profile, setProfile] = useState({
    personal: {
      firstName: "Sarah",
      lastName: "Johnson",
      title: "Professor",
      department: "Computer Science",
      email: "sarah.johnson@university.edu",
      phone: "+1 (555) 123-4567",
      office: "Room 304, CS Building",
      joinDate: "2018-08-15",
      dateOfBirth: "1985-03-22",
    },
    academic: {
      qualifications: [
        {
          degree: "PhD in Computer Science",
          institution: "Stanford University",
          year: "2015",
          field: "Artificial Intelligence",
        },
        {
          degree: "MSc in Computer Science",
          institution: "MIT",
          year: "2011",
          field: "Machine Learning",
        },
        {
          degree: "BSc in Computer Engineering",
          institution: "University of California",
          year: "2009",
          field: "Computer Systems",
        },
      ],
      researchInterests: [
        "Machine Learning",
        "Natural Language Processing",
        "Computer Vision",
        "Educational Technology",
      ],
      publications: 42,
      citations: 1280,
      hIndex: 18,
    },
    professional: {
      experience: [
        {
          position: "Professor",
          institution: "Tech University",
          period: "2018 - Present",
          description:
            "Teaching undergraduate and graduate courses in AI and Machine Learning",
        },
        {
          position: "Senior Researcher",
          institution: "AI Research Lab",
          period: "2015 - 2018",
          description:
            "Led research projects in NLP and computer vision applications",
        },
        {
          position: "Lecturer",
          institution: "Stanford University",
          period: "2013 - 2015",
          description:
            "Taught introductory programming and data structures courses",
        },
      ],
      awards: [
        {
          name: "Excellence in Teaching Award",
          year: "2023",
          organization: "University Senate",
        },
        {
          name: "Best Research Paper",
          year: "2021",
          organization: "International AI Conference",
        },
        {
          name: "Outstanding Faculty",
          year: "2020",
          organization: "Computer Science Department",
        },
      ],
    },
    social: {
      website: "https://sarahjohnson.academia.edu",
      linkedin: "https://linkedin.com/in/sarahjohnson",
      twitter: "https://twitter.com/profsjohnson",
      googleScholar: "https://scholar.google.com/citations?user=sjohnson",
    },
    settings: {
      emailNotifications: true,
      announcementAlerts: true,
      courseUpdates: true,
      securityAlerts: true,
      twoFactorAuth: false,
    },
  });

  const [editData, setEditData] = useState(profile);

  const handleSave = () => {
    setProfile(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(profile);
    setIsEditing(false);
  };

  const handleInputChange = (section, field, value) => {
    setEditData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleArrayChange = (section, field, index, value) => {
    setEditData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].map((item, i) =>
          i === index ? { ...item, ...value } : item
        ),
      },
    }));
  };

  const addQualification = () => {
    setEditData((prev) => ({
      ...prev,
      academic: {
        ...prev.academic,
        qualifications: [
          ...prev.academic.qualifications,
          { degree: "", institution: "", year: "", field: "" },
        ],
      },
    }));
  };

  const removeQualification = (index) => {
    setEditData((prev) => ({
      ...prev,
      academic: {
        ...prev.academic,
        qualifications: prev.academic.qualifications.filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  const ProfileHeader = () => (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white mb-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              SJ
            </div>
            {isEditing && (
              <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-lg text-gray-700 hover:bg-gray-100 transition-colors">
                <Camera size={16} />
              </button>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {editData.personal.title} {editData.personal.firstName}{" "}
              {editData.personal.lastName}
            </h1>
            <p className="text-gray-300 text-lg mt-1">
              {editData.personal.department}
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-300">
              <div className="flex items-center gap-1">
                <Mail size={14} />
                {editData.personal.email}
              </div>
              <div className="flex items-center gap-1">
                <Phone size={14} />
                {editData.personal.phone}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X size={16} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl transition-colors"
              >
                <Save size={16} />
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <Edit3 size={16} />
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const PersonalInfo = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <User className="text-indigo-600" size={20} />
        Personal Information
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editData.personal.firstName}
              onChange={(e) =>
                handleInputChange("personal", "firstName", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          ) : (
            <p className="p-3 bg-gray-50 rounded-xl">
              {profile.personal.firstName}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editData.personal.lastName}
              onChange={(e) =>
                handleInputChange("personal", "lastName", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          ) : (
            <p className="p-3 bg-gray-50 rounded-xl">
              {profile.personal.lastName}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editData.personal.title}
              onChange={(e) =>
                handleInputChange("personal", "title", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          ) : (
            <p className="p-3 bg-gray-50 rounded-xl">
              {profile.personal.title}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editData.personal.department}
              onChange={(e) =>
                handleInputChange("personal", "department", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          ) : (
            <p className="p-3 bg-gray-50 rounded-xl">
              {profile.personal.department}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Mail size={14} />
            Email
          </label>
          {isEditing ? (
            <input
              type="email"
              value={editData.personal.email}
              onChange={(e) =>
                handleInputChange("personal", "email", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          ) : (
            <p className="p-3 bg-gray-50 rounded-xl">
              {profile.personal.email}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Phone size={14} />
            Phone
          </label>
          {isEditing ? (
            <input
              type="tel"
              value={editData.personal.phone}
              onChange={(e) =>
                handleInputChange("personal", "phone", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          ) : (
            <p className="p-3 bg-gray-50 rounded-xl">
              {profile.personal.phone}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <MapPin size={14} />
            Office Location
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editData.personal.office}
              onChange={(e) =>
                handleInputChange("personal", "office", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          ) : (
            <p className="p-3 bg-gray-50 rounded-xl">
              {profile.personal.office}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar size={14} />
            Join Date
          </label>
          {isEditing ? (
            <input
              type="date"
              value={editData.personal.joinDate}
              onChange={(e) =>
                handleInputChange("personal", "joinDate", e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          ) : (
            <p className="p-3 bg-gray-50 rounded-xl">
              {new Date(profile.personal.joinDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const AcademicInfo = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <GraduationCap className="text-blue-600" size={20} />
        Academic Background
      </h3>

      {/* Qualifications */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-800">Qualifications</h4>
          {isEditing && (
            <button
              onClick={addQualification}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              <Plus size={14} />
              Add Qualification
            </button>
          )}
        </div>
        <div className="space-y-4">
          {editData.academic.qualifications.map((qual, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              {isEditing ? (
                <div className="flex-1 grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Degree"
                    value={qual.degree}
                    onChange={(e) =>
                      handleArrayChange("academic", "qualifications", index, {
                        degree: e.target.value,
                      })
                    }
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Institution"
                    value={qual.institution}
                    onChange={(e) =>
                      handleArrayChange("academic", "qualifications", index, {
                        institution: e.target.value,
                      })
                    }
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    value={qual.year}
                    onChange={(e) =>
                      handleArrayChange("academic", "qualifications", index, {
                        year: e.target.value,
                      })
                    }
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Field"
                    value={qual.field}
                    onChange={(e) =>
                      handleArrayChange("academic", "qualifications", index, {
                        field: e.target.value,
                      })
                    }
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900">{qual.degree}</h5>
                  <p className="text-gray-600">
                    {qual.institution} • {qual.year}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{qual.field}</p>
                </div>
              )}
              {isEditing && (
                <button
                  onClick={() => removeQualification(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Research Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">
            {profile.academic.publications}
          </div>
          <div className="text-sm text-blue-600">Publications</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
          <div className="text-2xl font-bold text-green-700">
            {profile.academic.citations}
          </div>
          <div className="text-sm text-green-600">Citations</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
          <div className="text-2xl font-bold text-purple-700">
            {profile.academic.hIndex}
          </div>
          <div className="text-sm text-purple-600">h-index</div>
        </div>
      </div>

      {/* Research Interests */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-4">Research Interests</h4>
        <div className="flex flex-wrap gap-2">
          {profile.academic.researchInterests.map((interest, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const ProfessionalInfo = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Briefcase className="text-amber-600" size={20} />
        Professional Experience
      </h3>

      {/* Work Experience */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-800 mb-4">Work Experience</h4>
        <div className="space-y-4">
          {profile.professional.experience.map((exp, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div className="flex items-start justify-between mb-2">
                <h5 className="font-semibold text-gray-900">{exp.position}</h5>
                <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-lg border">
                  {exp.period}
                </span>
              </div>
              <p className="text-gray-700 font-medium mb-2">
                {exp.institution}
              </p>
              <p className="text-gray-600 text-sm">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Awards & Honors */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-4">Awards & Honors</h4>
        <div className="space-y-3">
          {profile.professional.awards.map((award, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-3 bg-amber-50 rounded-lg border border-amber-200"
            >
              <Award className="text-amber-600 flex-shrink-0" size={20} />
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900">{award.name}</h5>
                <p className="text-sm text-gray-600">
                  {award.organization} • {award.year}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const SocialLinks = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Globe className="text-green-600" size={20} />
        Social & Professional Links
      </h3>

      <div className="grid gap-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
          <Globe className="text-gray-600" size={20} />
          <div className="flex-1">
            <p className="font-medium text-gray-900">Website</p>
            {isEditing ? (
              <input
                type="url"
                value={editData.social.website}
                onChange={(e) =>
                  handleInputChange("social", "website", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="https://your-website.com"
              />
            ) : (
              <a
                href={profile.social.website}
                className="text-blue-600 hover:underline text-sm"
              >
                {profile.social.website}
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
          <Linkedin className="text-blue-600" size={20} />
          <div className="flex-1">
            <p className="font-medium text-gray-900">LinkedIn</p>
            {isEditing ? (
              <input
                type="url"
                value={editData.social.linkedin}
                onChange={(e) =>
                  handleInputChange("social", "linkedin", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            ) : (
              <a
                href={profile.social.linkedin}
                className="text-blue-600 hover:underline text-sm"
              >
                {profile.social.linkedin}
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
          <Twitter className="text-sky-500" size={20} />
          <div className="flex-1">
            <p className="font-medium text-gray-900">Twitter</p>
            {isEditing ? (
              <input
                type="url"
                value={editData.social.twitter}
                onChange={(e) =>
                  handleInputChange("social", "twitter", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="https://twitter.com/yourhandle"
              />
            ) : (
              <a
                href={profile.social.twitter}
                className="text-blue-600 hover:underline text-sm"
              >
                {profile.social.twitter}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const Settings = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Shield className="text-gray-600" size={20} />
        Account Settings
      </h3>

      <div className="space-y-6">
        {/* Notification Settings */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Bell size={16} />
            Notification Preferences
          </h4>
          <div className="space-y-3">
            {Object.entries(profile.settings).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div>
                  <p className="font-medium text-gray-900 capitalize">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </p>
                  <p className="text-sm text-gray-600">
                    Receive notifications for {key}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => {}}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Export Data */}
        <div className="pt-6 border-t">
          <h4 className="font-semibold text-gray-800 mb-4">Data Management</h4>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors">
            <Download size={16} />
            Export Profile Data
          </button>
        </div>
      </div>
    </div>
  );

  const Plus = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path
        d="M10 4V16M4 10H16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <ProfileHeader />

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <nav className="space-y-2">
                {[
                  { id: "personal", label: "Personal Info", icon: User },
                  { id: "academic", label: "Academic", icon: GraduationCap },
                  {
                    id: "professional",
                    label: "Professional",
                    icon: Briefcase,
                  },
                  { id: "social", label: "Social Links", icon: Globe },
                  { id: "settings", label: "Settings", icon: Shield },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 w-full text-left p-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === "personal" && <PersonalInfo />}
            {activeTab === "academic" && <AcademicInfo />}
            {activeTab === "professional" && <ProfessionalInfo />}
            {activeTab === "social" && <SocialLinks />}
            {activeTab === "settings" && <Settings />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyProfile;
