import NextAuth from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';
import connectToDatabase from '../../../utils/db';
import UserModel from '../../../models/User';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        userName: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Connect to the database
          await connectToDatabase();
          console.log("Received credentials:", credentials);
          const user = await UserModel.findOne({ userName: credentials.userName }).exec();
          console.log("Fetched user:", user);
          if (!user) {
            throw new Error('Identifiants incorrects');
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          console.log("Password validation successful");

          if (!isPasswordValid) {
            throw new Error('Identifiants incorrects');
          }

          return { id: user._id.toString(), name: user.userName, email: user.email, role: user.role };

        } catch (error) {
          console.error("Error in authorize:", error.message);
          throw new Error(error.message);
        }
      }
    })
  ],
  session: {
    jwt: true,
    maxAge: 1 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_JWT_SECRET,
  callbacks: {
    async jwt(token, user) {
      if (user && user.id && user.name && user.email && user.role) {
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        };
      }
      return token;
    },
    async session(session, token) {
      if (token && token.id && token.name && token.email && token.role) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id,
            name: token.name,
            email: token.email,
            role: token.role
          }
        };
      }
      return session;
    }
  },
  events: {
    async error(message) {
      console.error("NextAuth Error:", message);
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: null
  },
  debug: false,  // Set to false in production
});
