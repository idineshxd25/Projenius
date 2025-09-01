"use client"

import { Button } from '@/components/ui/button'
import { GradientBackground } from '@/components/gradient-bg'
import { ArrowRight, Lightbulb, Target, Rocket } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      <GradientBackground />
      
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
              Turn Your Idea Into a Structured Project
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transform your brilliant ideas into comprehensive project plans with AI-powered guidance and adaptive questioning.
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Link href="/auth">
              <Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                Start Your Idea
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid md:grid-cols-3 gap-8 mt-20"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Lightbulb className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold">Smart Questions</h3>
              <p className="text-muted-foreground">
                Answer adaptive questions that help us understand your vision and requirements.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold">AI-Powered Plans</h3>
              <p className="text-muted-foreground">
                Generate comprehensive project plans with features, tech stack, and roadmaps.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center">
                <Rocket className="h-8 w-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold">Ready to Build</h3>
              <p className="text-muted-foreground">
                Export your plans and start building with confidence and clear direction.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}