export default () => ({
  "strapi-v5-http-only-auth": {
    enabled: true,
    config: {
      cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: "lax",
        domain: process.env.CLIENT_DOMAIN,
        path: "/",
      },
    },
  },
});
