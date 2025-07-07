import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card as CardType, Label } from "@shared/types";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Calendar,
  MessageSquare,
  Paperclip,
  CheckSquare,
  MoreHorizontal,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "../lib/utils";

interface TaskCardProps {
  card: CardType;
  onEdit?: (card: CardType) => void;
  onDelete?: (cardId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  card,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const completedChecklist = card.checklists.reduce(
    (acc, checklist) =>
      acc + checklist.items.filter((item) => item.completed).length,
    0,
  );
  const totalChecklist = card.checklists.reduce(
    (acc, checklist) => acc + checklist.items.length,
    0,
  );

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 border-0 bg-card/80 backdrop-blur-sm",
        isDragging && "shadow-2xl rotate-3 scale-105",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-medium text-sm leading-tight pr-2">
            {card.title}
          </h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(card)}>
                Edit Card
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(card.id)}
                className="text-destructive"
              >
                Delete Card
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {card.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {card.description}
          </p>
        )}

        {/* Labels */}
        {card.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {card.labels.map((label) => (
              <Badge
                key={label.id}
                variant="secondary"
                className="text-xs px-2 py-0"
                style={{ backgroundColor: label.color }}
              >
                {label.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Due Date */}
        {card.dueDate && (
          <div className="flex items-center gap-1 mb-3">
            <Calendar className="w-3 h-3" />
            <span
              className={cn(
                "text-xs",
                isOverdue ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {new Date(card.dueDate).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Footer with stats and assignees */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {card.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span>{card.comments.length}</span>
              </div>
            )}
            {card.attachments.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="w-3 h-3" />
                <span>{card.attachments.length}</span>
              </div>
            )}
            {totalChecklist > 0 && (
              <div className="flex items-center gap-1">
                <CheckSquare className="w-3 h-3" />
                <span
                  className={cn(
                    completedChecklist === totalChecklist && "text-success",
                  )}
                >
                  {completedChecklist}/{totalChecklist}
                </span>
              </div>
            )}
          </div>

          {/* Assignees */}
          <div className="flex -space-x-1">
            {card.assignees.slice(0, 3).map((assigneeId, index) => (
              <Avatar
                key={assigneeId}
                className="w-5 h-5 border border-background"
              >
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {String.fromCharCode(65 + index)}
                </AvatarFallback>
              </Avatar>
            ))}
            {card.assignees.length > 3 && (
              <div className="w-5 h-5 rounded-full bg-muted border border-background flex items-center justify-center">
                <span className="text-xs font-medium">
                  +{card.assignees.length - 3}
                </span>
              </div>
            )}
            {card.assignees.length === 0 && (
              <div className="w-5 h-5 rounded-full bg-muted border border-background flex items-center justify-center">
                <User className="w-3 h-3 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
