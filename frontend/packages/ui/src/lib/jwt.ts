// lib/jwt.ts
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key';

export function generateToken(email: string, name: string) {
	const token = jwt.sign({ email, name, src: "email" }, SECRET_KEY, { expiresIn: '3d', algorithm: "HS256" });
  	return token;
}

export function verifyToken(token: string) {
	try {
		return jwt.verify(token, SECRET_KEY);
	} catch (err) {
		return null;
	}
}