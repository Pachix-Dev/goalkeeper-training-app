import { query } from '../connection';
import { User, CreateUserDTO, UpdateUserDTO } from '@/lib/types/database';
import bcrypt from 'bcryptjs';

export class UserModel {
  // Crear usuario
  static async create(data: CreateUserDTO): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const sql = `
      INSERT INTO users (email, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `;
    
    const result = await query<{ insertId: number }>(sql, [
      data.email,
      hashedPassword,
      data.name,
      data.role || 'coach'
    ]);
    
    const user = await this.findById(result.insertId);
    if (!user) throw new Error('User creation failed');
    return user;
  }

  // Buscar por ID
  static async findById(id: number): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const results: User[] = await query(sql, [id]);
    return results[0] || null;
  }

  // Buscar por email
  static async findByEmail(email: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const results: User[] = await query(sql, [email]);
    return results[0] || null;
  }

  // Verificar contraseña
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Actualizar usuario
  static async update(id: number, data: UpdateUserDTO): Promise<User> {
    const fields: string[] = [];
    const values: (string | number | undefined)[] = [];

    if (data.email) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.name) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.role) {
      fields.push('role = ?');
      values.push(data.role);
    }
    if (data.avatar !== undefined) {
      fields.push('avatar = ?');
      values.push(data.avatar);
    }

    values.push(id);

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, values);

    const user = await this.findById(id);
    if (!user) throw new Error('User not found after update');
    return user;
  }

  // Actualizar último login
  static async updateLastLogin(id: number): Promise<void> {
    const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
    await query(sql, [id]);
  }

  // Listar todos los usuarios
  static async findAll(): Promise<User[]> {
    const sql = 'SELECT * FROM users WHERE is_active = TRUE ORDER BY created_at DESC';
    return query<User[]>(sql);
  }

  // Eliminar usuario (soft delete)
  static async delete(id: number): Promise<void> {
    const sql = 'UPDATE users SET is_active = FALSE WHERE id = ?';
    await query(sql, [id]);
  }
}
