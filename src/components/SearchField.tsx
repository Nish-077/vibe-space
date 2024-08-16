"use client";

import { SearchIcon } from "lucide-react";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";

export default function SearchField() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  function handleClick(e: React.MouseEvent<SVGSVGElement, MouseEvent>) {
    e.preventDefault();
    if (formRef.current) {
      const form = formRef.current;
      const q = (form.q as HTMLInputElement).value.trim();
      if (!q) return;
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.q as HTMLInputElement).value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }
  //below we add method and action so that when js is unavailable, we do progressive enhancement and add "search" pathway in the url before the "/?q=<value>" is added to page
  //if js enabled, handlesubmit works, if not the input element will redirect
  return (
    <form ref={formRef} onSubmit={handleSubmit} method="GET" action="/search">
      <div className="relative">
        <Input name="q" placeholder="Search" className="pe-10" />
        <SearchIcon
          onClick={handleClick}
          className="absolute right-3 top-1/2 size-5 -translate-y-1/2 transform text-muted-foreground hover:cursor-pointer hover:font-extrabold hover:text-foreground"
        />
      </div>
    </form>
  );
}
