"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "@/context/auth-context"
import { getNotifications, markAsRead } from "@/services/notification-service"
import type { NotificationType } from "@/types/notification"

interface NotificationsContextType {
  notifications: NotificationType[]
  markNotificationAsRead: (id: string) => void
  isLoading: boolean
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const data = await getNotifications(user.id)
          setNotifications(data)
        } catch (error) {
          console.error("Error fetching notifications:", error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchNotifications()

      // Poll for new notifications every minute
      const interval = setInterval(fetchNotifications, 60000)

      return () => clearInterval(interval)
    } else {
      setNotifications([])
      setIsLoading(false)
    }
  }, [user])

  const markNotificationAsRead = async (id: string) => {
    if (!user) return

    try {
      await markAsRead(id)
      setNotifications(
        notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  return (
    <NotificationsContext.Provider value={{ notifications, markNotificationAsRead, isLoading }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)

  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }

  return context
}

