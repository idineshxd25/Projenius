import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:
    "Projenius - Smart AI Project Planner | Turn Ideas Into Structured Projects",
  description:
    "Projenius is an AI-powered project builder that transforms your ideas into structured project plans. Create roadmaps, choose tech stacks, and generate detailed project blueprints with adaptive Q&A and AI insights.",
  keywords: [
    "AI project builder",
    "idea to project tool",
    "AI project planner",
    "project planning AI",
    "AI roadmap generator",
    "adaptive Q&A project tool",
    "AI startup tool",
    "AI-powered roadmap",
    "structured project ideas",
    "AI project generator",
    "tech stack suggestions AI",
    "AI product development tool",
  ],
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Projenius - Smart AI Project Planner",
    description:
      "Turn your ideas into structured projects with AI. Generate roadmaps, tech stacks, and actionable plans instantly.",
    url: "https://yourdomain.com", // update later
    siteName: "Projenius",
    images: [
      {
        url: "/Projenius.png", // create a nice social preview image
        width: 1200,
        height: 630,
        alt: "Projenius - AI Project Planner",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projenius - Smart AI Project Planner",
    description:
      "Turn your ideas into structured projects with AI. Generate roadmaps, tech stacks, and actionable plans instantly.",
    images: ["/Projenius.png"],
    creator: "@Dinesh_Bankuru", // optional if you have Twitter
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        > */}
        <Navbar />
        {children}
        <Footer />
        <Toaster />
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
