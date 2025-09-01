import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/db'
import { refineProjectPlan } from '@/lib/groq'

export async function POST(request: NextRequest) {
  try {
    const { projectId, feedback } = await request.json()

    // Get current result
    const currentResult = await Database.getProjectResult(projectId)
    if (!currentResult) {
      return NextResponse.json({ error: 'No existing plan found' }, { status: 404 })
    }

    // Generate refined plan
    const refinedResult = await refineProjectPlan(currentResult, feedback)

    // Save updated result to database
    const result = await Database.saveResult(projectId, refinedResult)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error refining plan:', error)
    return NextResponse.json({ error: 'Failed to refine project plan' }, { status: 500 })
  }
}