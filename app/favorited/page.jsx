"use client";
import { useEffect, useState } from "react";
import { store } from "@/lib/store";
import GridPage from "@/components/GridPage";

export default function Favorited() {
  const [bookmarks, setBookmarks] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setBookmarks(store.getBookmarks() || []);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <GridPage title="Favorited Anime" items={bookmarks} errorMsg="You haven't favorited any anime yet." />;
}
