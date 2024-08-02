"use client"

import { useState, useMemo, useEffect } from "react"
import { useSession } from "next-auth/react"
import { SquarePen, UserPlus } from "lucide-react"

import { cn } from "@/lib/utils"
import useChat from "@/app/hooks/useChat"
import { pusherClient } from "@/app/libs/pusher"

import Button from "@components/button"
import ChatButton from "@components/chatbutton"
import Modal from "@components/modal"
import CreateChatForm from "@components/createchatform"
import AddFriendForm from "@components/addfriendform"

const ChatSidebar = ({ initialChats, friends, className, ...props }) => {
  const session = useSession()
  const { chatId } = useChat()

  const [chats, setChats] = useState(initialChats)
  const [showCreateChat, setShowCreateChat] = useState(false)
  const [showAddFriend, setShowAddFriend] = useState(false)

  const currentUserEmail = useMemo(() => {
    return session?.data?.user?.email
  }, [session?.data?.user?.email])

  useEffect(() => {
    if (!currentUserEmail) return

    pusherClient.subscribe(currentUserEmail)

    const updateChatHandler = (updatedChat) => {
      setChats((current) => current.map((chat) => {
        if (chat.id === updatedChat.id)
          return {
            ...chat,
            messages: updatedChat.messages,
          }

        return chat
      }))
    }

    pusherClient.bind("chat:update", updateChatHandler)

    return () => {
      pusherClient.unsubscribe(currentUserEmail)
      pusherClient.unbind("chat:update", updateChatHandler)
    }
  }, [currentUserEmail])

  const handleCreateChat = (chat, isNew) => {
    if (isNew) setChats((current) => [chat, ...current])
    setShowCreateChat(false)
  }

  const handleDeleteChat = (chat) => {
    const updatedChats = chats.filter(
      (item) => item.id !== chat.id
    )
    setChats(updatedChats)
  }

  return (
    <div
      className={cn(
        `flex
        shrink-0
        flex-col
        items-center
        justify-start
        border-r
        border-zinc-100
        px-4
        pt-2`,
        className
      )}
      {...props}
    >
      <div className="flex w-full items-end justify-between">
        <span className="text-sm font-medium text-zinc-400">
          Chats
        </span>
        <Button
          variant="subtle"
          onClick={() => setShowCreateChat(true)}
          uniform
          className="self-end"
        >
          <SquarePen size={16} className="shrink-0" />
        </Button>
        <Modal
          isOpen={showCreateChat}
          onClose={() => setShowCreateChat(false)}
        >
          <CreateChatForm
            friends={friends}
            onCreate={handleCreateChat}
          />
        </Modal>
      </div>
      {chats.map((chat) => (
        <ChatButton
          key={chat.id}
          chat={chat}
          selected={chat.id === chatId}
          onDelete={handleDeleteChat}
        />
      ))}
      <Button
        variant="invisible"
        onClick={() => setShowAddFriend(true)}
        className="h-9 w-full text-sm text-zinc-500"
      >
        Add Friend
        <UserPlus absoluteStrokeWidth className="h-4 w-4" />
      </Button>
      <Modal
        isOpen={showAddFriend}
        onClose={() => setShowAddFriend(false)}
      >
        <AddFriendForm />
      </Modal>
    </div>
  )
}

export default ChatSidebar
