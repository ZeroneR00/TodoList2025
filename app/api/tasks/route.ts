import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET /api/tasks - Получить все задачи
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        list: true,
      },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST /api/tasks - Создать новую задачу
export async function POST(request: Request) {
  try {
    const { text, listId } = await request.json();
    
    if (!text || !listId) {
      return NextResponse.json({ error: 'Text and listId are required' }, { status: 400 });
    }
    
    const newTask = await prisma.task.create({
      data: {
        text,
        listId: parseInt(listId),
        completed: false,
      },
      include: {
        list: true,
      },
    });
    
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
} 