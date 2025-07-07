import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Board } from "@shared/types";
import { BoardCard } from "../components/BoardCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Plus,
  Search,
  Grid3X3,
  List,
  TrendingUp,
  Clock,
  Users,
} from "lucide-react";
import { cn } from "../lib/utils";

export const Dashboard: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await fetch("/api/boards", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBoards(data.boards || []);
      }
    } catch (error) {
      console.error("Failed to fetch boards:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBoards = boards.filter((board) =>
    board.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const recentBoards = boards
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 4);

  const totalCards = boards.reduce(
    (acc, board) =>
      acc + board.columns.reduce((colAcc, col) => colAcc + col.cards.length, 0),
    0,
  );

  const stats = [
    {
      title: "Total Boards",
      value: boards.length,
      icon: Grid3X3,
      color: "text-primary",
    },
    {
      title: "Total Cards",
      value: totalCards,
      icon: TrendingUp,
      color: "text-success",
    },
    {
      title: "Recent Activity",
      value: recentBoards.length,
      icon: Clock,
      color: "text-warning",
    },
    {
      title: "Collaborators",
      value: new Set(boards.flatMap((b) => b.members)).size,
      icon: Users,
      color: "text-info",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto dashboard-gradient">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your collaboration boards and track your progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className="border-0 bg-card/50 backdrop-blur-sm"
            >
              <CardContent className="flex items-center p-6">
                <div
                  className={cn(
                    "p-2 rounded-lg bg-background mr-4",
                    stat.color,
                  )}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Boards */}
        {recentBoards.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Recent Boards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentBoards.map((board) => (
                <BoardCard key={board.id} board={board} />
              ))}
            </div>
          </div>
        )}

        {/* All Boards Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">All Boards</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search boards..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <Button
                onClick={() => navigate("/board/new")}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Board
              </Button>
            </div>
          </div>

          {filteredBoards.length > 0 ? (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4",
              )}
            >
              {filteredBoards.map((board) => (
                <BoardCard key={board.id} board={board} />
              ))}
            </div>
          ) : (
            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Grid3X3 className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "No boards found" : "No boards yet"}
                </h3>
                <p className="text-muted-foreground text-center mb-6 max-w-sm">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Create your first board to start collaborating with your team"}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => navigate("/board/new")}
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Board
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
