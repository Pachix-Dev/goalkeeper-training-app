import { query } from '../connection';
import crypto from 'crypto';

export type TokenType = 'email_verification' | 'password_reset';

interface VerificationToken {
  id: number;
  user_id: number;
  token: string;
  type: TokenType;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
}

export class VerificationTokenModel {
  // Crear token
  static async create(userId: number, type: TokenType, expiresInHours = 1): Promise<string> {
    // Primero limpiar tokens expirados
    await this.cleanExpiredTokens();

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const sql = `
      INSERT INTO verification_tokens (user_id, token, type, expires_at)
      VALUES (?, ?, ?, ?)
    `;

    await query(sql, [userId, token, type, expiresAt]);
    return token;
  }

  // Verificar y usar token
  static async verifyAndUse(token: string, type: TokenType): Promise<number | null> {
    const sql = `
      SELECT * FROM verification_tokens 
      WHERE token = ? AND type = ? AND used_at IS NULL AND expires_at > NOW()
    `;

    const results: VerificationToken[] = await query(sql, [token, type]);

    if (results.length === 0) {
      return null;
    }

    const verificationToken = results[0];

    // Marcar como usado
    const updateSql = `UPDATE verification_tokens SET used_at = NOW() WHERE id = ?`;
    await query(updateSql, [verificationToken.id]);

    return verificationToken.user_id;
  }

  // Verificar sin marcar como usado
  static async verify(token: string, type: TokenType): Promise<number | null> {
    const sql = `
      SELECT user_id FROM verification_tokens 
      WHERE token = ? AND type = ? AND used_at IS NULL AND expires_at > NOW()
    `;

    const results: { user_id: number }[] = await query(sql, [token, type]);
    return results.length > 0 ? results[0].user_id : null;
  }

  // Invalidar todos los tokens de un usuario
  static async invalidateUserTokens(userId: number, type?: TokenType): Promise<void> {
    let sql = 'UPDATE verification_tokens SET used_at = NOW() WHERE user_id = ?';
    const params: (number | string)[] = [userId];

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    await query(sql, params);
  }

  // Limpiar tokens expirados
  static async cleanExpiredTokens(): Promise<void> {
    const sql = 'DELETE FROM verification_tokens WHERE expires_at < NOW()';
    await query(sql, []);
  }
}
