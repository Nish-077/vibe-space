import SearchField from "@/components/SearchField";
import UserButton from "@/components/UserButton";
import Link from "next/link";

export default function NavBar() {
  return (
    <header>
      <div className="sticky top-0 z-10 bg-card shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-5 px-5 py-3">
          <Link href={"/"} className="text-2xl font-bold text-primary mx-6 sm:mx-0" title="Vibe Space Home">Vibe Space</Link>
          <SearchField />
          <UserButton classname="sm:ms-auto"/>
        </div>
      </div>
    </header>
  );
}
