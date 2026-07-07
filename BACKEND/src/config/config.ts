export const cookieOptions = {
  httpOnly: true,
  secure: true,           // Render uses HTTPS, so this should be true
  sameSite: "none" as const,       // ✅ must be "None" for cross-origin cookies
  maxAge: 5 * 60 * 1000,  // ✅ 5 minutes
};
