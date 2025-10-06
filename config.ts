declare const process: {
  env: { [key: string]: string | undefined };
};

export const {
  PORT = 3000,
  SALT_ROUNDS = 10,
  SECRET_JWT_KEY = "secreto-jwt-key",
} = process.env
