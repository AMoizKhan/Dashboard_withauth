import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { AuthForm } from "../components/AuthForm";
import { Dashboard } from "./Dashboard";
import { Sidebar } from "../components/Sidebar";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
