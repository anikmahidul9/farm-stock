"use client"

import { useState, useEffect } from "react"
import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { useRouter } from "next/navigation"

type Conversation = {
  id: string;
  participants: string[];
  lastUpdatedAt?: { toDate: () => Date };
  lastRead?: { [key: string]: { toDate: () => Date } };
};


export function MessageBell() {
  const { user } = useAuth()
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let count = 0
      snapshot.forEach(doc => {
        const convo = doc.data() as Conversation
        const lastUpdated = convo.lastUpdatedAt?.toDate()
        
        // The user's lastRead timestamp for this specific conversation
        const userLastRead = convo.lastRead?.[user.uid]?.toDate()

        // If the conversation has been updated and the user's lastRead is older, it's unread
        if (lastUpdated && (!userLastRead || lastUpdated > userLastRead)) {
          count++
        }
      })
      setUnreadCount(count)
    })

    return () => unsubscribe()
  }, [user])

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => router.push("/messages")}
    >
      <MessageSquare className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge className="absolute -top-1 -right-1 h-4 w-4 justify-center rounded-full p-0 text-xs">
          {unreadCount}
        </Badge>
      )}
      <span className="sr-only">Messages</span>
    </Button>
  )
}
