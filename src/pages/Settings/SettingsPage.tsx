// src/pages/Settings/SettingsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Moon, Sun, Lock, Bell, LogOut } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [activeTab, setActiveTab] = useState('notifications');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
  });
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load notification preferences on mount
  useEffect(() => {
    const loadNotificationPreferences = async () => {
      try {
        const saved = localStorage.getItem('notificationPrefs');
        if (saved) {
          setNotificationPrefs(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
      }
    };
    loadNotificationPreferences();
  }, []);

  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    applyTheme(newIsDark);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!passwordForm.currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Current password is required' });
      return;
    }
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setPasswordLoading(true);
    try {
      // Call your password change endpoint here
      // For now, show success message
      setPasswordMessage({ type: 'success', text: 'Password changed successfully' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setPasswordMessage({ type: 'error', text: error?.message || 'Failed to change password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSaveNotificationPreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotificationLoading(true);
    setNotificationMessage(null);
    try {
      // Save to localStorage
      localStorage.setItem('notificationPrefs', JSON.stringify(notificationPrefs));
      
      // TODO: Call your API endpoint to save preferences to backend
      // await updateNotificationPreferences(notificationPrefs);
      
      setNotificationMessage({ type: 'success', text: 'Notification preferences saved successfully' });
      setTimeout(() => setNotificationMessage(null), 3000);
    } catch (error: any) {
      setNotificationMessage({ type: 'error', text: error?.message || 'Failed to save preferences' });
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-card border-b border-border dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackClick}
              className="dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your account preferences and security
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4 hidden sm:block" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4 hidden sm:block" />
              <span>Password</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Sun className="h-4 w-4 hidden sm:block" />
              <span>Appearance</span>
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to receive updates and notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {notificationMessage && (
                  <div
                    className={`p-3 rounded-lg ${
                      notificationMessage.type === 'success'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                    }`}
                  >
                    {notificationMessage.text}
                  </div>
                )}

                <form onSubmit={handleSaveNotificationPreferences} className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border dark:border-gray-700">
                    <div>
                      <p className="font-medium text-foreground">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive important updates via email</p>
                    </div>
                    <Switch
                      checked={notificationPrefs.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs({ ...notificationPrefs, emailNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-border dark:border-gray-700">
                    <div>
                      <p className="font-medium text-foreground">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Get real-time alerts on your device</p>
                    </div>
                    <Switch
                      checked={notificationPrefs.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs({ ...notificationPrefs, pushNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-border dark:border-gray-700">
                    <div>
                      <p className="font-medium text-foreground">Weekly Digest</p>
                      <p className="text-sm text-muted-foreground">Receive a weekly summary of your activity</p>
                    </div>
                    <Switch
                      checked={notificationPrefs.weeklyDigest}
                      onCheckedChange={(checked) =>
                        setNotificationPrefs({ ...notificationPrefs, weeklyDigest: checked })
                      }
                    />
                  </div>

                  <Button type="submit" disabled={notificationLoading} className="w-full mt-4">
                    {notificationLoading ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {passwordMessage && (
                    <div
                      className={`p-3 rounded-lg ${
                        passwordMessage.type === 'success'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {passwordMessage.text}
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Current Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter your current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      New Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Enter your new password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Confirm Password
                    </label>
                    <Input
                      type="password"
                      placeholder="Confirm your new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      required
                    />
                  </div>

                  <Button type="submit" disabled={passwordLoading} className="w-full">
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how the application looks for you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    {isDark ? (
                      <Moon className="h-5 w-5 text-foreground" />
                    ) : (
                      <Sun className="h-5 w-5 text-foreground" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">Theme</p>
                      <p className="text-sm text-muted-foreground">
                        {isDark ? 'Dark mode' : 'Light mode'} is currently enabled
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={toggleTheme}
                    className="gap-2"
                  >
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {isDark ? 'Light' : 'Dark'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Logout Section */}
        <Card className="mt-8 border-red-200 dark:border-red-900/50">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Logout</CardTitle>
            <CardDescription>
              Sign out of your account on this device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="w-full gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
