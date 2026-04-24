"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateUser } from "@/store/slices/authSlice";
import axiosInstance from "@/lib/axiosInstance";
import Image from "next/image";

import ProtectedRoute from "@/components/ProtectedRoute";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import CustomIcon from "@/components/ui/CustomIcon";

const UserProfilePage = () => {
  const { user: authUser } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [profileData, setProfileData] = useState<any>({
    fullname: "",
    email: "",
    profileImage: "",
    resume: "",
    phone: "",
    location: "",
    headline: "",
    bio: "",
    position: "",
    skills: [],
    languages: [],
    experience: [],
    education: [],
    certifications: [],
    projects: [],
    socialLinks: { linkedin: "", github: "", portfolio: "" },
    availability: { status: "Available", type: "Full-time" },
  });
  const [imagePreview, setImagePreview] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [pendingData, setPendingData] = useState<any>(null);
  const [uploadingAsset, setUploadingAsset] = useState<string | null>(null); // section name e.g. "projects.0"
  const [editingCard, setEditingCard] = useState<string | null>(null); // section-index e.g. "experience-0"
  const [showSyncModal, setShowSyncModal] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/auth/profile");
      if (response.data.success) {
        const userData = response.data.data;
        setProfileData({
          fullname: userData.fullname || "",
          email: userData.email || "",
          position: userData.position || "",
          headline: userData.headline || "",
          profileImage: userData.profileImage || "",
          resume: userData.resume || "",
          phone: userData.phone || "",
          location: userData.location || "",
          bio: userData.bio || "",
          skills: Array.isArray(userData.skills) ? userData.skills : [],
          languages: userData.languages || [],
          experience: userData.experience || [],
          education: userData.education || [],
          certifications: userData.certifications || [],
          projects: userData.projects || [],
          socialLinks: userData.socialLinks || {
            linkedin: "",
            github: "",
            portfolio: "",
          },
          availability: userData.availability || {
            status: "Available",
            type: "Full-time",
          },
        });
        setImagePreview(userData.profileImage || "");
      }
    } catch (error: any) {
      toast.error("Cloud synchronization failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setProfileData((prev: any) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setProfileData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image exceeds 5MB limit");
        return;
      }
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Document exceeds 10MB limit");
        return;
      }
      setResumeFile(file);

      try {
        setIsParsing(true);
        const formData = new FormData();
        formData.append("resume", file);
        const response = await axiosInstance.post("/api/ai/parse-cv", formData);

        if (response.data) {
          setPendingData(response.data);
          setShowSyncModal(true);
          toast.success("AI Analysis complete!", { icon: "🤖" });
        }
      } catch (error: any) {
        console.error("CV Parsing Error:", error);
        const msg = error.response?.data?.message || "AI synthesis failed";
        toast.error(`${msg}. File ready for manual sync.`);
      } finally {
        setIsParsing(false);
      }
    }
  };

  const handleAssetUpload = async (file: File, path: string) => {
    try {
      setUploadingAsset(path);
      const formData = new FormData();
      formData.append("file", file);
      const response = await axiosInstance.post(
        "/api/auth/upload-asset",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data.success) {
        const url = response.data.url;
        // path is like "projects.0.image"
        const [section, indexStr, field] = path.split(".");
        const index = parseInt(indexStr);

        setProfileData((prev: any) => {
          const newArray = [...prev[section]];
          newArray[index] = { ...newArray[index], [field]: url };
          return { ...prev, [section]: newArray };
        });
        toast.success("Asset uploaded successfully");
      }
    } catch (error: any) {
      toast.error(
        "Upload failed: " + (error.response?.data?.message || error.message),
      );
    } finally {
      setUploadingAsset(null);
    }
  };

  const handleApplyCardEdit = (
    section: string,
    index: number,
    data: any,
    shouldClose: boolean = false,
  ) => {
    setProfileData((prev: any) => {
      const newArray = [...prev[section]];
      newArray[index] = data;
      return { ...prev, [section]: newArray };
    });
    if (shouldClose) setEditingCard(null);
  };

  const applyAIData = () => {
    if (!pendingData) return;

    const ensureArray = (val: any) =>
      Array.isArray(val) ? val : val ? [val] : [];

    setProfileData((prev: any) => {
      // Merge skills carefully
      const existingSkills = prev.skills.map((s: any) =>
        typeof s === "string" ? s : s.name,
      );
      const newSkills = ensureArray(pendingData.skills).filter((s: any) => {
        const name = typeof s === "string" ? s : s.name;
        return !existingSkills.includes(name);
      });

      return {
        ...prev,
        fullname: pendingData.fullname || prev.fullname,
        position: pendingData.position || prev.position,
        headline: pendingData.headline || prev.headline || pendingData.position,
        phone: pendingData.phone || prev.phone,
        bio: pendingData.bio || prev.bio,
        location: pendingData.location || prev.location,
        skills: [...prev.skills, ...newSkills],
        languages:
          ensureArray(pendingData.languages).length > 0
            ? pendingData.languages
            : prev.languages,
        experience:
          ensureArray(pendingData.experience).length > 0
            ? pendingData.experience
            : prev.experience,
        education:
          ensureArray(pendingData.education).length > 0
            ? pendingData.education
            : prev.education,
        certifications:
          ensureArray(pendingData.certifications).length > 0
            ? pendingData.certifications
            : prev.certifications,
        projects:
          ensureArray(pendingData.projects).length > 0
            ? pendingData.projects
            : prev.projects,
        socialLinks: pendingData.socialLinks || prev.socialLinks,
        availability: pendingData.availability || prev.availability,
      };
    });

    setShowSyncModal(false);
    setPendingData(null);
    toast.success("Profile synchronized with AI intelligence!");
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("fullname", profileData.fullname);
      formData.append("position", profileData.position);
      formData.append("headline", profileData.headline);
      formData.append("phone", profileData.phone);
      formData.append("bio", profileData.bio);
      formData.append("location", profileData.location);

      formData.append("skills", JSON.stringify(profileData.skills));
      formData.append("languages", JSON.stringify(profileData.languages));
      formData.append("experience", JSON.stringify(profileData.experience));
      formData.append("education", JSON.stringify(profileData.education));
      formData.append(
        "certifications",
        JSON.stringify(profileData.certifications),
      );
      formData.append("projects", JSON.stringify(profileData.projects));
      formData.append("socialLinks", JSON.stringify(profileData.socialLinks));
      formData.append("availability", JSON.stringify(profileData.availability));

      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }
      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const response = await axiosInstance.patch(
        "/api/auth/edit/profile",
        formData,
      );
      if (response.data.success) {
        dispatch(updateUser(response.data.data));
        toast.success("Identity profile updated!");
        setEditing(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Update operation failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface gap-8">
        <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
        <div className="text-on-surface-variant font-black uppercase tracking-[0.3em] font-headline text-[9px] animate-pulse flex items-center gap-3">
          <CustomIcon name="refresh" size={14} className="animate-spin" />
          Syncing Profile Hub...
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["jobseeker"]}>
      
        <div className="max-w-[1400px] mx-auto space-y-8 pb-24">
          {/* Hero Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div className="space-y-3">
              <h1 className="text-3xl font-black text-on-surface tracking-tighter font-headline leading-none">
                Manage Profile.
              </h1>
              <p className="text-on-surface-variant text-sm font-bold max-w-xl">
                Architect your professional presence and synchronize your CV
                data with AI intelligence.
              </p>
            </div>

            <div className="flex items-center gap-4 w-full lg:w-auto">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="w-full lg:w-auto bg-primary text-on-primary px-8 py-3.5 rounded-full font-headline font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:-translate-y-1 transition-all group"
                >
                  <CustomIcon
                    name="edit"
                    size={18}
                    className="group-hover:rotate-12 transition-transform"
                  />
                  Modify Identity
                </button>
              ) : (
                <div className="flex gap-4 w-full lg:w-auto">
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 lg:flex-none px-8 py-3.5 bg-surface-container-high text-on-surface rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-error/10 hover:text-error transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex-1 lg:flex-none bg-emerald-600 text-white px-8 py-3.5 rounded-full font-headline font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:-translate-y-1 transition-all disabled:opacity-50"
                  >
                    <CustomIcon
                      name={saving ? "refresh" : "tick-circle"}
                      size={18}
                      className={saving ? "animate-spin" : ""}
                    />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar: Profile Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-surface-container-low rounded-4xl border border-outline-variant/10 p-8 text-center relative overflow-hidden group">
                <div className="relative inline-block mb-8">
                  <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-surface-container-lowest shadow-2xl shadow-primary/5 mx-auto group-hover:scale-105 transition-transform duration-700 bg-surface-container-highest flex items-center justify-center relative">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        fill
                        className="object-cover"
                        alt="Profile"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary flex items-center justify-center">
                        <span className="text-4xl font-black text-white uppercase tracking-tighter">
                          {profileData.fullname?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                  {editing && (
                    <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-on-primary rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-all shadow-xl shadow-primary/20">
                      <CustomIcon name="camera" size={18} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <h3 className="text-xl font-black text-on-surface font-headline tracking-tighter leading-none mb-3">
                  {profileData.fullname || "Undisclosed Identity"}
                </h3>
                <div className="flex flex-col gap-3 items-center">
                  <p className="font-black text-primary text-[9px] uppercase tracking-[0.2em] bg-primary/5 px-4 py-1.5 rounded-full inline-block">
                    {profileData.position || "Awaiting Placement"}
                  </p>
                  <div className="flex items-center gap-2 text-on-surface-variant/40 font-bold text-xs">
                    <CustomIcon name="location" size={14} />
                    {profileData.location || "Global/Remote"}
                  </div>
                </div>

                <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-bl from-primary/5 to-transparent blur-2xl"></div>
              </div>

              {/* CV Hub */}
              <div className="bg-surface-container-low rounded-4xl border border-outline-variant/10 p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black text-on-surface font-headline tracking-tighter">
                    Professional CV
                  </h3>
                  <CustomIcon
                    name="document-text"
                    size={20}
                    className="text-primary"
                  />
                </div>

                {isParsing && (
                  <div className="p-6 bg-primary/5 border border-primary/20 rounded-3xl flex flex-col gap-4 items-center text-center animate-pulse">
                    <CustomIcon
                      name="psychology"
                      size={32}
                      className="text-primary animate-spin"
                    />
                    <p className="text-primary font-black text-[10px] uppercase tracking-widest">
                      AI Intelligence Analyzing Documents...
                    </p>
                  </div>
                )}

                {profileData.resume || resumeFile ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 group cursor-default hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-error/5 text-error rounded-xl flex items-center justify-center group-hover:bg-error group-hover:text-white transition-all">
                          <CustomIcon name="document-filter" size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-on-surface truncate text-xs uppercase tracking-tight">
                            {resumeFile
                              ? resumeFile.name
                              : "Secured_CV_Data.pdf"}
                          </p>
                          <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">
                            Identity Record
                          </p>
                        </div>
                        {profileData.resume && (
                          <a
                            href={profileData.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-surface-container-high rounded-lg flex items-center justify-center hover:bg-on-surface hover:text-white transition-all"
                          >
                            <CustomIcon name="document-download" size={18} />
                          </a>
                        )}
                      </div>
                    </div>
                    {editing && (
                      <label className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-outline-variant/20 rounded-3xl cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition-all group">
                        <CustomIcon
                          name="document-upload"
                          size={32}
                          className="text-on-surface-variant/30 group-hover:text-primary transition-colors"
                        />
                        <div className="text-center">
                          <p className="text-on-surface font-black text-[10px] uppercase tracking-widest">
                            Replace CV Record
                          </p>
                          <p className="text-[10px] font-bold text-on-surface-variant/30 mt-1 uppercase">
                            Updates AI Synchronization
                          </p>
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleResumeUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    {editing ? (
                      <label className="flex flex-col items-center gap-6 p-12 border-4 border-dashed border-outline-variant/10 rounded-4xl cursor-pointer hover:bg-primary/5 hover:border-primary/20 transition-all group">
                        <div className="w-16 h-16 bg-surface-container-high rounded-3xl flex items-center justify-center group-hover:bg-white transition-all">
                          <CustomIcon
                            name="document-upload"
                            size={32}
                            className="text-on-surface-variant/20 group-hover:text-primary transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-on-surface font-black text-xs uppercase tracking-widest">
                            Deploy CV Asset
                          </p>
                          <p className="text-[9px] font-black text-on-surface-variant/30 uppercase tracking-[0.2em] leading-normal">
                            PDF or Word Format <br />
                            Max 10MB Threshold
                          </p>
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleResumeUpload}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="flex flex-col items-center py-10 opacity-20 grayscale">
                        <CustomIcon name="edit-2" size={48} />
                        <p className="font-black text-[10px] uppercase tracking-widest mt-6">
                          Record Not Found
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Main Content: Bento Sections */}
            <div className="lg:col-span-8 space-y-6">
              {/* Personal Intelligence section */}
              <div className="bg-surface-container-low rounded-4xl border border-outline-variant/5 p-8 space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                  <CustomIcon name="activity" size={120} />
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-1 h-8 bg-primary rounded-full"></div>
                  <h3 className="text-xl font-black text-on-surface font-headline tracking-tighter leading-none">
                    Core Identity.
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] ml-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      name="fullname"
                      value={profileData.fullname || ""}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full px-6 py-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-sm text-on-surface disabled:opacity-40 placeholder:text-on-surface-variant/20 h-12"
                      placeholder="Johnathan Visionary"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] ml-1">
                      Professional Headline
                    </label>
                    <input
                      type="text"
                      name="headline"
                      value={profileData.headline || ""}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full px-6 py-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-sm text-on-surface disabled:opacity-40 placeholder:text-on-surface-variant/20 h-12"
                      placeholder="Backend Engineer - Node.js & AI"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] ml-1">
                      Position
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={profileData.position || ""}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full px-6 py-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-sm text-on-surface disabled:opacity-40 placeholder:text-on-surface-variant/20 h-12"
                      placeholder="Senior Neural Architect"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] ml-1">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={profileData.location || ""}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full px-6 py-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-sm text-on-surface disabled:opacity-40 placeholder:text-on-surface-variant/20 h-12"
                      placeholder="Kigali, Rwanda"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] ml-1">
                      Communication Link
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone || ""}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full px-6 py-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-sm text-on-surface disabled:opacity-40 placeholder:text-on-surface-variant/20 h-12"
                      placeholder="+243 ..."
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] ml-1">
                      Availability Status
                    </label>
                    <select
                      name="availability.status"
                      value={profileData.availability?.status || "Available"}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full px-6 py-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-sm text-on-surface disabled:opacity-40 h-12"
                    >
                      <option value="Available">Available</option>
                      <option value="Open to Opportunities">
                        Open to Opportunities
                      </option>
                      <option value="Not Available">Not Available</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="block text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] ml-1">
                      Professional Narrative (Bio)
                    </label>
                    {editing ? (
                      <textarea
                        name="bio"
                        value={profileData.bio || ""}
                        onChange={handleInputChange}
                        rows={6}
                        className="w-full px-6 py-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-sm text-on-surface resize-none placeholder:text-on-surface-variant/20 min-h-[150px]"
                        placeholder="Describe your professional odyssey..."
                      />
                    ) : (
                      <div className="w-full px-6 py-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 font-bold text-sm text-on-surface/40 min-h-[100px] whitespace-pre-wrap leading-relaxed">
                        {profileData.bio || "No professional narrative provided."}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Presence */}
              <div className="bg-surface-container-low rounded-4xl border border-outline-variant/5 p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                  <h3 className="text-xl font-black text-on-surface font-headline tracking-tighter leading-none">
                    Digital Footprint.
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] ml-1">
                      LinkedIn
                    </label>
                    <input
                      type="text"
                      name="socialLinks.linkedin"
                      value={profileData.socialLinks?.linkedin || ""}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full px-6 py-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm text-on-surface h-12"
                      placeholder="linkedin.com/in/..."
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] ml-1">
                      GitHub
                    </label>
                    <input
                      type="text"
                      name="socialLinks.github"
                      value={profileData.socialLinks?.github || ""}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full px-6 py-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm text-on-surface h-12"
                      placeholder="github.com/..."
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] ml-1">
                      Portfolio
                    </label>
                    <input
                      type="text"
                      name="socialLinks.portfolio"
                      value={profileData.socialLinks?.portfolio || ""}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="w-full px-6 py-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm text-on-surface h-12"
                      placeholder="portfolio.com"
                    />
                  </div>
                </div>
              </div>

              {/* Skills Ecosystem */}
              <div className="bg-surface-container-low rounded-4xl border border-outline-variant/5 p-8 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-8 bg-emerald-500 rounded-full"></div>
                  <h3 className="text-xl font-black text-on-surface font-headline tracking-tighter leading-none">
                    Skill Forge.
                  </h3>
                </div>

                {editing && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const nameInput = form.querySelector(
                        '[name="name"]',
                      ) as HTMLInputElement;
                      const levelSelect = form.querySelector(
                        '[name="level"]',
                      ) as HTMLSelectElement;
                      const skillName = nameInput.value.trim();
                      const skillLevel = levelSelect.value;

                      if (
                        skillName &&
                        !profileData.skills.some(
                          (s: any) =>
                            (typeof s === "string" ? s : s.name) === skillName,
                        )
                      ) {
                        setProfileData((prev: any) => ({
                          ...prev,
                          skills: [
                            ...prev.skills,
                            { name: skillName, level: skillLevel },
                          ],
                        }));
                        nameInput.value = "";
                      }
                    }}
                    className="flex flex-col md:flex-row gap-3"
                  >
                    <input
                      name="name"
                      type="text"
                      placeholder="Skill name (e.g. Next.js)"
                      className="flex-1 px-6 py-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm text-on-surface h-12"
                    />
                    <select
                      name="level"
                      className="px-6 py-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm text-on-surface h-12 md:w-40"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                    <button
                      type="submit"
                      className="w-12 h-12 bg-primary text-on-primary rounded-xl hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center justify-center shrink-0"
                    >
                      <CustomIcon name="add-circle" size={24} />
                    </button>
                  </form>
                )}

                <div className="flex flex-wrap gap-4">
                  {profileData.skills.map((skill: any, index: number) => {
                    const name = typeof skill === "string" ? skill : skill.name;
                    const level =
                      typeof skill === "string" ? "Intermediate" : skill.level;
                    return (
                      <motion.div
                        key={index}
                        className="px-6 py-3 bg-surface-container-lowest border border-outline-variant/10 hover:border-primary/40 hover:bg-primary/5 rounded-[1.25rem] transition-all flex items-center gap-4 group/pill"
                      >
                        <div className="flex flex-col select-none flex-1 min-w-0">
                          <span className="font-black text-[11px] text-on-surface leading-tight truncate">
                            {name}
                          </span>
                          <span className="text-[9px] font-black text-primary/60 uppercase tracking-[0.1em]">
                            {level}
                          </span>
                        </div>
                        {editing && (
                          <button
                            onClick={() =>
                              setProfileData((prev: any) => ({
                                ...prev,
                                skills: prev.skills.filter(
                                  (s: any) =>
                                    (typeof s === "string" ? s : s.name) !==
                                    name,
                                ),
                              }))
                            }
                            className="w-6 h-6 hover:bg-error/10 hover:text-error rounded-full transition-colors flex items-center justify-center opacity-40 group-hover/pill:opacity-100"
                          >
                            <CustomIcon name="close-circle" size={14} />
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Languages */}
              <div className="bg-surface-container-low rounded-4xl border border-outline-variant/5 p-8 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-8 bg-purple-500 rounded-full"></div>
                  <h3 className="text-xl font-black text-on-surface font-headline tracking-tighter leading-none">
                    Linguistic Proficiency.
                  </h3>
                </div>
                {editing && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const nameInput = form.querySelector(
                        '[name="name"]',
                      ) as HTMLInputElement;
                      const profSelect = form.querySelector(
                        '[name="proficiency"]',
                      ) as HTMLSelectElement;
                      const name = nameInput.value.trim();
                      const proficiency = profSelect.value;
                      if (
                        name &&
                        !profileData.languages.some((l: any) => l.name === name)
                      ) {
                        setProfileData((prev: any) => ({
                          ...prev,
                          languages: [...prev.languages, { name, proficiency }],
                        }));
                        nameInput.value = "";
                      }
                    }}
                    className="flex flex-col md:flex-row gap-3"
                  >
                    <input
                      name="name"
                      type="text"
                      placeholder="Language (e.g. French, Kinyarwanda)"
                      className="flex-1 px-6 py-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm text-on-surface h-12"
                    />
                    <select
                      name="proficiency"
                      className="px-6 py-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm text-on-surface h-12 md:w-48"
                    >
                      <option value="Basic">Basic</option>
                      <option value="Conversational">Conversational</option>
                      <option value="Fluent">Fluent</option>
                      <option value="Native">Native</option>
                    </select>
                    <button
                      type="submit"
                      className="w-12 h-12 bg-primary text-on-primary rounded-xl hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center justify-center shrink-0"
                    >
                      <CustomIcon name="add-circle" size={24} />
                    </button>
                  </form>
                )}
                <div className="flex flex-wrap gap-4">
                  {profileData.languages.map((lang: any, index: number) => (
                    <div
                      key={index}
                      className="px-6 py-3 bg-surface-container-lowest border border-outline-variant/10 rounded-2xl flex items-center gap-4 group/pill"
                    >
                      <div className="flex flex-col">
                        <span className="font-black text-xs text-on-surface">
                          {lang.name}
                        </span>
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                          {lang.proficiency}
                        </span>
                      </div>
                      {editing && (
                        <button
                          onClick={() =>
                            setProfileData((prev: any) => ({
                              ...prev,
                              languages: prev.languages.filter(
                                (l: any) => l.name !== lang.name,
                              ),
                            }))
                          }
                          className="w-6 h-6 hover:bg-error/10 hover:text-error rounded-full transition-colors flex items-center justify-center opacity-40 group-hover/pill:opacity-100"
                        >
                          <CustomIcon name="close-circle" size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-surface-container-low rounded-4xl border border-outline-variant/5 p-8 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-8 bg-amber-500 rounded-full"></div>
                  <h3 className="text-xl font-black text-on-surface font-headline tracking-tighter leading-none">
                    Certifications.
                  </h3>
                </div>
                {editing && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const name = (
                        form.querySelector(
                          '[name="certName"]',
                        ) as HTMLInputElement
                      ).value.trim();
                      const issuer = (
                        form.querySelector(
                          '[name="issuer"]',
                        ) as HTMLInputElement
                      ).value.trim();
                      if (name && issuer) {
                        setProfileData((prev: any) => ({
                          ...prev,
                          certifications: [
                            ...prev.certifications,
                            { name, issuer, issueDate: "" },
                          ],
                        }));
                        form.reset();
                      }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3"
                  >
                    <input
                      name="certName"
                      type="text"
                      placeholder="Certificate Name"
                      className="px-6 py-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm text-on-surface h-12"
                    />
                    <div className="flex gap-3">
                      <input
                        name="issuer"
                        type="text"
                        placeholder="Issuer (e.g. Google, AWS)"
                        className="flex-1 px-6 py-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-sm text-on-surface h-12"
                      />
                      <button
                        type="submit"
                        className="w-12 h-12 bg-primary text-on-primary rounded-xl hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center justify-center shrink-0"
                      >
                        <CustomIcon name="add-circle" size={24} />
                      </button>
                    </div>
                  </form>
                )}
                <div className="space-y-4">
                  {profileData.certifications.map((cert: any, index: number) => {
                    const isEditing = editingCard === `certifications-${index}`;
                    return (
                      <div
                        key={index}
                        className={`p-6 bg-surface-container-lowest border rounded-[2rem] transition-all duration-500 ease-spring ${isEditing ? "border-primary shadow-2xl shadow-primary/10 ring-4 ring-primary/5" : "border-outline-variant/10 group"}`}
                      >
                        {isEditing ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">
                                  Certificate Name
                                </label>
                                <input
                                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/10 focus:border-primary/30 text-xs font-bold text-on-surface outline-none transition-all"
                                  defaultValue={cert.name}
                                  onBlur={(e) => {
                                    const newData = {
                                      ...cert,
                                      name: e.target.value,
                                    };
                                    handleApplyCardEdit(
                                      "certifications",
                                      index,
                                      newData,
                                    );
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-primary tracking-widest ml-1">
                                  Issuing Authority
                                </label>
                                <input
                                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/10 focus:border-primary/30 text-xs font-bold text-on-surface outline-none transition-all"
                                  defaultValue={cert.issuer}
                                  onBlur={(e) => {
                                    const newData = {
                                      ...cert,
                                      issuer: e.target.value,
                                    };
                                    handleApplyCardEdit(
                                      "certifications",
                                      index,
                                      newData,
                                    );
                                  }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center gap-3">
                                <label className="relative flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl cursor-pointer hover:bg-primary/20 transition-all border border-primary/20">
                                  <CustomIcon
                                    name={
                                      uploadingAsset ===
                                      `certifications.${index}.credentialUrl`
                                        ? "loading"
                                        : "cloud-upload"
                                    }
                                    size={18}
                                    className={
                                      uploadingAsset ===
                                      `certifications.${index}.credentialUrl`
                                        ? "animate-spin"
                                        : ""
                                    }
                                  />
                                  <span className="text-[10px] font-black uppercase tracking-widest">
                                    {cert.credentialUrl
                                      ? "Replace File"
                                      : "Upload Certificate"}
                                  </span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file)
                                        handleAssetUpload(
                                          file,
                                          `certifications.${index}.credentialUrl`,
                                        );
                                    }}
                                  />
                                </label>
                                {cert.credentialUrl && (
                                  <a
                                    href={cert.credentialUrl}
                                    target="_blank"
                                    className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                                    title="View Current File"
                                  >
                                    <CustomIcon name="eye" size={18} />
                                  </a>
                                )}
                              </div>
                              <button
                                onClick={() => setEditingCard(null)}
                                className="px-6 py-2 bg-primary text-on-primary rounded-xl font-black text-[10px] uppercase tracking-widest"
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center">
                                <CustomIcon name="award" size={24} />
                              </div>
                              <div>
                                <p className="font-black text-on-surface text-base">
                                  {cert.name}
                                </p>
                                <p className="text-[11px] font-black text-on-surface-variant/40 uppercase tracking-[0.1em]">
                                  {cert.issuer}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {cert.credentialUrl && (
                                <a
                                  href={cert.credentialUrl}
                                  target="_blank"
                                  className="w-10 h-10 flex items-center justify-center text-primary hover:bg-primary/10 rounded-full transition-all"
                                >
                                  <CustomIcon name="document" size={20} />
                                </a>
                              )}
                              {editing && (
                                <>
                                  <button
                                    onClick={() =>
                                      setEditingCard(`certifications-${index}`)
                                    }
                                    className="w-10 h-10 flex items-center justify-center text-on-surface-variant/40 hover:text-primary hover:bg-primary/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <CustomIcon name="edit" size={18} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setProfileData((prev: any) => ({
                                        ...prev,
                                        certifications:
                                          prev.certifications.filter(
                                            (_: any, i: number) => i !== index,
                                          ),
                                      }))
                                    }
                                    className="w-10 h-10 flex items-center justify-center text-error/40 hover:text-error hover:bg-error/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <CustomIcon name="trash" size={18} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Projects Showcase */}
              <div className="bg-surface-container-low rounded-4xl border border-outline-variant/5 p-8 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-8 bg-sky-500 rounded-full"></div>
                  <h3 className="text-xl font-black text-on-surface font-headline tracking-tighter leading-none">
                    Projects Portfolio.
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profileData.projects.map((proj: any, index: number) => {
                    const isEditing = editingCard === `projects-${index}`;
                    return (
                      <div
                        key={index}
                        className={`p-0 bg-surface-container-lowest border overflow-hidden rounded-[2.5rem] transition-all duration-500 ease-spring ${isEditing ? "border-sky-500 shadow-2xl shadow-sky-500/10 ring-4 ring-sky-500/5 grid-cols-1" : "border-outline-variant/10 hover:shadow-xl hover:shadow-sky-500/5 group"}`}
                      >
                        {isEditing ? (
                          <div className="p-8 space-y-6">
                            <div className="relative aspect-video bg-surface-container-high rounded-3xl overflow-hidden group/img">
                              {proj.image ? (
                                <img
                                  src={proj.image}
                                  alt="Project Preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/20">
                                  <CustomIcon name="image" size={48} />
                                  <p className="font-black text-[10px] uppercase tracking-widest mt-2">
                                    No Project Image
                                  </p>
                                </div>
                              )}
                              <label className="absolute inset-0 bg-on-surface/60 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center cursor-pointer backdrop-blur-sm">
                                <div className="flex flex-col items-center gap-2 text-surface">
                                  <CustomIcon
                                    name={
                                      uploadingAsset ===
                                      `projects.${index}.image`
                                        ? "loading"
                                        : "camera"
                                    }
                                    size={32}
                                    className={
                                      uploadingAsset ===
                                      `projects.${index}.image`
                                        ? "animate-spin"
                                        : ""
                                    }
                                  />
                                  <span className="font-black text-[10px] uppercase tracking-widest">
                                    Change Cover
                                  </span>
                                </div>
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file)
                                      handleAssetUpload(
                                        file,
                                        `projects.${index}.image`,
                                      );
                                  }}
                                />
                              </label>
                            </div>

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-sky-500 tracking-widest ml-1">
                                  Project Title
                                </label>
                                <input
                                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/10 focus:border-sky-500/30 text-xs font-bold text-on-surface outline-none transition-all"
                                  defaultValue={proj.name}
                                  onBlur={(e) => {
                                    handleApplyCardEdit("projects", index, {
                                      ...proj,
                                      name: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-sky-500 tracking-widest ml-1">
                                  Description
                                </label>
                                <textarea
                                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/10 focus:border-sky-500/30 text-xs font-bold text-on-surface outline-none transition-all resize-none h-24"
                                  defaultValue={proj.description}
                                  onBlur={(e) => {
                                    handleApplyCardEdit("projects", index, {
                                      ...proj,
                                      description: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase text-sky-500 tracking-widest ml-1">
                                    Demo Link
                                  </label>
                                  <input
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/10 focus:border-sky-500/30 text-xs font-bold text-on-surface outline-none transition-all"
                                    defaultValue={proj.link}
                                    placeholder="https://..."
                                    onBlur={(e) => {
                                      handleApplyCardEdit("projects", index, {
                                        ...proj,
                                        link: e.target.value,
                                      });
                                    }}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase text-sky-500 tracking-widest ml-1">
                                    Tech Tags (comma separated)
                                  </label>
                                  <input
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/10 focus:border-sky-500/30 text-xs font-bold text-on-surface outline-none transition-all"
                                    defaultValue={
                                      Array.isArray(proj.technologies)
                                        ? proj.technologies.join(", ")
                                        : ""
                                    }
                                    placeholder="React, Node, AI"
                                    onBlur={(e) => {
                                      handleApplyCardEdit("projects", index, {
                                        ...proj,
                                        technologies: e.target.value
                                          .split(",")
                                          .map((t) => t.trim())
                                          .filter((t) => t),
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => setEditingCard(null)}
                              className="w-full py-4 bg-sky-500 text-on-primary rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                              Save Project Changes
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col h-full">
                            {proj.image && (
                              <div className="aspect-video w-full relative">
                                <img
                                  src={proj.image}
                                  alt={proj.name}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent" />
                              </div>
                            )}
                            <div className="p-8 space-y-6 flex-1 flex flex-col">
                              <div className="flex justify-between items-start">
                                <div className="w-12 h-12 bg-sky-500/10 text-sky-500 rounded-2xl flex items-center justify-center shrink-0">
                                  <CustomIcon name="box" size={24} />
                                </div>
                                {editing && (
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() =>
                                        setEditingCard(`projects-${index}`)
                                      }
                                      className="p-2 text-sky-500 hover:bg-sky-500/10 rounded-xl transition-all"
                                    >
                                      <CustomIcon name="edit" size={20} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        setProfileData((prev: any) => ({
                                          ...prev,
                                          projects: prev.projects.filter(
                                            (_: any, i: number) => i !== index,
                                          ),
                                        }))
                                      }
                                      className="p-2 text-error/40 hover:text-error hover:bg-error/10 rounded-xl transition-all"
                                    >
                                      <CustomIcon name="trash" size={20} />
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-3 flex-1">
                                <h4 className="font-black text-on-surface text-xl leading-tight">
                                  {proj.name}
                                </h4>
                                <p className="text-xs font-bold text-on-surface-variant/50 leading-relaxed line-clamp-3">
                                  {proj.description}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-2 pt-4 border-t border-outline-variant/10">
                                {Array.isArray(proj.technologies) &&
                                  proj.technologies.map(
                                    (t: string, i: number) => (
                                      <span
                                        key={i}
                                        className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-surface-container-high text-on-surface-variant rounded-lg"
                                      >
                                        {t}
                                      </span>
                                    ),
                                  )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {editing && (
                    <button
                      onClick={() => {
                        const newIndex = profileData.projects.length;
                        setProfileData((prev: any) => ({
                          ...prev,
                          projects: [
                            ...prev.projects,
                            {
                              name: "New Project",
                              description: "Brief description of the impact...",
                              technologies: [],
                              link: "",
                            },
                          ],
                        }));
                        setTimeout(() => setEditingCard(`projects-${newIndex}`), 100);
                      }}
                      className="border-2 border-dashed border-outline-variant/10 rounded-[2.5rem] flex flex-col items-center justify-center p-12 hover:bg-sky-500/5 hover:border-sky-500/30 transition-all text-on-surface-variant/40 hover:text-sky-500 group min-h-[400px]"
                    >
                      <div className="w-16 h-16 bg-sky-500/5 text-sky-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <CustomIcon name="add-square" size={32} />
                      </div>
                      <span className="font-black text-[11px] uppercase tracking-[0.3em] mt-3">
                        Draft New Project
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Experience Section */}
              <div className="bg-surface-container-low rounded-4xl border border-outline-variant/5 p-8 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
                  <h3 className="text-xl font-black text-on-surface font-headline tracking-tighter leading-none">
                    Experience Timeline.
                  </h3>
                </div>
                <div className="space-y-6">
                  {profileData.experience.map((exp: any, index: number) => {
                    const isEditing = editingCard === `experience-${index}`;
                    return (
                      <div key={index} className="flex gap-6 relative">
                        <div className="hidden sm:flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center shrink-0 z-10 transition-all duration-500 ${isEditing ? "bg-indigo-500 text-white scale-110 shadow-xl shadow-indigo-500/20" : "bg-indigo-500/10 text-indigo-500 opacity-40 group-hover:opacity-100"}`}>
                            <CustomIcon name="briefcase" size={24} />
                          </div>
                          {index !== profileData.experience.length - 1 && (
                            <div className="w-0.5 h-full bg-outline-variant/10 -mt-2"></div>
                          )}
                        </div>
                        <div
                          className={`flex-1 p-8 rounded-[2.5rem] border transition-all duration-500 ease-spring ${isEditing ? "bg-surface-container-lowest border-indigo-500 shadow-2xl shadow-indigo-500/10 ring-4 ring-indigo-500/5" : "bg-surface-container-lowest border-outline-variant/10 group hover:border-indigo-500/30"}`}
                        >
                          {isEditing ? (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase text-indigo-500 tracking-widest ml-1">
                                    Role / Title
                                  </label>
                                  <input
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/10 focus:border-indigo-500/30 text-xs font-bold text-on-surface outline-none transition-all"
                                    defaultValue={exp.role || exp.title}
                                    onBlur={(e) => {
                                      handleApplyCardEdit("experience", index, {
                                        ...exp,
                                        role: e.target.value,
                                        title: e.target.value,
                                      });
                                    }}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase text-indigo-500 tracking-widest ml-1">
                                    Company
                                  </label>
                                  <input
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/10 focus:border-indigo-500/30 text-xs font-bold text-on-surface outline-none transition-all"
                                    defaultValue={exp.company}
                                    onBlur={(e) => {
                                      handleApplyCardEdit("experience", index, {
                                        ...exp,
                                        company: e.target.value,
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-indigo-500 tracking-widest ml-1">
                                  Description
                                </label>
                                <textarea
                                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/10 focus:border-indigo-500/30 text-xs font-bold text-on-surface outline-none transition-all resize-none h-32"
                                  defaultValue={exp.description}
                                  onBlur={(e) => {
                                    handleApplyCardEdit("experience", index, {
                                      ...exp,
                                      description: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="flex justify-end pt-2">
                                <button
                                  onClick={() => setEditingCard(null)}
                                  className="px-10 py-3 bg-indigo-500 text-on-primary rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20"
                                >
                                  Finalize Record
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                  <h4 className="font-black text-on-surface text-lg leading-none">
                                    {exp.role || exp.title}
                                  </h4>
                                  <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest mt-2 bg-indigo-500/5 px-3 py-1 rounded-full inline-block">
                                    {exp.company}
                                  </p>
                                </div>
                                <div className="text-[10px] font-black text-on-surface-variant/40 uppercase bg-surface-container-high px-5 py-2 rounded-full border border-outline-variant/10 shrink-0">
                                  {formatDate(exp.startDate)} -{" "}
                                  {exp.endDate
                                    ? formatDate(exp.endDate)
                                    : "Present"}
                                </div>
                              </div>
                              <p className="text-[13px] font-bold text-on-surface-variant/70 leading-relaxed max-w-2xl">
                                {exp.description}
                              </p>
                              {editing && (
                                <div className="pt-4 flex items-center justify-end gap-3 border-t border-outline-variant/5">
                                  <button
                                    onClick={() =>
                                      setEditingCard(`experience-${index}`)
                                    }
                                    className="w-10 h-10 flex items-center justify-center text-on-surface-variant/30 hover:text-indigo-500 hover:bg-indigo-500/5 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <CustomIcon name="edit" size={18} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setProfileData((prev: any) => ({
                                        ...prev,
                                        experience: prev.experience.filter(
                                          (_: any, i: number) => i !== index,
                                        ),
                                      }))
                                    }
                                    className="w-10 h-10 flex items-center justify-center text-error/30 hover:text-error hover:bg-error/5 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <CustomIcon name="trash" size={18} />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {editing && (
                    <button
                      onClick={() => {
                        const newIndex = profileData.experience.length;
                        setProfileData((prev: any) => ({
                          ...prev,
                          experience: [
                            ...prev.experience,
                            {
                              role: "New Professional Title",
                              company: "Enterprise Name",
                              startDate: new Date().toISOString().slice(0, 7),
                              description:
                                "Brief narrative of responsibilities...",
                            },
                          ],
                        }));
                        setTimeout(() => setEditingCard(`experience-${newIndex}`), 100);
                      }}
                      className="w-full border-2 border-dashed border-outline-variant/10 rounded-[2.5rem] py-10 flex flex-col items-center justify-center gap-4 text-on-surface-variant/30 hover:bg-indigo-500/5 hover:text-indigo-500 hover:border-indigo-500/40 transition-all group"
                    >
                      <div className="w-12 h-12 bg-indigo-500/5 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CustomIcon name="add-circle" size={28} />
                      </div>
                      <span className="font-black text-[11px] uppercase tracking-[0.3em]">
                        Append Experience Chronicle
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Education Section */}
              <div className="bg-surface-container-low rounded-4xl border border-outline-variant/5 p-8 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-8 bg-rose-500 rounded-full"></div>
                  <h3 className="text-xl font-black text-on-surface font-headline tracking-tighter leading-none">
                    Academic Records.
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profileData.education.map((edu: any, index: number) => {
                    const isEditing = editingCard === `education-${index}`;
                    return (
                      <div
                        key={index}
                        className={`p-6 bg-surface-container-lowest border rounded-[2rem] transition-all duration-500 ease-spring ${isEditing ? "border-rose-500 shadow-2xl shadow-rose-500/10 ring-4 ring-rose-500/5" : "border-outline-variant/10 group"}`}
                      >
                        {isEditing ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-rose-500 tracking-widest ml-1">
                                  Institution
                                </label>
                                <input
                                  className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/10 focus:border-rose-500/30 text-xs font-bold text-on-surface outline-none transition-all"
                                  defaultValue={edu.institution}
                                  onBlur={(e) => {
                                    handleApplyCardEdit("education", index, {
                                      ...edu,
                                      institution: e.target.value,
                                    });
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-rose-500 tracking-widest ml-1">
                                  Degree & Field
                                </label>
                                <div className="grid grid-cols-1 gap-2">
                                  <input
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/10 focus:border-rose-500/30 text-xs font-bold text-on-surface outline-none transition-all min-w-0"
                                    defaultValue={edu.degree}
                                    placeholder="Degree"
                                    onBlur={(e) => {
                                      handleApplyCardEdit("education", index, {
                                        ...edu,
                                        degree: e.target.value,
                                      });
                                    }}
                                  />
                                  <input
                                    className="w-full px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/10 focus:border-rose-500/30 text-xs font-bold text-on-surface outline-none transition-all min-w-0"
                                    defaultValue={edu.fieldOfStudy}
                                    placeholder="Field"
                                    onBlur={(e) => {
                                      handleApplyCardEdit("education", index, {
                                        ...edu,
                                        fieldOfStudy: e.target.value,
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center gap-3">
                                <label className="relative flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 rounded-xl cursor-pointer hover:bg-rose-500/20 transition-all border border-rose-500/20">
                                  <CustomIcon
                                    name={
                                      uploadingAsset ===
                                      `education.${index}.certificateUrl`
                                        ? "loading"
                                        : "document-upload"
                                    }
                                    size={18}
                                    className={
                                      uploadingAsset ===
                                      `education.${index}.certificateUrl`
                                        ? "animate-spin"
                                        : ""
                                    }
                                  />
                                  <span className="text-[10px] font-black uppercase tracking-widest">
                                    {edu.certificateUrl
                                      ? "Update Diploma"
                                      : "Upload Diploma"}
                                  </span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file)
                                        handleAssetUpload(
                                          file,
                                          `education.${index}.certificateUrl`,
                                        );
                                    }}
                                  />
                                </label>
                                {edu.certificateUrl && (
                                  <a
                                    href={edu.certificateUrl}
                                    target="_blank"
                                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                  >
                                    <CustomIcon name="eye" size={18} />
                                  </a>
                                )}
                              </div>
                              <button
                                onClick={() => setEditingCard(null)}
                                className="px-6 py-2 bg-rose-500 text-on-primary rounded-xl font-black text-[10px] uppercase tracking-widest"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                        <>
                          <div className="flex justify-between items-start">
                            <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center shrink-0 border border-rose-500/10 shadow-sm">
                              <CustomIcon name="teacher" size={28} />
                            </div>
                            {editing && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    setEditingCard(`education-${index}`)
                                  }
                                  className="w-10 h-10 flex items-center justify-center text-on-surface-variant/40 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <CustomIcon name="edit" size={18} />
                                </button>
                                <button
                                  onClick={() =>
                                    setProfileData((prev: any) => ({
                                      ...prev,
                                      education: prev.education.filter(
                                        (_: any, i: number) => i !== index,
                                      ),
                                    }))
                                  }
                                  className="w-10 h-10 flex items-center justify-center text-error/40 hover:text-error hover:bg-error/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <CustomIcon name="trash" size={18} />
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-black text-on-surface text-base leading-tight">
                              {edu.degree} in {edu.fieldOfStudy}
                            </h4>
                            <p className="text-[11px] font-black text-on-surface-variant/40 uppercase tracking-widest">
                              {edu.institution}
                            </p>
                            <div className="flex items-center gap-3 pt-1">
                              <span className="text-[9px] font-black text-rose-500 uppercase bg-rose-500/5 px-3 py-1 rounded-full">
                                Class of {edu.graduationYear || edu.endYear}
                              </span>
                              {edu.certificateUrl && (
                                <a
                                  href={edu.certificateUrl}
                                  target="_blank"
                                  className="text-primary hover:underline text-[9px] font-black uppercase tracking-widest flex items-center gap-1"
                                >
                                  <CustomIcon name="tick-circle" size={10} />
                                  Verified Diploma
                                </a>
                              )}
                            </div>
                          </div>
                        </>
                        )}
                      </div>
                    );
                  })}
                  {editing && (
                    <button
                      onClick={() => {
                        const newIdx = profileData.education.length;
                        setProfileData((prev: any) => ({
                          ...prev,
                          education: [
                            ...prev.education,
                            {
                              institution: "University Name",
                              degree: "Degree",
                              fieldOfStudy: "Field of Study",
                              graduationYear: new Date().getFullYear(),
                            },
                          ],
                        }));
                        setTimeout(() => setEditingCard(`education-${newIdx}`), 100);
                      }}
                      className="border-2 border-dashed border-outline-variant/10 rounded-[2rem] flex flex-col items-center justify-center p-8 hover:bg-rose-500/5 hover:border-rose-500/30 transition-all text-on-surface-variant/40 hover:text-rose-500 group"
                    >
                      <div className="w-12 h-12 bg-rose-500/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <CustomIcon name="add-circle" size={24} />
                      </div>
                      <span className="font-black text-[10px] uppercase tracking-[0.2em]">
                        Add Academic Record
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      

      {/* AI Sync Modal - outside DashboardLayout so z-[9999] works correctly */}
      <AnimatePresence>
        {showSyncModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSyncModal(false)}
              className="absolute inset-0 bg-surface/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-surface-container-low rounded-[2.5rem] border border-outline-variant/10 shadow-3xl overflow-hidden p-8 sm:p-12 space-y-8"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center animate-pulse">
                  <CustomIcon
                    name="psychology"
                    size={40}
                    className="text-primary"
                  />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-on-surface tracking-tighter font-headline">
                    AI INSIGHTS READY.
                  </h2>
                  <p className="text-on-surface-variant text-sm font-bold leading-relaxed px-4">
                    Our intelligence has successfully analyzed your document.
                    Would you like to synchronize your identity fields
                    automatically?
                  </p>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/10 space-y-4">
                <div className="flex items-center justify-between border-b border-outline-variant/5 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">
                    Entities Identified
                  </span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-primary uppercase tracking-tighter">
                      Fullname
                    </p>
                    <p className="text-xs font-bold text-on-surface truncate">
                      {pendingData?.fullname || "Not detected"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-primary uppercase tracking-tighter">
                      Position
                    </p>
                    <p className="text-xs font-bold text-on-surface truncate">
                      {pendingData?.position || "Not detected"}
                    </p>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <p className="text-[9px] font-black text-primary uppercase tracking-tighter">
                      Bio
                    </p>
                    <p className="text-xs font-bold text-on-surface line-clamp-2">
                      {pendingData?.bio || "Not detected"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-primary uppercase tracking-tighter">
                      Skills Captured
                    </p>
                    <p className="text-xs font-bold text-on-surface">
                      {pendingData?.skills?.length || 0} items
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-primary uppercase tracking-tighter">
                      Experience
                    </p>
                    <p className="text-xs font-bold text-on-surface">
                      {pendingData?.experience?.length || 0} records
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-primary uppercase tracking-tighter">
                      Languages
                    </p>
                    <p className="text-xs font-bold text-on-surface">
                      {pendingData?.languages?.length || 0} items
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-primary uppercase tracking-tighter">
                      Projects
                    </p>
                    <p className="text-xs font-bold text-on-surface">
                      {pendingData?.projects?.length || 0} items
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-primary uppercase tracking-tighter">
                      Certifications
                    </p>
                    <p className="text-xs font-bold text-on-surface">
                      {pendingData?.certifications?.length || 0} items
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="px-6 py-4 bg-surface-container-highest text-on-surface rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-on-surface/5 transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={applyAIData}
                  className="px-6 py-4 bg-primary text-on-primary rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all"
                >
                  <CustomIcon name="tick-circle" size={18} />
                  Sync Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ProtectedRoute>
  );
};

export default UserProfilePage;

