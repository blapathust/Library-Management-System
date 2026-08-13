import { useState, useEffect } from 'react';
import UserNavbar from '../../components/UserNavbar';
import { User } from '../../data/users';
import userService from '../../services/userService';
import authService from '../../services/authService';

export default function UserProfile() {
    // State for user profile data
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Edit mode states
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedEmail, setEditedEmail] = useState('');
    
    // Password change states
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Load profile data on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const userId = authService.getCurrentUserId();
                const userData = await userService.getUserById(userId);
                
                if (userData) {
                    setProfile(userData);
                    setEditedName(userData.name || '');
                    setEditedEmail(userData.email || '');
                }
                
                setError(null);
            } catch (err) {
                console.error('Error fetching profile data:', err);
                setError('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };
        
        fetchProfile();
    }, []);
    
    // Handle profile edit save
    const handleSaveProfile = async () => {
        try {
            if (!profile) return;
            
            // Validate inputs
            if (!editedName.trim() || !editedEmail.trim()) {
                alert('Name and email are required');
                return;
            }
            
            // Update profile
            const updatedProfile = await userService.updateUser(profile.id, {
                userName: profile.userName,
                roleName: profile.roleName,
                name: editedName,
                email: editedEmail
            });
            
            setProfile(updatedProfile);
            setIsEditingProfile(false);
            alert('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    };
    
    // Handle password change
    const handleChangePassword = async () => {
        try {
            if (!profile) return;
            
            // Validate passwords
            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('All password fields are required');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('New passwords do not match');
                return;
            }
            
            if (newPassword.length < 8) {
                alert('New password must be at least 8 characters long');
                return;
            }
            
            // Change password
            await userService.updatePassword(profile.id, newPassword);
            
            // Reset form
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsChangingPassword(false);
            
            alert('Password changed successfully');
        } catch (error) {
            console.error('Error changing password:', error);
            alert('Failed to change password. Please check your current password and try again.');
        }
    };
    
    // Cancel editing profile
    const handleCancelEdit = () => {
        if (!profile) return;
        
        setEditedName(profile.name);
        setEditedEmail(profile.email);
        setIsEditingProfile(false);
    };
    
    // Cancel changing password
    const handleCancelPasswordChange = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsChangingPassword(false);
    };
    
    // Show loading indicator while data is being fetched
    if (loading) {
        return (
            <>
                <UserNavbar selected="profile" />
                <div className="min-h-screen bg-blue-50 p-6">
                    <div className="text-center py-10">
                        <p className="text-blue-600">Loading profile data...</p>
                    </div>
                </div>
            </>
        );
    }
    
    // Show error message if there was a problem
    if (error || !profile) {
        return (
            <>
                <UserNavbar selected="profile" />
                <div className="min-h-screen bg-blue-50 p-6">
                    <div className="text-center py-10">
                        <p className="text-red-600">{error || 'Profile not found'}</p>
                        <button 
                            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </>
        );
    }
    
    return (
        <>
            <title>My Profile</title>
            <UserNavbar selected="profile" />
            
            <div className="min-h-screen bg-blue-50 p-6">
                {/* Page header */}
                <h2 className="text-2xl font-semibold text-blue-700 mb-4">My Profile</h2>
                <p className="text-gray-700 mb-6">
                    View and edit your profile information.
                </p>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile information section */}
                    <div className="lg:col-span-2 bg-white shadow-md rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-blue-700">Profile Information</h3>
                            {!isEditingProfile && (
                                <button 
                                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                    onClick={() => setIsEditingProfile(true)}
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                        
                        {isEditingProfile ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        value={editedName}
                                        onChange={(e) => setEditedName(e.target.value)}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        value={editedEmail}
                                        onChange={(e) => setEditedEmail(e.target.value)}
                                    />
                                </div>
                                
                                <div className="flex space-x-3">
                                    <button 
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                        onClick={handleSaveProfile}
                                    >
                                        Save Changes
                                    </button>
                                    <button 
                                        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                                        onClick={handleCancelEdit}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="border-b pb-3">
                                    <p className="text-sm text-gray-600">Username</p>
                                    <p className="font-medium text-gray-900">{profile.userName}</p>
                                </div>
                                
                                <div className="border-b pb-3">
                                    <p className="text-sm text-gray-600">Full Name</p>
                                    <p className="font-medium text-gray-900">{profile.name}</p>
                                </div>
                                
                                <div className="border-b pb-3">
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-medium text-gray-900">{profile.email}</p>
                                </div>
                                
                                <div>
                                    <p className="text-sm text-gray-600">Member Since</p>
                                    <p className="font-medium text-gray-900">
                                        {new Date(profile.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Password change section */}
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-700 mb-4">Change Password</h3>
                        
                        {isChangingPassword ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                                
                                <div className="flex space-x-3">
                                    <button 
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                        onClick={handleChangePassword}
                                    >
                                        Update Password
                                    </button>
                                    <button 
                                        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                                        onClick={handleCancelPasswordChange}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-gray-600 mb-4">
                                    Your password should be at least 8 characters long and include a mix of letters, numbers, and special characters.
                                </p>
                                <button 
                                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    onClick={() => setIsChangingPassword(true)}
                                >
                                    Change Password
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
