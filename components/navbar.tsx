// "use client"

// import { Moon, Sun, User, LogOut } from 'lucide-react'
// import { useTheme } from 'next-themes'
// import { Button } from '@/components/ui/button'
// import { supabase } from '@/lib/supabase'
// import { useRouter } from 'next/navigation'
// import { useEffect, useState } from 'react'
// import { User as SupabaseUser } from '@supabase/supabase-js'
// import Link from 'next/link'

// export function Navbar() {
//   const { theme, setTheme } = useTheme()
//   const router = useRouter()
//   const [user, setUser] = useState<SupabaseUser | null>(null)

//   useEffect(() => {
//     const getUser = async () => {
//       const { data: { user } } = await supabase.auth.getUser()
//       setUser(user)
//     }
//     getUser()

//     const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
//       setUser(session?.user ?? null)
//     })

//     return () => subscription.unsubscribe()
//   }, [])

//   const handleSignOut = async () => {
//     await supabase.auth.signOut()
//     router.push('/')
//   }

//   return (
//     <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//       <div className="container mx-auto px-4">
//         <div className="flex h-16 items-center justify-between">
//           <Link href="/" className="flex items-center space-x-2">
//             <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
//             <span className="text-xl font-bold">ProjectAI</span>
//           </Link>

//           <div className="flex items-center space-x-4">
//             <Button
//               variant="ghost"
//               size="icon"
//               onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
//             >
//               <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
//               <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
//               <span className="sr-only">Toggle theme</span>
//             </Button>

//             {user ? (
//               <div className="flex items-center space-x-2">
//                 <Link href="/dashboard">
//                   <Button variant="ghost" size="sm">
//                     <User className="h-4 w-4 mr-2" />
//                     Dashboard
//                   </Button>
//                 </Link>
//                 <Button variant="ghost" size="sm" onClick={handleSignOut}>
//                   <LogOut className="h-4 w-4 mr-2" />
//                   Sign Out
//                 </Button>
//               </div>
//             ) : (
//               <Link href="/auth">
//                 <Button variant="default" size="sm">
//                   <User className="h-4 w-4 mr-2" />
//                   Sign In
//                 </Button>
//               </Link>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   )
// }

"use client";

import { Moon, Sun, User, LogOut, Menu, X } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/icon.png" // place your generated image in public/ folder
              alt="Projenius logo"
              width={60}
              height={60}
              style={{ filter: "brightness(0) saturate(100%)", width: "100px" }}
              className="rounded-lg"
            />
            <span className="text-xl font-bold">Projenius</span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button> */}

            {user ? (
              <div className="flex items-center space-x-2">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button variant="default" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-4">
            {/* <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem]" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Toggle theme</span>
            </Button> */}

            {user ? (
              <div className="flex flex-col space-y-2">
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={async () => {
                    await handleSignOut();
                    setIsOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button
                  variant="default"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
