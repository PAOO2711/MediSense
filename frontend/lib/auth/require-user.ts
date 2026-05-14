import { createClient } from '@/lib/supabase/server';

export type AppRole = 'admin' | 'user';

export class UnauthorizedError extends Error {
  constructor() {
    super('UNAUTHORIZED');
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super('FORBIDDEN');
  }
}

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new UnauthorizedError();
  }

  return user;
}

export async function getUserRole(userId: string): Promise<AppRole | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('roles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new ForbiddenError();
  }

  if (data?.role === 'admin' || data?.role === 'user') {
    return data.role;
  }

  return null;
}

export async function requireRole() {
  const user = await requireUser();
  const role = await getUserRole(user.id);

  if (!role) {
    throw new ForbiddenError();
  }

  return { user, role };
}

export async function requireAdmin() {
  const { user, role } = await requireRole();

  if (role !== 'admin') {
    throw new ForbiddenError();
  }

  return user;
}

export async function requireDoctor() {
  const { user, role } = await requireRole();

  if (role !== 'user') {
    throw new ForbiddenError();
  }

  return user;
}
