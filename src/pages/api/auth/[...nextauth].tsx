import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { fetchExternalJsonDirect } from "@/lib/api/external";
import {
  createAuthSessionKey,
  deleteAuthSessionTokens,
  saveAuthSessionTokens,
} from "@/lib/auth/tokenStore";

type AuthTokenResponse = {
  access_token?: string;
  refresh_token?: string;
};

type UserResponse = {
  data?: {
    id_users?: string | number;
    name?: string;
    username?: string;
    instansi_id?: string | number;
    instansi_name?: string;
    cabang_id?: string | number | null;
    cabang_name?: string | null;
    divisi_id?: string | number | null;
    divisi_name?: string | null;
    email?: string;
    gender?: string | number;
    address?: string;
    phone?: string;
    is_active?: boolean;
    photo?: string;
    photo_thumb?: string;
    birthplace?: string;
    birthdate?: string;
    created_by?: string;
    usertype_id?: string | number;
    usertype_name?: string;
    [key: string]: unknown;
  };
};

const parseUsertypeId = (value: unknown): number => {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsedValue = Number(value);
    if (!Number.isNaN(parsedValue)) {
      return parsedValue;
    }
  }

  return 3;
};

const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      type: "credentials",
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!process.env.API_URL || !credentials) {
          return null;
        }

        const { username, password } = credentials as {
          username?: string;
          password?: string;
        };

        if (!username || !password) {
          return null;
        }

        try {
          const { data: authToken } =
            await fetchExternalJsonDirect<AuthTokenResponse>("/v1/login", {
              method: "POST",
              body: { username, password },
            });

          const apiToken = authToken?.access_token;
          if (!apiToken) {
            return null;
          }

          const { data: user } = await fetchExternalJsonDirect<UserResponse>(
            "/v1/auth/user/profile",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${apiToken}`,
              },
            },
          );

          if (!user?.data?.id_users) {
            return null;
          }

          const resolvedUsertypeId = parseUsertypeId(user.data.usertype_id);
          const resolvedUsertypeName =
            typeof user.data.usertype_name === "string" &&
            user.data.usertype_name.trim() !== ""
              ? user.data.usertype_name
              : "Administrator";

          return {
            ...user.data,
            usertype_id: resolvedUsertypeId,
            usertype_name: resolvedUsertypeName,
            auth_tokens: {
              accessToken: apiToken,
              refreshToken: authToken?.refresh_token ?? null,
            },
            name: user.data.name ?? user.data.username ?? username,
            username: user.data.username ?? username,
          } as any;
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile, user }: any) {
      if (account?.provider === "credentials") {
        const authSessionKey = createAuthSessionKey();
        await saveAuthSessionTokens(authSessionKey, {
          accessToken: user.auth_tokens.accessToken,
          refreshToken: user.auth_tokens.refreshToken,
          storedAt: Date.now(),
        });

        token.authSessionKey = authSessionKey;
        token.id = user.id_users;
        token.name = user.name;
        token.instansiId = user.instansi_id;
        token.instansiName = user.instansi_name;
        // token.cabangId = user.cabang_id ?? null;
        // token.cabangName = user.cabang_name ?? null;
        // token.divisiId = user.divisi_id ?? null;
        // token.divisiName = user.divisi_name ?? null;
        token.birthDate = user.birthdate;
        token.birthPlace = user.birthplace;
        token.gender = user.gender;
        token.address = user.address;
        token.phone = user.phone;
        token.email = user.email;
        token.username = user.username;
        token.usertypeId = user.usertype_id;
        token.isActive = user.is_active;
        token.image = user.photo;
        token.photoProfileUrl = user.photo_thumb;
        token.usertypeName = user.usertype_name ?? "Administrator";
      }

      return token;
    },
    async session({ session, token }: any) {
      if ("id" in token) {
        session.user.id = token.id;
      }
      if ("name" in token) {
        session.user.name = token.name;
      }
      if ("instansiId" in token) {
        session.user.instansiId = token.instansiId;
      }
      if ("instansiName" in token) {
        session.user.instansiName = token.instansiName;
      }
      if ("cabangId" in token) {
        session.user.cabangId = token.cabangId;
      }
      if ("cabangName" in token) {
        session.user.cabangName = token.cabangName;
      }
      if ("divisiId" in token) {
        session.user.divisiId = token.divisiId;
      }
      if ("divisiName" in token) {
        session.user.divisiName = token.divisiName;
      }
      if ("birthDate" in token) {
        session.user.birthDate = token.birthDate;
      }
      if ("birthPlace" in token) {
        session.user.birthPlace = token.birthPlace;
      }
      if ("gender" in token) {
        session.user.gender = token.gender;
      }
      if ("address" in token) {
        session.user.address = token.address;
      }
      if ("phone" in token) {
        session.user.phone = token.phone;
      }
      if ("email" in token) {
        session.user.email = token.email;
      }
      if ("username" in token) {
        session.user.username = token.username;
      }
      if ("usertypeId" in token) {
        session.user.usertypeId = token.usertypeId;
      }
      if ("isActive" in token) {
        session.user.isActive = token.isActive;
      }
      if ("image" in token) {
        session.user.image = token.image;
      }
      if ("photoProfileUrl" in token) {
        session.user.photoProfileUrl = token.photoProfileUrl;
      }
      if ("usertypeName" in token) {
        session.user.usertypeName = token.usertypeName;
      }

      return session;
    },
  },
  events: {
    async signOut({ token }: any) {
      if (typeof token?.authSessionKey === "string") {
        await deleteAuthSessionTokens(token.authSessionKey);
      }
    },
  },
  pages: {
    signIn: "/",
  },
};

export default NextAuth(authOptions);
