export function getBearerTokenFromHeaders(headers: Headers) {
  const authorization = headers.get("authorization") ?? headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

export function requireBearerToken(headers: Headers) {
  const token = getBearerTokenFromHeaders(headers);

  if (!token) {
    throw new Error("Unauthorized");
  }

  return token;
}
