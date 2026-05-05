import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Edit2, Save, X, Camera, Settings, LogOut } from 'lucide-react';
import AuthService from '../services/AuthService';
import ChatService from '../services/ChatService';

const UserProfile = ({ currentUser, onProfileUpdate, onLogout }) => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [currentUser]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await ChatService.getUserProfile(currentUser?.username);
      setProfile(userProfile);
      setEditForm({
        displayName: userProfile.displayName,
        bio: userProfile.bio || '',
        status: userProfile.status || 'Available',
        avatarUrl: userProfile.avatarUrl || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setError('');
  };

  const handleCancel = () => {
    setEditing(false);
    setEditForm({
      displayName: profile.displayName,
      bio: profile.bio || '',
      status: profile.status || 'Available',
      avatarUrl: profile.avatarUrl || ''
    });
    setError('');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      
      const updatedProfile = await ChatService.updateMyProfile(editForm);
      setProfile(updatedProfile);
      setEditing(false);
      onProfileUpdate?.(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    onLogout?.();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  };

  const statusOptions = [
    { value: 'Available', color: 'green' },
    { value: 'Busy', color: 'red' },
    { value: 'Away', color: 'yellow' },
    { value: 'Invisible', color: 'gray' }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center text-gray-500">
        <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>Profile not available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Settings className="w-5 h-5" />
            </button>
            {!editing && (
              <button
                onClick={handleEdit}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Avatar and Basic Info */}
        <div className="flex items-start space-x-6 mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
              {editForm.avatarUrl ? (
                <img src={editForm.avatarUrl} alt={editForm.displayName} className="w-24 h-24 rounded-full" />
              ) : (
                <span className="text-gray-600 text-2xl font-bold">
                  {editForm.displayName?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {editing && (
              <button className="absolute bottom-0 right-0 p-1 bg-primary-600 text-white rounded-full hover:bg-primary-700">
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{profile.displayName}</h3>
                <p className="text-gray-600">@{profile.username}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    profile.status === 'Available' ? 'bg-green-100 text-green-800' :
                    profile.status === 'Busy' ? 'bg-red-100 text-red-800' :
                    profile.status === 'Away' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {profile.status}
                  </span>
                  {profile.isOnline && (
                    <span className="text-xs text-green-600">Online</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Bio</h4>
          {editing ? (
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
              rows={3}
            />
          ) : (
            <p className="text-gray-600">
              {profile.bio || 'No bio added yet'}
            </p>
          )}
        </div>

        {/* Avatar URL */}
        {editing && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
            <input
              type="url"
              value={editForm.avatarUrl}
              onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{profile.isOnline ? 'Online' : 'Offline'}</p>
            <p className="text-xs text-gray-500">Status</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {profile.createdAt ? new Date().getFullYear() - new Date(profile.createdAt).getFullYear() : '0'}
            </p>
            <p className="text-xs text-gray-500">Years Active</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {profile.lastSeen ? 'Recently' : 'Never'}
            </p>
            <p className="text-xs text-gray-500">Last Seen</p>
          </div>
        </div>

        {/* Join Date */}
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>Joined {formatDate(profile.createdAt)}</span>
        </div>

        {/* Action Buttons */}
        {editing && (
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 flex items-center justify-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Settings Dropdown */}
      {showSettings && (
        <div className="absolute top-16 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
