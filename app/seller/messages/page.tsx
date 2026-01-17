"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, getDoc, orderBy, onSnapshot } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

type Conversation = {
  id: string
  participants: string[]
  lastMessage?: string
  lastUpdatedAt?: any
  otherUser: {
    id: string
    firstName?: string
    lastName?: string
    profileImageUrl?: string
  }
}

export default function MessagesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("lastUpdatedAt", "desc")
    )

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      setLoading(true)
      const convos = await Promise.all(snapshot.docs.map(async (convoDoc) => {
        const conversationData = convoDoc.data()
        const otherUserId = conversationData.participants.find((p: string) => p !== user.uid)
        
        let otherUserData = { id: '', firstName: 'Unknown', lastName: 'User', profileImageUrl: '' };
        if (otherUserId) {
            const userDoc = await getDoc(doc(db, "users", otherUserId));
            if (userDoc.exists()) {
                const data = userDoc.data();
                otherUserData = {
                    id: userDoc.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    profileImageUrl: data.profileImage,
                }
            }
        }

        return {
          id: convoDoc.id,
          ...conversationData,
          otherUser: otherUserData,
        } as Conversation
      }))
      setConversations(convos)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  if (loading) {
    return <div className="text-center py-10">Loading conversations...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      <div className="border rounded-lg">
        {conversations.length === 0 ? (
          <p className="text-center text-muted-foreground p-8">You have no messages.</p>
        ) : (
          conversations.map(convo => (
            <div
              key={convo.id}
              className="border-b p-4 hover:bg-accent cursor-pointer flex items-center gap-4"
              onClick={() => router.push(`/messages/${convo.id}`)}
            >
              <Avatar>
                <AvatarImage src={convo.otherUser.profileImageUrl} />
                <AvatarFallback>{convo.otherUser.firstName?.charAt(0)}{convo.otherUser.lastName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="font-semibold">{convo.otherUser.firstName} {convo.otherUser.lastName}</p>
                  {convo.lastUpdatedAt && (
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(convo.lastUpdatedAt.toDate(), { addSuffix: true })}
                    </p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{convo.lastMessage || 'No messages yet'}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}