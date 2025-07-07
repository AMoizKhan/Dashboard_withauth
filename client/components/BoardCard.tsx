import React from "react";
import { Link } from "react-router-dom";
import { Board } from "@shared/types";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Calendar, Users, MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface BoardCardProps {
  board: Board;
  onEdit?: (board: Board) => void;
  onDelete?: (boardId: string) => void;
}

export const BoardCard: React.FC<BoardCardProps> = ({
  board,
  onEdit,
  onDelete,
}) => {
  const totalCards = board.columns.reduce(
    (acc, column) => acc + column.cards.length,
    0,
  );

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-0 bg-card/80 backdrop-blur-sm overflow-hidden">
      <div className="relative">
        {board.coverImage ? (
          <div
            className="h-32 bg-cover bg-center"
            style={{ backgroundImage: `url(${board.coverImage})` }}
          />
        ) : (
          <div className="h-32 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10" />
        )}

        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40 text-white"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(board)}>
                Edit Board
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(board.id)}
                className="text-destructive"
              >
                Delete Board
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <CardContent className="p-4">
        <Link to={`/board/${board.id}`} className="block">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
            {board.title}
          </h3>
          {board.description && (
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {board.description}
            </p>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(board.updatedAt).toLocaleDateString()}
            </div>
            <Badge variant="secondary" className="text-xs">
              {totalCards} cards
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div className="flex -space-x-2">
                {board.members.slice(0, 3).map((memberId, index) => (
                  <Avatar
                    key={memberId}
                    className="w-6 h-6 border-2 border-background"
                  >
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {String.fromCharCode(65 + index)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {board.members.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs font-medium">
                      +{board.members.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              {board.columns.slice(0, 3).map((column, index) => {
                const colors = ["#667eea", "#764ba2", "#f093fb"];
                return (
                  <div
                    key={column.id}
                    className="w-2 h-2 rounded-full opacity-80"
                    style={{
                      backgroundColor: colors[index % colors.length],
                    }}
                  />
                );
              })}
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
};
