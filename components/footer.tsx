"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Left side */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Projenius. All rights reserved. Made
            with ❤️
          </p>

          {/* Center links */}
          <div className="flex space-x-4">
            <Link href="/" className="text-sm hover:underline">
              About
            </Link>
            <Link href="/" className="text-sm hover:underline">
              Privacy
            </Link>
            <Link href="/" className="text-sm hover:underline">
              Terms
            </Link>
          </div>

          {/* Right side */}
          <div className="flex space-x-4">
            <a
              href="https://x.com/Dinesh_Bankuru"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline"
            >
              Twitter
            </a>
            <a
              href="https://github.com/DineshBankuru"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
