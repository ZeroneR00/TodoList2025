import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// GET /api/lists - Получить все списки с задачами
export async function GET() {
  try {
    const lists = await prisma.list.findMany({
      include: {
        tasks: true,
      },
    });
    return NextResponse.json(lists);
  } catch (error) {
    console.error('Error fetching lists:', error);
    return NextResponse.json({ error: 'Failed to fetch lists' }, { status: 500 });
  }
}

// POST /api/lists - Создать новый список
export async function POST(request: Request) {
  try {
    const { title, theme } = await request.json();
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    const newList = await prisma.list.create({
      data: {
        title,
        theme: theme || 'blue',
      },
      include: {
        tasks: true,
      },
    });
    
    return NextResponse.json(newList, { status: 201 });
  } catch (error) {
    console.error('Error creating list:', error);
    return NextResponse.json({ error: 'Failed to create list' }, { status: 500 });
  }
} 