import { getSupabaseServerClient } from '@/utils/supabase/server';
import { auth } from '@/lib/auth';

/**
 * Get Supabase client for server-side operations
 * Uses singleton pattern to prevent multiple instances
 * All database queries use Supabase client with service role key (bypasses RLS)
 */
export function getSupabase() {
  return getSupabaseServerClient();
}

/**
 * Helper to get authenticated user ID from NextAuth session
 * Note: Using NextAuth for authentication, Supabase for database queries
 */
export async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id || null;
}

/**
 * Database query helpers for Supabase
 */
export const db = {
  // User queries
  async getUser(userId: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async getUserByEmail(email: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  },

  async getUserByGoogleId(googleId: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('googleId', googleId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createUser(userData: any) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateUser(userId: string, updateData: any) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Category queries
  async getCategories(userId: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('userId', userId)
      .order('order', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getCategory(categoryId: string, userId: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .eq('userId', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createCategory(categoryData: any) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createCategories(categoriesData: any[]) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('categories')
      .insert(categoriesData)
      .select();
    if (error) throw error;
    return data || [];
  },

  async updateCategory(categoryId: string, updateData: any) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', categoryId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteCategory(categoryId: string) {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);
    if (error) throw error;
  },

  async countCategoryTransactions(categoryId: string) {
    const supabase = getSupabase();
    const { count, error } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('categoryId', categoryId);
    if (error) throw error;
    return count || 0;
  },

  async getMaxCategoryOrder(userId: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('categories')
      .select('order')
      .eq('userId', userId)
      .order('order', { ascending: false })
      .limit(1)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data?.order || 0;
  },

  // Transaction queries
  async getTransactions(userId: string, options: {
    limit?: number;
    offset?: number;
    type?: 'INCOME' | 'EXPENSE';
    categoryId?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}) {
    const supabase = getSupabase();
    let query = supabase
      .from('transactions')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('userId', userId)
      .order('date', { ascending: false });

    if (options.type) {
      query = query.eq('type', options.type);
    }
    if (options.categoryId) {
      query = query.eq('categoryId', options.categoryId);
    }
    if (options.startDate) {
      query = query.gte('date', options.startDate.toISOString());
    }
    if (options.endDate) {
      query = query.lte('date', options.endDate.toISOString());
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getTransaction(transactionId: string, userId: string) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('id', transactionId)
      .eq('userId', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createTransaction(transactionData: any) {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transactionData,
        amount: transactionData.amount.toString(), // Convert to string for Decimal type
      })
      .select(`
        *,
        category:categories(*)
      `)
      .single();
    if (error) throw error;
    return data;
  },

  async updateTransaction(transactionId: string, updateData: any) {
    const supabase = getSupabase();
    const updatePayload: any = { ...updateData };
    if (updateData.amount !== undefined) {
      updatePayload.amount = updateData.amount.toString();
    }
    if (updateData.date) {
      updatePayload.date = updateData.date.toISOString();
    }
    const { data, error } = await supabase
      .from('transactions')
      .update(updatePayload)
      .eq('id', transactionId)
      .select(`
        *,
        category:categories(*)
      `)
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTransaction(transactionId: string) {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);
    if (error) throw error;
  },

  async countTransactions(userId: string, filters: {
    type?: 'INCOME' | 'EXPENSE';
    categoryId?: string;
  } = {}) {
    const supabase = getSupabase();
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('userId', userId);

    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.categoryId) {
      query = query.eq('categoryId', filters.categoryId);
    }

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  },
};

