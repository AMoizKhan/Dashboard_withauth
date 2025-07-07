import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { AuthForm } from "../components/AuthForm";
import { Dashboard } from "./Dashboard";
import { Sidebar } from "../components/Sidebar";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <Dashboard />
    </div>
  );
}
