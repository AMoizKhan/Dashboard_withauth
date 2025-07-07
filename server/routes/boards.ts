import express from "express";
import { Board, Column, Card } from "@shared/types";

const router = express.Router();

// In-memory board storage (replace with real database)
const boards: Board[] = [
  {
    id: "board-1",
    title: "Project Alpha",
    description: "Main project board for Alpha initiative",
    ownerId: "user-1",
    members: ["user-1"],
    columns: [
      {
        id: "col-1",
        title: "To Do",
        position: 0,
        boardId: "board-1",
        cards: [
          {
            id: "card-1",
            title: "Set up project structure",
            description: "Initialize the project with proper folder structure",
            position: 0,
            columnId: "col-1",
            assignees: [],
            labels: [
              { id: "label-1", name: "Setup", color: "#3b82f6" },
              { id: "label-2", name: "High Priority", color: "#ef4444" },
            ],
            comments: [],
            checklists: [
              {
                id: "checklist-1",
                title: "Setup Tasks",
                cardId: "card-1",
                items: [
                  {
                    id: "item-1",
                    text: "Create repository",
                    completed: true,
                    checklistId: "checklist-1",
                  },
                  {
                    id: "item-2",
                    text: "Set up development environment",
                    completed: false,
                    checklistId: "checklist-1",
                  },
                ],
              },
            ],
            attachments: [],
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "card-2",
            title: "Design database schema",
            position: 1,
            columnId: "col-1",
            assignees: [],
            labels: [{ id: "label-3", name: "Database", color: "#10b981" }],
            comments: [],
            checklists: [],
            attachments: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
      {
        id: "col-2",
        title: "In Progress",
        position: 1,
        boardId: "board-1",
        cards: [
          {
            id: "card-3",
            title: "Implement authentication",
            description: "Set up user registration and login system",
            position: 0,
            columnId: "col-2",
            assignees: [],
            labels: [{ id: "label-4", name: "Backend", color: "#8b5cf6" }],
            comments: [
              {
                id: "comment-1",
                content: "Started working on JWT implementation",
                authorId: "user-1",
                cardId: "card-3",
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            ],
            checklists: [],
            attachments: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      },
      {
        id: "col-3",
        title: "Done",
        position: 2,
        boardId: "board-1",
        cards: [
          {
            id: "card-4",
            title: "Project planning",
            description: "Initial project planning and requirements gathering",
            position: 0,
            columnId: "col-3",
            assignees: [],
            labels: [{ id: "label-5", name: "Planning", color: "#8b5cf6" }],
            comments: [],
            checklists: [],
            attachments: [],
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
        ],
      },
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
];

// Get all boards for user
router.get("/", (req: any, res) => {
  try {
    const userId = req.user.id;
    const userBoards = boards.filter(
      (board) => board.ownerId === userId || board.members.includes(userId),
    );
    res.json({ boards: userBoards });
  } catch (error) {
    console.error("Error fetching boards:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get specific board
router.get("/:id", (req: any, res) => {
  try {
    const boardId = req.params.id;
    const userId = req.user.id;

    const board = boards.find((b) => b.id === boardId);
    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    // Check if user has access to board
    if (board.ownerId !== userId && !board.members.includes(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ board });
  } catch (error) {
    console.error("Error fetching board:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create new board
router.post("/", (req: any, res) => {
  try {
    const userId = req.user.id;
    const { title, description } = req.body;

    const newBoard: Board = {
      id: `board-${Date.now()}`,
      title,
      description,
      ownerId: userId,
      members: [userId],
      columns: [
        {
          id: `col-${Date.now()}-1`,
          title: "To Do",
          position: 0,
          boardId: `board-${Date.now()}`,
          cards: [],
        },
        {
          id: `col-${Date.now()}-2`,
          title: "In Progress",
          position: 1,
          boardId: `board-${Date.now()}`,
          cards: [],
        },
        {
          id: `col-${Date.now()}-3`,
          title: "Done",
          position: 2,
          boardId: `board-${Date.now()}`,
          cards: [],
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    boards.push(newBoard);
    res.status(201).json({ board: newBoard });
  } catch (error) {
    console.error("Error creating board:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update board
router.put("/:id", (req: any, res) => {
  try {
    const boardId = req.params.id;
    const userId = req.user.id;
    const updates = req.body;

    const boardIndex = boards.findIndex((b) => b.id === boardId);
    if (boardIndex === -1) {
      return res.status(404).json({ message: "Board not found" });
    }

    const board = boards[boardIndex];

    // Check if user has permission to update
    if (board.ownerId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    boards[boardIndex] = {
      ...board,
      ...updates,
      updatedAt: new Date(),
    };

    res.json({ board: boards[boardIndex] });
  } catch (error) {
    console.error("Error updating board:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete board
router.delete("/:id", (req: any, res) => {
  try {
    const boardId = req.params.id;
    const userId = req.user.id;

    const boardIndex = boards.findIndex((b) => b.id === boardId);
    if (boardIndex === -1) {
      return res.status(404).json({ message: "Board not found" });
    }

    const board = boards[boardIndex];

    // Check if user has permission to delete
    if (board.ownerId !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    boards.splice(boardIndex, 1);
    res.json({ message: "Board deleted successfully" });
  } catch (error) {
    console.error("Error deleting board:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export { router as boardRoutes };
