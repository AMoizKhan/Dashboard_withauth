export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  ownerId: string;
  members: string[];
  columns: Column[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  title: string;
  position: number;
  boardId: string;
  cards: Card[];
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  position: number;
  columnId: string;
  assignees: string[];
  labels: Label[];
  dueDate?: Date;
  comments: Comment[];
  checklists: Checklist[];
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  cardId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Checklist {
  id: string;
  title: string;
  items: ChecklistItem[];
  cardId: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  checklistId: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  cardId: string;
  uploadedAt: Date;
}

export interface Cursor {
  userId: string;
  userName: string;
  x: number;
  y: number;
  color: string;
}

export interface SocketEvents {
  // Board events
  "board:join": { boardId: string; user: User };
  "board:leave": { boardId: string; userId: string };
  "board:update": { board: Board };

  // Card events
  "card:create": { card: Card };
  "card:update": { card: Card };
  "card:delete": { cardId: string };
  "card:move": { cardId: string; columnId: string; position: number };

  // Column events
  "column:create": { column: Column };
  "column:update": { column: Column };
  "column:delete": { columnId: string };

  // Real-time events
  "cursor:move": { cursor: Cursor };
  "user:typing": { userId: string; cardId: string };
  "user:stop-typing": { userId: string; cardId: string };
}
