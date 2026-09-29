import os

filepath = 'frontend/src/pages/survivor/Profile.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Add ImageError handling to the displayAvatar
target_display_avatar = "const displayAvatar = profilePic || '/user.jpeg';"
replacement_display_avatar = """
  const displayAvatar = profilePic || '/user.jpeg';
  const [imageError, setImageError] = useState(false);
  const handleImageError = () => {
    setImageError(true);
    setProfilePic(null);
  };
"""
content = content.replace(target_display_avatar, replacement_display_avatar)

content = content.replace(
    '<img src={displayAvatar} alt="Profile" className="w-full h-full object-cover" />',
    '<img src={imageError ? "/user.jpeg" : displayAvatar} alt="Profile" className="w-full h-full object-cover" onError={handleImageError} />'
)

content = content.replace(
    '<img src={profilePic} alt="Avatar" className="w-full h-full object-cover" />',
    '<img src={imageError ? "/user.jpeg" : profilePic} alt="Avatar" className="w-full h-full object-cover" onError={handleImageError} />'
)

target_camera_button = """                            <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 shadow-sm hover:text-[#2c757c] transition-colors">
                              <Camera className="w-4 h-4" />
                            </button>"""

replacement_camera_button = """                            <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 shadow-sm hover:text-[#2c757c] transition-colors">
                              <Camera className="w-4 h-4" />
                            </button>
                            {profilePic && (
                               <button onClick={() => { setProfilePic(null); setImageError(false); }} className="absolute top-0 right-0 w-6 h-6 bg-red-100 border border-red-200 rounded-full flex items-center justify-center text-red-600 shadow-sm hover:bg-red-200 transition-colors" title="Remove Picture">
                                 <X className="w-3 h-3" />
                               </button>
                            )}"""
content = content.replace(target_camera_button, replacement_camera_button)

target_states = """  const [profilePic, setProfilePic] = useState<string | null>(user?.profile_picture_url || null);
  const [caseInfo, setCaseInfo] = useState<{ id?: number, professional_name?: string }>({});"""

replacement_states = """  const [profilePic, setProfilePic] = useState<string | null>(user?.profile_picture_url || null);
  const [caseInfo, setCaseInfo] = useState<{ id?: number, professional_name?: string }>({});
  const [originalProfile, setOriginalProfile] = useState<any>({});
  
  const hasChanges = fullName !== originalProfile.full_name ||
                     nickname !== originalProfile.nickname ||
                     phone !== originalProfile.phone ||
                     preferredLanguage !== originalProfile.preferred_language ||
                     voiceLanguage !== originalProfile.voice_language ||
                     profilePic !== originalProfile.profile_picture_url;
"""
content = content.replace(target_states, replacement_states)

target_fetch = """          setVoiceLanguage(p.voice_language === 'en' ? 'English' : p.voice_language || 'English');
          setProfilePic(p.profile_picture_url || null);
        }"""

replacement_fetch = """          setVoiceLanguage(p.voice_language === 'en' ? 'English' : p.voice_language || 'English');
          setProfilePic(p.profile_picture_url || null);
          setOriginalProfile({
             full_name: p.full_name || '',
             nickname: p.nickname || '',
             phone: p.phone || '',
             preferred_language: p.preferred_language === 'en' ? 'English' : p.preferred_language || 'English',
             voice_language: p.voice_language === 'en' ? 'English' : p.voice_language || 'English',
             profile_picture_url: p.profile_picture_url || null
          });
        }"""
content = content.replace(target_fetch, replacement_fetch)

target_save = """      setSaveStatus('success');
      setIsEditing(false);"""

replacement_save = """      setSaveStatus('success');
      setOriginalProfile({
          full_name: fullName,
          nickname: nickname,
          phone: phone,
          preferred_language: preferredLanguage,
          voice_language: voiceLanguage,
          profile_picture_url: profilePic
      });
      setIsEditing(false);"""
content = content.replace(target_save, replacement_save)

target_cancel = """    // Reset from context
    setFullName(user?.full_name || '');
    setNickname(user?.nickname || '');
    setProfilePic(user?.profile_picture_url || null);
    // Real app would re-fetch to restore phone/language perfectly, but this works for demo"""

replacement_cancel = """    // Reset from originalProfile
    setFullName(originalProfile.full_name || '');
    setNickname(originalProfile.nickname || '');
    setPhone(originalProfile.phone || '');
    setPreferredLanguage(originalProfile.preferred_language || 'English');
    setVoiceLanguage(originalProfile.voice_language || 'English');
    setProfilePic(originalProfile.profile_picture_url || null);
    setImageError(false);"""
content = content.replace(target_cancel, replacement_cancel)

target_button = """                      <Button onClick={saveChanges} disabled={isSaving} className="bg-[#2c757c] hover:bg-[#1f595e] text-white min-w-[140px]">
                        {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                      </Button>"""

replacement_button = """                      <Button onClick={saveChanges} disabled={isSaving || !hasChanges} className={`text-white min-w-[140px] ${!hasChanges ? 'bg-slate-300 hover:bg-slate-300 cursor-not-allowed' : 'bg-[#2c757c] hover:bg-[#1f595e]'}`}>
                        {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : !hasChanges ? 'No Changes' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                      </Button>"""
content = content.replace(target_button, replacement_button)


with open(filepath, 'w') as f:
    f.write(content)
