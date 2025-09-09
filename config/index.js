const config = {
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,

    DATABASE_NAME: process.env.DATABASE_NAME,
    USER_NAME: process.env.USER_NAME,
    PASSWORD: process.env.PASSWORD,
    HOST: process.env.HOST,
    DB_PORT: process.env.DB_PORT,

    SESSION_SECRET: process.env.SESSION_SECRET,

    // CORS origins
    CORS_ORIGIN: process.env.CORS_ORIGIN,

    // API Hosts
    API_HOST: process.env.API_HOST,
    ADMIN_HOST: process.env.ADMIN_HOST,

    // MAIL INFO
    SMTP_MAIL: process.env.MAIL,
    SMTP_HOST: process.env.MAIL_HOST,
    SMTP_PORT: process.env.MAILPORT,
    SMTP_SECURE: process.env.SECURE,
    SMTP_USER: process.env.MAIL_USER_NAME,
    SMTP_PASS: process.env.MAIL_PASSWORD,

    // Frontend post
    FRONTEND_USER: process.env.FRONTEND_USER,

    // JWT secret
    JWT_SECRET: process.env.JWT_SECRET,

    // CRYPTO ENCRYPTION KEY
    CRYPTO_SECRET: process.env.CRYPTO_SECRET,

    // EXPIRATIONS
    ACCESS_TOKEN_EXPIRATION: '1d',
    REFRESH_TOKEN_EXPIRATION: '30d',
    OTP_EXPIRATION: '3m',

    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
}

export default config
