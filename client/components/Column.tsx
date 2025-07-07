import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Column as ColumnType, Card as CardType } from "@shared/types";
import { TaskCard } from "./TaskCard";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Plus, MoreHorizontal, Edit, Trash } from "lucide-react";
import { cn } from "../lib/utils";

interface ColumnProps {
  column: ColumnType;
  onAddCard?: (columnId: string, title: string) => void;
  onEditCard?: (card: CardType) => void;
  onDeleteCard?: (cardId: string) => void;
  onEditColumn?: (column: ColumnType) => void;
  onDeleteColumn?: (columnId: string) => void;
}

export const Column: React.FC<ColumnProps> = ({
  column,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onEditColumn,
  onDeleteColumn,
}) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");

  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      onAddCard?.(column.id, newCardTitle.trim());
      setNewCardTitle("");
      setIsAddingCard(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddCard();
    } else if (e.key === "Escape") {
      setIsAddingCard(false);
      setNewCardTitle("");
    }
  };

  return (
    <div className="flex flex-col w-80 bg-muted/30 rounded-lg">
      {/* Column Header */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{column.title}</h3>
          <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
            {column.cards.length}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEditColumn?.(column)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Column
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeleteColumn?.(column.id)}
              className="text-destructive"
            >
              <Trash className="w-4 h-4 mr-2" />
              Delete Column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      {/* Cards Container */}
      <div
        ref={setNodeRef}
        className="flex-1 px-3 pb-3 space-y-2 min-h-[100px]"
      >
        <SortableContext
          items={column.cards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.map((card) => (
            <TaskCard
              key={card.id}
              card={card}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
            />
          ))}
        </SortableContext>

        {/* Add Card Form */}
        {isAddingCard ? (
          <Card className="border-2 border-dashed border-primary/50">
            <CardContent className="p-3">
              <Input
                placeholder="Enter card title..."
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                className="mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddCard}>
                  Add Card
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsAddingCard(false);
                    setNewCardTitle("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground border-2 border-dashed border-transparent hover:border-border h-auto py-3"
            onClick={() => setIsAddingCard(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add a card
          </Button>
        )}
      </div>
    </div>
  );
};
