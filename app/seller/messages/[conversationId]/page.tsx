"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/auth-provider"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, onSnapshot, doc, getDoc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"

type Message = {
  id: string
  senderId: string
  text: string
  createdAt: any
}

type OtherUser = {
    id: string
    firstName?: string
    lastName?: string
    profileImageUrl?: string
}

export default function ConversationPage() {
  const { user, userData } = useAuth()
  const params = useParams()
  const router = useRouter()
  const { conversationId } = params
  
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    if (!user || !conversationId) return

    const conversationRef = doc(db, "conversations", conversationId as string);

    const markAsRead = async () => {
        await updateDoc(conversationRef, {
            [`lastRead.${user.uid}`]: serverTimestamp()
        });
    }

    const fetchConversationDetails = async () => {
        const convoDoc = await getDoc(conversationRef);
        if (convoDoc.exists()) {
            markAsRead(); // Mark as read when conversation is loaded

            const conversationData = convoDoc.data();
            const otherUserId = conversationData.participants.find((p: string) => p !== user.uid);
            if (otherUserId) {
                const userDoc = await getDoc(doc(db, "users", otherUserId));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setOtherUser({
                        id: userDoc.id,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        profileImageUrl: data.profileImage,
                    });
                }
            }
        } else {
            // Handle conversation not found
            router.push("/messages");
        }
    }

    fetchConversationDetails();

    const messagesQuery = query(
      collection(db, "conversations", conversationId as string, "messages"),
      orderBy("createdAt", "asc")
    )

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message))
      setMessages(msgs)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, conversationId, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newMessage.trim()) return

    const conversationRef = doc(db, "conversations", conversationId as string);
    const messagesRef = collection(conversationRef, "messages");

    const tempNewMessage = newMessage;
    setNewMessage("");

    await addDoc(messagesRef, {
      senderId: user.uid,
      text: tempNewMessage,
      createdAt: serverTimestamp(),
    })

    await updateDoc(conversationRef, {
        lastMessage: tempNewMessage,
        lastUpdatedAt: serverTimestamp(),
    })

    // Send notification to the other user
    if (otherUser) {
        const notification = {
            userId: otherUser.id,
            title: `New message from ${userData?.firstName || 'a user'}`,
            message: tempNewMessage,
            link: `/messages/${conversationId}`,
            read: false,
            createdAt: serverTimestamp(),
        };
        await addDoc(collection(db, "notifications"), notification);
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading messages...</div>
  }

  return (
    <div className="container mx-auto h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="border-b p-4 flex items-center gap-4">
            <Link href="/messages">
                <Button variant="ghost" size="icon">
                    <ArrowLeft />
                </Button>
            </Link>
            <Avatar>
                <AvatarImage src={otherUser?.profileImageUrl} />
                <AvatarFallback>{otherUser?.firstName?.charAt(0)}{otherUser?.lastName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <h2 className="font-semibold text-lg">{otherUser?.firstName} {otherUser?.lastName}</h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
                <div key={msg.id} className={`flex gap-3 ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
                    {msg.senderId !== user?.uid && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={otherUser?.profileImageUrl} />
                            <AvatarFallback>{otherUser?.firstName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                    )}
                    <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg ${msg.senderId === user?.uid ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p>{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.senderId === user?.uid ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {msg.createdAt ? formatDistanceToNow(msg.createdAt.toDate(), { addSuffix: true }) : ''}
                        </p>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <Button type="submit" size="icon">
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    </div>
  )
}