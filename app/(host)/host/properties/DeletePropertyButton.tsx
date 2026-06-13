"use client";

import { useState } from "react";
import { deleteProperty } from "./actions";
import { Trash2 } from "lucide-react";

export default function DeletePropertyButton({ propertyId }: { propertyId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this property? This action cannot be undone.");
    if (!confirmed) return;

    setLoading(true);
    try {
      await deleteProperty(propertyId);
    } catch (err: any) {
      alert(err.message || "Failed to delete property.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title="Delete property"
      className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
    >
      <Trash2 className="size-3.5" />
    </button>
  );
}
