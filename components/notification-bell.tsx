"use client"

import { useState, useEffect } from "react"
import { Bell, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, writeBatch } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

type Notification = {
  id: string
  title: string
  message: string
  link: string
  read: boolean
  createdAt: {
    seconds: number
    nanoseconds: number
  }
}

export function NotificationBell() {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification))
      setNotifications(notifs)
    })

    return () => unsubscribe()
  }, [user])

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await updateDoc(doc(db, "notifications", notification.id), { read: true })
    }
    router.push(notification.link)
    setIsOpen(false)
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    const batch = writeBatch(db);
    const unreadNotifications = notifications.filter(n => !n.read);
    unreadNotifications.forEach(n => {
      const notifRef = doc(db, "notifications", n.id);
      batch.update(notifRef, { read: true });
    });
    await batch.commit();
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 justify-center rounded-full p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4 border-b flex justify-between items-center">
          <h4 className="font-medium text-sm">Notifications</h4>
          {unreadCount > 0 && (
             <Button variant="link" size="sm" className="h-auto p-0" onClick={handleMarkAllAsRead}>
                Mark all as read
             </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-4">No notifications yet.</p>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-4 border-b hover:bg-accent cursor-pointer ${!notif.read ? 'bg-blue-50/50' : ''}`}
                onClick={() => handleNotificationClick(notif)}
              >
                <p className="font-semibold text-sm">{notif.title}</p>
                <p className="text-sm text-muted-foreground">{notif.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt.seconds * 1000), { addSuffix: true }) : ''}
                </p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
