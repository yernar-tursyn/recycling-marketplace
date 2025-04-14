export interface NotificationType {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: string;
  actionUrl?: string;
  actionText?: string;
  relatedUserId?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}
