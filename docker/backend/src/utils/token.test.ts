import { describe, it, expect } from 'vitest';
import { generateRefreshToken, getRefreshToken, hashToken } from './token';
import type { FastifyRequest } from 'fastify';

const buildRequest = (data: Partial<FastifyRequest>): FastifyRequest => data as FastifyRequest;

describe('token utilities', () => {
  it('generates a random refresh token with hex output', () => {
    const token = generateRefreshToken();
    expect(token).toMatch(/^[a-f0-9]+$/);
    expect(token.length).toBe(128);
  });

  it('hashes tokens with sha256', () => {
    const token = 'sample-token';
    const hashed = hashToken(token);

    expect(hashed).toMatch(/^[a-f0-9]{64}$/);
    expect(hashToken(token)).toBe(hashed);
  });

  it('reads refresh token from cookies when present', () => {
    const request = buildRequest({ cookies: { refreshToken: 'cookie-token' } });
    expect(getRefreshToken(request)).toBe('cookie-token');
  });

  it('reads refresh token from bearer header as fallback', () => {
    const request = buildRequest({ headers: { authorization: 'Bearer header-token' } } as any);
    expect(getRefreshToken(request)).toBe('header-token');
  });

  it('returns null when no token is found', () => {
    const request = buildRequest({ headers: {} } as any);
    expect(getRefreshToken(request)).toBeNull();
  });
});
