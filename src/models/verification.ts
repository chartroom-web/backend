import crypto from 'crypto';
import { query } from './db';

export async function create_verified_token(user_id : number) : Promise<string> {
  const verifiedToken = crypto.randomBytes(64).toString('hex');
  await query('insert into VerificationTokens (token, user_id) values (?, ?)', [verifiedToken, user_id]);
  return verifiedToken;
}