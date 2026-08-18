import { Category, CategoryType } from '../models';

export const defaultCategories = [
  // INGRESOS
  { name: 'Salario / Sueldo', type: CategoryType.INCOME, icon: 'briefcase', color: '#10B981', isSystemDefault: true },
  { name: 'Freelance / Honorarios', type: CategoryType.INCOME, icon: 'laptop', color: '#06B6D4', isSystemDefault: true },
  { name: 'Inversiones y Dividendos', type: CategoryType.INCOME, icon: 'trending-up', color: '#8B5CF6', isSystemDefault: true },
  { name: 'Ventas y Negocios', type: CategoryType.INCOME, icon: 'shopping-bag', color: '#3B82F6', isSystemDefault: true },
  { name: 'Otros Ingresos', type: CategoryType.INCOME, icon: 'plus-circle', color: '#6B7280', isSystemDefault: true },

  // GASTOS
  { name: 'Vivienda y Renta', type: CategoryType.EXPENSE, icon: 'home', color: '#EF4444', isSystemDefault: true },
  { name: 'Supermercado y Despensa', type: CategoryType.EXPENSE, icon: 'shopping-cart', color: '#F59E0B', isSystemDefault: true },
  { name: 'Servicios (Luz, Agua, Internet)', type: CategoryType.EXPENSE, icon: 'zap', color: '#6366F1', isSystemDefault: true },
  { name: 'Transporte y Combustible', type: CategoryType.EXPENSE, icon: 'car', color: '#EC4899', isSystemDefault: true },
  { name: 'Restaurantes y Delivery', type: CategoryType.EXPENSE, icon: 'utensils', color: '#F97316', isSystemDefault: true },
  { name: 'Salud y Farmacia', type: CategoryType.EXPENSE, icon: 'activity', color: '#14B8A6', isSystemDefault: true },
  { name: 'Educación y Cursos', type: CategoryType.EXPENSE, icon: 'book-open', color: '#3B82F6', isSystemDefault: true },
  { name: 'Suscripciones y Streaming', type: CategoryType.EXPENSE, icon: 'tv', color: '#8B5CF6', isSystemDefault: true },
  { name: 'Entretenimiento y Ocio', type: CategoryType.EXPENSE, icon: 'film', color: '#A855F7', isSystemDefault: true },
  { name: 'Ropa y Calzado', type: CategoryType.EXPENSE, icon: 'shirt', color: '#D946EF', isSystemDefault: true },
  { name: 'Ahorro e Inversión', type: CategoryType.EXPENSE, icon: 'piggy-bank', color: '#10B981', isSystemDefault: true },
  { name: 'Otros Gastos', type: CategoryType.EXPENSE, icon: 'alert-circle', color: '#9CA3AF', isSystemDefault: true },
];

export async function seedDefaultCategories(): Promise<void> {
  console.log('🌱 [Seeder]: Sembrando categorías base del sistema...');
  for (const cat of defaultCategories) {
    const [existing] = await Category.findOrCreate({
      where: {
        name: cat.name,
        type: cat.type,
        isSystemDefault: true,
        userId: null,
      },
      defaults: {
        ...cat,
        userId: null,
      },
    });
    if (existing) {
      await existing.update(cat);
    }
  }
  console.log('✅ [Seeder]: Categorías base sembradas correctamente.');
}
