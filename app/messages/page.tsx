
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Send, Search, MoreVertical, Phone, Video, Paperclip, Smile } from "lucide-react"

export default function MessagesPage() {
  const conversations = [
    {
      id: 1,
      name: "Green Valley Farm",
      avatar: "/idyllic-farm.png",
      lastMessage: "The cow is ready for delivery",
      time: "5m",
      unread: 2,
      online: true,
      verified: true,
    },
    {
      id: 2,
      name: "Sunrise Poultry",
      avatar: "/roasted-chicken.png",
      lastMessage: "Sure, I can arrange a visit",
      time: "1h",
      unread: 0,
      online: true,
      verified: true,
    },
    {
      id: 3,
      name: "Mountain Ridge Ranch",
      avatar: "/sprawling-ranch.png",
      lastMessage: "The goats are in excellent condition",
      time: "3h",
      unread: 1,
      online: false,
      verified: false,
    },
    {
      id: 4,
      name: "Highland Ranch",
      avatar: "/fluffy-sheep-pasture.png",
      lastMessage: "Yes, delivery is included",
      time: "1d",
      unread: 0,
      online: false,
      verified: true,
    },
  ]

  const currentChat = conversations[0]

  const messages = [
    {
      id: 1,
      sender: "other",
      text: "Hello! I saw your inquiry about the Holstein cow.",
      time: "10:30 AM",
    },
    {
      id: 2,
      sender: "me",
      text: "Yes, I'm interested. Can you tell me more about her health records?",
      time: "10:32 AM",
    },
    {
      id: 3,
      sender: "other",
      text: "She's in excellent health. All vaccinations are up to date. I can send you the vet records.",
      time: "10:35 AM",
    },
    {
      id: 4,
      sender: "me",
      text: "That would be great. What about delivery arrangements?",
      time: "10:37 AM",
    },
    {
      id: 5,
      sender: "other",
      text: "We offer free delivery within 100 miles. For longer distances, we can arrange transport at additional cost.",
      time: "10:40 AM",
    },
    {
      id: 6,
      sender: "me",
      text: "Perfect. I'd like to proceed with the purchase.",
      time: "10:42 AM",
    },
    {
      id: 7,
      sender: "other",
      text: "The cow is ready for delivery",
      time: "10:45 AM",
    },
  ]

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <MessageSquare className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-balance">Messages</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search conversations..." className="pl-10" />
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      className={`w-full p-3 rounded-lg hover:bg-accent transition-colors text-left ${
                        conv.id === 1 ? "bg-accent" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={conv.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{conv.name[0]}</AvatarFallback>
                          </Avatar>
                          {conv.online && (
                            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm truncate">{conv.name}</h3>
                              {conv.verified && (
                                <Badge variant="secondary" className="text-xs px-1 py-0">
                                  ✓
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">{conv.time}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                            {conv.unread > 0 && (
                              <Badge className="bg-emerald-600 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                {conv.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2">
            <CardContent className="p-0 h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={currentChat.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{currentChat.name[0]}</AvatarFallback>
                    </Avatar>
                    {currentChat.online && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{currentChat.name}</h3>
                      {currentChat.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{currentChat.online ? "Online" : "Offline"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender === "me" ? "bg-emerald-600 text-white" : "bg-muted"
                        }`}
                      >
                        <p className="text-sm text-pretty">{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === "me" ? "text-emerald-100" : "text-muted-foreground"
                          }`}
                        >
                          {message.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input placeholder="Type your message..." className="flex-1" />
                  <Button variant="ghost" size="icon">
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Button size="icon" className="bg-emerald-600 hover:bg-emerald-700">
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
