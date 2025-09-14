const config = {
    PORT: process.env.PORT as string,
    DATABASE_URL: process.env.DATABASE_URL as string,

    DATABASE_NAME: process.env.DATABASE_NAME as string,
    USER_NAME: process.env.USER_NAME as string,
    PASSWORD: process.env.PASSWORD as string,
    HOST: process.env.HOST as string,
    DB_PORT: process.env.DB_PORT as string,

    SESSION_SECRET: process.env.SESSION_SECRET as string,

    // CORS origins
    CORS_ORIGIN: process.env.CORS_ORIGIN as string,

    // API Hosts
    API_HOST: process.env.API_HOST as string, 
    ADMIN_HOST: process.env.ADMIN_HOST as string,

    // MAIL INFO
    SMTP_MAIL: process.env.MAIL as string,
    SMTP_HOST: process.env.MAIL_HOST as string,
    SMTP_PORT: process.env.MAILPORT as string,
    SMTP_SECURE: process.env.SECURE as string,
    SMTP_USER: process.env.MAIL_USER_NAME as string,
    SMTP_PASS: process.env.MAIL_PASSWORD as string,

    // Frontend post
    FRONTEND_USER: process.env.FRONTEND_USER as string,

    // JWT secret
    JWT_SECRET: process.env.JWT_SECRET as string,

    // CRYPTO ENCRYPTION KEY
    CRYPTO_SECRET: process.env.CRYPTO_SECRET as string,

    // EXPIRATIONS
    ACCESS_TOKEN_EXPIRATION: '1d',
    REFRESH_TOKEN_EXPIRATION: '30d',
    OTP_EXPIRATION: '3m',

    REDIS_HOST: process.env.REDIS_HOST as string,
    REDIS_PORT: process.env.REDIS_PORT as string,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,
}

export default config
