import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import AuthModal from "./AuthModal";
import { LogIn, LogOut, User as UserIcon, Edit2, Loader2 } from "lucide-react";
import { supabase } from "../utils/supabase";
import { toast } from "sonner";


export default function AuthButton({ user, showAuthModal, setShowAuthModal }) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Default avatar taken from the user's email using DiceBear initials API, overridden by uploaded avatar_url if present
  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    (user?.email
      ? `https://api.dicebear.com/9.x/initials/svg?seed=${user.email}`
      : null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large (max 5MB)");
      return;
    }

    setIsUploading(true);
    toast.loading("Uploading avatar...", { id: "avatar-upload" });

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      // Update User Metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) {
        throw updateError;
      }

      toast.success("Avatar updated!", { id: "avatar-upload" });
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error(error.message || "Failed to update avatar", { id: "avatar-upload" });
    } finally {
      setIsUploading(false);
    }
  };


  const handleSignOut = () => {
    signOut().then(() => {
      if (location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/links")) {
        navigate("/");
      }
    });
  };

  if (user) {
    return (
      <div className="flex items-center gap-3 relative">

        {/* Avatar Container */}
        <div className="relative group w-9 h-9 rounded-full overflow-hidden border border-black/10 dark:border-white/20 bg-gray-100 dark:bg-white/10 flex items-center justify-center shadow-sm">
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
          ) : avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <UserIcon className="w-4 h-4 text-gray-500" />
          )}

          {/* Edit overlay */}
          {!isUploading && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none"
              title="Edit Avatar"
            >
              <Edit2 className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          className="hidden"
          accept="image/*"
          disabled={isUploading}
        />

        <button
          onClick={handleSignOut}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-black dark:text-white text-xs font-semibold border border-black/10 dark:border-white/10 cursor-pointer disabled:opacity-50 transition-all shadow-sm"
          disabled={isUploading}
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowAuthModal(true)}
        className="inline-flex items-center gap-2 h-9 pl-4 pr-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:bg-[#1a1a1a] dark:hover:bg-gray-100 transition-all cursor-pointer shadow-sm"
      >
        Sign In
        <span className="grid h-6 w-6 place-items-center rounded-full bg-white/15 dark:bg-black/15">
          <LogIn className="w-3.5 h-3.5" />
        </span>
      </button>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
