import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Bell, Lock, Shield, Trash2, Globe, Activity } from 'lucide-react'
import PageTransition from '@/components/PageTransition'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    pushNotifications: false,
    reportStatus: true,
    communityAlerts: true,
  })

  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    shareLocation: false,
  })

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-background/80 backdrop-blur-md p-6 rounded-2xl border border-border shadow-sm sticky top-0 z-30"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
            <p className="text-muted-foreground mt-1 font-medium">
              Manage your preferences and security
            </p>
          </div>
          <Button className="rounded-xl shadow-lg shadow-primary/20">Save Changes</Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Settings Nav (Sidebar) */}
          <div className="md:col-span-1 space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md">
              <Bell size={18} /> Notifications
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent text-foreground transition-colors font-medium">
              <Shield size={18} /> Privacy
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent text-foreground transition-colors font-medium">
              <Lock size={18} /> Security
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent text-red-500 hover:bg-red-500/10 transition-colors font-medium">
              <Trash2 size={18} /> Danger Zone
            </button>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-3 space-y-6">
            <Card className="border-border shadow-sm overflow-hidden">
              <CardHeader className="bg-accent/30 border-b border-border">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Bell className="text-primary" /> Notification Preferences
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose how you want to be notified.
                </p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Email Updates</h4>
                    <p className="text-xs text-muted-foreground">
                      Receive weekly community updates
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      aria-label="Email updates"
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications.emailUpdates}
                      onChange={(e) =>
                        setNotifications((prev) => ({ ...prev, emailUpdates: e.target.checked }))
                      }
                    />
                    <div className="w-11 h-6 bg-accent peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-border/50"></div>
                  </label>
                </div>
                <div className="h-px bg-border/50" />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Push Notifications</h4>
                    <p className="text-xs text-muted-foreground">
                      Get notified immediately on your device
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      aria-label="Push notifications"
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications.pushNotifications}
                      onChange={(e) =>
                        setNotifications((prev) => ({
                          ...prev,
                          pushNotifications: e.target.checked,
                        }))
                      }
                    />
                    <div className="w-11 h-6 bg-accent peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-border/50"></div>
                  </label>
                </div>
                <div className="h-px bg-border/50" />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Report Status Alerts</h4>
                    <p className="text-xs text-muted-foreground">Updates on issues you reported</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      aria-label="Report status alerts"
                      type="checkbox"
                      className="sr-only peer"
                      checked={notifications.reportStatus}
                      onChange={(e) =>
                        setNotifications((prev) => ({ ...prev, reportStatus: e.target.checked }))
                      }
                    />
                    <div className="w-11 h-6 bg-accent peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-border/50"></div>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm overflow-hidden">
              <CardHeader className="bg-accent/30 border-b border-border">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Shield className="text-primary" /> Privacy
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your data and visibility.
                </p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <div className="mt-1 text-muted-foreground">
                      <Globe size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Public Profile</h4>
                      <p className="text-xs text-muted-foreground">
                        Allow others to see your public impact and badges
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      aria-label="Public profile"
                      type="checkbox"
                      className="sr-only peer"
                      checked={privacy.publicProfile}
                      onChange={(e) =>
                        setPrivacy((prev) => ({ ...prev, publicProfile: e.target.checked }))
                      }
                    />
                    <div className="w-11 h-6 bg-accent peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-border/50"></div>
                  </label>
                </div>
                <div className="h-px bg-border/50" />
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <div className="mt-1 text-muted-foreground">
                      <Activity size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Share Location</h4>
                      <p className="text-xs text-muted-foreground">
                        Automatically attach location to new reports
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      aria-label="Share location"
                      type="checkbox"
                      className="sr-only peer"
                      checked={privacy.shareLocation}
                      onChange={(e) =>
                        setPrivacy((prev) => ({ ...prev, shareLocation: e.target.checked }))
                      }
                    />
                    <div className="w-11 h-6 bg-accent peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-border/50"></div>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm overflow-hidden border-red-500/20">
              <CardHeader className="bg-red-500/5 border-b border-red-500/10">
                <CardTitle className="text-xl flex items-center gap-2 text-red-500">
                  <Trash2 /> Danger Zone
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Irreversible actions related to your account.
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-foreground">Delete Account</h4>
                    <p className="text-xs text-muted-foreground">
                      Permanently remove your account and all data
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="text-red-500 border-red-500/30 hover:bg-red-500 hover:text-white rounded-xl"
                  >
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
