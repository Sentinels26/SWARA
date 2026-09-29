import os
import glob

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Replace the greeting
    # from: Good morning, {user?.full_name?.split(' ')[0] || 'Aisha'}
    # to: Good morning, {user?.nickname || user?.full_name?.split(' ')[0] || 'Aisha'}
    content = content.replace(
        "{user?.full_name?.split(' ')[0] || 'Aisha'}", 
        "{user?.nickname || user?.full_name?.split(' ')[0] || 'Aisha'}"
    )

    # Avatar initials
    # from: {user?.full_name ? user.full_name[0].toUpperCase() : 'A'}
    # to: {user?.profile_picture_url ? <img src={user.profile_picture_url} className="w-full h-full object-cover"/> : (user?.nickname?.[0] || user?.full_name?.[0] || 'A').toUpperCase()}
    
    content = content.replace(
        "{user?.full_name ? user.full_name[0].toUpperCase() : 'A'}",
        "{user?.profile_picture_url ? <img src={user.profile_picture_url} className=\"w-full h-full object-cover\"/> : (user?.nickname?.[0] || user?.full_name?.[0] || 'A').toUpperCase()}"
    )

    with open(filepath, 'w') as f:
        f.write(content)

for filepath in glob.glob('frontend/src/pages/survivor/*.tsx'):
    patch_file(filepath)
