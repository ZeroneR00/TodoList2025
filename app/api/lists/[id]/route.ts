import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET /api/lists/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const list = await prisma.list.findUnique({
      where: {
        id: parseInt(params.id),
      },
      include: {
        tasks: true,
      },
    });

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error('Error fetching list:', error);
    return NextResponse.json({ error: 'Failed to fetch list' }, { status: 500 });
  }
}

// PATCH /api/lists/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { title, theme } = await request.json();
    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (theme !== undefined) updateData.theme = theme;

    const updatedList = await prisma.list.update({
      where: {
        id: parseInt(params.id),
      },
      data: updateData,
      include: {
        tasks: true,
      },
    });

    return NextResponse.json(updatedList);
  } catch (error) {
    console.error('Error updating list:', error);
    return NextResponse.json({ error: 'Failed to update list' }, { status: 500 });
  }
}

// DELETE /api/lists/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.list.delete({
      where: {
        id: parseInt(params.id),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting list:', error);
    return NextResponse.json({ error: 'Failed to delete list' }, { status: 500 });
  }
} 