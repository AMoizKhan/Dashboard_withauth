import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Board as BoardType,
  Column as ColumnType,
  Card as CardType,
} from "@shared/types";
import { Column } from "../components/Column";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Users,
  Settings,
  Share,
  Star,
  MoreHorizontal,
  Filter,
  Search,
} from "lucide-react";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";

export const Board: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user } = useAuth();
  const [board, setBoard] = useState<BoardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (id) {
      fetchBoard();

      // Join board room for real-time updates
      if (socket && user) {
        socket.emit("board:join", { boardId: id, user });
      }
    }

    return () => {
      if (socket && id) {
        socket.emit("board:leave", { boardId: id, userId: user?.id });
      }
    };
  }, [id, socket, user]);

  useEffect(() => {
    if (!socket) return;

    // Listen for real-time updates
    socket.on("board:update", (updatedBoard: BoardType) => {
      setBoard(updatedBoard);
    });

    socket.on("card:create", (newCard: CardType) => {
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          columns: prev.columns.map((col) =>
            col.id === newCard.columnId
              ? { ...col, cards: [...col.cards, newCard] }
              : col,
          ),
        };
      });
    });

    socket.on("card:update", (updatedCard: CardType) => {
      setBoard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          columns: prev.columns.map((col) => ({
            ...col,
            cards: col.cards.map((card) =>
              card.id === updatedCard.id ? updatedCard : card,
            ),
          })),
        };
      });
    });

    socket.on("card:move", ({ cardId, columnId, position }) => {
      setBoard((prev) => {
        if (!prev) return prev;

        // Find the card in current columns
        let cardToMove: CardType | null = null;
        const newColumns = prev.columns.map((col) => ({
          ...col,
          cards: col.cards.filter((card) => {
            if (card.id === cardId) {
              cardToMove = { ...card, columnId, position };
              return false;
            }
            return true;
          }),
        }));

        // Add card to new column
        if (cardToMove) {
          const targetColumn = newColumns.find((col) => col.id === columnId);
          if (targetColumn) {
            targetColumn.cards.splice(position, 0, cardToMove);
          }
        }

        return { ...prev, columns: newColumns };
      });
    });

    return () => {
      socket.off("board:update");
      socket.off("card:create");
      socket.off("card:update");
      socket.off("card:move");
    };
  }, [socket]);

  const fetchBoard = async () => {
    try {
      const response = await fetch(`/api/boards/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBoard(data.board);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Failed to fetch board:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !board) return;

    const activeCardId = active.id as string;
    const overColumnId = over.id as string;

    // Find the active card
    let activeCard: CardType | null = null;
    let sourceColumnId: string | null = null;

    for (const column of board.columns) {
      const cardIndex = column.cards.findIndex(
        (card) => card.id === activeCardId,
      );
      if (cardIndex !== -1) {
        activeCard = column.cards[cardIndex];
        sourceColumnId = column.id;
        break;
      }
    }

    if (!activeCard || !sourceColumnId) return;

    // If dropping in the same column, reorder
    if (sourceColumnId === overColumnId) {
      const column = board.columns.find((col) => col.id === sourceColumnId);
      if (!column) return;

      const oldIndex = column.cards.findIndex(
        (card) => card.id === activeCardId,
      );
      const newIndex = column.cards.length - 1; // Simple reordering for now

      if (oldIndex !== newIndex) {
        const newCards = arrayMove(column.cards, oldIndex, newIndex);
        const newColumns = board.columns.map((col) =>
          col.id === sourceColumnId ? { ...col, cards: newCards } : col,
        );

        setBoard({ ...board, columns: newColumns });

        // Emit real-time update
        if (socket) {
          socket.emit("card:move", {
            cardId: activeCardId,
            columnId: sourceColumnId,
            position: newIndex,
          });
        }
      }
    } else {
      // Moving to different column
      const sourceColumn = board.columns.find(
        (col) => col.id === sourceColumnId,
      );
      const targetColumn = board.columns.find((col) => col.id === overColumnId);

      if (!sourceColumn || !targetColumn) return;

      const newSourceCards = sourceColumn.cards.filter(
        (card) => card.id !== activeCardId,
      );
      const newTargetCards = [
        ...targetColumn.cards,
        { ...activeCard, columnId: overColumnId },
      ];

      const newColumns = board.columns.map((col) => {
        if (col.id === sourceColumnId) {
          return { ...col, cards: newSourceCards };
        }
        if (col.id === overColumnId) {
          return { ...col, cards: newTargetCards };
        }
        return col;
      });

      setBoard({ ...board, columns: newColumns });

      // Emit real-time update
      if (socket) {
        socket.emit("card:move", {
          cardId: activeCardId,
          columnId: overColumnId,
          position: newTargetCards.length - 1,
        });
      }
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim() || !board) return;

    const newColumn: ColumnType = {
      id: `col-${Date.now()}`,
      title: newColumnTitle.trim(),
      position: board.columns.length,
      boardId: board.id,
      cards: [],
    };

    setBoard({
      ...board,
      columns: [...board.columns, newColumn],
    });

    setNewColumnTitle("");
    setIsAddingColumn(false);

    // TODO: Save to backend
  };

  const handleAddCard = async (columnId: string, title: string) => {
    if (!board) return;

    const newCard: CardType = {
      id: `card-${Date.now()}`,
      title,
      position: 0,
      columnId,
      assignees: [],
      labels: [],
      comments: [],
      checklists: [],
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newColumns = board.columns.map((col) =>
      col.id === columnId ? { ...col, cards: [...col.cards, newCard] } : col,
    );

    setBoard({ ...board, columns: newColumns });

    // Emit real-time update
    if (socket) {
      socket.emit("card:create", { card: newCard });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Board not found</h2>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen board-gradient">
      {/* Board Header */}
      <div className="flex items-center justify-between p-4 bg-card/80 backdrop-blur-sm border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold">{board.title}</h1>
            {board.description && (
              <p className="text-sm text-muted-foreground">
                {board.description}
              </p>
            )}
          </div>
          <Badge variant="secondary">
            {board.columns.reduce((acc, col) => acc + col.cards.length, 0)}{" "}
            cards
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Board Members */}
          <div className="flex -space-x-2 mr-4">
            {board.members.slice(0, 5).map((memberId, index) => (
              <Avatar
                key={memberId}
                className="w-8 h-8 border-2 border-background"
              >
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {String.fromCharCode(65 + index)}
                </AvatarFallback>
              </Avatar>
            ))}
            {board.members.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-xs font-medium">
                  +{board.members.length - 5}
                </span>
              </div>
            )}
          </div>

          <Button variant="outline" size="sm">
            <Users className="w-4 h-4 mr-2" />
            Invite
          </Button>
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Board Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Star className="w-4 h-4 mr-2" />
                Add to Favorites
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full p-4 gap-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={board.columns.map((col) => col.id)}
              strategy={horizontalListSortingStrategy}
            >
              {board.columns.map((column) => (
                <Column
                  key={column.id}
                  column={column}
                  onAddCard={handleAddCard}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Add Column */}
          <div className="flex-shrink-0 w-80">
            {isAddingColumn ? (
              <div className="bg-muted/30 rounded-lg p-3">
                <Input
                  placeholder="Enter column title..."
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddColumn();
                    if (e.key === "Escape") {
                      setIsAddingColumn(false);
                      setNewColumnTitle("");
                    }
                  }}
                  className="mb-2"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddColumn}>
                    Add Column
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsAddingColumn(false);
                      setNewColumnTitle("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="w-full h-12 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5"
                onClick={() => setIsAddingColumn(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add another column
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
