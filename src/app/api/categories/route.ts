import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Op } from 'sequelize';
import { Category, CategoryType } from '../../../database/models';
import { getAuthenticatedUser } from '../../../lib/auth';
import { ensureDatabaseReady } from '../../../lib/db';

const categorySchema = z.object({
  name: z.string().min(2, 'El nombre de la categoría es obligatorio'),
  type: z.nativeEnum(CategoryType),
  icon: z.string().default('tag'),
  color: z.string().default('#10B981'),
});

export async function GET() {
  try {
    await ensureDatabaseReady();
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const categories = await Category.findAll({
      where: {
        [Op.or]: [
          { isSystemDefault: true, userId: null },
          { userId: user.id },
        ],
      },
      order: [
        ['type', 'ASC'],
        ['name', 'ASC'],
      ],
    });

    return NextResponse.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    console.error('Error en GET /api/categories:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener las categorías.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await ensureDatabaseReady();
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autenticado.' }, { status: 401 });
    }

    const body = await req.json();
    const validation = categorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;
    const category = await Category.create({
      userId: user.id,
      name: data.name,
      type: data.type,
      icon: data.icon,
      color: data.color,
      isSystemDefault: false,
    });

    return NextResponse.json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: { category },
    }, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/categories:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear la categoría.' },
      { status: 500 }
    );
  }
}
