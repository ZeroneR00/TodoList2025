import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET /api/tasks/[id] - Получить задачу по ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: {
        id: parseInt(params.id),
      },
      include: {
        list: true,
      },
    });
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

// PATCH /api/tasks/[id] - Обновить задачу
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { text, completed, listId } = await request.json();
    const updateData: any = {};

    if (text !== undefined) updateData.text = text;
    if (completed !== undefined) updateData.completed = completed;
    if (listId !== undefined) updateData.listId = parseInt(listId);

    const updatedTask = await prisma.task.update({
      where: {
        id: parseInt(params.id),
      },
      data: updateData,
      include: {
        list: true,
      },
    });
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] - Удалить задачу
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.task.delete({
      where: {
        id: parseInt(params.id),
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
} 